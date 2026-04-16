import { useDeferredValue, useEffect, useRef, useState } from 'react'

const dash = '—'
const loadingMessages = [
  'Reading document...',
  'Analyzing layout...',
  'Extracting fields...',
  'Validating JSON...',
  'Almost done...',
]
const tabTransitionDurationMs = 220

const styles = {
  panel: {
    background: 'var(--card-bg)',
    border: '1px solid var(--border)',
    borderRadius: '12px',
    boxShadow: 'var(--shadow)',
    padding: '24px',
    color: 'var(--text-primary)',
    fontFamily:
      'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  },
  panelLoading: {
    background: 'var(--card-bg-soft)',
  },
  emptyPanel: {
    background: 'var(--card-bg)',
    border: '1px solid var(--border)',
    borderRadius: '12px',
    padding: '24px',
    color: 'var(--text-secondary)',
    fontFamily:
      'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  },
  topbar: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: '16px',
    marginBottom: '22px',
  },
  topbarInfo: {
    display: 'grid',
    gap: '10px',
  },
  metaRow: {
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '10px',
  },
  topbarActions: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    flexWrap: 'wrap',
    gap: '10px',
  },
  heading: {
    margin: 0,
    fontSize: '1.25rem',
    fontWeight: 700,
    color: 'var(--text-primary)',
  },
  pagesBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    minHeight: '28px',
    padding: '4px 11px',
    border: '1px solid var(--border)',
    borderRadius: '999px',
    background: 'var(--card-bg-soft)',
    color: 'var(--text-secondary)',
    fontSize: '0.84rem',
    fontWeight: 700,
  },
  warningBanner: {
    marginBottom: '18px',
    padding: '12px 14px',
    border: '1px solid #facc15',
    borderRadius: '10px',
    background: '#fef3c7',
    color: '#854d0e',
    fontSize: '0.92rem',
    lineHeight: 1.45,
  },
  confidenceLegend: {
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '16px',
    padding: '0 28px 18px',
    color: 'var(--text-secondary)',
    fontSize: '0.86rem',
    fontWeight: 700,
  },
  confidenceLegendItem: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '7px',
  },
  confidenceValueWrap: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    minWidth: 0,
  },
  confidenceDot: {
    width: '10px',
    height: '10px',
    borderRadius: '999px',
    flexShrink: 0,
    boxShadow: '0 0 0 3px rgba(255, 255, 255, 0.08)',
  },
  confidenceDotHigh: {
    background: '#16a34a',
  },
  confidenceDotMedium: {
    background: '#eab308',
  },
  confidenceDotLow: {
    background: '#dc2626',
  },
  confidenceValueText: {
    minWidth: 0,
  },
  toggle: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    padding: '4px',
    border: '1px solid var(--border)',
    borderRadius: '999px',
    background: 'var(--card-bg-soft)',
  },
  toggleButton: {
    border: 0,
    borderRadius: '999px',
    padding: '7px 13px',
    background: 'transparent',
    color: 'var(--text-secondary)',
    cursor: 'pointer',
    font: 'inherit',
    fontSize: '0.9rem',
  },
  toggleButtonActive: {
    background: 'var(--blue-accent)',
    color: '#ffffff',
    boxShadow: '0 3px 10px rgba(29, 78, 216, 0.22)',
  },
  actionButton: {
    border: '1px solid var(--blue-accent)',
    borderRadius: '999px',
    background: 'var(--blue-accent)',
    color: '#ffffff',
    cursor: 'pointer',
    font: 'inherit',
    fontSize: '0.9rem',
    fontWeight: 700,
    padding: '9px 14px',
    boxShadow: '0 5px 14px rgba(29, 78, 216, 0.2)',
  },
  actionButtonSecondary: {
    background: 'var(--blue-accent-soft)',
    color: 'var(--blue-accent-text)',
    boxShadow: 'none',
  },
  invoiceDocument: {
    border: '1px solid var(--border-soft)',
    borderRadius: '10px',
    overflow: 'hidden',
    background: 'var(--card-bg)',
  },
  invoiceHeader: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: '18px',
    padding: '28px 28px 20px',
    borderBottom: '1px solid var(--border-soft)',
    background: 'var(--card-bg-soft)',
  },
  invoiceTitle: {
    margin: 0,
    fontSize: '2rem',
    lineHeight: 1.1,
    fontWeight: 750,
    color: 'var(--text-primary)',
  },
  documentBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    minHeight: '30px',
    padding: '5px 12px',
    borderRadius: '999px',
    background: 'var(--blue-accent-soft)',
    color: 'var(--blue-accent-text)',
    fontSize: '0.92rem',
    fontWeight: 700,
    border: '1px solid var(--border)',
  },
  detailsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    gap: '16px 28px',
    padding: '24px 28px 28px',
  },
  detailItem: {
    minWidth: 0,
  },
  detailLabel: {
    display: 'block',
    marginBottom: '6px',
    color: 'var(--text-secondary)',
    fontSize: '0.88rem',
  },
  detailValue: {
    color: 'var(--text-primary)',
    fontSize: '1rem',
    lineHeight: 1.45,
  },
  detailValueStrong: {
    color: 'var(--text-primary)',
    fontSize: '1rem',
    lineHeight: 1.45,
    fontWeight: 700,
  },
  section: {
    padding: '0 28px 28px',
  },
  sectionTitle: {
    margin: '0 0 12px',
    color: 'var(--text-primary)',
    fontSize: '1rem',
    fontWeight: 700,
  },
  tableWrap: {
    width: '100%',
    overflowX: 'auto',
    border: '1px solid var(--border)',
    borderRadius: '8px',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    minWidth: '620px',
  },
  tableHeader: {
    background: 'var(--card-bg-soft)',
    color: 'var(--text-primary)',
    fontSize: '0.9rem',
    fontWeight: 700,
    textAlign: 'left',
  },
  tableHeaderCell: {
    padding: '12px 14px',
    borderBottom: '1px solid var(--border)',
  },
  tableCell: {
    padding: '13px 14px',
    borderBottom: '1px solid var(--border-soft)',
    color: 'var(--text-primary)',
    verticalAlign: 'top',
  },
  tableCellMuted: {
    padding: '13px 14px',
    borderBottom: '1px solid var(--border-soft)',
    color: 'var(--text-secondary)',
    verticalAlign: 'top',
  },
  numberCell: {
    width: '54px',
    textAlign: 'right',
  },
  quantityCell: {
    width: '96px',
    textAlign: 'right',
  },
  moneyCell: {
    width: '132px',
    textAlign: 'right',
    whiteSpace: 'nowrap',
  },
  totalsSection: {
    display: 'flex',
    justifyContent: 'flex-end',
    padding: '0 28px 30px',
  },
  totalsBox: {
    width: 'min(100%, 340px)',
    borderTop: '1px solid var(--border-soft)',
    paddingTop: '12px',
  },
  totalRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '20px',
    padding: '8px 0',
    color: 'var(--text-primary)',
  },
  totalAmountRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '20px',
    marginTop: '8px',
    paddingTop: '14px',
    borderTop: '1px solid var(--border)',
    color: 'var(--text-primary)',
    fontSize: '1.2rem',
    fontWeight: 800,
  },
  jsonResults: {
    margin: 0,
    padding: '18px',
    border: '1px solid var(--border)',
    borderRadius: '10px',
    background: 'var(--json-bg)',
    color: 'var(--json-text)',
    overflowX: 'auto',
    fontSize: '0.92rem',
    lineHeight: 1.65,
  },
  emptyMessage: {
    margin: 0,
    fontSize: '0.98rem',
  },
  loadingOverlay: {
    display: 'grid',
    placeItems: 'center',
    minHeight: '420px',
    border: '1px solid var(--border-soft)',
    borderRadius: '10px',
    background: 'var(--card-bg-soft)',
  },
  loadingContent: {
    display: 'grid',
    justifyItems: 'center',
    gap: '16px',
    textAlign: 'center',
  },
  spinner: {
    width: '40px',
    height: '40px',
    border: '4px solid var(--blue-accent-soft)',
    borderTopColor: 'var(--blue-accent)',
    borderRadius: '50%',
  },
  loadingText: {
    margin: 0,
    color: 'var(--text-primary)',
    fontSize: '1rem',
    fontWeight: 700,
  },
}

