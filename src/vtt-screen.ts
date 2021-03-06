import { AribSubtitle, AribSubtitleRegion } from './arib-subtitle';
import { VTTStyleManager } from './vtt-style-manager';
import { escapeHTML, isFireFox, isSafari } from './utils';

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

    public render(styleManager: VTTStyleManager): VTTCue[] {
        let subtitle = this.subtitle;
        let text = subtitle.rubylessText();  // Remove Furiganas
        let id = subtitle.hashCode().toString();

        if (this._undetermined) {
            // fill in a guessed duration for undetermined subtitle
            this._guessDuration = Math.round(text.length / 3) * 1000;
        }

        let orderedRegions = this.rearrangeRegions(subtitle);

        if ((window as any).VTTCue) {
            // For modern browsers with VTTCue support
            let line = -5 + orderedRegions.length;
            // bottom-up
            for (let regionLine of orderedRegions.reverse()) {
                let cueText = '';

                for (let region of regionLine) {
                    // merge regions on a same line into single cue with color tag
                    let colorTag = styleManager.applyColor(region.fontColor);
                    cueText += `<${colorTag}>${escapeHTML(region.text)}</v>`;
                }

                let cue = new VTTCue(this.startTime / 1000, this.endTime / 1000, cueText);

                cue.id = id;
                cue.snapToLines = true;
                cue.lineAlign = 'start';
                cue.line = line--;
                cue.positionAlign = 'center';

                this._cues.push(cue);
            }
        } else if ((window as any).TextTrackCue) {
            // For brwser which doesn't support VTTCue, e.g. Microsoft Edge
            for (let regionLine of orderedRegions) {
                let cueText = '';

                for (let region of regionLine) {
                    cueText += region.text;
                }

                let cue = new TextTrackCue(this.startTime / 1000, this.endTime / 1000, escapeHTML(cueText)) as VTTCue;

                cue.id = id;

                this._cues.push(cue);
            }
        }

        return this._cues;
    }

    private rearrangeRegions(subtitle: AribSubtitle): AribSubtitleRegion[][] {
        let map: Map<number, AribSubtitleRegion[]> = new Map();

        for (let region of subtitle.regions) {
            if (region.fontHeight === 18 && region.fontWidth === 18) {
                // Ignore Furigana
                continue;
            }

            let regionArray = map.get(region.charBottom);
            if (regionArray) {
                regionArray.push(region);
            } else {
                map.set(region.charBottom, [region]);
            }
        }

        let newRegions: AribSubtitleRegion[][] = [];

        map.forEach((regions: AribSubtitleRegion[], charBottom: number) => {
            regions.sort((a: AribSubtitleRegion, b: AribSubtitleRegion): number => {
                return a.charLeft - b.charLeft;
            });
            newRegions.push(regions);
        });

        newRegions.sort((a: AribSubtitleRegion[], b: AribSubtitleRegion[]): number => {
            return a[0].charBottom - b[0].charBottom;
        });

        return newRegions;
    }

}
