import { useEffect, useRef, useState } from 'react'

const styles = {
  panel: {
    display: 'grid',
    gridTemplateRows: 'auto 1fr auto',
    minHeight: '520px',
    background: 'var(--card-bg)',
    border: '1px solid var(--border)',
    borderRadius: '16px',
    boxShadow: 'var(--shadow)',
    padding: '18px',
    color: 'var(--text-primary)',
    fontFamily:
      'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  },
  header: {
    display: 'grid',
    gap: '4px',
    marginBottom: '16px',
  },
  title: {
    margin: 0,
    color: 'var(--text-primary)',
    fontSize: '1.05rem',
    fontWeight: 750,
  },
  subtitle: {
    margin: 0,
    color: 'var(--text-secondary)',
    fontSize: '0.86rem',
    lineHeight: 1.4,
  },
  list: {
    display: 'grid',
    alignContent: 'start',
    gap: '10px',
    minHeight: 0,
    overflowY: 'auto',
  },
  item: {
    display: 'grid',
    gap: '6px',
    width: '100%',
    border: '1px solid var(--border-soft)',
    borderRadius: '12px',
    background: 'var(--card-bg)',
    color: 'var(--text-primary)',
    cursor: 'pointer',
    font: 'inherit',
    padding: '12px',
    textAlign: 'left',
    transition:
      'transform 180ms ease, box-shadow 220ms ease, border-color 220ms ease, background-color 220ms ease',
  },
  itemActive: {
    borderColor: 'var(--blue-accent)',
    background: 'var(--blue-accent-soft)',
    boxShadow: '0 8px 18px rgba(29, 78, 216, 0.12)',
  },
  documentTypeRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    minWidth: 0,
  },
  documentTypeDot: {
    width: '10px',
    height: '10px',
    borderRadius: '999px',
    flexShrink: 0,
  },
  documentTypeDotInvoice: {
    background: '#16a34a',
  },
  documentTypeDotReceipt: {
    background: '#2563eb',
  },
  documentTypeDotMedical: {
    background: '#9333ea',
  },
  documentTypeDotContract: {
    background: '#ea580c',
  },
  documentTypeDotDefault: {
    background: 'var(--text-secondary)',
  },
  documentType: {
    color: 'var(--blue-accent-text)',
    fontSize: '0.92rem',
    fontWeight: 800,
    overflowWrap: 'anywhere',
  },
  issuer: {
    color: 'var(--text-primary)',
    fontSize: '0.9rem',
    fontWeight: 650,
    overflowWrap: 'anywhere',
  },
  timestamp: {
    color: 'var(--text-secondary)',
    fontSize: '0.8rem',
  },
  footerRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '12px',
  },
  totalAmount: {
    color: 'var(--text-primary)',
    fontSize: '0.8rem',
    fontWeight: 800,
    whiteSpace: 'nowrap',
  },
  emptyState: {
    display: 'grid',
    placeItems: 'center',
    minHeight: '180px',
    border: '1px dashed var(--border)',
    borderRadius: '12px',
    color: 'var(--text-secondary)',
    fontSize: '0.9rem',
    lineHeight: 1.45,
    padding: '18px',
    textAlign: 'center',
  },
  clearButton: {
    marginTop: '16px',
    border: '1px solid var(--border)',
    borderRadius: '999px',
    background: 'var(--blue-accent-soft)',
    color: 'var(--blue-accent-text)',
    cursor: 'pointer',
    font: 'inherit',
    fontSize: '0.9rem',
    fontWeight: 750,
    padding: '10px 14px',
  },
  clearButtonDisabled: {
    cursor: 'not-allowed',
    opacity: 0.55,
  },
}

function joinStyles(...styleObjects) {
  return Object.assign({}, ...styleObjects)
}

function isMissing(value) {
  return value === null || value === undefined || value === ''
}

function stringifyObject(value) {
  try {
    return JSON.stringify(value)
  } catch {
    return String(value)
  }
}

function displayValue(value) {
  if (isMissing(value)) {
    return null
  }

  if (Array.isArray(value)) {
    const firstValue = value.map(displayValue).find(Boolean)
    return firstValue ?? null
  }

  if (typeof value === 'object') {
    return value.name ?? value.title ?? value.value ?? findFirstValue(value)
  }

  return String(value)
}

function toPlainString(value) {
  if (isMissing(value)) {
    return null
  }

  if (typeof value === 'object') {
    return stringifyObject(value)
  }

  return String(value)
}

function prettifyLabel(value) {
  if (!value) {
    return 'Unknown document'
  }

  return String(value)
    .replaceAll('_', ' ')
    .replace(/\b\w/g, (character) => character.toUpperCase())
}

function findFirstValue(data) {
  if (!data || typeof data !== 'object') {
    return displayValue(data)
  }

  for (const [key, value] of Object.entries(data)) {
    if (key === 'document_type' || key === 'type') {
      continue
    }

    const displayed = displayValue(value)

    if (displayed) {
      return displayed
    }
  }

  return null
}

function findFirstStringValue(value) {
  if (typeof value === 'string' && value.trim()) {
    return value
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      const nestedValue = findFirstStringValue(item)

      if (nestedValue) {
        return nestedValue
      }
    }

    return null
  }

  if (value && typeof value === 'object') {
    for (const [key, nestedValue] of Object.entries(value)) {
      if (key === 'document_type' || key === 'type') {
        continue
      }

      const firstString = findFirstStringValue(nestedValue)

      if (firstString) {
        return firstString
      }
    }
  }

  return null
}

