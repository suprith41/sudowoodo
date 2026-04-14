function SchemaEditor({ schemaText, onSchemaChange }) {
  return (
    <section className="panel-block">
      <div className="section-heading">
        <h2>Schema Editor</h2>
        <p>Edit the JSON shape you want the model to return.</p>
      </div>

      <textarea
        className="schema-textarea"
        value={schemaText}
        onChange={(event) => onSchemaChange(event.target.value)}
        spellCheck="false"
      />
    </section>
  )
}

export default SchemaEditor
