import { useState } from 'react'
import { playGiftOpenSound, triggerConfetti } from '../utils/effects'

export default function GiftStep({ userName, onOpen }) {
  const [isOpening, setIsOpening] = useState(false)

  const handleOpenGift = () => {
    if (isOpening) return
    setIsOpening(true)
    playGiftOpenSound()
    triggerConfetti()

    // Smooth delay so user can enjoy the opening animation & confetti
    setTimeout(() => {
      onOpen()
    }, 1200)
  }

  return (
    <div className="step-card gift-card">
      <div className="card-top-badge">
        <span>🎁 Khusus Buat {userName}</span>
      </div>

      <h2 className="gift-title">Ada kado kecil untukmu!</h2>
      <p className="gift-subtitle">
        Coba klik atau ketuk kadonya di bawah ini buat membukanya yaa:
      </p>

      {/* Interactive Gift Box */}
      <div
        className={`gift-box-wrapper ${isOpening ? 'is-open' : 'is-idle'}`}
        onClick={handleOpenGift}
        role="button"
        tabIndex={0}
      >
        {/* Glow behind the gift */}
        <div className="gift-glow" />

        {/* Gift Box Lid */}
        <div className="gift-lid">
          <div className="gift-bow">
            <span className="bow-knot" />
            <span className="bow-loop left" />
            <span className="bow-loop right" />
          </div>
          <div className="lid-body" />
          <div className="lid-ribbon" />
        </div>

        {/* Gift Box Body */}
        <div className="gift-container">
          <div className="box-ribbon-vertical" />
          <div className="box-ribbon-horizontal" />
          <div className="sparkle-hint">✨ Klik Aku! ✨</div>
        </div>
      </div>

      <button
        onClick={handleOpenGift}
        disabled={isOpening}
        className="btn-sweet-primary"
      >
        <span>{isOpening ? 'Membuka Kado... 🎉' : 'Buka Kadonya 🎀'}</span>
      </button>
    </div>
  )
}
