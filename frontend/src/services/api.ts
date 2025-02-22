import axios from "axios";

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

// Fetch all executive orders
export async function fetchExecutiveOrders() {
  const response = await axios.get(`${apiBaseUrl}/executive-orders`);
  return response.data;
}

// Fetch a specific executive order by docId
export async function fetchExecutiveOrder(docId: string) {
  try {
    const response = await axios.get(`${apiBaseUrl}/fetchEosFromDB?docId=${docId}`);
    return response.data.data; // Assuming the response structure contains { data: { ... } }
  } catch (error) {
    console.error("Error fetching executive order:", error);
    throw error;
  }
}
