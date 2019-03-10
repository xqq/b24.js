b24.js  [![npm](https://img.shields.io/npm/v/b24.js.svg?style=flat)](https://www.npmjs.com/package/b24.js)
======
An HTML5 subtitle renderer for ARIB STD-B24 data packet, which is transmitted over the Digital TV Broadcasting in Japan.

## Features
- Converting to WebVTT
- Keeping original multiple caption lines 
- Colored rendering with font color specified by data packet

## Build
- [NPM package](https://www.npmjs.com/package/b24.js) can be used directly

### Preparing
```bash
git clone https://github.com/xqq/b24.js.git
cd b24.js
git submodule update --init
npm install
```

### Compiling C module
Install third-party toolchains:
- CMake
- [Emscripten](https://emscripten.org/)

```bash
mkdir build
cd build
emcmake cmake -DCMAKE_BUILD_TYPE=Release ..
make -j8
```

### Compiling b24.js library
```bash
npm run build
```


## Getting Started
```html
<script src="hls.min.js"></script>
<script src="b24.js"></script>
<video id="videoElement"></video>
<script>
    var video = document.getElementById('videoElement');
    var hls = new Hls();
    hls.loadSource('https://video-dev.github.io/streams/x36xhzz/x36xhzz.m3u8');
    hls.attachMedia(video);
    video.play();

    var b24Renderer = new b24js.WebVTTRenderer();
    b24Renderer.init().then(function() {
        b24Renderer.attachMedia(video);
        b24Renderer.show();
    });
    hls.on(Hls.Events.FRAG_PARSING_PRIVATE_DATA, function (event, data) {
        for (var sample of data.samples) {
            b24Renderer.pushData(sample.pid, sample.data, sample.pts);
        }
    }
</script>
```

## Screenshoot
![1.jpg](screenshots/1.jpg)

![2.jpg](screenshots/2.jpg)

## Third-party libraries

- [aribb24](https://github.com/nkoriyama/aribb24.git)

## License
```
MIT License

Copyright (c) 2019 xqq <xqq@xqq.im>
```