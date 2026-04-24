import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

const bugReportMailto = 'mailto:hello@sudowoodo.app?subject=Sudowoodo%20bug%20report'
const previewJsonLines = [
  '{',
  '  "document_type": "invoice",',
  '  "issuer": "Northstar Labs",',
  '  "recipient": "Acme Logistics",',
  '  "invoice_number": "INV-2048",',
  '  "line_items": [',
  '    { "description": "API usage", "amount": 2400 }',
  '  ],',
  '  "total_amount": 2592',
  '}',
]

const styles = {
  page: {
    minHeight: '100vh',
    color: 'var(--text-primary)',
    backgroundColor: 'var(--app-bg)',
    backgroundImage:
      'radial-gradient(circle at 1px 1px, rgba(29, 78, 216, 0.12) 1.1px, transparent 0), linear-gradient(180deg, var(--app-bg-soft) 0%, var(--app-bg) 100%)',
    backgroundSize: '24px 24px, auto',
    fontFamily:
      '"Avenir Next", "Inter", ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  },
  nav: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: 'min(1120px, calc(100% - 40px))',
    margin: '0 auto',
    padding: '24px 0',
  },
  logo: {
    color: 'var(--blue-accent)',
    fontSize: '1.05rem',
    fontWeight: 900,
    letterSpacing: '0.12em',
    textDecoration: 'none',
  },
  navLinks: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
  },
  navLink: {
    color: 'var(--text-secondary)',
    fontSize: '0.95rem',
    fontWeight: 700,
    textDecoration: 'none',
  },
  navButton: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '42px',
    borderRadius: '999px',
    background: 'var(--blue-accent)',
    color: '#ffffff',
    fontSize: '0.95rem',
    fontWeight: 800,
    padding: '0 18px',
    textDecoration: 'none',
    boxShadow: '0 10px 24px rgba(29, 78, 216, 0.24)',
  },
  hero: {
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1fr) minmax(360px, 0.9fr)',
    gap: '46px',
    alignItems: 'center',
    width: 'min(1120px, calc(100% - 40px))',
    minHeight: 'calc(100vh - 120px)',
    margin: '0 auto',
    padding: '44px 0 72px',
  },
  heroCopy: {
    display: 'grid',
    gap: '24px',
  },
  heroBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    width: 'fit-content',
    padding: '8px 14px',
    border: '1px solid rgba(29, 78, 216, 0.16)',
    borderRadius: '999px',
    background: 'rgba(29, 78, 216, 0.1)',
    color: 'var(--blue-accent-text)',
    fontSize: '0.82rem',
    fontWeight: 850,
  },
  headline: {
    maxWidth: '760px',
    margin: 0,
    color: 'var(--text-primary)',
    fontSize: 'clamp(3rem, 7vw, 5.8rem)',
    lineHeight: 0.96,
    fontWeight: 900,
    letterSpacing: '-0.04em',
  },
  subheadline: {
    maxWidth: '620px',
    margin: 0,
    color: 'var(--text-secondary)',
    fontSize: 'clamp(1.1rem, 2vw, 1.35rem)',
    lineHeight: 1.55,
  },
  ctaRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '14px',
    alignItems: 'center',
  },
  primaryButton: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '52px',
    borderRadius: '999px',
    border: '1px solid var(--blue-accent)',
    background: 'var(--blue-accent)',
    color: '#ffffff',
    fontSize: '1rem',
    fontWeight: 850,
    padding: '0 22px',
    textDecoration: 'none',
    boxShadow: '0 16px 34px rgba(29, 78, 216, 0.28)',
  },
  outlineButton: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '52px',
    borderRadius: '999px',
    border: '1px solid var(--border)',
    background: 'var(--card-bg)',
    color: 'var(--blue-accent)',
    fontSize: '1rem',
    fontWeight: 850,
    padding: '0 22px',
    textDecoration: 'none',
  },
  preview: {
    display: 'grid',
    gap: '18px',
    padding: '22px',
    border: '1px solid var(--border)',
    borderRadius: '30px',
    background:
      'linear-gradient(180deg, rgba(255, 255, 255, 0.08) 0%, rgba(29, 78, 216, 0.04) 100%), var(--card-bg)',
    boxShadow: '0 24px 50px rgba(15, 23, 42, 0.12)',
    backdropFilter: 'blur(18px)',
  },
  previewTop: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '12px',
  },
  previewTitle: {
    margin: 0,
    color: 'var(--text-primary)',
    fontSize: '1rem',
    fontWeight: 850,
  },
  previewBadge: {
    borderRadius: '999px',
    background: 'var(--blue-accent-soft)',
    color: 'var(--blue-accent-text)',
    fontSize: '0.78rem',
    fontWeight: 850,
    padding: '6px 10px',
  },
  previewStage: {
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 0.9fr) minmax(0, 1.1fr)',
    gap: '16px',
    alignItems: 'stretch',
  },
  documentCard: {
    position: 'relative',
    overflow: 'hidden',
    border: '1px solid var(--border-soft)',
    borderRadius: '22px',
    background: 'linear-gradient(180deg, #ffffff 0%, #f8fbff 100%)',
    minHeight: '300px',
    padding: '18px',
    boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.8)',
  },
  documentHeader: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: '12px',
    marginBottom: '18px',
  },
  documentBrand: {
    display: 'grid',
    gap: '6px',
  },
  documentTitle: {
    margin: 0,
    color: '#10203a',
    fontSize: '1rem',
    fontWeight: 900,
  },
  documentSubtext: {
    margin: 0,
    color: '#5e718e',
    fontSize: '0.82rem',
    lineHeight: 1.45,
  },
  documentBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    minHeight: '28px',
    padding: '4px 11px',
    borderRadius: '999px',
    background: '#dbeafe',
    color: '#1d4ed8',
    fontSize: '0.78rem',
    fontWeight: 850,
  },
  documentGrid: {
    display: 'grid',
    gap: '12px',
  },
  documentRow: {
    height: '10px',
    borderRadius: '999px',
    background: 'rgba(16, 32, 58, 0.08)',
  },
  documentRowStrong: {
    background: 'rgba(29, 78, 216, 0.18)',
  },
  documentTable: {
    display: 'grid',
    gap: '8px',
    marginTop: '8px',
    padding: '12px',
    borderRadius: '16px',
    border: '1px solid rgba(16, 32, 58, 0.08)',
    background: 'rgba(248, 251, 255, 0.92)',
  },
  tableRow: {
    display: 'grid',
    gridTemplateColumns: '1.4fr 0.5fr 0.7fr',
    gap: '8px',
  },
  tableCell: {
    height: '10px',
    borderRadius: '999px',
    background: 'rgba(16, 32, 58, 0.08)',
  },
  scanBar: {
    position: 'absolute',
    left: '14px',
    right: '14px',
    height: '54px',
    borderRadius: '18px',
    background: 'linear-gradient(180deg, rgba(37, 99, 235, 0.04) 0%, rgba(37, 99, 235, 0.12) 55%, rgba(37, 99, 235, 0.04) 100%)',
    border: '1px solid rgba(37, 99, 235, 0.12)',
    pointerEvents: 'none',
    boxShadow: '0 12px 24px rgba(37, 99, 235, 0.12)',
  },
  codePanel: {
    display: 'grid',
    gap: '10px',
    padding: '16px',
    border: '1px solid var(--border-soft)',
    borderRadius: '22px',
    background: 'var(--json-bg)',
    fontFamily:
      '"SFMono-Regular", Consolas, "Liberation Mono", Menlo, Courier, monospace',
    fontSize: '0.84rem',
    color: 'var(--json-text)',
    minHeight: '300px',
  },
  codeLine: {
    margin: 0,
    minHeight: '1.2em',
    whiteSpace: 'pre-wrap',
  },
  codeLineKey: {
    color: '#93c5fd',
  },
  codeLineValue: {
    color: '#bbf7d0',
  },
  codeCursor: {
    display: 'inline-block',
    width: '8px',
    height: '1.05em',
    borderRadius: '2px',
    background: '#60a5fa',
    verticalAlign: 'text-bottom',
    marginLeft: '2px',
  },
  section: {
    width: 'min(1120px, calc(100% - 40px))',
    margin: '0 auto',
    padding: '72px 0',
  },
  sectionHeader: {
    display: 'grid',
    gap: '10px',
    marginBottom: '28px',
  },
  sectionTitle: {
    margin: 0,
    color: 'var(--text-primary)',
    fontSize: '2.2rem',
    lineHeight: 1.1,
    fontWeight: 900,
    letterSpacing: '-0.03em',
  },
  sectionSubtitle: {
    margin: 0,
    color: 'var(--text-secondary)',
    fontSize: '1rem',
  },
  steps: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
    gap: '16px',
  },
  stepCard: {
    display: 'grid',
    gap: '14px',
    padding: '20px',
    border: '1px solid var(--border)',
    borderRadius: '22px',
    background: 'var(--card-bg)',
    boxShadow: 'var(--shadow)',
  },
  stepTop: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '12px',
  },
  stepIcon: {
    display: 'grid',
    placeItems: 'center',
    width: '44px',
    height: '44px',
    borderRadius: '14px',
    background: 'var(--blue-accent-soft)',
    color: 'var(--blue-accent-text)',
    fontSize: '1.35rem',
  },
  stepNumber: {
    color: 'var(--text-secondary)',
    fontSize: '0.86rem',
    fontWeight: 900,
  },
  stepTitle: {
    margin: 0,
    color: 'var(--text-primary)',
    fontSize: '1.08rem',
    fontWeight: 850,
  },
  stepText: {
    margin: 0,
    color: 'var(--text-secondary)',
    fontSize: '0.95rem',
    lineHeight: 1.5,
  },
  docGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
    gap: '16px',
  },
  docCard: {
    display: 'grid',
    gridTemplateColumns: 'auto minmax(0, 1fr)',
    gap: '14px',
    alignItems: 'start',
    padding: '20px',
    border: '1px solid var(--border)',
    borderRadius: '22px',
    background: 'var(--card-bg)',
    boxShadow: 'var(--shadow)',
  },
  emoji: {
    display: 'grid',
    placeItems: 'center',
    width: '44px',
    height: '44px',
    borderRadius: '14px',
    background: 'var(--card-bg-soft)',
    fontSize: '1.35rem',
  },
  docTitle: {
    margin: '0 0 5px',
    color: 'var(--text-primary)',
    fontSize: '1.02rem',
    fontWeight: 850,
  },
  docText: {
    margin: 0,
    color: 'var(--text-secondary)',
    fontSize: '0.93rem',
    lineHeight: 1.45,
  },
  footer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: '16px',
    width: 'min(1120px, calc(100% - 40px))',
    margin: '0 auto',
    padding: '32px 0 42px',
    borderTop: '1px solid var(--border)',
    color: 'var(--text-secondary)',
    fontSize: '0.95rem',
  },
  footerLink: {
    color: 'var(--blue-accent)',
    fontWeight: 800,
    textDecoration: 'none',
  },
}

