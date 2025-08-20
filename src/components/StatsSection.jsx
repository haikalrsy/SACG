'use client'
import { motion, useInView } from 'framer-motion'
import { useEffect, useState, useRef } from 'react'


const stats = [
  {
    value: 100,
    suffix: '%',
    title: 'Partisipasi Siswa',
    subtitle: 'Dalam kegiatan kebersihan & lingkungan'
  },
  {
    value: 12,
    suffix: '',
    title: 'Program Adiwiyata',
    subtitle: 'Diikuti seluruh siswa aktif'
  },
  {
    value: 20,
    suffix: '+',
    title: 'Kegiatan Lingkungan',
    subtitle: 'Dilaksanakan setiap semester'
  }
]

export default function AdiwiyataStats() {
  const [counts, setCounts] = useState(stats.map(() => 0))
  const [animate, setAnimate] = useState(false)
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-10%" })



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


  useEffect(() => {
    if (isInView) {
      setAnimate(true)
      const intervals = stats.map((stat, i) => {
        return setInterval(() => {
          setCounts((prev) => {
            const updated = [...prev]
            if (updated[i] < stat.value) {
              const increment = stat.value > 50 ? 2 : 1
              updated[i] = Math.min(updated[i] + increment, stat.value)
            }
            return updated
          })
        }, 50)
      })

      return () => intervals.forEach(clearInterval)
    }
  }, [isInView])

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.1
      }
    }
  }

  const cardVariants = {
    hidden: { 
      opacity: 0, 
      y: 60,
      scale: 0.9
    },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: {
        duration: 0.8,
        ease: [0.25, 0.46, 0.45, 0.94]
      }
    }
  }

  const numberVariants = {
    hidden: { 
      scale: 0.3,
      opacity: 0,
      rotateX: -90
    },
    visible: { 
      scale: 1,
      opacity: 1,
      rotateX: 0,
      transition: {
        duration: 1.2,
        ease: [0.34, 1.56, 0.64, 1],
        delay: 0.3
      }
    }
  }

  const titleVariants = {
    hidden: { 
      opacity: 0,
      x: -30
    },
    visible: { 
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.6,
        delay: 0.8
      }
    }
  }

  const subtitleVariants = {
    hidden: { 
      opacity: 0,
      x: -20
    },
    visible: { 
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.5,
        delay: 1
      }
    }
  }

  const glowVariants = {
    hidden: { 
      scale: 0,
      opacity: 0
    },
    visible: { 
      scale: 1,
      opacity: 1,
      transition: {
        duration: 1.5,
        delay: 0.5,
        ease: "easeOut"
      }
    }
  }

  return (
    <section className="bg-[#F8F7F4] py-20 px-4 overflow-hidden">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          <motion.h1 
            className="text-6xl md:text-7xl font-bold mb-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ 
              duration: 1.2,
              delay: 0.3,
              ease: "easeOut"
            }}
          >
            <motion.span 
              className="text-gray-800"
              initial={{ x: -100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.5 }}
            >
              Sekolah Hijau
            </motion.span> <br />
            <motion.span 
              className="bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent"
              initial={{ x: 100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.7 }}
            >
              Masa Depan Cerah.
            </motion.span>
          </motion.h1>
          <motion.p 
            className="text-gray-700 text-xl font-diamond"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1 }}
          >
            Komitmen sekolah untuk lingkungan berkelanjutan melalui program Adiwiyata
          </motion.p>
        </motion.div>

        {/* Cards */}
        <motion.div 
          ref={ref}
          className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-5xl mx-auto font-diamond"
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
        >
          {/* Big Card */}
          <motion.div
            variants={cardVariants}
            className="lg:row-span-2"
            whileHover={{ 
              scale: 1.05,
              rotateY: 5,
              transition: { duration: 0.3 }
            }}
          >
            <div className="bg-[#0f1f0f] border border-green-300 rounded-3xl p-8 flex flex-col justify-between min-h-[400px] relative overflow-hidden">
              <motion.div 
                className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-emerald-500/5"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 2, delay: 0.5 }}
              />
              
              <div className="flex-1 flex flex-col justify-center relative z-10">
                <div className="flex items-baseline mb-4">
                  <motion.span
                    className="text-8xl md:text-9xl font-bold bg-gradient-to-r from-green-100 to-emerald-400 bg-clip-text text-transparent font-diamond"
                    variants={numberVariants}
                  >
                    {counts[0]}
                  </motion.span>
                  <motion.span 
                    className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-green-100 to-emerald-400 bg-clip-text text-transparent"
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8, delay: 1.2 }}
                  >
                    {stats[0].suffix}
                  </motion.span>
                </div>
                <motion.h3 
                  className="text-2xl md:text-3xl font-bold text-white mb-2"
                  variants={titleVariants}
                >
                  {stats[0].title}
                </motion.h3>
                <motion.p 
                  className="text-gray-400 text-lg"
                  variants={subtitleVariants}
                >
                  {stats[0].subtitle}
                </motion.p>
              </div>
              <motion.div 
                className="absolute top-6 right-6 w-20 h-20 bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-full blur-xl"
                variants={glowVariants}
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.1, 0.3, 0.1]
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
            </div>
          </motion.div>

          {/* Card 2 */}
          <motion.div
            variants={cardVariants}
            whileHover={{ 
              scale: 1.05,
              rotateY: -5,
              transition: { duration: 0.3 }
            }}
          >
            <div className="bg-[#0f1f0f] border border-green-800/50 rounded-3xl p-8 flex flex-col justify-center min-h-[190px] relative overflow-hidden">
              <motion.div 
                className="absolute inset-0 bg-gradient-to-br from-green-500/3 to-emerald-500/3"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 2, delay: 0.7 }}
              />
              
              <div className="relative z-10">
                <motion.h2
                  className="text-6xl md:text-7xl font-bold bg-gradient-to-r from-green-100 to-emerald-400 bg-clip-text text-transparent mb-4"
                  variants={numberVariants}
                >
                  {counts[1]}{stats[1].suffix}
                </motion.h2>
                <motion.h3 
                  className="text-xl md:text-2xl font-bold text-white mb-2"
                  variants={titleVariants}
                >
                  {stats[1].title}
                </motion.h3>
                <motion.p 
                  className="text-gray-400"
                  variants={subtitleVariants}
                >
                  {stats[1].subtitle}
                </motion.p>
              </div>
              <motion.div 
                className="absolute top-4 right-4 w-16 h-16 bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-full blur-lg"
                variants={glowVariants}
                animate={{
                  scale: [1, 1.3, 1],
                  opacity: [0.1, 0.25, 0.1]
                }}
                transition={{
                  duration: 2.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 0.5
                }}
              />
            </div>
          </motion.div>

          {/* Card 3 */}
          <motion.div
            variants={cardVariants}
            whileHover={{ 
              scale: 1.05,
              rotateY: -5,
              transition: { duration: 0.3 }
            }}
          >
            <div className="bg-[#0f1f0f] border border-green-800/50 rounded-3xl p-8 flex flex-col justify-center min-h-[190px] relative overflow-hidden">
              <motion.div 
                className="absolute inset-0 bg-gradient-to-br from-green-500/3 to-emerald-500/3"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 2, delay: 0.9 }}
              />
              
              <div className="relative z-10">
                <div className="flex items-baseline mb-4">
                  <motion.span
                    className="text-6xl md:text-7xl font-bold bg-gradient-to-r from-green-100 to-emerald-400 bg-clip-text text-transparent"
                    variants={numberVariants}
                  >
                    {counts[2]}
                  </motion.span>
                  <motion.span 
                    className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent"
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8, delay: 1.4 }}
                  >
                    {stats[2].suffix}
                  </motion.span>
                </div>
                <motion.h3 
                  className="text-xl md:text-2xl font-bold text-white mb-2"
                  variants={titleVariants}
                >
                  {stats[2].title}
                </motion.h3>
                <motion.p 
                  className="text-gray-400"
                  variants={subtitleVariants}
                >
                  {stats[2].subtitle}
                </motion.p>
              </div>
              <motion.div 
                className="absolute top-4 right-4 w-16 h-16 bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-full blur-lg"
                variants={glowVariants}
                animate={{
                  scale: [1, 1.4, 1],
                  opacity: [0.1, 0.2, 0.1]
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 1
                }}
              />
            </div>
          </motion.div>
        </motion.div>

        {/* CTA Button */}
        <motion.div
          className="text-center mt-16"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.5 }}
        >
          <motion.button 
            className="group bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-bold px-10 py-4 rounded-2xl shadow-lg hover:shadow-green-500/25 transition-all duration-300"
            whileHover={{ 
              scale: 1.05,
              boxShadow: "0 20px 40px rgba(34, 197, 94, 0.3)"
            }}
            whileTap={{ scale: 0.98 }}
            animate={{
              boxShadow: [
                "0 10px 20px rgba(34, 197, 94, 0.1)",
                "0 15px 30px rgba(34, 197, 94, 0.2)",
                "0 10px 20px rgba(34, 197, 94, 0.1)"
              ]
            }}
            transition={{
              boxShadow: {
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }
            }}
          >
            <span className="flex items-center gap-2">
              Pelajari Program Adiwiyata
              <motion.span 
                className="transition-transform duration-200"
                animate={{ x: [0, 5, 0] }}
                transition={{ 
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                →
              </motion.span>
            </span>
          </motion.button>
        </motion.div>
      </div>
    </section>
  )
}