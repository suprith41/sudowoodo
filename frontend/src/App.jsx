import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from 'react'
import axios from 'axios'
import { BrowserRouter, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import ApiDocs from './ApiDocs'
import './App.css'
import BatchProcessor from './BatchProcessor'
import Dashboard from './Dashboard'
import CommandPalette from './components/CommandPalette'
import HistoryPanel from './components/HistoryPanel'
import LandingPage from './LandingPage'
import ResultsPanel from './components/ResultsPanel'
import SchemaEditor from './components/SchemaEditor'
import Uploader from './components/Uploader'
import { documentSchemas, schemaToText } from './lib/documentSchemas'
import {
  createHistoryItem,
  getRecentHistory,
  loadStoredHistory,
  saveStoredHistory,
} from './lib/history'

const themeStorageKey = 'sudowoodo-theme'
const defaultSchema = schemaToText(documentSchemas.Invoice)
const mobileBreakpoint = 768
const toastDurationMs = 3000
const bugReportMailto = 'mailto:hello@sudowoodo.app?subject=Sudowoodo%20bug%20report'

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
    --dot-grid: radial-gradient(circle at 1px 1px, rgba(29, 78, 216, 0.12) 1.1px, transparent 0);
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
    --dot-grid: radial-gradient(circle at 1px 1px, rgba(147, 197, 253, 0.13) 1.1px, transparent 0);
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

  @keyframes sudowoodo-toast-in {
    from {
      opacity: 0;
      transform: translateX(32px);
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

  .sudowoodo-toast-enter {
    animation: sudowoodo-toast-in 260ms cubic-bezier(0.22, 1, 0.36, 1) both;
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
    .sudowoodo-history-enter,
    .sudowoodo-toast-enter {
      animation: none !important;
      transition: none !important;
      transform: none !important;
    }
  }
`

const styles = {
  themeRoot: {
    minHeight: '100vh',
    backgroundColor: 'var(--app-bg)',
    backgroundImage: 'var(--dot-grid)',
    backgroundSize: '24px 24px',
    backgroundPosition: '0 0',
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
  heroPanel: {
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1.5fr) minmax(280px, 0.8fr)',
    gap: '24px',
    padding: '32px',
    borderRadius: '28px',
    background: 'var(--panel)',
    border: '1px solid var(--panel-border)',
    boxShadow: 'var(--panel-shadow)',
    backdropFilter: 'blur(18px)',
  },
  heroPanelMobile: {
    gridTemplateColumns: '1fr',
    padding: '24px',
  },
  heroTextBlock: {
    display: 'grid',
    gap: '14px',
  },
  heroTitle: {
    margin: 0,
    color: 'var(--text-primary)',
    fontSize: 'clamp(2.4rem, 6vw, 4rem)',
    lineHeight: 0.96,
    letterSpacing: '-0.04em',
  },
  heroCard: {
    borderRadius: '22px',
    padding: '22px',
    background: 'var(--card-bg-soft)',
    border: '1px solid var(--border)',
  },
  workspaceMobile: {
    gridTemplateColumns: '1fr',
    gap: '18px',
  },
  controlPanelMobile: {
    padding: '18px',
  },
  fullWidthButton: {
    width: '100%',
    justifyContent: 'center',
  },
  resultsColumn: {
    minWidth: 0,
  },
  shellFooter: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: '14px',
    marginTop: '24px',
    padding: '18px 4px 0',
    borderTop: '1px solid var(--border)',
    color: 'var(--text-secondary)',
    fontSize: '0.92rem',
  },
  shellFooterLink: {
    color: 'var(--blue-accent)',
    fontWeight: 700,
    textDecoration: 'none',
  },
  toastViewport: {
    position: 'fixed',
    right: '20px',
    bottom: '74px',
    zIndex: 80,
    display: 'grid',
    gap: '12px',
    width: 'min(360px, calc(100vw - 32px))',
  },
  toastViewportMobile: {
    right: '16px',
    left: '16px',
    bottom: '84px',
    width: 'auto',
  },
  toast: {
    borderRadius: '18px',
    padding: '14px 16px',
    border: '1px solid transparent',
    background: 'var(--card-bg)',
    color: '#ffffff',
    boxShadow: '0 20px 45px rgba(15, 23, 42, 0.18)',
    display: 'grid',
    gap: '4px',
  },
  toastTitle: {
    fontSize: '0.95rem',
    fontWeight: 800,
  },
  toastMessage: {
    fontSize: '0.9rem',
    lineHeight: 1.45,
    opacity: 0.92,
  },
  toastSuccess: {
    background: '#15803d',
    borderColor: '#166534',
  },
  toastError: {
    background: '#b91c1c',
    borderColor: '#991b1b',
  },
  toastInfo: {
    background: '#1d4ed8',
    borderColor: '#1e40af',
  },
  commandHint: {
    position: 'fixed',
    right: '20px',
    bottom: '20px',
    zIndex: 30,
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 13px',
    border: '1px solid var(--border)',
    borderRadius: '999px',
    background: 'var(--card-bg)',
    color: 'var(--text-secondary)',
    fontSize: '0.84rem',
    fontWeight: 800,
    boxShadow: 'var(--shadow)',
  },
  commandHintKey: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: '34px',
    minHeight: '26px',
    padding: '0 9px',
    border: '1px solid var(--border)',
    borderRadius: '999px',
    background: 'var(--card-bg-soft)',
    color: 'var(--text-primary)',
    fontSize: '0.76rem',
    fontWeight: 900,
  },
  commandHintMobile: {
    right: '16px',
    left: '16px',
    justifyContent: 'space-between',
  },
}

function joinStyles(...styleObjects) {
  return Object.assign({}, ...styleObjects)
}

function loadStoredTheme() {
  try {
    const storedTheme = localStorage.getItem(themeStorageKey)
    return storedTheme === 'dark' || storedTheme === 'light' ? storedTheme : 'light'
  } catch {
    return 'light'
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

function isEditableTarget(target) {
  return (
    target instanceof HTMLElement &&
    (target.isContentEditable ||
      target.tagName === 'INPUT' ||
      target.tagName === 'TEXTAREA' ||
      target.tagName === 'SELECT')
  )
}

function getPlatformShortcutLabel(isMac, key) {
  if (key === 'enter') {
    return isMac ? '⌘↵' : 'Ctrl+Enter'
  }

  return isMac ? `⌘${key.toUpperCase()}` : `Ctrl+${key.toUpperCase()}`
}

function ToastViewport({ isMobile = false, toasts }) {
  if (!toasts.length) {
    return null
  }

  return (
    <div style={joinStyles(styles.toastViewport, isMobile ? styles.toastViewportMobile : null)}>
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="sudowoodo-toast-enter"
          style={joinStyles(
            styles.toast,
            toast.type === 'success'
              ? styles.toastSuccess
              : toast.type === 'error'
                ? styles.toastError
                : styles.toastInfo,
          )}
        >
          <span style={styles.toastTitle}>{toast.title}</span>
          <span style={styles.toastMessage}>{toast.message}</span>
        </div>
      ))}
    </div>
  )
}

function AppFooter() {
  return (
    <footer style={styles.shellFooter}>
      <span>Built with Groq + Llama 4 Scout</span>
      <a href={bugReportMailto} style={styles.shellFooterLink}>
        Report a bug
      </a>
    </footer>
  )
}

function ExtractionApp({ isMobile = false, onRegisterActions = null, onToast = null }) {
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
  const [openFilePickerAction, setOpenFilePickerAction] = useState(null)
  const [resultsActions, setResultsActions] = useState(null)

  useEffect(() => {
    saveStoredHistory(history)
  }, [history])

  function addToHistory(data, pagesProcessed = null, warning = null) {
    const historyItem = createHistoryItem(data, pagesProcessed, warning)

    setHistory((currentHistory) => [historyItem, ...currentHistory])
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
      onToast?.('info', 'Schema auto-detected!')
    } catch (requestError) {
      const message =
        requestError.response?.data?.detail ||
        'Schema detection failed. Check that the backend is running and your Groq key is set.'
      setError(message)
    } finally {
      setDetectingSchema(false)
    }
  }

  const runExtraction = useCallback(async () => {
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
      onToast?.('success', 'Extraction complete!')
    } catch (requestError) {
      const message =
        requestError.response?.data?.detail ||
        'Extraction failed. Check that the backend is running and your Groq key is set.'
      setResult(null)
      setResultPagesProcessed(null)
      setResultWarning(null)
      setError(message)
      onToast?.('error', 'Extraction failed. Try again.')
    } finally {
      setLoading(false)
    }
  }, [onToast, schemaText, selectedFile, startTransition])

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
      openFilePicker: () => openFilePickerAction?.(),
      canOpenFilePicker: typeof openFilePickerAction === 'function',
      extract: runExtraction,
      canExtract: Boolean(selectedFile) && !loading,
      downloadJson: resultsActions?.downloadJson,
      canDownloadJson: Boolean(resultsActions?.canDownloadJson),
      copyJson: resultsActions?.copyJson,
      canCopyJson: Boolean(resultsActions?.canCopyJson),
      switchToText: resultsActions?.switchToText,
      switchToJson: resultsActions?.switchToJson,
      canSwitchToText: Boolean(resultsActions?.hasData) && resultsActions?.selectedView !== 'text',
      canSwitchToJson: Boolean(resultsActions?.hasData) && resultsActions?.selectedView !== 'json',
      hasData: Boolean(resultsActions?.hasData),
      selectedView: resultsActions?.selectedView ?? 'text',
    })
  }, [loading, onRegisterActions, openFilePickerAction, resultsActions, runExtraction, selectedFile])

  function handleSubmit(event) {
    event.preventDefault()
    runExtraction()
  }

  return (
    <div className="app-shell">
      <header className="hero-panel" style={joinStyles(styles.heroPanel, isMobile ? styles.heroPanelMobile : null)}>
        <div className="hero-copy" style={styles.heroTextBlock}>
          <p className="eyebrow">Sudowoodo</p>
          <h1 style={styles.heroTitle}>Turn PDFs into structured JSON.</h1>
          <p className="hero-text">
            Upload a document, adjust the schema, and let the Groq-powered backend
            return clean JSON you can use in apps or automations.
          </p>
        </div>
        <div className="hero-card sudowoodo-premium-card" style={styles.heroCard}>
          <p className="hero-card-label">Pipeline</p>
          <ol>
            <li>Upload document</li>
            <li>Render PDF pages to images</li>
            <li>Extract with Llama 4 Scout</li>
            <li>Validate and return JSON</li>
          </ol>
        </div>
      </header>

      <main style={joinStyles(styles.workspace, isMobile ? styles.workspaceMobile : null)}>
        <HistoryPanel
          history={getRecentHistory(history)}
          activeHistoryId={activeHistoryId}
          onSelect={handleHistorySelect}
          onClear={handleHistoryClear}
        />

        <section style={joinStyles(styles.controlPanel, isMobile ? styles.controlPanelMobile : null)}>
          <form style={styles.extractForm} onSubmit={handleSubmit}>
            <Uploader
              isMobile={isMobile}
              selectedFile={selectedFile}
              onFileSelect={setSelectedFile}
              onOpenPickerReady={(nextAction) => setOpenFilePickerAction(() => nextAction)}
            />
            <SchemaEditor
              isMobile={isMobile}
              schemaText={schemaText}
              onSchemaChange={setSchemaText}
              onAutoDetectSchema={handleAutoDetectSchema}
              autoDetectLoading={detectingSchema}
              autoDetectDisabled={!selectedFile || loading || detectingSchema}
            />

            <button
              className="extract-button sudowoodo-pressable"
              style={isMobile ? styles.fullWidthButton : undefined}
              type="submit"
              disabled={loading}
            >
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
            onRegisterActions={setResultsActions}
          />
        </section>
      </main>
    </div>
  )
}

function AppShell({ theme, toggleTheme }) {
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false)
  const [commandQuery, setCommandQuery] = useState('')
  const [highlightedCommandIndex, setHighlightedCommandIndex] = useState(0)
  const [extractionActions, setExtractionActions] = useState(null)
  const [pendingExtractionAction, setPendingExtractionAction] = useState(null)
  const [isMobile, setIsMobile] = useState(() =>
    typeof window === 'undefined' ? false : window.innerWidth < mobileBreakpoint,
  )
  const [toasts, setToasts] = useState([])
  const toastTimersRef = useRef(new Map())
  const isMac = useMemo(
    () =>
      typeof navigator === 'undefined'
        ? true
        : /Mac|iPhone|iPad|iPod/.test(navigator.platform || navigator.userAgent),
    [],
  )
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    function handleResize() {
      setIsMobile(window.innerWidth < mobileBreakpoint)
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    const toastTimers = toastTimersRef.current

    return () => {
      toastTimers.forEach((timeoutId) => window.clearTimeout(timeoutId))
      toastTimers.clear()
    }
  }, [])

  const showToast = useCallback((type, message) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
    const title = type === 'success' ? 'Success' : type === 'error' ? 'Error' : 'Info'

    setToasts((currentToasts) => [...currentToasts, { id, type, title, message }])

    const timeoutId = window.setTimeout(() => {
      setToasts((currentToasts) => currentToasts.filter((toast) => toast.id !== id))
      toastTimersRef.current.delete(id)
    }, toastDurationMs)

    toastTimersRef.current.set(id, timeoutId)
  }, [])

  const openCommandPalette = useCallback(() => {
    setCommandQuery('')
    setHighlightedCommandIndex(0)
    setIsCommandPaletteOpen(true)
  }, [])

  const closeCommandPalette = useCallback(() => {
    setIsCommandPaletteOpen(false)
    setCommandQuery('')
    setHighlightedCommandIndex(0)
  }, [])

  const runExtractionAction = useCallback((actionName) => {
    if (location.pathname !== '/app') {
      if (actionName === 'openFilePicker') {
        setPendingExtractionAction(actionName)
        navigate('/app')
      }

      return
    }

    extractionActions?.[actionName]?.()
  }, [extractionActions, location.pathname, navigate])

  useEffect(() => {
    if (
      location.pathname === '/app' &&
      pendingExtractionAction &&
      extractionActions?.[pendingExtractionAction]
    ) {
      extractionActions[pendingExtractionAction]()
      queueMicrotask(() => setPendingExtractionAction(null))
    }
  }, [extractionActions, location.pathname, pendingExtractionAction])

  const commandActions = useMemo(() => {
    const appRouteActive = location.pathname === '/app'
    const hasExtractionData = Boolean(extractionActions?.hasData)
    const commandMeta = appRouteActive
      ? 'Runs in the current extraction workspace.'
      : 'Available on the extraction page.'

    return [
      {
        id: 'upload-document',
        label: 'Upload document',
        meta: appRouteActive
          ? 'Open the file picker for the current extraction.'
          : 'Jump to the extractor and open the file picker.',
        shortcut: getPlatformShortcutLabel(isMac, 'u'),
        keywords: 'file picker upload document open',
        disabled: appRouteActive ? !extractionActions?.canOpenFilePicker : false,
        onSelect: () => runExtractionAction('openFilePicker'),
      },
      {
        id: 'extract',
        label: 'Extract',
        meta: 'Run extraction with the current file and schema.',
        shortcut: getPlatformShortcutLabel(isMac, 'enter'),
        keywords: 'run extraction submit process',
        disabled: !appRouteActive || !extractionActions?.canExtract,
        onSelect: () => runExtractionAction('extract'),
      },
      {
        id: 'download-json',
        label: 'Download JSON',
        meta: 'Save the current extracted result as JSON.',
        shortcut: getPlatformShortcutLabel(isMac, 'd'),
        keywords: 'export download json save',
        disabled: !appRouteActive || !extractionActions?.canDownloadJson,
        onSelect: () => runExtractionAction('downloadJson'),
      },
      {
        id: 'copy-json',
        label: 'Copy JSON',
        meta: 'Copy the current JSON result to your clipboard.',
        shortcut: getPlatformShortcutLabel(isMac, 'c'),
        keywords: 'copy json clipboard result',
        disabled: !appRouteActive || !extractionActions?.canCopyJson,
        onSelect: () => runExtractionAction('copyJson'),
      },
      {
        id: 'switch-text-view',
        label: 'Switch to Text view',
        meta: commandMeta,
        shortcut: '—',
        keywords: 'results text view switch',
        disabled: !appRouteActive || !hasExtractionData || !extractionActions?.canSwitchToText,
        onSelect: () => runExtractionAction('switchToText'),
      },
      {
        id: 'switch-json-view',
        label: 'Switch to JSON view',
        meta: commandMeta,
        shortcut: '—',
        keywords: 'results json view switch',
        disabled: !appRouteActive || !hasExtractionData || !extractionActions?.canSwitchToJson,
        onSelect: () => runExtractionAction('switchToJson'),
      },
      {
        id: 'go-dashboard',
        label: 'Go to Dashboard',
        meta: 'Open analytics and usage history.',
        shortcut: '—',
        keywords: 'analytics dashboard navigate route',
        disabled: location.pathname === '/dashboard',
        onSelect: () => navigate('/dashboard'),
      },
      {
        id: 'go-batch',
        label: 'Go to Batch',
        meta: 'Open the batch document processing queue.',
        shortcut: '—',
        keywords: 'batch processor queue navigate route',
        disabled: location.pathname === '/batch',
        onSelect: () => navigate('/batch'),
      },
      {
        id: 'toggle-dark-mode',
        label: 'Toggle dark mode',
        meta: theme === 'dark' ? 'Switch back to light mode.' : 'Switch to dark mode.',
        shortcut: '—',
        keywords: 'theme dark mode light appearance',
        disabled: false,
        onSelect: toggleTheme,
      },
    ]
  }, [
    extractionActions,
    isMac,
    location.pathname,
    navigate,
    runExtractionAction,
    theme,
    toggleTheme,
  ])

  const filteredCommandActions = useMemo(() => {
    const normalizedQuery = commandQuery.trim().toLowerCase()

    if (!normalizedQuery) {
      return commandActions
    }

    return commandActions.filter((action) =>
      `${action.label} ${action.meta} ${action.keywords}`.toLowerCase().includes(normalizedQuery),
    )
  }, [commandActions, commandQuery])

  const safeHighlightedCommandIndex = filteredCommandActions.length
    ? Math.min(highlightedCommandIndex, filteredCommandActions.length - 1)
    : 0

  const executeCommandAction = useCallback((action) => {
    if (!action || action.disabled) {
      return
    }

    closeCommandPalette()
    action.onSelect()
  }, [closeCommandPalette])

  useEffect(() => {
    function handleKeyDown(event) {
      const modifierPressed = event.metaKey || event.ctrlKey
      const key = event.key.toLowerCase()

      if (isCommandPaletteOpen) {
        if (event.key === 'Escape') {
          event.preventDefault()
          closeCommandPalette()
          return
        }

        if (event.key === 'ArrowDown') {
          event.preventDefault()
          setHighlightedCommandIndex((currentIndex) =>
            filteredCommandActions.length ? (currentIndex + 1) % filteredCommandActions.length : 0,
          )
          return
        }

        if (event.key === 'ArrowUp') {
          event.preventDefault()
          setHighlightedCommandIndex((currentIndex) =>
            filteredCommandActions.length
              ? (currentIndex - 1 + filteredCommandActions.length) % filteredCommandActions.length
              : 0,
          )
          return
        }

        if (event.key === 'Enter') {
          const highlightedAction = filteredCommandActions[safeHighlightedCommandIndex]

          if (highlightedAction && !highlightedAction.disabled) {
            event.preventDefault()
            executeCommandAction(highlightedAction)
          }
        }

        return
      }

      if (modifierPressed && key === 'k') {
        event.preventDefault()
        openCommandPalette()
        return
      }

      if (modifierPressed && key === 'u') {
        event.preventDefault()
        runExtractionAction('openFilePicker')
        return
      }

      if (location.pathname !== '/app') {
        return
      }

      if (modifierPressed && event.key === 'Enter' && extractionActions?.canExtract) {
        event.preventDefault()
        runExtractionAction('extract')
        return
      }

      if (modifierPressed && key === 'd' && extractionActions?.canDownloadJson) {
        event.preventDefault()
        runExtractionAction('downloadJson')
        return
      }

      if (
        modifierPressed &&
        key === 'c' &&
        extractionActions?.canCopyJson &&
        !isEditableTarget(event.target)
      ) {
        event.preventDefault()
        runExtractionAction('copyJson')
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [
    executeCommandAction,
    extractionActions,
    filteredCommandActions,
    isCommandPaletteOpen,
    location.pathname,
    closeCommandPalette,
    safeHighlightedCommandIndex,
    openCommandPalette,
    runExtractionAction,
  ])

  return (
    <>
      <button
        aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        className="sudowoodo-pressable"
        style={styles.themeToggle}
        type="button"
        onClick={toggleTheme}
      >
        <ThemeIcon theme={theme} />
      </button>
      <Routes>
        <Route element={<LandingPage />} path="/" />
        <Route
          element={
            <ExtractionApp
              isMobile={isMobile}
              onRegisterActions={setExtractionActions}
              onToast={showToast}
            />
          }
          path="/app"
        />
        <Route element={<BatchProcessor />} path="/batch" />
        <Route element={<Dashboard />} path="/dashboard" />
        <Route element={<ApiDocs />} path="/docs" />
      </Routes>
      {location.pathname !== '/' ? <AppFooter /> : null}
      <CommandPalette
        open={isCommandPaletteOpen}
        query={commandQuery}
        actions={filteredCommandActions}
        highlightedIndex={safeHighlightedCommandIndex}
        onClose={closeCommandPalette}
        onQueryChange={(nextQuery) => {
          setCommandQuery(nextQuery)
          setHighlightedCommandIndex(0)
        }}
        onHighlightChange={setHighlightedCommandIndex}
        onSelect={executeCommandAction}
      />
      <ToastViewport isMobile={isMobile} toasts={toasts} />
      <div style={joinStyles(styles.commandHint, isMobile ? styles.commandHintMobile : null)}>
        <span style={styles.commandHintKey}>⌘K</span>
        <span>Command palette</span>
      </div>
    </>
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
      <BrowserRouter>
        <AppShell theme={theme} toggleTheme={toggleTheme} />
      </BrowserRouter>
    </div>
  )
}

export default App
