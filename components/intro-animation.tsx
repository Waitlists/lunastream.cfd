"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Film, SkipForward } from "lucide-react"

interface IntroAnimationProps {
  onComplete: () => void
  onSkip: () => void
}

export function IntroAnimation({ onComplete, onSkip }: IntroAnimationProps) {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer)
          setTimeout(onComplete, 500)
          return 100
        }
        return prev + 0.8
      })
    }, 30)

    return () => clearInterval(timer)
  }, [onComplete])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-black via-purple-950/30 to-black overflow-hidden"
    >
      <motion.button
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
        onClick={onSkip}
        className="absolute bottom-8 right-8 flex items-center gap-2 text-white bg-[#fbc9ff]/20 hover:bg-[#fbc9ff]/30 border-2 border-[#fbc9ff] hover:border-[#fbc9ff] transition-all text-base font-semibold px-6 py-3 rounded-xl shadow-lg hover:shadow-[0_0_20px_rgba(251,201,255,0.5)] hover:scale-105"
      >
        <SkipForward className="w-5 h-5" />
        Skip Intro
      </motion.button>

      <div className="absolute inset-0">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-[#fbc9ff]/30 rounded-full"
            initial={{
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
              scale: Math.random() * 0.5 + 0.5,
            }}
            animate={{
              y: [null, Math.random() * window.innerHeight],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: Math.random() * 3 + 2,
              repeat: Number.POSITIVE_INFINITY,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      <div className="flex flex-col items-center gap-8 relative z-10">
        <motion.div
          initial={{ scale: 0.5, opacity: 0, rotate: -180 }}
          animate={{ scale: 1, opacity: 1, rotate: 0 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
        >
          <motion.div
            animate={{
              filter: [
                "drop-shadow(0 0 20px #fbc9ff)",
                "drop-shadow(0 0 60px #fbc9ff)",
                "drop-shadow(0 0 20px #fbc9ff)",
              ],
              scale: [1, 1.1, 1],
            }}
            transition={{ duration: 2.5, repeat: Number.POSITIVE_INFINITY }}
          >
            <Film className="w-32 h-32 text-[#fbc9ff]" />
          </motion.div>
        </motion.div>

        <div className="flex gap-1">
          {["L", "u", "n", "a", "S", "t", "r", "e", "a", "m"].map((letter, i) => (
            <motion.span
              key={i}
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 + i * 0.05, duration: 0.5 }}
              className="text-5xl font-bold text-white"
            >
              {letter}
            </motion.span>
          ))}
        </div>

        <div className="w-64 h-2 bg-white/10 rounded-full overflow-hidden relative">
          <motion.div
            className="h-full bg-gradient-to-r from-[#fbc9ff] via-[#db97e2] to-[#fbc9ff] relative"
            style={{ width: `${progress}%` }}
            transition={{ duration: 0.1 }}
          >
            <motion.div
              className="absolute inset-0 bg-white/30"
              animate={{
                x: ["-100%", "200%"],
              }}
              transition={{
                duration: 1.5,
                repeat: Number.POSITIVE_INFINITY,
                ease: "linear",
              }}
            />
          </motion.div>
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-white/60 text-sm"
        >
          {Math.round(progress)}%
        </motion.p>
      </div>
    </motion.div>
  )
}
