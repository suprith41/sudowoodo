import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Bar,
  BarChart,
  Cell,
  CartesianGrid,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { historyStorageKey, loadStoredHistory } from './lib/history'

const chartColors = ['#1d4ed8', '#2563eb', '#3b82f6', '#60a5fa', '#93c5fd', '#38bdf8']
const dash = '—'

const styles = {
  page: {
    display: 'grid',
    gap: '28px',
  },
  nav: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '20px',
    padding: '18px 24px',
    border: '1px solid var(--panel-border)',
    borderRadius: '24px',
    background: 'var(--panel)',
    boxShadow: 'var(--panel-shadow)',
    backdropFilter: 'blur(18px)',
  },
  navLeft: {
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '18px',
  },
  logo: {
    color: 'var(--heading)',
    fontSize: '0.92rem',
    fontWeight: 900,
    letterSpacing: '0.18em',
    textDecoration: 'none',
  },
  navLink: {
    color: 'var(--muted)',
    fontSize: '0.92rem',
    fontWeight: 700,
    textDecoration: 'none',
  },
  navLinkActive: {
    color: 'var(--blue-accent)',
  },
  navButton: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '44px',
    padding: '0 18px',
    borderRadius: '999px',
    background: 'var(--blue-accent)',
    color: '#ffffff',
    fontSize: '0.94rem',
    fontWeight: 800,
    textDecoration: 'none',
    boxShadow: '0 14px 32px rgba(29, 78, 216, 0.24)',
  },
  hero: {
    display: 'grid',
    gap: '12px',
  },
  eyebrow: {
    margin: 0,
    color: 'var(--blue-accent)',
    fontSize: '0.82rem',
    fontWeight: 900,
    letterSpacing: '0.16em',
    textTransform: 'uppercase',
  },
  title: {
    margin: 0,
    color: 'var(--heading)',
    fontSize: 'clamp(2rem, 4vw, 3.15rem)',
    lineHeight: 1,
    fontWeight: 900,
  },
  subtitle: {
    margin: 0,
    maxWidth: '760px',
    color: 'var(--text)',
    fontSize: '1rem',
    lineHeight: 1.65,
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '18px',
  },
  metricCard: {
    display: 'grid',
    gap: '10px',
    padding: '22px',
    border: '1px solid var(--panel-border)',
    borderRadius: '22px',
    background: 'var(--panel)',
    boxShadow: 'var(--panel-shadow)',
    backdropFilter: 'blur(18px)',
  },
  metricLabel: {
    color: 'var(--muted)',
    fontSize: '0.86rem',
    fontWeight: 800,
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
  },
  metricValue: {
    color: 'var(--heading)',
    fontSize: '2rem',
    lineHeight: 1,
    fontWeight: 900,
  },
  metricHint: {
    color: 'var(--text)',
    fontSize: '0.9rem',
    lineHeight: 1.5,
  },
  chartsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
    gap: '20px',
  },
  chartCard: {
    display: 'grid',
    gap: '18px',
    minHeight: '380px',
    padding: '22px',
    border: '1px solid var(--panel-border)',
    borderRadius: '24px',
    background: 'var(--panel)',
    boxShadow: 'var(--panel-shadow)',
    backdropFilter: 'blur(18px)',
  },
  sectionLabel: {
    margin: 0,
    color: 'var(--heading)',
    fontSize: '1.1rem',
    fontWeight: 850,
  },
  sectionSubtext: {
    margin: 0,
    color: 'var(--muted)',
    fontSize: '0.92rem',
    lineHeight: 1.55,
  },
  chartBody: {
    minHeight: '290px',
  },
  tableCard: {
    display: 'grid',
    gap: '18px',
    padding: '22px',
    border: '1px solid var(--panel-border)',
    borderRadius: '24px',
    background: 'var(--panel)',
    boxShadow: 'var(--panel-shadow)',
    backdropFilter: 'blur(18px)',
  },
  tableWrap: {
    overflowX: 'auto',
    border: '1px solid var(--border)',
    borderRadius: '18px',
    background: 'var(--card-bg)',
  },
  table: {
    width: '100%',
    minWidth: '760px',
    borderCollapse: 'collapse',
  },
  th: {
    padding: '14px 16px',
    borderBottom: '1px solid var(--border)',
    background: 'var(--card-bg-soft)',
    color: 'var(--heading)',
    fontSize: '0.84rem',
    fontWeight: 800,
    letterSpacing: '0.06em',
    textAlign: 'left',
    textTransform: 'uppercase',
  },
  td: {
    padding: '15px 16px',
    borderBottom: '1px solid var(--border-soft)',
    color: 'var(--text-primary)',
    fontSize: '0.93rem',
    verticalAlign: 'top',
  },
  typeCell: {
    fontWeight: 800,
    color: 'var(--blue-accent)',
  },
  issuerCell: {
    fontWeight: 650,
  },
  statusBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    minHeight: '28px',
    padding: '4px 10px',
    borderRadius: '999px',
    background: 'rgba(34, 197, 94, 0.14)',
    color: '#15803d',
    fontSize: '0.82rem',
    fontWeight: 800,
    border: '1px solid rgba(34, 197, 94, 0.24)',
  },
  emptyCard: {
    display: 'grid',
    justifyItems: 'start',
    gap: '16px',
    padding: '28px',
    border: '1px dashed var(--border)',
    borderRadius: '24px',
    background: 'var(--panel)',
    boxShadow: 'var(--panel-shadow)',
    backdropFilter: 'blur(18px)',
  },
  emptyTitle: {
    margin: 0,
    color: 'var(--heading)',
    fontSize: '1.3rem',
    fontWeight: 850,
  },
  emptyText: {
    margin: 0,
    color: 'var(--text)',
    fontSize: '0.98rem',
    lineHeight: 1.65,
  },
  emptyButton: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '46px',
    padding: '0 18px',
    borderRadius: '999px',
    background: 'var(--blue-accent)',
    color: '#ffffff',
    fontSize: '0.94rem',
    fontWeight: 800,
    textDecoration: 'none',
    boxShadow: '0 14px 32px rgba(29, 78, 216, 0.24)',
  },
}

