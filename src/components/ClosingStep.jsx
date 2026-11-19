export default function ClosingStep({ userName, person, onRestart }) {
  const isMale = person?.gender === 'male'
  const displayName = person?.name || userName

  return (
    <div className="step-card closing-card">
      <div className="card-top-badge">
        <span>💌 Pesan Terakhir</span>
      </div>

      <h2 className="closing-title">Dari Pram</h2>

      <div className="closing-message-box">
        <p className="closing-main-text">
          {!isMale
            ? `“Cuma ini yang gua kasih buat kalian hehehe, gua berharap yang terbaik buat kalian yaa, Dan Sekali lagi Selamat Ulang Tahun ${displayName}!”`
            : `“Cuma ini yang gua kasih buat kalian hehehe, gua berharap yang terbaik buat kalian yaa, Dan Sekali lagi Selamat Ulang Tahun ${displayName}!”`}
        </p>
      </div>

      <p className="closing-sub">
        {!isMale
          ? 'Terima kasih yaa sudah mau buka web kecil ini. Sukses dan bahagia terus buat kamu! 🌸'
          : 'Thanks yaa udah mampir ke web kecil ini. Sukses terus, makin solid, dan gaspol bray! ⚡'}
      </p>

      {onRestart && (
        <div style={{ marginTop: '1.8rem' }}>
          <button onClick={onRestart} className="btn-sweet-primary">
            <span>🔄 Pilih Teman Lain</span>
          </button>
        </div>
      )}
    </div>
  );
}
