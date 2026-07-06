# Browser Journey — Interactive Infographic

An interactive infographic that visualises what happens behind the scenes when you type a URL into your browser (a shorted one). Built as a standalone **Web Component** (`<browser-journey>`) so it can be embedded into any webpage.

**Topic:** The journey of a web request — from keystroke to DNS lookup, server fetch, and browser rendering.

## Demo

[View live demo on Netlify](https://morph-assessment-task.netlify.app)

## Features

### Interactive Elements

| # | Element | Type |
|---|---------|------|
| 1 | **Click-to-reveal info panels** — "?" buttons during DNS and Server stages open detailed explainer tooltips | Tooltip / Reveal |
| 2 | **Play / Pause toggle** — pause/resume the auto-advancing journey at any point | Control |
| 3 | **Keyboard shortcut** — press `Space` to toggle play/pause | Keyboard |
| 4 | **Restart on completion** — journey auto-advances then offers a restart button | Flow control |

### Dynamic Visuals

- **URL typing animation** — each keystroke types out the URL string into the browser bar accompanied by a synth click sound via the Web Audio API
- **Matrix-style DNS scramble** — the IP address digits scramble randomly before settling on the final value
- **Server resource fetch** — animated lines extend from the server icon, resource cards (HTML, CSS, JS) appear with staggered timing
- **Wireframe rendering** — a page wireframe builds up section-by-section
- **GSAP-powered transitions** — smooth fade, scale, blur transitions between each stage
- **Hover effects** — all interactive elements respond with scale, colour, or shadow changes
- **Background image** — full-bleed background behind the infographic

### Responsive Design

| Viewport | Container Size |
|----------|---------------|
| Desktop  | 1440px × 900px |
| Mobile   | 375px × 677px |

The component adapts via CSS media queries and flexible layout. On mobile the resource cards stack vertically and browser window width reduces to 95%.

## What I Used

| Technology | Reason |
|------------|--------|
| **HTML, CSS, JavaScript** | Core stack as required — no framework overhead, full control over the component. |
| **Web Components** | Encapsulates the infographic with Shadow DOM — no style leaks, embeddable via `<browser-journey></browser-journey>` in any page. |
| **GSAP** | Used for animations (scrubber, stagger, easing) — chosen because I'm most familiar with it and it fits the task well. |

## Running the Project

```bash
pnpm install
pnpm dev
pnpm build
pnpm preview
```

## Usage (Embed)

```html
<script type="module" src="/dist/assets/main.js"></script>
<browser-journey></browser-journey>
```

The component is self-contained via Shadow DOM — no style leaks in or out.

## Sections Before & After the Infographic

The hero, context, info cards, quote, and footer sections in `index.html` were built using **AI-generated tools** to allow more time to be spent on the core interactive infographic component itself.