function unwrapValue(value) {
  if (
    value &&
    typeof value === 'object' &&
    !Array.isArray(value) &&
    'value' in value &&
    'confidence' in value
  ) {
    return unwrapValue(value.value)
  }

  if (Array.isArray(value)) {
    return value.map(unwrapValue)
  }

  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([key, nested]) => [key, unwrapValue(nested)]))
  }

  return value
}

function displayValue(value) {
  const normalizedValue = unwrapValue(value)

  if (normalizedValue === null || normalizedValue === undefined || normalizedValue === '') {
    return null
  }

  if (Array.isArray(normalizedValue)) {
    return normalizedValue.map(displayValue).find(Boolean) ?? null
  }

  if (typeof normalizedValue === 'object') {
    return (
      normalizedValue.name ??
      normalizedValue.title ??
      normalizedValue.company ??
      normalizedValue.organization ??
      Object.values(normalizedValue).map(displayValue).find(Boolean) ??
      null
    )
  }

  return String(normalizedValue)
}

function prettifyLabel(value) {
  if (!value) {
    return 'Unknown'
  }

  return String(value)
    .replaceAll('_', ' ')
    .replace(/\b\w/g, (character) => character.toUpperCase())
}

function getDocumentType(data) {
  return prettifyLabel(displayValue(data?.document_type ?? data?.type))
}

function getIssuer(data) {
  return (
    displayValue(data?.issuer) ??
    displayValue(data?.issuer_name) ??
    displayValue(data?.vendor) ??
    displayValue(data?.seller) ??
    displayValue(data?.from) ??
    'Unknown issuer'
  )
}

function getDocumentDate(data) {
  return (
    displayValue(data?.document_date) ??
    displayValue(data?.invoice_date) ??
    displayValue(data?.statement_date) ??
    displayValue(data?.date) ??
    null
  )
}

function formatDate(value, options) {
  if (!value) {
    return dash
  }

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return String(value)
  }

  return new Intl.DateTimeFormat(undefined, options).format(date)
}

function countExtractedFields(value) {
  const normalizedValue = unwrapValue(value)

  if (normalizedValue === null || normalizedValue === undefined || normalizedValue === '') {
    return 0
  }

  if (Array.isArray(normalizedValue)) {
    return normalizedValue.reduce((sum, item) => sum + countExtractedFields(item), 0)
  }

  if (typeof normalizedValue === 'object') {
    return Object.values(normalizedValue).reduce((sum, item) => sum + countExtractedFields(item), 0)
  }

  return 1
}

