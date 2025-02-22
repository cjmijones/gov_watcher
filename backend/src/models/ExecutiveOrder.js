// models/ExecutiveOrder.js (ESM)
import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const agencySchema = new Schema({
  raw_name: String,
  name: String,
  id: Number,
  url: String,
  json_url: String,
  parent_id: Number,
  slug: String,
}, { _id: false }); 
// _id: false because this is a sub-document (array of agencies)

const executiveOrderSchema = new Schema({
  docId: { type: String, unique: true },   // e.g. "2025-02841"
  title: String,                           // "One Voice for America's Foreign Relations"
  type: String,                            // "Presidential Document"
  publicationDate: Date,                   // "2025-02-18"
  signingDate: Date,
  htmlUrl: String,                         // https://www.federalregister.gov/documents/...
  pdfUrl: String,                          // https://www.govinfo.gov/content/pkg/FR-2025-...
  full_text_xml_url: String,
  jsonUrl: String,
  abstract: String,                        // "One Voice for America's Foreign Relations" short summary
  agencies: [agencySchema],               // array of agencies
  bodyText: String,                        // parsed from the HTML link
  summaryText: String,                    // AI-generated summary
}, {
  timestamps: true
});

export default model('ExecutiveOrder', executiveOrderSchema);
