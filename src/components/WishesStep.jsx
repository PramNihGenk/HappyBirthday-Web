import { useState, useEffect } from 'react'

export default function WishesStep({ userName, person, onNext }) {
  const isMale = person?.gender === 'male'
  const displayName = person?.name || userName

  const femaleLines = [
    `Hai ${displayName}! ${person?.emoji || '🌸'}`,
    `Selamat ulang tahun yaa! 🎉`,
    `Semoga panjang umur, sehat selalu, dan harimu selalu dikelilingi keceriaan.`,
    `Semoga selalu diberi kemudahan dalam segala urusan, langkah, dan hal-hal yang sedang kamu usahakan.`,
    `Dan semoga rezekinya makin melimpah, serta selalu dipertemukan dengan orang-orang baik di sekelilingmu. ✨`,
  ]

  const maleLines = [
    `Yo ${displayName}! ${person?.emoji || '⚡'}`,
    `Selamat ulang tahun yaa bray! 🎉`,
    `Semoga panjang umur, makin sehat, solid, dan jalan sukses selalu terbuka lebar buat lu.`,
    `Semoga segala impian, target, dan apa pun yang lagi lu perjuangkan tercapai mulus.`,
    `Tetap jadi pribadi yang keren, tangguh, dan selalu dikelilingi orang-orang hebat! 🚀`,
  ]

  const lines = isMale ? maleLines : femaleLines

  const [visibleLineCount, setVisibleLineCount] = useState(1)

  useEffect(() => {
    if (visibleLineCount < lines.length) {
      const timer = setTimeout(() => {
        setVisibleLineCount((prev) => prev + 1)
      }, 700)
      return () => clearTimeout(timer)
    }
  }, [visibleLineCount, lines.length])

  return (
    <div className="step-card wishes-wrapper">
      <div className="card-top-badge">
        <span>💌 Surat & Doa Buat {displayName}</span>
      </div>

      <div className="wishes-layout">
        {/* The Paper Letter */}
        <div className="paper-note">
          <div className="paper-pin">📌</div>

          <div className="letter-header">
            <span className="letter-date">Catatan Hari Spesial ✨</span>
            <span className="letter-tag">Untuk {displayName}</span>
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
            <span className="sign-author">
              {isMale ? '— Sukses & berkah selalu ⚡' : '— Doa terbaik selalu 🌸'}
            </span>
          </div>
        </div>

        {/* Visual Gift: Bouquet for Female, Cyber Trophy for Male */}
        <div className="visual-gift-container">
          <div className="visual-gift-art">
            {!isMale ? (
              /* SVG Illustrated Flower Bouquet */
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

                {/* Flower 1 - Left Tulip/Rose */}
                <g transform="translate(70, 75)">
                  <ellipse cx="0" cy="0" rx="18" ry="22" fill="#f48fb1" />
                  <path d="M -15,5 Q 0,-25 15,5 Z" fill="#ec407a" opacity="0.85" />
                  <circle cx="0" cy="-2" r="8" fill="#f8bbd0" />
                </g>

                {/* Flower 2 - Right Rose */}
                <g transform="translate(170, 80)">
                  <ellipse cx="0" cy="0" rx="19" ry="21" fill="#ff8a80" />
                  <path d="M -14,6 Q 0,-24 14,6 Z" fill="#ff5252" opacity="0.85" />
                  <circle cx="0" cy="-2" r="8" fill="#ffcdd2" />
                </g>

                {/* Flower 3 - Center Large Blooming Peony */}
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

                {/* Ribbon Bow */}
                <g transform="translate(120, 240)">
                  <path d="M 0,-6 Q -28,-30 -35,-8 Q -30,12 0,0" fill="#f06292" />
                  <path d="M 0,-6 Q 28,-30 35,-8 Q 30,12 0,0" fill="#f06292" />
                  <ellipse cx="0" cy="-3" rx="7" ry="6" fill="#e91e63" />
                  <path d="M -4,0 Q -15,35 -25,50" stroke="#e91e63" strokeWidth="4" fill="none" strokeLinecap="round" />
                  <path d="M 4,0 Q 15,35 25,50" stroke="#e91e63" strokeWidth="4" fill="none" strokeLinecap="round" />
                </g>
              </svg>
            ) : (
              /* SVG Illustrated Artisan Golden Trophy for Male */
              <svg
                viewBox="0 0 240 320"
                className="trophy-svg"
                xmlns="http://www.w3.org/2000/svg"
              >
                <defs>
                  <linearGradient id="cyberGold" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#fff8db" />
                    <stop offset="50%" stopColor="#f5c76c" />
                    <stop offset="100%" stopColor="#dca03c" />
                  </linearGradient>
                  <linearGradient id="cyberNeon" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#88b78f" />
                    <stop offset="100%" stopColor="#47774d" />
                  </linearGradient>
                </defs>

                {/* Glowing Aura Rings with Botanical Laurel Touch */}
                <circle cx="120" cy="130" r="85" fill="none" stroke="#78af80" strokeWidth="1.5" strokeDasharray="6 6" opacity="0.4" />
                <circle cx="120" cy="130" r="105" fill="none" stroke="#f5c76c" strokeWidth="1" strokeDasharray="10 8" opacity="0.3" />

                {/* Base / Pedestal (Ivory Ceramic & Gold Trim) */}
                <polygon points="50,295 190,295 180,265 60,265" fill="#2d3a2f" stroke="#f5c76c" strokeWidth="2" />
                <polygon points="70,265 170,265 162,235 78,235" fill="#3c4e3f" stroke="#78af80" strokeWidth="1.5" />
                <rect x="85" y="272" width="70" height="15" rx="3" fill="#f5c76c" fillOpacity="0.2" stroke="#f5c76c" strokeWidth="1" />
                <text x="120" y="283" textAnchor="middle" fill="#f5c76c" fontSize="9" fontWeight="bold" letterSpacing="1">BEST BRO</text>

                {/* Stem Column */}
                <path d="M 108,235 L 114,195 L 126,195 L 132,235 Z" fill="#243026" stroke="#f5c76c" strokeWidth="1.5" />
                <circle cx="120" cy="205" r="7" fill="url(#cyberGold)" />

                {/* Handles / Botanical Laurel Curve */}
                <path d="M 68,95 C 35,95 32,155 72,175" fill="none" stroke="url(#cyberNeon)" strokeWidth="6" strokeLinecap="round" />
                <path d="M 172,95 C 205,95 208,155 168,175" fill="none" stroke="url(#cyberNeon)" strokeWidth="6" strokeLinecap="round" />

                {/* Cup Body */}
                <path d="M 65,85 L 175,85 L 160,170 C 145,200 95,200 80,170 Z" fill="url(#cyberGold)" stroke="#f7d488" strokeWidth="2" />
                <path d="M 78,92 L 162,92 L 152,160 C 140,185 100,185 88,160 Z" fill="#e5b85a" opacity="0.6" />

                {/* Center Star on Cup */}
                <g transform="translate(120, 132)">
                  <polygon points="0,-20 5,-5 20,-5 8,4 12,18 0,9 -12,18 -8,4 -20,-5 -5,-5" fill="#ffffff" />
                  <polygon points="0,-16 4,-4 16,-4 7,3 10,14 0,7 -10,14 -7,3 -16,-4 -4,-4" fill="#47774d" />
                </g>

                {/* Warm Leaf / Sparkle Accents */}
                <circle cx="50" cy="70" r="3" fill="#88b78f" />
                <circle cx="190" cy="65" r="3.5" fill="#f5c76c" />
                <circle cx="40" cy="180" r="2.5" fill="#88b78f" />
                <circle cx="200" cy="190" r="2.5" fill="#f5c76c" />
                <circle cx="120" cy="45" r="4" fill="#f5c76c" />
              </svg>
            )}
          </div>
          <span className="visual-gift-caption">
            {!isMale ? 'Buket bunga virtual khusus buat kamu 💐' : 'Trophy kehormatan khusus buat lu 🏆'}
          </span>
        </div>
      </div>

      {/* Button to Next Step */}
      <div className="wishes-action">
        <button onClick={onNext} className="btn-sweet-primary">
          <span>Buka Kado Spesial 🎁</span>
        </button>
      </div>
    </div>
  )
}
