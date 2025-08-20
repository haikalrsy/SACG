import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ChevronDown, Play, Users, Waves, Leaf, Lightbulb, Star, ArrowRight, Globe } from 'lucide-react';
import TrueFocus from "./blocks/TrueFocus";
import ShinyText from "./blocks/ShinyText";

export default function EnhancedHeroSection() {
  const [isVisible, setIsVisible] = useState(false);
  const [currentCard, setCurrentCard] = useState(0);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [scrollY, setScrollY] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const heroRef = useRef(null);
  const particlesRef = useRef([]);

  // Initialize AOS
    useEffect(() => {
      // Add AOS CSS if not already loaded
      if (!document.querySelector('link[href*="aos"]')) {
        const aosCSS = document.createElement('link')
        aosCSS.rel = 'stylesheet'
        aosCSS.href = 'https://cdnjs.cloudflare.com/ajax/libs/aos/2.3.4/aos.css'
        document.head.appendChild(aosCSS)
      }
  
      // Add AOS JavaScript if not already loaded
      if (!window.AOS) {
        const aosScript = document.createElement('script')
        aosScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/aos/2.3.4/aos.js'
        aosScript.onload = () => {
          window.AOS.init({
            duration: 800,
            easing: 'ease-out-cubic',
           
            offset: 100,
            delay: 0,
          })
        }
        document.body.appendChild(aosScript)
      } else {
        window.AOS.init({
          duration: 800,
          easing: 'ease-out-cubic',
          offset: 100,
          delay: 0,
        })
      }
  
      return () => {
        if (window.AOS) {
          window.AOS.refreshHard()
        }
      }
    }, [])
  // Initialize particles
  useEffect(() => {
    particlesRef.current = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      size: Math.random() * 3 + 1,
      speedX: (Math.random() - 0.5) * 0.5,
      speedY: (Math.random() - 0.5) * 0.5,
      opacity: Math.random() * 0.5 + 0.2,
    }));
  }, []);

  // Handle scroll and mouse effects
  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    const handleMouseMove = (e) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 2 - 1,
        y: (e.clientY / window.innerHeight) * 2 - 1,
      });
    };

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('mousemove', handleMouseMove);
    
    setIsVisible(true);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  // Auto-rotate cards with smoother transition
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentCard((prev) => (prev + 1) % 3);
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);

  const scrollToNext = useCallback(() => {
    window.scrollTo({
      top: window.innerHeight,
      behavior: 'smooth'
    });
  }, []);
  const handleCardClick = useCallback((index) => {
    setCurrentCard(index);
  }, []);

  return (
    <section ref={heroRef} className="relative min-h-screen overflow-hidden">
      {/* Enhanced Background with Parallax */}
      <div className="absolute inset-0">
        {/* Main background image with parallax */}
        <div
          className="absolute inset-0 bg-cover bg-center transform transition-transform duration-100"
          style={{
               backgroundImage: "url('public/images/sekolah img.jpg')",
            transform: `translateY(${scrollY * 0.5}px) scale(${1 + Math.abs(mousePosition.x) * 0.02})`,
          }}
        />

        {/* Dynamic gradient overlay - Green theme for Adiwiyata */}
       
        {/* Animated particles overlay */}
        <div className="absolute inset-0 overflow-hidden">
          {particlesRef.current.map((particle) => (
            <div
              key={particle.id}
              className="absolute w-1 h-1 bg-white rounded-full animate-pulse"
              style={{
                left: `${particle.x}px`,
                top: `${particle.y}px`,
                opacity: particle.opacity,
                animation: `float ${3 + particle.id % 3}s ease-in-out infinite`,
                animationDelay: `${particle.id * 0.1}s`,
                transform: `translate(${mousePosition.x * 20}px, ${mousePosition.y * 10}px)`,
              }}
            />
          ))}
        </div>
      </div>

      {/* Enhanced Animated Waves */}
     <div className="absolute bottom-0 left-0 w-full h-40 overflow-hidden z-10">
  <svg
    className="absolute bottom-0 w-full h-full"
    viewBox="0 0 1200 120"
    preserveAspectRatio="none"
  >
    <path
      d="M0,60 Q300,0 600,60 T1200,60 L1200,120 L0,120 Z"
      fill="rgba(255, 255, 255, 0.08)" // putih transparan, bisa disesuaikan
      style={{ opacity: 1 }}
    />
  </svg>
</div>


      {/* Main Content with Enhanced Animations */}
      <div className="relative z-10 flex flex-col justify-center min-h-screen px-6 md:px-20 py-24">
        <div 
          className={`transition-all duration-1500 transform ${
            isVisible ? ' translate-y-0' : 'opacity-0 translate-y-16'
          }`}
          style={{
            transform: `translateY(${scrollY * 0.2}px) translateX(${mousePosition.x * 10}px)`,
          }}
        >
          {/* Enhanced Hero Badge */}
          <div className="inline-block mb-8">
            <div 
              className="group px-6 py-3 bg-white bg-opacity-10 backdrop-blur-xl rounded-full border border-white border-opacity-20 text-sm font-medium text-white text-opacity-90 hover:bg-white hover:bg-opacity-15 transition-all duration-500 cursor-pointer transform hover:scale-105"
              onMouseEnter={() => setIsHovering(true)}
              onMouseLeave={() => setIsHovering(false)}
            >
              <Waves className={`inline-block w-4 h-4 mr-2 transition-transform duration-300 ${isHovering ? 'rotate-12 scale-110' : ''}`} />
              Program Adiwiyata
              <Star className={`inline-block w-3 h-3 ml-2 transition-all duration-300 ${isHovering ? 'rotate-180 text-yellow-300' : ''}`} />
            </div>
          </div>

          {/* Enhanced Main Heading */}
          <TrueFocus>
          <h1 className="text-5xl md:text-8xl font-black leading-tight max-w-5xl mb-10 text-white">
            <span 
              className="block opacity-0 animate-fadeInUp"
              style={{ animationDelay: '0.2s', animationFillMode: 'both' }}
            >
              Sekolah
            </span>
            <span 
              className="block bg-gradient-to-r from-green-300 via-emerald-300 to-teal-200 bg-clip-text text-transparent opacity-0 animate-fadeInUp relative"
              style={{ animationDelay: '0.4s', animationFillMode: 'both' }}
            >
              Adiwiyata
              
            </span>
            
            <span 
              className="block text-3xl md:text-5xl font-medium text-white text-opacity-90 mt-6 opacity-0 animate-fadeInUp"
              style={{ animationDelay: '0.6s', animationFillMode: 'both' }}
            >
              Bersama Selamatkan Bumi
            </span>
          </h1>
          </TrueFocus>

          {/* Enhanced Description */}
          <p 
            className="text-xl md:text-2xl text-white text-opacity-85 max-w-3xl mb-14 leading-relaxed opacity-0 animate-fadeInUp"
            style={{ animationDelay: '0.8s', animationFillMode: 'both' }}
          >
            Bergabunglah dengan misi kami untuk menjaga lingkungan dan menginspirasi perubahan berkelanjutan 
            demi planet yang lebih sehat. Bersama, kita bisa membuat dampak positif.
          </p>

          {/* Enhanced Action Buttons */}
          <div 
            className="flex flex-col sm:flex-row gap-6 mb-20 opacity-0 animate-fadeInUp"
            style={{ animationDelay: '1s', animationFillMode: 'both' }}
          >

            <button className="group px-10 py-5 bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 hover:from-green-600 hover:via-emerald-600 hover:to-teal-600 transition-all duration-500 rounded-2xl font-bold text-white text-lg shadow-2xl hover:shadow-green-500 hover:shadow-opacity-40 transform hover:scale-105 hover:-translate-y-1 relative overflow-hidden">
              <span className="absolute inset-0 bg-gradient-to-r from-white to-transparent opacity-0 group-hover:opacity-20 transition-opacity duration-500 transform group-hover:translate-x-full" />
              <span className="flex items-center justify-center relative z-10">
                Misi Kami
                <ArrowRight className="ml-3 w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
              </span>
            </button>
            
            <button className="group px-10 py-5 border-2 border-white border-opacity-40 hover:bg-white hover:text-green-900 transition-all duration-500 rounded-2xl font-bold text-white text-lg backdrop-blur-sm transform hover:scale-105 hover:-translate-y-1 relative overflow-hidden">
              <span className="absolute inset-0 bg-white opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              <span className="flex items-center justify-center relative z-10">
                
              <ShinyText
                text="Tonton Video"
                speed={3}
                className="text-lg"
              />
              </span>
            </button>
          </div>

          {/* Mobile Cards Section - Only visible on mobile */}
          <div className="block md:hidden mb-12" data-aos="fade-left" data-aos-delay="100">
            <div className="space-y-4" data-aos="fade-up" data-aos-delay="200">
              <MobileCard
                icon={<Leaf className="w-5 h-5" />}
                title="Keberlanjutan"
                text="Memprioritaskan kesehatan jangka panjang lingkungan untuk generasi mendatang."
                isActive={currentCard === 0}
                onClick={() => handleCardClick(0)}
              />
              <MobileCard
                icon={<Users className="w-5 h-5" />}
                title="Kolaborasi"
                text="Bekerja sama dengan komunitas dan organisasi untuk mencapai tujuan konservasi."
                isActive={currentCard === 1}
                onClick={() => handleCardClick(1)}
              />
              <MobileCard
                icon={<Lightbulb className="w-5 h-5" />}
                title="Inovasi"
                text="Menggunakan teknologi dan solusi inovatif untuk kesehatan lingkungan."
                isActive={currentCard === 2}
                onClick={() => handleCardClick(2)}
              />
            </div>
          </div>

          {/* Enhanced Community Stats */}
          <div 
            className="flex flex-wrap items-center gap-8 opacity-0 animate-fadeInUp"
            style={{ animationDelay: '1.2s', animationFillMode: 'both' }}
          >
            <div className="flex items-center space-x-4">
              <div className="flex -space-x-2">
                {['S', 'M', 'K', 'N'].map((letter, index) => (
                  <div
                    key={letter}
                    className={`w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 border-3 border-white flex items-center justify-center text-white font-bold text-lg shadow-lg hover:scale-110 transition-transform duration-300 cursor-pointer`}
                    style={{ animationDelay: `${1.4 + index * 0.1}s` }}
                  >
                    {letter}
                  </div>
                ))}
                <div className="w-10 h-10 rounded-full bg-white bg-opacity-20 backdrop-blur-md border-3 border-white flex items-center justify-center text-white text-sm font-bold shadow-lg hover:scale-110 transition-transform duration-300 cursor-pointer">
                  46
                </div>
              </div>
              <div className="text-white text-opacity-90">
                <div className="flex items-center mb-1">
                  <Users className="w-5 h-5 mr-2 text-green-300" />
                  <span className="font-bold text-white text-xl">1,250+</span>
                </div>
                <span className="text-sm text-white text-opacity-70">Anggota Aktif</span>
              </div>
            </div>

            <div className="flex items-center space-x-3 text-white text-opacity-90">
              <Globe className="w-5 h-5 text-emerald-300" />
              <div>
                <div className="font-bold text-white text-xl">50+</div>
                <span className="text-sm text-white text-opacity-70">Sekolah</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Interactive Glass Cards - Hidden on mobile */}
      <div className="absolute inset-0 z-5 pointer-events-none hidden md:block " data-aos="fade-left" data-aos-delay="200">
        <GlassCard
          icon={<Leaf className="w-6 h-6" />}
          title="Keberlanjutan"
          text="Memprioritaskan kesehatan jangka panjang lingkungan untuk memastikan keberlanjutan bagi generasi mendatang melalui metode konservasi inovatif."
          position="top-[10%] right-[8%]"
          isActive={currentCard === 0}
          delay="0"
          onClick={() => handleCardClick(0)}
          mousePosition={mousePosition}
        />
        <GlassCard
          icon={<Users className="w-6 h-6" />}
          title="Kolaborasi"
          text="Bekerja sama dengan komunitas, pemerintah, dan organisasi di seluruh dunia untuk mencapai tujuan konservasi dan menciptakan dampak yang berkelanjutan."
          position="top-[35%] right-[5%]"
          isActive={currentCard === 1}
          delay="100"
          onClick={() => handleCardClick(1)}
          mousePosition={mousePosition}
        />
        <GlassCard
          icon={<Lightbulb className="w-6 h-6" />}
          title="Inovasi"
          text="Menggunakan teknologi mutakhir dan solusi inovatif yang mempromosikan kesehatan lingkungan, restorasi, dan keanekaragaman hayati."
          position="bottom-[17%] right-[8%]"
          isActive={currentCard === 2}
          delay="400"
          onClick={() => handleCardClick(2)}
          mousePosition={mousePosition}
        />
      </div>

      {/* Enhanced Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20">
        <button
          onClick={scrollToNext}
          className="group relative p-4 rounded-full bg-white bg-opacity-10 backdrop-blur-xl border border-white border-opacity-30 text-white hover:bg-white hover:bg-opacity-20 transition-all duration-500 transform hover:scale-110 animate-bounce hover:animate-none"
        >
          <ChevronDown className="w-6 h-6 group-hover:translate-y-1 transition-transform duration-300" />
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-green-400 to-emerald-500 opacity-0 group-hover:opacity-20 transition-opacity duration-500" />
        </button>
      </div>

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-10px);
          }
        }

        .animate-fadeInUp {
          animation: fadeInUp 1s ease-out;
        }
      `}</style>
    </section>
  );
}

function GlassCard({ icon, title, text, position, isActive, delay, onClick, mousePosition }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className={`absolute ${position} w-80 p-6 rounded-3xl backdrop-blur-xl border transition-all duration-1000 cursor-pointer pointer-events-auto transform ${
        isActive 
          ? 'bg-white bg-opacity-20 border-white border-opacity-40 shadow-2xl scale-105' 
          : 'bg-white bg-opacity-10 border-white border-opacity-25 shadow-lg hover:bg-white hover:bg-opacity-15 hover:scale-102'
      }`}
      style={{
        animationDelay: `${delay}ms`,
        transform: `
          scale(${isActive ? 1.05 : (isHovered ? 1.02 : 1)}) 
          translateX(${mousePosition.x * 5}px) 
          translateY(${mousePosition.y * 3}px)
        `,
      }}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-start space-x-4">
        <div className={`p-3 rounded-xl transition-all duration-500 ${
          isActive 
            ? ' text-white shadow-lg' 
            : ' bg-opacity-20 text-white text-opacity-80 hover:bg-opacity-30'
        }`}>
          {icon}
        </div>
        <div className="flex-1">
          <h4 className="font-bold text-xl mb-3 text-white">{title}</h4>
          <p className="text-white text-opacity-85 text-sm leading-relaxed">{text}</p>
        </div>
      </div>
      
      {/* Enhanced progress indicator */}
      {isActive && (
        <div className="absolute bottom-0 left-0 w-full h-1 bg-white bg-opacity-20 rounded-b-3xl overflow-hidden">
          <div className="h-full bg-gradient-to-r from-green-400 via-emerald-500 to-teal-400  relative">
            <div className="absolute inset-0 bg-white opacity-30" />
          </div>
        </div>
      )}

      {/* Hover glow effect */}
      {(isHovered || isActive) && (
        <div className="absolute -inset-1 bg-gradient-to-r from-green-400 to-emerald-500 rounded-3xl opacity-20 blur-sm " />
      )}
    </div>
  );
}

