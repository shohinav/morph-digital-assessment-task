/**
 * <browser-journey> Web Component
 *
 * A continuous journey inside a browser window:
 * 1. Launch screen
 * 2. Browser appears, URL types
 * 3. Zooms in → DNS → Server → Rendering
 * 4. Zooms out → Completed website
 *
 * Usage: <browser-journey></browser-journey>
 */

import { gsap } from 'gsap'

class BrowserJourney extends HTMLElement {
    constructor() {
        super()
        this._playing = false
        this._userPaused = false
        this._infoPaused = false
        this._waiting = false
        this._currentSlide = null
    }

    connectedCallback() { this._init() }

    disconnectedCallback() {
        document.removeEventListener('keydown', this._boundSpace)
    }

    _init() {
        this.innerHTML = `<style>${this._styles()}</style>`
        this._root = this._div('root')
        this.appendChild(this._root)
        this._showLaunch()
    }

    /* ═══════════════════════════════════════════
       Launch Screen
       ═══════════════════════════════════════════ */

    _showLaunch() {
        this._playing = false
        this._infoPaused = false
        this._userPaused = false
        this._currentSlide = null
        this._root.innerHTML = `
      <div class="launch">
        <div class="launch-content">
          <h1 class="launch-title">From Request<br>to Render</h1>
          <p class="launch-subtitle">Visualizing how a browser loads a website</p>
          <p class="launch-desc">Follow the journey from entering a URL to seeing a fully rendered webpage.</p>
          <button class="launch-btn">Begin Journey <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg></button>
        </div>
      </div>
    `
        // Entire intro is clickable
        this._root.querySelector('.launch').onclick = () => this._start()
    }

    async _start() {
        if (this._playing) return
        this._playing = true

        const launch = this._root.querySelector('.launch')
        if (launch) launch.onclick = null

        gsap.to(launch.querySelector('.launch-content'), {
            opacity: 0, y: -20, duration: 0.4, ease: 'power2.in'
        })
        await this._wait(400)

        // Show browser window
        this._showBrowser()
    }

    /* ═══════════════════════════════════════════
       Browser Window
       ═══════════════════════════════════════════ */

    _showBrowser() {
        this._root.innerHTML = `
      <div class="browser-stage">
        <div class="browser-window" id="browser">
          <div class="browser-chrome">
            <div class="browser-dots">
              <span class="dot-r"></span><span class="dot-y"></span><span class="dot-g"></span>
            </div>
            <div class="browser-url" id="url-bar">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.35)" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              <span class="url-text" id="url-text"></span>
              <span class="url-cursor" id="url-cursor">|</span>
            </div>
          </div>
          <div class="browser-screen" id="screen">
            <div class="screen-placeholder" id="screen-placeholder" style="opacity:0">
              <div class="screen-line" style="width:60%"></div>
              <div class="screen-line" style="width:80%"></div>
              <div class="screen-line" style="width:55%"></div>
              <div class="screen-line" style="width:35%"></div>
              <div class="screen-line" style="width:65%"></div>
              <div class="screen-line" style="width:95%"></div>
              <div class="screen-line" style="width:75%"></div>
            </div>
          </div>
        </div>

        <div class="step-indicator" id="step-indicator">
          <span class="step-text" id="step-text">Entering URL...</span>
        </div>

        <div class="play-controls">
          <button class="ctrl-btn" id="ctrl-play">Playing</button>
        </div>


      </div>
    `

        // Wire up play/pause
        this._ctrlPlay = this._root.querySelector('#ctrl-play')
        this._ctrlPlay.onclick = () => this._togglePlay()

        document.addEventListener('keydown', this._boundSpace = (e) => {
            if (e.key === ' ' && this._root.querySelector('.browser-stage')) {
                e.preventDefault()
                this._togglePlay()
            }
        })

        this._runJourney()
    }

    _togglePlay() {
        this._userPaused = !this._userPaused
        this._updatePlayPause()
        if (!this._userPaused && !this._infoPaused) this._waiting = false
    }

