cmake_minimum_required(VERSION 3.2)
project(b24js-cmodule C)

if (EMSCRIPTEN)
    if (CMAKE_BUILD_TYPE MATCHES "Release")
        set(CMAKE_C_FLAGS "${CMAKE_C_FLAGS} -O3 -g0 --llvm-opts 3 --llvm-lto 3 --closure 1 -s MODULARIZE=1")
    else()  # Debug
        set(CMAKE_C_FLAGS "${CMAKE_C_FLAGS} -O0 -g4 --js-opts 0 -s ASSERTIONS=1")
    endif()
    set(CMAKE_C_FLAGS "${CMAKE_C_FLAGS} -s WASM=0 -s DEMANGLE_SUPPORT=1 -s ENVIRONMENT=web -s MODULARIZE_INSTANCE=1 -s EXPORT_ES6=1 -s EXPORT_NAME='cmodule'")
    set(CMAKE_C_FLAGS "${CMAKE_C_FLAGS} --js-library ${CMAKE_SOURCE_DIR}/cmodule/object-helper.js")
    set(CMAKE_C_FLAGS "${CMAKE_C_FLAGS} -s EXPORTED_FUNCTIONS=@${CMAKE_SOURCE_DIR}/cmodule/export_functions.json")
    set(CMAKE_C_FLAGS "${CMAKE_C_FLAGS} -s DEFAULT_LIBRARY_FUNCS_TO_INCLUDE=@${CMAKE_SOURCE_DIR}/cmodule/library_functions.json")
    set(CMAKE_C_FLAGS "${CMAKE_C_FLAGS} --memory-init-file 0")
    set(CMAKE_C_FLAGS "${CMAKE_C_FLAGS} --embed-file ${CMAKE_SOURCE_DIR}/cmodule/preload_files@")
    set(CMAKE_EXECUTABLE_SUFFIX ".js")
endif()

add_executable(b24js-cmodule
    cmodule/b24js_cmodule.h
    cmodule/b24js_cmodule.c
    aribb24/src/aribb24.c
    aribb24/src/decoder.c
    aribb24/src/drcs.c
    aribb24/src/md5.c
    aribb24/src/parser.c
)

target_include_directories(b24js-cmodule
    PRIVATE
        aribb24/src
)