function buildLastSevenDays(history) {
  const formatter = new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
  })
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(today)
    date.setDate(today.getDate() - (6 - index))
    const key = date.toISOString().slice(0, 10)
    const count = history.reduce((total, item) => {
      const extractedDate = new Date(item.extractedAt)

      if (Number.isNaN(extractedDate.getTime())) {
        return total
      }

      const extractedKey = new Date(
        extractedDate.getFullYear(),
        extractedDate.getMonth(),
        extractedDate.getDate(),
      )
        .toISOString()
        .slice(0, 10)

      return extractedKey === key ? total + 1 : total
    }, 0)

    return {
      label: formatter.format(date),
      count,
    }
  })
}

function buildTypeBreakdown(history) {
  const counts = new Map()

  history.forEach((item) => {
    const type = getDocumentType(item.data)
    counts.set(type, (counts.get(type) ?? 0) + 1)
  })

  return Array.from(counts.entries())
    .map(([name, value]) => ({ name, value }))
    .sort((left, right) => right.value - left.value)
}

function getMostUsedSchema(history) {
  const breakdown = buildTypeBreakdown(history)
  return breakdown[0]?.name ?? dash
}

function formatAverage(value) {
  if (!Number.isFinite(value)) {
    return '0'
  }

  const rounded = Math.round(value * 10) / 10
  return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1)
}

