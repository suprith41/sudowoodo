import { documentSchemas, schemaToText } from '../lib/documentSchemas'

const documentTypes = ['Invoice', 'Receipt', 'Medical Record', 'Contract', 'Custom']

const styles = {
  section: {
    display: 'grid',
    gap: '16px',
  },
  headingWrap: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: '12px',
    flexWrap: 'wrap',
  },
  headingText: {
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
  autoDetectButton: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    border: '1px solid var(--blue-accent)',
    borderRadius: '999px',
    background: 'var(--blue-accent-soft)',
    color: 'var(--blue-accent-text)',
    cursor: 'pointer',
    font: 'inherit',
    fontSize: '0.92rem',
    fontWeight: 700,
    padding: '10px 15px',
    boxShadow: '0 8px 18px rgba(29, 78, 216, 0.12)',
  },
  autoDetectButtonDisabled: {
    cursor: 'not-allowed',
    opacity: 0.62,
    boxShadow: 'none',
  },
  buttonSpinner: {
    width: '14px',
    height: '14px',
    border: '2px solid rgba(29, 78, 216, 0.22)',
    borderTopColor: 'var(--blue-accent)',
    borderRadius: '50%',
    flexShrink: 0,
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
    transition: 'background 160ms ease, border-color 160ms ease, color 160ms ease',
  },
  pillActive: {
    borderColor: 'var(--blue-accent)',
    background: 'var(--blue-accent)',
    color: '#ffffff',
    boxShadow: '0 5px 14px rgba(29, 78, 216, 0.2)',
  },
  textarea: {
    width: '100%',
    minHeight: '300px',
    boxSizing: 'border-box',
    border: '1px solid var(--border)',
    borderRadius: '12px',
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
  autoDetectButtonMobile: {
    width: '100%',
  },
  textareaMobile: {
    minHeight: '220px',
    fontSize: '0.88rem',
    padding: '14px',
  },
}

function joinStyles(...styleObjects) {
  return Object.assign({}, ...styleObjects)
}

function getActiveType(schemaText) {
  for (const [type, schema] of Object.entries(documentSchemas)) {
    if (schemaToText(schema) === schemaText) {
      return type
    }
  }

  return 'Custom'
}

function SchemaEditor({
  isMobile = false,
  schemaText,
  onSchemaChange,
  onAutoDetectSchema,
  autoDetectLoading = false,
  autoDetectDisabled = false,
}) {
  const activeType = getActiveType(schemaText)

  function handleTypeClick(type) {
    if (type !== 'Custom') {
      onSchemaChange(schemaToText(documentSchemas[type]))
    }
  }

  function handleTextChange(event) {
    onSchemaChange(event.target.value)
  }

  return (
    <section style={styles.section}>
      <div style={styles.headingWrap}>
        <div style={styles.headingText}>
          <h2 style={styles.heading}>Schema Editor</h2>
          <p style={styles.helperText}>Choose a document type or edit the JSON shape directly.</p>
        </div>
        <button
          className="sudowoodo-pressable"
          style={joinStyles(
            styles.autoDetectButton,
            isMobile ? styles.autoDetectButtonMobile : null,
            autoDetectDisabled ? styles.autoDetectButtonDisabled : null,
          )}
          type="button"
          onClick={onAutoDetectSchema}
          disabled={autoDetectDisabled}
        >
          {autoDetectLoading ? (
            <span className="sudowoodo-spinner" style={styles.buttonSpinner} aria-hidden="true" />
          ) : null}
          <span>Auto Detect Schema ✨</span>
        </button>
      </div>

      <div style={styles.pillRow} aria-label="Document type">
        {documentTypes.map((type) => (
          <button
            key={type}
            className="sudowoodo-pressable"
            style={joinStyles(styles.pill, activeType === type ? styles.pillActive : null)}
            type="button"
            onClick={() => handleTypeClick(type)}
          >
            {type}
          </button>
        ))}
      </div>

      <textarea
        style={joinStyles(styles.textarea, isMobile ? styles.textareaMobile : null)}
        value={schemaText}
        onChange={handleTextChange}
        spellCheck="false"
      />
    </section>
  )
}

export default SchemaEditor
