import { useState, useCallback, useRef } from 'react'
import { useDropzone } from 'react-dropzone'
import {
  Upload, ImageUp, Download, RefreshCw, ZoomIn,
  CheckCircle2, Sparkles, ChevronDown, SlidersHorizontal, X
} from 'lucide-react'
import {
  upscaleImage, formatBytes, getImageDimensions,
  FORMATS, SCALE_PRESETS, getOutputResolution,
} from './upscaler'

/* ─── tiny helper ─────────────────────────── */
function clx(...args) {
  return args.filter(Boolean).join(' ')
}

/* ─── Stat pill ─────────────────────────────── */
function StatPill({ label, value }) {
  return (
    <div className="glass-card px-4 py-3 flex flex-col gap-0.5 min-w-0">
      <span style={{ color: 'var(--color-text-muted)', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
        {label}
      </span>
      <span style={{ color: 'var(--color-text-primary)', fontWeight: 600, fontSize: '0.9rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
        {value}
      </span>
    </div>
  )
}

/* ─── Before/After compare slider ───────────── */
function CompareSlider({ before, after }) {
  const [pos, setPos] = useState(50)
  const containerRef = useRef(null)
  const dragging = useRef(false)

  const move = useCallback((clientX) => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const pct = Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100))
    setPos(pct)
  }, [])

  const onMouseDown = (e) => { dragging.current = true; move(e.clientX) }
  const onMouseMove = (e) => { if (dragging.current) move(e.clientX) }
  const onMouseUp   = () => { dragging.current = false }
  const onTouchMove = (e) => move(e.touches[0].clientX)

  return (
    <div
      ref={containerRef}
      className="compare-container fade-in"
      style={{ touchAction: 'none' }}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseUp}
      onTouchMove={onTouchMove}
      onTouchStart={(e) => move(e.touches[0].clientX)}
    >
      {/* After (full) */}
      <img
        src={after}
        alt="After"
        style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block', maxHeight: '400px' }}
        draggable={false}
      />
      {/* Before (clipped) */}
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', width: `${pos}%` }}>
        <img
          src={before}
          alt="Before"
          style={{ width: `${10000 / pos}%`, height: '100%', objectFit: 'contain', display: 'block', maxHeight: '400px' }}
          draggable={false}
        />
      </div>
      {/* Handle */}
      <div className="compare-handle" style={{ left: `${pos}%` }}>
        <div style={{
          position: 'absolute', top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 36, height: 36, borderRadius: '50%',
          background: 'rgba(255,255,255,0.95)',
          boxShadow: '0 2px 12px rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          gap: 2,
        }}>
          <div style={{ width: 2, height: 12, background: '#555', borderRadius: 2 }} />
          <div style={{ width: 2, height: 12, background: '#555', borderRadius: 2 }} />
        </div>
      </div>
      {/* Labels */}
      <span style={{
        position: 'absolute', top: 10, left: 10,
        background: 'rgba(0,0,0,0.6)', color: '#fff',
        fontSize: '0.7rem', padding: '2px 8px', borderRadius: 99,
        fontWeight: 600, letterSpacing: '0.05em', backdropFilter: 'blur(6px)'
      }}>ORIGINAL</span>
      <span style={{
        position: 'absolute', top: 10, right: 10,
        background: 'rgba(124,156,191,0.7)', color: '#fff',
        fontSize: '0.7rem', padding: '2px 8px', borderRadius: 99,
        fontWeight: 600, letterSpacing: '0.05em', backdropFilter: 'blur(6px)'
      }}>UPSCALED</span>
    </div>
  )
}

