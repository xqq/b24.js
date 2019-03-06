export function setPrototypeOf(obj: object, proto: object): object {
    if ((Object as any).setPrototypeOf) {
        // ES6 Object.setPrototypeOf
        return (Object as any).setPrototypeOf(obj, proto);
    }

    (obj as any).__proto__ = proto;
    return obj;
}

export function BKDRHash(str: string): number {
    let hash = 0;
    const seed = 131;
    const INT_MAX = 0x7FFFFFFF;

    for (let i = 0; i < str.length; i++) {
        // clip to int32
        hash = (hash * seed + str.charCodeAt(i)) & INT_MAX;
    }

    return hash;
}
