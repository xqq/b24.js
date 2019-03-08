#ifndef _B24JS_OBJECT_HELPER
#define _B24JS_OBJECT_HELPER

#ifdef __EMSCRIPTEN__
#include <emscripten.h>
#endif

#ifdef __cplusplus
extern "C" {
#endif

extern int object_create_id(void);

extern void object_set_field_int(int object_id, const char* key, int value);

extern void object_set_field_double(int object_id, const char* key, double value);

extern void object_set_field_string(int object_id, const char* key, const char* value);

extern void object_set_field_array(int object_id, const char* key, int array_id);

extern int array_create_id(void);

extern void array_push_object(int array_id, int object_id);

extern void* get_object_from_id(int id);

extern void revoke_ids(void);

#ifdef __cplusplus
}
#endif

#endif // _B24JS_OBJECT_HELPER