/* ─── Main App ───────────────────────────────── */
export default function App() {
  const [file, setFile]           = useState(null)
  const [preview, setPreview]     = useState(null)
  const [dims, setDims]           = useState(null)

  const [scale, setScale]         = useState(2)
  const [format, setFormat]       = useState('image/jpeg')
  const [quality, setQuality]     = useState(92)
  const [sharpen, setSharpen]     = useState(true)

  const [processing, setProcessing] = useState(false)
  const [progress, setProgress]     = useState(0)
  const [progressMsg, setProgressMsg] = useState('')

  const [result, setResult]       = useState(null)
  const [showSettings, setShowSettings] = useState(false)

  /* ── Drop handler ── */
  const onDrop = useCallback(async (accepted) => {
    const f = accepted[0]
    if (!f) return
    setFile(f)
    setResult(null)
    const url = URL.createObjectURL(f)
    setPreview(url)
    const d = await getImageDimensions(f)
    setDims(d)
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpg', '.jpeg', '.png', '.webp', '.bmp', '.tiff', '.gif', '.avif'],
    },
    multiple: false,
    maxSize: 50 * 1024 * 1024,
  })

  /* ── Reset ── */
  const reset = () => {
    setFile(null); setPreview(null); setDims(null); setResult(null)
    setProgress(0); setProgressMsg('')
  }

  /* ── Process ── */
  const handleUpscale = async () => {
    if (!file) return
    setProcessing(true)
    setProgress(0)
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
    } catch (err) {
      console.error(err)
    } finally {
      setProcessing(false)
    }
  }

  /* ── Download ── */
  const handleDownload = () => {
    if (!result) return
    const fmt = FORMATS.find(f => f.value === format)
    const baseName = file.name.replace(/\.[^.]+$/, '')
    const link = document.createElement('a')
    link.href = result.url
    link.download = `${baseName}_${scale}x_4k.${fmt?.ext ?? 'jpg'}`
    link.click()
  }

  const outputRes = dims ? getOutputResolution(dims.width, dims.height, scale) : null

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>

      {/* ── Header ── */}
      <header style={{
        borderBottom: '1px solid var(--color-border)',
        background: 'var(--color-bg-surface)',
        backdropFilter: 'blur(12px)',
        padding: '0 1.5rem',
        height: 60,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 50,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: 'linear-gradient(135deg, var(--color-accent) 0%, var(--color-sage) 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <ZoomIn size={16} color="#0d1117" />
          </div>
          <span style={{ fontWeight: 700, fontSize: '1rem', letterSpacing: '-0.01em' }}>
            Upscale <span className="shimmer-text">4K</span>
          </span>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <span className="badge badge-blue">
            <Sparkles size={10} />
            Canvas AI
          </span>
          <span className="badge badge-green">Free & Private</span>
        </div>
      </header>

      {/* ── Hero ── */}
      <div style={{ textAlign: 'center', padding: '3.5rem 1.5rem 2rem' }}>
        <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 800, lineHeight: 1.1, marginBottom: '0.75rem', letterSpacing: '-0.03em' }}>
          Jadikan Fotomu <span className="shimmer-text">Kristal Jernih</span>
        </h1>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '1rem', maxWidth: 480, margin: '0 auto', lineHeight: 1.6 }}>
          Upload foto dalam format apapun — JPG, PNG, WEBP, BMP — lalu perbesar hingga resolusi <strong style={{ color: 'var(--color-accent-light)' }}>4K</strong> langsung di browser, tanpa upload ke server.
        </p>
      </div>

      {/* ── Main content ── */}
      <main style={{ flex: 1, maxWidth: 800, width: '100%', margin: '0 auto', padding: '0 1.5rem 4rem' }}>

        {/* ── Dropzone ── */}
        {!file && (
          <div
            {...getRootProps()}
            className={clx('dropzone-area fade-in', isDragActive && 'active')}
            style={{ padding: '4rem 2rem', textAlign: 'center' }}
          >
            <input {...getInputProps()} />
            <div style={{
              width: 64, height: 64, borderRadius: '50%',
              background: 'var(--color-accent-glow)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 1.25rem',
            }} className="pulse-ring">
              <Upload size={26} color="var(--color-accent)" />
            </div>
            <p style={{ fontSize: '1.05rem', fontWeight: 600, marginBottom: 6 }}>
              {isDragActive ? 'Lepaskan di sini…' : 'Drag & drop foto kamu'}
            </p>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
              atau klik untuk memilih file
            </p>
            <span className="badge badge-blue" style={{ margin: '0 auto' }}>
              JPG · PNG · WEBP · BMP · TIFF · GIF · AVIF · maks 50MB
            </span>
          </div>
        )}

        {/* ── File loaded state ── */}
        {file && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

            {/* Top bar */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ flex: 1, overflow: 'hidden' }}>
                <p style={{ fontWeight: 600, fontSize: '0.9rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {file.name}
                </p>
                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.78rem', marginTop: 2 }}>
                  {dims && `${dims.width} × ${dims.height}px`} · {formatBytes(file.size)}
                </p>
              </div>
              <button className="btn-ghost" onClick={reset} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <X size={14} /> Ganti
              </button>
            </div>

            {/* Stats row */}
            {dims && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }} className="fade-in">
                <StatPill label="Ukuran Awal" value={`${dims.width} × ${dims.height}`} />
                <StatPill label="Output" value={`${outputRes.width} × ${outputRes.height}`} />
                <StatPill label="Skala" value={`${scale}×`} />
              </div>
            )}

            {/* Preview + result */}
            {result ? (
              <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <CompareSlider before={preview} after={result.url} />
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  <button className="btn-primary" onClick={handleDownload} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Download size={16} /> Download Hasil
                  </button>
                  <button className="btn-ghost" onClick={() => { setResult(null); setProgress(0) }} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <RefreshCw size={14} /> Proses Ulang
                  </button>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <CheckCircle2 size={16} color="var(--color-success)" />
                  <span style={{ color: 'var(--color-success)', fontSize: '0.85rem', fontWeight: 500 }}>
                    Berhasil! {result.width} × {result.height}px · {formatBytes(result.blob.size)}
                  </span>
                </div>
              </div>
            ) : (
              <div className="glass-card fade-in" style={{ overflow: 'hidden' }}>
                <img
                  src={preview}
                  alt="Preview"
                  style={{ width: '100%', maxHeight: 320, objectFit: 'contain', background: 'var(--color-bg-base)', display: 'block' }}
                />
              </div>
            )}

            {/* Settings panel */}
            {!result && (
              <div className="glass-card fade-in" style={{ overflow: 'hidden' }}>
                <button
                  onClick={() => setShowSettings(s => !s)}
                  style={{
                    width: '100%', padding: '1rem 1.25rem',
                    background: 'none', border: 'none', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    color: 'var(--color-text-primary)',
                  }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 600, fontSize: '0.9rem' }}>
                    <SlidersHorizontal size={15} color="var(--color-accent)" />
                    Pengaturan Upscale
                  </span>
                  <ChevronDown
                    size={16}
                    color="var(--color-text-muted)"
                    style={{ transform: showSettings ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}
                  />
                </button>

                {showSettings && (
                  <div style={{ padding: '0 1.25rem 1.25rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

                    {/* Scale */}
                    <div>
                      <label style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', fontWeight: 500, marginBottom: 10, display: 'block' }}>
                        Skala Upscale
                      </label>
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        {SCALE_PRESETS.map(p => (
                          <button
                            key={p.value}
                            onClick={() => setScale(p.value)}
                            className={scale === p.value ? 'btn-primary' : 'btn-ghost'}
                            style={{ fontSize: '0.82rem', padding: '0.4rem 1rem' }}
                          >
                            {p.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Format */}
                    <div>
                      <label style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', fontWeight: 500, marginBottom: 8, display: 'block' }}>
                        Format Output
                      </label>
                      <select value={format} onChange={e => setFormat(e.target.value)}>
                        {FORMATS.map(f => (
                          <option key={f.value} value={f.value}>{f.label}</option>
                        ))}
                      </select>
                    </div>

                    {/* Quality */}
                    {format !== 'image/png' && (
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                          <label style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', fontWeight: 500 }}>
                            Kualitas
                          </label>
                          <span style={{ fontSize: '0.8rem', color: 'var(--color-accent-light)', fontWeight: 600 }}>{quality}%</span>
                        </div>
                        <input
                          type="range"
                          min={60}
                          max={100}
                          value={quality}
                          onChange={e => setQuality(Number(e.target.value))}
                        />
                      </div>
                    )}

                    {/* Sharpen toggle */}
                    <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                      <div
                        onClick={() => setSharpen(s => !s)}
                        style={{
                          width: 40, height: 22, borderRadius: 99,
                          background: sharpen ? 'var(--color-accent)' : 'var(--color-border)',
                          position: 'relative', transition: 'background 0.2s', cursor: 'pointer',
                          flexShrink: 0,
                        }}
                      >
                        <div style={{
                          position: 'absolute', top: 3, left: sharpen ? 21 : 3,
                          width: 16, height: 16, borderRadius: '50%',
                          background: '#fff', transition: 'left 0.2s',
                          boxShadow: '0 1px 4px rgba(0,0,0,0.3)',
                        }} />
                      </div>
                      <span style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
                        Sharpening (buat detail lebih tajam)
                      </span>
                    </label>
                  </div>
                )}
              </div>
            )}

            {/* Process button / progress */}
            {!result && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {processing && (
                  <div className="fade-in">
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                      <span style={{ color: 'var(--color-text-secondary)', fontSize: '0.82rem' }}>{progressMsg}</span>
                      <span style={{ color: 'var(--color-accent-light)', fontWeight: 600, fontSize: '0.82rem' }}>{progress}%</span>
                    </div>
                    <div className="progress-track">
                      <div className="progress-fill" style={{ width: `${progress}%` }} />
                    </div>
                  </div>
                )}
                <button
                  className="btn-primary"
                  onClick={handleUpscale}
                  disabled={processing}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, padding: '0.75rem 1.5rem', width: '100%' }}
                >
                  {processing ? (
                    <>
                      <RefreshCw size={16} className="spin" />
                      Memproses…
                    </>
                  ) : (
                    <>
                      <ImageUp size={17} />
                      Upscale ke {scale === 4 ? '4K' : `${scale}×`} Sekarang
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        )}

        {/* ── Feature chips ── */}
        {!file && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'center', marginTop: '2.5rem' }} className="fade-in">
            {[
              '🖼️ Multi-step Upscaling',
              '✨ Laplacian Sharpening',
              '🔒 100% Lokal — No Server',
              '📦 Export JPG / PNG / WEBP',
              '🔁 Before/After Slider',
              '⚡ Gratis & Cepat',
            ].map(f => (
              <span key={f} className="badge badge-blue" style={{ fontSize: '0.75rem', padding: '0.3rem 0.8rem' }}>
                {f}
              </span>
            ))}
          </div>
        )}
      </main>

      {/* ── Footer ── */}
      <footer style={{
        borderTop: '1px solid var(--color-border-subtle)',
        padding: '1rem 1.5rem',
        textAlign: 'center',
        color: 'var(--color-text-muted)',
        fontSize: '0.78rem',
      }}>
        Upscale 4K — Semua proses berjalan di browser kamu. Tidak ada foto yang dikirim ke server.
      </footer>
    </div>
  )
}
