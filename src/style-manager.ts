export class StyleManager {

    private style: HTMLStyleElement;
    private cueStyle: Text;
    private colorMap: Map<number, Text>;

    public constructor() {
        this.style = null;
        this.colorMap = new Map();
    }

    public init(): void {
        let style = this.style = document.createElement('style');
        style.type = 'text/css';

        this.cueStyle = document.createTextNode(`
            video::cue {
                background-color: rgba(0, 0, 0, 0.5);
            }

            video::-webkit-media-text-track-display-backdrop {
                background-color: rgba(0, 0, 0, 0.5) !important;
            }
        `);

        style.appendChild(this.cueStyle);

        let head = document.getElementsByTagName('head')[0];
        head.appendChild(style);
    }

    public dispose(): void {
        this.colorMap.forEach((colorStyle: Text) => {
            colorStyle.remove();
        });
        this.colorMap.clear();

        this.cueStyle.remove();
        this.style.remove();
    }

    public applyColor(rgb: number): string {
        rgb = rgb & 0x00FFFFFF;
        let styleText = this.colorMap.get(rgb);
        let tag = `v.b24js rgb${rgb.toString(16)}`;

        if (styleText != undefined) {
            return tag;
        }

        let r = (rgb & 0xFF0000) >>> 16;
        let g = (rgb & 0x00FF00) >>> 8;
        let b = (rgb & 0x0000FF);

        styleText = document.createTextNode(`
            video::cue(v.b24js[voice="rgb${rgb.toString(16)}"]) {
                color: rgb(${r}, ${g}, ${b}) !important;
            }
        `);

        this.style.appendChild(styleText);
        this.colorMap.set(rgb, styleText);

        return tag;
    }

}
