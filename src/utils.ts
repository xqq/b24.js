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

export function escapeHTML(unsafe: string): string {
    let tags: {[key: string]: string} = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        '\'': '&#039;'
    };
    return unsafe.replace(/[&<>"']/g, (char: string): string => {
        return tags[char] || char;
    });
}

export function isFireFox(): boolean {
    return /firefox|Firefox/.test(navigator.userAgent);
}

export function isChrome(): boolean {
    return /chrome|Chrome/.test(navigator.userAgent);
}

export function isSafari(): boolean {
    return /safari|Safari/.test(navigator.userAgent) && !isChrome();
}

export function isEdge(): boolean {
    return /Edge|edge/.test(navigator.userAgent);
}

export function isMSIE(): boolean {
    return /msie|MSIE/.test(navigator.userAgent) || /Trident/.test(navigator.userAgent);
}