    _updatePlayPause() {
        const paused = this._userPaused || this._infoPaused
        this._ctrlPlay.textContent = paused ? 'Paused' : 'Playing'
        this._ctrlPlay.classList.toggle('paused', paused)
    }

    async _transitionScreen(screen) {
        // Fade out + blur current content
        gsap.to(screen, { opacity: 0, filter: 'blur(8px)', duration: 0.4, ease: 'power2.in' })
        await this._waitPausable(450)
        // Content will be replaced by the calling animation after this returns
    }

    _fadeInScreen(screen) {
        // Fade in new content
        gsap.set(screen, { filter: 'blur(8px)' })
        gsap.to(screen, { opacity: 1, filter: 'blur(0px)', duration: 0.5, ease: 'power2.out' })
    }

    /* ═══════════════════════════════════════════
       Main Animation Sequence
       ═══════════════════════════════════════════ */

    async _runJourney() {
        const browser = this._root.querySelector('#browser')
        const screen = this._root.querySelector('#screen')
        const urlText = this._root.querySelector('#url-text')
        const cursor = this._root.querySelector('#url-cursor')
        const stepText = this._root.querySelector('#step-text')

        // 1. Browser appears
        gsap.fromTo(browser, { scale: 0.9, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.8, ease: 'back.out(1.5)' })
        await this._waitPausable(1000)

        // 2. Type URL
        cursor.style.opacity = '1'
        const ctx = new (window.AudioContext || window.webkitAudioContext)()
        const url = 'https://www.3ds.com'

        for (let i = 0; i <= url.length; i++) {
            await this._waitWhilePaused()
            await this._wait(60 + Math.random() * 40)
            urlText.textContent = url.slice(0, i)
            if (i < url.length) this._click(ctx)
        }

        cursor.style.opacity = '0'
        await this._waitPausable(400)

        // 3. Show preloader, wait 2500ms, then fade out
        stepText.textContent = 'Loading page...'
        gsap.to(screen.querySelector('#screen-placeholder'), { opacity: 1, duration: 0.3 })
        await this._waitPausable(2500)
        gsap.to(screen.querySelector('#screen-placeholder'), { opacity: 0, y: '-25%', duration: 0.4, ease: 'power2.in' })
        await this._waitPausable(500)

        // 4. DNS animation
        await this._slideDNS(screen, stepText)

        // 5. Server animation
        await this._slideServer(screen, stepText)

        // 6. Rendering animation
        await this._slideRender(screen, stepText)

        // 7. Show completion
        await this._waitPausable(1000)

        stepText.textContent = '✓ Journey Complete'
        stepText.style.color = '#22c55e'

        await this._waitPausable(1500)

        // Show restart
        const indicator = this._root.querySelector('#step-indicator')
        indicator.innerHTML = `
      <div class="complete-badge">✓ Journey Complete</div>
      <button class="restart-btn">Restart Journey</button>
    `
        indicator.querySelector('.restart-btn').onclick = () => {
            this._playing = false
            this._showLaunch()
        }

        this._playing = false
    }

    /* ═══════════════════════════════════════════
       DNS Animation
       ═══════════════════════════════════════════ */

