const documentSchemas = {
  Invoice: {
    document_type: '',
    document_date: '',
    issuer: '',
    recipient: '',
    document_number: '',
    line_items: [{ description: '', quantity: null, unit_price: null, amount: null }],
    subtotal: null,
    tax: null,
    total_amount: null,
  },
  Receipt: {
    document_type: 'receipt',
    store_name: '',
    date: '',
    items: [{ name: '', quantity: null, price: null }],
    subtotal: null,
    tax: null,
    total: null,
    payment_method: '',
  },
  'Medical Record': {
    document_type: 'medical_record',
    patient_name: '',
    date: '',
    doctor: '',
    hospital: '',
    diagnosis: '',
    medications: [{ name: '', dosage: '', frequency: '' }],
    notes: '',
  },
  Contract: {
    document_type: 'contract',
    title: '',
    date: '',
    party_a: '',
    party_b: '',
    terms: [],
    total_value: null,
    start_date: '',
    end_date: '',
  },
}

function schemaToText(schema) {
  return JSON.stringify(schema, null, 2)
}

export { documentSchemas, schemaToText }
