import { useEffect, useState, useTransition } from 'react'
import axios from 'axios'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import ApiDocs from './ApiDocs'
import './App.css'
import HistoryPanel from './components/HistoryPanel'
import LandingPage from './LandingPage'
import ResultsPanel from './components/ResultsPanel'
import SchemaEditor, { documentSchemas, schemaToText } from './components/SchemaEditor'
import Uploader from './components/Uploader'

const historyStorageKey = 'sudowoodo-extraction-history'
const themeStorageKey = 'sudowoodo-theme'
const maxHistoryItems = 10
const defaultSchema = schemaToText(documentSchemas.Invoice)

const themeCss = `
  [data-theme='light'] {
    --app-bg: #edf4ff;
    --app-bg-soft: #f8fbff;
    --card-bg: #ffffff;
    --card-bg-soft: #f8fafc;
    --card-bg-accent: #eff6ff;
    --text-primary: #111827;
    --text-secondary: #667085;
    --border: #d9dee7;
    --border-soft: #e2e8f0;
    --blue-accent: #1d4ed8;
    --blue-accent-soft: #dbeafe;
    --blue-accent-text: #1d4ed8;
    --json-bg: #0f172a;
    --json-text: #dbeafe;
    --shadow: 0 18px 45px rgba(15, 23, 42, 0.08);
    --panel: rgba(255, 255, 255, 0.84);
    --panel-border: rgba(28, 39, 60, 0.1);
    --panel-shadow: 0 24px 70px rgba(18, 31, 53, 0.12);
    --card-hover-shadow: 0 28px 60px rgba(15, 23, 42, 0.16);
    --heading: #10203a;
    --text: #31435f;
    --muted: #5e718e;
    --blue: #1f63ff;
  }

  [data-theme='dark'] {
    --app-bg: #0f1117;
    --app-bg-soft: #0f1117;
    --card-bg: #1a1d27;
    --card-bg-soft: #151823;
    --card-bg-accent: #172033;
    --text-primary: #ffffff;
    --text-secondary: #9ca3af;
    --border: #2d3148;
    --border-soft: #2d3148;
    --blue-accent: #3b82f6;
    --blue-accent-soft: rgba(59, 130, 246, 0.18);
    --blue-accent-text: #93c5fd;
    --json-bg: #090b10;
    --json-text: #dbeafe;
    --shadow: 0 18px 45px rgba(0, 0, 0, 0.28);
    --panel: #1a1d27;
    --panel-border: #2d3148;
    --panel-shadow: 0 24px 70px rgba(0, 0, 0, 0.32);
    --card-hover-shadow: 0 28px 60px rgba(0, 0, 0, 0.42);
    --heading: #ffffff;
    --text: #9ca3af;
    --muted: #9ca3af;
    --blue: #3b82f6;
  }

  body:has([data-theme='light']) {
    background:
      radial-gradient(circle at top left, rgba(31, 99, 255, 0.22), transparent 30%),
      radial-gradient(circle at bottom right, rgba(102, 170, 255, 0.18), transparent 24%),
      linear-gradient(180deg, #f8fbff 0%, #edf4ff 55%, #e6eef9 100%);
  }

  body:has([data-theme='dark']) {
    background: #0f1117;
  }

  [data-theme],
  [data-theme] * {
    transition: all 0.3s ease;
  }

  #root {
    width: 100%;
    padding: 0;
  }
`