function joinStyles(...styleObjects) {
  return Object.assign({}, ...styleObjects)
}

function isMissing(value) {
  return value === null || value === undefined || value === ''
}

function isConfidenceWrapper(value) {
  return (
    value &&
    typeof value === 'object' &&
    !Array.isArray(value) &&
    'value' in value &&
    'confidence' in value
  )
}

function normalizeConfidenceValue(value) {
  if (isConfidenceWrapper(value)) {
    return {
      value: value.value,
      confidence:
        typeof value.confidence === 'number'
          ? Math.max(0, Math.min(value.confidence, 1))
          : value.value == null
            ? 0
            : 1,
    }
  }

  return {
    value,
    confidence: value == null ? 0 : 1,
  }
}

function displayValue(value) {
  if (isMissing(value)) {
    return dash
  }

  if (isConfidenceWrapper(value)) {
    return displayValue(value.value)
  }

  if (Array.isArray(value)) {
    return value.length ? value.map(displayValue).join(', ') : dash
  }

  if (typeof value === 'object') {
    return value.name ?? value.title ?? value.value ?? dash
  }

  return String(value)
}

function formatDate(value) {
  if (isConfidenceWrapper(value)) {
    return formatDate(value.value)
  }

  if (isMissing(value)) {
    return dash
  }

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return displayValue(value)
  }

  return new Intl.DateTimeFormat(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date)
}

