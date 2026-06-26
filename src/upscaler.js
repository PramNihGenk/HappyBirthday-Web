/**
 * upscaler.js — Client-side image upscaling (mobile-safe)
 * Fixes:
 *  - iOS/Safari: fallback dari createImageBitmap ke Image element
 *  - Canvas size limit: cap output agar tidak crash di mobile
 *  - Async yield antar step agar progress bar bisa update
 *  - Sharpening chunked agar tidak freeze UI
 */

/** Supported output formats */
export const FORMATS = [
  { label: 'JPG', value: 'image/jpeg', ext: 'jpg' },
  { label: 'PNG', value: 'image/png', ext: 'png' },
  { label: 'WEBP', value: 'image/webp', ext: 'webp' },
]

/** Scale presets */
export const SCALE_PRESETS = [
  { label: '2× Upscale', value: 2 },
  { label: '3× Upscale', value: 3 },
  { label: '4× Upscale (4K)', value: 4 },
]

/** Output resolution info */
export function getOutputResolution(w, h, scale) {
  const { dstW, dstH } = safeOutputSize(w, h, scale)
  return { width: dstW, height: dstH }
}

/** Format bytes to human-readable */
export function formatBytes(bytes) {
  if (!bytes || bytes === 0) return '0 B'
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB'
}

/** Get image dimensions from File — mobile-safe */
export function getImageDimensions(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      URL.revokeObjectURL(url)
      resolve({ width: img.naturalWidth, height: img.naturalHeight })
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Gagal membaca dimensi gambar'))
    }
    img.src = url
  })
}

// ─── Internal helpers ───────────────────────────────────────────────────────

/** Yield ke event loop agar React bisa render ulang progress */
const yieldToUI = () => new Promise(r => setTimeout(r, 0))

/** Clamp pixel value */
function clamp(v) { return v < 0 ? 0 : v > 255 ? 255 : v }

/**
 * Batas aman canvas per platform.
 * iOS Safari: max ~4096px per sisi, total pixel ~16M
 * Android Chrome: max ~8192px per sisi, total ~32M
 * Desktop: biasanya tidak terbatas
 */
const MAX_CANVAS_SIDE  = 8192
const MAX_CANVAS_PIXELS = 16_000_000  // aman untuk semua mobile

function safeOutputSize(srcW, srcH, scale) {
  let dstW = srcW * scale
  let dstH = srcH * scale

  // Clamp jika melebihi batas
  if (dstW > MAX_CANVAS_SIDE || dstH > MAX_CANVAS_SIDE) {
    const ratio = Math.min(MAX_CANVAS_SIDE / dstW, MAX_CANVAS_SIDE / dstH)
    dstW = Math.floor(dstW * ratio)
    dstH = Math.floor(dstH * ratio)
  }
  if (dstW * dstH > MAX_CANVAS_PIXELS) {
    const ratio = Math.sqrt(MAX_CANVAS_PIXELS / (dstW * dstH))
    dstW = Math.floor(dstW * ratio)
    dstH = Math.floor(dstH * ratio)
  }

  return { dstW, dstH }
}

/**
 * Load gambar ke HTMLImageElement (mobile-safe, no createImageBitmap)
 */
function loadImageElement(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload  = () => { URL.revokeObjectURL(url); resolve(img) }
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Gagal load gambar')) }
    img.src = url
  })
}

/**
 * Gambar ke canvas satu step, return canvas baru
 */
function drawToCanvas(source, w, h) {
  const canvas = document.createElement('canvas')
  canvas.width  = w
  canvas.height = h
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas 2D context tidak tersedia')
  ctx.imageSmoothingEnabled = true
  ctx.imageSmoothingQuality = 'high'
  ctx.drawImage(source, 0, 0, w, h)
  return canvas
}

/**
 * Multi-step upscaling dengan yield antar step
 * @param {HTMLImageElement} img
 * @param {number} targetW
 * @param {number} targetH
 * @param {Function} onStepProgress - (stepIdx, totalSteps) => void
 */
