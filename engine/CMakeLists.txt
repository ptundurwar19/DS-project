cmake_minimum_required(VERSION 3.16)
project(neuro_ds_engine LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

# Optimization for benchmarks
if(NOT CMAKE_BUILD_TYPE)
    set(CMAKE_BUILD_TYPE Release)
endif()

set(CMAKE_CXX_FLAGS_RELEASE "-O2")

add_executable(engine
    src/main.cpp
)

# Header-only includes (json.hpp, all DS headers)
target_include_directories(engine PRIVATE src)

# Output binary to build/ directory
set_target_properties(engine PROPERTIES
    RUNTIME_OUTPUT_DIRECTORY ${CMAKE_BINARY_DIR}
)
