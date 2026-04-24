import { useCallback, useDeferredValue, useEffect, useRef, useState } from 'react'

const dash = '—'
const loadingMessages = [
  'Reading document...',
  'Analyzing layout...',
  'Extracting fields...',
  'Validating JSON...',
  'Almost done...',
]
const exportOptions = [
  { id: 'download-json', label: 'Download JSON' },
  { id: 'download-csv', label: 'Download CSV' },
  { id: 'copy-json', label: 'Copy JSON' },
  { id: 'copy-table', label: 'Copy as Table' },
  { id: 'google-sheets', label: 'Export to Google Sheets' },
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
  exportMenuWrap: {
    position: 'relative',
  },
  exportButton: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '10px',
  },
  exportButtonOpen: {
    background: '#163fae',
    borderColor: '#163fae',
  },
  exportButtonLabel: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
  },
  chevron: {
    width: '16px',
    height: '16px',
    flexShrink: 0,
    transform: 'rotate(0deg)',
    transition: 'transform 180ms ease',
  },
  chevronOpen: {
    transform: 'rotate(180deg)',
  },
  exportMenu: {
    position: 'absolute',
    top: 'calc(100% + 10px)',
    right: 0,
    minWidth: '220px',
    padding: '8px',
    border: '1px solid var(--border)',
    borderRadius: '12px',
    background: 'var(--card-bg)',
    boxShadow: '0 18px 38px rgba(15, 23, 42, 0.18)',
    zIndex: 10,
  },
  exportMenuItem: {
    width: '100%',
    border: 0,
    borderRadius: '10px',
    background: 'transparent',
    color: 'var(--text-primary)',
    cursor: 'pointer',
    display: 'block',
    font: 'inherit',
    fontSize: '0.92rem',
    fontWeight: 600,
    padding: '11px 12px',
    textAlign: 'left',
    transition: 'background-color 140ms ease, color 140ms ease',
  },
  exportMenuItemHover: {
    background: 'var(--blue-accent-soft)',
    color: 'var(--blue-accent-text)',
  },
  exportFeedback: {
    color: 'var(--text-secondary)',
    fontSize: '0.82rem',
    fontWeight: 700,
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
  emptyState: {
    minHeight: '420px',
    display: 'grid',
    placeItems: 'center',
    padding: '24px',
  },
  emptyStateContent: {
    display: 'grid',
    justifyItems: 'center',
    gap: '12px',
    maxWidth: '320px',
    textAlign: 'center',
  },
  emptyStateIcon: {
    display: 'grid',
    placeItems: 'center',
    width: '76px',
    height: '76px',
    borderRadius: '24px',
    background: 'var(--blue-accent-soft)',
    border: '1px solid var(--border)',
    color: 'var(--blue-accent-text)',
    fontSize: '2.2rem',
    boxShadow: '0 14px 28px rgba(29, 78, 216, 0.12)',
  },
  emptyStateTitle: {
    margin: 0,
    color: 'var(--text-primary)',
    fontSize: '1.08rem',
    fontWeight: 800,
  },
  emptyStateSubtext: {
    margin: 0,
    color: 'var(--text-secondary)',
    fontSize: '0.94rem',
    lineHeight: 1.5,
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

function unwrapExportValue(value) {
  if (isConfidenceWrapper(value)) {
    return unwrapExportValue(value.value)
  }

  if (Array.isArray(value)) {
    return value.map(unwrapExportValue)
  }

  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, nestedValue]) => [key, unwrapExportValue(nestedValue)]),
    )
  }

  return value
}

function flattenRows(value, prefix = '') {
  const normalizedValue = unwrapExportValue(value)

  if (Array.isArray(normalizedValue)) {
    if (!normalizedValue.length) {
      return prefix ? [{ [prefix]: '' }] : [{}]
    }

    return normalizedValue.flatMap((item, index) =>
      flattenRows(item, prefix ? `${prefix}.${index}` : String(index)),
    )
  }

  if (normalizedValue && typeof normalizedValue === 'object') {
    const entries = Object.entries(normalizedValue)

    if (!entries.length) {
      return prefix ? [{ [prefix]: '' }] : [{}]
    }

    let rows = [{}]

    for (const [key, nestedValue] of entries) {
      const nestedPrefix = prefix ? `${prefix}.${key}` : key
      const nestedRows = flattenRows(nestedValue, nestedPrefix)

      rows = rows.flatMap((row) => nestedRows.map((nestedRow) => ({ ...row, ...nestedRow })))
    }

    return rows
  }

  return [{ [prefix || 'value']: normalizedValue ?? '' }]
}

function getExportRows(value) {
  const rows = flattenRows(value)
  return rows.length ? rows : [{}]
}

