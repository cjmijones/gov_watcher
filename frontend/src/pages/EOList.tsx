import { useEffect, useState } from "react";
import { fetchExecutiveOrders, fetchExecutiveOrder } from "../services/api";

interface ExecutiveOrder {
  docId: string;
  title: string;
  publicationDate: string;
  summaryText?: string;
  bodyText?: string;
}

export default function EOList() {
  const [orders, setOrders] = useState<ExecutiveOrder[]>([]);
  const [searchDocId, setSearchDocId] = useState<string>("");
  const [selectedOrder, setSelectedOrder] = useState<ExecutiveOrder | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchExecutiveOrders()
      .then((data) => setOrders(data))
      .catch((err) => console.error(err));
  }, []);

  const handleSearch = async () => {
    if (!searchDocId.trim()) {
      setSelectedOrder(null);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const order = await fetchExecutiveOrder(searchDocId);
      setSelectedOrder(order);
    } catch (err) {
      setError("Executive Order not found.");
      setSelectedOrder(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>Executive Orders</h1>

      {/* Search Bar */}
      <input
        type="text"
        placeholder="Enter docId (e.g., 2025-02841)"
        value={searchDocId}
        onChange={(e) => setSearchDocId(e.target.value)}
        style={{ padding: "0.5rem", marginRight: "0.5rem" }}
      />
      <button onClick={handleSearch} style={{ padding: "0.5rem" }}>
        Search
      </button>

      {/* Loading State */}
      {loading && <p>Loading...</p>}

      {/* Error Message */}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {/* Show Selected Order */}
      {selectedOrder ? (
        <div style={{ border: "1px solid #ccc", margin: "1rem", padding: "1rem" }}>
          <h2>{selectedOrder.title}</h2>
          <p><strong>Published on:</strong> {selectedOrder.publicationDate}</p>
          <p>{selectedOrder.summaryText ?? "No summary available."}</p>
        </div>
      ) : (
        <>
          <h2>All Executive Orders</h2>
          {orders.map((eo) => (
            <div key={eo.docId} style={{ border: "1px solid #ccc", margin: "1rem", padding: "1rem" }}>
              <h2>{eo.title}</h2>
              <p>{eo.summaryText ?? "No summary available."}</p>
            </div>
          ))}
        </>
      )}
    </div>
  );
}
