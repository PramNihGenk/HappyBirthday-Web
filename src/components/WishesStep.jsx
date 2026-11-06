import { useState, useEffect } from 'react'

export default function WishesStep({ userName, onNext }) {
  // Text lines to be revealed text-per-text
  const lines = [
    `Hai ${userName}! 🌸`,
    `Selamat ulang tahun yaa! 🎉`,
    `Semoga panjang umur, sehat selalu, dan harimu selalu dikelilingi keceriaan.`,
    `Semoga selalu diberi kemudahan dalam segala urusan, langkah, dan hal-hal yang sedang kamu usahakan.`,
    `Dan semoga rezekinya makin melimpah, serta selalu dipertemukan dengan orang-orang baik di sekelilingmu. ✨`,
  ]

  // Track which lines have appeared (text-per-text sequence)
  const [visibleLineCount, setVisibleLineCount] = useState(1)

  useEffect(() => {
    if (visibleLineCount < lines.length) {
      const timer = setTimeout(() => {
        setVisibleLineCount((prev) => prev + 1)
      }, 700) // gentle text-per-text reveal delay
      return () => clearTimeout(timer)
    }
  }, [visibleLineCount, lines.length])

  return (
    <div className="step-card wishes-wrapper">
      <div className="card-top-badge">
        <span>💌 Surat & Doa Buat {userName}</span>
      </div>

      <div className="wishes-layout">
        {/* The Paper Letter */}
        <div className="paper-note">
          <div className="paper-pin">📌</div>

          <div className="letter-header">
            <span className="letter-date">Catatan Hari Spesial ✨</span>
            <span className="letter-tag">Untuk {userName}</span>
          </div>

          <div className="letter-content">
            {lines.slice(0, visibleLineCount).map((text, idx) => (
              <p
                key={idx}
                className={`text-fade-in ${idx === 0 ? 'greeting-line' : idx === 1 ? 'highlight-line' : 'body-line'}`}
                style={{ animationDelay: `${idx * 0.1}s` }}
              >
                {text}
              </p>
            ))}
          </div>

          <div className="letter-sign">
            <div className="sign-line" />
            <span className="sign-author">— Doa terbaik selalu 🌸</span>
          </div>
        </div>

        {/* Beautiful Flower Bouquet beside the letter */}
        <div className="bouquet-container">
          <div className="bouquet-art">
            {/* SVG Illustrated Flower Bouquet */}
            <svg
              viewBox="0 0 240 320"
              className="bouquet-svg"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Wrapping paper behind */}
              <polygon points="120,300 40,160 200,160" fill="#f5e6d3" stroke="#e0cdb5" strokeWidth="2" />
              <polygon points="120,300 20,130 120,160" fill="#edd6bd" opacity="0.9" />
              <polygon points="120,300 220,130 120,160" fill="#edd6bd" opacity="0.9" />

              {/* Foliage / Green Leaves */}
              <ellipse cx="80" cy="110" rx="14" ry="32" fill="#88b082" transform="rotate(-35 80 110)" />
              <ellipse cx="160" cy="110" rx="14" ry="32" fill="#88b082" transform="rotate(35 160 110)" />
              <ellipse cx="120" cy="90" rx="12" ry="28" fill="#719b6b" />
              <ellipse cx="100" cy="130" rx="10" ry="24" fill="#9bc295" transform="rotate(-20 100 130)" />
              <ellipse cx="140" cy="130" rx="10" ry="24" fill="#9bc295" transform="rotate(20 140 130)" />

              {/* Flower 1 - Left Tulip/Rose (Soft Pink) */}
              <g transform="translate(70, 75)">
                <ellipse cx="0" cy="0" rx="18" ry="22" fill="#f48fb1" />
                <path d="M -15,5 Q 0,-25 15,5 Z" fill="#ec407a" opacity="0.85" />
                <circle cx="0" cy="-2" r="8" fill="#f8bbd0" />
              </g>

              {/* Flower 2 - Right Rose (Warm Coral) */}
              <g transform="translate(170, 80)">
                <ellipse cx="0" cy="0" rx="19" ry="21" fill="#ff8a80" />
                <path d="M -14,6 Q 0,-24 14,6 Z" fill="#ff5252" opacity="0.85" />
                <circle cx="0" cy="-2" r="8" fill="#ffcdd2" />
              </g>

              {/* Flower 3 - Center Large Blooming Peony/Rose (Blush Cream) */}
              <g transform="translate(120, 115)">
                <circle cx="0" cy="0" r="28" fill="#fce4ec" stroke="#f8bbd0" strokeWidth="2" />
                <circle cx="-8" cy="-5" r="14" fill="#f8bbd0" opacity="0.8" />
                <circle cx="8" cy="-5" r="14" fill="#f8bbd0" opacity="0.8" />
                <circle cx="0" cy="6" r="14" fill="#f48fb1" opacity="0.9" />
                <circle cx="0" cy="0" r="7" fill="#ffe082" />
              </g>

              {/* Flower 4 - Top Center Daisy */}
              <g transform="translate(120, 48)">
                <circle cx="0" cy="0" r="14" fill="#ffffff" stroke="#f0e6d2" strokeWidth="1.5" />
                <circle cx="0" cy="0" r="6" fill="#fbc02d" />
              </g>

              {/* Flower 5 - Accent Daisy Left */}
              <g transform="translate(48, 125)">
                <circle cx="0" cy="0" r="12" fill="#ffffff" stroke="#f0e6d2" strokeWidth="1" />
                <circle cx="0" cy="0" r="5" fill="#fbc02d" />
              </g>

              {/* Flower 6 - Accent Daisy Right */}
              <g transform="translate(192, 125)">
                <circle cx="0" cy="0" r="12" fill="#ffffff" stroke="#f0e6d2" strokeWidth="1" />
                <circle cx="0" cy="0" r="5" fill="#fbc02d" />
              </g>

              {/* Ribbon Bow on wrapping */}
              <g transform="translate(120, 240)">
                <path d="M 0,-6 Q -28,-30 -35,-8 Q -30,12 0,0" fill="#f06292" />
                <path d="M 0,-6 Q 28,-30 35,-8 Q 30,12 0,0" fill="#f06292" />
                <ellipse cx="0" cy="-3" rx="7" ry="6" fill="#e91e63" />
                {/* Ribbon tails */}
                <path d="M -4,0 Q -15,35 -25,50" stroke="#e91e63" strokeWidth="4" fill="none" strokeLinecap="round" />
                <path d="M 4,0 Q 15,35 25,50" stroke="#e91e63" strokeWidth="4" fill="none" strokeLinecap="round" />
              </g>
            </svg>
          </div>
          <span className="bouquet-caption">Buket bunga virtual khusus buat kamu 💐</span>
        </div>
      </div>

      {/* Button to Next Step */}
      <div className="wishes-action">
        <button onClick={onNext} className="btn-sweet-primary">
          <span>Lanjut Tiup Lilin 🕯️</span>
        </button>
      </div>
    </div>
  )
}