    async _slideDNS(screen, stepText) {
        stepText.textContent = 'DNS: Translating domain name...'
        stepText.style.color = '#6366f1'

        screen.innerHTML = `
      <div class="anim-dns">
        <div class="dns-row">
          <div class="anim-dns-label" style="opacity:0">www.3ds.com</div>
        </div>
        <div class="anim-dns-arrow" style="opacity:0">↓</div>
        <div class="dns-row">
          <div class="anim-dns-server" style="opacity:0">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#6366f1" stroke-width="1.8"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <span>DNS Server</span>
          </div>
          <div class="help-icon" id="dns-help" style="opacity:0">?</div>
        </div>
        <div class="anim-dns-arrow" style="opacity:0">↓</div>
        <div class="anim-dns-ip" style="opacity:0"><span class="ip-text">----------</span></div>
      </div>
    `

        const els = screen.querySelectorAll('.anim-dns > *, .dns-row > *')

        // Show all elements quickly
        gsap.to(screen.querySelector('.anim-dns-label'), { opacity: 1, y: 0, duration: 0.4, delay: 0 })
        gsap.to(screen.querySelector('#dns-help'), { opacity: 1, duration: 0.4, delay: 0.3 })
        gsap.to(screen.querySelectorAll('.anim-dns-arrow')[0], { opacity: 1, y: 0, duration: 0.4, delay: 0.15 })
        gsap.to(screen.querySelector('.anim-dns-server'), { opacity: 1, y: 0, duration: 0.4, delay: 0.3 })
        gsap.to(screen.querySelectorAll('.anim-dns-arrow')[1], { opacity: 1, y: 0, duration: 0.4, delay: 0.45 })
        gsap.to(screen.querySelector('.anim-dns-ip'), { opacity: 1, y: 0, duration: 0.4, delay: 0.6 })

        // Start blinking the help icon
        gsap.to(screen.querySelector('#dns-help'), { opacity: 0.5, duration: 0.8, repeat: -1, yoyo: true, ease: 'power2.inOut', delay: 0.6 })

        await this._wait(1000)

        // Matrix IP animation - all digits scramble for ~8 seconds
        const ipText = screen.querySelector('.ip-text')
        const target = '93.184.216.34'
        const digits = '0123456789'
        const totalCycles = 50 // ~8 seconds at 150ms each
        this._infoPaused = false

        const helpBtn = screen.querySelector('#dns-help')
        helpBtn.style.cursor = 'pointer'
        helpBtn.onclick = () => {
            if (!this._infoPaused) {
                this._infoPaused = true
                this._showDNSInfo(screen)
            }
        }

        for (let cycle = 0; cycle < totalCycles; cycle++) {
            // Check if paused
            while (this._infoPaused || this._userPaused) {
                await this._wait(200)
            }

            let next = ''
            for (let i = 0; i < target.length; i++) {
                if (target[i] === '.') {
                    next += '.'
                } else if (cycle >= totalCycles - 5 + Math.floor(i / 3)) {
                    // Settle this digit in the last few cycles
                    next += target[i]
                } else {
                    next += digits[Math.floor(Math.random() * 10)]
                }
            }
            ipText.textContent = next
            await this._wait(150)
        }

        // Final confirmed
        ipText.textContent = target
        gsap.to(screen.querySelector('.anim-dns-ip'), { scale: 1.15, duration: 0.25, yoyo: true, repeat: 1 })

        // Stop blinking
        gsap.killTweensOf(helpBtn)
        gsap.to(helpBtn, { opacity: 0.3, duration: 0.3 })
        helpBtn.onclick = () => this._showDNSInfo(screen)
        helpBtn.style.cursor = 'pointer'

        await this._wait(800)
    }

    _showDNSInfo(screen) {
        // Remove existing panel
        const existing = screen.querySelector('.dns-info-panel')
        if (existing) { existing.remove(); this._infoPaused = false; this._updatePlayPause(); return }

        const panel = document.createElement('div')
        panel.className = 'dns-info-panel'
        panel.innerHTML = `
      <div class="info-panel-title">DNS Lookup</div>
      <div class="info-panel-text">
        DNS (Domain Name System) is the internet's phonebook. When you type a web address,
        DNS translates the human-readable domain name (www.3ds.com) into a machine-readable
        IP address (93.184.216.34) that computers use to communicate.
      </div>
      <button class="info-panel-close">Continue</button>
    `
        screen.appendChild(panel)

        gsap.fromTo(panel, { opacity: 0, y: 20, scale: 0.95 }, { opacity: 1, y: 0, scale: 1, duration: 0.3, ease: 'power2.out' })

        panel.querySelector('.info-panel-close').onclick = () => {
            gsap.to(panel, { opacity: 0, y: 10, scale: 0.95, duration: 0.2, onComplete: () => { panel.remove(); this._infoPaused = false; this._updatePlayPause() } })
        }

        this._infoPaused = true
        this._updatePlayPause()
    }

