#ifdef __EMSCRIPTEN__
#include <emscripten.h>
#endif
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <aribb24/aribb24.h>
#include <aribb24/parser.h>
#include <aribb24/decoder.h>
#include "b24js_cmodule.h"
#include "object_helper.h"

static void aribb24_message_callback(void* opaque, const char* message) {
#if defined(__EMSCRIPTEN__)
    emscripten_log(EM_LOG_WARN, "%s\n", message);
#else
    printf("%s\n", message);
#endif
}

B24Decoder* b24decoder_alloc() {
    B24Decoder* b24 = calloc(1, sizeof(B24Decoder));

    b24->arib_ = arib_instance_new(NULL);
    arib_set_base_path(b24->arib_, "/");
    arib_register_messages_callback(b24->arib_, &aribb24_message_callback);

    b24->arib_parser_ = arib_get_parser(b24->arib_);
    b24->arib_decoder_ = arib_get_decoder(b24->arib_);

    return b24;
}

void b24decoder_free(B24Decoder* b24) {
    arib_instance_destroy(b24->arib_);

    b24->arib_ = NULL;
    b24->arib_decoder_ = NULL;
    b24->arib_parser_ = NULL;

    free(b24);
}

static void dump_string(const char* str, size_t length) {
    for (size_t i = 0; i < length; i++) {
        if (i == length - 1) {
            printf("%02hhX\n", str[i]);
        } else {
            printf("%02hhX ", str[i]);
        }
    }
}

int b24decoder_decode_pes(B24Decoder* b24, double pts, const uint8_t* data, size_t size) {
    revoke_ids();

    arib_parse_pes(b24->arib_parser_, data, size);

    size_t parsed_size = 0;
    const uint8_t* parsed_data = arib_parser_get_data(b24->arib_parser_, &parsed_size);

    if (parsed_data == NULL || parsed_size == 0) {
        return -1;
    }

    size_t subtitle_size = parsed_size * 4;
    char* subtitle_data = calloc(subtitle_size + 1, 1);


    arib_initialize_decoder_a_profile(b24->arib_decoder_);

    subtitle_size = arib_decode_buffer(b24->arib_decoder_, parsed_data, parsed_size, subtitle_data, subtitle_size);
    if (subtitle_size == 0) {
        free(subtitle_data);
        return -1;
    }

    time_t duration = arib_decoder_get_time(b24->arib_decoder_);

    int subtitle_id = object_create_id();

    object_set_field_string(subtitle_id, "text", subtitle_data);
    object_set_field_int(subtitle_id, "pts", (int)(pts * 1000));
    object_set_field_int(subtitle_id, "duration", (int)(duration / 1000));

    const arib_buf_region_t* region = arib_decoder_get_regions(b24->arib_decoder_);
    if (region == NULL) {
        return -1;
    }

    object_set_field_int(subtitle_id, "planeWidth", region->i_planewidth);
    object_set_field_int(subtitle_id, "planeHeight", region->i_planeheight);

    int array_id = array_create_id();
    object_set_field_array(subtitle_id, "regions", array_id);


    for (; region != NULL; region = region->p_next) {
        int region_id = object_create_id();

        size_t text_length = region->p_end - region->p_start;
        char* text = calloc(text_length + 1, 1);
        strncpy(text, region->p_start, text_length);
        text[text_length] = '\0';

        object_set_field_string(region_id, "text", text);
        free(text);

        object_set_field_int(region_id, "fontColor", region->i_foreground_color);
        object_set_field_int(region_id, "fontAlpha", region->i_foreground_alpha);
        object_set_field_int(region_id, "backColor", region->i_background_color);
        object_set_field_int(region_id, "backAlpha", region->i_background_alpha);
        object_set_field_int(region_id, "width", region->i_width);
        object_set_field_int(region_id, "height", region->i_height);
        object_set_field_int(region_id, "fontWidth", region->i_fontwidth);
        object_set_field_int(region_id, "fontHeight", region->i_fontheight);
        object_set_field_int(region_id, "verticalInterval", region->i_verint);
        object_set_field_int(region_id, "horizontalInterval", region->i_horint);
        object_set_field_int(region_id, "charLeft", region->i_charleft);
        object_set_field_int(region_id, "charBottom", region->i_charbottom);

        array_push_object(array_id, region_id);
    }

    free(subtitle_data);
    arib_finalize_decoder(b24->arib_decoder_);

    return subtitle_id;
}
