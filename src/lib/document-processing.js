function clamp(value, min = 0, max = 255) {
  return Math.max(min, Math.min(max, value))
}

function lerp(start, end, t) {
  return start + (end - start) * t
}

function lerpPoint(a, b, t) {
  return {
    x: lerp(a.x, b.x, t),
    y: lerp(a.y, b.y, t),
  }
}

async function loadImage(dataUrl) {
  return await new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = dataUrl
  })
}

export async function readFileAsDataUrl(file) {
  return await new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = event => resolve(event.target.result)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

function createCanvas(width, height) {
  const canvas = document.createElement('canvas')
  canvas.width = Math.max(1, Math.round(width))
  canvas.height = Math.max(1, Math.round(height))
  return canvas
}

function resizeImage(img, maxDimension = 1800) {
  const scale = Math.min(1, maxDimension / Math.max(img.width, img.height))
  const width = Math.max(1, Math.round(img.width * scale))
  const height = Math.max(1, Math.round(img.height * scale))
  const canvas = createCanvas(width, height)
  const ctx = canvas.getContext('2d', { willReadFrequently: true })
  ctx.drawImage(img, 0, 0, width, height)
  return canvas
}

function getLuminanceStats(imageData) {
  const { data, width, height } = imageData
  const luminance = new Float32Array(width * height)
  let total = 0
  for (let i = 0; i < data.length; i += 4) {
    const value = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114
    luminance[i / 4] = value
    total += value
  }
  return { luminance, average: total / (width * height) }
}

function detectDocumentMask(canvas) {
  const sampleMax = 720
  const scale = Math.min(1, sampleMax / Math.max(canvas.width, canvas.height))
  const sampleWidth = Math.max(1, Math.round(canvas.width * scale))
  const sampleHeight = Math.max(1, Math.round(canvas.height * scale))
  const sampleCanvas = createCanvas(sampleWidth, sampleHeight)
  const sampleCtx = sampleCanvas.getContext('2d', { willReadFrequently: true })
  sampleCtx.drawImage(canvas, 0, 0, sampleWidth, sampleHeight)

  const imageData = sampleCtx.getImageData(0, 0, sampleWidth, sampleHeight)
  const { luminance, average } = getLuminanceStats(imageData)
  const threshold = Math.min(245, average + 12)
  const mask = new Uint8Array(sampleWidth * sampleHeight)

  let minX = sampleWidth
  let minY = sampleHeight
  let maxX = 0
  let maxY = 0
  let brightCount = 0

  for (let y = 0; y < sampleHeight; y++) {
    for (let x = 0; x < sampleWidth; x++) {
      const idx = y * sampleWidth + x
      if (luminance[idx] >= threshold) {
        mask[idx] = 1
        brightCount++
        if (x < minX) minX = x
        if (y < minY) minY = y
        if (x > maxX) maxX = x
        if (y > maxY) maxY = y
      }
    }
  }

  const coverage = brightCount / (sampleWidth * sampleHeight)
  if (!brightCount || coverage < 0.08 || coverage > 0.98) {
    return null
  }

  return {
    mask,
    width: sampleWidth,
    height: sampleHeight,
    scale,
    bounds: {
      minX,
      minY,
      maxX,
      maxY,
    },
  }
}

function fitLine(points = [], axis = 'y') {
  if (points.length < 2) return null

  let sumPrimary = 0
  let sumSecondary = 0
  let sumPrimarySecondary = 0
  let sumPrimarySquared = 0

  for (const point of points) {
    const primary = axis === 'y' ? point.x : point.y
    const secondary = axis === 'y' ? point.y : point.x
    sumPrimary += primary
    sumSecondary += secondary
    sumPrimarySecondary += primary * secondary
    sumPrimarySquared += primary * primary
  }

  const count = points.length
  const denominator = count * sumPrimarySquared - sumPrimary * sumPrimary
  if (Math.abs(denominator) < 1e-6) return null

  const slope = (count * sumPrimarySecondary - sumPrimary * sumSecondary) / denominator
  const intercept = (sumSecondary - slope * sumPrimary) / count
  return { axis, slope, intercept }
}

function lineIntersection(horizontalLine, verticalLine) {
  if (!horizontalLine || !verticalLine) return null

  const { slope: mh, intercept: bh } = horizontalLine
  const { slope: mv, intercept: bv } = verticalLine
  const denominator = 1 - mh * mv
  if (Math.abs(denominator) < 1e-6) return null

  const x = (mv * bh + bv) / denominator
  const y = mh * x + bh
  return { x, y }
}

function distance(a, b) {
  return Math.hypot((a?.x || 0) - (b?.x || 0), (a?.y || 0) - (b?.y || 0))
}

function buildPerspectiveCorners(canvas) {
  const maskInfo = detectDocumentMask(canvas)
  if (!maskInfo) return null

  const { mask, width, height, scale, bounds } = maskInfo
  const topPoints = []
  const bottomPoints = []
  const leftPoints = []
  const rightPoints = []

  for (let x = bounds.minX; x <= bounds.maxX; x += 4) {
    for (let y = bounds.minY; y <= bounds.maxY; y++) {
      if (mask[y * width + x]) {
        topPoints.push({ x, y })
        break
      }
    }
    for (let y = bounds.maxY; y >= bounds.minY; y--) {
      if (mask[y * width + x]) {
        bottomPoints.push({ x, y })
        break
      }
    }
  }

  for (let y = bounds.minY; y <= bounds.maxY; y += 4) {
    for (let x = bounds.minX; x <= bounds.maxX; x++) {
      if (mask[y * width + x]) {
        leftPoints.push({ x, y })
        break
      }
    }
    for (let x = bounds.maxX; x >= bounds.minX; x--) {
      if (mask[y * width + x]) {
        rightPoints.push({ x, y })
        break
      }
    }
  }

  const topLine = fitLine(topPoints, 'y')
  const bottomLine = fitLine(bottomPoints, 'y')
  const leftLine = fitLine(leftPoints, 'x')
  const rightLine = fitLine(rightPoints, 'x')

  const topLeft = lineIntersection(topLine, leftLine)
  const topRight = lineIntersection(topLine, rightLine)
  const bottomLeft = lineIntersection(bottomLine, leftLine)
  const bottomRight = lineIntersection(bottomLine, rightLine)

  const corners = [topLeft, topRight, bottomRight, bottomLeft]
  if (corners.some(point => !point || Number.isNaN(point.x) || Number.isNaN(point.y))) {
    return null
  }

  const scaledCorners = {
    topLeft: { x: topLeft.x / scale, y: topLeft.y / scale },
    topRight: { x: topRight.x / scale, y: topRight.y / scale },
    bottomRight: { x: bottomRight.x / scale, y: bottomRight.y / scale },
    bottomLeft: { x: bottomLeft.x / scale, y: bottomLeft.y / scale },
  }

  const widths = [distance(topLeft, topRight), distance(bottomLeft, bottomRight)]
  const heights = [distance(topLeft, bottomLeft), distance(topRight, bottomRight)]
  const area = Math.max(...widths) * Math.max(...heights)
  const canvasArea = width * height

  if (area < canvasArea * 0.08) {
    return null
  }

  return scaledCorners
}

function sampleBilinear(imageData, x, y) {
  const { data, width, height } = imageData
  const clampedX = clamp(x, 0, width - 1)
  const clampedY = clamp(y, 0, height - 1)
  const x0 = Math.floor(clampedX)
  const y0 = Math.floor(clampedY)
  const x1 = Math.min(width - 1, x0 + 1)
  const y1 = Math.min(height - 1, y0 + 1)
  const dx = clampedX - x0
  const dy = clampedY - y0

  const getPixel = (px, py) => {
    const idx = (py * width + px) * 4
    return [data[idx], data[idx + 1], data[idx + 2], data[idx + 3]]
  }

  const p00 = getPixel(x0, y0)
  const p10 = getPixel(x1, y0)
  const p01 = getPixel(x0, y1)
  const p11 = getPixel(x1, y1)

  const mixed = [0, 0, 0, 0]
  for (let i = 0; i < 4; i++) {
    const top = p00[i] * (1 - dx) + p10[i] * dx
    const bottom = p01[i] * (1 - dx) + p11[i] * dx
    mixed[i] = top * (1 - dy) + bottom * dy
  }
  return mixed
}

function getPerspectiveMetrics(canvas, corners) {
  if (!canvas || !corners) return null

  const topWidth = distance(corners.topLeft, corners.topRight)
  const bottomWidth = distance(corners.bottomLeft, corners.bottomRight)
  const leftHeight = distance(corners.topLeft, corners.bottomLeft)
  const rightHeight = distance(corners.topRight, corners.bottomRight)

  const topTilt = Math.abs(corners.topRight.y - corners.topLeft.y) / Math.max(1, topWidth)
  const bottomTilt = Math.abs(corners.bottomRight.y - corners.bottomLeft.y) / Math.max(1, bottomWidth)
  const leftTilt = Math.abs(corners.bottomLeft.x - corners.topLeft.x) / Math.max(1, leftHeight)
  const rightTilt = Math.abs(corners.bottomRight.x - corners.topRight.x) / Math.max(1, rightHeight)

  const leftInset = Math.min(corners.topLeft.x, corners.bottomLeft.x) / Math.max(1, canvas.width)
  const rightInset = Math.min(canvas.width - corners.topRight.x, canvas.width - corners.bottomRight.x) / Math.max(1, canvas.width)
  const topInset = Math.min(corners.topLeft.y, corners.topRight.y) / Math.max(1, canvas.height)
  const bottomInset = Math.min(canvas.height - corners.bottomLeft.y, canvas.height - corners.bottomRight.y) / Math.max(1, canvas.height)

  return {
    topWidth,
    bottomWidth,
    leftHeight,
    rightHeight,
    widthDeltaRatio: Math.abs(topWidth - bottomWidth) / Math.max(1, topWidth, bottomWidth),
    heightDeltaRatio: Math.abs(leftHeight - rightHeight) / Math.max(1, leftHeight, rightHeight),
    maxTilt: Math.max(topTilt, bottomTilt, leftTilt, rightTilt),
    maxInset: Math.max(leftInset, rightInset, topInset, bottomInset),
    minInset: Math.min(leftInset, rightInset, topInset, bottomInset),
  }
}

function shouldApplyPerspectiveCorrection(canvas, corners) {
  const metrics = getPerspectiveMetrics(canvas, corners)
  if (!metrics) {
    return { shouldCorrect: false, reason: 'missing-corners', metrics: null }
  }

  const alreadyAligned = metrics.widthDeltaRatio < 0.08
    && metrics.heightDeltaRatio < 0.08
    && metrics.maxTilt < 0.04

  const documentAlreadyFramed = metrics.maxInset < 0.08 || metrics.minInset < 0.03

  if (alreadyAligned && documentAlreadyFramed) {
    return { shouldCorrect: false, reason: 'already-aligned-scan', metrics }
  }

  return { shouldCorrect: true, reason: 'perspective-needed', metrics }
}

function applyPerspectiveCorrection(canvas, corners) {
  if (!corners) return { canvas, corrected: false, reason: 'missing-corners', metrics: null }

  const decision = shouldApplyPerspectiveCorrection(canvas, corners)
  if (!decision.shouldCorrect) {
    return { canvas, corrected: false, reason: decision.reason, metrics: decision.metrics }
  }

  const topWidth = distance(corners.topLeft, corners.topRight)
  const bottomWidth = distance(corners.bottomLeft, corners.bottomRight)
  const leftHeight = distance(corners.topLeft, corners.bottomLeft)
  const rightHeight = distance(corners.topRight, corners.bottomRight)

  const targetWidth = Math.max(1, Math.round(Math.max(topWidth, bottomWidth)))
  const targetHeight = Math.max(1, Math.round(Math.max(leftHeight, rightHeight)))

  if (targetWidth < 40 || targetHeight < 40) {
    return { canvas, corrected: false, reason: 'target-too-small', metrics: decision.metrics }
  }

  const sourceCtx = canvas.getContext('2d', { willReadFrequently: true })
  const sourceData = sourceCtx.getImageData(0, 0, canvas.width, canvas.height)
  const targetCanvas = createCanvas(targetWidth, targetHeight)
  const targetCtx = targetCanvas.getContext('2d', { willReadFrequently: true })
  const targetData = targetCtx.createImageData(targetWidth, targetHeight)

  for (let y = 0; y < targetHeight; y++) {
    const v = targetHeight === 1 ? 0 : y / (targetHeight - 1)
    const leftEdge = lerpPoint(corners.topLeft, corners.bottomLeft, v)
    const rightEdge = lerpPoint(corners.topRight, corners.bottomRight, v)

    for (let x = 0; x < targetWidth; x++) {
      const u = targetWidth === 1 ? 0 : x / (targetWidth - 1)
      const sourcePoint = lerpPoint(leftEdge, rightEdge, u)
      const pixel = sampleBilinear(sourceData, sourcePoint.x, sourcePoint.y)
      const idx = (y * targetWidth + x) * 4
      targetData.data[idx] = pixel[0]
      targetData.data[idx + 1] = pixel[1]
      targetData.data[idx + 2] = pixel[2]
      targetData.data[idx + 3] = pixel[3]
    }
  }

  targetCtx.putImageData(targetData, 0, 0)
  return { canvas: targetCanvas, corrected: true, reason: decision.reason, metrics: decision.metrics }
}

function detectDocumentBounds(canvas) {
  const maskInfo = detectDocumentMask(canvas)
  if (!maskInfo) return null

  const { bounds, scale } = maskInfo
  const padX = Math.round((bounds.maxX - bounds.minX) * 0.04)
  const padY = Math.round((bounds.maxY - bounds.minY) * 0.04)

  return {
    x: Math.max(0, Math.round((bounds.minX - padX) / scale)),
    y: Math.max(0, Math.round((bounds.minY - padY) / scale)),
    width: Math.min(canvas.width, Math.round((bounds.maxX - bounds.minX + padX * 2) / scale)),
    height: Math.min(canvas.height, Math.round((bounds.maxY - bounds.minY + padY * 2) / scale)),
  }
}

function shouldCropBounds(canvas, bounds) {
  if (!canvas || !bounds?.width || !bounds?.height) return false

  const widthRatio = bounds.width / Math.max(1, canvas.width)
  const heightRatio = bounds.height / Math.max(1, canvas.height)
  const leftInset = bounds.x / Math.max(1, canvas.width)
  const topInset = bounds.y / Math.max(1, canvas.height)
  const rightInset = (canvas.width - bounds.x - bounds.width) / Math.max(1, canvas.width)
  const bottomInset = (canvas.height - bounds.y - bounds.height) / Math.max(1, canvas.height)
  const maxInset = Math.max(leftInset, topInset, rightInset, bottomInset)

  if (widthRatio < 0.55 || heightRatio < 0.55) return false
  if (widthRatio > 0.97 && heightRatio > 0.97) return false
  if (maxInset > 0.18) return false

  return true
}

function cropCanvas(canvas, bounds) {
  if (!shouldCropBounds(canvas, bounds)) return canvas
  const target = createCanvas(bounds.width, bounds.height)
  const ctx = target.getContext('2d')
  ctx.drawImage(canvas, bounds.x, bounds.y, bounds.width, bounds.height, 0, 0, bounds.width, bounds.height)
  return target
}

function applyColorScanEffect(canvas) {
  const ctx = canvas.getContext('2d', { willReadFrequently: true })
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
  const { data } = imageData

  for (let i = 0; i < data.length; i += 4) {
    let r = data[i]
    let g = data[i + 1]
    let b = data[i + 2]

    const avg = (r + g + b) / 3
    const warmBoost = avg > 190 ? 12 : 4

    r = avg + (r - avg) * 1.16 + warmBoost
    g = avg + (g - avg) * 1.12 + 8
    b = avg + (b - avg) * 1.08 + 4

    const contrast = avg > 210 ? 1.2 : 1.1
    r = (r - 128) * contrast + 128
    g = (g - 128) * contrast + 128
    b = (b - 128) * contrast + 128

    if (avg > 215) {
      r += 10
      g += 10
      b += 10
    }

    data[i] = clamp(r)
    data[i + 1] = clamp(g)
    data[i + 2] = clamp(b)
  }

  ctx.putImageData(imageData, 0, 0)
  return canvas
}

export async function processDocumentImage(input) {
  const dataUrl = typeof input === 'string' ? input : await readFileAsDataUrl(input)

  return {
    originalDataUrl: dataUrl,
    processedDataUrl: dataUrl,
    detectedDocument: false,
    correctionApplied: false,
    correctionReason: 'disabled',
    bounds: null,
    corners: null,
    fallback: false,
  }
}
