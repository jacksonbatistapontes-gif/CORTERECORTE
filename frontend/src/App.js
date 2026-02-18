import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "@/pages/Home";
import Create from "@/pages/Create";
import Results from "@/pages/Results";
import HowItWorks from "@/pages/HowItWorks";
import { Toaster } from "sonner";

function App() {
  return (
    <div className="App" data-testid="app-root">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/create" element={<Create />} />
          <Route path="/results/:jobId" element={<Results />} />
          <Route path="/como-funciona" element={<HowItWorks />} />
        </Routes>
      </BrowserRouter>
      <Toaster richColors position="top-right" />
    </div>
  );
}

export default App;
