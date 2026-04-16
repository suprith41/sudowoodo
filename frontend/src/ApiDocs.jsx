import { useState } from 'react'
import { Link } from 'react-router-dom'

const styles = {
  page: {
    minHeight: '100vh',
    color: 'var(--text-primary)',
    background:
      'radial-gradient(circle at top left, rgba(31, 99, 255, 0.16), transparent 28%), linear-gradient(180deg, var(--app-bg-soft) 0%, var(--app-bg) 100%)',
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
  navLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
  },
  logo: {
    color: 'var(--blue-accent)',
    fontSize: '1.05rem',
    fontWeight: 900,
    letterSpacing: '0.12em',
    textDecoration: 'none',
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
  shell: {
    width: 'min(1120px, calc(100% - 40px))',
    margin: '0 auto',
    padding: '16px 0 56px',
  },
  hero: {
    display: 'grid',
    gap: '18px',
    marginBottom: '34px',
    padding: '34px',
    border: '1px solid var(--border)',
    borderRadius: '30px',
    background:
      'linear-gradient(135deg, rgba(15, 23, 42, 0.05), rgba(255, 255, 255, 0.16)), var(--card-bg)',
    boxShadow: 'var(--shadow)',
  },
  eyebrow: {
    margin: 0,
    color: 'var(--blue-accent)',
    fontSize: '0.86rem',
    fontWeight: 900,
    letterSpacing: '0.16em',
    textTransform: 'uppercase',
  },
  title: {
    margin: 0,
    fontSize: 'clamp(2.5rem, 5vw, 4.4rem)',
    lineHeight: 0.98,
    fontWeight: 900,
    letterSpacing: '-0.05em',
  },
  subtitle: {
    maxWidth: '720px',
    margin: 0,
    color: 'var(--text-secondary)',
    fontSize: '1.05rem',
    lineHeight: 1.65,
  },
  overviewGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    gap: '16px',
    marginBottom: '34px',
  },
  overviewCard: {
    display: 'grid',
    gap: '8px',
    padding: '20px 22px',
    border: '1px solid var(--border)',
    borderRadius: '22px',
    background: 'var(--card-bg)',
    boxShadow: 'var(--shadow)',
  },
  overviewLabel: {
    margin: 0,
    color: 'var(--text-secondary)',
    fontSize: '0.82rem',
    fontWeight: 800,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
  },
  overviewValue: {
    margin: 0,
    color: 'var(--text-primary)',
    fontSize: '1rem',
    fontWeight: 800,
  },
  overviewMono: {
    fontFamily:
      '"SFMono-Regular", Consolas, "Liberation Mono", Menlo, Courier, monospace',
    fontSize: '0.98rem',
  },
  sectionTitle: {
    margin: '0 0 18px',
    color: 'var(--text-primary)',
    fontSize: '2rem',
    fontWeight: 900,
    letterSpacing: '-0.03em',
  },
  endpointList: {
    display: 'grid',
    gap: '20px',
  },
  endpointCard: {
    display: 'grid',
    gap: '22px',
    padding: '26px',
    border: '1px solid var(--border)',
    borderRadius: '28px',
    background: 'var(--card-bg)',
    boxShadow: 'var(--shadow)',
  },
  endpointHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '18px',
    flexWrap: 'wrap',
  },
  endpointTitleRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    flexWrap: 'wrap',
  },
  methodBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: '62px',
    minHeight: '32px',
    borderRadius: '999px',
    fontSize: '0.82rem',
    fontWeight: 900,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    color: '#ffffff',
  },
  methodBadgeGet: {
    background: '#2563eb',
  },
  methodBadgePost: {
    background: '#16a34a',
  },
  endpointPath: {
    margin: 0,
    color: 'var(--text-primary)',
    fontFamily:
      '"SFMono-Regular", Consolas, "Liberation Mono", Menlo, Courier, monospace',
    fontSize: '1.08rem',
    fontWeight: 800,
  },
  endpointDescription: {
    margin: 0,
    color: 'var(--text-secondary)',
    fontSize: '0.98rem',
    lineHeight: 1.6,
  },
  metaGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    gap: '14px',
  },
  metaCard: {
    display: 'grid',
    gap: '8px',
    padding: '16px 18px',
    border: '1px solid var(--border-soft)',
    borderRadius: '18px',
    background: 'var(--card-bg-soft)',
  },
  metaLabel: {
    margin: 0,
    color: 'var(--text-secondary)',
    fontSize: '0.8rem',
    fontWeight: 800,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
  },
  metaValue: {
    margin: 0,
    color: 'var(--text-primary)',
    fontSize: '0.95rem',
    lineHeight: 1.55,
  },
  codeGrid: {
    display: 'grid',
    gap: '14px',
  },
  codeBlockWrap: {
    display: 'grid',
    gap: '10px',
  },
  codeBlockHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '12px',
    flexWrap: 'wrap',
  },
  codeLabel: {
    margin: 0,
    color: 'var(--text-primary)',
    fontSize: '0.92rem',
    fontWeight: 800,
  },
  copyButton: {
    border: '1px solid rgba(148, 163, 184, 0.2)',
    borderRadius: '999px',
    background: 'rgba(15, 23, 42, 0.9)',
    color: '#e2e8f0',
    cursor: 'pointer',
    font: 'inherit',
    fontSize: '0.82rem',
    fontWeight: 800,
    padding: '8px 12px',
  },
  codeBlock: {
    margin: 0,
    overflowX: 'auto',
    padding: '18px',
    borderRadius: '20px',
    border: '1px solid rgba(59, 130, 246, 0.12)',
    background:
      'linear-gradient(180deg, rgba(15, 23, 42, 0.98), rgba(2, 6, 23, 0.98))',
    boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.04)',
    fontFamily:
      '"SFMono-Regular", Consolas, "Liberation Mono", Menlo, Courier, monospace',
    fontSize: '0.88rem',
    lineHeight: 1.7,
    whiteSpace: 'pre-wrap',
    color: '#e2e8f0',
  },
}

