import { useState, useTransition } from 'react'
import axios from 'axios'
import './App.css'
import ResultsPanel from './components/ResultsPanel'
import SchemaEditor from './components/SchemaEditor'
import Uploader from './components/Uploader'

const defaultSchema = `{
  "document_type": "",
  "document_date": "",
  "issuer": "",
  "recipient": "",
  "document_number": "",
  "line_items": [
    {
      "description": "",
      "quantity": "",
      "unit_price": "",
      "amount": ""
    }
  ],
  "subtotal": "",
  "tax": "",
  "total_amount": ""
}`

function App() {
  const [selectedFile, setSelectedFile] = useState(null)
  const [schemaText, setSchemaText] = useState(defaultSchema)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [isPending, startTransition] = useTransition()

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
      })
    } catch (requestError) {
      const message =
        requestError.response?.data?.detail ||
        'Extraction failed. Check that the backend is running and your Groq key is set.'
      setResult(null)
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
        <div className="hero-card">
          <p className="hero-card-label">Pipeline</p>
          <ol>
            <li>Upload document</li>
            <li>Render PDF pages to images</li>
            <li>Extract with Llama 4 Scout</li>
            <li>Validate and return JSON</li>
          </ol>
        </div>
      </header>

      <main className="workspace">
        <section className="control-panel">
          <form className="extract-form" onSubmit={handleSubmit}>
            <Uploader selectedFile={selectedFile} onFileChange={setSelectedFile} />
            <SchemaEditor schemaText={schemaText} onSchemaChange={setSchemaText} />

            <button className="extract-button" type="submit" disabled={loading}>
              {loading ? 'Extracting...' : 'Run Extraction'}
            </button>

            {error ? <p className="status-message error">{error}</p> : null}
            {!error && (loading || isPending) ? (
              <p className="status-message">Working on your document...</p>
            ) : null}
          </form>
        </section>

        <section className="results-column">
          <ResultsPanel result={result} />
        </section>
      </main>
    </div>
  )
}

export default App
