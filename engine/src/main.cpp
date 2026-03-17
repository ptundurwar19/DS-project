/**
 * Neuro-DS C++ Benchmark Engine
 * =============================
 * Entry point: reads a binary workload file, runs it against all 4 data structures,
 * and outputs JSON benchmark results to stdout.
 *
 * Binary format:
 *   [4 bytes: uint32_t num_operations]
 *   [For each operation: 1 byte op_type (0=INSERT,1=SEARCH,2=DELETE) + 4 bytes int32_t key]
 *
 * Usage: ./engine <workload.bin>
 */

#include <iostream>
#include <fstream>
#include <vector>
#include <cstdint>
#include <cstdlib>
#include <ctime>

#include "json.hpp"
#include "benchmarker.hpp"
#include "avl_tree.hpp"
#include "redblack_tree.hpp"
#include "splay_tree.hpp"
#include "skip_list.hpp"

using json = nlohmann::json;

// Operation types
enum OpType : uint8_t {
    OP_INSERT = 0,
    OP_SEARCH = 1,
    OP_DELETE = 2
};

struct Operation {
    OpType type;
    int32_t key;
};

/**
 * Load workload from binary file.
 */
std::vector<Operation> loadWorkload(const std::string& filepath) {
    std::ifstream file(filepath, std::ios::binary);
    if (!file.is_open()) {
        std::cerr << "Error: Cannot open file " << filepath << std::endl;
        std::exit(1);
    }

    uint32_t numOps;
    file.read(reinterpret_cast<char*>(&numOps), sizeof(numOps));

    std::vector<Operation> ops;
    ops.reserve(numOps);

    for (uint32_t i = 0; i < numOps; i++) {
        uint8_t opType;
        int32_t key;
        file.read(reinterpret_cast<char*>(&opType), sizeof(opType));
        file.read(reinterpret_cast<char*>(&key), sizeof(key));
        ops.push_back({static_cast<OpType>(opType), key});
    }

    file.close();
    return ops;
}

/**
 * Run a workload against a specific data structure.
 * Template DS must support insert(key), search(key), remove(key), memoryBytes(), size().
 */
template <typename DS>
BenchmarkResult benchmarkDS(const std::string& name, const std::vector<Operation>& ops) {
    return Benchmarker::run(name, [&]() -> std::pair<size_t, size_t> {
        DS ds;
        size_t opsCompleted = 0;

        for (const auto& op : ops) {
            switch (op.type) {
                case OP_INSERT:
                    ds.insert(op.key);
                    break;
                case OP_SEARCH:
                    ds.search(op.key);
                    break;
                case OP_DELETE:
                    ds.remove(op.key);
                    break;
            }
            opsCompleted++;
        }

        return {ds.memoryBytes(), opsCompleted};
    });
}

int main(int argc, char* argv[]) {
    if (argc < 2) {
        std::cerr << "Usage: " << argv[0] << " <workload.bin>" << std::endl;
        return 1;
    }

    // Seed random for Skip List
    std::srand(static_cast<unsigned>(std::time(nullptr)));

    std::string filepath = argv[1];
    auto ops = loadWorkload(filepath);

    // Run benchmarks on all 4 data structures
    auto avlResult = benchmarkDS<AVLTree<int32_t>>("avl", ops);
    auto rbResult  = benchmarkDS<RedBlackTree<int32_t>>("redblack", ops);
    auto splayResult = benchmarkDS<SplayTree<int32_t>>("splay", ops);
    auto skipResult  = benchmarkDS<SkipList<int32_t>>("skiplist", ops);

    // Build JSON output
    json output;

    output["results"]["avl"] = {
        {"time_us", avlResult.time_us},
        {"memory_bytes", avlResult.memory_bytes},
        {"ops_completed", avlResult.ops_completed}
    };
    output["results"]["redblack"] = {
        {"time_us", rbResult.time_us},
        {"memory_bytes", rbResult.memory_bytes},
        {"ops_completed", rbResult.ops_completed}
    };
    output["results"]["splay"] = {
        {"time_us", splayResult.time_us},
        {"memory_bytes", splayResult.memory_bytes},
        {"ops_completed", splayResult.ops_completed}
    };
    output["results"]["skiplist"] = {
        {"time_us", skipResult.time_us},
        {"memory_bytes", skipResult.memory_bytes},
        {"ops_completed", skipResult.ops_completed}
    };

    output["metadata"] = {
        {"dataset_size", ops.size()},
#if defined(__GNUC__)
        {"compiler", "g++"},
#elif defined(_MSC_VER)
        {"compiler", "MSVC"},
#else
        {"compiler", "unknown"},
#endif
    };

    // Output JSON to stdout (FastAPI captures this)
    std::cout << output.dump(2) << std::endl;

    return 0;
}
