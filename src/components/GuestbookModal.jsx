import { useEffect, useRef } from 'react'
import GuestbookWidget from './GuestbookWidget'

export default function GuestbookModal({
  isOpen,
  onClose,
  selectedPerson,
  mockDate,
}) {
  const dialogRef = useRef(null)

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

  const handleBackdropClick = (e) => {
    if (e.target === dialogRef.current) {
      onClose()
    }
  }

  const handleCancel = (e) => {
    e.preventDefault()
    onClose()
  }

  return (
    <dialog
      ref={dialogRef}
      className="settings-dialog guestbook-dialog"
      onClick={handleBackdropClick}
      onCancel={handleCancel}
      aria-labelledby="guestbook-modal-title"
    >
      <div className="settings-modal-inner">
        <div className="settings-modal-header">
          <div className="settings-title-group">
            <span className="settings-icon">💬</span>
            <h2 id="guestbook-modal-title">Ucapan Ulang Tahun</h2>
          </div>
          <button
            type="button"
            className="settings-close-btn"
            onClick={onClose}
            aria-label="Tutup Papan Ucapan"
          >
            ✕
          </button>
        </div>

        <div className="guestbook-modal-body">
          <GuestbookWidget selectedPerson={selectedPerson} mockDate={mockDate} />
        </div>
      </div>
    </dialog>
  )
}
