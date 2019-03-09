import { AribSubtitle } from './arib-subtitle';
import { setPrototypeOf } from './utils';
import { isInitialized } from './cmodule-initializer';
// @ts-ignore
import * as cmodule from '../build/b24js-cmodule';

export default class B24Decoder {

    private b24decoder: number;

    public constructor() {
        if (!isInitialized) {
            throw new Error('B24Decoder: cmodule hasn\'t initialized yet!');
        }
        this.b24decoder = cmodule._b24decoder_alloc();
    }

    public dispose(): void {
        cmodule._b24decoder_free(this.b24decoder);
        this.b24decoder = 0;
    }

    public decode(uint8array: Uint8Array, pts: number): AribSubtitle {
        let length: number = uint8array.byteLength;
        let ptr: number = cmodule._malloc(length);

        let heap: Uint8Array = new Uint8Array(cmodule.HEAP8.buffer, ptr, length);
        heap.set(uint8array);

        let ret = cmodule._b24decoder_decode_pes(this.b24decoder, pts, ptr, length);
        cmodule._free(ptr);

        if (ret == -1) {
            return null;
        }

        let obj = cmodule._get_object_from_id(ret);
        let subtitle = setPrototypeOf(obj, AribSubtitle.prototype) as AribSubtitle;
        return subtitle;
    }

}