function getDocumentType(item) {
  const rawDocumentType =
    item?.data?.document_type?.value ??
    item?.data?.document_type ??
    item?.document_type?.value ??
    item?.document_type ??
    item?.data?.type?.value ??
    item?.data?.type ??
    item?.type?.value ??
    item?.type
  const text = toPlainString(rawDocumentType)

  if (!text) {
    return 'Unknown document'
  }

  if (typeof rawDocumentType === 'object') {
    return text
  }

  return prettifyLabel(text)
}

function getDocumentTone(documentType) {
  const normalized = String(documentType ?? '').toLowerCase()

  if (normalized.includes('invoice')) {
    return styles.documentTypeDotInvoice
  }

  if (normalized.includes('receipt')) {
    return styles.documentTypeDotReceipt
  }

  if (normalized.includes('medical')) {
    return styles.documentTypeDotMedical
  }

  if (normalized.includes('contract')) {
    return styles.documentTypeDotContract
  }

  return styles.documentTypeDotDefault
}

function getIssuer(item) {
  const data = item?.data ?? item

  return (
    findFirstStringValue(data?.issuer) ??
    findFirstStringValue(data?.issuer_name) ??
    findFirstStringValue(data?.vendor) ??
    findFirstStringValue(data?.seller) ??
    findFirstStringValue(data?.store_name) ??
    findFirstStringValue(data) ??
    'No details found'
  )
}

function getTotalAmount(item) {
  const data = item?.data ?? item
  const totalAmount =
    displayValue(data?.total_amount) ??
    displayValue(data?.total) ??
    displayValue(data?.amount_due) ??
    displayValue(data?.total_value)

  if (!totalAmount) {
    return null
  }

  return String(totalAmount)
}

function formatTimestamp(value) {
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return 'Unknown time'
  }

  const now = new Date()
  const isToday =
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()
  const time = new Intl.DateTimeFormat(undefined, {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(date)

  if (isToday) {
    return `Today at ${time}`
  }

  const day = new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
  }).format(date)

  return `${day} at ${time}`
}

function HistoryPanel({ history, activeHistoryId, onSelect, onClear }) {
  const hasHistory = history.length > 0
  const [animatedIds, setAnimatedIds] = useState(() => new Set())
  const hasMounted = useRef(false)
  const previousIdsRef = useRef(history.map((item) => item.id))
  const animationTimersRef = useRef(new Map())

  useEffect(() => {
    if (!hasMounted.current) {
      hasMounted.current = true
      previousIdsRef.current = history.map((item) => item.id)
      return
    }

    const currentIds = history.map((item) => item.id)
    const previousIds = previousIdsRef.current
    const incomingIds = currentIds.filter((id) => !previousIds.includes(id))

    if (incomingIds.length) {
      setAnimatedIds((currentAnimatedIds) => {
        const nextAnimatedIds = new Set(currentAnimatedIds)
        incomingIds.forEach((id) => nextAnimatedIds.add(id))
        return nextAnimatedIds
      })

      incomingIds.forEach((id) => {
        const existingTimer = animationTimersRef.current.get(id)
        if (existingTimer) {
          clearTimeout(existingTimer)
        }

        const timerId = setTimeout(() => {
          setAnimatedIds((currentAnimatedIds) => {
            const nextAnimatedIds = new Set(currentAnimatedIds)
            nextAnimatedIds.delete(id)
            return nextAnimatedIds
          })
          animationTimersRef.current.delete(id)
        }, 420)

        animationTimersRef.current.set(id, timerId)
      })
    }

    previousIdsRef.current = currentIds
  }, [history])

  useEffect(() => {
    return () => {
      animationTimersRef.current.forEach((timerId) => clearTimeout(timerId))
    }
  }, [])

  return (
    <aside style={styles.panel}>
      <div style={styles.header}>
        <h2 style={styles.title}>History</h2>
        <p style={styles.subtitle}>Your last 10 extractions</p>
      </div>

      <div style={styles.list}>
        {hasHistory ? (
          history.map((item) => {
            const documentType = getDocumentType(item)
            const totalAmount = getTotalAmount(item)

            return (
              <button
                key={item.id}
                className={[
                  'sudowoodo-premium-card',
                  'sudowoodo-pressable',
                  animatedIds.has(item.id) ? 'sudowoodo-history-enter' : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                style={joinStyles(styles.item, activeHistoryId === item.id ? styles.itemActive : null)}
                type="button"
                onClick={() => onSelect(item)}
              >
                <div style={styles.documentTypeRow}>
                  <span style={joinStyles(styles.documentTypeDot, getDocumentTone(documentType))} />
                  <span style={styles.documentType}>{documentType}</span>
                </div>
                <span style={styles.issuer}>{getIssuer(item)}</span>
                <div style={styles.footerRow}>
                  <span style={styles.timestamp}>{formatTimestamp(item.extractedAt)}</span>
                  {totalAmount ? <span style={styles.totalAmount}>{totalAmount}</span> : null}
                </div>
              </button>
            )
          })
        ) : (
          <div style={styles.emptyState}>Completed extractions will appear here.</div>
        )}
      </div>

      <button
        className="sudowoodo-pressable"
        style={joinStyles(styles.clearButton, !hasHistory ? styles.clearButtonDisabled : null)}
        type="button"
        disabled={!hasHistory}
        onClick={onClear}
      >
        Clear history
      </button>
    </aside>
  )
}

export default HistoryPanel
