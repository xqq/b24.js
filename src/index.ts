import { InitializeEvent } from './cmodule-proxy';

export { default as Decoder } from './b24-decoder';
export { default as WebVTTRenderer } from './webvtt-renderer';

export { isInitialized } from './cmodule-proxy';
export function addInitializedCallback(callback: () => void): void {
    InitializeEvent.once(callback);
}
