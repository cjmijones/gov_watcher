// src/utils/parseBetweenHdAndGph.js
import axios from 'axios';
import { XMLParser } from 'fast-xml-parser';

export async function fetchAndExtractExecOrder(xmlUrl) {
  // 1) Download the XML file
  const xmlResponse = await axios.get(xmlUrl);
  const xmlData = xmlResponse.data;

  // 2) Parse with preserveOrder
  const parser = new XMLParser({
    preserveOrder: true,
    ignoreAttributes: false,
  });
  const parsed = parser.parse(xmlData);

  // 3) We expect something like:
  // [ { PRESDOCU: [ { EXECORD: [ nodes in order ] } ] } ]
  // The exact shape can vary slightly, so we might need deeper checks
  // Let’s find PRESDOCU -> EXECORD
  let execordArray = null;

  // The top-level is an array of node-objects
  // We'll search for the object that has "PRESDOCU" property
  for (const topNode of parsed) {
    if (topNode.PRESDOCU && Array.isArray(topNode.PRESDOCU)) {
      // Within PRESDOCU, find the object that has "EXECORD"
      for (const innerNode of topNode.PRESDOCU) {
        if (innerNode.EXECORD && Array.isArray(innerNode.EXECORD)) {
          execordArray = innerNode.EXECORD; // This is the array of child nodes
          break;
        }
      }
    }
    if (execordArray) break; // found it
  }

  if (!execordArray) {
    console.warn("Could not find <EXECORD> array in the XML structure.");
    return "";
  }

  // 4) Now execordArray is the array of children inside <EXECORD>.
  // We'll iterate in order, capturing text from <HD> until <GPH>.
  let collecting = false;
  let collectedText = "";

  // Helper to append text from various tags (FP, P, etc.)
  function extractNodeText(node) {
    // node can be { "#text": "some string" } or { tagName: [ children ] }
    // If node is "#text", that means a raw text node
    // If node is "FP"/"P" or something else, we might need to gather nested text
    // In preserveOrder mode, each child is an object with a single key
    for (const key of Object.keys(node)) {
      if (key === "#text") {
        collectedText += node[key].trim() + "\n";
      } else if (Array.isArray(node[key])) {
        // This is a sub-array, recursively extract
        for (const child of node[key]) {
          extractNodeText(child);
        }
      }
    }
  }

  // 5) Iterate the children
  for (const child of execordArray) {
    // child will look like { TAGNAME: [ ... ] } e.g. { HD: [ { '#text': 'My Title' } ] }
    const tagName = Object.keys(child)[0];  // e.g. "HD", "FP", "GPH", "P"
    const content = child[tagName];

    if (tagName === "HD") {
      // Start collecting from <HD> onward
      collecting = true;
    }
    else if (tagName === "GPH") {
      // Stop collecting
      break;
    }

    if (collecting) {
      // Gather text from this node if it has text
      // e.g., <HD>some text</HD>, <FP>some paragraphs</FP>
      // content is an array, so we loop over it
      if (Array.isArray(content)) {
        for (const subNode of content) {
          extractNodeText(subNode);
        }
      }
    }
  }

  return collectedText.trim();
}