    _showServerInfo(screen) {
        const existing = screen.querySelector('.server-info-panel')
        if (existing) { existing.remove(); this._infoPaused = false; this._updatePlayPause(); return }

        this._infoPaused = true
        this._updatePlayPause()

        const panel = document.createElement('div')
        panel.className = 'server-info-panel dns-info-panel'
        panel.innerHTML = `
      <div class="info-panel-title">Server Request</div>
      <div class="info-panel-text">
        The web server processes the browser's request and returns the files needed to display the webpage,
        including HTML, CSS, and JavaScript files.
      </div>
      <button class="info-panel-close">Continue</button>
    `
        screen.appendChild(panel)

        gsap.fromTo(panel, { opacity: 0, y: 20, scale: 0.95 }, { opacity: 1, y: 0, scale: 1, duration: 0.3, ease: 'power2.out' })

        panel.querySelector('.info-panel-close').onclick = () => {
            gsap.to(panel, { opacity: 0, y: 10, scale: 0.95, duration: 0.2, onComplete: () => { panel.remove(); this._infoPaused = false; this._updatePlayPause() } })
        }
    }

    /* ═══════════════════════════════════════════
       Server Animation
       ═══════════════════════════════════════════ */

    async _slideServer(screen, stepText) {
        // Smooth transition OUT
        await this._transitionScreen(screen)

        stepText.textContent = 'Server: Fetching resources...'
        stepText.style.color = '#ec4899'

        screen.innerHTML = `
      <div class="anim-server">
        <div class="anim-server-top">
          <div class="anim-server-icon-wrap">
            <div class="anim-server-icon">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ec4899" stroke-width="1.8"><rect x="2" y="2" width="20" height="8" rx="2"/><rect x="2" y="14" width="20" height="8" rx="2"/></svg>
            </div>
            <div class="help-icon" id="server-help" style="opacity:0">?</div>
          </div>
          <div class="anim-server-label">Server</div>
        </div>
        <div class="anim-server-lines">
          <div class="anim-res-line line-left" data-index="0"></div>
          <div class="anim-res-line line-center" data-index="1"></div>
          <div class="anim-res-line line-right" data-index="2"></div>
        </div>
        <div class="anim-server-cards">
          <div class="anim-res-card" style="opacity:0"><span>📄 HTML</span></div>
          <div class="anim-res-card" style="opacity:0"><span>🎨 CSS</span></div>
          <div class="anim-res-card" style="opacity:0"><span>⚡ JavaScript</span></div>
        </div>
      </div>
    `

        // Smooth transition IN
        this._fadeInScreen(screen)

        const serverIcon = screen.querySelector('.anim-server-icon')
        const cards = screen.querySelectorAll('.anim-res-card')
        const lines = screen.querySelectorAll('.anim-res-line')
        const helpBtn = screen.querySelector('#server-help')

        // Hover tooltip for help icon
        helpBtn.style.cursor = 'pointer'
        helpBtn.onclick = () => {
            this._showServerInfo(screen)
        }

        // Start blinking the help icon
        gsap.to(helpBtn, { opacity: 0.5, duration: 0.8, repeat: -1, yoyo: true, ease: 'power2.inOut', delay: 0.8 })

        // Server icon appears
        gsap.fromTo(serverIcon, { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.5, ease: 'back.out(2)' })
        await this._waitPausable(600)

        // Lines extend from server to items, staggered
        for (let i = 0; i < cards.length; i++) {
            gsap.to(lines[i], { height: 55, opacity: 0.5, duration: 0.4, ease: 'power2.out' })
            await this._waitPausable(300)
            gsap.to(cards[i], { opacity: 1, y: 0, duration: 0.3 })
            await this._waitPausable(300)
        }

        // Add pulsing animation to lines
        lines.forEach((line) => {
            gsap.to(line, { opacity: 0.8, duration: 1, repeat: -1, yoyo: true, ease: 'sine.inOut' })
        })

        // Hold for 5 seconds
        for (let elapsed = 0; elapsed < 5000; elapsed += 100) {
            while (this._infoPaused || this._userPaused) {
                await this._wait(200)
            }
            await this._wait(100)
        }

        // Lines hide first
        lines.forEach((line) => {
            gsap.killTweensOf(line)
            gsap.to(line, { height: 0, opacity: 0, duration: 0.3 })
        })
        await this._waitPausable(400)

        // Cards jump back into server
        cards.forEach((card, i) => {
            gsap.to(card, { y: -20, scale: 0.8, opacity: 0, duration: 0.3, delay: i * 0.1, ease: 'power2.in' })
        })
        await this._waitPausable(500)
    }

