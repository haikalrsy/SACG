import React, { useState } from "react";
import { HashLink } from "react-router-hash-link"; // pakai HashLink

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 w-full z-50 backdrop-blur-lg bg-white/10 border-b border-white/10 shadow-md text-black">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        <h1 className="text-white text-xl font-bold">SACG</h1>
        <nav className="space-x-6 hidden md:flex items-center">
          <HashLink smooth to="/#hero" className="text-black hover:text-blue-300 transition">
            Home
          </HashLink>

          {/* Dropdown Menu */}
          <div className="relative">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-black hover:text-blue-300 transition flex items-center gap-1"
            >
              Mission
              <span className="text-xs">▼</span>
            </button>
            {isOpen && (
              <div
                className="absolute left-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50"
                onMouseLeave={() => setIsOpen(false)}
              >
                <HashLink smooth to="/#history" className="block px-4 py-2 hover:bg-blue-100 text-black">
                  Our History
                </HashLink>
                <HashLink smooth to="/#vision" className="block px-4 py-2 hover:bg-blue-100 text-black">
                  Our Vision
                </HashLink>
                <HashLink smooth to="/#projects" className="block px-4 py-2 hover:bg-blue-100 text-black">
                  Projects
                </HashLink>
              </div>
            )}
          </div>

          <HashLink smooth to="/#team" className="text-black hover:text-blue-300 transition">
            Team
          </HashLink>
          <HashLink smooth to="/#contact" className="text-black hover:text-blue-300 transition">
            Contact
          </HashLink>
        </nav>
      </div>
    </header>
  );
}
