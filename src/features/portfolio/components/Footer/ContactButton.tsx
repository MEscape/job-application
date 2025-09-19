"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { FC } from "react";

interface ContactButtonProps {
  onClick?: () => void;
  label?: string;
}

export const ContactButton: FC<ContactButtonProps> = ({ onClick, label = "Start Our Journey" }) => {
  return (
    <motion.button
      onClick={onClick}
      className="group relative inline-flex items-center gap-4 px-12 py-6 text-lg font-semibold text-white bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/25"
      whileHover={{ scale: 1.05, y: -2 }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      {/* Shimmer effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000" />

      {/* Glass overlay */}
      <div className="absolute inset-0 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl" />

      <span className="relative z-10">{label}</span>
      <ArrowRight className="w-5 h-5 relative z-10 group-hover:translate-x-1 transition-transform duration-300" />
    </motion.button>
  );
};
