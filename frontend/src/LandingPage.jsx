import { Link } from 'react-router-dom'

const styles = {
  page: {
    minHeight: '100vh',
    color: 'var(--text-primary)',
    background: 'linear-gradient(180deg, var(--app-bg-soft) 0%, var(--app-bg) 100%)',
    fontFamily:
      'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
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
    gridTemplateColumns: 'minmax(0, 1fr) minmax(320px, 0.72fr)',
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
    gap: '14px',
    padding: '22px',
    border: '1px solid var(--border)',
    borderRadius: '28px',
    background: 'var(--card-bg)',
    boxShadow: 'var(--shadow)',
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
  previewBody: {
    display: 'grid',
    gap: '10px',
    padding: '16px',
    border: '1px solid var(--border-soft)',
    borderRadius: '18px',
    background: 'var(--card-bg-soft)',
    fontFamily:
      '"SFMono-Regular", Consolas, "Liberation Mono", Menlo, Courier, monospace',
    fontSize: '0.86rem',
    color: 'var(--text-secondary)',
  },
  codeLine: {
    margin: 0,
    whiteSpace: 'pre-wrap',
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
    gap: '16px',
    width: 'min(1120px, calc(100% - 40px))',
    margin: '0 auto',
    padding: '32px 0 42px',
    borderTop: '1px solid var(--border)',
    color: 'var(--text-secondary)',
    fontSize: '0.95rem',
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
  return (
    <div style={styles.page}>
      <nav style={styles.nav}>
        <div style={styles.navLinks}>
          <Link style={styles.logo} to="/">
            SUDOWOODO
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
            <h1 style={styles.headline}>Turn any document into structured JSON — instantly</h1>
            <p style={styles.subheadline}>
              Powered by Groq + Llama 4 Scout. No templates. No training.
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
              <p style={styles.previewTitle}>Live extraction</p>
              <span style={styles.previewBadge}>JSON ready</span>
            </div>
            <div style={styles.previewBody}>
              <p style={styles.codeLine}>{'{'}</p>
              <p style={styles.codeLine}>{'  "document_type": "invoice",'}</p>
              <p style={styles.codeLine}>{'  "issuer": "Northstar Labs",'}</p>
              <p style={styles.codeLine}>{'  "line_items": ['}</p>
              <p style={styles.codeLine}>{'    { "description": "API usage", "amount": 2400 }'}</p>
              <p style={styles.codeLine}>{'  ],'}</p>
              <p style={styles.codeLine}>{'  "total_amount": 2592'}</p>
              <p style={styles.codeLine}>{'}'}</p>
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
        <span>Sudowoodo © 2026</span>
      </footer>
    </div>
  )
}

export default LandingPage
