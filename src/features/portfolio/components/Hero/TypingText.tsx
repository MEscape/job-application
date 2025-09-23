'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';

interface TypingTextProps {
  lines: string[];
  typingSpeed?: number;
  deletingSpeed?: number;
  pauseDurations?: number[];
  loop?: boolean;
  className?: string;
}

export function TypingText({ 
  lines, 
  typingSpeed = 40,
  deletingSpeed = 25,
  pauseDurations = [],
  loop = true,
  className = ''
}: TypingTextProps) {
  const [displayText, setDisplayText] = useState('');
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [charIndex, setCharIndex] = useState(0);

  useEffect(() => {
    setMounted(true);
  }, []);

  const getVariableSpeed = useCallback((char: string, baseSpeed: number) => {
    // Slower for punctuation and spaces for more natural feel
    if (char === ',' || char === '.' || char === '!' || char === '?') return baseSpeed * 3;
    if (char === ' ') return baseSpeed * 1.5;
    if (char === '—') return baseSpeed * 2;
    return baseSpeed + Math.random() * 10; // Add slight randomness
  }, []);

  useEffect(() => {
    if (!mounted || lines.length === 0) return;
    
    const currentLine = lines[currentLineIndex];
    let timer: NodeJS.Timeout;
    
    if (isTyping && !isDeleting) {
      // Typing animation
      if (charIndex <= currentLine.length) {
        timer = setTimeout(() => {
          setDisplayText(currentLine.slice(0, charIndex));
          setCharIndex(prev => prev + 1);
        }, getVariableSpeed(currentLine[charIndex - 1] || '', typingSpeed));
      } else {
        // Finished typing current line
        const pauseDuration = pauseDurations[currentLineIndex] || 1000;
        timer = setTimeout(() => {
          if (loop && currentLineIndex === lines.length - 1) {
            // Start deleting if we're at the last line and looping
            setIsDeleting(true);
            setIsTyping(false);
          } else if (currentLineIndex < lines.length - 1) {
            // Move to next line
            setCurrentLineIndex(prev => prev + 1);
            setCharIndex(0);
          }
        }, pauseDuration);
      }
    } else if (isDeleting && loop) {
      // Deleting animation
      if (charIndex > 0) {
        timer = setTimeout(() => {
          setDisplayText(currentLine.slice(0, charIndex - 1));
          setCharIndex(prev => prev - 1);
        }, deletingSpeed);
      } else {
        // Finished deleting, reset to first line
        setIsDeleting(false);
        setIsTyping(true);
        setCurrentLineIndex(0);
        setCharIndex(0);
      }
    }

    return () => clearTimeout(timer);
  }, [lines, currentLineIndex, isTyping, isDeleting, charIndex, typingSpeed, deletingSpeed, pauseDurations, loop, mounted, getVariableSpeed]);

  if (!mounted) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <span className={className}>&nbsp;</span>
      </div>
    );
  }

  return (
    <div className={`${className} w-full h-full flex items-center justify-center`}>
      <div className="text-center leading-[1.3] tracking-wide max-w-4xl">
        <span className="inline-block bg-gradient-to-r from-white via-blue-200 to-purple-200 bg-clip-text text-transparent">
          {displayText}
          <motion.span
            animate={{ 
              opacity: [1, 0.3, 1]
            }}
            transition={{ 
              duration: 1.2, 
              repeat: Infinity, 
              ease: [0.4, 0, 0.6, 1]
            }}
            className="inline-block w-0.5 h-[1em] bg-gradient-to-r from-white via-blue-200 to-purple-200 ml-1 shadow-sm shadow-blue-400/50 align-middle"
          />
        </span>
      </div>
    </div>
  );
}