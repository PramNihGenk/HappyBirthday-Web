import { useState } from 'react'
import { getBirthdayString, getAge } from '../data/people'
import {
  playGiftOpenSound,
  playBlowSound,
  triggerConfetti,
  toggleAmbientBGM,
  isBGMPlaying,
} from '../utils/effects'

const FRIENDSHIP_QUOTES = [
  {
    text: '“Persahabatan itu ibarat sepotong kue hangat dan secangkir teh: manis, menenangkan, dan selalu bikin rindu untuk pulang.”',
    author: 'Pram',
  },
  {
    text: '“Semoga hidupmu selalu mekar seindah bunga musim semi, dipenuhi cinta yang tulus dan tawa tanpa henti.”',
    author: 'Birthday Wish 🌸',
  },
  {
    text: '“Circle hangat, saling rangkul dari nol, berbagi manisnya keberhasilan dan saling kuatkan saat lelah.”',
    author: 'Warm Sahabat Motto 🍃',
  },
  {
    text: '“Hari ini semesta tersenyum merayakan hadirmu di dunia. Nikmati kuenya dan rayakan setiap harapan baikmu!”',
    author: 'Sweet Moments ✨',
  },
  {
    text: '“Sahabat sejati bukan yang sempurna, tapi yang selalu ada dengan secangkir kehangatan dan doa terbaik.”',
    author: 'Sahabat Sejati 🤍',
  },
]

