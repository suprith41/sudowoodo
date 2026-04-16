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
  },
  itemActive: {
    borderColor: 'var(--blue-accent)',
    background: 'var(--blue-accent-soft)',
    boxShadow: '0 8px 18px rgba(29, 78, 216, 0.12)',
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

function getDocumentType(data) {
  return prettifyLabel(data?.document_type ?? data?.type)
}

function getIssuer(data) {
  return (
    displayValue(data?.issuer) ??
    displayValue(data?.issuer_name) ??
    displayValue(data?.vendor) ??
    displayValue(data?.seller) ??
    displayValue(data?.store_name) ??
    findFirstValue(data) ??
    'No details found'
  )
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
          history.map((item) => (
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
              <span style={styles.documentType}>{getDocumentType(item.data)}</span>
              <span style={styles.issuer}>{getIssuer(item.data)}</span>
              <span style={styles.timestamp}>{formatTimestamp(item.extractedAt)}</span>
            </button>
          ))
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
