import { InitializeEvent } from './cmodule-initializer';

export { default as Decoder } from './b24-decoder';
export { default as WebVTTRenderer } from './webvtt-renderer';

export { isInitialized } from './cmodule-initializer';
export function addInitializedCallback(callback: () => void): void {
    InitializeEvent.once(callback);
}