function formatMoney(value) {
  if (isConfidenceWrapper(value)) {
    return formatMoney(value.value)
  }

  if (isMissing(value)) {
    return dash
  }

  if (typeof value === 'number') {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: 'USD',
    }).format(value)
  }

  return displayValue(value)
}

function prettifyDocumentType(value) {
  const text = displayValue(value)

  if (text === dash) {
    return dash
  }

  return text
    .replaceAll('_', ' ')
    .replace(/\b\w/g, (character) => character.toUpperCase())
}

function getFirstValue(source, keys) {
  for (const key of keys) {
    if (!isMissing(source?.[key])) {
      return source[key]
    }
  }

  return null
}

function getPartyName(value) {
  if (isConfidenceWrapper(value)) {
    return getPartyName(value.value)
  }

  if (isMissing(value)) {
    return dash
  }

  if (typeof value === 'object' && !Array.isArray(value)) {
    return displayValue(value.name ?? value.company ?? value.organization ?? value.title)
  }

  return displayValue(value)
}

function normalizeLineItems(value) {
  if (!Array.isArray(value) || value.length === 0) {
    return []
  }

  return value.map((item) => (item && typeof item === 'object' ? item : { description: item }))
}

function getConfidenceTone(confidence) {
  if (confidence >= 0.8) {
    return styles.confidenceDotHigh
  }

  if (confidence >= 0.5) {
    return styles.confidenceDotMedium
  }

  return styles.confidenceDotLow
}

function ConfidenceValue({ field, formatter = displayValue, strong = false }) {
  const normalized = normalizeConfidenceValue(field)
  const textStyle = strong ? styles.detailValueStrong : styles.confidenceValueText

  return (
    <span style={styles.confidenceValueWrap}>
      <span style={joinStyles(styles.confidenceDot, getConfidenceTone(normalized.confidence))} />
      <span style={textStyle}>{formatter(normalized.value)}</span>
    </span>
  )
}

function renderHighlightedJson(value) {
  const json = stringifyJson(value)
  const tokenPattern =
    /("(?:\\.|[^"\\])*"(?=\s*:))|("(?:\\.|[^"\\])*")|\btrue\b|\bfalse\b|\bnull\b|-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?/g

  const tokenStyles = {
    key: { color: '#93c5fd' },
    string: { color: '#bbf7d0' },
    number: { color: '#fde68a' },
    boolean: { color: '#fca5a5' },
    null: { color: '#c4b5fd' },
    plain: { color: '#dbeafe' },
  }

  const pieces = []
  let lastIndex = 0
  let match

  while ((match = tokenPattern.exec(json)) !== null) {
    if (match.index > lastIndex) {
      pieces.push({
        type: 'plain',
        value: json.slice(lastIndex, match.index),
      })
    }

    let tokenType = 'number'
    if (match[1]) {
      tokenType = 'key'
    } else if (match[2]) {
      tokenType = 'string'
    } else if (match[0] === 'true' || match[0] === 'false') {
      tokenType = 'boolean'
    } else if (match[0] === 'null') {
      tokenType = 'null'
    }

    pieces.push({
      type: tokenType,
      value: match[0],
    })

    lastIndex = tokenPattern.lastIndex
  }

  if (lastIndex < json.length) {
    pieces.push({
      type: 'plain',
      value: json.slice(lastIndex),
    })
  }

  return pieces.map((piece, index) => (
    <span key={`${piece.type}-${index}`} style={tokenStyles[piece.type]}>
      {piece.value}
    </span>
  ))
}

