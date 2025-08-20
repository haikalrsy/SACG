import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

// GLTFLoader class definition since it's not available in the CDN


const ContactSection = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState('');
  const [modelLoaded, setModelLoaded] = useState(false);
  const [modelSource, setModelSource] = useState('');
  const [loadingProgress, setLoadingProgress] = useState(0);
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const animationIdRef = useRef(null);

  // 3D Scene Setup with Enhanced Earth Model
  useEffect(() => {
    if (!mountRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    
    // Responsive canvas sizing
    const updateSize = () => {
      const container = mountRef.current;
      if (!container) return;
      
      const containerWidth = container.clientWidth;
      const containerHeight = container.clientHeight;
      
      camera.aspect = containerWidth / containerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(containerWidth, containerHeight);
    };

    updateSize();
    renderer.setClearColor(0x000000, 0);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    mountRef.current.appendChild(renderer.domElement);

    // Lighting setup
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 10, 5);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    scene.add(directionalLight);

    const pointLight = new THREE.PointLight(0xffffff, 0.3);
    pointLight.position.set(-5, 0, 5);
    scene.add(pointLight);

    // Enhanced Earth model
    const createEarthModel = () => {
      console.log('Creating enhanced 3D Earth model...');
      
      const group = new THREE.Group();
      
      // Main Earth sphere with higher detail
      const earthGeometry = new THREE.SphereGeometry(1.5, 64, 64);
      const earthMaterial = new THREE.MeshPhongMaterial({
        color: 0x1E40AF,
        shininess: 80,
        transparent: false
      });
      
      const earthMesh = new THREE.Mesh(earthGeometry, earthMaterial);
      earthMesh.castShadow = true;
      earthMesh.receiveShadow = true;
      group.add(earthMesh);

      // Continent data with realistic positioning
      const continentData = [
        { phi: 0.5, theta: 1.0, scale: [1.0, 0.6, 0.1], color: 0x22C55E },      // Africa
        { phi: -0.8, theta: 1.2, scale: [0.8, 0.4, 0.1], color: 0x16A34A },     // Europe
        { phi: 1.2, theta: 0.8, scale: [1.2, 0.8, 0.1], color: 0x15803D },      // Asia
        { phi: -1.5, theta: 1.5, scale: [0.6, 0.8, 0.1], color: 0x22C55E },     // North America
        { phi: -1.0, theta: 2.0, scale: [0.7, 0.6, 0.1], color: 0x16A34A },     // South America
        { phi: 2.5, theta: 2.5, scale: [0.5, 0.4, 0.1], color: 0x15803D },      // Australia
        { phi: 0.0, theta: 2.8, scale: [0.3, 0.2, 0.05], color: 0x22C55E },     // Madagascar
      ];

      // Add continents
      continentData.forEach((continent) => {
        const continentGeometry = new THREE.SphereGeometry(1.51, 20, 20);
        const continentMaterial = new THREE.MeshPhongMaterial({
          color: continent.color,
          transparent: true,
          opacity: 0.85
        });
        const continentMesh = new THREE.Mesh(continentGeometry, continentMaterial);
        
        continentMesh.position.setFromSphericalCoords(1.51, continent.theta, continent.phi);
        continentMesh.scale.set(continent.scale[0], continent.scale[1], continent.scale[2]);
        
        group.add(continentMesh);
      });

      // Polar ice caps
      const iceMaterial = new THREE.MeshPhongMaterial({
        color: 0xF8FAFC,
        transparent: true,
        opacity: 0.95,
        shininess: 120
      });
      
      // North pole
      const northIce = new THREE.Mesh(
        new THREE.SphereGeometry(1.52, 20, 12, 0, Math.PI * 2, 0, Math.PI * 0.25),
        iceMaterial
      );
      group.add(northIce);
      
      // South pole
      const southIce = new THREE.Mesh(
        new THREE.SphereGeometry(1.52, 20, 12, 0, Math.PI * 2, Math.PI * 0.75, Math.PI * 0.25),
        iceMaterial
      );
      group.add(southIce);
      
      // Cloud layer
      const cloudGeometry = new THREE.SphereGeometry(1.65, 32, 32);
      const cloudMaterial = new THREE.MeshPhongMaterial({
        color: 0xFFFFFF,
        transparent: true,
        opacity: 0.15,
        side: THREE.DoubleSide
      });
      const clouds = new THREE.Mesh(cloudGeometry, cloudMaterial);
      group.add(clouds);
      
      // Atmosphere glow
      const atmosphereGeometry = new THREE.SphereGeometry(1.8, 32, 32);
      const atmosphereMaterial = new THREE.MeshPhongMaterial({
        color: 0x60A5FA,
        transparent: true,
        opacity: 0.08,
        side: THREE.BackSide
      });
      const atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
      group.add(atmosphere);
      
      scene.add(group);
      setModelLoaded(true);
      setModelSource('Enhanced Interactive Earth Model');
      setLoadingProgress(100);
      
      if (!sceneRef.current) {
        sceneRef.current = {};
      }
      sceneRef.current.model = group;
      sceneRef.current.clouds = clouds;
      
      startAnimation();
    };

    // Load GLB Model function
    const loadGLBModel = () => {
      console.log('Attempting to load GLB model...');
      setLoadingProgress(20);
      
      const loader = new GLTFLoader();
      
      // Try to load your GLB file
      // Note: In a real React app, you would put your GLB file in the public folder
      // and reference it like '/models/your-model.glb'
      loader.load(
        '/models/earth(2).glb', // Path to your GLB file
        (gltf) => {
          console.log('GLB model loaded successfully!');
          
          // Add the loaded model to the scene
          const model = gltf.scene;
          
          // Scale the model if needed
          model.scale.setScalar(1.5);
          
          // Position the model
          model.position.set(0, 0, 0);
          
          // Enable shadows for the model
          model.traverse((child) => {
            if (child.isMesh) {
              child.castShadow = true;
              child.receiveShadow = true;
              
              // Enhance materials if needed
              if (child.material) {
                child.material.needsUpdate = true;
              }
            }
          });
          
          scene.add(model);
          
          
          
          // Store reference for animation
          if (!sceneRef.current) {
            sceneRef.current = {};
          }
          sceneRef.current.model = model;
          
          startAnimation();
        },
        (progress) => {
          // Loading progress callback
          const percentComplete = (progress.loaded / progress.total) * 100;
          setLoadingProgress(Math.min(percentComplete, 90));
          console.log('Loading progress:', percentComplete);
        },
        (error) => {
          // Error callback - fallback to procedural model
          console.warn('Failed to load GLB model, using procedural model instead:', error);
          console.log('Creating fallback procedural Earth model...');
          
          // Create procedural model as fallback
          createEarthModel();
        }
      );
    };

    // Animation function
    const startAnimation = () => {
      const animate = () => {
        animationIdRef.current = requestAnimationFrame(animate);
        
        // Rotate model if it exists
        if (sceneRef.current?.model) {
          sceneRef.current.model.rotation.y += 0.005;
          sceneRef.current.model.rotation.x = Math.sin(Date.now() * 0.0005) * 0.1;
          sceneRef.current.model.position.y = Math.sin(Date.now() * 0.001) * 0.05;
          
          // Rotate clouds separately if they exist
          if (sceneRef.current.clouds) {
            sceneRef.current.clouds.rotation.y += 0.003;
            sceneRef.current.clouds.rotation.z = Math.sin(Date.now() * 0.0008) * 0.05;
          }
        }
        
        renderer.render(scene, camera);
      };
      
      animate();
    };

    // Set camera position
    camera.position.set(0, 0, 10);
    
    // Initialize sceneRef
    sceneRef.current = {
      scene,
      renderer,
      camera
    };

    // Start GLB model loading
    loadGLBModel();

    // Handle window resize for responsiveness
    const handleResize = () => {
      updateSize();
    };
    window.addEventListener('resize', handleResize);

    return () => {
      // Cleanup
      window.removeEventListener('resize', handleResize);
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
      if (mountRef.current && renderer.domElement) {
        try {
          mountRef.current.removeChild(renderer.domElement);
        } catch (e) {
          console.log('Renderer cleanup error:', e);
        }
      }
      
      // Dispose of Three.js resources
      scene.traverse((object) => {
        if (object.geometry) {
          object.geometry.dispose();
        }
        if (object.material) {
          if (Array.isArray(object.material)) {
            object.material.forEach(material => material.dispose());
          } else {
            object.material.dispose();
          }
        }
      });
      
      renderer.dispose();
    };
  }, []);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      setSubmitStatus('❌ Nama harus diisi!');
      return false;
    }
    if (!formData.email.trim()) {
      setSubmitStatus('❌ Email harus diisi!');
      return false;
    }
    if (!formData.email.includes('@')) {
      setSubmitStatus('❌ Format email tidak valid!');
      return false;
    }
    if (!formData.message.trim()) {
      setSubmitStatus('❌ Pesan harus diisi!');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    setSubmitStatus('📤 Mengirim pesan...');

    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      console.log('Form submitted:', formData);
      setSubmitStatus('✅ Pesan berhasil dikirim! Terima kasih!');
      setFormData({ name: '', email: '', message: '' });
      setTimeout(() => setSubmitStatus(''), 5000);
    } catch (error) {
      console.error('Error submitting form:', error);
      setSubmitStatus('❌ Gagal mengirim pesan. Silakan coba lagi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="bg-[#F2F8FC] min-h-screen py-4 sm:py-8 lg:py-16 px-2 sm:px-4" id='contact'>
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8 lg:mb-16">
          <p className="text-slate-600 text-xs sm:text-sm font-semibold tracking-widest uppercase mb-2 sm:mb-4">
            GET IN TOUCH
          </p>
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold bg-gradient-to-r from-slate-800 via-blue-600 to-purple-600 bg-clip-text text-transparent mb-3 sm:mb-4 lg:mb-6 px-2">
            Contact.
          </h2>
          <p className="text-slate-600 text-sm sm:text-base lg:text-lg max-w-2xl mx-auto leading-relaxed px-4">
            Mari terhubung dan wujudkan ide-ide luar biasa bersama. Kami siap mendengar dan membantu Anda.
          </p>
        </div>

        {/* Main Content Grid - Responsive */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-12 mb-6 sm:mb-8 lg:mb-16">
          {/* Contact Form */}
          <div className="order-2 lg:order-1">
            <div className="bg-white rounded-xl sm:rounded-2xl lg:rounded-3xl p-3 sm:p-4 lg:p-8 shadow-lg">
              <div className="space-y-3 sm:space-y-4 lg:space-y-8">
                <div className="space-y-1 sm:space-y-2">
                  <div className="text-slate-700 font-semibold text-xs sm:text-sm tracking-wide">
                    Your Name
                  </div>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="What's your name?"
                    className="w-full p-2 sm:p-3 lg:p-4 bg-gray-50 border border-gray-200 rounded-lg sm:rounded-xl lg:rounded-2xl placeholder-slate-500 text-slate-800 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-300"
                    disabled={isSubmitting}
                  />
                </div>

                <div className="space-y-1 sm:space-y-2">
                  <div className="text-slate-700 font-semibold text-xs sm:text-sm tracking-wide">
                    Your Email
                  </div>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="What's your email?"
                    className="w-full p-2 sm:p-3 lg:p-4 bg-gray-50 border border-gray-200 rounded-lg sm:rounded-xl lg:rounded-2xl placeholder-slate-500 text-slate-800 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-300"
                    disabled={isSubmitting}
                  />
                </div>

                <div className="space-y-1 sm:space-y-2">
                  <div className="text-slate-700 font-semibold text-xs sm:text-sm tracking-wide">
                    Your Message
                  </div>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    placeholder="What do you want to say?"
                    rows="3"
                    className="w-full p-2 sm:p-3 lg:p-4 bg-gray-50 border border-gray-200 rounded-lg sm:rounded-xl lg:rounded-2xl placeholder-slate-500 text-slate-800 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-300 resize-none sm:rows-4 lg:rows-6"
                    disabled={isSubmitting}
                  ></textarea>
                </div>

                {/* Submit Status */}
                {submitStatus && (
                  <div className={`p-2 sm:p-3 lg:p-4 rounded-lg sm:rounded-xl text-center text-xs sm:text-sm font-medium ${
                    submitStatus.includes('✅') 
                      ? 'bg-green-100 text-green-700 border border-green-200' 
                      : submitStatus.includes('❌') 
                      ? 'bg-red-100 text-red-700 border border-red-200'
                      : 'bg-blue-100 text-blue-700 border border-blue-200'
                  }`}>
                    {submitStatus}
                  </div>
                )}

                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className={`w-full font-bold py-2 sm:py-3 lg:py-4 px-4 sm:px-6 lg:px-8 rounded-lg sm:rounded-xl lg:rounded-2xl text-black text-sm sm:text-base transform transition-all duration-300 shadow-lg hover:shadow-xl ${
                    isSubmitting
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-white hover:from-blue-700 hover:via-purple-700 hover:to-indigo-700 hover:scale-[1.02]'
                  }`}
                >
                  {isSubmitting ? '🔄 Mengirim...' : 'Send Message'}
                </button>
              </div>
            </div>
          </div>

          {/* 3D Model Display - Fully Responsive */}
          <div className="flex justify-center items-center order-1 lg:order-2">
            <div className="relative w-full max-w-sm sm:max-w-md lg:max-w-none">
              <div 
                ref={mountRef} 
                className="relative bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl sm:rounded-2xl lg:rounded-3xl p-2 sm:p-3 lg:p-4 shadow-lg aspect-square w-full h-48 xs:h-56 sm:h-64 md:h-72 lg:h-80 xl:h-96 border border-gray-200"
              />
              
              {/* Loading indicator */}
              
              
              {/* Model info - Responsive */}
              
            </div>
          </div>
        </div>

        {/* Map Section - Responsive */}
        <div className="bg-white rounded-xl sm:rounded-2xl lg:rounded-3xl p-3 sm:p-4 lg:p-8 shadow-lg">
          <div className="text-center mb-4 sm:mb-6 lg:mb-8">
            <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-800 mb-2 sm:mb-4">📍 Lokasi Sekolah</h3>
            <p className="text-slate-600 text-xs sm:text-sm lg:text-lg">Temukan kami di lokasi yang strategis dan mudah dijangkau</p>
          </div>

          {/* Google Maps Iframe - Responsive */}
          <div className="relative h-48 sm:h-64 lg:h-80 xl:h-96 rounded-lg sm:rounded-xl lg:rounded-2xl overflow-hidden shadow-lg border border-gray-200">
           <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3966.3530609770132!2d106.88128687453107!3d-6.217085360892561!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e69f36a76939ce9%3A0x1dd69348f251fa2a!2sSMK%20Negeri%2046%20Jakarta!5e0!3m2!1sid!2sid!4v1755672888233!5m2!1sid!2sid" 
           width="1500"  height="450" style={{ border: 0 }} allowFullScreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>
            
            <div className="absolute top-2 sm:top-3 lg:top-4 left-2 sm:left-3 lg:left-4 bg-white/95 backdrop-blur-sm rounded-lg p-2 sm:p-3 lg:p-4 shadow-lg border border-gray-200 max-w-xs">
              <h4 className="font-bold text-slate-800 mb-1 sm:mb-2 flex items-center text-xs sm:text-sm lg:text-base">
                🏫 <span className="ml-1 sm:ml-2">SMK Negeri 46 Jakarta</span>
              </h4>
              <p className="text-xs sm:text-sm text-slate-600 mb-1 flex items-center">
                📍 <span className="ml-1 sm:ml-2">Jl. Budi Kemuliaan I No.2</span>
              </p>
              <p className="text-xs sm:text-sm text-blue-600 font-semibold flex items-center">
                📞 <span className="ml-1 sm:ml-2">(021) 3441-187</span>
              </p>
            </div>
          </div>

          {/* Contact Info Grid - Responsive */}
         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6 mt-4 sm:mt-6 lg:mt-8">
  {/* Telepon */}
  <div className="bg-gray-50 border border-gray-200 rounded-lg sm:rounded-xl lg:rounded-2xl p-3 sm:p-4 lg:p-6 text-center hover:bg-gray-100 transition-all duration-300 hover:shadow-md">
    <img
      src="https://cdn3d.iconscout.com/3d/premium/thumb/handphone-11060375-8893498.png"
      alt="Telepon"
      className="mx-auto w-16 sm:w-20 lg:w-24 h-auto object-contain mb-2 sm:mb-3"
    />
    <h4 className="font-bold text-slate-800 mb-1 sm:mb-2 text-sm sm:text-base lg:text-lg">Telepon</h4>
    <p className="text-slate-600 text-xs sm:text-sm lg:text-base">(021) 819-5127</p>
  </div>

  {/* Email */}
  <div className="bg-gray-50 border border-gray-200 rounded-lg sm:rounded-xl lg:rounded-2xl p-3 sm:p-4 lg:p-6 text-center hover:bg-gray-100 transition-all duration-300 hover:shadow-md">
    <img
      src="https://static.vecteezy.com/system/resources/previews/012/627/941/non_2x/3d-open-mail-icon-free-png.png"
      alt="Email"
      className="mx-auto w-16 sm:w-20 lg:w-24 h-auto object-contain mb-2 sm:mb-3"
    />
    <h4 className="font-bold text-slate-800 mb-1 sm:mb-2 text-sm sm:text-base lg:text-lg">Email</h4>
    <p className="text-slate-600 text-xs sm:text-sm lg:text-base">info@sekolah.edu</p>
  </div>

  {/* Jam Operasional */}
  <div className="bg-gray-50 border border-gray-200 rounded-lg sm:rounded-xl lg:rounded-2xl p-3 sm:p-4 lg:p-6 text-center hover:bg-gray-100 transition-all duration-300 hover:shadow-md sm:col-span-2 lg:col-span-1">
    <img
      src="https://static.vecteezy.com/system/resources/previews/028/241/710/original/clock-3d-icon-illustration-free-png.png"
      alt="Jam Operasional"
      className="mx-auto w-16 sm:w-20 lg:w-24 h-auto object-contain mb-2 sm:mb-3"
    />
    <h4 className="font-bold text-slate-800 mb-1 sm:mb-2 text-sm sm:text-base lg:text-lg">Jam Operasional</h4>
    <p className="text-slate-600 text-xs sm:text-sm lg:text-base">07:00 - 16:00</p>
  </div>
</div>

        </div>

        {/* Instructions for using custom GLB */}
        
      </div>
    </section>
  );
};

export default ContactSection;