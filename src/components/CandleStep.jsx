import { useState } from 'react'
import { playBlowSound, triggerConfetti } from '../utils/effects'

export default function CandleStep({ userName, onNext }) {
  const [isBlown, setIsBlown] = useState(false)

  const handleBlowCandle = () => {
    if (isBlown) return
    setIsBlown(true)
    playBlowSound()
    triggerConfetti()
  }

  return (
    <div className="step-card candle-card">
      <div className="card-top-badge">
        <span>🕯️ Momen Tiup Lilin</span>
      </div>

      <h2 className="candle-title">Waktunya Tiup Lilin! 🎂</h2>
      <p className="candle-subtitle">
        {!isBlown
          ? 'Pejamkan mata, buat satu harapan baik dalam hatimu, lalu klik tombol atau kuenya untuk meniup lilinnya:'
          : 'Horeee! Harapanmu sudah ditiupkan ke semesta ✨'}
      </p>

      {/* Interactive Birthday Cake */}
      <div
        className="cake-stage"
        onClick={handleBlowCandle}
        role="button"
        tabIndex={0}
      >
        <div className="cake-plate">
          <div className="plate-rim" />
        </div>

        <div className="cake-body">
          {/* Top cream frosting & drips */}
          <div className="cake-frosting-top">
            <span className="frosting-cherry">🍒</span>
          </div>

          {/* Candle & Flame */}
          <div className="candle-stick">
            <div className="candle-wick" />

            {!isBlown ? (
              <div className="candle-flame">
                <div className="flame-inner" />
                <div className="flame-glow" />
              </div>
            ) : (
              <div className="smoke-container">
                <div className="smoke-wisp wisp-1" />
                <div className="smoke-wisp wisp-2" />
                <div className="smoke-wisp wisp-3" />
              </div>
            )}
          </div>

          {/* Cake Layers */}
          <div className="cake-layer bottom" />
          <div className="cake-layer top" />
        </div>
      </div>

      {/* Birthday Celebration Banner when Blown */}
      {isBlown && (
        <div className="celebration-banner-box">
          <h1 className="celebration-title">
            🎉 Happy Birthday {userName}! 
          </h1>
          <p className="celebration-desc">
            Semoga hari ulang tahun ini menjadi awal dari babak baru yang penuh tawa,
            kesehatan yang prima, dan kejutan-kejutan membahagiakan buat kamu! 🌸
          </p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="candle-actions">
        {!isBlown ? (
          <button onClick={handleBlowCandle} className="btn-sweet-primary">
            <span>💨 Tiup Lilin Sekarang</span>
          </button>
        ) : (
          <button onClick={onNext} className="btn-sweet-primary">
            <span>Buka Dari Gua ✉</span>
          </button>
        )}
      </div>
    </div>
  )
}
