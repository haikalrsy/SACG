import React from "react";
import CircularGallery from "./blocks/CircularGallery"; // ambil dari folder blocks

export default function GalleryPage() {
  return (
    <div className="bg-[#F2F8FC]" style={{ height: "600px", position: "relative" }}>
<h1 
  className="text-center text-4xl font-extrabold  text-gray-600  mb-6" data-aos = "fade-in"
>
  Our Gallery
</h1>
      <CircularGallery
        bend={3}
        textColor="#00000 "
        borderRadius={0.05}
        scrollEase={0.02}
      />
    </div>
  );
}
