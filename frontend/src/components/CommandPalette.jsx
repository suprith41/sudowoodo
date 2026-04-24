import { useEffect, useRef } from 'react'

const styles = {
  overlay: {
    position: 'fixed',
    inset: 0,
    zIndex: 70,
    display: 'grid',
    placeItems: 'start center',
    padding: 'max(24px, 8vh) 18px 24px',
    background: 'rgba(15, 23, 42, 0.52)',
    backdropFilter: 'blur(10px)',
  },
  panel: {
    width: 'min(100%, 720px)',
    border: '1px solid var(--panel-border)',
    borderRadius: '26px',
    background: 'var(--panel)',
    boxShadow: '0 30px 90px rgba(15, 23, 42, 0.28)',
    backdropFilter: 'blur(18px)',
    overflow: 'hidden',
  },
  searchWrap: {
    padding: '20px 20px 16px',
    borderBottom: '1px solid var(--border)',
  },
  searchInput: {
    width: '100%',
    boxSizing: 'border-box',
    border: '1px solid var(--border)',
    borderRadius: '16px',
    background: 'var(--card-bg)',
    color: 'var(--text-primary)',
    font: 'inherit',
    fontSize: '1rem',
    padding: '14px 16px',
    outlineColor: 'var(--blue-accent)',
  },
  list: {
    display: 'grid',
    gap: '6px',
    maxHeight: 'min(60vh, 520px)',
    overflowY: 'auto',
    padding: '14px',
  },
  item: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '16px',
    width: '100%',
    border: '1px solid transparent',
    borderRadius: '16px',
    background: 'transparent',
    color: 'var(--text-primary)',
    cursor: 'pointer',
    font: 'inherit',
    padding: '14px 16px',
    textAlign: 'left',
  },
  itemActive: {
    borderColor: 'rgba(29, 78, 216, 0.18)',
    background: 'var(--blue-accent-soft)',
    boxShadow: '0 12px 24px rgba(29, 78, 216, 0.1)',
  },
  itemDisabled: {
    cursor: 'not-allowed',
    opacity: 0.58,
  },
  itemContent: {
    display: 'grid',
    gap: '4px',
    minWidth: 0,
  },
  itemTitle: {
    color: 'var(--text-primary)',
    fontSize: '0.97rem',
    fontWeight: 750,
  },
  itemMeta: {
    color: 'var(--text-secondary)',
    fontSize: '0.84rem',
  },
  shortcut: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '30px',
    minWidth: '54px',
    padding: '4px 10px',
    border: '1px solid var(--border)',
    borderRadius: '999px',
    background: 'var(--card-bg)',
    color: 'var(--text-secondary)',
    fontSize: '0.8rem',
    fontWeight: 800,
    whiteSpace: 'nowrap',
  },
  footer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '14px',
    padding: '14px 20px 18px',
    borderTop: '1px solid var(--border)',
    color: 'var(--text-secondary)',
    fontSize: '0.82rem',
    flexWrap: 'wrap',
  },
  footerHint: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
  },
  footerKey: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: '26px',
    minHeight: '24px',
    padding: '0 8px',
    border: '1px solid var(--border)',
    borderRadius: '999px',
    background: 'var(--card-bg)',
    color: 'var(--text-primary)',
    fontSize: '0.74rem',
    fontWeight: 800,
  },
  empty: {
    display: 'grid',
    gap: '8px',
    placeItems: 'center',
    minHeight: '180px',
    color: 'var(--text-secondary)',
    fontSize: '0.94rem',
    textAlign: 'center',
    padding: '20px',
  },
}

function joinStyles(...styleObjects) {
  return Object.assign({}, ...styleObjects)
}

function CommandPalette({
  open,
  query,
  actions,
  highlightedIndex,
  onClose,
  onQueryChange,
  onHighlightChange,
  onSelect,
}) {
  const inputRef = useRef(null)

  useEffect(() => {
    if (open) {
      inputRef.current?.focus()
      inputRef.current?.select()
    }
  }, [open])

  if (!open) {
    return null
  }

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.panel} onClick={(event) => event.stopPropagation()}>
        <div style={styles.searchWrap}>
          <input
            ref={inputRef}
            style={styles.searchInput}
            type="text"
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder="Search actions..."
          />
        </div>

        {actions.length ? (
          <div role="listbox" style={styles.list}>
            {actions.map((action, index) => (
              <button
                key={action.id}
                className="sudowoodo-pressable"
                style={joinStyles(
                  styles.item,
                  index === highlightedIndex ? styles.itemActive : null,
                  action.disabled ? styles.itemDisabled : null,
                )}
                type="button"
                onMouseEnter={() => onHighlightChange(index)}
                onClick={() => onSelect(action)}
                disabled={action.disabled}
              >
                <span style={styles.itemContent}>
                  <span style={styles.itemTitle}>{action.label}</span>
                  <span style={styles.itemMeta}>{action.meta}</span>
                </span>
                <span style={styles.shortcut}>{action.shortcut || '—'}</span>
              </button>
            ))}
          </div>
        ) : (
          <div style={styles.empty}>
            <strong>No matching actions</strong>
            <span>Try a different search term.</span>
          </div>
        )}

        <div style={styles.footer}>
          <span style={styles.footerHint}>
            <span style={styles.footerKey}>↑</span>
            <span style={styles.footerKey}>↓</span>
            Navigate
          </span>
          <span style={styles.footerHint}>
            <span style={styles.footerKey}>↵</span>
            Run action
          </span>
          <span style={styles.footerHint}>
            <span style={styles.footerKey}>Esc</span>
            Close
          </span>
        </div>
      </div>
    </div>
  )
}

export default CommandPalette