export default function DashboardSidebarRight({
  selectedPerson,
  currentStep,
  mockDate,
  resolvedMode = 'light',
  onToggleColorMode,
  onOpenSettings,
}) {
  const [quoteIndex, setQuoteIndex] = useState(0)
  const [bgmActive, setBgmActive] = useState(isBGMPlaying())
  const [sfxFeedback, setSfxFeedback] = useState('')

  const handleNextQuote = () => {
    setQuoteIndex((prev) => (prev + 1) % FRIENDSHIP_QUOTES.length)
  }

  const handlePlayChime = () => {
    playGiftOpenSound()
    setSfxFeedback('🔔 Chime dibunyikan!')
    setTimeout(() => setSfxFeedback(''), 1500)
  }

  const handlePlayBlow = () => {
    playBlowSound()
    setSfxFeedback('💨 Angin tiup lilin!')
    setTimeout(() => setSfxFeedback(''), 1500)
  }

  const handlePlayConfetti = () => {
    triggerConfetti()
    setSfxFeedback('🎉 Confetti meledak!')
    setTimeout(() => setSfxFeedback(''), 1500)
  }

  const handleToggleBgm = () => {
    const active = toggleAmbientBGM(setBgmActive)
    setBgmActive(active)
  }

  const currentQuote = FRIENDSHIP_QUOTES[quoteIndex]

  const stepNames = {
    select: 'Menentukan Sahabat',
    gift: 'Membuka Kado',
    wishes: 'Membaca Surat Doa',
    candle: 'Meniup Lilin Ulang Tahun',
    closing: 'Pesan Terakhir dari Pram',
  }

  return (
    <aside className="dashboard-sidebar sidebar-right">
      {/* Widget 1: Celebrant Profile Spotlight or Guide */}
      <div className="dash-card profile-spotlight-card">
        <div className="card-mini-header">
          <span className="mini-icon">👑</span>
          <span className="mini-title">Profil Perayaan</span>
        </div>

        {selectedPerson ? (
          <div className="active-profile-view">
            <div className="profile-hero">
              <div className="profile-avatar-frame">
                <span className="profile-emoji">{selectedPerson.emoji}</span>
              </div>
              <div className="profile-meta">
                <h4 className="profile-name">{selectedPerson.name}</h4>
                <span className="profile-tag">
                  {selectedPerson.gender === 'female' ? '🌸 Strawberry Blossom' : '🍃 Matcha & Vanilla'}
                </span>
              </div>
            </div>

            <div className="profile-data-table">
              <div className="profile-row">
                <span className="row-label">Ulang Tahun</span>
                <span className="row-value">{getBirthdayString(selectedPerson)}</span>
              </div>
              <div className="profile-row">
                <span className="row-label">Usia Tahun Ini</span>
                <span className="row-value">
                  {getAge(selectedPerson, mockDate)} Tahun
                </span>
              </div>
              <div className="profile-row">
                <span className="row-label">Tahap Aktif</span>
                <span className="row-value highlight-stage">
                  {stepNames[currentStep]}
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="idle-profile-view">
            <div className="idle-icon">🎁</div>
            <p className="idle-title">Belum Ada Teman Dipilih</p>
            <p className="idle-desc">
              Pilih nama temanmu di panggung tengah untuk melihat detail profil, usia, serta alur perayaannya!
            </p>
          </div>
        )}
      </div>

      {/* Widget 2: Ambience & SFX Console */}
      <div className="dash-card audio-console-card">
        <div className="card-mini-header">
          <span className="mini-icon">🎧</span>
          <span className="mini-title">Sound & Ambience Console</span>
        </div>

        {/* Ambient BGM Bar */}
        <div className="bgm-player-row">
          <div className="bgm-info">
            <span className="bgm-label">Music Box Synthesizer</span>
            <span className="bgm-status">
              {bgmActive ? 'Sedang Memutar Melodi 🎶' : 'Sedang Dijeda ⏸'}
            </span>
          </div>
          <button
            type="button"
            className={`btn-bgm-toggle ${bgmActive ? 'is-active' : ''}`}
            onClick={handleToggleBgm}
          >
            {bgmActive ? 'Matikan 🔇' : 'Putar 🎵'}
          </button>
        </div>

        {/* Theme Mode Quick Selector Row */}
        <div className="bgm-player-row" style={{ marginTop: '0.6rem' }}>
          <div className="bgm-info">
            <span className="bgm-label">Mode Tampilan</span>
            <span className="bgm-status">
              {resolvedMode === 'dark' ? '🌙 Gelap (Malam)' : '☀️ Terang (Pastel)'}
            </span>
          </div>
          <div style={{ display: 'flex', gap: '0.35rem', alignItems: 'center' }}>
            <button
              type="button"
              className="btn-bgm-toggle"
              onClick={onToggleColorMode}
              title={`Ganti ke mode ${resolvedMode === 'dark' ? 'terang ☀️' : 'gelap 🌙'}`}
            >
              {resolvedMode === 'dark' ? '☀️ Terang' : '🌙 Gelap'}
            </button>
            <button
              type="button"
              className="btn-bgm-toggle"
              style={{ padding: '0.35rem 0.6rem' }}
              onClick={onOpenSettings}
              title="Buka Pengaturan Lengkap"
              aria-label="Pengaturan"
            >
              ⚙️
            </button>
          </div>
        </div>

        {/* SFX Quick Trigger Pills */}
        <div className="sfx-buttons-group">
          <span className="sfx-label">Efek Suara Interaktif:</span>
          <div className="sfx-grid">
            <button
              type="button"
              className="btn-sfx-pill"
              onClick={handlePlayChime}
              title="Mainkan suara denting kado"
            >
              🔔 Chime
            </button>
            <button
              type="button"
              className="btn-sfx-pill"
              onClick={handlePlayBlow}
              title="Mainkan desau tiup lilin"
            >
              💨 Lilin
            </button>
            <button
              type="button"
              className="btn-sfx-pill"
              onClick={handlePlayConfetti}
              title="Tembakkan partikel confetti"
            >
              🎉 Confetti
            </button>
          </div>
          {sfxFeedback && <span className="sfx-toast">{sfxFeedback}</span>}
        </div>
      </div>

      {/* Widget 3: Friendship Vault Quotes */}
      <div className="dash-card quotes-vault-card">
        <div className="card-mini-header">
          <span className="mini-icon">💬</span>
          <span className="mini-title">Circle Quotes & Vibes</span>
          <button
            type="button"
            className="btn-shuffle-quote"
            onClick={handleNextQuote}
            title="Ganti Kutipan Inspiratif"
          >
            🔄 Ganti
          </button>
        </div>

        <blockquote className="quote-body">
          <p className="quote-text">{currentQuote.text}</p>
          <footer className="quote-author">— {currentQuote.author}</footer>
        </blockquote>
      </div>

      {/* Widget 4: Creator Signature */}
      <div className="dash-card creator-note-card">
        <div className="creator-flex">
          <span className="creator-heart">💖</span>
          <div className="creator-text">
            <strong>Dibuat oleh Pram</strong>
            <span>Surprise Web 2026</span>
          </div>
        </div>
      </div>
    </aside>
  )
}