function getExportColumns(rows) {
  const seen = new Set()

  rows.forEach((row) => {
    Object.keys(row).forEach((key) => {
      if (!seen.has(key)) {
        seen.add(key)
      }
    })
  })

  return seen.size ? Array.from(seen) : ['value']
}

function formatExportCellValue(value) {
  if (value === null || value === undefined) {
    return ''
  }

  if (typeof value === 'object') {
    return JSON.stringify(value)
  }

  return String(value)
}

function escapeCsvValue(value) {
  const text = formatExportCellValue(value)

  if (!/[",\n]/.test(text)) {
    return text
  }

  return `"${text.replaceAll('"', '""')}"`
}

function rowsToDelimitedText(rows, columns, delimiter = ',') {
  return [
    columns.map((column) => escapeCsvValue(column)).join(delimiter),
    ...rows.map((row) =>
      columns.map((column) => escapeCsvValue(row[column] ?? '')).join(delimiter),
    ),
  ].join('\n')
}

function escapeMarkdownCell(value) {
  return formatExportCellValue(value).replaceAll('|', '\\|').replaceAll('\n', '<br />')
}

function rowsToMarkdownTable(rows, columns) {
  const header = `| ${columns.map(escapeMarkdownCell).join(' | ')} |`
  const separator = `| ${columns.map(() => '---').join(' | ')} |`
  const body = rows.map(
    (row) => `| ${columns.map((column) => escapeMarkdownCell(row[column] ?? '')).join(' | ')} |`,
  )

  return [header, separator, ...body].join('\n')
}

function downloadTextFile(content, filename, type) {
  const blob = new Blob([content], { type })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')

  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

async function copyTextToClipboard(text) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text)
    return
  }

  const textArea = document.createElement('textarea')
  textArea.value = text
  textArea.setAttribute('readonly', '')
  textArea.style.position = 'fixed'
  textArea.style.opacity = '0'
  document.body.appendChild(textArea)
  textArea.select()
  document.execCommand('copy')
  document.body.removeChild(textArea)
}