function stringifyJson(value) {
  return JSON.stringify(value, null, 2)
}

function InvoiceTextView({ data }) {
  const documentType = prettifyDocumentType(getFirstValue(data, ['document_type', 'type']))
  const documentNumber = getFirstValue(data, [
    'document_number',
    'invoice_number',
    'number',
    'id',
  ])
  const documentDate = getFirstValue(data, ['document_date', 'invoice_date', 'date'])
  const issuer = getFirstValue(data, ['issuer', 'issuer_name', 'vendor', 'seller', 'from'])
  const recipient = getFirstValue(data, ['recipient', 'recipient_name', 'customer', 'buyer', 'to'])
  const lineItems = normalizeLineItems(
    getFirstValue(data, ['line_items', 'items', 'entries', 'rows']) ?? [],
  )
  const subtotal = getFirstValue(data, ['subtotal', 'sub_total'])
  const tax = getFirstValue(data, ['tax', 'tax_amount'])
  const totalAmount = getFirstValue(data, ['total_amount', 'total', 'amount_due'])

  return (
    <div className="sudowoodo-premium-card" style={styles.invoiceDocument}>
      <div style={styles.invoiceHeader}>
        <div>
          <h3 style={styles.invoiceTitle}>Invoice</h3>
        </div>
        <span style={styles.documentBadge}>{documentType}</span>
      </div>

      <div style={styles.confidenceLegend}>
        <span style={styles.confidenceLegendItem}>
          <span style={joinStyles(styles.confidenceDot, styles.confidenceDotHigh)} />
          <span>High</span>
        </span>
        <span style={styles.confidenceLegendItem}>
          <span style={joinStyles(styles.confidenceDot, styles.confidenceDotMedium)} />
          <span>Medium</span>
        </span>
        <span style={styles.confidenceLegendItem}>
          <span style={joinStyles(styles.confidenceDot, styles.confidenceDotLow)} />
          <span>Low confidence</span>
        </span>
      </div>

      <div style={styles.detailsGrid}>
        <div style={styles.detailItem}>
          <span style={styles.detailLabel}>Document Type</span>
          <span style={styles.documentBadge}>{documentType}</span>
        </div>
        <div style={styles.detailItem}>
          <span style={styles.detailLabel}>Document Number</span>
          <ConfidenceValue field={documentNumber} />
        </div>
        <div style={styles.detailItem}>
          <span style={styles.detailLabel}>Document Date</span>
          <ConfidenceValue field={documentDate} formatter={formatDate} />
        </div>
        <div style={styles.detailItem}>
          <span style={styles.detailLabel}>Issuer name</span>
          <ConfidenceValue field={issuer} formatter={getPartyName} strong />
        </div>
        <div style={styles.detailItem}>
          <span style={styles.detailLabel}>Recipient name</span>
          <ConfidenceValue field={recipient} formatter={getPartyName} strong />
        </div>
      </div>

      <div style={styles.section}>
        <h4 style={styles.sectionTitle}>Line Items</h4>
        <div style={styles.tableWrap}>
          <table style={styles.table}>
            <thead style={styles.tableHeader}>
              <tr>
                <th style={joinStyles(styles.tableHeaderCell, styles.numberCell)}>#</th>
                <th style={styles.tableHeaderCell}>Description</th>
                <th style={joinStyles(styles.tableHeaderCell, styles.quantityCell)}>Quantity</th>
                <th style={joinStyles(styles.tableHeaderCell, styles.moneyCell)}>Unit Price</th>
                <th style={joinStyles(styles.tableHeaderCell, styles.moneyCell)}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {lineItems.length ? (
                lineItems.map((item, index) => {
                  const rowStyle = {
                    background:
                      index % 2 === 0 ? 'var(--card-bg)' : 'var(--card-bg-soft)',
                  }

                  return (
                    <tr key={`${index}-${displayValue(item.description)}`} style={rowStyle}>
                      <td style={joinStyles(styles.tableCellMuted, styles.numberCell)}>
                        {index + 1}
                      </td>
                      <td style={styles.tableCell}>
                        <ConfidenceValue field={item.description} />
                      </td>
                      <td style={joinStyles(styles.tableCell, styles.quantityCell)}>
                        <ConfidenceValue field={item.quantity} />
                      </td>
                      <td style={joinStyles(styles.tableCell, styles.moneyCell)}>
                        <ConfidenceValue field={item.unit_price} formatter={formatMoney} />
                      </td>
                      <td style={joinStyles(styles.tableCell, styles.moneyCell)}>
                        <ConfidenceValue field={item.amount} formatter={formatMoney} />
                      </td>
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td style={styles.tableCellMuted} colSpan={5}>
                    {dash}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div style={styles.totalsSection}>
        <div style={styles.totalsBox}>
          <div style={styles.totalRow}>
            <span>Subtotal</span>
            <ConfidenceValue field={subtotal} formatter={formatMoney} />
          </div>
          <div style={styles.totalRow}>
            <span>Tax</span>
            <ConfidenceValue field={tax} formatter={formatMoney} />
          </div>
          <div style={styles.totalAmountRow}>
            <span>Total Amount</span>
            <ConfidenceValue field={totalAmount} formatter={formatMoney} />
          </div>
        </div>
      </div>
    </div>
  )
}

function ToggleButton({ active, children, onClick }) {
  return (
    <button
      className="sudowoodo-pressable"
      style={joinStyles(styles.toggleButton, active ? styles.toggleButtonActive : null)}
      type="button"
      onClick={onClick}
    >
      {children}
    </button>
  )
}

function ActionButton({ children, onClick, secondary = false }) {
  return (
    <button
      className="sudowoodo-pressable"
      style={joinStyles(styles.actionButton, secondary ? styles.actionButtonSecondary : null)}
      type="button"
      onClick={onClick}
    >
      {children}
    </button>
  )
}

function LoadingOverlay({ message }) {
  return (
    <div style={styles.loadingOverlay}>
      <div style={styles.loadingContent}>
        <span className="sudowoodo-spinner" style={styles.spinner} aria-hidden="true" />
        <p style={styles.loadingText}>{message}</p>
      </div>
    </div>
  )
}

function ResultsPanel({ data, loading = false, pagesProcessed = null, warning = null }) {
  const [selectedView, setSelectedView] = useState('text')
  const [renderedView, setRenderedView] = useState('text')
  const [transitionView, setTransitionView] = useState(null)
  const [copied, setCopied] = useState(false)
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0)
  const [contentAnimationKey, setContentAnimationKey] = useState(0)
  const deferredData = useDeferredValue(data)
  const copyResetTimer = useRef(null)
  const tabTransitionTimer = useRef(null)

  useEffect(() => {
    return () => {
      if (copyResetTimer.current) {
        clearTimeout(copyResetTimer.current)
      }

      if (tabTransitionTimer.current) {
        clearTimeout(tabTransitionTimer.current)
      }
    }
  }, [])

  useEffect(() => {
    if (!loading && !deferredData) {
      setSelectedView('text')
      setRenderedView('text')
      setTransitionView(null)
    }
  }, [deferredData, loading])

  useEffect(() => {
    if (deferredData) {
      setContentAnimationKey((currentKey) => currentKey + 1)
    }
  }, [deferredData])

  function handleViewChange(nextView) {
    if (nextView === selectedView) {
      return
    }

    if (tabTransitionTimer.current) {
      clearTimeout(tabTransitionTimer.current)
      tabTransitionTimer.current = null
    }

    if (nextView === renderedView) {
      setSelectedView(nextView)
      setTransitionView(null)
      return
    }

    setSelectedView(nextView)
    setTransitionView(nextView)

    tabTransitionTimer.current = setTimeout(() => {
      setRenderedView(nextView)
      setTransitionView(null)
      tabTransitionTimer.current = null
    }, tabTransitionDurationMs)
  }

  function renderResultView(view) {
    if (view === 'text') {
      return <InvoiceTextView data={deferredData} />
    }

    return (
      <pre className="sudowoodo-premium-card" style={styles.jsonResults}>
        {renderHighlightedJson(deferredData)}
      </pre>
    )
  }

  useEffect(() => {
    if (!loading) {
      setLoadingMessageIndex(0)
      return undefined
    }

    const intervalId = setInterval(() => {
      setLoadingMessageIndex((currentIndex) => (currentIndex + 1) % loadingMessages.length)
    }, 1500)

    return () => clearInterval(intervalId)
  }, [loading])

  function resetCopiedLabel() {
    if (copyResetTimer.current) {
      clearTimeout(copyResetTimer.current)
    }

    copyResetTimer.current = setTimeout(() => {
      setCopied(false)
      copyResetTimer.current = null
    }, 2000)
  }

  async function handleCopyJson() {
    const json = stringifyJson(deferredData)

    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(json)
    } else {
      const textArea = document.createElement('textarea')
      textArea.value = json
      textArea.setAttribute('readonly', '')
      textArea.style.position = 'fixed'
      textArea.style.opacity = '0'
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
    }

    setCopied(true)
    resetCopiedLabel()
  }

  function handleDownloadJson() {
    const blob = new Blob([stringifyJson(deferredData)], {
      type: 'application/json;charset=utf-8',
    })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')

    link.href = url
    link.download = 'sudowoodo-output.json'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <section style={joinStyles(styles.panel, styles.panelLoading)}>
        <div style={styles.topbar}>
          <h2 style={styles.heading}>Results</h2>
        </div>
        <LoadingOverlay message={loadingMessages[loadingMessageIndex]} />
      </section>
    )
  }

  if (!deferredData) {
    return (
      <section style={styles.emptyPanel}>
        <div style={styles.topbar}>
          <h2 style={styles.heading}>Results</h2>
          <div style={styles.toggle}>
            <ToggleButton active>Text</ToggleButton>
            <ToggleButton>JSON</ToggleButton>
          </div>
        </div>
        <p style={styles.emptyMessage}>Run an extraction to see structured output here.</p>
      </section>
    )
  }

  return (
    <section style={styles.panel}>
      <div style={styles.topbar}>
        <div style={styles.topbarInfo}>
          <h2 style={styles.heading}>Results</h2>
          {pagesProcessed ? (
            <div style={styles.metaRow}>
              <span style={styles.pagesBadge}>{pagesProcessed} pages processed</span>
            </div>
          ) : null}
        </div>
        <div style={styles.topbarActions}>
          <div style={styles.toggle}>
            <ToggleButton active={selectedView === 'text'} onClick={() => handleViewChange('text')}>
              Text
            </ToggleButton>
            <ToggleButton active={selectedView === 'json'} onClick={() => handleViewChange('json')}>
              JSON
            </ToggleButton>
          </div>
          {selectedView === 'json' ? (
            <ActionButton secondary onClick={handleCopyJson}>
              {copied ? 'Copied!' : 'Copy JSON'}
            </ActionButton>
          ) : null}
          <ActionButton onClick={handleDownloadJson}>Download JSON</ActionButton>
        </div>
      </div>

      {warning ? <div style={styles.warningBanner}>{warning}</div> : null}

      <div key={contentAnimationKey} className="sudowoodo-results-enter">
        <div className="sudowoodo-tab-stage">
          {transitionView ? (
            <>
              <div className="sudowoodo-tab-pane sudowoodo-tab-pane-out">
                {renderResultView(renderedView)}
              </div>
              <div className="sudowoodo-tab-pane sudowoodo-tab-pane-in">
                {renderResultView(transitionView)}
              </div>
            </>
          ) : (
            <div className="sudowoodo-tab-pane">{renderResultView(renderedView)}</div>
          )}
        </div>
      </div>
    </section>
  )
}

export default ResultsPanel
