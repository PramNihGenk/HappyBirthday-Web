import { useState } from 'react'

export default function NameStep({ onNext }) {
  const [name, setName] = useState('')
  const [error, setError] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) {
      setError(true)
      return
    }
    onNext(trimmed)
  }

  return (
    <div className="step-card name-card">
      <div className="card-top-badge">
        <span>✨ Halo ada pesan buat kamu</span>
      </div>

      <div className="name-icon-box">
        <span className="name-icon">💌</span>
      </div>

      <h1 className="name-card-title">Isi Nama Dulu</h1>
      <p className="name-card-subtitle">
        Biar pesannya lebih pas dan spesial khusus buat kamu:
      </p>

      <form onSubmit={handleSubmit} className="name-form">
        <div className="input-group">
          <input
            type="text"
            value={name}
            onChange={(e) => {
              setName(e.target.value)
              if (error) setError(false)
            }}
            placeholder="..."
            className={`name-input ${error ? 'input-error' : ''}`}
            maxLength={25}
            autoFocus
          />
          {error && <span className="error-text">Nama jangan kosong</span>}
        </div>

        <button type="submit" className="btn-sweet-primary">
          <span>Lanjut</span>
        </button>
      </form>
    </div>
  )
}