async function stepUpscale(img, targetW, targetH, onStepProgress) {
  const steps = []
  let cw = img.naturalWidth
  let ch = img.naturalHeight

  while (cw < targetW || ch < targetH) {
    const nw = Math.min(Math.ceil(cw * 1.5), targetW)
    const nh = Math.min(Math.ceil(ch * 1.5), targetH)
    steps.push({ w: nw, h: nh })
    cw = nw
    ch = nh
  }

  let current = img
  for (let i = 0; i < steps.length; i++) {
    const { w, h } = steps[i]
    current = drawToCanvas(current, w, h)
    onStepProgress?.(i + 1, steps.length)
    await yieldToUI()  // ← beri kesempatan React render progress
  }
  return current
}

/**
 * Sharpening chunked per-baris agar tidak freeze UI
 */
async function applySharpeningChunked(ctx, w, h, amount = 0.35, onProgress) {
  const src = ctx.getImageData(0, 0, w, h)
  const { data } = src
  const out = new Uint8ClampedArray(data)

  const CHUNK = 80  // baris per chunk
  const totalRows = h - 2

  for (let startY = 1; startY < h - 1; startY += CHUNK) {
    const endY = Math.min(startY + CHUNK, h - 1)

    for (let y = startY; y < endY; y++) {
      for (let x = 1; x < w - 1; x++) {
        const i = (y * w + x) * 4
        const t = ((y - 1) * w + x) * 4
        const b = ((y + 1) * w + x) * 4
        const l = (y * w + (x - 1)) * 4
        const r = (y * w + (x + 1)) * 4

        for (let c = 0; c < 3; c++) {
          const lap = 5 * data[i + c]
            - data[t + c]
            - data[b + c]
            - data[l + c]
            - data[r + c]
          out[i + c] = clamp(Math.round(data[i + c] * (1 - amount) + lap * amount))
        }
        out[i + 3] = data[i + 3]
      }
    }

    onProgress?.((endY - 1) / totalRows)
    await yieldToUI()
  }

  ctx.putImageData(new ImageData(out, w, h), 0, 0)
}

// ─── Main export ────────────────────────────────────────────────────────────

/**
 * Upscale sebuah File gambar
 * @param {File} file
 * @param {{ scale: number, format: string, quality: number, sharpen: boolean, onProgress: (pct: number, msg: string) => void }} opts
 * @returns {Promise<{ blob: Blob, width: number, height: number, url: string, capped: boolean }>}
 */
export async function upscaleImage(file, { scale, format, quality = 0.92, sharpen = true, onProgress }) {
  const report = (pct, msg) => onProgress?.(Math.round(pct), msg)

  report(5, 'Membaca gambar…')
  await yieldToUI()

  // Load gambar — mobile-safe (tidak pakai createImageBitmap)
  const img = await loadImageElement(file)
  const srcW = img.naturalWidth
  const srcH = img.naturalHeight

  report(12, 'Menghitung ukuran output…')
  await yieldToUI()

  const { dstW, dstH } = safeOutputSize(srcW, srcH, scale)
  const capped = (dstW !== srcW * scale || dstH !== srcH * scale)

  report(18, 'Mulai upscaling…')
  await yieldToUI()

  // Multi-step upscale
  const upscaled = await stepUpscale(img, dstW, dstH, (step, total) => {
    const pct = 18 + ((step / total) * 40)
    report(pct, `Upscaling step ${step}/${total}…`)
  })

  report(60, 'Menyempurnakan gambar…')
  await yieldToUI()

  // Draw ke final canvas
  const final = drawToCanvas(upscaled, dstW, dstH)
  const ctx = final.getContext('2d')

  if (sharpen) {
    report(65, 'Sharpening detail…')
    await yieldToUI()

    await applySharpeningChunked(ctx, dstW, dstH, 0.35, (ratio) => {
      report(65 + ratio * 20, 'Sharpening…')
    })
  }

  report(88, 'Encoding gambar…')
  await yieldToUI()

  // Encode ke Blob
  const blob = await new Promise((resolve, reject) => {
    try {
      final.toBlob(
        (b) => {
          if (b) resolve(b)
          else reject(new Error('Encoding gagal — format mungkin tidak didukung browser ini'))
        },
        format,
        quality,
      )
    } catch (e) {
      reject(e)
    }
  })

  report(100, 'Selesai!')
  await yieldToUI()

  return {
    blob,
    width: dstW,
    height: dstH,
    url: URL.createObjectURL(blob),
    capped,
    originalScale: scale,
  }
}
