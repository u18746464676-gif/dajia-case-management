import { pickBestTrackingNumber } from './tracking'

function ensureBrowserSupport() {
  return typeof window !== 'undefined' && 'BarcodeDetector' in window
}

async function loadImage(dataUrl) {
  return await new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = dataUrl
  })
}

export async function detectBarcodeFromDataUrl(dataUrl) {
  if (!ensureBrowserSupport() || !dataUrl) return null

  try {
    const img = await loadImage(dataUrl)
    const detector = new window.BarcodeDetector({
      formats: ['qr_code', 'code_128', 'code_39', 'ean_13', 'ean_8', 'itf', 'upc_a', 'upc_e']
    })

    const results = await detector.detect(img)
    if (!results?.length) return null

    const rawValues = results.map(item => item.rawValue).filter(Boolean)
    return {
      rawValue: rawValues[0] || '',
      rawValues,
      trackingNumber: pickBestTrackingNumber(rawValues),
      format: results[0]?.format || ''
    }
  } catch (error) {
    console.warn('Barcode detection failed:', error)
    return null
  }
}
