// const wasm = require('../build/b24js-cmodule.wasm');
// @ts-ignore
import * as create_module from '../build/b24js-cmodule';
import FlagEvent from './flag-event';

export let InitializeEvent = new FlagEvent();
export let isInitialized = false;
export let cmodule: any = null;

export class CModuleProxy {

    public static async init(): Promise<void> {
        cmodule = await create_module();
        isInitialized = true;
        InitializeEvent.set();
    }

}
