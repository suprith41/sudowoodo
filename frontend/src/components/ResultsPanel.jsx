import { useDeferredValue, useState } from 'react'

function prettifyLabel(label) {
  return label
    .replaceAll('.', ' / ')
    .replaceAll('_', ' ')
    .replace(/\[(\d+)\]/g, ' $1')
    .replace(/\b\w/g, (character) => character.toUpperCase())
}

function flattenResult(value, prefix = '') {
  if (Array.isArray(value)) {
    if (value.length === 0) {
      return [{ label: prefix || 'value', value: '[]' }]
    }

    if (value.every((item) => item === null || typeof item !== 'object')) {
      return [{ label: prefix || 'value', value: value.join(', ') || 'Not found' }]
    }

    return value.flatMap((item, index) => flattenResult(item, `${prefix}[${index + 1}]`))
  }

  if (value && typeof value === 'object') {
    return Object.entries(value).flatMap(([key, nestedValue]) =>
      flattenResult(nestedValue, prefix ? `${prefix}.${key}` : key),
    )
  }

  return [{ label: prefix || 'value', value: value ?? 'Not found' }]
}

function renderHighlightedJson(value) {
  const json = JSON.stringify(value, null, 2)
  const tokenPattern =
    /("(?:\\.|[^"\\])*"(?=\s*:))|("(?:\\.|[^"\\])*")|\btrue\b|\bfalse\b|\bnull\b|-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?/g

  const pieces = []
  let lastIndex = 0
  let match

  while ((match = tokenPattern.exec(json)) !== null) {
    if (match.index > lastIndex) {
      pieces.push({
        type: 'plain',
        value: json.slice(lastIndex, match.index),
      })
    }

    let tokenType = 'number'
    if (match[1]) {
      tokenType = 'key'
    } else if (match[2]) {
      tokenType = 'string'
    } else if (match[0] === 'true' || match[0] === 'false') {
      tokenType = 'boolean'
    } else if (match[0] === 'null') {
      tokenType = 'null'
    }

    pieces.push({
      type: tokenType,
      value: match[0],
    })

    lastIndex = tokenPattern.lastIndex
  }

  if (lastIndex < json.length) {
    pieces.push({
      type: 'plain',
      value: json.slice(lastIndex),
    })
  }

  return pieces.map((piece, index) => (
    <span key={`${piece.type}-${index}`} className={`json-${piece.type}`}>
      {piece.value}
    </span>
  ))
}

function ResultsPanel({ result }) {
  const [viewMode, setViewMode] = useState('text')
  const deferredResult = useDeferredValue(result)

  if (!deferredResult) {
    return (
      <section className="results-panel empty-state">
        <div className="results-topbar">
          <h2>Results</h2>
          <div className="results-toggle">
            <button className="active" type="button">
              Text
            </button>
            <button type="button">JSON</button>
          </div>
        </div>
        <p>Run an extraction to see structured output here.</p>
      </section>
    )
  }

  const rows = flattenResult(deferredResult)

  return (
    <section className="results-panel">
      <div className="results-topbar">
        <h2>Results</h2>
        <div className="results-toggle">
          <button
            className={viewMode === 'text' ? 'active' : ''}
            type="button"
            onClick={() => setViewMode('text')}
          >
            Text
          </button>
          <button
            className={viewMode === 'json' ? 'active' : ''}
            type="button"
            onClick={() => setViewMode('json')}
          >
            JSON
          </button>
        </div>
      </div>

      {viewMode === 'text' ? (
        <div className="text-results">
          {rows.map((row) => (
            <article className="result-row" key={`${row.label}-${String(row.value)}`}>
              <span className="result-label">{prettifyLabel(row.label)}</span>
              <span className="result-value">{String(row.value)}</span>
            </article>
          ))}
        </div>
      ) : (
        <pre className="json-results">{renderHighlightedJson(deferredResult)}</pre>
      )}
    </section>
  )
}

export default ResultsPanel
