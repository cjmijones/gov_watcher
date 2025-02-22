// services/summarizationService.js (ESM)
import { OpenAI } from 'openai';
import DailySummary from '../models/DailySummary.js';
import ExecutiveOrder from '../models/ExecutiveOrder.js';


const openai = new OpenAI({
  apiKey: process.env['OPENAI_API_KEY'],
});


// Second iteration function designed to be called in manual api route
// Makes use of the base executive order model

export async function summarizeExecutiveOrder(docId) {
  try {
    console.log(`Generating summary for EO docId=${docId}`);

    // Fetch the EO from MongoDB
    const executiveOrder = await ExecutiveOrder.findOne({ docId });

    if (!executiveOrder || !executiveOrder.bodyText) {
      console.log(`No text available for EO docId=${docId}`);
      return null;
    }

    // Prepare LLM prompt
    const prompt = `Summarize the following executive order in a clear, concise manner for a general audience:\n\n` +
      `Title: ${executiveOrder.title}\n` +
      `Text: ${executiveOrder.bodyText.slice(0, 3000)}...\n\n` + 
      `The summary should highlight key actions taken, their significance, and who is impacted.`;

    console.log("Sending request to OpenAI...");
    
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "system", content: "You are a government policy analyst summarizing executive orders." },
                 { role: "user", content: prompt }],
      max_tokens: 512,
    });

    const summaryText = response.choices[0]?.message?.content?.trim() || "No summary generated.";

    console.log("Summary generated:", summaryText);

    // Store the summary in MongoDB
    executiveOrder.summaryText = summaryText;
    await executiveOrder.save();

    console.log(`Summary saved for EO docId=${docId}`);
    return summaryText;
  } catch (error) {
    console.error("Error generating summary:", error.message);
    return null;
  }
}

// Initial function designed to be called in automated cron pipeline
// Makes use of the daily summary mongo model
export async function summarizeExecutiveOrders(dateString, orders) {
  if (!orders || orders.length === 0) {
    return 'No executive orders found for this date.';
  }

  let prompt = `Summarize the following Executive Orders from ${dateString}:\n\n`;
  orders.forEach((order, idx) => {
    prompt += `${idx + 1}) Title: ${order.title}\n`;
    prompt += `Content: ${order.bodyText.slice(0, 1000)}\n\n`;
  });
  prompt += 'Highlight key points in a concise overview.\n';

  try {
    const response = await openai.createChatCompletion({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'You are a policy expert.' },
        { role: 'user', content: prompt }
      ]
    });

    const summary = response.data.choices[0].message.content;

    await DailySummary.findOneAndUpdate(
      { date: dateString },
      { summaryText: summary },
      { upsert: true, new: true }
    );

    return summary;
  } catch (error) {
    console.error('Error summarizing orders:', error);
    return null;
  }
}
