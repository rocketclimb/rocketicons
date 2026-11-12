# Rocketicons promo video pipeline

How `rocketicons-promo-10s.mp4` was made. Everything is plain code: no video editor, no AI at render time.

1. `index.src.html`: the whole animation. A paused GSAP timeline plus a `procedural(t)` layer (typing, glitch, counter, camera shake).
   `window.__render(t)` puts the page into the exact state for time `t`, so every frame is deterministic.
2. `build.py`: inlines fonts, GSAP, the Lucide icon data (`icons.json`) and the logo SVG into one self-contained `index.html`.
3. `render.mjs`: headless Chromium (Playwright) seeks to each of the 600 frames (60fps × 10s) and screenshots it.
4. `audio.py`: an original synth track built with numpy/scipy (kick, claps, hats, bass, supersaw pads, plucks, risers, whooshes, UI pops).
   Every hit is placed on the same timestamps as the animation cuts.
5. `ffmpeg` muxes the frames and the soundtrack into H.264 + AAC.

```bash
npm install && pip install numpy scipy pillow
npm run icons     # regenerate icons.json (optional)
npm run all       # build → frames → audio → encode
```

Key timings (seconds): drop 2.5 · scene C 4.5 · scene D 6.5 · logo 8.5 · end 10.0. Music is 120 BPM with bar lines on 0.5 / 2.5 / 4.5 / 6.5 / 8.5.
