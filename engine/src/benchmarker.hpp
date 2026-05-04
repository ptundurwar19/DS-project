#pragma once
#include <chrono>
#include <functional>
#include <string>

/**
 * Benchmarker — Measures execution time with microsecond precision.
 * Uses std::chrono::high_resolution_clock for accurate timing.
 */
struct BenchmarkResult {
    std::string name;
    long long time_us;       // Execution time in microseconds
    size_t memory_bytes;     // Approximate memory usage
    size_t ops_completed;    // Number of operations executed
};

class Benchmarker {
public:
    /**
     * Runs a benchmark function and returns the timing result.
     * @param name       Name of the data structure being benchmarked
     * @param operation  Lambda that performs the workload and returns {memory_bytes, ops_completed}
     * @return           BenchmarkResult with timing and stats
     */
    static BenchmarkResult run(
        const std::string& name,
        std::function<std::pair<size_t, size_t>()> operation
    ) {
        auto start = std::chrono::high_resolution_clock::now();
        std::pair<size_t, size_t> result = operation();
        auto end = std::chrono::high_resolution_clock::now();

        long long duration = std::chrono::duration_cast<std::chrono::microseconds>(end - start).count();

        return BenchmarkResult{name, duration, result.first, result.second};
    }
};
