/**
 * upscaler.js — Client-side image upscaling using Canvas API
 * Supports Lanczos-like sharpening + multi-step upscaling for best quality
 */

/**
 * Supported output formats
 */
export const FORMATS = [
  { label: 'JPG', value: 'image/jpeg', ext: 'jpg' },
  { label: 'PNG', value: 'image/png', ext: 'png' },
  { label: 'WEBP', value: 'image/webp', ext: 'webp' },
]

/**
 * Scale presets
 */
export const SCALE_PRESETS = [
  { label: '2× Upscale', value: 2 },
  { label: '3× Upscale', value: 3 },
  { label: '4× Upscale (4K)', value: 4 },
]

/**
 * Target resolution info for display
 */
export function getOutputResolution(w, h, scale) {
  return { width: w * scale, height: h * scale }
}

/**
 * Clamp a value between min and max
 */
function clamp(val, min = 0, max = 255) {
  return Math.max(min, Math.min(max, val))
}

/**
 * Apply unsharp mask sharpening to ImageData
 * @param {ImageData} imageData
 * @param {number} amount  0–1
 */
function applySharpening(imageData, amount = 0.4) {
  const { data, width, height } = imageData
  const out = new Uint8ClampedArray(data)

  // 3×3 Laplacian-based sharpening kernel
  const kernel = [
    0, -1, 0,
    -1, 5, -1,
    0, -1, 0,
  ]
  const kw = 3
  const half = Math.floor(kw / 2)

  for (let y = half; y < height - half; y++) {
    for (let x = half; x < width - half; x++) {
      let r = 0, g = 0, b = 0

      for (let ky = 0; ky < kw; ky++) {
        for (let kx = 0; kx < kw; kx++) {
          const px = (y + ky - half) * width + (x + kx - half)
          const k = kernel[ky * kw + kx]
          r += data[px * 4]     * k
          g += data[px * 4 + 1] * k
          b += data[px * 4 + 2] * k
        }
      }

      const i = (y * width + x) * 4
      // Blend original + sharpened
      out[i]     = clamp(Math.round(data[i]     * (1 - amount) + r * amount))
      out[i + 1] = clamp(Math.round(data[i + 1] * (1 - amount) + g * amount))
      out[i + 2] = clamp(Math.round(data[i + 2] * (1 - amount) + b * amount))
      out[i + 3] = data[i + 3]
    }
  }

  return new ImageData(out, width, height)
}

/**
 * Step-based upscaling using multiple Canvas drawImage passes
 * (avoids single-step pixelation artifacts)
 */
function stepUpscale(sourceBitmap, targetW, targetH) {
  const steps = []
  let currentW = sourceBitmap.width
  let currentH = sourceBitmap.height

  // Generate intermediate steps (max 1.5× per step for smoothness)
  while (currentW < targetW || currentH < targetH) {
    const nextW = Math.min(Math.ceil(currentW * 1.5), targetW)
    const nextH = Math.min(Math.ceil(currentH * 1.5), targetH)
    steps.push({ w: nextW, h: nextH })
    currentW = nextW
    currentH = nextH
  }

  let current = sourceBitmap
  for (const step of steps) {
    const canvas = document.createElement('canvas')
    canvas.width = step.w
    canvas.height = step.h
    const ctx = canvas.getContext('2d')
    ctx.imageSmoothingEnabled = true
    ctx.imageSmoothingQuality = 'high'
    ctx.drawImage(current, 0, 0, step.w, step.h)
    current = canvas
  }
  return current
}

/**
 * Main upscale function
 * @param {File} file
 * @param {{ scale: number, format: string, quality: number, sharpen: boolean, onProgress: Function }} opts
 * @returns {Promise<{ blob: Blob, width: number, height: number, url: string }>}
 */
export async function upscaleImage(file, { scale, format, quality = 0.92, sharpen = true, onProgress }) {
  onProgress?.(5, 'Loading image…')

  const bitmap = await createImageBitmap(file)
  const srcW = bitmap.width
  const srcH = bitmap.height
  const dstW = srcW * scale
  const dstH = srcH * scale

  onProgress?.(20, 'Upscaling…')

  // Multi-step upscale
  const upscaled = stepUpscale(bitmap, dstW, dstH)

  onProgress?.(60, sharpen ? 'Sharpening…' : 'Finalizing…')

  // Create final canvas
  const finalCanvas = document.createElement('canvas')
  finalCanvas.width = dstW
  finalCanvas.height = dstH
  const ctx = finalCanvas.getContext('2d')
  ctx.imageSmoothingEnabled = true
  ctx.imageSmoothingQuality = 'high'
  ctx.drawImage(upscaled, 0, 0, dstW, dstH)

  if (sharpen) {
    const imageData = ctx.getImageData(0, 0, dstW, dstH)
    const sharpened = applySharpening(imageData, 0.35)
    ctx.putImageData(sharpened, 0, 0)
  }

  onProgress?.(85, 'Encoding…')

  const blob = await new Promise((resolve) => {
    finalCanvas.toBlob(resolve, format, quality)
  })

  onProgress?.(100, 'Done!')

  return {
    blob,
    width: dstW,
    height: dstH,
    url: URL.createObjectURL(blob),
  }
}

/**
 * Format bytes to human-readable string
 */
export function formatBytes(bytes) {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB'
}

/**
 * Detect image dimensions from a File
 */
export function getImageDimensions(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      URL.revokeObjectURL(url)
      resolve({ width: img.naturalWidth, height: img.naturalHeight })
    }
    img.onerror = reject
    img.src = url
  })
}