function MobileCard({ icon, title, text, isActive, onClick }) {
  return (
    <div
      className={`w-full p-4 rounded-2xl backdrop-blur-xl border transition-all duration-500 cursor-pointer ${
        isActive 
          ? 'bg-white bg-opacity-20 border-white border-opacity-40 shadow-xl scale-102' 
          : 'bg-white bg-opacity-10 border-white border-opacity-25 shadow-lg hover:bg-white hover:bg-opacity-15'
      }`}
      onClick={onClick}
    >
      <div className="flex items-center space-x-3">
        <div className={`p-2 rounded-lg transition-all duration-300 ${
          isActive 
            ? 'bg-gradient-to-br from-green-400 to-emerald-500 text-white' 
            : 'bg-white bg-opacity-20 text-white text-opacity-80'
        }`}>
          {icon}
        </div>
        <div className="flex-1">
          <h4 className="font-bold text-lg mb-1 text-white">{title}</h4>
          <p className="text-white text-opacity-80 text-sm leading-relaxed">{text}</p>
        </div>
      </div>
      
      {/* Progress indicator for mobile */}
      {isActive && (
        <div className="mt-3 w-full h-0.5 bg-white bg-opacity-20 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-green-400 to-emerald-500"/>
        </div>
      )}
      
    </div>
  );
}