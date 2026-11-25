import { useEffect, useState } from 'react'
import { triggerConfetti } from '../utils/effects'

export default function SplashScreen({ onFinish }) {
  const [fading, setFading] = useState(false)

  useEffect(() => {
    // Meletuskan confetti saat splash screen muncul
    triggerConfetti()

    const fadeTimer = setTimeout(() => {
      setFading(true)
    }, 1800)

    const doneTimer = setTimeout(() => {
      onFinish()
    }, 2300)

    return () => {
      clearTimeout(fadeTimer)
      clearTimeout(doneTimer)
    }
  }, [onFinish])

  const handleSkip = () => {
    setFading(true)
    setTimeout(onFinish, 300)
  }

  return (
    <div
      className={`splash-overlay ${fading ? 'is-fading' : ''}`}
      onClick={handleSkip}
      role="status"
      aria-label="Memuat Surprise Hub"
    >
      <div className="splash-content">
        <div className="splash-emoji">🎉</div>
        <h1 className="splash-title">Happy Birthday</h1>
        <p className="splash-subtitle">Merayakan Momen Spesial ✨</p>
        <span className="splash-hint">Ketuk di mana saja untuk masuk</span>
      </div>
    </div>
  )
}
