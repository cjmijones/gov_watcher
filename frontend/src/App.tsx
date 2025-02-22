import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import OrdersPage from "./pages/OrdersPage.tsx";
import HomePage from "./pages/HomePage.tsx";
import EOList from "./pages/EOList.tsx";


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/orders" element={<OrdersPage />} />
        <Route path="/eolist" element={<EOList />} />
      </Routes>
    </Router>
  );
}

export default App;
