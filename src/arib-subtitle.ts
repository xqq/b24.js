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

    public rubylessText(): string {
        let furiganas: Map<number, number> = new Map();  // <start, length>
        let start = 0;

        // Scan Furigana regions and mark position
        for (let region of this.regions) {
            if (region.fontHeight === 18 && region.fontWidth === 18) {
                furiganas.set(start, region.text.length);
            }
            start += region.text.length;
        }

        if (furiganas.size === 0) {
            // No Furiganas, return
            return this.text;
        }

        let text = '';

        // Recombine and ignore Furigana regions
        for (let i = 0; i < this.text.length;) {
            let length = furiganas.get(i);

            if (length !== undefined) {
                i += length;
            } else {
                text += this.text.charAt(i);
                i++;
            }
        }

        return text;
    }

}