    /* ═══════════════════════════════════════════
       Rendering Animation
       ═══════════════════════════════════════════ */

    async _slideRender(screen, stepText) {
        // Smooth transition OUT
        await this._transitionScreen(screen)

        stepText.textContent = 'Browser: Rendering page...'
        stepText.style.color = '#10b981'

        screen.innerHTML = `
      <div class="anim-render">
        <div class="rendering-wireframe" id="wireframe">
          <div class="wf-header"></div>
          <div class="wf-nav"><span></span><span></span><span></span></div>
          <div class="wf-hero"></div>
          <div class="wf-content">
            <div class="wf-line" style="width:70%"></div>
            <div class="wf-line" style="width:90%"></div>
            <div class="wf-line" style="width:50%"></div>
          </div>
        </div>
      </div>
    `

        // Smooth transition IN
        this._fadeInScreen(screen)

        const wireframe = screen.querySelector('#wireframe')
        gsap.fromTo(wireframe, { opacity: 0 }, { opacity: 1, duration: 0.6 })

        const sections = Array.from(wireframe.children)
        sections.forEach((section, i) => {
            gsap.fromTo(section, { opacity: 0, y: -5 }, { opacity: 1, y: 0, duration: 0.3, delay: 0.4 + i * 0.25 })
        })

        await this._waitPausable(2500)

        wireframe.innerHTML = `
      <div class="wf-header"></div>
      <div class="wf-nav"><span></span><span></span><span></span></div>
      <div class="wf-hero"></div>
      <div class="wf-content">
        <div class="wf-line" style="width:70%"></div>
        <div class="wf-line" style="width:90%"></div>
        <div class="wf-line" style="width:50%"></div>
      </div>
      <div class="wf-success">Page Loaded ✓</div>
    `

        const success = wireframe.querySelector('.wf-success')
        gsap.fromTo(success, { opacity: 0, scale: 0.8 }, { opacity: 1, scale: 1, duration: 0.5 })

        await this._waitPausable(1200)

        // Show the actual website image
        wireframe.innerHTML = `
      <img src="/3ds.png" alt="3DS Website" class="wf-website-img" />
    `
        gsap.fromTo(wireframe.querySelector('.wf-website-img'), { opacity: 0, scale: 0.95 }, { opacity: 1, scale: 1, duration: 0.6, ease: 'power2.out' })

        await this._waitPausable(1000)
    }

    /* ═══════════════════════════════════════════
       Unified Pause/Wait Helpers
       ═══════════════════════════════════════════ */

    _div(c) { const d = document.createElement('div'); if (c) d.className = c; return d }
    _wait(ms) { return new Promise(r => setTimeout(r, ms)) }

    async _waitWhilePaused() {
        while (this._userPaused || this._infoPaused) {
            await this._wait(150)
        }
    }

    async _waitPausable(ms) {
        const step = 100
        for (let elapsed = 0; elapsed < ms; elapsed += step) {
            await this._waitWhilePaused()
            await this._wait(Math.min(step, ms - elapsed))
        }
    }

