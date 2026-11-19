import { useState } from 'react'
import { PEOPLE, isBirthdayToday, getBirthdayString, verifyQAPassword } from '../data/people'

export default function SelectPerson({ onSelectPerson, mockDate = null }) {
  const [lockedPerson, setLockedPerson] = useState(null)
  const [showPasswordInput, setShowPasswordInput] = useState(false)
  const [passwordValue, setPasswordValue] = useState('')
  const [passwordError, setPasswordError] = useState(false)

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

  const closeModal = () => {
    setLockedPerson(null)
    setShowPasswordInput(false)
    setPasswordValue('')
    setPasswordError(false)
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

  return (
    <div className="step-card select-card">
      <div className="card-top-badge">
        <span>👥 Buat Lu Pada ✨</span>
      </div>

      <div className="select-icon-box">🎂</div>

      <h2 className="select-title">Siapa yang Berulang Tahun?</h2>
      <p className="select-subtitle">
        Pilih nama kamu di bawah ini untuk membuka kejutan spesialmu!
      </p>

      <div className="people-section">
        <div className="people-grid">
          {PEOPLE.map((person) => (
            <button
              key={person.id}
              className="btn-person"
              onClick={() => handlePersonClick(person)}
            >
              <span className="person-emoji">{person.emoji}</span>
              <div className="person-info">
                <span className="person-name">{person.name}</span>
                <span className="person-birthday">{getBirthdayString(person)}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Locked Modal Overlay */}
      {lockedPerson && (
        <div className="locked-overlay" onClick={closeModal}>
          <div className="locked-modal" onClick={(e) => e.stopPropagation()}>
            <div className="locked-icon">🔒</div>
            <h3 className="locked-title">Heyy, belum waktunya!</h3>
            <p className="locked-desc">
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
                <button className="btn-locked-close" onClick={closeModal}>
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
