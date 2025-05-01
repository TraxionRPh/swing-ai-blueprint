import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import RoundTracking from "./pages/RoundTracking";
// Import other pages as needed

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/rounds/*" element={<RoundTracking />} />
        {/* Add other routes here */}
        <Route path="*" element={<RoundTracking />} />
      </Routes>
    </Router>
  );
}

export default App;
