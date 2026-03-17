"""
Workload Generator Service
==========================
Generates synthetic datasets based on user-defined workload parameters.
Outputs a binary file and metadata for the C++ engine.
"""
import struct
import random
import tempfile
import os
from typing import Tuple


def generate_workload(
    dataset_size: int = 10000,
    read_ratio: float = 0.5,
    write_ratio: float = 0.4,
    delete_ratio: float = 0.1,
    sortedness: float = 0.0,
    key_range_min: int = 1,
    key_range_max: int = 100000,
    temporal_locality: float = 0.0,
) -> Tuple[str, list]:
    """
    Generate a synthetic workload and write it to a temporary binary file.

    Returns:
        Tuple of (filepath, operations_list) where operations_list contains
        dicts with 'type' (0=INSERT,1=SEARCH,2=DELETE) and 'key'.
    """
    # Normalize ratios
    total = read_ratio + write_ratio + delete_ratio
    if total == 0:
        total = 1.0
    read_ratio /= total
    write_ratio /= total
    delete_ratio /= total

    # Generate the key pool
    keys = list(range(key_range_min, min(key_range_min + dataset_size * 2, key_range_max)))

    # Apply sortedness: partially sort the keys
    if sortedness > 0:
        # Sort a fraction of the keys
        sorted_count = int(len(keys) * sortedness)
        sorted_part = sorted(keys[:sorted_count])
        keys = sorted_part + keys[sorted_count:]

    random.shuffle(keys)

    operations = []
    inserted_keys = set()
    recent_keys = []  # For temporal locality simulation

    for i in range(dataset_size):
        # Choose operation type based on ratios
        roll = random.random()

        if roll < write_ratio:
            op_type = 0  # INSERT
            key = keys[i % len(keys)]
            inserted_keys.add(key)
            recent_keys.append(key)
            if len(recent_keys) > 100:
                recent_keys.pop(0)
        elif roll < write_ratio + read_ratio:
            op_type = 1  # SEARCH
            # Temporal locality: prefer recently inserted keys
            if recent_keys and random.random() < temporal_locality:
                key = random.choice(recent_keys)
            elif inserted_keys:
                key = random.choice(list(inserted_keys))
            else:
                key = keys[i % len(keys)]
        else:
            op_type = 2  # DELETE
            if inserted_keys:
                key = random.choice(list(inserted_keys))
            else:
                key = keys[i % len(keys)]

        operations.append({"type": op_type, "key": key})

    # Write binary file
    tmp_dir = tempfile.mkdtemp(prefix="neurods_")
    filepath = os.path.join(tmp_dir, "workload.bin")

    with open(filepath, "wb") as f:
        # Header: number of operations (uint32)
        f.write(struct.pack("<I", len(operations)))
        # Each operation: 1 byte type + 4 bytes key
        for op in operations:
            f.write(struct.pack("<b", op["type"]))
            f.write(struct.pack("<i", op["key"]))

    return filepath, operations
