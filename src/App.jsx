// App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ReactDOM from "react-dom/client";

import Navbar from "./components/Navbar";
import HeroSection from "./components/HeroSection";
import StatsSection from "./components/StatsSection";
import AdiwiyataImpactSection from "./components/AdiwiyataImpactSection";
import Gallery from "./components/gallery";
import Contact from "./components/contact";

export default function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route
          path="/"
          element={
            <>
              <HeroSection />
              <StatsSection />
              <AdiwiyataImpactSection />
              <Gallery />
              <Contact />
            </>
          }
        />
        {/* Kalau nanti ada halaman lain */}
        {/* <Route path="/about" element={<About />} /> */}
      </Routes>
    </Router>
  );
}
