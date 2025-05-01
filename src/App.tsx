
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import RoundTracking from "./pages/RoundTracking";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
// Import other pages as needed

function App() {
  return (
    <Router>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/rounds/*" element={<RoundTracking />} />
          <Route path="/dashboard" element={<Dashboard />} />
          {/* Add other routes here */}
          <Route path="*" element={<RoundTracking />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
