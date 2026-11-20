import { useEffect, useRef } from 'react'
import { triggerConfetti, toggleAmbientBGM, isBGMPlaying } from '../utils/effects'

export default function SettingsModal({
  isOpen,
  onClose,
  colorMode,
  resolvedMode,
  onSetColorMode,
  particlesEnabled,
  onToggleParticles,
  theme,
  selectedPerson,
}) {
  const dialogRef = useRef(null)

  // Handle native dialog showModal / close
  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    if (isOpen) {
      if (!dialog.open) {
        dialog.showModal()
      }
    } else {
      if (dialog.open) {
        dialog.close()
      }
    }
  }, [isOpen])

  // Native backdrop click handling
  const handleBackdropClick = (e) => {
    if (e.target === dialogRef.current) {
      onClose()
    }
  }

  // Escape key cancel event
  const handleCancel = (e) => {
    e.preventDefault()
    onClose()
  }

  const handleTestConfetti = () => {
    triggerConfetti()
  }

  const handleToggleBgm = () => {
    toggleAmbientBGM()
  }

  return (
    <dialog
      ref={dialogRef}
      className="settings-modal"
      onClick={handleBackdropClick}
      onCancel={handleCancel}
      aria-labelledby="settings-title"
    >
      <div className="settings-modal-content">
        <header className="settings-header">
          <div className="settings-title-group">
            <span className="settings-icon">⚙️</span>
            <div>
              <h3 id="settings-title" className="settings-title">Pengaturan Tampilan & Suasana</h3>
              <p className="settings-subtitle">Kustomisasi tema gelap/terang, audio, dan efek visual</p>
            </div>
          </div>
          <button
            type="button"
            className="modal-close-icon-btn"
            onClick={onClose}
            aria-label="Tutup pengaturan"
          >
            ✕
          </button>
        </header>

        <div className="settings-body">
          {/* SECTION 1: THEME & COLOR MODE */}
          <section className="settings-section">
            <h4 className="section-title">
              <span>🎨 Mode Tampilan (Theme Mode)</span>
              <span className="section-badge">
                {resolvedMode === 'dark' ? '🌙 Mode Gelap Aktif' : '☀️ Mode Terang Aktif'}
              </span>
            </h4>
            <p className="section-desc">
              Pilih apakah kamu ingin tampilan terang bernuansa bakery lembut, atau mode malam gelap yang elegan dan ramah di mata:
            </p>

            <div className="theme-mode-grid" role="radiogroup" aria-label="Pilihan Mode Tampilan">
              {/* Option 1: Light */}
              <button
                type="button"
                role="radio"
                aria-checked={colorMode === 'light'}
                className={`theme-mode-card ${colorMode === 'light' ? 'is-selected' : ''}`}
                onClick={() => onSetColorMode('light')}
              >
                <div className="mode-icon-circle light">☀️</div>
                <div className="mode-text">
                  <strong className="mode-name">Mode Terang</strong>
                  <span className="mode-sub">Pastel hangat, ceria, dan manis khas toko kue</span>
                </div>
                {colorMode === 'light' && <span className="mode-check">✔</span>}
              </button>

              {/* Option 2: Dark */}
              <button
                type="button"
                role="radio"
                aria-checked={colorMode === 'dark'}
                className={`theme-mode-card ${colorMode === 'dark' ? 'is-selected' : ''}`}
                onClick={() => onSetColorMode('dark')}
              >
                <div className="mode-icon-circle dark">🌙</div>
                <div className="mode-text">
                  <strong className="mode-name">Mode Gelap</strong>
                  <span className="mode-sub">Velvet obsidian & cocoa glow, nyaman untuk malam</span>
                </div>
                {colorMode === 'dark' && <span className="mode-check">✔</span>}
              </button>

              {/* Option 3: System */}
              <button
                type="button"
                role="radio"
                aria-checked={colorMode === 'system'}
                className={`theme-mode-card ${colorMode === 'system' ? 'is-selected' : ''}`}
                onClick={() => onSetColorMode('system')}
              >
                <div className="mode-icon-circle system">💻</div>
                <div className="mode-text">
                  <strong className="mode-name">Ikuti Sistem</strong>
                  <span className="mode-sub">Otomatis mengikuti preferensi HP / Laptop kamu</span>
                </div>
                {colorMode === 'system' && <span className="mode-check">✔</span>}
              </button>
            </div>
          </section>

          {/* SECTION 2: AUDIO AMBIENCE */}
          <section className="settings-section">
            <h4 className="section-title">
              <span>🎧 Suasana Musik & Suara</span>
            </h4>
            <div className="settings-row-toggle">
              <div className="toggle-info">
                <strong>Musik Ambient Box (Lofi Synthesizer)</strong>
                <span>Melodi manis lembut yang dimainkan dengan Web Audio synthesizer</span>
              </div>
              <button
                type="button"
                className={`btn-settings-toggle ${isBGMPlaying() ? 'is-on' : 'is-off'}`}
                onClick={handleToggleBgm}
              >
                <span>{isBGMPlaying() ? '🎵 Nyala' : '🔇 Mati'}</span>
              </button>
            </div>
          </section>

          {/* SECTION 3: VISUAL EFFECTS */}
          <section className="settings-section">
            <h4 className="section-title">
              <span>✨ Efek Visual & Animasi</span>
            </h4>
            <div className="settings-row-toggle">
              <div className="toggle-info">
                <strong>Partikel Melayang di Layar</strong>
                <span>
                  {theme === 'female'
                    ? 'Partikel bunga sakura 🌸, stroberi 🍓, dan kilauan ✨'
                    : 'Partikel daun matcha 🍃, teh hijau 🍵, dan kilauan ✨'}
                </span>
              </div>
              <button
                type="button"
                className={`btn-settings-toggle ${particlesEnabled ? 'is-on' : 'is-off'}`}
                onClick={onToggleParticles}
              >
                <span>{particlesEnabled ? 'Aktif' : 'Nonaktif'}</span>
              </button>
            </div>

            <div className="settings-row-toggle" style={{ marginTop: '0.8rem' }}>
              <div className="toggle-info">
                <strong>Uji Tembak Confetti 🎉</strong>
                <span>Tembakkan ledakan confetti perayaan ke seluruh layar</span>
              </div>
              <button
                type="button"
                className="btn-sweet-secondary"
                onClick={handleTestConfetti}
              >
                <span>Tembak Confetti! 🎊</span>
              </button>
            </div>
          </section>

          {/* CURRENT PROFILE & THEME INFO */}
          <div className="settings-info-box">
            <span className="info-icon">ℹ️</span>
            <div className="info-text">
              <strong>Tema Sahabat:</strong>{' '}
              {theme === 'female'
                ? '🌸 Strawberry Blossom & Rose Cream'
                : '🍃 Matcha Green Tea & Vanilla Pastry'}
              {selectedPerson && ` (Khusus ${selectedPerson.name} ${selectedPerson.emoji})`}
            </div>
          </div>
        </div>

        <footer className="settings-footer">
          <button
            type="button"
            className="btn-sweet-primary"
            style={{ width: '100%', padding: '0.75rem 1.4rem' }}
            onClick={onClose}
          >
            <span>Simpan & Tutup Pengaturan ✨</span>
          </button>
        </footer>
      </div>
    </dialog>
  )
}
