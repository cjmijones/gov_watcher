// src/services/federalRegisterService.js (ESM)
import axios from 'axios';
import { load } from 'cheerio'; 
import { fetchAndExtractExecOrder } from '../utils/xmlExecOrderParser.js';
import ExecutiveOrder from '../models/ExecutiveOrder.js';

/**
 * Fetches Executive Orders from the Federal Register between the given startDate and endDate.
 * If endDate is not provided, returns all orders published on/after startDate.
 * If both are the same date, effectively fetches EOs for that date.
 * 
 * Example usage:
 *   // Single date:
 *   await fetchExecutiveOrdersForDate({ startDate: '2023-06-01' });
 * 
 *   // Date range:
 *   await fetchExecutiveOrdersForDate({ startDate: '2023-06-01', endDate: '2023-06-05' });
 */
export async function fetchExecutiveOrdersForDate({ startDate, endDate }) {
  try {
    const url = `${process.env.FEDERAL_REGISTER_BASE_URL}/api/v1/documents.json`;

    const params = {
      // Filter for only executive orders
      'conditions[presidential_document_type][]': 'executive_order',

      // Date filters
      'conditions[publication_date][gte]': startDate || '2025-01-20',
      per_page: 100,
      order: 'newest',

      // Request specific fields in the response
      'fields[]': [
        'title',
        'abstract',
        'agencies',
        'signing_date',
        'full_text_xml_url',
        'pdf_url',
        'document_number',
        'publication_date',
        'html_url',
        'json_url',
        'raw_text_url'
      ],

      // Attempt to include full text in the JSON if available
      'include[]': ['full_text_url']
    };

    if (endDate) {
      params['conditions[publication_date][lte]'] = endDate;
    }

    console.log('Requesting Federal Register with:', url, params);
    const response = await axios.get(url, { params });

    console.log('Federal Register Status:', response.status);
    const results = response.data.results || [];
    console.log('Number of results:', results.length);
    
    // console.log('Document item keys:', results.keys(item))

    for (const item of results) {
      // 1) Basic Fields from the JSON
      const docId = item.document_number; 
      const title = item.title; 
      const type = item.type; 
      const publicationDate = item.publication_date; 
      const htmlUrl = item.html_url; 
      const pdfUrl = item.pdf_url;
      const jsonUrl = item.json_url;
      const signingDate = item.signing_date
      const full_text_xml_url = item.full_text_xml_url;
      const abstract = item.abstract; 
      const agencies = item.agencies || []; 
      let bodyText = '';
      let summaryText = '';


      // 3) If `body_html` is missing, check if `full_text_xml_url` is available
      // this makes a call to the utility function in the xmlExecOrderParser.js file
      if (item.full_text_xml_url) {
        bodyText = await fetchAndExtractExecOrder(item.full_text_xml_url);
      }

      // console.log(bodyText)

      // 4) Upsert into MongoDB with the extended fields
      await ExecutiveOrder.findOneAndUpdate(
        { docId }, // match the docId
        {
          docId,
          title,
          type,
          publicationDate,
          signingDate,
          htmlUrl,
          pdfUrl,
          jsonUrl,
          full_text_xml_url,
          abstract,
          agencies,
          bodyText, // <-- Now correctly stores the full text
          summaryText,
        },
        { upsert: true, new: true }
      );

      console.log(`Upserted docId=${docId} with title="${title}"`);
    }

    console.log(`Finalized Document Upserting`);

    return results;
  } catch (error) {
    console.error('Error fetching from Federal Register:', error);
    return [];
  }
}
