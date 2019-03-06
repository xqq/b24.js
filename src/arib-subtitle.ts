import { BKDRHash } from './utils';

export class AribSubtitleRegion {
    public text: string;

    public fontColor: number;
    public fontAlpha: number;
    public backColor: number;
    public backAlpha: number;
    public width: number;
    public height: number;
    public fontWidth: number;
    public fontHeight: number;
    public verticalInterval: number;
    public horizontalInterval: number;
    public charLeft: number;
    public charBottom: number;
}

export class AribSubtitle {
    public text: string;
    public pts: number;  // milliseconds
    public duration: number;  // milliseconds
    public planeWidth: number;
    public planeHeight: number;

    public regions: AribSubtitleRegion[];

    public hashCode(): number {
        return this.pts ^ BKDRHash(this.text);
    }

}
