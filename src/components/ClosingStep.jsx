export default function ClosingStep({ userName, onRestart }) {
  return (
    <div className="step-card closing-card">
      <div className="card-top-badge">
        <span>💌 Pesan Terakhir</span>
      </div>

      <h2 className="closing-title">Dari Pram</h2>

      <div className="closing-message-box">
        <p className="closing-main-text">
          &ldquo;Cuma ini yang gua kasih buat lu {userName} hehehe, gua berharap
          yang terbaik buat lu yaa, Dan Sekali lagi Selamat Ulang Tahun{" "}
          {userName}&rdquo;
        </p>
      </div>

      <p className="closing-sub">
        Terima kasih yaa sudah mau buka web kecil ini. Sukses dan bahagia terus
        buat kamu! 🌸
      </p>
    </div>
  );
}
