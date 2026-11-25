import { useState, useEffect } from 'react'
import { PEOPLE, isBirthdayToday } from '../data/people'
import { fetchWishes, createWish, isSupabaseConfigured } from '../lib/supabase'

export default function GuestbookWidget({ selectedPerson, mockDate }) {
  const todayCelebrant = PEOPLE.find((p) => isBirthdayToday(p, mockDate))
  const [fallbackPersonId, setFallbackPersonId] = useState(
    () => todayCelebrant?.id || PEOPLE[0].id
  )

  const activePerson =
    selectedPerson || PEOPLE.find((p) => p.id === Number(fallbackPersonId)) || PEOPLE[0]

  const [wishes, setWishes] = useState([])
  const [loadingWishes, setLoadingWishes] = useState(false)
  const [senderName, setSenderName] = useState('')
  const [messageText, setMessageText] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [wishError, setWishError] = useState('')
  const [hasSent, setHasSent] = useState(false)

  useEffect(() => {
    try {
      const sent = localStorage.getItem(`wish_sent_${activePerson?.id}`) === 'true'
      setHasSent(sent)
    } catch {
      setHasSent(false)
    }
  }, [activePerson?.id])

  useEffect(() => {
    if (!activePerson?.id || !isSupabaseConfigured) return
    let cancelled = false
    setLoadingWishes(true)
    setWishError('')
    fetchWishes(activePerson.id)
      .then((data) => {
        if (!cancelled) setWishes(data)
      })
      .catch((err) => {
        if (!cancelled) {
          console.error('Gagal memuat ucapan:', err)
          setWishError('Gagal memuat ucapan.')
        }
      })
      .finally(() => {
        if (!cancelled) setLoadingWishes(false)
      })
    return () => {
      cancelled = true
    }
  }, [activePerson?.id])

  const handleSubmitWish = async (e) => {
    e.preventDefault()
    const cleanName = senderName.trim()
    const cleanMsg = messageText.trim()
    if (!cleanName || !cleanMsg) {
      setWishError('Nama dan ucapan tidak boleh kosong ya!')
      return
    }

    setSubmitting(true)
    setWishError('')
    try {
      const inserted = await createWish({
        recipientId: activePerson.id,
        senderName: cleanName,
        message: cleanMsg,
      })
      setWishes((prev) => [inserted, ...prev])
      setMessageText('')
      setHasSent(true)
      try {
        localStorage.setItem(`wish_sent_${activePerson.id}`, 'true')
      } catch {
        // ignore storage errors
      }
    } catch (err) {
      console.error('Gagal mengirim ucapan:', err)
      setWishError('Gagal mengirim ucapan. Coba lagi ya!')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="dash-card guestbook-sidebar-card">
      <div className="card-mini-header">
        <span className="mini-icon">💬</span>
        <span className="mini-title">Papan Ucapan ({wishes.length})</span>
      </div>

      {!selectedPerson && (
        <div className="guestbook-target-select">
          <label htmlFor="guestbook-recipient">Untuk:</label>
          <select
            id="guestbook-recipient"
            className="guestbook-select"
            value={activePerson.id}
            onChange={(e) => setFallbackPersonId(Number(e.target.value))}
          >
            {PEOPLE.map((p) => (
              <option key={p.id} value={p.id}>
                {p.emoji} {p.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {selectedPerson && (
        <p className="card-hint-text" style={{ marginBottom: '0.6rem' }}>
          Ucapan untuk <strong>{activePerson.name} {activePerson.emoji}</strong>:
        </p>
      )}

      {hasSent ? (
        <p className="guestbook-empty" style={{ marginBottom: '0.85rem' }}>
          ✅ Kamu sudah mengirim ucapan untuk {activePerson.name}. Terima kasih! 💌
        </p>
      ) : (
        <form className="guestbook-form" onSubmit={handleSubmitWish}>
          <div className="guestbook-inputs">
            <input
              type="text"
              className="guestbook-input"
              placeholder="Nama kamu..."
              maxLength={60}
              value={senderName}
              onChange={(e) => setSenderName(e.target.value)}
              disabled={submitting}
            />
            <textarea
              className="guestbook-textarea"
              placeholder={`Tulis ucapan buat ${activePerson.name}...`}
              maxLength={500}
              rows={2}
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              disabled={submitting}
            />
          </div>
          {wishError && <p className="guestbook-error">{wishError}</p>}
          <button
            type="submit"
            className="guestbook-submit"
            disabled={submitting || !senderName.trim() || !messageText.trim()}
          >
            {submitting ? 'Mengirim...' : 'Kirim Ucapan 💌'}
          </button>
        </form>
      )}

      <div className="guestbook-list">
        {loadingWishes ? (
          <p className="guestbook-empty">Memuat ucapan...</p>
        ) : wishes.length === 0 ? (
          <p className="guestbook-empty">
            Belum ada ucapan buat {activePerson.name}. Yuk jadi yang pertama! ✨
          </p>
        ) : (
          wishes.map((w) => (
            <div key={w.id} className="guestbook-item">
              <div className="guestbook-item-header">
                <strong className="guestbook-sender">{w.sender_name}</strong>
                <span className="guestbook-time">
                  {new Date(w.created_at).toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
              <p className="guestbook-message">{w.message}</p>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
