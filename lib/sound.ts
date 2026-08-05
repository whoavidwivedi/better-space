// Zero-dependency browser Web Audio API synthesizer for tactile UI feedback

class SoundEngine {
  private ctx: AudioContext | null = null
  private enabled: boolean = false

  private getContext(): AudioContext | null {
    if (typeof window === "undefined") return null
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      if (AudioCtx) {
        this.ctx = new AudioCtx()
      }
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume()
    }
    return this.ctx
  }

  public isEnabled(): boolean {
    return this.enabled
  }

  public toggle(): boolean {
    this.enabled = !this.enabled
    return this.enabled
  }

  public setEnabled(value: boolean) {
    this.enabled = value
  }

  // Subtle click/tap on buttons (Emil Kowalski tactile tap)
  public playClick(freq = 440, duration = 0.03) {
    if (!this.enabled) return
    try {
      const ctx = this.getContext()
      if (!ctx) return
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()

      osc.type = "sine"
      osc.frequency.setValueAtTime(freq, ctx.currentTime)
      osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + duration)

      gain.gain.setValueAtTime(0.06, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration)

      osc.connect(gain)
      gain.connect(ctx.destination)

      osc.start()
      osc.stop(ctx.currentTime + duration)
    } catch {
      // AudioContext failure gracefully ignored
    }
  }

  // Character select pop
  public playPop(freq = 600) {
    if (!this.enabled) return
    try {
      const ctx = this.getContext()
      if (!ctx) return
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()

      osc.type = "triangle"
      osc.frequency.setValueAtTime(freq, ctx.currentTime)
      osc.frequency.exponentialRampToValueAtTime(freq * 1.5, ctx.currentTime + 0.06)

      gain.gain.setValueAtTime(0.08, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08)

      osc.connect(gain)
      gain.connect(ctx.destination)

      osc.start()
      osc.stop(ctx.currentTime + 0.08)
    } catch {}
  }

  // Ink stamp / Claim sound
  public playStamp() {
    if (!this.enabled) return
    try {
      const ctx = this.getContext()
      if (!ctx) return
      const now = ctx.currentTime
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()

      osc.type = "sine"
      osc.frequency.setValueAtTime(220, now)
      osc.frequency.exponentialRampToValueAtTime(60, now + 0.1)

      gain.gain.setValueAtTime(0.12, now)
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12)

      osc.connect(gain)
      gain.connect(ctx.destination)

      osc.start(now)
      osc.stop(now + 0.12)
    } catch {}
  }

  // Soundboard note generator
  public playTone(freq: number, type: OscillatorType = "sine", duration = 0.25) {
    if (!this.enabled) return
    try {
      const ctx = this.getContext()
      if (!ctx) return
      const now = ctx.currentTime
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()

      osc.type = type
      osc.frequency.setValueAtTime(freq, now)

      gain.gain.setValueAtTime(0.08, now)
      gain.gain.exponentialRampToValueAtTime(0.001, now + duration)

      osc.connect(gain)
      gain.connect(ctx.destination)

      osc.start(now)
      osc.stop(now + duration)
    } catch {}
  }

  // Mic toggle chime (on or off)
  public playMicToggle(active: boolean) {
    if (!this.enabled) return
    try {
      const ctx = this.getContext()
      if (!ctx) return
      const now = ctx.currentTime
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()

      osc.type = "sine"
      if (active) {
        osc.frequency.setValueAtTime(440, now)
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.09)
      } else {
        osc.frequency.setValueAtTime(660, now)
        osc.frequency.exponentialRampToValueAtTime(330, now + 0.09)
      }

      gain.gain.setValueAtTime(0.07, now)
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1)

      osc.connect(gain)
      gain.connect(ctx.destination)

      osc.start(now)
      osc.stop(now + 0.1)
    } catch {}
  }

  // Emoji reaction blip
  public playReaction(emoji: string) {
    if (!this.enabled) return
    try {
      const ctx = this.getContext()
      if (!ctx) return
      const now = ctx.currentTime
      const osc1 = ctx.createOscillator()
      const osc2 = ctx.createOscillator()
      const gain = ctx.createGain()

      let f1 = 523.25 // C5
      let f2 = 659.25 // E5

      if (emoji.includes("🔥")) {
        f1 = 440
        f2 = 880
      } else if (emoji.includes("✨") || emoji.includes("🎉")) {
        f1 = 587.33
        f2 = 1174.66
      } else if (emoji.includes("❤️")) {
        f1 = 392
        f2 = 587.33
      } else if (emoji.includes("🎙️")) {
        f1 = 349.23
        f2 = 698.46
      }

      osc1.type = "sine"
      osc2.type = "triangle"
      osc1.frequency.setValueAtTime(f1, now)
      osc2.frequency.setValueAtTime(f2, now)

      gain.gain.setValueAtTime(0.06, now)
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16)

      osc1.connect(gain)
      osc2.connect(gain)
      gain.connect(ctx.destination)

      osc1.start(now)
      osc2.start(now)
      osc1.stop(now + 0.16)
      osc2.stop(now + 0.16)
    } catch {}
  }
}

export const sound = new SoundEngine()
