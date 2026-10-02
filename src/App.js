import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";

function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col bg-white text-black font-sans">
        <Navbar />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            {/* Thêm các Route khác vào đây sau (vd: /shop, /cart) */}
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;