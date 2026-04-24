import { useMemo, useRef, useState } from 'react'
import axios from 'axios'
import JSZip from 'jszip'
import { Link } from 'react-router-dom'
import { documentSchemas, schemaToText } from './lib/documentSchemas'
import { appendHistoryItemsToStorage, createHistoryItem } from './lib/history'

const maxBatchFiles = 10
const acceptedExtensions = ['pdf', 'png', 'jpg', 'jpeg', 'tif', 'tiff', 'webp']
const acceptedMimeTypes = [
  'application/pdf',
  'image/png',
  'image/jpeg',
  'image/tiff',
  'image/webp',
]
const schemaTypes = ['Invoice', 'Receipt', 'Medical Record', 'Contract', 'Custom']

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
    fontSize: 'clamp(2.1rem, 4vw, 3.35rem)',
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
  layout: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
    gap: '22px',
  },
  card: {
    display: 'grid',
    gap: '18px',
    padding: '22px',
    border: '1px solid var(--panel-border)',
    borderRadius: '24px',
    background: 'var(--panel)',
    boxShadow: 'var(--panel-shadow)',
    backdropFilter: 'blur(18px)',
  },
  sectionTitle: {
    margin: 0,
    color: 'var(--heading)',
    fontSize: '1.12rem',
    fontWeight: 850,
  },
  sectionText: {
    margin: 0,
    color: 'var(--muted)',
    fontSize: '0.94rem',
    lineHeight: 1.55,
  },
  uploadZone: {
    display: 'grid',
    justifyItems: 'center',
    gap: '12px',
    minHeight: '200px',
    padding: '28px 20px',
    border: '2px dashed var(--border)',
    borderRadius: '18px',
    background: 'var(--card-bg)',
    textAlign: 'center',
  },
  uploadZoneActive: {
    borderColor: 'var(--blue-accent)',
    background: 'var(--blue-accent-soft)',
  },
  uploadIcon: {
    display: 'grid',
    placeItems: 'center',
    width: '60px',
    height: '60px',
    borderRadius: '999px',
    background: 'var(--blue-accent-soft)',
    color: 'var(--blue-accent-text)',
  },
  uploadTitle: {
    margin: 0,
    color: 'var(--heading)',
    fontSize: '1.18rem',
    fontWeight: 850,
  },
  uploadText: {
    margin: 0,
    maxWidth: '360px',
    color: 'var(--muted)',
    fontSize: '0.94rem',
    lineHeight: 1.6,
  },
  hiddenInput: {
    display: 'none',
  },
  row: {
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '12px',
  },
  actionButton: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '44px',
    border: '1px solid var(--blue-accent)',
    borderRadius: '999px',
    background: 'var(--blue-accent)',
    color: '#ffffff',
    cursor: 'pointer',
    font: 'inherit',
    fontSize: '0.94rem',
    fontWeight: 800,
    padding: '0 18px',
    boxShadow: '0 14px 32px rgba(29, 78, 216, 0.22)',
  },
  actionButtonSecondary: {
    background: 'var(--blue-accent-soft)',
    color: 'var(--blue-accent-text)',
    boxShadow: 'none',
  },
  actionButtonDisabled: {
    cursor: 'not-allowed',
    opacity: 0.55,
    boxShadow: 'none',
  },
  helperChip: {
    display: 'inline-flex',
    alignItems: 'center',
    minHeight: '30px',
    padding: '5px 11px',
    border: '1px solid var(--border)',
    borderRadius: '999px',
    background: 'var(--card-bg-soft)',
    color: 'var(--muted)',
    fontSize: '0.84rem',
    fontWeight: 700,
  },
  error: {
    margin: 0,
    color: '#dc2626',
    fontSize: '0.94rem',
    fontWeight: 700,
  },
  pillRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '9px',
  },
  pill: {
    border: '1px solid var(--border)',
    borderRadius: '999px',
    background: 'var(--card-bg)',
    color: 'var(--text-secondary)',
    cursor: 'pointer',
    font: 'inherit',
    fontSize: '0.92rem',
    fontWeight: 700,
    padding: '8px 13px',
  },
  pillActive: {
    borderColor: 'var(--blue-accent)',
    background: 'var(--blue-accent)',
    color: '#ffffff',
    boxShadow: '0 5px 14px rgba(29, 78, 216, 0.2)',
  },
  textarea: {
    width: '100%',
    minHeight: '280px',
    boxSizing: 'border-box',
    border: '1px solid var(--border)',
    borderRadius: '14px',
    background: 'var(--card-bg)',
    color: 'var(--text-primary)',
    fontFamily:
      '"SFMono-Regular", Consolas, "Liberation Mono", Menlo, Courier, monospace',
    fontSize: '0.92rem',
    lineHeight: 1.6,
    padding: '16px',
    resize: 'vertical',
    outlineColor: 'var(--blue-accent)',
  },
  queueList: {
    display: 'grid',
    gap: '14px',
  },
  queueItem: {
    display: 'grid',
    gap: '12px',
    padding: '16px',
    border: '1px solid var(--border)',
    borderRadius: '18px',
    background: 'var(--card-bg)',
  },
  queueTop: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: '12px',
  },
  fileMeta: {
    display: 'grid',
    gap: '4px',
    minWidth: 0,
  },
  fileName: {
    color: 'var(--heading)',
    fontSize: '0.98rem',
    fontWeight: 800,
    overflowWrap: 'anywhere',
  },
  fileSize: {
    color: 'var(--muted)',
    fontSize: '0.86rem',
  },
  statusBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    minHeight: '29px',
    padding: '5px 11px',
    borderRadius: '999px',
    border: '1px solid var(--border)',
    background: 'var(--card-bg-soft)',
    color: 'var(--muted)',
    fontSize: '0.84rem',
    fontWeight: 800,
    whiteSpace: 'nowrap',
  },
  statusWaiting: {
    background: 'var(--card-bg-soft)',
    color: 'var(--muted)',
  },
  statusProcessing: {
    background: 'rgba(37, 99, 235, 0.12)',
    color: '#1d4ed8',
    borderColor: 'rgba(37, 99, 235, 0.22)',
  },
  statusDone: {
    background: 'rgba(34, 197, 94, 0.14)',
    color: '#15803d',
    borderColor: 'rgba(34, 197, 94, 0.24)',
  },
  statusFailed: {
    background: 'rgba(239, 68, 68, 0.12)',
    color: '#dc2626',
    borderColor: 'rgba(239, 68, 68, 0.22)',
  },
  progressWrap: {
    display: 'grid',
    gap: '8px',
  },
  progressTrack: {
    width: '100%',
    height: '10px',
    borderRadius: '999px',
    background: 'var(--border-soft)',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: '999px',
    background: 'linear-gradient(90deg, #1d4ed8 0%, #60a5fa 100%)',
    transition: 'width 200ms ease',
  },
  progressFillDone: {
    background: 'linear-gradient(90deg, #16a34a 0%, #4ade80 100%)',
  },
  progressFillFailed: {
    background: 'linear-gradient(90deg, #dc2626 0%, #f87171 100%)',
  },
  progressLabel: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '12px',
    color: 'var(--muted)',
    fontSize: '0.84rem',
    fontWeight: 700,
  },
  warningText: {
    margin: 0,
    color: '#b45309',
    fontSize: '0.86rem',
    fontWeight: 700,
  },
  fileError: {
    margin: 0,
    color: '#dc2626',
    fontSize: '0.86rem',
    fontWeight: 700,
    lineHeight: 1.5,
  },
  emptyState: {
    display: 'grid',
    placeItems: 'center',
    minHeight: '220px',
    border: '1px dashed var(--border)',
    borderRadius: '18px',
    background: 'var(--card-bg)',
    color: 'var(--muted)',
    fontSize: '0.96rem',
    lineHeight: 1.6,
    padding: '18px',
    textAlign: 'center',
  },
}

