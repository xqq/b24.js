import B24Decoder from './b24-decoder';
import VTTScreen from './vtt-screen';
import { AribSubtitle } from './arib-subtitle';
import { StyleManager } from './style-manager';
import { InitializeEvent, isInitialized } from './cmodule-initializer';

export default class WebVTTRenderer {

    private decoders: Record<number, B24Decoder>;
    private media: HTMLMediaElement;
    private track: TextTrack;
    private screens: VTTScreen[];
    private styleManager: StyleManager;

    public constructor() {
        this.decoders = {};
        this.screens = [];
        this.styleManager = new StyleManager();
    }

    public async init(): Promise<void> {
        if (isInitialized) {
            return;
        }

        return new Promise<void>(resolve => {
            InitializeEvent.once(() => {
                resolve();
            });
        });
    }

    public dispose(): void {
        if (this.media) {
            this.detachMedia();
        }
        // cleanup decoders
        for (let pid in this.decoders) {
            if (this.decoders.hasOwnProperty(pid)) {
                let decoder = this.decoders[pid];
                decoder.dispose();
                delete this.decoders[pid];
            }
        }
        this.decoders = null;
    }

    public attachMedia(media: HTMLMediaElement): void {
        this.media = media;

        let track = this.findExistingTrack();
        if (track === null) {
            track = this.createTextTrack();
        }

        this.track = track;
        this.styleManager.init();
    }

    public detachMedia(): void {
        this.cleanupTrack();
        this.cleanupScreens();
        this.styleManager.dispose();
        // There is no way to destroy a TextTrack, unless destroy the HTMLMediaElement
        this.track = null;
        this.media = null;
    }

    private findExistingTrack(): TextTrack {
        let media = this.media;
        for (let i = 0; i < media.textTracks.length; i++) {
            let track = media.textTracks[i];
            if ((track as any).b24js === true) {
                return track;
            }
        }
        return null;
    }

    private createTextTrack(): TextTrack {
        let track = this.media.addTextTrack('subtitles', 'ARIB B24 Japanese', 'ja');
        (track as any).b24js = true;  // add a mark as managed by b24.js
        return track;
    }

    private cleanupTrack(): void {
        let track = this.track;
        if (track && track.cues) {
            while (track.cues.length > 0) {
                track.removeCue(track.cues[0]);
            }
        }
    }

    private cleanupScreens(): void {
        for (let screen of this.screens) {
            screen.dispose();
        }
        this.screens.length = 0;
    }

    public show(): void {
        this.track.mode = 'showing';
    }

    public hide(): void {
        this.track.mode = 'hidden';
    }

    public pushData(pid: number, uint8array: Uint8Array, pts: number): void {
        let decoder = this.decoders[pid];
        if (decoder == undefined) {
            decoder = this.decoders[pid] = new B24Decoder();
        }

        let subtitle = decoder.decode(uint8array, pts);
        if (subtitle == null) {
            return;
        }

        if (this.track.mode === 'disabled') {
            // otherwise track.cues will be null
            this.track.mode = 'hidden';
        }

        let id = subtitle.hashCode().toString();
        if (this.track.cues.getCueById(id) != null) {
            // duplicated subtitle, discard it
            return;
        }

        let prevScreen = null;
        if (this.screens.length > 0) {
            prevScreen = this.screens[this.screens.length - 1];
        }

        if (prevScreen && prevScreen.isAlive(subtitle.pts)) {
            // update duration of previous subtitle to avoid overlap -> (new.startTime - prev.startTime)
            let duration = subtitle.pts - prevScreen.startTime;
            prevScreen.duration = duration;
        }

        this.convertAndAppendSubtitle(subtitle);
    }

    private convertAndAppendSubtitle(subtitle: AribSubtitle): void {
        let screen = new VTTScreen(subtitle);
        let cues: VTTCue[] = screen.render(this.styleManager);

        for (let cue of cues) {
            this.track.addCue(cue);
        }
        this.screens.push(screen);
    }

}
