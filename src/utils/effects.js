/**
 * effects.js — Sweet sound effects and confetti generator
 * Uses Web Audio API for zero-dependency, reliable sounds.
 */

let audioCtx = null

function getAudioCtx() {
  if (typeof window === 'undefined') return null
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext
    if (AudioContextClass) {
      audioCtx = new AudioContextClass()
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume()
  }
  return audioCtx
}

// Gentle pleasant pop/sparkle sound for opening gift
export function playGiftOpenSound() {
  const ctx = getAudioCtx()
  if (!ctx) return
  const now = ctx.currentTime

  // Two pleasant melodic chimes (chime chord)
  const freqs = [523.25, 659.25, 783.99, 1046.50] // C5, E5, G5, C6
  freqs.forEach((freq, idx) => {
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(freq, now + idx * 0.07)
    gain.gain.setValueAtTime(0.18, now + idx * 0.07)
    gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.07 + 0.6)

    osc.connect(gain)
    gain.connect(ctx.destination)

    osc.start(now + idx * 0.07)
    osc.stop(now + idx * 0.07 + 0.6)
  })
}

// Soft breath/whoosh sound for blowing candle
export function playBlowSound() {
  const ctx = getAudioCtx()
  if (!ctx) return
  const now = ctx.currentTime

  const bufferSize = ctx.sampleRate * 0.4
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
  const data = buffer.getChannelData(0)
  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1
  }

  const noise = ctx.createBufferSource()
  noise.buffer = buffer

  const filter = ctx.createBiquadFilter()
  filter.type = 'lowpass'
  filter.frequency.setValueAtTime(350, now)
  filter.frequency.linearRampToValueAtTime(800, now + 0.15)
  filter.frequency.exponentialRampToValueAtTime(150, now + 0.4)

  const gain = ctx.createGain()
  gain.gain.setValueAtTime(0.01, now)
  gain.gain.linearRampToValueAtTime(0.25, now + 0.1)
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4)

  noise.connect(filter)
  filter.connect(gain)
  gain.connect(ctx.destination)

  noise.start(now)
  noise.stop(now + 0.4)
}

// Lightweight, vibrant confetti burst
export function triggerConfetti() {
  const colors = ['#f472b6', '#fb7185', '#fbbf24', '#a78bfa', '#34d399', '#60a5fa', '#f9a8d4']
  const icons = ['✨', '🌸', '🎉', '⭐', '🎊', '🌷']
  const count = 40

  for (let i = 0; i < count; i++) {
    setTimeout(() => {
      const el = document.createElement('div')
      el.className = 'confetti-particle'
      
      const isIcon = Math.random() > 0.45
      if (isIcon) {
        el.textContent = icons[Math.floor(Math.random() * icons.length)]
        el.style.fontSize = `${0.9 + Math.random() * 0.9}rem`
      } else {
        el.style.width = `${8 + Math.random() * 8}px`
        el.style.height = `${8 + Math.random() * 12}px`
        el.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)]
        el.style.borderRadius = Math.random() > 0.5 ? '50%' : '3px'
      }

      el.style.left = `${10 + Math.random() * 80}vw`
      el.style.top = `${20 + Math.random() * 50}vh`

      document.body.appendChild(el)
      setTimeout(() => el.remove(), 1800)
    }, i * 25)
  }
}

// ----------------------------------------------------
// Ambient Lo-fi Music Box Melody Generator
// ----------------------------------------------------
let bgmInterval = null
let bgmIsPlaying = false

export function isBGMPlaying() {
  return bgmIsPlaying
}

export function startAmbientBGM(onStateChange = null) {
  const ctx = getAudioCtx()
  if (!ctx) return false
  if (bgmIsPlaying) return true

  bgmIsPlaying = true
  if (onStateChange) onStateChange(true)

  // Calming celebratory music box pattern: C major pentatonic notes
  // C4, D4, E4, G4, A4, C5, D5, E5, G5
  const notes = [
    523.25, 659.25, 783.99, 1046.50, // C5, E5, G5, C6
    587.33, 698.46, 880.00, 1174.66, // D5, F5, A5, D6
    659.25, 783.99, 987.77, 1318.51, // E5, G5, B5, E6
    523.25, 783.99, 1046.50, 1567.98 // C5, G5, C6, G6
  ]
  let noteIdx = 0

  const playNextNote = () => {
    if (!bgmIsPlaying) return
    const freq = notes[noteIdx % notes.length]
    noteIdx++

    const now = ctx.currentTime
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.type = 'sine'
    osc.frequency.setValueAtTime(freq, now)

    // Soft music-box bell envelope
    gain.gain.setValueAtTime(0.045, now)
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.2)

    osc.connect(gain)
    gain.connect(ctx.destination)

    osc.start(now)
    osc.stop(now + 1.2)
  }

  playNextNote()
  bgmInterval = setInterval(playNextNote, 620)
  return true
}

export function stopAmbientBGM(onStateChange = null) {
  bgmIsPlaying = false
  if (bgmInterval) {
    clearInterval(bgmInterval)
    bgmInterval = null
  }
  if (onStateChange) onStateChange(false)
}

export function toggleAmbientBGM(onStateChange = null) {
  if (bgmIsPlaying) {
    stopAmbientBGM(onStateChange)
    return false
  } else {
    return startAmbientBGM(onStateChange)
  }
}

