"use client";

import { motion } from "framer-motion";
import { Scale } from "lucide-react";

/**
 * Brand‑styled full‑screen loader.
 * Shows while GPT / API work is in progress.
 */
export default function Loader({ visible }: { visible: boolean }) {
  if (!visible) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      className="fixed inset-0 z-40 flex flex-col gap-6 items-center justify-center bg-white/70 backdrop-blur-sm"
    >
      {/* Outer pulse ring */}
      <motion.div
        className="relative flex items-center justify-center h-24 w-24"
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        transition={{ repeat: Infinity, repeatType: 'reverse', duration: 1.2, ease: 'easeInOut' }}
      >
        {/* Gradient ring */}
        <motion.div
          className="absolute inset-0 rounded-full bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600"
          style={{ maskImage: 'radial-gradient(transparent 60%, black 61%)' }}
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 2.5, ease: 'linear' }}
        />
        {/* Icon */}
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ repeat: Infinity, duration: 2.5, ease: 'linear' }}
        >
          <Scale size={40} className="text-blue-700" />
        </motion.div>
      </motion.div>
      {/* Sliding‑gradient brand text */}
      <motion.span
        className="text-3xl font-extrabold bg-clip-text text-transparent"
        style={{
          backgroundImage:
            "linear-gradient(90deg, #2563eb 0%, #a1a1aa 25%, #6366f1 50%, #8b5cf6 75%, #2563eb 100%)",
          backgroundSize: "200% auto",
          backgroundPosition: "0% 50%"
        }}
        animate={{ backgroundPosition: ["100% 50%", "0% 50%"] }}
        transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
      >
        MeraVakil
      </motion.span>
    </motion.div>
  );
}