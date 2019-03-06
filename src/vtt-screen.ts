import { AribSubtitle } from './arib-subtitle';

export default class VTTScreen {

    private subtitle: AribSubtitle;
    private _undetermined: boolean;
    private _guessDuration: number;
    private _cues: VTTCue[];

    public constructor(aribSubtitle: AribSubtitle) {
        this.subtitle = aribSubtitle;
        this._undetermined = (this.subtitle.duration === 0);
        this._guessDuration = 0;
        this._cues = [];
    }

    public dispose(): void {
        this.subtitle = null;
        this._cues.length = 0;
    }

    // @time milliseconds
    public isAlive(time: number): boolean {
        if (time >= this.startTime && time < this.endTime) {
            return true;
        }
        return false;
    }

    // @return milliseconds
    public get startTime(): number {
        return this.subtitle.pts;
    }

    // @return milliseconds
    public get endTime(): number {
        return this.subtitle.pts + this.duration;
    }

    // @return milliseconds
    public get duration(): number {
        if (this._undetermined) {
            return this._guessDuration;
        }
        return this.subtitle.duration;
    }

    // @value milliseconds
    public set duration(value: number) {
        this._undetermined = false;
        this._guessDuration = 0;

        this.subtitle.duration = value;
        let endTime = this.subtitle.pts + value;

        for (let cue of this._cues) {
            cue.endTime = endTime / 1000;
        }
    }

    public get undetermined(): boolean {
        return this._undetermined;
    }

    public get cues(): VTTCue[] {
        return this._cues;
    }

    public render(): VTTCue[] {
        let subtitle = this.subtitle;

        if (this._undetermined) {
            // fill in a guessed duration for undetermined subtitle
            this._guessDuration = Math.round(subtitle.text.length / 3) * 1000;
        }

        let text = subtitle.text;

        let cue = new VTTCue(this.startTime / 1000, this.endTime / 1000, text);
        cue.id = subtitle.hashCode().toString();
        cue.snapToLines = false;
        cue.lineAlign = 'start';
        cue.line = 75;
        cue.position = 'auto';
        cue.positionAlign = 'center';

        this._cues.push(cue);

        return this._cues;
    }

}