const steps = [
  {
    icon: '📄',
    title: 'Upload',
    text: 'Drop any PDF or image',
  },
  {
    icon: '🧩',
    title: 'Define',
    text: 'Set your JSON schema',
  },
  {
    icon: '⚡',
    title: 'Extract',
    text: 'AI reads the document',
  },
  {
    icon: '📦',
    title: 'Export',
    text: 'Copy or download JSON',
  },
]

const supportedDocuments = [
  {
    icon: '🧾',
    title: 'Invoice',
    text: 'Line items, totals, tax, parties, and dates.',
  },
  {
    icon: '🛒',
    title: 'Receipt',
    text: 'Store details, purchases, payment method, and totals.',
  },
  {
    icon: '🏥',
    title: 'Medical Record',
    text: 'Patient details, diagnosis, medications, and notes.',
  },
  {
    icon: '✍️',
    title: 'Contract',
    text: 'Parties, terms, dates, and contract values.',
  },
  {
    icon: '🏦',
    title: 'Bank Statement',
    text: 'Transactions, balances, account data, and periods.',
  },
  {
    icon: '🪪',
    title: 'ID Card',
    text: 'Names, identifiers, dates, and issuing details.',
  },
]

function LandingPage() {
  const [scanProgress, setScanProgress] = useState(0)
  const [lineIndex, setLineIndex] = useState(0)
  const [charIndex, setCharIndex] = useState(0)

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setScanProgress((current) => (current + 3) % 108)
    }, 70)

    return () => window.clearInterval(intervalId)
  }, [])

  useEffect(() => {
    const activeLine = previewJsonLines[lineIndex] ?? ''
    const isTypingLine = charIndex < activeLine.length
    const timeoutId = window.setTimeout(() => {
      if (isTypingLine) {
        setCharIndex((current) => current + 1)
        return
      }

      if (lineIndex < previewJsonLines.length - 1) {
        setLineIndex((current) => current + 1)
        setCharIndex(0)
        return
      }

      setLineIndex(0)
      setCharIndex(0)
    }, isTypingLine ? 36 : 720)

    return () => window.clearTimeout(timeoutId)
  }, [charIndex, lineIndex])

  return (
    <div style={styles.page}>
      <nav style={styles.nav}>
        <div style={styles.navLinks}>
          <Link style={styles.logo} to="/">
            SUDOWOODO
          </Link>
          <Link style={styles.navLink} to="/dashboard">
            Dashboard
          </Link>
          <Link style={styles.navLink} to="/batch">
            Batch
          </Link>
          <Link style={styles.navLink} to="/docs">
            API Docs
          </Link>
        </div>
        <Link style={styles.navButton} to="/app">
          Try it free
        </Link>
      </nav>

      <main>
        <section style={styles.hero}>
          <div style={styles.heroCopy}>
            <span style={styles.heroBadge}>Powered by Groq ⚡</span>
            <h1 style={styles.headline}>Turn any document into structured JSON — instantly</h1>
            <p style={styles.subheadline}>
              Watch Sudowoodo scan a live document preview, structure fields as they appear,
              and hand you extraction-ready JSON in seconds.
            </p>
            <div style={styles.ctaRow}>
              <Link style={styles.primaryButton} to="/app">
                Start Extracting →
              </Link>
              <a
                style={styles.outlineButton}
                href="https://github.com/suprith41/sudowoodo"
                rel="noreferrer"
                target="_blank"
              >
                View on GitHub
              </a>
            </div>
          </div>

          <div style={styles.preview} aria-hidden="true">
            <div style={styles.previewTop}>
              <p style={styles.previewTitle}>Live extraction preview</p>
              <span style={styles.previewBadge}>JSON typing live</span>
            </div>

            <div style={styles.previewStage}>
              <div style={styles.documentCard}>
                <div
                  style={{
                    ...styles.scanBar,
                    top: `${18 + (scanProgress / 108) * 210}px`,
                  }}
                />
                <div style={styles.documentHeader}>
                  <div style={styles.documentBrand}>
                    <p style={styles.documentTitle}>Northstar Labs</p>
                    <p style={styles.documentSubtext}>Invoice INV-2048</p>
                  </div>
                  <span style={styles.documentBadge}>Extracting</span>
                </div>
                <div style={styles.documentGrid}>
                  <div style={{ ...styles.documentRow, ...styles.documentRowStrong, width: '68%' }} />
                  <div style={{ ...styles.documentRow, width: '54%' }} />
                  <div style={{ ...styles.documentRow, width: '80%' }} />
                </div>
                <div style={styles.documentTable}>
                  {[0, 1, 2].map((row) => (
                    <div key={row} style={styles.tableRow}>
                      <span style={{ ...styles.tableCell, width: row === 1 ? '92%' : '100%' }} />
                      <span style={styles.tableCell} />
                      <span style={styles.tableCell} />
                    </div>
                  ))}
                </div>
              </div>

              <div style={styles.codePanel}>
                {previewJsonLines.map((line, index) => {
                  let renderedLine = ''

                  if (index < lineIndex) {
                    renderedLine = line
                  } else if (index === lineIndex) {
                    renderedLine = line.slice(0, charIndex)
                  }

                  return (
                    <p key={line} style={styles.codeLine}>
                      {renderedLine.includes(':') ? (
                        <>
                          <span style={styles.codeLineKey}>
                            {renderedLine.split(':')[0]}
                          </span>
                          {renderedLine.includes(':') ? ':' : ''}
                          <span style={styles.codeLineValue}>
                            {renderedLine.split(':').slice(1).join(':')}
                          </span>
                        </>
                      ) : (
                        renderedLine
                      )}
                      {index === lineIndex ? <span style={styles.codeCursor} /> : null}
                    </p>
                  )
                })}
              </div>
            </div>
          </div>
        </section>

        <section style={styles.section}>
          <div style={styles.sectionHeader}>
            <h2 style={styles.sectionTitle}>How it works</h2>
            <p style={styles.sectionSubtitle}>From messy document to clean schema in four moves.</p>
          </div>
          <div style={styles.steps}>
            {steps.map((step, index) => (
              <article key={step.title} style={styles.stepCard}>
                <div style={styles.stepTop}>
                  <span style={styles.stepIcon}>{step.icon}</span>
                  <span style={styles.stepNumber}>{String(index + 1).padStart(2, '0')}</span>
                </div>
                <div>
                  <h3 style={styles.stepTitle}>{step.title}</h3>
                  <p style={styles.stepText}>{step.text}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section style={styles.section}>
          <div style={styles.sectionHeader}>
            <h2 style={styles.sectionTitle}>Supported documents</h2>
            <p style={styles.sectionSubtitle}>Start structured extraction with the docs you already have.</p>
          </div>
          <div style={styles.docGrid}>
            {supportedDocuments.map((document) => (
              <article key={document.title} style={styles.docCard}>
                <span style={styles.emoji}>{document.icon}</span>
                <div>
                  <h3 style={styles.docTitle}>{document.title}</h3>
                  <p style={styles.docText}>{document.text}</p>
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>

      <footer style={styles.footer}>
        <span>Built with Groq + Llama 4 Scout</span>
        <a href={bugReportMailto} style={styles.footerLink}>
          Report a bug
        </a>
        <span>Sudowoodo © 2026</span>
      </footer>
    </div>
  )
}

export default LandingPage