const overviewItems = [
  { label: 'Base URL', value: 'http://localhost:8000', mono: true },
  { label: 'Authentication', value: 'none (local)', mono: false },
]

const endpoints = [
  {
    method: 'POST',
    path: '/extract',
    description: 'Extract structured JSON from a document.',
    request: 'multipart/form-data with `file` and `schema` fields',
    response: '{"data": {...}}',
    examples: [
      {
        label: 'cURL',
        language: 'bash',
        code: `curl -X POST http://localhost:8000/extract \\
  -F "file=@invoice.pdf" \\
  -F 'schema={
    "document_type": "",
    "document_number": "",
    "total_amount": null
  }'`,
      },
      {
        label: 'Python Requests',
        language: 'python',
        code: `import json
import requests

schema = {
    "document_type": "",
    "document_number": "",
    "total_amount": None,
}

with open("invoice.pdf", "rb") as file_handle:
    response = requests.post(
        "http://localhost:8000/extract",
        files={"file": file_handle},
        data={"schema": json.dumps(schema)},
        timeout=120,
    )

print(response.json())`,
      },
      {
        label: 'Response',
        language: 'json',
        code: `{
  "data": {
    "document_type": {
      "value": "invoice",
      "confidence": 1.0
    },
    "document_number": {
      "value": "INV-001",
      "confidence": 1.0
    },
    "total_amount": {
      "value": 5000.0,
      "confidence": 0.9
    }
  }
}`,
      },
    ],
  },
  {
    method: 'POST',
    path: '/detect-schema',
    description: 'Auto detect schema from a document.',
    request: 'multipart/form-data with `file`',
    response: '{"schema": {...}}',
    examples: [
      {
        label: 'cURL',
        language: 'bash',
        code: `curl -X POST http://localhost:8000/detect-schema \\
  -F "file=@invoice.pdf"`,
      },
      {
        label: 'Response',
        language: 'json',
        code: `{
  "schema": {
    "document_type": "string",
    "document_number": "string",
    "line_items": "array",
    "total_amount": "float"
  }
}`,
      },
    ],
  },
  {
    method: 'GET',
    path: '/',
    description: 'Health check.',
    request: 'No request body',
    response: '{"status": "Sudowoodo is running"}',
    examples: [
      {
        label: 'cURL',
        language: 'bash',
        code: 'curl http://localhost:8000/',
      },
      {
        label: 'Response',
        language: 'json',
        code: `{
  "status": "Sudowoodo is running"
}`,
      },
    ],
  },
]

const tokenColors = {
  key: '#93c5fd',
  string: '#bbf7d0',
  number: '#fde68a',
  keyword: '#fca5a5',
  comment: '#64748b',
  plain: '#e2e8f0',
  function: '#f9a8d4',
}

function highlightJson(code) {
  const tokenPattern =
    /("(?:\\.|[^"\\])*"(?=\s*:))|("(?:\\.|[^"\\])*")|\btrue\b|\bfalse\b|\bnull\b|-?\d+(?:\.\d+)?/g
  const pieces = []
  let lastIndex = 0
  let match

  while ((match = tokenPattern.exec(code)) !== null) {
    if (match.index > lastIndex) {
      pieces.push({ type: 'plain', value: code.slice(lastIndex, match.index) })
    }

    let type = 'number'
    if (match[1]) {
      type = 'key'
    } else if (match[2]) {
      type = 'string'
    } else if (match[0] === 'true' || match[0] === 'false' || match[0] === 'null') {
      type = 'keyword'
    }

    pieces.push({ type, value: match[0] })
    lastIndex = tokenPattern.lastIndex
  }

  if (lastIndex < code.length) {
    pieces.push({ type: 'plain', value: code.slice(lastIndex) })
  }

  return pieces
}

