export const historyStorageKey = 'sudowoodo-extraction-history'
export const recentHistoryLimit = 10

export function createHistoryId() {
  return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`
}

export function createHistoryItem(data, pagesProcessed = null, warning = null) {
  return {
    id: createHistoryId(),
    data,
    pagesProcessed,
    warning,
    status: 'success',
    extractedAt: new Date().toISOString(),
  }
}

function normalizeHistoryItem(item) {
  if (!item || typeof item !== 'object') {
    return null
  }

  return {
    id: item.id ?? createHistoryId(),
    data: item.data ?? null,
    pagesProcessed: item.pagesProcessed ?? null,
    warning: item.warning ?? null,
    status: item.status ?? 'success',
    extractedAt: item.extractedAt ?? new Date().toISOString(),
  }
}

export function loadStoredHistory() {
  try {
    if (typeof localStorage === 'undefined') {
      return []
    }

    const storedHistory = localStorage.getItem(historyStorageKey)
    const parsedHistory = storedHistory ? JSON.parse(storedHistory) : []

    if (!Array.isArray(parsedHistory)) {
      return []
    }

    return parsedHistory.map(normalizeHistoryItem).filter(Boolean)
  } catch {
    return []
  }
}

export function saveStoredHistory(history) {
  try {
    if (typeof localStorage === 'undefined') {
      return
    }

    localStorage.setItem(historyStorageKey, JSON.stringify(Array.isArray(history) ? history : []))
  } catch {
    // History is a convenience feature; extraction should keep working if storage is unavailable.
  }
}

export function appendHistoryItemsToStorage(items) {
  const existingHistory = loadStoredHistory()
  const normalizedItems = Array.isArray(items) ? items.filter(Boolean) : []

  saveStoredHistory([...normalizedItems, ...existingHistory])
}

export function getRecentHistory(history, limit = recentHistoryLimit) {
  return Array.isArray(history) ? history.slice(0, limit) : []
}
