# Browser Journey — Interactive Infographic

An interactive infographic visualising what happens behind the scenes when you type a URL into your browser (shortened), built as a standalone **Web Component** (`<browser-journey>`) for easy embedding into any webpage. It explores the full lifecycle of a web request: from keystroke input, DNS lookup, and server request to response handling and browser rendering.

**Topic:** This topic is directly relevant to my day-to-day work in front-end development, where understanding how browsers load pages is essential for performance optimisation and debugging. It also provided an opportunity to apply GSAP techniques, including staggered sequencing, easing curves, and timeline orchestration, to create a clear and engaging visual narrative of the process.

## Demo

[View live demo on Netlify](https://morph-assessment-task.netlify.app)

## Features

| # | Element | Type |
|---|---------|------|
| 1 | **Click-to-reveal info panels** — "?" buttons during DNS and Server stages open detailed explainer tooltips | Tooltip / Reveal |
| 2 | **Play / Pause toggle** — pause/resume the auto-advancing journey at any point | Control |
| 3 | **Keyboard shortcut** — press `Space` to toggle play/pause | Keyboard |
| 4 | **Restart on completion** — journey auto-advances then offers a restart button | Flow control |

## What I Used

| Technology | Reason |
|------------|--------|
| **HTML, CSS, JavaScript** | Core stack as required — no framework overhead, full control over the component. |
| **Web Components** | Standard custom element — no Shadow DOM, embeddable via `<browser-journey></browser-journey>` in any page. |
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

## Sections Before & After the Infographic

The hero, context, info cards, quote, and footer sections in `index.html` were built using **AI-generated tools** to allow more time to be spent on the core interactive infographic component itself.