    _click(ctx) {
        try {
            const o = ctx.createOscillator(), g = ctx.createGain()
            o.connect(g); g.connect(ctx.destination)
            o.frequency.value = 800 + Math.random() * 400
            o.type = 'sine'
            g.gain.setValueAtTime(0.08, ctx.currentTime)
            g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05)
            o.start(ctx.currentTime); o.stop(ctx.currentTime + 0.05)
        } catch (e) { }
    }

    /* ═══════════════════════════════════════════
       Styles
       ═══════════════════════════════════════════ */

    _styles() {
        return `
      *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
      :host { display: block; font-family: 'Inter', -apple-system, sans-serif; }

      .root {
        width: 100%; max-width: 1440px;
        min-height: 100vh;
        overflow: hidden; position: relative;
        background: #0a1628;
      }
      .root::before {
        content: ''; position: absolute; inset: 0; z-index: 0;
        background: url('/bg.jpg') center/cover no-repeat;
        opacity: 0.25; pointer-events: none;
      }
      .root::after {
        content: ''; position: absolute; inset: 0; z-index: 0;
        background: rgba(8,112,211,0.25);
        pointer-events: none;
      }
      .root > * { position: relative; z-index: 1; }

      /* ─── Launch ─── */
      .launch { cursor: pointer;
        display: flex; align-items: center; justify-content: center;
        height: 100vh; padding: 40px 20px; text-align: center;
      }
      .launch-content { max-width: 520px; }
      .launch-title {
        font-size: 56px; font-weight: 800; line-height: 1.05;
        letter-spacing: -0.03em; color: white; margin: 0 0 12px;
      }
      .launch-subtitle {
        font-size: 17px; line-height: 1.5; color: rgba(255,255,255,0.6);
        margin: 0 0 6px;
      }
      .launch-desc {
        font-size: 14px; line-height: 1.6; color: rgba(255,255,255,0.4);
        margin: 0 0 36px;
      }
      .launch-btn {
        display: inline-flex; align-items: center; gap: 10px;
        padding: 14px 32px; border-radius: 28px;
        background: #0870d3; color: white; border: none;
        font-size: 15px; font-weight: 600; cursor: pointer;
        font-family: inherit; transition: all 0.3s ease;
      }
      .launch-btn:hover {
        background: #0660b5; transform: translateY(-2px);
        box-shadow: 0 8px 24px rgba(8,112,211,0.4);
      }
      .launch-btn svg { transition: transform 0.3s ease; }
      .launch-btn:hover svg { transform: translateX(3px); }
      .tag {
        padding: 4px 12px; border-radius: 12px;
        background: rgba(255,255,255,0.06); color: rgba(255,255,255,0.35);
        font-size: 11px; font-weight: 500;
      }

      /* ─── Browser Stage ─── */
      .browser-stage {
        display: flex; flex-direction: column; align-items: center;
        justify-content: center; height: 100vh; padding: 40px 20px;
      }
      .browser-window {
        width: 720px; max-width: 90%; border-radius: 12px;
        background: #1a1a2e; border: 1px solid rgba(255,255,255,0.1);
        overflow: hidden; box-shadow: 0 20px 60px rgba(0,0,0,0.4);
        transform-origin: center center;
      }
      .browser-chrome {
        display: flex; align-items: center; gap: 12px;
        padding: 10px 14px; background: rgba(255,255,255,0.03);
        border-bottom: 1px solid rgba(255,255,255,0.06);
      }
      .browser-dots { display: flex; gap: 5px; }
      .browser-dots span { width: 9px; height: 9px; border-radius: 50%; }
      .dot-r { background: #ff5f57; }
      .dot-y { background: #febc2e; }
      .dot-g { background: #28c840; }
      .browser-url {
        flex: 1; display: flex; align-items: center; gap: 8px;
        padding: 5px 10px; border-radius: 6px;
        background: rgba(255,255,255,0.06); font-size: 12px;
        color: rgba(255,255,255,0.6); font-family: 'SF Mono', Consolas, monospace;
      }
      .url-cursor { animation: blink 1s step-end infinite; }
      @keyframes blink { 50% { opacity: 0; } }
      .browser-screen {
        padding: 20px; min-height: 360px;
        background: rgba(255,255,255,0.02);
        display: flex; align-items: center; justify-content: center;
      }

      /* ─── Screen Placeholder ─── */
      .screen-placeholder { width: 100%; }
      .screen-line {
        height: 8px; background: rgba(255,255,255,0.05);
        border-radius: 4px; margin-bottom: 8px;
      }

      /* ─── Play Controls ─── */
      .play-controls {
        display: flex; justify-content: center; padding: 10px 0 0;
      }
      .ctrl-btn {
        padding: 6px 16px; border-radius: 16px;
        background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.15);
        color: white; font-size: 12px; font-weight: 500; cursor: pointer;
        transition: all 0.2s; font-family: inherit; letter-spacing: 0.03em;
      }
      .ctrl-btn:hover { background: rgba(255,255,255,0.15); border-color: rgba(255,255,255,0.3); }
      .ctrl-btn.paused { background: rgba(236,72,153,0.15); border-color: rgba(236,72,153,0.3); color: #f472b6; }

      /* ─── Step Indicator ─── */
      .step-indicator {
        position: absolute; bottom: 30px; left: 50%;
        transform: translateX(-50%); text-align: center;
      }
      .step-text {
        font-size: 14px; color: rgba(255,255,255,0.6);
        font-weight: 500; transition: color 0.3s;
      }

      /* ─── Animations ─── */
      .anim-dns, .anim-server, .anim-render {
        display: flex; flex-direction: column; align-items: center;
        gap: 12px; width: 100%; position: relative;height: 100%;
      }
      .dns-row {
        display: flex; align-items: center; gap: 10px;
      }
      .anim-dns-label, .anim-dns-ip {
        font-size: 14px; font-weight: 600; color: white;
        font-family: 'SF Mono', monospace;
      }
      .anim-dns-arrow { font-size: 16px; color: rgba(255,255,255,0.3); }
      .anim-dns-server {
        display: flex; align-items: center; gap: 8px;
        padding: 8px 16px; border-radius: 8px;
        background: rgba(99,102,241,0.15); border: 1px solid rgba(99,102,241,0.3);
        color: #6366f1; font-size: 12px; font-weight: 500;
      }

      /* Floating help icon */
      .help-icon {
        width: 22px; height: 22px; border-radius: 50%;
        background: #6366f1; color: white; font-size: 12px; font-weight: 700;
        display: flex; align-items: center; justify-content: center;
        cursor: pointer; flex-shrink: 0; transition: transform 0.2s ease;
        box-shadow: 0 0 12px rgba(99,102,241,0.4);
      }
      .help-icon:hover { transform: scale(1.15); }

      /* DNS Info Panel */
      .dns-info-panel {
        position: absolute; bottom: 12px; left: 50%; transform: translateX(-50%);
        width: 320px; max-width: 90%; padding: 20px 22px;
        background: rgba(15,23,42,0.98); border: 1px solid rgba(99,102,241,0.3);
        border-radius: 12px; box-shadow: 0 12px 40px rgba(0,0,0,0.5);
        z-index: 100; pointer-events: auto;
      }
    .server-info-panel {
        top: 20%;
        height: fit-content;
      }
      .info-panel-title {
        font-size: 14px; font-weight: 700; color: #818cf8;
        margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.05em;
      }
      .info-panel-text {
        font-size: 12px; line-height: 1.6; color: rgba(255,255,255,0.7);
        margin-bottom: 14px;
      }
      .info-panel-close {
        display: inline-flex; padding: 6px 18px; border-radius: 16px;
        background: rgba(99,102,241,0.2); border: 1px solid rgba(99,102,241,0.4);
        color: #a5b4fc; font-size: 12px; font-weight: 600; cursor: pointer;
        font-family: inherit; transition: all 0.2s;
      }
      .info-panel-close:hover {
        background: #6366f1; color: white;
      }
      .anim-server-top {
        display: flex; flex-direction: column; align-items: center; gap: 4px;
      }
      .anim-server-icon-wrap {
        position: relative; display: flex; align-items: center; justify-content: center;
      }
      .anim-server-icon {
        width: 56px; height: 56px; border-radius: 14px;
        background: rgba(236,72,153,0.15); display: flex;
        align-items: center; justify-content: center;
      }
      .anim-server-icon-wrap .help-icon {
        position: absolute; top: -6px; right: -12px;
      }
      .anim-server-label {
        font-size: 11px; color: rgba(255,255,255,0.5); font-weight: 500;
      }
      .anim-server-lines {
        display: flex; justify-content: center; gap: 20px;
        height: 60px; align-items: flex-start;
      }
      .anim-res-line {
        width: 2px; height: 0; background: rgba(236,72,153,0.4);
        border-radius: 1px; transform-origin: top center;
      }
      .line-left { transform: rotate(45deg); }
      .line-center { transform: rotate(0deg); }
      .line-right { transform: rotate(-45deg); }
      .anim-server-cards {
        display: flex; gap: 10px; justify-content: center;
      }
      .anim-res-card {
        padding: 10px 16px; border-radius: 10px;
        background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1);
        font-size: 12px; color: rgba(255,255,255,0.7); font-weight: 500;
        opacity: 0; transform: translateY(10px);
      }

      .rendering-wireframe {
        width: 100%; padding: 12px;
        background: rgba(255,255,255,0.03); border-radius: 8px;
      }
      .wf-header { height: 10px; background: rgba(255,255,255,0.08); border-radius: 3px; margin-bottom: 8px; }
      .wf-nav { display: flex; gap: 8px; margin-bottom: 10px; }
      .wf-nav span { height: 5px; width: 25px; background: rgba(255,255,255,0.05); border-radius: 2px; }
      .wf-hero { height: 30px; background: rgba(8,112,211,0.15); border-radius: 4px; margin-bottom: 10px; }
      .wf-content { margin-bottom: 10px; }
      .wf-line { height: 5px; background: rgba(255,255,255,0.06); border-radius: 2px; margin-bottom: 5px; }
      .wf-success {
        text-align: center; padding: 8px; color: #22c55e;
        font-size: 12px; font-weight: 600; margin-top: 8px;
      }
      .wf-website-img {
        width: 100%; height: auto; border-radius: 6px;
        display: block;
      }

      /* ─── Complete ─── */
      .complete-badge {
        display: inline-flex; align-items: center; gap: 6px;
        padding: 8px 20px; border-radius: 20px;
        background: rgba(34,197,94,0.15); border: 1px solid rgba(34,197,94,0.3);
        color: #22c55e; font-size: 14px; font-weight: 600;
        margin-bottom: 16px;
      }
      .restart-btn {
        display: inline-flex; align-items: center; gap: 8px;
        padding: 10px 24px; border-radius: 20px;
        background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2);
        color: white; font-size: 13px; font-weight: 600;
        cursor: pointer; font-family: inherit; transition: all 0.2s;
      }
      .restart-btn:hover {
        background: rgba(255,255,255,0.15); border-color: rgba(255,255,255,0.3);
      }

      /* ─── Responsive ─── */
      @media (max-width: 767px) {
        .root { min-height: auto; }
        .launch { cursor: pointer; height: auto; min-height: 100vh; }
        .launch-title { font-size: 36px; }
        .browser-window { width: 95%; min-height: 400px; }
        .browser-screen { padding: 16px; }
        .anim-server-cards { flex-direction: column; gap: 8px; }
        .anim-res-card { text-align: center; }
        .line-left, .line-right { display: none; }
        .anim-server-lines { gap: 0; }
      }
    `
    }
}

customElements.define('browser-journey', BrowserJourney)
