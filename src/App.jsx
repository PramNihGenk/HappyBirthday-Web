import { useState, useCallback, useRef } from 'react'
import { useDropzone } from 'react-dropzone'
import {
  Upload, ImageUp, Download, RefreshCw, ZoomIn,
  CheckCircle2, Sparkles, ChevronDown, SlidersHorizontal,
  X, AlertCircle, ArrowLeft, FileImage, Maximize2,
} from 'lucide-react'
import {
  upscaleImage, formatBytes, getImageDimensions,
  FORMATS, SCALE_PRESETS, getOutputResolution,
} from './upscaler'

/* ─── Helpers ── */
function clx(...a) { return a.filter(Boolean).join(' ') }

/* ─── Processing Overlay (fullscreen) ── */
function ProcessingOverlay({ progress, message, fileName }) {
  const radius   = 54
  const circ     = 2 * Math.PI * radius
  const offset   = circ - (progress / 100) * circ

  return (
    <div className="processing-overlay">
      {/* Circular progress */}
      <div style={{ position: 'relative', width: 140, height: 140, marginBottom: '1.5rem' }}>
        <svg width="140" height="140" style={{ transform: 'rotate(-90deg)' }}>
          {/* Track */}
          <circle cx="70" cy="70" r={radius} fill="none"
            stroke="var(--color-border)" strokeWidth="6" />
          {/* Fill */}
          <circle cx="70" cy="70" r={radius} fill="none"
            stroke="url(#progressGrad)" strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={circ}
            strokeDashoffset={offset}
            style={{ transition: 'stroke-dashoffset 0.35s ease' }}
          />
          <defs>
            <linearGradient id="progressGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%"   stopColor="var(--color-accent)" />
              <stop offset="100%" stopColor="var(--color-sage)" />
            </linearGradient>
          </defs>
        </svg>
        {/* Percentage label */}
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
        }}>
          <span style={{ fontSize: '1.6rem', fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1 }}>
            {progress}
          </span>
          <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: 2 }}>%</span>
        </div>
      </div>

      {/* Linear progress bar */}
      <div style={{ width: '100%', maxWidth: 320, marginBottom: '1rem' }}>
        <div className="progress-track" style={{ height: 8 }}>
          <div className="progress-fill-animated" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <p style={{ fontWeight: 600, fontSize: '1rem', marginBottom: 4, textAlign: 'center' }}>
        {message || 'Memproses gambar…'}
      </p>
      {fileName && (
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem', textAlign: 'center', maxWidth: 260,
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {fileName}
        </p>
      )}
      <p style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem', marginTop: '1.25rem', textAlign: 'center' }}>
        ⏳ Mohon jangan tutup halaman ini
      </p>
    </div>
  )
}

