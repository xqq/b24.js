// const wasm = require('../build/b24js-cmodule.wasm');
import cmodule from '../build/b24js-cmodule';
import FlagEvent from './flag-event';

export let InitializeEvent = new FlagEvent();
export let isInitialized = false;

let notifyInitialized = (): void => {
    isInitialized = true;
    InitializeEvent.set();
};

if (cmodule.calledRun) {
    notifyInitialized();
} else {
    cmodule.onRuntimeInitialized(notifyInitialized);
}