function highlightBash(code) {
  return code.split(/(\s+)/).map((part) => {
    if (part === 'curl') {
      return { type: 'function', value: part }
    }
    if (part.startsWith('-')) {
      return { type: 'keyword', value: part }
    }
    if (
      part.startsWith('"') ||
      part.startsWith("'") ||
      part.startsWith('http://') ||
      part.startsWith('https://')
    ) {
      return { type: 'string', value: part }
    }
    return { type: 'plain', value: part }
  })
}

function highlightPython(code) {
  const tokenPattern =
    /(#.*$)|\b(import|with|as|print|None|requests|json)\b|("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*')/gm
  const pieces = []
  let lastIndex = 0
  let match

  while ((match = tokenPattern.exec(code)) !== null) {
    if (match.index > lastIndex) {
      pieces.push({ type: 'plain', value: code.slice(lastIndex, match.index) })
    }

    if (match[1]) {
      pieces.push({ type: 'comment', value: match[1] })
    } else if (match[2]) {
      pieces.push({
        type: match[2] === 'requests' || match[2] === 'json' ? 'function' : 'keyword',
        value: match[2],
      })
    } else {
      pieces.push({ type: 'string', value: match[0] })
    }

    lastIndex = tokenPattern.lastIndex
  }

  if (lastIndex < code.length) {
    pieces.push({ type: 'plain', value: code.slice(lastIndex) })
  }

  return pieces
}

function highlightCode(code, language) {
  if (language === 'json') {
    return highlightJson(code)
  }

  if (language === 'python') {
    return highlightPython(code)
  }

  if (language === 'bash') {
    return highlightBash(code)
  }

  return [{ type: 'plain', value: code }]
}

function CodeBlock({ label, code, language }) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1800)
  }

  return (
    <div style={styles.codeBlockWrap}>
      <div style={styles.codeBlockHeader}>
        <p style={styles.codeLabel}>{label}</p>
        <button style={styles.copyButton} type="button" onClick={handleCopy}>
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <pre style={styles.codeBlock}>
        {highlightCode(code, language).map((piece, index) => (
          <span key={`${label}-${index}`} style={{ color: tokenColors[piece.type] ?? tokenColors.plain }}>
            {piece.value}
          </span>
        ))}
      </pre>
    </div>
  )
}

function EndpointCard({ endpoint }) {
  const methodStyle =
    endpoint.method === 'GET'
      ? styles.methodBadgeGet
      : styles.methodBadgePost

  return (
    <article style={styles.endpointCard}>
      <div style={styles.endpointHeader}>
        <div style={styles.endpointTitleRow}>
          <span style={{ ...styles.methodBadge, ...methodStyle }}>{endpoint.method}</span>
          <p style={styles.endpointPath}>{endpoint.path}</p>
        </div>
      </div>

      <p style={styles.endpointDescription}>{endpoint.description}</p>

      <div style={styles.metaGrid}>
        <div style={styles.metaCard}>
          <p style={styles.metaLabel}>Request</p>
          <p style={styles.metaValue}>{endpoint.request}</p>
        </div>
        <div style={styles.metaCard}>
          <p style={styles.metaLabel}>Response</p>
          <p style={styles.metaValue}>{endpoint.response}</p>
        </div>
      </div>

      <div style={styles.codeGrid}>
        {endpoint.examples.map((example) => (
          <CodeBlock
            key={`${endpoint.path}-${example.label}`}
            label={example.label}
            code={example.code}
            language={example.language}
          />
        ))}
      </div>
    </article>
  )
}

function ApiDocs() {
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
        </div>
        <Link style={styles.navButton} to="/app">
          Open App
        </Link>
      </nav>

      <main style={styles.shell}>
        <section style={styles.hero}>
          <p style={styles.eyebrow}>API Reference</p>
          <h1 style={styles.title}>Build against Sudowoodo in a single afternoon.</h1>
          <p style={styles.subtitle}>
            Everything you need to upload documents, detect schemas, and extract structured JSON
            from your local Sudowoodo backend.
          </p>
        </section>

        <section>
          <h2 style={styles.sectionTitle}>Overview</h2>
          <div style={styles.overviewGrid}>
            {overviewItems.map((item) => (
              <article key={item.label} style={styles.overviewCard}>
                <p style={styles.overviewLabel}>{item.label}</p>
                <p style={{ ...styles.overviewValue, ...(item.mono ? styles.overviewMono : null) }}>
                  {item.value}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section>
          <h2 style={styles.sectionTitle}>Endpoints</h2>
          <div style={styles.endpointList}>
            {endpoints.map((endpoint) => (
              <EndpointCard key={`${endpoint.method}-${endpoint.path}`} endpoint={endpoint} />
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}

export default ApiDocs
