import { useState, useId, useEffect } from 'react'
import { PEOPLE, isBirthdayToday, getBirthdayString, verifyQAPassword } from '../data/people'

export default function SelectPerson({ onSelectPerson, mockDate = null }) {
  const [lockedPerson, setLockedPerson] = useState(null)
  const [showPasswordInput, setShowPasswordInput] = useState(false)
  const [passwordValue, setPasswordValue] = useState('')
  const [passwordError, setPasswordError] = useState(false)
  const [filterGender, setFilterGender] = useState('all') // 'all' | 'female' | 'male' | 'month'
  const [searchQuery, setSearchQuery] = useState('')

  const titleId = useId()
  const descId = useId()

  const closeModal = () => {
    setLockedPerson(null)
    setShowPasswordInput(false)
    setPasswordValue('')
    setPasswordError(false)
  }

  // Handle ESC key to close modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && lockedPerson) {
        closeModal()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [lockedPerson])

  const handlePersonClick = (person) => {
    if (isBirthdayToday(person, mockDate)) {
      onSelectPerson(person)
    } else {
      setLockedPerson(person)
      setShowPasswordInput(false)
      setPasswordValue('')
      setPasswordError(false)
    }
  }

  const handlePreviewSubmit = (e) => {
    e.preventDefault()
    if (verifyQAPassword(passwordValue)) {
      const personToOpen = lockedPerson
      closeModal()
      onSelectPerson(personToOpen)
    } else {
      setPasswordError(true)
    }
  }

  const targetDate = mockDate ? new Date(mockDate) : new Date()
  const currentMonthNum = targetDate.getMonth() + 1

  // Filter people list
  const filteredPeople = PEOPLE.filter((p) => {
    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      const matchName = p.name.toLowerCase().includes(q)
      const matchBday = getBirthdayString(p).toLowerCase().includes(q)
      if (!matchName && !matchBday) return false
    }

    // Category filter
    if (filterGender === 'female') return p.gender === 'female'
    if (filterGender === 'male') return p.gender === 'male'
    if (filterGender === 'month') return p.birthday.month === currentMonthNum
    return true
  })

  return (
    <div className="step-card select-card">
      <div className="card-top-badge">
        <span>👥 FEYEPE BIRTHDAY WEB ✨</span>
      </div>

      <div className="select-icon-box">🎂</div>

      <h2 className="select-title">Siapa yang Berulang Tahun?</h2>
      <p className="select-subtitle">
        Pilih nama kamu di bawah ini untuk membuka kejutan interaktif & animasi spesialmu!
      </p>

      {/* Modern Filter & Search Controls */}
      <div className="select-toolbar">
        <div className="select-search-wrap">
          <span className="search-icon" aria-hidden="true">🔍</span>
          <input
            type="search"
            className="select-search-input"
            placeholder="Cari nama teman..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Cari ..."
          />
          {searchQuery && (
            <button
              type="button"
              className="search-clear-btn"
              onClick={() => setSearchQuery('')}
              aria-label="Hapus pencarian"
            >
              ✕
            </button>
          )}
        </div>

        <div className="select-filter-pills" role="radiogroup" aria-label="Filter Sahabat">
          <button
            type="button"
            className={`filter-pill ${filterGender === 'all' ? 'is-active' : ''}`}
            onClick={() => setFilterGender('all')}
          >
            Semua ({PEOPLE.length})
          </button>
          <button
            type="button"
            className={`filter-pill ${filterGender === 'female' ? 'is-active' : ''}`}
            onClick={() => setFilterGender('female')}
          >
            🌸 Cewek
          </button>
          <button
            type="button"
            className={`filter-pill ${filterGender === 'male' ? 'is-active' : ''}`}
            onClick={() => setFilterGender('male')}
          >
            ⚡ Cowok
          </button>
          <button
            type="button"
            className={`filter-pill ${filterGender === 'month' ? 'is-active' : ''}`}
            onClick={() => setFilterGender('month')}
          >
            🎂 Bulan Ini
          </button>
        </div>
      </div>

      <div className="people-section">
        <div className="people-grid">
          {filteredPeople.map((person) => {
            const isToday = isBirthdayToday(person, mockDate)
            return (
              <button
                key={person.id}
                className={`btn-person ${isToday ? 'is-birthday-today' : ''}`}
                onClick={() => handlePersonClick(person)}
                title={`${person.name} — ${getBirthdayString(person)}`}
              >
                <div className="person-avatar-wrap">
                  <span className="person-emoji">{person.emoji}</span>
                  {isToday && (
                    <span className="today-badge-chip">🎉 HARI INI!</span>
                  )}
                </div>
                <div className="person-info">
                  <span className="person-name">{person.name}</span>
                  <span className="person-birthday">{getBirthdayString(person)}</span>
                </div>
                <div className="person-action-indicator">
                  {isToday ? '🔓 Buka' : '🔒'}
                </div>
              </button>
            )
          })}
        </div>
        {filteredPeople.length === 0 && (
          <div className="empty-search-state">
            <span>🔎</span>
            <p>Tidak ada yang cocok dengan pencarian.</p>
            <button
              type="button"
              className="btn-sweet-secondary"
              onClick={() => {
                setSearchQuery('')
                setFilterGender('all')
              }}
            >
              Reset Filter
            </button>
          </div>
        )}
      </div>

      {/* Locked Modal Overlay using Accessible Dialog Semantics */}
      {lockedPerson && (
        <div className="locked-overlay" onClick={closeModal}>
          <div
            className="locked-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            aria-describedby={descId}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="modal-close-icon-btn"
              onClick={closeModal}
              aria-label="Tutup popup"
            >
              ✕
            </button>

            <div className="locked-icon" aria-hidden="true">🔒</div>
            <h3 id={titleId} className="locked-title">Heyy, belum waktunya!</h3>
            <p id={descId} className="locked-desc">
              Web ini khusus untuk <strong>{lockedPerson.name}</strong> dan hanya bisa dibuka di tanggal <strong>{getBirthdayString(lockedPerson)}</strong> lho!
            </p>
            <p className="locked-hint">Sabar yaa, tandai kalendermu! 📅</p>

            {showPasswordInput ? (
              <form onSubmit={handlePreviewSubmit} className="qa-auth-box">
                <label className="qa-auth-label">Masukkan Password Dev / QA:</label>
                <div className="qa-auth-input-group">
                  <input
                    type="password"
                    className={`qa-auth-input ${passwordError ? 'is-error' : ''}`}
                    placeholder="Ketik password..."
                    value={passwordValue}
                    onChange={(e) => {
                      setPasswordValue(e.target.value)
                      if (passwordError) setPasswordError(false)
                    }}
                    autoFocus
                  />
                  <button type="submit" className="btn-sweet-primary" style={{ padding: '0.65rem 1.4rem' }}>
                    <span>Buka 🔓</span>
                  </button>
                </div>
                {passwordError && (
                  <p className="qa-auth-error-msg">⚠️ Password salah bray! Akses preview ditolak.</p>
                )}
                <button
                  type="button"
                  className="qa-auth-cancel"
                  onClick={() => setShowPasswordInput(false)}
                >
                  Batal
                </button>
              </form>
            ) : (
              <div className="locked-actions">
                <button className="btn-locked-close" onClick={closeModal} autoFocus>
                  Oke, Mengerti! ✨
                </button>
                <button className="btn-locked-preview" onClick={() => setShowPasswordInput(true)}>
                  Intip Mode Preview (Locked 🔑)
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
