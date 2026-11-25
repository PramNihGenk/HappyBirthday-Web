import { useState, useEffect, useRef } from 'react'
import { triggerConfetti, toggleAmbientBGM, isBGMPlaying } from '../utils/effects'

export default function DashboardNavbar({
  currentStep,
  stepIndex,
  steps,
  theme,
  selectedPerson,
  mockDate,
  onReset,
  onStepChange,
  maxUnlockedIndex = 0,
  resolvedMode = 'light',
  onToggleColorMode,
  onOpenSettings,
  onOpenGuestbook,
}) {
  const [currentTime, setCurrentTime] = useState(new Date())
  const [bgmActive, setBgmActive] = useState(isBGMPlaying())
  const [confettiBlasts, setConfettiBlasts] = useState(0)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const menuRef = useRef(null)

  // Close dropdown on outside click or Escape
  useEffect(() => {
    if (!isMenuOpen) return
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setIsMenuOpen(false)
      }
    }
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setIsMenuOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isMenuOpen])

  // Live real-time clock
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const handleConfetti = () => {
    triggerConfetti()
    setConfettiBlasts((prev) => prev + 1)
  }

  const handleToggleBgm = () => {
    const active = toggleAmbientBGM(setBgmActive)
    setBgmActive(active)
  }

  // Format real or mock date
  const displayDate = mockDate ? new Date(mockDate) : currentTime
  const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']
  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
    'Jul', 'Agt', 'Sep', 'Okt', 'Nov', 'Des'
  ]
  const dayName = days[displayDate.getDay()]
  const dateNum = displayDate.getDate()
  const monthName = months[displayDate.getMonth()]
  const yearNum = displayDate.getFullYear()
  const hours = String(currentTime.getHours()).padStart(2, '0')
  const minutes = String(currentTime.getMinutes()).padStart(2, '0')
  const seconds = String(currentTime.getSeconds()).padStart(2, '0')

  const stepLabels = {
    select: '1. Teman',
    candle: '2. Tiup Lilin',
    wishes: '3. Doa & Harapan',
    gift: '4. Kado Spesial',
    closing: '5. Pesan Pram',
  }

  return (
    <header className="dashboard-navbar">
      <div className="navbar-left">
        <div className="brand-badge">
          <span className="brand-dot-pulse" aria-hidden="true" />
          <span className="brand-icon">✨</span>
          <div className="brand-text">
            <span className="brand-title">SURPRISE HUB</span>
            <span className="brand-subtitle">
              {selectedPerson ? `Khusus Buat ${selectedPerson.name} ${selectedPerson.emoji}` : 'Dashboard'}
            </span>
          </div>
        </div>

        {/* Live Clock & Date Badge */}
        <div className="nav-clock-badge" title="Waktu Nyata Sistem">
          <span className="clock-icon">🕒</span>
          <span className="clock-date">
            {dayName}, {dateNum} {monthName} {yearNum}
          </span>
          <span className="clock-divider">•</span>
          <span className="clock-time">
            {hours}:{minutes}:{seconds} WIB
          </span>
          {mockDate && (
            <span className="mock-tag" title="Tanggal simulasi aktif">
              [Mock Date]
            </span>
          )}
        </div>
      </div>

      {/* Stepper Breadcrumbs in Navbar */}
      <nav className="navbar-stepper" aria-label="Tahapan Perayaan">
        {steps.map((s, idx) => {
          const isActive = idx === stepIndex
          const isDone = idx < stepIndex
          const isUnlocked = idx <= maxUnlockedIndex

          if (isUnlocked) {
            return (
              <button
                key={s}
                type="button"
                className={`nav-step-chip ${isActive ? 'is-active' : ''} ${isDone ? 'is-done' : ''}`}
                onClick={() => onStepChange && onStepChange(s)}
                title={`Beralih ke tahap ${stepLabels[s]}`}
              >
                <span className="step-chip-number">{idx + 1}</span>
                <span className="step-chip-text">{stepLabels[s]}</span>
              </button>
            )
          }

          return (
            <div
              key={s}
              className="nav-step-chip is-locked"
              title={`Tahap ${stepLabels[s]} terkunci. Selesaikan tahap sebelumnya untuk membuka.`}
            >
              <span className="step-chip-number" style={{ opacity: 0.6 }}>🔒</span>
              <span className="step-chip-text">{stepLabels[s]}</span>
            </div>
          )
        })}
      </nav>

      {/* Action Controls */}
      <div className="navbar-actions">
        {/* Quick Dark / Light Mode Toggle Button */}
        <button
          type="button"
          onClick={onToggleColorMode}
          className="nav-action-btn theme-mode-btn"
          title={`Ganti ke mode ${resolvedMode === 'dark' ? 'terang ☀️' : 'gelap 🌙'}`}
          aria-label={`Beralih ke mode ${resolvedMode === 'dark' ? 'terang' : 'gelap'}`}
        >
          <span className="nav-btn-icon">
            {resolvedMode === 'dark' ? '☀️' : '🌙'}
          </span>
          <span className="nav-btn-label">
            {resolvedMode === 'dark' ? 'Terang' : 'Gelap'}
          </span>
        </button>

        {/* Theme Indicator */}
        <div className="nav-theme-badge" title={`Tema Aktif: ${theme === 'female' ? 'Strawberry Blossom Cake' : 'Matcha & Vanilla Pastry'}`}>
          <span className="theme-dot" />
          <span className="theme-text">
            {theme === 'female' ? '🌸 Strawberry Cake' : '🍃 Matcha Pastry'}
          </span>
        </div>

        {/* Home/Reset button if progressed */}
        {currentStep !== 'select' && (
          <button
            type="button"
            onClick={onReset}
            className="nav-action-btn reset-btn"
            title="Kembali ke Menu Utama / Pilih Teman"
          >
            <span>🔄 Menu</span>
          </button>
        )}

        {/* Dropdown Menu (Music, Confetti, Pengaturan, Ucapan) */}
        <div className="nav-dropdown-wrapper" ref={menuRef}>
          <button
            type="button"
            className={`nav-action-btn nav-dropdown-trigger ${isMenuOpen ? 'is-open' : ''}`}
            onClick={() => setIsMenuOpen((prev) => !prev)}
            aria-expanded={isMenuOpen}
            aria-haspopup="menu"
            title="Menu Aksi & Ucapan"
          >
            <span className="nav-btn-icon">☰</span>
            <span className="nav-btn-label">Menu</span>
            <span className="nav-dropdown-chevron" aria-hidden="true">▾</span>
          </button>

          {isMenuOpen && (
            <div className="nav-dropdown-menu" role="menu">
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  handleToggleBgm()
                }}
                className={`nav-dropdown-item ${bgmActive ? 'is-active' : ''}`}
              >
                <span className="nav-btn-icon">{bgmActive ? '🎵' : '🔇'}</span>
                <span className="nav-dropdown-label">
                  {bgmActive ? 'Music On' : 'Music Off'}
                </span>
                {bgmActive && (
                  <span className="equalizer-bars" aria-hidden="true">
                    <span className="bar b1" />
                    <span className="bar b2" />
                    <span className="bar b3" />
                  </span>
                )}
              </button>

              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  handleConfetti()
                }}
                className="nav-dropdown-item"
              >
                <span className="nav-btn-icon">🎉</span>
                <span className="nav-dropdown-label">Confetti</span>
                {confettiBlasts > 0 && (
                  <span className="blast-counter">{confettiBlasts}</span>
                )}
              </button>

              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setIsMenuOpen(false)
                  onOpenGuestbook && onOpenGuestbook()
                }}
                className="nav-dropdown-item"
              >
                <span className="nav-btn-icon">💬</span>
                <span className="nav-dropdown-label">Ucapan Ulang Tahun</span>
              </button>

              <div className="nav-dropdown-divider" />

              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setIsMenuOpen(false)
                  onOpenSettings && onOpenSettings()
                }}
                className="nav-dropdown-item"
              >
                <span className="nav-btn-icon">⚙️</span>
                <span className="nav-dropdown-label">Pengaturan</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
