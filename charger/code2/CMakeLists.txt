cmake_minimum_required(VERSION 3.0)
project(ncmain)

# Set C++ standard
set(CMAKE_CXX_STANDARD 14)
set(CMAKE_CXX_STANDARD_REQUIRED TRUE)

# Add ncmain library
add_subdirectory(socketcan-cpp)

# Add json library
#add_subdirectory(json)

# Create ncmain executable
add_executable(ncmain main.cpp nodecan.cpp)

# Ensure ncmain can find nodecan.hpp
target_include_directories(ncmain PRIVATE ${CMAKE_CURRENT_SOURCE_DIR})

# Link with socketcan_cpp
target_link_libraries(ncmain PRIVATE socketcan_cpp)