const motionCss = `
  @keyframes sudowoodo-fade-slide-up {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes sudowoodo-crossfade-in {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  @keyframes sudowoodo-crossfade-out {
    from {
      opacity: 1;
    }
    to {
      opacity: 0;
    }
  }

  @keyframes sudowoodo-drop-bounce {
    0%,
    100% {
      transform: translateY(0) scale(1);
    }

    35% {
      transform: translateY(-10px) scale(1.04);
    }

    58% {
      transform: translateY(0) scale(0.98);
    }

    78% {
      transform: translateY(-4px) scale(1.02);
    }
  }

  @keyframes sudowoodo-spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }

  @keyframes sudowoodo-slide-in-left {
    from {
      opacity: 0;
      transform: translateX(-20px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }

  .sudowoodo-premium-card {
    will-change: transform, box-shadow;
    transition:
      transform 240ms cubic-bezier(0.22, 1, 0.36, 1),
      box-shadow 240ms cubic-bezier(0.22, 1, 0.36, 1),
      border-color 220ms ease,
      background-color 220ms ease;
  }

  .sudowoodo-premium-card:hover {
    transform: scale(1.01);
    box-shadow: var(--card-hover-shadow);
  }

  .sudowoodo-results-enter {
    animation: sudowoodo-fade-slide-up 420ms cubic-bezier(0.22, 1, 0.36, 1) both;
  }

  .sudowoodo-tab-stage {
    display: grid;
  }

  .sudowoodo-tab-pane {
    grid-area: 1 / 1;
    min-width: 0;
  }

  .sudowoodo-tab-pane-in {
    animation: sudowoodo-crossfade-in 220ms ease both;
  }

  .sudowoodo-tab-pane-out {
    animation: sudowoodo-crossfade-out 220ms ease both;
  }

  .sudowoodo-drop-icon-bounce {
    transform-origin: center bottom;
    animation: sudowoodo-drop-bounce 860ms cubic-bezier(0.34, 1.56, 0.64, 1) infinite;
  }

  .sudowoodo-spinner {
    animation: sudowoodo-spin 900ms linear infinite;
  }

  .sudowoodo-history-enter {
    animation: sudowoodo-slide-in-left 380ms cubic-bezier(0.22, 1, 0.36, 1) both;
  }

  .sudowoodo-pressable {
    transform-origin: center;
    transition:
      transform 140ms ease,
      box-shadow 220ms ease,
      border-color 220ms ease,
      background-color 220ms ease,
      opacity 220ms ease;
  }

  .sudowoodo-pressable:active:not(:disabled) {
    transform: scale(0.97);
  }

  @media (prefers-reduced-motion: reduce) {
    .sudowoodo-premium-card,
    .sudowoodo-pressable,
    .sudowoodo-results-enter,
    .sudowoodo-tab-pane-in,
    .sudowoodo-tab-pane-out,
    .sudowoodo-drop-icon-bounce,
    .sudowoodo-spinner,
    .sudowoodo-history-enter {
      animation: none !important;
      transition: none !important;
      transform: none !important;
    }
  }
`

const styles = {
  themeRoot: {
    minHeight: '100vh',
    background: 'var(--app-bg)',
    color: 'var(--text-primary)',
    padding: '28px max(16px, calc((100vw - 1240px) / 2)) 40px',
  },
  themeToggle: {
    position: 'fixed',
    top: '18px',
    right: '18px',
    zIndex: 20,
    display: 'grid',
    placeItems: 'center',
    width: '44px',
    height: '44px',
    border: '1px solid var(--border)',
    borderRadius: '999px',
    background: 'var(--card-bg)',
    color: 'var(--blue-accent)',
    cursor: 'pointer',
    boxShadow: 'var(--shadow)',
  },
  workspace: {
    display: 'grid',
    gridTemplateColumns: '220px minmax(360px, 0.9fr) minmax(420px, 1.15fr)',
    gap: '24px',
    alignItems: 'start',
  },
  controlPanel: {
    background: 'var(--panel)',
    border: '1px solid var(--panel-border)',
    borderRadius: '24px',
    boxShadow: 'var(--panel-shadow)',
    backdropFilter: 'blur(18px)',
    padding: '24px',
  },
  extractForm: {
    display: 'grid',
    gap: '20px',
  },
  resultsColumn: {
    minWidth: 0,
  },
}