/* ─── Download Result Page ── */
function DownloadPage({ result, file, scale, format, dims, onBack, onRedo }) {
  const fmt = FORMATS.find(f => f.value === format)
  const baseName = file.name.replace(/\.[^.]+$/, '')
  const fileName = `${baseName}_${scale}x_4k.${fmt?.ext ?? 'jpg'}`

  const handleDownload = () => {
    const link = document.createElement('a')
    link.href    = result.url
    link.download = fileName
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="download-page" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

      {/* Back + breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <button className="btn-ghost" onClick={onBack}
          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '0.4rem 0.9rem' }}>
          <ArrowLeft size={14} /> Kembali
        </button>
        <span style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>
          Hasil Upscaling
        </span>
      </div>

      {/* Success banner */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        background: 'rgba(63,185,80,0.08)',
        border: '1px solid rgba(63,185,80,0.25)',
        borderRadius: 'var(--radius-md)',
        padding: '0.75rem 1rem',
      }}>
        <CheckCircle2 size={18} color="var(--color-success)" className="check-pop" style={{ flexShrink: 0 }} />
        <div>
          <p style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--color-success)' }}>
            Upscaling Berhasil!
          </p>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.78rem', marginTop: 2 }}>
            Foto kamu sudah siap diunduh
          </p>
        </div>
      </div>

      {/* Result image with compare */}
      <div className="download-hero-img">
        <img
          src={result.url}
          alt="Hasil upscale"
          style={{ width: '100%', display: 'block', maxHeight: 420, objectFit: 'contain',
            background: 'var(--color-bg-base)' }}
        />
      </div>

      {/* Stats card */}
      <div className="download-card">
        <p style={{ fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.75rem',
          color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Detail Hasil
        </p>
        <div className="stat-row">
          <span>Resolusi Output</span>
          <span>{result.width} × {result.height} px</span>
        </div>
        <div className="stat-row">
          <span>Ukuran File</span>
          <span>{formatBytes(result.blob?.size)}</span>
        </div>
        <div className="stat-row">
          <span>Format</span>
          <span>{fmt?.label ?? format}</span>
        </div>
        <div className="stat-row">
          <span>Skala</span>
          <span>{scale}×{result.capped ? ' (dikurangi, ada batas mobile)' : ''}</span>
        </div>
        <div className="stat-row">
          <span>Resolusi Awal</span>
          <span>{dims?.width} × {dims?.height} px</span>
        </div>
        <div className="stat-row">
          <span>Nama File</span>
          <span style={{ maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', textAlign: 'right' }}>
            {fileName}
          </span>
        </div>
      </div>

      {/* Action buttons */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <button className="btn-download" onClick={handleDownload}>
          <Download size={20} />
          Download Foto ({formatBytes(result.blob?.size)})
        </button>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn-ghost" onClick={onRedo}
            style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
            <RefreshCw size={14} /> Proses Ulang
          </button>
          <button className="btn-ghost" onClick={onBack}
            style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
            <FileImage size={14} /> Foto Baru
          </button>
        </div>
      </div>

      {/* Privacy note */}
      <p style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem', textAlign: 'center' }}>
        🔒 Foto tidak pernah dikirim ke server. Semua diproses di perangkatmu.
      </p>
    </div>
  )
}

/* ─── Stat Pill ── */
function StatPill({ label, value }) {
  return (
    <div className="glass-card" style={{ padding: '0.75rem 1rem', display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0 }}>
      <span style={{ color: 'var(--color-text-muted)', fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
        {label}
      </span>
      <span style={{ color: 'var(--color-text-primary)', fontWeight: 600, fontSize: '0.85rem',
        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
        {value}
      </span>
    </div>
  )
}

/* ─── Main App ── */
export default function App() {
  /* File state */
  const [file, setFile]       = useState(null)
  const [preview, setPreview] = useState(null)
  const [dims, setDims]       = useState(null)

  /* Settings */
  const [scale, setScale]       = useState(2)
  const [format, setFormat]     = useState('image/jpeg')
  const [quality, setQuality]   = useState(92)
  const [sharpen, setSharpen]   = useState(true)
  const [showSettings, setShowSettings] = useState(false)

  /* Processing state */
  const [processing, setProcessing]     = useState(false)
  const [progress, setProgress]         = useState(0)
  const [progressMsg, setProgressMsg]   = useState('')
  const [error, setError]               = useState(null)

  /* Result / page */
  const [result, setResult]   = useState(null)
  const [page, setPage]       = useState('upload') // 'upload' | 'download'

  /* ── Dropzone ── */
  const onDrop = useCallback(async (accepted, rejected) => {
    if (rejected?.length > 0) {
      setError('Format tidak didukung atau file terlalu besar (maks 50MB)')
      return
    }
    const f = accepted[0]
    if (!f) return

    setError(null)
    setResult(null)
    setPage('upload')
    setFile(f)

    const url = URL.createObjectURL(f)
    setPreview(url)

    try {
      const d = await getImageDimensions(f)
      setDims(d)
    } catch {
      setError('Gagal membaca dimensi gambar. Coba file lain.')
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg':  ['.jpg', '.jpeg'],
      'image/png':   ['.png'],
      'image/webp':  ['.webp'],
      'image/bmp':   ['.bmp'],
      'image/tiff':  ['.tiff', '.tif'],
      'image/gif':   ['.gif'],
      'image/avif':  ['.avif'],
      'image/heic':  ['.heic'],
      'image/heif':  ['.heif'],
    },
    multiple: false,
    maxSize: 50 * 1024 * 1024,
  })

  /* ── Reset ── */
  const reset = () => {
    setFile(null); setPreview(null); setDims(null)
    setResult(null); setError(null)
    setProgress(0); setProgressMsg('')
    setPage('upload')
  }

  /* ── Upscale ── */
  const handleUpscale = async () => {
    if (!file) return
    setProcessing(true)
    setProgress(0)
    setProgressMsg('Memulai…')
    setError(null)
    setResult(null)

    try {
      const res = await upscaleImage(file, {
        scale,
        format,
        quality: quality / 100,
        sharpen,
        onProgress: (pct, msg) => {
          setProgress(pct)
          setProgressMsg(msg)
        },
      })
      setResult(res)
      setPage('download')
    } catch (err) {
      console.error(err)
      setError(err?.message ?? 'Terjadi kesalahan saat memproses gambar.')
    } finally {
      setProcessing(false)
    }
  }

  const outputRes = dims ? getOutputResolution(dims.width, dims.height, scale) : null

  /* ─── Render ── */
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>

      {/* Fullscreen processing overlay */}
      {processing && (
        <ProcessingOverlay
          progress={progress}
          message={progressMsg}
          fileName={file?.name}
        />
      )}

      {/* ── Header ── */}
      <header style={{
        borderBottom: '1px solid var(--color-border)',
        background: 'var(--color-bg-surface)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        padding: '0 1.25rem',
        height: 58,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 50,
      }}>
        <button
          onClick={reset}
          style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
        >
          <div style={{
            width: 30, height: 30, borderRadius: 8,
            background: 'linear-gradient(135deg, var(--color-accent) 0%, var(--color-sage) 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <ZoomIn size={15} color="#0d1117" />
          </div>
          <span style={{ fontWeight: 700, fontSize: '0.95rem', letterSpacing: '-0.01em', color: 'var(--color-text-primary)' }}>
            Upscale <span className="shimmer-text">4K</span>
          </span>
        </button>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <span className="badge badge-blue">
            <Sparkles size={9} />
            AI Canvas
          </span>
          <span className="badge badge-green" style={{ display: 'none' }}>
            Free
          </span>
        </div>
      </header>

      {/* ── Main ── */}
      <main style={{ flex: 1, maxWidth: 720, width: '100%', margin: '0 auto', padding: '0 1rem 5rem' }}>

        {/* ── DOWNLOAD PAGE ── */}
        {page === 'download' && result && (
          <div style={{ paddingTop: '1.5rem' }}>
            <DownloadPage
              result={result}
              file={file}
              scale={scale}
              format={format}
              dims={dims}
              onBack={reset}
              onRedo={() => { setResult(null); setPage('upload') }}
            />
          </div>
        )}

        {/* ── UPLOAD / SETTINGS PAGE ── */}
        {page === 'upload' && (
          <>
            {/* Hero — only when no file */}
            {!file && (
              <div style={{ textAlign: 'center', padding: '2.5rem 1rem 1.75rem' }}>
                <h1 style={{
                  fontSize: 'clamp(1.75rem, 6vw, 2.8rem)',
                  fontWeight: 800, lineHeight: 1.1,
                  marginBottom: '0.75rem', letterSpacing: '-0.03em',
                }}>
                  Jadikan Fotomu<br /><span className="shimmer-text">Kristal Jernih</span>
                </h1>
                <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.95rem',
                  maxWidth: 420, margin: '0 auto', lineHeight: 1.6 }}>
                  Upload foto dalam format apapun, perbesar hingga <strong style={{ color: 'var(--color-accent-light)' }}>4K</strong> langsung
                  di browser — tanpa server, 100% gratis.
                </p>
              </div>
            )}

            {/* Dropzone */}
            {!file && (
              <div
                {...getRootProps()}
                className={clx('dropzone-area fade-in', isDragActive && 'active')}
                style={{ padding: '3rem 1.5rem', textAlign: 'center' }}
              >
                <input {...getInputProps()} />
                <div style={{
                  width: 60, height: 60, borderRadius: '50%',
                  background: 'var(--color-accent-glow)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 1.1rem',
                }} className="pulse-ring">
                  <Upload size={24} color="var(--color-accent)" />
                </div>
                <p style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 5 }}>
                  {isDragActive ? 'Lepaskan di sini…' : 'Tap atau drag foto di sini'}
                </p>
                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.82rem', marginBottom: '1.25rem' }}>
                  Klik area ini untuk memilih dari galeri / file manager
                </p>
                <span className="badge badge-blue">
                  JPG · PNG · WEBP · BMP · TIFF · GIF · AVIF · maks 50MB
                </span>
              </div>
            )}

            {/* Error box */}
            {error && (
              <div className="error-box fade-in" style={{ marginTop: file ? 0 : '1rem' }}>
                <AlertCircle size={16} style={{ flexShrink: 0, marginTop: 1 }} />
                <span>{error}</span>
              </div>
            )}

            {/* File loaded */}
            {file && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', paddingTop: '1.25rem' }}>

                {/* File info bar */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontWeight: 600, fontSize: '0.875rem',
                      whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {file.name}
                    </p>
                    <p style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem', marginTop: 2 }}>
                      {dims && `${dims.width} × ${dims.height} px`} · {formatBytes(file.size)}
                    </p>
                  </div>
                  <button className="btn-ghost" onClick={reset}
                    style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '0.4rem 0.9rem', flexShrink: 0 }}>
                    <X size={13} /> Ganti
                  </button>
                </div>

                {/* Stats row */}
                {dims && outputRes && (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }} className="fade-in">
                    <StatPill label="Awal"   value={`${dims.width}×${dims.height}`} />
                    <StatPill label="Output" value={`${outputRes.width}×${outputRes.height}`} />
                    <StatPill label="Skala"  value={`${scale}×`} />
                  </div>
                )}

                {/* Preview */}
                <div className="glass-card fade-in" style={{ overflow: 'hidden' }}>
                  <img
                    src={preview}
                    alt="Preview"
                    style={{ width: '100%', maxHeight: 300, objectFit: 'contain',
                      background: 'var(--color-bg-base)', display: 'block' }}
                  />
                </div>

                {/* Settings panel */}
                <div className="glass-card fade-in" style={{ overflow: 'hidden' }}>
                  <button
                    onClick={() => setShowSettings(s => !s)}
                    style={{ width: '100%', padding: '0.875rem 1.1rem', background: 'none',
                      border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center',
                      justifyContent: 'space-between', color: 'var(--color-text-primary)' }}
                  >
                    <span style={{ display: 'flex', alignItems: 'center', gap: 7, fontWeight: 600, fontSize: '0.875rem' }}>
                      <SlidersHorizontal size={14} color="var(--color-accent)" />
                      Pengaturan Upscale
                    </span>
                    <ChevronDown size={15} color="var(--color-text-muted)"
                      style={{ transform: showSettings ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                  </button>

                  {showSettings && (
                    <div style={{ padding: '0 1.1rem 1.1rem', display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>

                      {/* Scale presets */}
                      <div>
                        <label style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)',
                          fontWeight: 500, marginBottom: 8, display: 'block' }}>
                          Skala Upscale
                        </label>
                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                          {SCALE_PRESETS.map(p => (
                            <button key={p.value}
                              onClick={() => setScale(p.value)}
                              className={scale === p.value ? 'btn-primary' : 'btn-ghost'}
                              style={{ fontSize: '0.8rem', padding: '0.4rem 0.9rem' }}>
                              {p.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Format */}
                      <div>
                        <label style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)',
                          fontWeight: 500, marginBottom: 7, display: 'block' }}>
                          Format Output
                        </label>
                        <select value={format} onChange={e => setFormat(e.target.value)} style={{ width: '100%' }}>
                          {FORMATS.map(f => (
                            <option key={f.value} value={f.value}>{f.label}</option>
                          ))}
                        </select>
                      </div>

                      {/* Quality */}
                      {format !== 'image/png' && (
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                            <label style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)', fontWeight: 500 }}>
                              Kualitas
                            </label>
                            <span style={{ fontSize: '0.8rem', color: 'var(--color-accent-light)', fontWeight: 600 }}>
                              {quality}%
                            </span>
                          </div>
                          <input type="range" min={60} max={100} value={quality}
                            onChange={e => setQuality(Number(e.target.value))} />
                        </div>
                      )}

                      {/* Sharpen toggle */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}
                        onClick={() => setSharpen(s => !s)}>
                        <div style={{
                          width: 40, height: 22, borderRadius: 99,
                          background: sharpen ? 'var(--color-accent)' : 'var(--color-border)',
                          position: 'relative', transition: 'background 0.2s', flexShrink: 0,
                        }}>
                          <div style={{
                            position: 'absolute', top: 3, left: sharpen ? 21 : 3,
                            width: 16, height: 16, borderRadius: '50%',
                            background: '#fff', transition: 'left 0.2s',
                            boxShadow: '0 1px 4px rgba(0,0,0,0.3)',
                          }} />
                        </div>
                        <span style={{ fontSize: '0.83rem', color: 'var(--color-text-secondary)' }}>
                          Sharpening otomatis
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Error (processing error) */}
                {error && (
                  <div className="error-box fade-in">
                    <AlertCircle size={16} style={{ flexShrink: 0, marginTop: 1 }} />
                    <span>{error}</span>
                  </div>
                )}

                {/* Upscale button */}
                <button
                  className="btn-primary fade-in"
                  onClick={handleUpscale}
                  disabled={processing}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center',
                    gap: 10, padding: '0.875rem 1.5rem', width: '100%',
                    fontSize: '1rem', borderRadius: '0.75rem' }}
                >
                  <ImageUp size={18} />
                  Upscale ke {scale === 4 ? '4K' : `${scale}×`} Sekarang
                </button>
              </div>
            )}

            {/* Feature chips (no file) */}
            {!file && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center', marginTop: '2rem' }}
                className="fade-in">
                {[
                  '🖼️ Multi-step Upscaling',
                  '✨ Sharpening Otomatis',
                  '🔒 100% Lokal — No Server',
                  '📦 JPG / PNG / WEBP',
                  '📱 Works on Mobile',
                  '⚡ Gratis & Cepat',
                ].map(f => (
                  <span key={f} className="badge badge-blue"
                    style={{ fontSize: '0.73rem', padding: '0.28rem 0.7rem' }}>
                    {f}
                  </span>
                ))}
              </div>
            )}
          </>
        )}
      </main>

      {/* ── Footer ── */}
      <footer style={{
        borderTop: '1px solid var(--color-border-subtle)',
        padding: '0.875rem 1.5rem',
        textAlign: 'center',
        color: 'var(--color-text-muted)',
        fontSize: '0.75rem',
      }}>
        Upscale 4K — Semua proses berjalan di perangkatmu. Tidak ada foto dikirim ke server.
      </footer>
    </div>
  )
}
