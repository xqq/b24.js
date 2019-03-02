#ifndef _B24JS_CMODULE_H
#define _B24JS_CMODULE_H

#include <stdint.h>

#ifdef __EMSCRIPTEN__
    #include <emscripten.h>
    #define EMS_KEEPALIVE EMSCRIPTEN_KEEPALIVE
#else  // make it compatible under other compiler
    #define EMS_KEEPALIVE
#endif

typedef struct arib_instance_t arib_instance_t;
typedef struct arib_parser_t arib_parser_t;
typedef struct arib_decoder_t arib_decoder_t;


typedef struct B24Decoder {
    arib_instance_t* arib_;
    arib_parser_t* arib_parser_;
    arib_decoder_t* arib_decoder_;
} B24Decoder;


EMS_KEEPALIVE
B24Decoder* b24decoder_alloc();

EMS_KEEPALIVE
void b24decoder_free(B24Decoder* b24);

EMS_KEEPALIVE
int b24decoder_decode_pes(B24Decoder* b24, double pts, const uint8_t* data, size_t size);



#endif // _B24JS_CMODULE_H