function loadStoredHistory() {
  try {
    if (typeof localStorage === 'undefined') {
      return []
    }

    const storedHistory = localStorage.getItem(historyStorageKey)
    const parsedHistory = storedHistory ? JSON.parse(storedHistory) : []

    return Array.isArray(parsedHistory) ? parsedHistory.slice(0, maxHistoryItems) : []
  } catch {
    return []
  }
}

function loadStoredTheme() {
  try {
    const storedTheme = localStorage.getItem(themeStorageKey)
    return storedTheme === 'dark' || storedTheme === 'light' ? storedTheme : 'light'
  } catch {
    return 'light'
  }
}

function createHistoryId() {
  return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`
}

function createHistoryItem(data, pagesProcessed = null, warning = null) {
  return {
    id: createHistoryId(),
    data,
    pagesProcessed,
    warning,
    extractedAt: new Date().toISOString(),
  }
}

function ThemeIcon({ theme }) {
  const isDark = theme === 'dark'

  return (
    <svg
      aria-hidden="true"
      fill="none"
      height="21"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      viewBox="0 0 24 24"
      width="21"
    >
      {isDark ? (
        <>
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2" />
          <path d="M12 20v2" />
          <path d="M4.93 4.93l1.41 1.41" />
          <path d="M17.66 17.66l1.41 1.41" />
          <path d="M2 12h2" />
          <path d="M20 12h2" />
          <path d="M4.93 19.07l1.41-1.41" />
          <path d="M17.66 6.34l1.41-1.41" />
        </>
      ) : (
        <path d="M21 12.8A8.5 8.5 0 1111.2 3a6.7 6.7 0 009.8 9.8z" />
      )}
    </svg>
  )
}

function ExtractionApp() {
  const [selectedFile, setSelectedFile] = useState(null)
  const [schemaText, setSchemaText] = useState(defaultSchema)
  const [result, setResult] = useState(null)
  const [resultPagesProcessed, setResultPagesProcessed] = useState(null)
  const [resultWarning, setResultWarning] = useState(null)
  const [history, setHistory] = useState(loadStoredHistory)
  const [activeHistoryId, setActiveHistoryId] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [detectingSchema, setDetectingSchema] = useState(false)
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    try {
      localStorage.setItem(historyStorageKey, JSON.stringify(history))
    } catch {
      // History is a convenience feature; extraction should keep working if storage is unavailable.
    }
  }, [history])

  function addToHistory(data, pagesProcessed = null, warning = null) {
    const historyItem = createHistoryItem(data, pagesProcessed, warning)

    setHistory((currentHistory) => [historyItem, ...currentHistory].slice(0, maxHistoryItems))
    setActiveHistoryId(historyItem.id)
  }

  function handleHistorySelect(historyItem) {
    setResult(historyItem.data)
    setResultPagesProcessed(historyItem.pagesProcessed ?? null)
    setResultWarning(historyItem.warning ?? null)
    setActiveHistoryId(historyItem.id)
    setError('')
  }

  function handleHistoryClear() {
    setHistory([])
    setActiveHistoryId(null)
  }

  async function handleAutoDetectSchema() {
    if (!selectedFile) {
      setError('Choose a PDF or image file before detecting a schema.')
      return
    }

    setDetectingSchema(true)
    setError('')

    const formData = new FormData()
    formData.append('file', selectedFile)

    try {
      const response = await axios.post('http://localhost:8000/detect-schema', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      setSchemaText(JSON.stringify(response.data.schema, null, 2))
    } catch (requestError) {
      const message =
        requestError.response?.data?.detail ||
        'Schema detection failed. Check that the backend is running and your Groq key is set.'
      setError(message)
    } finally {
      setDetectingSchema(false)
    }
  }

  async function handleSubmit(event) {
    event.preventDefault()

    if (!selectedFile) {
      setError('Choose a PDF or image file before extracting.')
      return
    }

    try {
      JSON.parse(schemaText)
    } catch {
      setError('The schema must be valid JSON.')
      return
    }

    setLoading(true)
    setError('')
    setResult(null)
    setResultPagesProcessed(null)
    setResultWarning(null)
    setActiveHistoryId(null)

    const formData = new FormData()
    formData.append('file', selectedFile)
    formData.append('schema', schemaText)

    try {
      const response = await axios.post('http://localhost:8000/extract', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      startTransition(() => {
        setResult(response.data.data)
        setResultPagesProcessed(response.data.pages_processed ?? null)
        setResultWarning(response.data.warning ?? null)
        addToHistory(
          response.data.data,
          response.data.pages_processed ?? null,
          response.data.warning ?? null,
        )
      })
    } catch (requestError) {
      const message =
        requestError.response?.data?.detail ||
        'Extraction failed. Check that the backend is running and your Groq key is set.'
      setResult(null)
      setResultPagesProcessed(null)
      setResultWarning(null)
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="app-shell">
      <header className="hero-panel">
        <div className="hero-copy">
          <p className="eyebrow">Sudowoodo</p>
          <h1>Turn PDFs into structured JSON.</h1>
          <p className="hero-text">
            Upload a document, adjust the schema, and let the Groq-powered backend
            return clean JSON you can use in apps or automations.
          </p>
        </div>
        <div className="hero-card sudowoodo-premium-card">
          <p className="hero-card-label">Pipeline</p>
          <ol>
            <li>Upload document</li>
            <li>Render PDF pages to images</li>
            <li>Extract with Llama 4 Scout</li>
            <li>Validate and return JSON</li>
          </ol>
        </div>
      </header>

      <main style={styles.workspace}>
        <HistoryPanel
          history={history}
          activeHistoryId={activeHistoryId}
          onSelect={handleHistorySelect}
          onClear={handleHistoryClear}
        />

        <section style={styles.controlPanel}>
          <form style={styles.extractForm} onSubmit={handleSubmit}>
            <Uploader selectedFile={selectedFile} onFileSelect={setSelectedFile} />
            <SchemaEditor
              schemaText={schemaText}
              onSchemaChange={setSchemaText}
              onAutoDetectSchema={handleAutoDetectSchema}
              autoDetectLoading={detectingSchema}
              autoDetectDisabled={!selectedFile || loading || detectingSchema}
            />

            <button className="extract-button sudowoodo-pressable" type="submit" disabled={loading}>
              Run Extraction
            </button>

            {error ? <p className="status-message error">{error}</p> : null}
            {!error && isPending ? (
              <p className="status-message">Working on your document...</p>
            ) : null}
          </form>
        </section>

        <section style={styles.resultsColumn}>
          <ResultsPanel
            data={result}
            loading={loading}
            pagesProcessed={resultPagesProcessed}
            warning={resultWarning}
          />
        </section>
      </main>
    </div>
  )
}

function App() {
  const [theme, setTheme] = useState(loadStoredTheme)

  useEffect(() => {
    try {
      localStorage.setItem(themeStorageKey, theme)
    } catch {
      // Theme persistence should never block the app.
    }
  }, [theme])

  function toggleTheme() {
    setTheme((currentTheme) => (currentTheme === 'dark' ? 'light' : 'dark'))
  }

  return (
    <div data-theme={theme} style={styles.themeRoot}>
      <style>{themeCss}</style>
      <style>{motionCss}</style>
      <button
        aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        className="sudowoodo-pressable"
        style={styles.themeToggle}
        type="button"
        onClick={toggleTheme}
      >
        <ThemeIcon theme={theme} />
      </button>
      <BrowserRouter>
        <Routes>
          <Route element={<LandingPage />} path="/" />
          <Route element={<ExtractionApp />} path="/app" />
          <Route element={<ApiDocs />} path="/docs" />
        </Routes>
      </BrowserRouter>
    </div>
  )
}

export default App