function joinStyles(...styleObjects) {
  return Object.assign({}, ...styleObjects)
}

function schemaMatches(type, schemaText) {
  return schemaToText(documentSchemas[type]) === schemaText
}

function getActiveSchemaType(schemaText) {
  for (const type of Object.keys(documentSchemas)) {
    if (schemaMatches(type, schemaText)) {
      return type
    }
  }

  return 'Custom'
}

function getFileExtension(fileName) {
  return fileName.split('.').pop()?.toLowerCase() ?? ''
}

function isSupportedFile(file) {
  return acceptedExtensions.includes(getFileExtension(file.name)) || acceptedMimeTypes.includes(file.type)
}

function formatFileSize(sizeInBytes) {
  if (!sizeInBytes) {
    return '0 KB'
  }

  const sizeInKb = sizeInBytes / 1024

  if (sizeInKb < 1024) {
    return `${sizeInKb.toFixed(1)} KB`
  }

  return `${(sizeInKb / 1024).toFixed(1)} MB`
}

function sanitizeFilename(fileName) {
  const strippedName = fileName.replace(/\.[^/.]+$/, '')
  const fallback = strippedName || 'document'

  return fallback.replace(/[<>:"/\\|?*]+/g, '_')
}

function createQueueItem(file) {
  return {
    id: globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`,
    file,
    status: 'waiting',
    progress: 0,
    result: null,
    error: '',
    warning: null,
    pagesProcessed: null,
  }
}

function BatchUploadIcon() {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      height="34"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
      viewBox="0 0 24 24"
      width="34"
    >
      <path d="M12 3v12" />
      <path d="m7 10 5 5 5-5" />
      <path d="M5 19h14" />
      <path d="M4 6h4" />
      <path d="M16 6h4" />
    </svg>
  )
}

function BatchProcessor() {
  const [schemaText, setSchemaText] = useState(schemaToText(documentSchemas.Invoice))
  const [queue, setQueue] = useState([])
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState('')
  const [downloadReady, setDownloadReady] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const inputRef = useRef(null)
  const dragDepth = useRef(0)

  const completedCount = useMemo(
    () => queue.filter((item) => item.status === 'done' || item.status === 'failed').length,
    [queue],
  )
  const processedCount = useMemo(() => queue.filter((item) => item.status === 'done').length, [queue])
  const overallPercent = queue.length ? Math.round((completedCount / queue.length) * 100) : 0
  const allFinished = queue.length > 0 && completedCount === queue.length
  const activeSchemaType = getActiveSchemaType(schemaText)

  function updateQueueItem(itemId, updater) {
    setQueue((currentQueue) =>
      currentQueue.map((item) => (item.id === itemId ? { ...item, ...updater(item) } : item)),
    )
  }

  function mergeFiles(files) {
    const fileList = Array.from(files ?? [])
    const supportedFiles = []
    const invalidFiles = []

    fileList.forEach((file) => {
      if (isSupportedFile(file)) {
        supportedFiles.push(file)
      } else {
        invalidFiles.push(file.name)
      }
    })

    const availableSlots = Math.max(0, maxBatchFiles - queue.length)
    const nextFiles = supportedFiles.slice(0, availableSlots)

    if (supportedFiles.length > availableSlots) {
      setError(`You can queue up to ${maxBatchFiles} files at once.`)
    } else if (invalidFiles.length) {
      setError(`Unsupported files skipped: ${invalidFiles.join(', ')}`)
    } else {
      setError('')
    }

    if (!nextFiles.length) {
      return
    }

    setDownloadReady(false)
    setQueue((currentQueue) => [...currentQueue, ...nextFiles.map(createQueueItem)])
  }

  function handleBrowseClick() {
    inputRef.current?.click()
  }

  function handleInputChange(event) {
    mergeFiles(event.target.files)
    event.target.value = ''
  }

  function handleDragEnter(event) {
    event.preventDefault()
    event.stopPropagation()
    dragDepth.current += 1
    setIsDragging(true)
  }

  function handleDragOver(event) {
    event.preventDefault()
    event.stopPropagation()
    event.dataTransfer.dropEffect = 'copy'
    setIsDragging(true)
  }

  function handleDragLeave(event) {
    event.preventDefault()
    event.stopPropagation()
    dragDepth.current -= 1

    if (dragDepth.current <= 0) {
      dragDepth.current = 0
      setIsDragging(false)
    }
  }

  function handleDrop(event) {
    event.preventDefault()
    event.stopPropagation()
    dragDepth.current = 0
    setIsDragging(false)
    mergeFiles(event.dataTransfer.files)
  }

  function handleSchemaTypeClick(type) {
    if (type !== 'Custom') {
      setSchemaText(schemaToText(documentSchemas[type]))
    }
  }

  async function handleProcessAll() {
    try {
      JSON.parse(schemaText)
    } catch {
      setError('The batch schema must be valid JSON before processing.')
      return
    }

    if (!queue.length) {
      setError('Add at least one file to the queue before starting the batch.')
      return
    }

    setError('')
    setProcessing(true)
    setDownloadReady(false)

    const historyItems = []

    for (const queueItem of queue) {
      updateQueueItem(queueItem.id, () => ({
        status: 'processing',
        progress: 10,
        error: '',
        warning: null,
      }))

      const formData = new FormData()
      formData.append('file', queueItem.file)
      formData.append('schema', schemaText)

      try {
        const response = await axios.post('http://localhost:8000/extract', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          onUploadProgress: (progressEvent) => {
            const loaded = progressEvent.loaded ?? 0
            const total = progressEvent.total ?? loaded ?? 1
            const uploadPercent = total > 0 ? loaded / total : 0
            const normalizedProgress = Math.max(12, Math.min(78, Math.round(uploadPercent * 68) + 10))

            updateQueueItem(queueItem.id, (currentItem) =>
              currentItem.status === 'processing'
                ? {
                    progress: normalizedProgress,
                  }
                : {},
            )
          },
        })

        const historyItem = createHistoryItem(
          response.data.data,
          response.data.pages_processed ?? null,
          response.data.warning ?? null,
        )

        historyItems.push(historyItem)

        updateQueueItem(queueItem.id, () => ({
          status: 'done',
          progress: 100,
          result: response.data.data,
          warning: response.data.warning ?? null,
          pagesProcessed: response.data.pages_processed ?? null,
          error: '',
        }))
      } catch (requestError) {
        const message =
          requestError.response?.data?.detail ||
          'Extraction failed. Check that the backend is running and your Groq key is set.'

        updateQueueItem(queueItem.id, () => ({
          status: 'failed',
          progress: 100,
          error: message,
        }))
      }
    }

    if (historyItems.length) {
      appendHistoryItemsToStorage(historyItems)
    }

    setProcessing(false)
    setDownloadReady(true)
  }

  async function handleDownloadZip() {
    const zip = new JSZip()
    const usedNames = new Set()

    queue.forEach((item) => {
      let baseName = sanitizeFilename(item.file.name)

      if (usedNames.has(baseName)) {
        let suffix = 2
        while (usedNames.has(`${baseName}-${suffix}`)) {
          suffix += 1
        }
        baseName = `${baseName}-${suffix}`
      }

      usedNames.add(baseName)

      const payload =
        item.status === 'done'
          ? item.result
          : {
              status: item.status,
              error: item.error || 'Batch item did not complete successfully.',
            }

      zip.file(`${baseName}.json`, JSON.stringify(payload, null, 2))
    })

    const blob = await zip.generateAsync({ type: 'blob' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'sudowoodo-batch-output.zip'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  function clearQueue() {
    if (processing) {
      return
    }

    setQueue([])
    setError('')
    setDownloadReady(false)
  }

  return (
    <div style={styles.page}>
      <nav style={styles.nav}>
        <div style={styles.navLeft}>
          <Link style={styles.logo} to="/">
            SUDOWOODO
          </Link>
          <Link style={styles.navLink} to="/dashboard">
            Dashboard
          </Link>
          <Link style={joinStyles(styles.navLink, styles.navLinkActive)} to="/batch">
            Batch
          </Link>
          <Link style={styles.navLink} to="/docs">
            API Docs
          </Link>
        </div>
        <Link style={styles.navButton} to="/app">
          Open App
        </Link>
      </nav>

      <section style={styles.hero}>
        <p style={styles.eyebrow}>Batch Processing</p>
        <h1 style={styles.title}>Run the same schema across a stack of documents.</h1>
        <p style={styles.subtitle}>
          Queue up to {maxBatchFiles} files, apply one shared schema, process each document
          sequentially, and export all results as a single ZIP when the batch is complete.
        </p>
      </section>

      <section style={styles.layout}>
        <div style={styles.card}>
          <div>
            <h2 style={styles.sectionTitle}>Batch Setup</h2>
            <p style={styles.sectionText}>
              Upload multiple files, choose the schema once, then let Sudowoodo work through the
              queue one document at a time.
            </p>
          </div>

          <div
            className="sudowoodo-premium-card"
            style={joinStyles(styles.uploadZone, isDragging ? styles.uploadZoneActive : null)}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            <input
              ref={inputRef}
              style={styles.hiddenInput}
              type="file"
              multiple
              accept=".pdf,.png,.jpg,.jpeg,.tif,.tiff,.webp,application/pdf,image/png,image/jpeg,image/tiff,image/webp"
              onChange={handleInputChange}
            />

            <span
              className={isDragging ? 'sudowoodo-drop-icon-bounce' : undefined}
              style={styles.uploadIcon}
            >
              <BatchUploadIcon />
            </span>
            <p style={styles.uploadTitle}>Drop up to {maxBatchFiles} documents here</p>
            <p style={styles.uploadText}>
              Add PDFs or images in one go, or keep adding files until the queue reaches its limit.
            </p>
            <div style={styles.row}>
              <button
                className="sudowoodo-pressable"
                style={styles.actionButton}
                type="button"
                onClick={handleBrowseClick}
              >
                Browse Files
              </button>
              <span style={styles.helperChip}>{queue.length} queued</span>
            </div>
          </div>

          <div>
            <h2 style={styles.sectionTitle}>Shared Schema</h2>
            <p style={styles.sectionText}>
              This schema will be sent with every document in the batch.
            </p>
          </div>

          <div style={styles.pillRow}>
            {schemaTypes.map((type) => (
              <button
                key={type}
                className="sudowoodo-pressable"
                style={joinStyles(styles.pill, activeSchemaType === type ? styles.pillActive : null)}
                type="button"
                onClick={() => handleSchemaTypeClick(type)}
              >
                {type}
              </button>
            ))}
          </div>

          <textarea
            style={styles.textarea}
            value={schemaText}
            onChange={(event) => setSchemaText(event.target.value)}
            spellCheck="false"
          />

          {error ? <p style={styles.error}>{error}</p> : null}
        </div>

        <div style={styles.card}>
          <div style={styles.row}>
            <div style={{ display: 'grid', gap: '6px', flex: '1 1 auto' }}>
              <h2 style={styles.sectionTitle}>Queue</h2>
              <p style={styles.sectionText}>
                {queue.length
                  ? `${completedCount} of ${queue.length} complete`
                  : 'Add files to build your batch queue.'}
              </p>
            </div>
            <button
              className="sudowoodo-pressable"
              style={joinStyles(
                styles.actionButton,
                !queue.length || processing ? styles.actionButtonDisabled : null,
              )}
              type="button"
              onClick={handleProcessAll}
              disabled={!queue.length || processing}
            >
              {processing ? 'Processing...' : 'Process All'}
            </button>
            <button
              className="sudowoodo-pressable"
              style={joinStyles(
                styles.actionButton,
                styles.actionButtonSecondary,
                !queue.length || processing ? styles.actionButtonDisabled : null,
              )}
              type="button"
              onClick={clearQueue}
              disabled={!queue.length || processing}
            >
              Clear
            </button>
          </div>

          {queue.length ? (
            <div style={styles.progressWrap}>
              <div style={styles.progressLabel}>
                <span>
                  Overall batch progress: {completedCount} of {queue.length} complete
                </span>
                <span>{overallPercent}%</span>
              </div>
              <div style={styles.progressTrack}>
                <div style={joinStyles(styles.progressFill, { width: `${overallPercent}%` })} />
              </div>
            </div>
          ) : null}

          {allFinished && downloadReady ? (
            <div style={styles.row}>
              <span style={styles.helperChip}>{processedCount} successful results ready</span>
              <button
                className="sudowoodo-pressable"
                style={styles.actionButton}
                type="button"
                onClick={handleDownloadZip}
              >
                Download All as ZIP
              </button>
            </div>
          ) : null}

          {queue.length ? (
            <div style={styles.queueList}>
              {queue.map((item) => {
                const statusStyle =
                  item.status === 'done'
                    ? styles.statusDone
                    : item.status === 'failed'
                      ? styles.statusFailed
                      : item.status === 'processing'
                        ? styles.statusProcessing
                        : styles.statusWaiting
                const progressStyle =
                  item.status === 'done'
                    ? styles.progressFillDone
                    : item.status === 'failed'
                      ? styles.progressFillFailed
                      : null

                return (
                  <article key={item.id} style={styles.queueItem}>
                    <div style={styles.queueTop}>
                      <div style={styles.fileMeta}>
                        <span style={styles.fileName}>{item.file.name}</span>
                        <span style={styles.fileSize}>{formatFileSize(item.file.size)}</span>
                      </div>
                      <span style={joinStyles(styles.statusBadge, statusStyle)}>
                        {item.status === 'done'
                          ? 'Done'
                          : item.status === 'failed'
                            ? 'Failed'
                            : item.status === 'processing'
                              ? 'Processing'
                              : 'Waiting'}
                      </span>
                    </div>

                    <div style={styles.progressWrap}>
                      <div style={styles.progressLabel}>
                        <span>Progress</span>
                        <span>{item.progress}%</span>
                      </div>
                      <div style={styles.progressTrack}>
                        <div
                          style={joinStyles(styles.progressFill, progressStyle, {
                            width: `${item.progress}%`,
                          })}
                        />
                      </div>
                    </div>

                    {item.warning ? <p style={styles.warningText}>{item.warning}</p> : null}
                    {item.error ? <p style={styles.fileError}>{item.error}</p> : null}
                  </article>
                )
              })}
            </div>
          ) : (
            <div style={styles.emptyState}>
              Add a few documents to the queue and Sudowoodo will process them one by one.
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

export default BatchProcessor
