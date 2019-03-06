export default class FlagEvent {

    private flag: boolean;
    private listeners: (() => void)[];

    public constructor() {
        this.flag = false;
        this.listeners = [];
    }

    public set(): void {
        this.flag = true;
        if (this.listeners.length) {
            for (let i = 0; i < this.listeners.length; i++) {
                this.listeners[i].call(this);
            }
        }
    }

    public on(listener: () => void): void {
        this.listeners.push(listener);
        if (this.flag) {
            listener.call(this);
        }
    }

    public off(listener: () => void): void {
        let index = -1;

        for (let i = this.listeners.length - 1; i >= 0; i--) {
            if (this.listeners[i] === listener) {
                index = i;
                break;
            }
        }

        if (index !== -1) {
            if (this.listeners.length === 1) {
                this.listeners.length = 0;
            } else {
                this.listeners.splice(index, 1);
            }
        }
    }

    public once(listener: () => void): void {
        let wrap = (): void => {
            this.off(wrap);
            listener.call(this);
        };

        (wrap as any).listener = listener;
        this.on(wrap);
    }

}
