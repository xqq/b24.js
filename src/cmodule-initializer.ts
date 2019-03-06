import cmodule from '../build/b24js-cmodule';
import FlagEvent from './flag-event';

export let InitializeEvent = new FlagEvent();
export let isInitialized = false;

cmodule.onRuntimeInitialized = () => {
    isInitialized = true;
    InitializeEvent.set();
};
