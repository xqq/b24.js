var LibraryObjectHelper = {
    $Helper: {
        ids: []
    },

    object_create_id: function() {
        var id = Helper.ids.length;
        Helper.ids[id] = {};
        return id;
    },

    object_set_field_int: function(object_id, key_ptr, value) {
        var obj = Helper.ids[object_id];
        var key = UTF8ToString(key_ptr);
        obj[key] = value;
    },

    object_set_field_double: function(object_id, key_ptr, value) {
        var obj = Helper.ids[object_id];
        var key = UTF8ToString(key_ptr);
        obj[key] = value;
    },

    object_set_field_string: function(object_id, key_ptr, str_ptr) {
        var obj = Helper.ids[object_id];
        var key = UTF8ToString(key_ptr);
        var value = UTF8ToString(str_ptr);
        obj[key] = value;
    },

    object_set_field_array: function(object_id, key_ptr, array_id) {
        var obj = Helper.ids[object_id];
        var key = UTF8ToString(key_ptr);
        var array = Helper.ids[array_id];
        obj[key] = array;
    },

    array_create_id: function() {
        var id = Helper.ids.length;
        Helper.ids[id] = [];
        return id;
    },

    array_push_object: function(array_id, object_id) {
        var array = Helper.ids[array_id];
        var obj = Helper.ids[object_id];
        array.push(obj);
    },

    get_object_from_id: function(id) {
        return Helper.ids[id];
    },

    revoke_ids: function() {
        Helper.ids = [];
    }

};

autoAddDeps(LibraryObjectHelper, '$Helper');
mergeInto(LibraryManager.library, LibraryObjectHelper);
