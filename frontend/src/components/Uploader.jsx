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

function Uploader({ selectedFile, onFileChange }) {
  function handleChange(event) {
    const nextFile = event.target.files?.[0] ?? null
    onFileChange(nextFile)
  }

  return (
    <section className="panel-block">
      <div className="section-heading">
        <h2>Uploader</h2>
        <p>PDF, PNG, JPG, JPEG, and WEBP are supported.</p>
      </div>

      <label className="upload-dropzone" htmlFor="document-upload">
        <input
          id="document-upload"
          type="file"
          accept=".pdf,.png,.jpg,.jpeg,.webp,application/pdf,image/png,image/jpeg,image/webp"
          onChange={handleChange}
        />
        <span className="upload-title">Choose document</span>
        <span className="upload-subtitle">Click here and select the file you want to extract.</span>
      </label>

      <div className="file-summary">
        <span>Selected file</span>
        <strong>{selectedFile ? selectedFile.name : 'No file selected yet'}</strong>
        <span>{selectedFile ? formatFileSize(selectedFile.size) : 'Waiting for upload'}</span>
      </div>
    </section>
  )
}

export default Uploader