function buildGoogleSheetsUrl(json) {
  return `https://docs.google.com/spreadsheets/create?usp=sheets_web#sudowoodo-json=${encodeURIComponent(json)}`
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

function ResultsPanel({
  data,
  loading = false,
  pagesProcessed = null,
  warning = null,
  onRegisterActions = null,
}) {
  const [selectedView, setSelectedView] = useState('text')
  const [renderedView, setRenderedView] = useState('text')
  const [transitionView, setTransitionView] = useState(null)
  const [exportMenuOpen, setExportMenuOpen] = useState(false)
  const [exportFeedback, setExportFeedback] = useState('')
  const [hoveredExportOption, setHoveredExportOption] = useState(null)
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0)
  const [contentAnimationKey, setContentAnimationKey] = useState(0)
  const deferredData = useDeferredValue(data)
  const exportFeedbackTimer = useRef(null)
  const exportMenuRef = useRef(null)
  const tabTransitionTimer = useRef(null)

  useEffect(() => {
    return () => {
      if (exportFeedbackTimer.current) {
        clearTimeout(exportFeedbackTimer.current)
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
      setExportMenuOpen(false)
    }
  }, [deferredData, loading])

  useEffect(() => {
    if (deferredData) {
      setContentAnimationKey((currentKey) => currentKey + 1)
    }
  }, [deferredData])

  const handleViewChange = useCallback((nextView) => {
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
  }, [renderedView, selectedView])

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

  useEffect(() => {
    if (!exportMenuOpen) {
      return undefined
    }

    function handlePointerDown(event) {
      if (!exportMenuRef.current?.contains(event.target)) {
        setExportMenuOpen(false)
        setHoveredExportOption(null)
      }
    }

    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('touchstart', handlePointerDown)

    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('touchstart', handlePointerDown)
    }
  }, [exportMenuOpen])

  const showExportFeedback = useCallback((message) => {
    setExportFeedback(message)

    if (exportFeedbackTimer.current) {
      clearTimeout(exportFeedbackTimer.current)
    }

    exportFeedbackTimer.current = setTimeout(() => {
      setExportFeedback('')
      exportFeedbackTimer.current = null
    }, 2200)
  }, [])

  function getTabularExport() {
    const rows = getExportRows(deferredData)
    const columns = getExportColumns(rows)

    return { rows, columns }
  }

  const handleCopyJson = useCallback(async () => {
    await copyTextToClipboard(stringifyJson(deferredData))
    showExportFeedback('JSON copied')
  }, [deferredData, showExportFeedback])

  const handleDownloadJson = useCallback(() => {
    downloadTextFile(
      stringifyJson(deferredData),
      'sudowoodo-output.json',
      'application/json;charset=utf-8',
    )
    showExportFeedback('JSON downloaded')
  }, [deferredData, showExportFeedback])

  function handleDownloadCsv() {
    const { rows, columns } = getTabularExport()
    const csv = rowsToDelimitedText(rows, columns)

    downloadTextFile(csv, 'sudowoodo-output.csv', 'text/csv;charset=utf-8')
    showExportFeedback('CSV downloaded')
  }

  async function handleCopyTable() {
    const { rows, columns } = getTabularExport()
    const table = rowsToMarkdownTable(rows, columns)

    await copyTextToClipboard(table)
    showExportFeedback('Table copied')
  }

  async function handleExportToGoogleSheets() {
    const { rows, columns } = getTabularExport()
    const sheetReadyText = rowsToDelimitedText(rows, columns, '\t')
    const googleSheetsUrl = buildGoogleSheetsUrl(stringifyJson(deferredData))

    // Google Sheets doesn't expose a supported unauthenticated URL for cell prefill,
    // so this opens a new sheet and places sheet-ready data on the clipboard.
    window.open(googleSheetsUrl, '_blank', 'noopener,noreferrer')
    await copyTextToClipboard(sheetReadyText)
    showExportFeedback('Sheets tab opened')
  }

  async function runExportAction(action) {
    try {
      setExportMenuOpen(false)
      setHoveredExportOption(null)
      await action()
    } catch (error) {
      console.error(error)
      showExportFeedback('Export failed')
    }
  }

  async function handleExportOptionSelect(optionId) {
    if (optionId === 'download-json') {
      await runExportAction(handleDownloadJson)
      return
    }

    if (optionId === 'download-csv') {
      await runExportAction(handleDownloadCsv)
      return
    }

    if (optionId === 'copy-json') {
      await runExportAction(handleCopyJson)
      return
    }

    if (optionId === 'copy-table') {
      await runExportAction(handleCopyTable)
      return
    }

    if (optionId === 'google-sheets') {
      await runExportAction(handleExportToGoogleSheets)
    }
  }

  useEffect(() => {
    if (!onRegisterActions) {
      return undefined
    }

    return () => onRegisterActions(null)
  }, [onRegisterActions])

  useEffect(() => {
    if (!onRegisterActions) {
      return undefined
    }

    onRegisterActions({
      hasData: Boolean(deferredData),
      selectedView,
      canDownloadJson: Boolean(deferredData) && !loading,
      canCopyJson: Boolean(deferredData) && !loading && selectedView === 'json',
      switchToText: () => handleViewChange('text'),
      switchToJson: () => handleViewChange('json'),
      downloadJson: handleDownloadJson,
      copyJson: handleCopyJson,
    })
  }, [
    deferredData,
    handleCopyJson,
    handleDownloadJson,
    handleViewChange,
    loading,
    onRegisterActions,
    selectedView,
  ])

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
        <div style={styles.emptyState}>
          <div style={styles.emptyStateContent}>
            <div style={styles.emptyStateIcon} aria-hidden="true">
              🌿
            </div>
            <p style={styles.emptyStateTitle}>Your extracted data will appear here</p>
            <p style={styles.emptyStateSubtext}>
              Upload a document and click Extract to begin
            </p>
          </div>
        </div>
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
          <div ref={exportMenuRef} style={styles.exportMenuWrap}>
            <button
              aria-expanded={exportMenuOpen}
              aria-haspopup="menu"
              className="sudowoodo-pressable"
              style={joinStyles(
                styles.actionButton,
                styles.exportButton,
                exportMenuOpen ? styles.exportButtonOpen : null,
              )}
              type="button"
              onClick={() => setExportMenuOpen((currentValue) => !currentValue)}
            >
              <span style={styles.exportButtonLabel}>Export</span>
              <svg
                aria-hidden="true"
                style={joinStyles(styles.chevron, exportMenuOpen ? styles.chevronOpen : null)}
                viewBox="0 0 20 20"
                fill="none"
              >
                <path
                  d="M5 7.5 10 12.5 15 7.5"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.8"
                />
              </svg>
            </button>

            {exportMenuOpen ? (
              <div role="menu" style={styles.exportMenu}>
                {exportOptions.map((option) => (
                  <button
                    key={option.id}
                    className="sudowoodo-pressable"
                    role="menuitem"
                    style={joinStyles(
                      styles.exportMenuItem,
                      hoveredExportOption === option.id ? styles.exportMenuItemHover : null,
                    )}
                    type="button"
                    onClick={() => handleExportOptionSelect(option.id)}
                    onMouseEnter={() => setHoveredExportOption(option.id)}
                    onMouseLeave={() => setHoveredExportOption(null)}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            ) : null}
          </div>
          {exportFeedback ? <span style={styles.exportFeedback}>{exportFeedback}</span> : null}
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
