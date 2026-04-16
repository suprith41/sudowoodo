import { useDeferredValue, useState } from 'react'

const dash = '—'

const styles = {
  panel: {
    background: '#ffffff',
    border: '1px solid #d9dee7',
    borderRadius: '12px',
    boxShadow: '0 18px 45px rgba(15, 23, 42, 0.08)',
    padding: '24px',
    color: '#172033',
    fontFamily:
      'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  },
  emptyPanel: {
    background: '#ffffff',
    border: '1px solid #d9dee7',
    borderRadius: '12px',
    padding: '24px',
    color: '#5d6678',
    fontFamily:
      'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  },
  topbar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '16px',
    marginBottom: '22px',
  },
  heading: {
    margin: 0,
    fontSize: '1.25rem',
    fontWeight: 700,
    color: '#111827',
  },
  toggle: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    padding: '4px',
    border: '1px solid #d7dce5',
    borderRadius: '999px',
    background: '#f8fafc',
  },
  toggleButton: {
    border: 0,
    borderRadius: '999px',
    padding: '7px 13px',
    background: 'transparent',
    color: '#556174',
    cursor: 'pointer',
    font: 'inherit',
    fontSize: '0.9rem',
  },
  toggleButtonActive: {
    background: '#1d4ed8',
    color: '#ffffff',
    boxShadow: '0 3px 10px rgba(29, 78, 216, 0.22)',
  },
  invoiceDocument: {
    border: '1px solid #e2e8f0',
    borderRadius: '10px',
    overflow: 'hidden',
    background: '#ffffff',
  },
  invoiceHeader: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: '18px',
    padding: '28px 28px 20px',
    borderBottom: '1px solid #e5e7eb',
    background: '#fbfcfe',
  },
  invoiceTitle: {
    margin: 0,
    fontSize: '2rem',
    lineHeight: 1.1,
    fontWeight: 750,
    color: '#101828',
  },
  documentBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    minHeight: '30px',
    padding: '5px 12px',
    borderRadius: '999px',
    background: '#dbeafe',
    color: '#1e40af',
    fontSize: '0.92rem',
    fontWeight: 700,
    border: '1px solid #bfdbfe',
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
    color: '#667085',
    fontSize: '0.88rem',
  },
  detailValue: {
    color: '#111827',
    fontSize: '1rem',
    lineHeight: 1.45,
  },
  detailValueStrong: {
    color: '#111827',
    fontSize: '1rem',
    lineHeight: 1.45,
    fontWeight: 700,
  },
  section: {
    padding: '0 28px 28px',
  },
  sectionTitle: {
    margin: '0 0 12px',
    color: '#111827',
    fontSize: '1rem',
    fontWeight: 700,
  },
  tableWrap: {
    width: '100%',
    overflowX: 'auto',
    border: '1px solid #d9dee7',
    borderRadius: '8px',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    minWidth: '620px',
  },
  tableHeader: {
    background: '#f3f4f6',
    color: '#374151',
    fontSize: '0.9rem',
    fontWeight: 700,
    textAlign: 'left',
  },
  tableHeaderCell: {
    padding: '12px 14px',
    borderBottom: '1px solid #d9dee7',
  },
  tableCell: {
    padding: '13px 14px',
    borderBottom: '1px solid #e5e7eb',
    color: '#1f2937',
    verticalAlign: 'top',
  },
  tableCellMuted: {
    padding: '13px 14px',
    borderBottom: '1px solid #e5e7eb',
    color: '#667085',
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
    borderTop: '1px solid #e5e7eb',
    paddingTop: '12px',
  },
  totalRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '20px',
    padding: '8px 0',
    color: '#374151',
  },
  totalAmountRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '20px',
    marginTop: '8px',
    paddingTop: '14px',
    borderTop: '1px solid #d9dee7',
    color: '#111827',
    fontSize: '1.2rem',
    fontWeight: 800,
  },
  jsonResults: {
    margin: 0,
    padding: '18px',
    border: '1px solid #d9dee7',
    borderRadius: '10px',
    background: '#0f172a',
    color: '#dbeafe',
    overflowX: 'auto',
    fontSize: '0.92rem',
    lineHeight: 1.65,
  },
  emptyMessage: {
    margin: 0,
    fontSize: '0.98rem',
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
    return dash
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

function renderHighlightedJson(value) {
  const json = JSON.stringify(value, null, 2)
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
    <div style={styles.invoiceDocument}>
      <div style={styles.invoiceHeader}>
        <div>
          <h3 style={styles.invoiceTitle}>Invoice</h3>
        </div>
        <span style={styles.documentBadge}>{documentType}</span>
      </div>

      <div style={styles.detailsGrid}>
        <div style={styles.detailItem}>
          <span style={styles.detailLabel}>Document Type</span>
          <span style={styles.documentBadge}>{documentType}</span>
        </div>
        <div style={styles.detailItem}>
          <span style={styles.detailLabel}>Document Number</span>
          <span style={styles.detailValue}>{displayValue(documentNumber)}</span>
        </div>
        <div style={styles.detailItem}>
          <span style={styles.detailLabel}>Document Date</span>
          <span style={styles.detailValue}>{formatDate(documentDate)}</span>
        </div>
        <div style={styles.detailItem}>
          <span style={styles.detailLabel}>Issuer name</span>
          <span style={styles.detailValueStrong}>{getPartyName(issuer)}</span>
        </div>
        <div style={styles.detailItem}>
          <span style={styles.detailLabel}>Recipient name</span>
          <span style={styles.detailValueStrong}>{getPartyName(recipient)}</span>
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
                    background: index % 2 === 0 ? '#ffffff' : '#f9fafb',
                  }

                  return (
                    <tr key={`${index}-${displayValue(item.description)}`} style={rowStyle}>
                      <td style={joinStyles(styles.tableCellMuted, styles.numberCell)}>
                        {index + 1}
                      </td>
                      <td style={styles.tableCell}>{displayValue(item.description)}</td>
                      <td style={joinStyles(styles.tableCell, styles.quantityCell)}>
                        {displayValue(item.quantity)}
                      </td>
                      <td style={joinStyles(styles.tableCell, styles.moneyCell)}>
                        {formatMoney(item.unit_price)}
                      </td>
                      <td style={joinStyles(styles.tableCell, styles.moneyCell)}>
                        {formatMoney(item.amount)}
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
            <span>{formatMoney(subtotal)}</span>
          </div>
          <div style={styles.totalRow}>
            <span>Tax</span>
            <span>{formatMoney(tax)}</span>
          </div>
          <div style={styles.totalAmountRow}>
            <span>Total Amount</span>
            <span>{formatMoney(totalAmount)}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

function ToggleButton({ active, children, onClick }) {
  return (
    <button
      style={joinStyles(styles.toggleButton, active ? styles.toggleButtonActive : null)}
      type="button"
      onClick={onClick}
    >
      {children}
    </button>
  )
}

function ResultsPanel({ data }) {
  const [viewMode, setViewMode] = useState('text')
  const deferredData = useDeferredValue(data)

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
        <h2 style={styles.heading}>Results</h2>
        <div style={styles.toggle}>
          <ToggleButton active={viewMode === 'text'} onClick={() => setViewMode('text')}>
            Text
          </ToggleButton>
          <ToggleButton active={viewMode === 'json'} onClick={() => setViewMode('json')}>
            JSON
          </ToggleButton>
        </div>
      </div>

      {viewMode === 'text' ? (
        <InvoiceTextView data={deferredData} />
      ) : (
        <pre style={styles.jsonResults}>{renderHighlightedJson(deferredData)}</pre>
      )}
    </section>
  )
}

export default ResultsPanel
