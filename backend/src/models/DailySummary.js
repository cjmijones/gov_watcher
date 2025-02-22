// models/DailySummary.js (ESM)
import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const dailySummarySchema = new Schema({
  date: { type: String, unique: true },
  summaryText: String,
}, {
  timestamps: true
});

export default model('DailySummary', dailySummarySchema);
