import { useRef, useState } from 'react'

const acceptedExtensions = ['pdf', 'png', 'jpg', 'jpeg', 'tif', 'tiff', 'webp']
const acceptedMimeTypes = [
  'application/pdf',
  'image/png',
  'image/jpeg',
  'image/tiff',
  'image/webp',
]

const styles = {
  section: {
    display: 'grid',
    gap: '16px',
  },
  headingWrap: {
    display: 'grid',
    gap: '6px',
  },
  heading: {
    margin: 0,
    color: 'var(--text-primary)',
    fontSize: '1.1rem',
    fontWeight: 700,
  },
  helperText: {
    margin: 0,
    color: 'var(--text-secondary)',
    fontSize: '0.95rem',
    lineHeight: 1.45,
  },
  dropZone: {
    display: 'grid',
    justifyItems: 'center',
    gap: '12px',
    minHeight: '220px',
    padding: '34px 22px',
    border: '2px dashed var(--border)',
    borderRadius: '14px',
    background: 'var(--card-bg)',
    color: 'var(--text-primary)',
    textAlign: 'center',
    transition: 'transform 220ms ease, border-color 160ms ease, background 160ms ease, box-shadow 160ms ease',
  },
  dropZoneActive: {
    borderColor: 'var(--blue-accent)',
    background: 'var(--blue-accent-soft)',
    boxShadow: '0 0 0 4px rgba(37, 99, 235, 0.08)',
  },
  iconWrap: {
    display: 'grid',
    placeItems: 'center',
    width: '62px',
    height: '62px',
    borderRadius: '999px',
    background: 'var(--blue-accent-soft)',
    color: 'var(--blue-accent-text)',
  },
  title: {
    margin: 0,
    color: 'var(--text-primary)',
    fontSize: '1.25rem',
    fontWeight: 750,
  },
  subtitle: {
    margin: 0,
    maxWidth: '380px',
    color: 'var(--text-secondary)',
    fontSize: '0.95rem',
    lineHeight: 1.5,
  },
  browseButton: {
    marginTop: '4px',
    border: '1px solid var(--blue-accent)',
    borderRadius: '999px',
    background: 'var(--blue-accent)',
    color: '#ffffff',
    cursor: 'pointer',
    font: 'inherit',
    fontSize: '0.95rem',
    fontWeight: 700,
    padding: '10px 18px',
    boxShadow: '0 8px 18px rgba(37, 99, 235, 0.22)',
  },
  hiddenInput: {
    display: 'none',
  },
  fileDetails: {
    display: 'grid',
    gap: '4px',
    padding: '13px 14px',
    border: '1px solid var(--border-soft)',
    borderRadius: '10px',
    background: 'var(--card-bg-soft)',
  },
  fileLabel: {
    color: 'var(--text-secondary)',
    fontSize: '0.86rem',
  },
  fileName: {
    color: 'var(--text-primary)',
    fontSize: '0.98rem',
    fontWeight: 700,
    overflowWrap: 'anywhere',
  },
  fileSize: {
    color: 'var(--text-secondary)',
    fontSize: '0.9rem',
  },
  error: {
    margin: 0,
    color: '#dc2626',
    fontSize: '0.95rem',
    fontWeight: 700,
  },
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

function getFileExtension(fileName) {
  return fileName.split('.').pop()?.toLowerCase() ?? ''
}

function isSupportedFile(file) {
  const extension = getFileExtension(file.name)

  return acceptedExtensions.includes(extension) || acceptedMimeTypes.includes(file.type)
}

function CloudUploadIcon() {
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
      <path d="M16 16l-4-4-4 4" />
      <path d="M12 12v9" />
      <path d="M20.4 18.8A5 5 0 0018 9.4h-.6A7 7 0 104.6 16.2" />
    </svg>
  )
}

function joinStyles(...styleObjects) {
  return Object.assign({}, ...styleObjects)
}

function Uploader({ selectedFile, onFileSelect }) {
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState('')
  const inputRef = useRef(null)
  const dragDepth = useRef(0)

  function selectFile(file) {
    if (!file) {
      return
    }

    if (!isSupportedFile(file)) {
      setError('Unsupported file type')
      return
    }

    setError('')
    onFileSelect(file)
  }

  function handleBrowseClick() {
    inputRef.current?.click()
  }

  function handleInputChange(event) {
    const file = event.target.files?.[0] ?? null
    selectFile(file)
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

    const file = event.dataTransfer.files?.[0] ?? null
    selectFile(file)
  }

  return (
    <section style={styles.section}>
      <div style={styles.headingWrap}>
        <h2 style={styles.heading}>Uploader</h2>
        <p style={styles.helperText}>Accepted formats: PDF, PNG, JPG, JPEG, TIFF, WEBP.</p>
      </div>

      <div
        className="sudowoodo-premium-card"
        style={joinStyles(styles.dropZone, isDragging ? styles.dropZoneActive : null)}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <input
          ref={inputRef}
          style={styles.hiddenInput}
          type="file"
          accept=".pdf,.png,.jpg,.jpeg,.tif,.tiff,.webp,application/pdf,image/png,image/jpeg,image/tiff,image/webp"
          onChange={handleInputChange}
        />

        <span className={isDragging ? 'sudowoodo-drop-icon-bounce' : undefined} style={styles.iconWrap}>
          <CloudUploadIcon />
        </span>
        <p style={styles.title}>Drag your document here</p>
        <p style={styles.subtitle}>Drop a supported document into this area, or choose one manually.</p>
        <button
          className="sudowoodo-pressable"
          style={styles.browseButton}
          type="button"
          onClick={handleBrowseClick}
        >
          Browse files
        </button>
      </div>

      {error ? <p style={styles.error}>{error}</p> : null}

      {selectedFile ? (
        <div className="sudowoodo-premium-card" style={styles.fileDetails}>
          <span style={styles.fileLabel}>Selected file</span>
          <span style={styles.fileName}>{selectedFile.name}</span>
          <span style={styles.fileSize}>{formatFileSize(selectedFile.size)}</span>
        </div>
      ) : null}
    </section>
  )
}

export default Uploader