function Dashboard() {
  const [history, setHistory] = useState(loadStoredHistory)

  useEffect(() => {
    function handleStorage(event) {
      if (!event.key || event.key === historyStorageKey) {
        setHistory(loadStoredHistory())
      }
    }

    window.addEventListener('storage', handleStorage)
    return () => window.removeEventListener('storage', handleStorage)
  }, [])

  const hasHistory = history.length > 0

  if (!hasHistory) {
    return (
      <div style={styles.page}>
        <nav style={styles.nav}>
          <div style={styles.navLeft}>
            <Link style={styles.logo} to="/">
              SUDOWOODO
            </Link>
            <Link style={styles.navLink} to="/docs">
              API Docs
            </Link>
            <Link style={styles.navLink} to="/batch">
              Batch
            </Link>
            <Link style={joinStyles(styles.navLink, styles.navLinkActive)} to="/dashboard">
              Dashboard
            </Link>
          </div>
          <Link style={styles.navButton} to="/app">
            Open App
          </Link>
        </nav>

        <section style={styles.hero}>
          <p style={styles.eyebrow}>Analytics Dashboard</p>
          <h1 style={styles.title}>Your extraction activity, at a glance.</h1>
          <p style={styles.subtitle}>
            Sudowoodo tracks local extraction history so you can quickly understand volume,
            document mix, and recent outputs.
          </p>
        </section>

        <section style={styles.emptyCard}>
          <h2 style={styles.emptyTitle}>No extractions yet. Start by uploading a document.</h2>
          <p style={styles.emptyText}>
            Run your first extraction in the app and this dashboard will fill in with metrics,
            charts, and your most recent structured outputs.
          </p>
          <Link style={styles.emptyButton} to="/app">
            Go to App
          </Link>
        </section>
      </div>
    )
  }

  const totalExtractions = history.length
  const successCount = history.filter((item) => (item.status ?? 'success') === 'success').length
  const successRate = totalExtractions ? Math.round((successCount / totalExtractions) * 100) : 0
  const averageFieldsExtracted =
    totalExtractions > 0
      ? history.reduce((sum, item) => sum + countExtractedFields(item.data), 0) / totalExtractions
      : 0
  const mostUsedSchema = getMostUsedSchema(history)
  const dailyData = buildLastSevenDays(history)
  const typeBreakdown = buildTypeBreakdown(history)
  const recentExtractions = history.slice(0, 10)

  return (
    <div style={styles.page}>
      <nav style={styles.nav}>
        <div style={styles.navLeft}>
          <Link style={styles.logo} to="/">
            SUDOWOODO
          </Link>
          <Link style={styles.navLink} to="/docs">
            API Docs
          </Link>
          <Link style={styles.navLink} to="/batch">
            Batch
          </Link>
          <Link style={joinStyles(styles.navLink, styles.navLinkActive)} to="/dashboard">
            Dashboard
          </Link>
        </div>
        <Link style={styles.navButton} to="/app">
          Open App
        </Link>
      </nav>

      <section style={styles.hero}>
        <p style={styles.eyebrow}>Analytics Dashboard</p>
        <h1 style={styles.title}>Track what Sudowoodo has extracted recently.</h1>
        <p style={styles.subtitle}>
          These metrics are computed from your browser’s local extraction history, so the dashboard
          updates as you keep using the app on this device.
        </p>
      </section>

      <section style={styles.statsGrid}>
        <article style={styles.metricCard}>
          <span style={styles.metricLabel}>Total Extractions</span>
          <strong style={styles.metricValue}>{totalExtractions}</strong>
          <span style={styles.metricHint}>Counted from local storage history on this browser.</span>
        </article>

        <article style={styles.metricCard}>
          <span style={styles.metricLabel}>Success Rate</span>
          <strong style={styles.metricValue}>{successRate}%</strong>
          <span style={styles.metricHint}>Based on extraction entries recorded as successful.</span>
        </article>

        <article style={styles.metricCard}>
          <span style={styles.metricLabel}>Most Used Schema</span>
          <strong style={styles.metricValue}>{mostUsedSchema}</strong>
          <span style={styles.metricHint}>The document type that appears most often in history.</span>
        </article>

        <article style={styles.metricCard}>
          <span style={styles.metricLabel}>Avg Fields Extracted</span>
          <strong style={styles.metricValue}>{formatAverage(averageFieldsExtracted)}</strong>
          <span style={styles.metricHint}>Average leaf-field count across saved extractions.</span>
        </article>
      </section>

      <section style={styles.chartsGrid}>
        <article style={styles.chartCard}>
          <div>
            <h2 style={styles.sectionLabel}>Extractions Per Day</h2>
            <p style={styles.sectionSubtext}>Extraction activity over the last 7 days.</p>
          </div>
          <div style={styles.chartBody}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyData} margin={{ top: 12, right: 12, left: -16, bottom: 4 }}>
                <CartesianGrid stroke="var(--border-soft)" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="label" tick={{ fill: 'var(--muted)', fontSize: 12 }} tickLine={false} axisLine={false} />
                <YAxis allowDecimals={false} tick={{ fill: 'var(--muted)', fontSize: 12 }} tickLine={false} axisLine={false} />
                <Tooltip
                  cursor={{ fill: 'rgba(29, 78, 216, 0.08)' }}
                  contentStyle={{
                    borderRadius: '14px',
                    border: '1px solid var(--border)',
                    background: 'var(--card-bg)',
                    boxShadow: 'var(--shadow)',
                  }}
                />
                <Bar dataKey="count" name="Extractions" radius={[10, 10, 0, 0]} fill="#1d4ed8" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </article>

        <article style={styles.chartCard}>
          <div>
            <h2 style={styles.sectionLabel}>Document Type Breakdown</h2>
            <p style={styles.sectionSubtext}>The mix of extracted document types in local history.</p>
          </div>
          <div style={styles.chartBody}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={typeBreakdown}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={62}
                  outerRadius={96}
                  paddingAngle={3}
                >
                  {typeBreakdown.map((entry, index) => (
                    <Cell key={entry.name} fill={chartColors[index % chartColors.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    borderRadius: '14px',
                    border: '1px solid var(--border)',
                    background: 'var(--card-bg)',
                    boxShadow: 'var(--shadow)',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: 12, color: 'var(--muted)' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </article>
      </section>

      <section style={styles.tableCard}>
        <div>
          <h2 style={styles.sectionLabel}>Recent Extractions</h2>
          <p style={styles.sectionSubtext}>The last 10 extractions recorded in browser history.</p>
        </div>

        <div style={styles.tableWrap}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Document Type</th>
                <th style={styles.th}>Issuer</th>
                <th style={styles.th}>Date</th>
                <th style={styles.th}>Fields Extracted</th>
                <th style={styles.th}>Status</th>
              </tr>
            </thead>
            <tbody>
              {recentExtractions.map((item) => (
                <tr key={item.id}>
                  <td style={joinStyles(styles.td, styles.typeCell)}>{getDocumentType(item.data)}</td>
                  <td style={joinStyles(styles.td, styles.issuerCell)}>{getIssuer(item.data)}</td>
                  <td style={styles.td}>
                    {formatDate(getDocumentDate(item.data) ?? item.extractedAt, {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </td>
                  <td style={styles.td}>{countExtractedFields(item.data)}</td>
                  <td style={styles.td}>
                    <span style={styles.statusBadge}>Success</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}

function joinStyles(...styleObjects) {
  return Object.assign({}, ...styleObjects)
}

export default Dashboard
