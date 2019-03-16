import B24Decoder from './b24-decoder';
import VTTScreen from './vtt-screen';
import { AribSubtitle } from './arib-subtitle';
import { StyleManager } from './style-manager';
import { isEdge, isMSIE } from './utils';
import { InitializeEvent, isInitialized } from './cmodule-initializer';

interface DecoderMap {
    [pid: number]: B24Decoder;
}

interface TrackMap {
    subtitle: TextTrack;
    emptyPlaceholder: TextTrack;
}

export default class WebVTTRenderer {

    private decoders: DecoderMap;
    private media: HTMLMediaElement;
    private tracks: TrackMap;
    private screens: VTTScreen[];
    private styleManager: StyleManager;

    public constructor() {
        this.decoders = {};
        this.tracks = {
            subtitle: undefined,
            emptyPlaceholder: undefined
        };
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
        this.setupTracks();
        this.styleManager.init();
    }

    public detachMedia(): void {
        this.cleanupScreens();
        this.styleManager.dispose();
        this.cleanupTracks();
        this.media = null;
    }

    private setupTracks(): void {
        let subtitleTrack = this.findExistingTrack('subtitle');
        if (subtitleTrack === null) {
            subtitleTrack = this.createTextTrack('subtitle', 'ARIB B24 Japanese');
        }

        let placeholderTrack = this.findExistingTrack('emptyPlaceholder');
        if (placeholderTrack === null) {
            placeholderTrack = this.createTextTrack('emptyPlaceholder', 'ARIB B24 Off');
        }

        this.tracks.subtitle = subtitleTrack;
        this.tracks.emptyPlaceholder = placeholderTrack;
    }

    private cleanupTracks(): void {
        // There is no way to destroy a TextTrack, unless destroy the HTMLMediaElement
        let tracks = this.tracks;
        this.cleanupTrack(tracks.subtitle);
        tracks.subtitle = undefined;
        tracks.emptyPlaceholder = undefined;
    }

    private findExistingTrack(type: string): TextTrack {
        let media = this.media;
        for (let i = 0; i < media.textTracks.length; i++) {
            let track = media.textTracks[i];
            if ((track as any).b24js === true && (track as any).b24jsType === type) {
                return track;
            }
        }
        return null;
    }

    private createTextTrack(type: string, description: string): TextTrack {
        let track = this.media.addTextTrack('subtitles', description, 'ja');
        (track as any).b24js = true;  // add a mark as managed by b24.js
        (track as any).b24jsType = type;
        return track;
    }

    private cleanupTrack(track: TextTrack): void {
        if (track && track.cues) {
            let cues = track.cues;

            for (let i = cues.length - 1; i >= 0; i--) {
                track.removeCue(cues[i]);
            }
        }
    }

    private removeCuesAfter(time: number): void {
        let second = time / 1000;
        let track = this.tracks.subtitle;

        if (track && track.cues) {
            let cues = track.cues;
            for (let i = cues.length - 1; i >= 0; i--) {
                if (cues[i].startTime >= second) {
                    track.removeCue(cues[i]);
                }
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
        this.tracks.emptyPlaceholder.mode = 'hidden';
        this.tracks.subtitle.mode = 'showing';
    }

    public hide(): void {
        this.tracks.subtitle.mode = 'hidden';
        this.tracks.emptyPlaceholder.mode = 'showing';
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

        if (this.tracks.subtitle.mode === 'disabled') {
            // otherwise track.cues will be null
            this.tracks.subtitle.mode = 'hidden';
        }

        let id = subtitle.hashCode().toString();
        if (this.tracks.subtitle.cues.getCueById(id) != null) {
            // duplicated subtitle, discard it
            return;
        }

        let prevScreen = null;
        if (this.screens.length > 0) {
            prevScreen = this.screens[this.screens.length - 1];
        }

        if (prevScreen && (isEdge() || isMSIE()) && subtitle.pts < prevScreen.startTime) {
            // For Microsoft Edge, TextTrack.addCue only accepts cues that in time order
            // Drop exisiting cues after new cue before appending
            this.removeCuesAfter(subtitle.pts);
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
            this.tracks.subtitle.addCue(cue);
        }
        this.screens.push(screen);
    }

}
