import React, { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";

const ChatAi = () => {
  const [chatLog, setChatLog] = useState([
    {
      role: "assistant",
      content: "Halo! Saya adalah AI Adiwiyata. Saya siap membantu Anda dengan pertanyaan seputar lingkungan, program Adiwiyata, dan keberlanjutan. Ada yang ingin Anda tanyakan?",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showPersistentError, setShowPersistentError] = useState(false);
  const chatBodyRef = useRef(null);
  const abortControllerRef = useRef(null);

  // Floating Close Button yang SELALU ADA
  const FloatingCloseButton = () => {
    return createPortal(
      <div 
        className="fixed top-2 right-2 md:top-4 md:right-4 z-50 rounded-md"
        style={{ 
          zIndex: 2147483647,
          position: 'fixed'
        }}
      >
        <button 
          onClick={() => {
            if (window.confirm('Tutup Chat AI?')) {
              window.location.reload();
            }
          }}
          className="w-8 h-8 md:w-12 md:h-12 bg-white/95 hover:bg-red-50 text-gray-600 hover:text-red-500 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 shadow-lg shadow-gray-300/30 border border-gray-200/50 backdrop-blur-sm group"
          type="button"
          title="Tutup Chat AI"
        >
          <svg 
            width="16" 
            height="16" 
            viewBox="0 0 20 20" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg" 
            className="group-hover:rotate-90 transition-transform duration-300 md:w-5 md:h-5"
          >
            <path 
              d="M15 5L5 15M5 5L15 15" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>,
      document.body
    );
  };

  // Error Button Portal
  const ErrorButtonPortal = () => {
    if (!error && !showPersistentError) return null;
    
    return createPortal(
      <div 
        className="fixed top-2 right-12 md:top-4 md:right-20 z-50"
        style={{ 
          zIndex: 2147483647,
          position: 'fixed'
        }}
      >
        <button 
          onClick={() => {
            setError(null);
            setShowPersistentError(false);
          }}
          className="w-8 h-8 md:w-12 md:h-12 bg-red-50 hover:bg-red-100 text-red-500 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 shadow-lg shadow-red-200/30 border border-red-200 animate-pulse"
          type="button"
          title="Tutup Error"
        >
          <span className="text-red-500 font-bold text-sm md:text-lg">!</span>
        </button>
      </div>,
      document.body
    );
  };

  // Auto scroll to bottom
  useEffect(() => {
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTo({
        top: chatBodyRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [chatLog, isTyping]);

  // System prompt
   const systemPrompt = `Anda adalah AI Adiwiyata Assistant, asisten virtual yang ahli dalam bidang lingkungan hidup, program Adiwiyata, dan kebijakan Kementerian Lingkungan Hidup dan Kehutanan (KLHK) Indonesia.

IDENTITAS ANDA:
- Nama: AI Adiwiyata Assistant
- Spesialisasi: Program Adiwiyata, lingkungan hidup, dan kebijakan KLHK
- Bahasa: Indonesia (gunakan bahasa formal namun ramah)
- Karakter: Profesional, informatif, dan peduli lingkungan

PENGETAHUAN UTAMA:
1. Program Adiwiyata:
   - Sejarah dan tujuan program
   - Kriteria dan standar sekolah Adiwiyata
   - Proses sertifikasi dan pembinaan
   - Tingkatan: Sekolah Adiwiyata, Adiwiyata Mandiri, Adiwiyata Nasional
   - Peran serta masyarakat dalam program

2. Kementerian LHK:
   - Struktur organisasi dan tugas pokok
   - Program-program utama bidang lingkungan
   - Peraturan dan kebijakan lingkungan hidup
   - Sistem perizinan lingkungan
   - Program konservasi dan restorasi

3. Lingkungan Hidup:
   - Pengelolaan sampah dan daur ulang
   - Konservasi air dan energi
   - Pencegahan pencemaran lingkungan
   - Keanekaragaman hayati Indonesia
   - Perubahan iklim dan mitigasinya
   - Pembangunan berkelanjutan

BATASAN TOPIK:
- HANYA menjawab pertanyaan seputar lingkungan hidup, program Adiwiyata, dan KLHK
- TIDAK membahas topik di luar bidang lingkungan
- Jika ditanya hal di luar topik, arahkan kembali ke fokus lingkungan

GAYA KOMUNIKASI:
- Gunakan emoji yang relevan (🌱🌍♻️🏫📋)
- Berikan contoh konkret dan praktis
- Sertakan referensi peraturan jika diperlukan
- Tawarkan solusi yang dapat diterapkan
- Akhiri dengan pertanyaan untuk melanjutkan diskusi

Selalu prioritaskan informasi yang akurat dan terkini seputar lingkungan hidup dan program Adiwiyata.`;

  // API call to Groq
  const callGroqAPI = async (messages) => {
    try {
      const response = await fetch('/api/groq-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [
            { role: "system", content: systemPrompt },
            ...messages
          ],
          model: "llama-3.1-8b-instant",
          temperature: 0.7,
          max_tokens: 500,
        }),
        signal: abortControllerRef.current?.signal
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      return response.json();
    } catch (error) {
      if (error.name === 'AbortError') {
        throw error;
      }
      
      // Demo response
      const lastMessage = messages[messages.length - 1];
      const content = lastMessage.content.toLowerCase();
      
      let demoResponse = "";
      if (content.includes("adiwiyata") || content.includes("program")) {
        demoResponse = "🌱 Program Adiwiyata adalah program penghargaan yang diberikan kepada sekolah yang berhasil dalam upaya pelestarian lingkungan hidup...";
      } else if (content.includes("sampah") || content.includes("daur ulang")) {
        demoResponse = "♻️ Beberapa cara mengurangi sampah di sekolah:\n\n1. **Pisahkan sampah** - Sediakan tempat sampah terpisah...";
      } else {
        demoResponse = "🤔 Terima kasih atas pertanyaannya! Untuk demo ini, coba tanyakan tentang program Adiwiyata atau pengelolaan sampah...";
      }
      
      return {
        choices: [{
          message: {
            content: demoResponse
          }
        }]
      };
    }
  };

  // Send message function
  const sendMessage = useCallback(async () => {
    if (!input.trim() || isLoading) return;

    const userMsg = { 
      role: "user", 
      content: input.trim(),
      timestamp: new Date()
    };
    
    const newChatLog = [...chatLog, userMsg];
    setChatLog(newChatLog);
    setInput("");
    setIsLoading(true);
    setIsTyping(true);
    setError(null);

    abortControllerRef.current = new AbortController();

    try {
      const apiMessages = newChatLog
        .filter(msg => msg.role === "user" || msg.role === "assistant")
        .map(msg => ({
          role: msg.role,
          content: msg.content
        }));

      const response = await callGroqAPI(apiMessages);
      
      setIsTyping(false);
      
      const aiMsg = {
        role: "assistant",
        content: response.choices[0]?.message?.content || "Maaf, saya tidak dapat memproses permintaan Anda saat ini.",
        timestamp: new Date()
      };

      setChatLog([...newChatLog, aiMsg]);
      
    } catch (error) {
      setIsTyping(false);
      
      if (error.name === 'AbortError') {
        console.log('Request was aborted');
        return;
      }
      
      setError(error.message);
      
      const errorMsg = {
        role: "assistant",
        content: "🚫 Maaf, terjadi kesalahan saat memproses pesan Anda. Silakan coba lagi dalam beberapa saat.",
        timestamp: new Date(),
        isError: true
      };
      
      setChatLog([...newChatLog, errorMsg]);
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  }, [input, chatLog, isLoading]);

  const cancelRequest = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsLoading(false);
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (timestamp) => {
    return timestamp.toLocaleTimeString('id-ID', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const quickQuestions = [
    "Apa itu Program Adiwiyata?",
    "Bagaimana cara mengurangi sampah di sekolah?",
    "Tips menghemat energi listrik",
    "Manfaat menanam pohon untuk lingkungan",
    "Cara membuat kompos dari sampah organik",
    "Langkah-langkah konservasi air"
  ];

  const handleQuickQuestion = (question) => {
    setInput(question);
  };

  const clearChat = () => {
    setChatLog([
      {
        role: "assistant",
        content: "Halo! Saya adalah AI Adiwiyata. Saya siap membantu Anda dengan pertanyaan seputar lingkungan, program Adiwiyata, dan keberlanjutan. Ada yang ingin Anda tanyakan?",
        timestamp: new Date()
      }
    ]);
    setError(null);
  };

  return (
    <>
      <FloatingCloseButton />
      <ErrorButtonPortal />
      <div className="rounded-md">

      <div className="flex flex-col h-screen bg-[#f7f8f6] rounded-2xl overflow-hidden shadow-2xl border-0 relative max-w-full">
        
        {/* Subtle Background Pattern */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
          <div className="absolute top-0 left-0 w-full h-full" 
               style={{
                 backgroundImage: `radial-gradient(circle at 25% 25%, rgba(34, 197, 94, 0.1) 0%, transparent 50%),
                                   radial-gradient(circle at 75% 75%, rgba(16, 185, 129, 0.08) 0%, transparent 50%)`
               }}>
          </div>
        </div>

        {/* Floating Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className={`absolute w-1 h-1 md:w-2 md:h-2 rounded-full ${
                i % 3 === 0 ? 'bg-green-100' : i % 3 === 1 ? 'bg-emerald-100' : 'bg-teal-100'
              } animate-float opacity-40`}
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${6 + Math.random() * 4}s`
              }}
            />
          ))}
        </div>

        {/* Header */}
        <header className="relative z-10 bg-[#f7f8f6] backdrop-blur-sm p-3 md:p-6 border-b border-green-200/30 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 md:space-x-4 flex-1 min-w-0">
              <div className="relative flex-shrink-0">
                <div className="w-10 h-10 md:w-16 md:h-16 bg-gradient-to-br from-green-100 to-emerald-100 rounded-xl md:rounded-2xl flex items-center justify-center border border-green-200/50 shadow-sm group transition-all duration-500 hover:shadow-md hover:shadow-green-200/50">
                  <img 
                    src="https://cdn-icons-png.flaticon.com/512/628/628324.png" 
                    alt="Plant Icon" 
                    className="w-5 h-5 md:w-8 md:h-8 object-contain"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'block';
                    }}
                  />
                  <div className="text-lg md:text-3xl hidden">🌱</div>
                </div>
                <div className="absolute -top-0.5 -right-0.5 md:-top-1 md:-right-1 w-3 h-3 md:w-4 md:h-4 bg-green-400 rounded-full shadow-sm border-2 border-white animate-pulse-slow"></div>
              </div>
              
              <div className="flex-1 min-w-0">
                <h1 className="text-gray-800 font-bold text-sm md:text-2xl flex items-center truncate">
                  <span className="bg-gradient-to-r from-gray-800 to-green-700 bg-clip-text text-transparent truncate">
                    AI Adiwiyata Assistant
                  </span>
                  <div className="ml-2 md:ml-3 flex space-x-1 flex-shrink-0">
                    <div className="w-1 h-1 md:w-2 md:h-2 bg-green-400 rounded-full animate-bounce"></div>
                    <div className="w-1 h-1 md:w-2 md:h-2 bg-green-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                    <div className="w-1 h-1 md:w-2 md:h-2 bg-green-600 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  </div>
                </h1>
                <p className="text-green-600 text-xs md:text-base mt-0.5 md:mt-1 truncate">
                  {isTyping ? (
                    <span className="flex items-center">
                      <div className="w-3 h-3 md:w-4 md:h-4 border-2 border-green-400 border-t-transparent rounded-full animate-spin mr-2 flex-shrink-0"></div>
                      <span className="truncate">Sedang mengetik...</span>
                    </span>
                  ) : (
                    <span className="flex items-center">
                      <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-green-500 rounded-full mr-2 animate-pulse flex-shrink-0"></div>
                      <span className="truncate">Siap membantu Anda</span>
                    </span>
                  )}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-1 md:space-x-3 flex-shrink-0">
              {isLoading && (
                <button
                  onClick={cancelRequest}
                  className="bg-red-50 hover:bg-red-100 text-red-600 px-2 py-1.5 md:px-4 md:py-2 rounded-lg md:rounded-xl text-xs md:text-sm transition-all duration-200 border border-red-200 hover:border-red-300"
                >
                  <span className="flex items-center">
                    <svg width="12" height="12" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-1 md:mr-2 md:w-4 md:h-4">
                      <path d="M12 4L4 12M4 4L12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                    <span className="hidden md:inline">Batal</span>
                    <span className="md:hidden">×</span>
                  </span>
                </button>
              )}
              <button
                onClick={clearChat}
                className="bg-[#d7f266] hover:bg-white text-[#151514] px-2 py-1.5 md:px-4 md:py-2 rounded-lg md:rounded-xl text-xs md:text-sm transition-all duration-200"
              >
                <span className="hidden md:inline">Bersihkan</span>
                <span className="md:hidden">Clear</span>
              </button>
              <div className="bg-[#d7f266] px-2 py-1.5 md:px-4 md:py-2 rounded-lg md:rounded-xl border border-green-200">
                <span className="flex items-center text-[#151514] text-xs md:text-sm">
                  <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-green-500 rounded-full mr-1 md:mr-2 animate-pulse"></div>
                  <span className="hidden md:inline">Online</span>
                  <span className="md:hidden text-sm">●</span>
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Error Display */}
        {error && (
          <div className="relative z-10 p-3 md:p-4 bg-red-50 border-b border-red-200 animate-slide-down flex-shrink-0">
            <div className="flex items-center space-x-2 md:space-x-3 text-red-700">
              <div className="w-4 h-4 md:w-5 md:h-5 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-red-600 text-xs md:text-sm font-bold">!</span>
              </div>
              <span className="text-xs md:text-sm flex-1 min-w-0 truncate">Error: {error}</span>
              <button 
                onClick={() => setError(null)}
                className="text-red-500 hover:text-red-700 transition-colors text-lg md:text-xl flex-shrink-0"
              >
                ×
              </button>
            </div>
          </div>
        )}

        {/* Quick Questions */}
        {chatLog.length <= 1 && (
          <div className="relative z-10 p-3 md:p-6 bg-white/60 border-b border-green-200/30 animate-fade-in flex-shrink-0">
            <p className="text-green-700 text-xs md:text-base mb-3 md:mb-4 font-medium flex items-center">
              <img 
                src="https://cdn-icons-png.flaticon.com/512/595/595067.png" 
                alt="Lightbulb" 
                className="w-4 h-4 md:w-5 md:h-5 mr-2 flex-shrink-0"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'inline';
                }}
              />
              <span className="hidden">💡</span>
              <span className="truncate">Pertanyaan Populer:</span>
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-3">
              {quickQuestions.map((question, index) => (
                <button
                  key={index}
                  onClick={() => handleQuickQuestion(question)}
                  className="text-left p-3 md:p-4 bg-white/80 hover:bg-green-50 rounded-xl md:rounded-2xl text-xs md:text-sm text-gray-700 hover:text-green-700 transition-all duration-300 border border-green-200/50 hover:border-green-300 shadow-sm hover:shadow-md transform hover:scale-[1.02] hover:-translate-y-1"
                  style={{animationDelay: `${index * 0.1}s`}}
                >
                  <div className="flex items-start">
                    <img 
                      src="https://cdn-icons-png.flaticon.com/512/3585/3585896.png" 
                      alt="Question" 
                      className="w-4 h-4 md:w-5 md:h-5 mr-2 md:mr-3 flex-shrink-0 mt-0.5"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'inline';
                      }}
                    />
                    <span className="hidden text-green-500 mr-3 text-lg flex-shrink-0">❓</span>
                    <span className="leading-relaxed">{question}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Chat Body */}
        <main 
          ref={chatBodyRef}
          className="relative z-10 flex-1 overflow-y-auto p-3 md:p-6 pb-16 md:pb-24 space-y-3 md:space-y-6 scrollbar-thin scrollbar-thumb-green-300 scrollbar-track-transparent hover:scrollbar-thumb-green-400"
          style={{ 
            minHeight: 0,
            WebkitOverflowScrolling: 'touch'
          }}
        >
          {chatLog.map((msg, i) => (
            <div
              key={i}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} animate-message-in`}
              style={{animationDelay: `${i * 0.1}s`}}
            >
              <div className={`max-w-[85%] md:max-w-[80%] ${msg.role === "user" ? "order-2" : "order-1"}`}>
                <div
                  className={`p-3 md:p-5 rounded-xl md:rounded-3xl relative transition-all duration-300 hover:shadow-lg transform hover:scale-[1.01] ${
                    msg.role === "user"
                      ? "bg-gradient-to-br from-green-500 to-green-600 text-white ml-auto shadow-md shadow-green-200/50"
                      : msg.isError 
                        ? "bg-gradient-to-br from-red-50 to-red-100 text-red-700 border border-red-200 shadow-sm"
                        : "bg-white/90 text-gray-700 border border-green-200/50 shadow-sm backdrop-blur-sm"
                  }`}
                >
                  {msg.role === "assistant" && (
                    <div className="flex items-center mb-2 md:mb-3 animate-slide-in">
                      {msg.isError ? (
                        <div className="w-5 h-5 md:w-6 md:h-6 bg-red-100 rounded-full flex items-center justify-center mr-2 md:mr-3 flex-shrink-0">
                          <img 
                            src="https://cdn-icons-png.flaticon.com/512/564/564619.png" 
                            alt="Warning" 
                            className="w-3 h-3 md:w-4 md:h-4"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'inline';
                            }}
                          />
                          <span className="text-red-500 text-xs hidden">⚠️</span>
                        </div>
                      ) : (
                        <div className="w-5 h-5 md:w-6 md:h-6 bg-green-100 rounded-full flex items-center justify-center mr-2 md:mr-3 flex-shrink-0">
                          <img 
                            src="https://cdn-icons-png.flaticon.com/512/4712/4712027.png" 
                            alt="Robot" 
                            className="w-3 h-3 md:w-4 md:h-4"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'inline';
                            }}
                          />
                          <span className="text-green-600 text-xs hidden">🤖</span>
                        </div>
                      )}
                      <span className="text-xs font-medium text-green-600 truncate">
                        {msg.isError ? "Error" : "AI Assistant"}
                      </span>
                    </div>
                  )}
                  
                  <div className="prose prose-sm max-w-none">
                    <p className="text-xs md:text-base leading-relaxed whitespace-pre-wrap mb-0">
                      {msg.content}
                    </p>
                  </div>
                  
                  <div className={`text-xs mt-2 md:mt-3 opacity-70 flex items-center justify-between ${
                    msg.role === "user" ? "text-green-100" : "text-gray-500"
                  }`}>
                    <span className="flex items-center truncate">
                      <svg width="12" height="12" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-1 flex-shrink-0 md:w-3 md:h-3">
                        <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1"/>
                        <path d="M7 4v3l2 2" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/>
                      </svg>
                      <span className="truncate">{formatTime(msg.timestamp)}</span>
                    </span>
                    {msg.role === "assistant" && !msg.isError && (
                      <span className="text-xs bg-[#d7f266] text-[#151514] px-2 py-1 rounded-full hidden md:inline-block flex-shrink-0">
                        Groq AI
                      </span>
                    )}
                  </div>

                  {/* Message tail */}
                  <div className={`absolute top-4 md:top-6 w-3 h-3 md:w-4 md:h-4 transform rotate-45 ${
                    msg.role === "user" 
                      ? "bg-[#d7f266] -right-1.5 md:-right-2" 
                      : msg.isError
                        ? "bg-red-50 -left-1.5 md:-left-2 border-l border-b border-red-200"
                        : "bg-white -left-1.5 md:-left-2 border-l border-b border-green-200/50"
                  }`}></div>
                </div>
              </div>
            </div>
          ))}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex justify-start animate-fade-in">
              <div className="bg-white/90 p-3 md:p-5 rounded-xl md:rounded-3xl border border-green-200/50 shadow-sm backdrop-blur-sm">
                <div className="flex items-center space-x-3 md:space-x-4">
                  <div className="w-5 h-5 md:w-6 md:h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <div className="w-2 h-2 md:w-3 md:h-3 border-2 border-green-500 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                  <div className="flex space-x-1 md:space-x-2">
                    <div className="w-2 h-2 md:w-3 md:h-3 bg-green-400 rounded-full animate-bounce" style={{animationDelay: '0s'}}></div>
                    <div className="w-2 h-2 md:w-3 md:h-3 bg-green-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                    <div className="w-2 h-2 md:w-3 md:h-3 bg-green-600 rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></div>
                  </div>
                  <span className="text-green-600 text-xs md:text-sm truncate">AI sedang berpikir...</span>
                </div>
              </div>
            </div>
          )}
        </main>
        
        {/* Footer with input and send button */}
        <footer className="relative z-20 p-3 md:p-6 bg-white/80 backdrop-blur-sm border-t border-green-200/30 flex-shrink-0">
          <div className="flex space-x-2 md:space-x-4">
            <div className="flex-1 relative min-w-0">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ketik pertanyaan tentang lingkungan dan program Adiwiyata..."
                className="w-full p-3 md:p-4 bg-white border border-green-200 rounded-xl md:rounded-2xl text-gray-700 placeholder-gray-400 focus:outline-none focus:border-green-400 focus:ring-2 focus:ring-green-200 transition-all duration-300 resize-none shadow-sm hover:shadow-md text-xs md:text-base"
                rows="1"
                disabled={isLoading}
                maxLength={1000}
                style={{
                  minHeight: '44px',
                  maxHeight: '120px',
                  overflow: 'hidden'
                }}
              />
              
              {/* Character counter */}
              <div className="absolute bottom-1 right-3 text-xs text-gray-400">
                {input.length}/1000
              </div>
            </div>
            
            {/* Send button */}
            <button
              onClick={sendMessage}
              disabled={isLoading || !input.trim()}
              className="px-4 py-3 md:px-6 md:py-4 bg-[#d7f266] hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-xl md:rounded-2xl transition-all duration-300 shadow-sm hover:shadow-md flex items-center justify-center min-w-[44px]"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <svg 
                  className="w-4 h-4 md:w-5 md:h-5" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" 
                  />
                </svg>
              )}
            </button>
          </div>
          
          {/* Optional: Typing indicator or status */}
          {isLoading && (
            <div className="mt-2 flex items-center space-x-2 text-xs text-gray-500">
              <div className="flex space-x-1">
                <div className="w-1 h-1 bg-green-400 rounded-full animate-bounce" style={{animationDelay: '0ms'}} />
                <div className="w-1 h-1 bg-green-400 rounded-full animate-bounce" style={{animationDelay: '150ms'}} />
                <div className="w-1 h-1 bg-green-400 rounded-full animate-bounce" style={{animationDelay: '300ms'}} />
              </div>
              <span>Mengetik...</span>
            </div>
          )}
        </footer>

        {/* Footer info */}
        <div className="relative z-10 p-3 md:p-6 bg-white/60 border-t border-green-200/30 flex-shrink-0">
          <div className="flex flex-wrap items-center justify-center gap-2 md:gap-3 text-xs text-gray-500">
            <span className="flex items-center space-x-1 md:space-x-2 bg-white/60 px-2 py-1 md:px-3 md:py-1 rounded-lg border border-green-200/50">
              <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-green-500 rounded-full animate-pulse flex-shrink-0"></div>
              <span className="truncate">Powered by Groq AI</span>
            </span>
            <span className="opacity-60 hidden md:inline">•</span>
            <span className="flex items-center space-x-1 md:space-x-2 bg-white/60 px-2 py-1 md:px-3 md:py-1 rounded-lg border border-green-200/50">
              <img 
                src="https://cdn-icons-png.flaticon.com/512/628/628324.png" 
                alt="Environment" 
                className="w-3 h-3 md:w-4 md:h-4 flex-shrink-0"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'inline';
                }}
              />
              <span className="hidden">🌱</span>
              <span className="truncate">Fokus: Lingkungan & Adiwiyata</span>
            </span>
            <span className="opacity-60 hidden md:inline">•</span>
            <span className="flex items-center space-x-1 md:space-x-2 bg-white/60 px-2 py-1 md:px-3 md:py-1 rounded-lg border border-green-200/50">
              <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-blue-500 rounded-full animate-pulse flex-shrink-0"></div>
              <span className="truncate">Llama 3.1</span>
            </span>
          </div>
        </div>
</div>
        <style jsx>{`
          @keyframes float {
            0%, 100% { 
              transform: translateY(0px) translateX(0px) rotate(0deg); 
            }
            25% { 
              transform: translateY(-10px) translateX(5px) rotate(90deg); 
            }
            50% { 
              transform: translateY(-5px) translateX(-5px) rotate(180deg); 
            }
            75% { 
              transform: translateY(-15px) translateX(10px) rotate(270deg); 
            }
          }
          
          @keyframes fade-in {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }
          
          @keyframes message-in {
            from { 
              opacity: 0; 
              transform: translateY(20px) scale(0.95); 
            }
            to { 
              opacity: 1; 
              transform: translateY(0) scale(1); 
            }
          }
          
          @keyframes slide-down {
            from { 
              opacity: 0; 
              transform: translateY(-20px); 
            }
            to { 
              opacity: 1; 
              transform: translateY(0); 
            }
          }
          
          @keyframes slide-in {
            from { 
              opacity: 0; 
              transform: translateX(-10px); 
            }
            to { 
              opacity: 1; 
              transform: translateX(0); 
            }
          }

          @keyframes pulse-slow {
            0%, 100% { opacity: 1; transform: scale(1); }
            50% { opacity: 0.6; transform: scale(1.1); }
          }

          .animate-float {
            animation: float infinite ease-in-out;
          }

          .animate-fade-in {
            animation: fade-in 0.4s ease-out forwards;
          }

          .animate-message-in {
            animation: message-in 0.4s ease-out forwards;
          }

          .animate-slide-down {
            animation: slide-down 0.3s ease-out forwards;
          }

          .animate-slide-in {
            animation: slide-in 0.3s ease-out forwards;
          }

          .animate-pulse-slow {
            animation: pulse-slow 2s ease-in-out infinite;
          }

          /* Mobile optimizations */
          @media (max-width: 768px) {
            .scrollbar-thin {
              scrollbar-width: none;
              -ms-overflow-style: none;
            }
            
            .scrollbar-thin::-webkit-scrollbar {
              display: none;
            }
          }

          /* Ensure text doesn't overflow */
          .truncate {
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }

          /* Better touch targets for mobile */
          @media (max-width: 768px) {
            button {
              min-height: 44px;
            }
          }
        `}</style>
      </div>
    </>
  );
};

export default ChatAi;