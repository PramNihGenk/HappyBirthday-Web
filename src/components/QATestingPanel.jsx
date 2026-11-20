import { useState, useEffect } from 'react'
import { PEOPLE, isBirthdayToday, getBirthdayString, verifyQAPassword } from '../data/people'
import { playGiftOpenSound, playBlowSound, triggerConfetti } from '../utils/effects'

export default function QATestingPanel({
  currentStep,
  onStepChange,
  selectedPerson,
  onPersonSelect,
  theme,
  mockDate,
  onMockDateChange,
  onReset,
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('flow') // 'flow' | 'date' | 'fx' | 'info'
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    try {
      return sessionStorage.getItem('qa_panel_auth') === 'true'
    } catch {
      return false
    }
  })
  const [authInput, setAuthInput] = useState('')
  const [authError, setAuthError] = useState(false)

  // Hotkey Alt + Q or Ctrl + Shift + Q to toggle
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.altKey && e.key.toLowerCase() === 'q') || (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'q')) {
        e.preventDefault()
        setIsOpen((prev) => !prev)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const handleAuthSubmit = (e) => {
    e.preventDefault()
    if (verifyQAPassword(authInput)) {
      setIsAuthenticated(true)
      setAuthError(false)
      try {
        sessionStorage.setItem('qa_panel_auth', 'true')
      } catch (err) {
        console.warn('SessionStorage unavailable', err)
      }
    } else {
      setAuthError(true)
    }
  }

  const handleLockSession = () => {
    setIsAuthenticated(false)
    setAuthInput('')
    try {
      sessionStorage.removeItem('qa_panel_auth')
    } catch (err) {
      console.warn('SessionStorage unavailable', err)
    }
  }

  const STEPS = [
    { id: 'select', label: '1. Select Person', icon: '👥' },
    { id: 'candle', label: '2. Blow Candle', icon: '🕯️' },
    { id: 'wishes', label: '3. Wishes & Note', icon: '💌' },
    { id: 'gift', label: '4. Gift Box', icon: '🎁' },
    { id: 'closing', label: '5. Closing Note', icon: '✉️' },
  ]

  const handleSelectPersonDirect = (person) => {
    onPersonSelect(person)
  }

  const handleSetBirthdayMatch = () => {
    if (!selectedPerson) {
      // Pick first person if none selected
      const p = PEOPLE[0]
      onPersonSelect(p)
      const yr = new Date().getFullYear()
      const m = String(p.birthday.month).padStart(2, '0')
      const d = String(p.birthday.day).padStart(2, '0')
      onMockDateChange(`${yr}-${m}-${d}`)
    } else {
      const yr = new Date().getFullYear()
      const m = String(selectedPerson.birthday.month).padStart(2, '0')
      const d = String(selectedPerson.birthday.day).padStart(2, '0')
      onMockDateChange(`${yr}-${m}-${d}`)
    }
  }

  const handleSetNonBirthday = () => {
    const yr = new Date().getFullYear()
    onMockDateChange(`${yr}-01-01`)
  }

  const handleResetDate = () => {
    onMockDateChange(null)
  }

  const isCurrentPersonBirthday = selectedPerson
    ? isBirthdayToday(selectedPerson, mockDate)
    : false

  return (
    <>
      {/* Floating Trigger Pill */}
      <button
        className="qa-floating-trigger"
        onClick={() => setIsOpen(!isOpen)}
        title="Buka Panel Pengujian QC & QA (Shortcut: Alt + Q)"
        aria-label="Toggle QC/QA Tester Panel"
      >
        <span className="qa-pulse-dot" />
        <span className="qa-trigger-label">🧪 QC & QA Tools</span>
        <span className="qa-trigger-badge">{currentStep}</span>
      </button>

      {/* QC & QA Panel Drawer Modal */}
      {isOpen && (
        <aside className="qa-panel-drawer" role="dialog" aria-label="QC and QA Testing Panel">
          <header className="qa-panel-header">
            <div className="qa-header-title">
              <span className="qa-header-icon">🛠️</span>
              <div>
                <h4>QC & QA Testing Console</h4>
                <p className="qa-header-sub">SurpriseWeb Inspection Suite</p>
              </div>
            </div>
            <button
              className="qa-btn-close"
              onClick={() => setIsOpen(false)}
              aria-label="Tutup Panel QC"
            >
              ✕
            </button>
          </header>

          {!isAuthenticated ? (
            <div className="qa-lock-screen">
              <div className="qa-lock-icon">🔐</div>
              <h5 className="qa-lock-title">Area Terproteksi QA & Dev</h5>
              <p className="qa-lock-desc">
                Konsol ini memuat simulator tanggal, teleportasi alur, dan audio inspector. Masukkan password otorisasi untuk membuka akses:
              </p>
              <form onSubmit={handleAuthSubmit} className="qa-lock-form">
                <input
                  type="password"
                  className={`qa-auth-input ${authError ? 'is-error' : ''}`}
                  placeholder="Ketik password QA..."
                  value={authInput}
                  onChange={(e) => {
                    setAuthInput(e.target.value)
                    if (authError) setAuthError(false)
                  }}
                  autoFocus
                />
                <button type="submit" className="btn-sweet-primary" style={{ padding: '0.65rem 1.4rem', width: '100%' }}>
                  <span>Buka Akses 🚀</span>
                </button>
              </form>
              {authError && (
                <p className="qa-auth-error-msg">⚠️ Password salah bray! Akses ditolak.</p>
              )}
            </div>
          ) : (
            <>
              {/* Tab Navigation */}
              <nav className="qa-tabs">
                <button
                  className={`qa-tab-btn ${activeTab === 'flow' ? 'is-active' : ''}`}
                  onClick={() => setActiveTab('flow')}
                >
                  Alur & Teman
                </button>
                <button
                  className={`qa-tab-btn ${activeTab === 'date' ? 'is-active' : ''}`}
                  onClick={() => setActiveTab('date')}
                >
                  Simulasi Tanggal
                </button>
                <button
                  className={`qa-tab-btn ${activeTab === 'fx' ? 'is-active' : ''}`}
                  onClick={() => setActiveTab('fx')}
                >
                  Audio & Efek
                </button>
                <button
                  className={`qa-tab-btn ${activeTab === 'info' ? 'is-active' : ''}`}
                  onClick={() => setActiveTab('info')}
                >
                  Status QC
                </button>
              </nav>

              <div className="qa-panel-body">
                {/* TAB 1: FLOW & PERSON */}
                {activeTab === 'flow' && (
                  <div className="qa-section">
                    <div className="qa-section-title">
                      <span>🚀 Teleportasi Tahapan (Step Jumper)</span>
                    </div>
                    <div className="qa-step-grid">
                      {STEPS.map((s) => (
                        <button
                          key={s.id}
                          className={`qa-step-btn ${currentStep === s.id ? 'is-current' : ''}`}
                          onClick={() => onStepChange(s.id)}
                        >
                          <span>{s.icon}</span>
                          <span>{s.label}</span>
                          {currentStep === s.id && <span className="qa-tag-active">AKTIF</span>}
                        </button>
                      ))}
                    </div>

                    <div className="qa-section-title" style={{ marginTop: '1.2rem' }}>
                      <span>👥 Ganti Target Sahabat (9 Orang)</span>
                    </div>
                    <p className="qa-hint-text">
                      Pilih salah satu teman untuk langsung menguji tema (Pink/Dark Cyan) & data:
                    </p>
                    <div className="qa-people-grid">
                      {PEOPLE.map((p) => {
                        const isSelected = selectedPerson?.id === p.id
                        return (
                          <button
                            key={p.id}
                            className={`qa-person-btn ${isSelected ? 'is-selected' : ''} ${p.gender}`}
                            onClick={() => handleSelectPersonDirect(p)}
                          >
                            <span className="qa-p-emoji">{p.emoji}</span>
                            <div className="qa-p-meta">
                              <strong className="qa-p-name">{p.name}</strong>
                              <span className="qa-p-info">
                                {p.gender === 'female' ? '🌸 F' : '⚡ M'} • {p.birthday.day}/{p.birthday.month}
                              </span>
                            </div>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* TAB 2: DATE SIMULATOR */}
                {activeTab === 'date' && (
                  <div className="qa-section">
                    <div className="qa-section-title">
                      <span>📅 Simulator Waktu / Tanggal Ultah</span>
                    </div>
                    <p className="qa-hint-text">
                      Gunakan simulator ini untuk menguji apakah sistem proteksi tanggal (Birthday Lock)
                      dan auto-unlock berfungsi valid tanpa harus mengubah jam komputer.
                    </p>

                    <div className="qa-date-status-box">
                      <div className="qa-status-row">
                        <span>Target Sahabat:</span>
                        <strong>{selectedPerson ? `${selectedPerson.name} (${getBirthdayString(selectedPerson)})` : 'Belum dipilih'}</strong>
                      </div>
                      <div className="qa-status-row">
                        <span>Tanggal Aktif Web:</span>
                        <strong>{mockDate || 'Tanggal Asli Sistem (Hari Ini)'}</strong>
                      </div>
                      <div className="qa-status-row">
                        <span>Status Kunci:</span>
                        <span className={`qa-status-pill ${isCurrentPersonBirthday ? 'unlocked' : 'locked'}`}>
                          {isCurrentPersonBirthday ? '🟢 TERBUKA (Hari Ulang Tahun)' : '🔒 TERKUNCI (Belum Ultah)'}
                        </span>
                      </div>
                    </div>

                    <div className="qa-quick-dates">
                      <button className="qa-btn-action" onClick={handleSetBirthdayMatch}>
                        🎉 Simulasikan Tepat Hari Ultah
                      </button>
                      <button className="qa-btn-action" onClick={handleSetNonBirthday}>
                        🔒 Simulasikan Hari Lain (Uji Kunci)
                      </button>
                      <button className="qa-btn-action secondary" onClick={handleResetDate}>
                        🔄 Reset ke Tanggal Asli
                      </button>
                    </div>

                    <div className="qa-custom-date-row">
                      <label htmlFor="qa-date-input">Pilih Tanggal Manual:</label>
                      <input
                        id="qa-date-input"
                        type="date"
                        className="qa-date-input"
                        value={mockDate || ''}
                        onChange={(e) => onMockDateChange(e.target.value || null)}
                      />
                    </div>
                  </div>
                )}

                {/* TAB 3: AUDIO & FX */}
                {activeTab === 'fx' && (
                  <div className="qa-section">
                    <div className="qa-section-title">
                      <span>🔊 Pengujian Audio & Animasi Konfeti</span>
                    </div>
                    <p className="qa-hint-text">
                      Uji instrumen Web Audio API (zero audio file dependency) dan partikel konfeti:
                    </p>

                    <div className="qa-fx-grid">
                      <button className="qa-fx-btn" onClick={playGiftOpenSound}>
                        <span className="qa-fx-icon">🎁</span>
                        <div>
                          <strong>Audio Buka Kado</strong>
                          <small>Chime Chord Melodic (C5, E5, G5, C6)</small>
                        </div>
                      </button>

                      <button className="qa-fx-btn" onClick={playBlowSound}>
                        <span className="qa-fx-icon">💨</span>
                        <div>
                          <strong>Audio Tiup Lilin</strong>
                          <small>Dynamic Lowpass Breath Whoosh</small>
                        </div>
                      </button>

                      <button className="qa-fx-btn" onClick={triggerConfetti}>
                        <span className="qa-fx-icon">🎉</span>
                        <div>
                          <strong>Letupan Konfeti DOM</strong>
                          <small>Burst 40 partikel & ikon random</small>
                        </div>
                      </button>
                    </div>
                  </div>
                )}

                {/* TAB 4: QC STATE INFO */}
                {activeTab === 'info' && (
                  <div className="qa-section">
                    <div className="qa-section-title">
                      <span>📋 State Inspector (Data Runtime)</span>
                    </div>

                    <div className="qa-inspector-card">
                      <div className="qa-inspect-row">
                        <span>Current Step:</span>
                        <code>{currentStep}</code>
                      </div>
                      <div className="qa-inspect-row">
                        <span>Selected Person:</span>
                        <code>{selectedPerson ? selectedPerson.name : 'null'}</code>
                      </div>
                      <div className="qa-inspect-row">
                        <span>Gender & Theme:</span>
                        <code>{theme} ({selectedPerson?.gender || 'default'})</code>
                      </div>
                      <div className="qa-inspect-row">
                        <span>Birthday Target:</span>
                        <code>{selectedPerson ? `${selectedPerson.birthday.day}/${selectedPerson.birthday.month}/${selectedPerson.birthYear}` : '-'}</code>
                      </div>
                      <div className="qa-inspect-row">
                        <span>Simulated Mock Date:</span>
                        <code>{mockDate || 'null (System Real)'}</code>
                      </div>
                    </div>

                    <div style={{ marginTop: '1.2rem' }}>
                      <button className="qa-btn-action reset-all" onClick={onReset}>
                        ⚠️ Reset Seluruh State Aplikasi
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <footer className="qa-panel-footer">
                <span className="qa-footer-info">Shortcut: <code>Alt + Q</code></span>
                <button className="qa-btn-lock-session" onClick={handleLockSession} title="Kunci sesi QA">
                  🔒 Kunci
                </button>
                <button className="qa-btn-hide" onClick={() => setIsOpen(false)}>
                  Sembunyikan
                </button>
              </footer>
            </>
          )}
        </aside>
      )}
    </>
  )
}
