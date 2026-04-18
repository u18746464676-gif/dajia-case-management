function normalizeRaw(value = '') {
  return String(value || '')
    .replace(/[\s\-_:：·.,，。()（）\[\]【】]/g, '')
    .trim()
    .toUpperCase()
}

export function isBlockedTrackingCode(value = '') {
  const normalized = normalizeRaw(value)
  return !normalized || normalized.startsWith('XY') || normalized.includes('XY')
}

function isValidTrackingCandidate(value = '') {
  const normalized = normalizeRaw(value)
  if (!normalized) return false
  if (isBlockedTrackingCode(normalized)) return false
  if (!/[A-Z0-9]/.test(normalized)) return false
  if (normalized.length < 8 || normalized.length > 32) return false
  return true
}

function splitTrackingTokens(text = '') {
  const rawTokens = String(text || '').toUpperCase().match(/[A-Z0-9]+/g) || []
  const tokens = []

  for (const token of rawTokens) {
    if (!token) continue

    if (token.startsWith('XY') && token.length >= 8) {
      continue
    }

    if (token.includes('XY')) {
      const cleaned = token.replace(/XY[A-Z0-9]*/g, ' ').split(/\s+/).filter(Boolean)
      tokens.push(...cleaned)
      continue
    }

    tokens.push(token)
  }

  return tokens.filter(Boolean)
}

function buildTrackingCandidates(text = '') {
  const tokens = splitTrackingTokens(text)
  const candidates = []

  for (let start = 0; start < tokens.length; start++) {
    let combined = ''
    for (let end = start; end < Math.min(tokens.length, start + 5); end++) {
      combined += tokens[end]
      if (isValidTrackingCandidate(combined)) {
        candidates.push(combined)
      }
    }
  }

  return Array.from(new Set(candidates)).sort((left, right) => {
    const digitDelta = (right.replace(/[^0-9]/g, '').length - left.replace(/[^0-9]/g, '').length)
    if (digitDelta !== 0) return digitDelta
    return right.length - left.length
  })
}

export function normalizeTrackingNumber(value = '') {
  const candidates = buildTrackingCandidates(value)
  return candidates[0] || ''
}

export function extractTrackingCandidates(text = '') {
  return buildTrackingCandidates(text)
}

export function pickBestTrackingNumber(...values) {
  const flattened = values.flat(Infinity)
  for (const value of flattened) {
    const normalized = normalizeTrackingNumber(value)
    if (normalized) return normalized
  }
  return ''
}
