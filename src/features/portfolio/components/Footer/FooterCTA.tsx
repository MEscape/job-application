'use client';

import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Github, Instagram, Youtube } from 'lucide-react';
import { useRef } from 'react';
import { GlassMorphism } from '../shared/GlassMorphism';
import { ScrollReveal } from '../shared/ScrollReveal';
import { useIntersectionObserver } from '../../hooks/useIntersectionObserver';

interface FooterCTAProps {
  className?: string;
  onContactClick?: () => void;
}

const socialLinks = [
  {
    name: 'GitHub',
    icon: Github,
    href: 'https://github.com/MEscape',
    color: 'hover:text-gray-300'
  },
  {
    name: 'Instagram',
    icon: Instagram,
    href: 'https://www.instagram.com/marvin.esb',
    color: 'hover:text-pink-400'
  },
  {
    name: 'YouTube',
    icon: Youtube,
    href: 'https://www.youtube.com/@MEscapYT',
    color: 'hover:text-red-400'
  }
];

const contactInfo = [
  {
    icon: Mail,
    label: 'Email',
    value: 'business.eschenbach@gmail.com',
    href: 'mailto:business.eschenbach@gmail.com'
  },
  {
    icon: Phone,
    label: 'Phone',
    value: '+49 1578 5084644',
    href: 'tel:+4915785084644'
  },
  {
    icon: MapPin,
    label: 'Location',
    value: 'Bad Neustadt an der Saale, Germany',
    href: 'https://www.google.com/maps?q=Bad+Neustadt+an+der+Saale,+Germany'
  }
];

export function FooterCTA({ className = '' }: FooterCTAProps) {
  const footerRef = useRef<HTMLElement>(null!);
  
  const { isIntersecting } = useIntersectionObserver(footerRef, {
    threshold: 0.1,
    triggerOnce: true,
    rootMargin: '-50px'
  });

  return (
    <footer ref={footerRef} className={`relative py-32 overflow-hidden ${className}`}>
      {/* Background Section */}
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-gray-800/30 via-black/50 to-black/70" />

      <div className="relative max-w-6xl mx-auto px-4">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="text-center"
        >
          {/* Hero CTA Section */}
          <ScrollReveal direction="up" delay={0.2}>
            <motion.div className="mb-24">
              <h2 className="text-5xl md:text-7xl font-bold mb-8 leading-tight">
                <span className="bg-gradient-to-r from-white via-blue-50 to-white bg-clip-text text-transparent">
                  Let&#39;s Create
                </span>
                <br />
                <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
                  Something Extraordinary
                </span>
              </h2>
              
              <p className="text-xl text-gray-300/90 max-w-2xl mx-auto leading-relaxed mb-12 font-light">
                Transform your vision into reality. I specialize in crafting exceptional digital experiences 
                that push boundaries and exceed expectations.
              </p>
            </motion.div>
          </ScrollReveal>

          {/* Contact Information Section */}
          <ScrollReveal direction="up" delay={0.4}>
            <motion.div className="mb-24">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
                {contactInfo.map((contact, index) => {
                  const Icon = contact.icon;
                  const content = (
                    <GlassMorphism
                      variant="dark"
                      intensity="high"
                      className="p-8 group cursor-pointer h-full"
                      whileHover={{
                        scale: 1.05,
                        y: -8,
                        transition: { duration: 0.3 }
                      }}
                    >
                      <div className="flex flex-col items-center text-center">
                        <motion.div 
                          className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-cyan-500/20 border border-white/20 flex items-center justify-center mb-6 relative overflow-hidden"
                          whileHover={{
                            scale: 1.1,
                            rotate: 5
                          }}
                          transition={{ duration: 0.3 }}
                        >
                          {/* Shimmer effect */}
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 translate-x-[-100%] group-hover:translate-x-[200%] transition-transform duration-1000" />
                          <Icon className="w-7 h-7 text-blue-300 relative z-10" />
                        </motion.div>
                        <h3 className="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wider">
                          {contact.label}
                        </h3>
                        <p className="text-white/90 font-medium group-hover:text-blue-100 transition-colors duration-300">
                          {contact.value}
                        </p>
                      </div>
                    </GlassMorphism>
                  );

                  return contact.href ? (
                    <motion.a
                      key={index}
                      href={contact.href}
                      className="block"
                    >
                      {content}
                    </motion.a>
                  ) : (
                    <motion.div
                      key={index}
                    >
                      {content}
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          </ScrollReveal>

          {/* Social Media Section */}
          <ScrollReveal direction="up" delay={0.6}>
            <motion.div className="mb-20">
              <motion.h3 
                className="text-xl font-light text-white/80 mb-8 tracking-wide"
                animate={{
                  opacity: [0.7, 1, 0.7]
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                Let&#39;s Connect
              </motion.h3>
              <div className="flex justify-center gap-6">
                {socialLinks.map((social, index) => {
                  const Icon = social.icon;
                  return (
                    <motion.a
                      key={index}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      whileHover="hover"
                      className="group relative"
                    >
                      <motion.div
                        className="w-16 h-16 flex items-center justify-center relative overflow-hidden rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 transition-all duration-300 hover:bg-white/10 hover:border-white/20"
                        whileHover={{
                          scale: 1.1,
                          y: -4,
                          boxShadow: "0 10px 30px rgba(59, 130, 246, 0.2)"
                        }}
                        transition={{ duration: 0.3 }}
                      >
                        {/* Dynamic background based on social platform */}
                        <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl ${
                          social.name === 'GitHub' ? 'bg-gradient-to-br from-gray-600/20 to-gray-800/20' :
                          social.name === 'Instagram' ? 'bg-gradient-to-br from-pink-600/20 to-purple-800/20' :
                          social.name === 'YouTube' ? 'bg-gradient-to-br from-red-600/20 to-red-800/20' :
                          'bg-gradient-to-br from-blue-400/20 to-cyan-600/20'
                        }`} />
                        
                        {/* Pulse effect */}
                        <div className="absolute inset-0 rounded-2xl border border-white/0 group-hover:border-white/30 group-hover:animate-pulse transition-all duration-300" />
                        
                        {/* Icon with enhanced styling */}
                        <Icon className={`w-7 h-7 text-gray-400 group-hover:text-white transition-all duration-300 relative z-10 group-hover:scale-110 ${social.color}`} />
                      </motion.div>
                    </motion.a>
                  );
                })}
              </div>
            </motion.div>
          </ScrollReveal>

          {/* Footer Copyright Section */}
          <ScrollReveal direction="fade" delay={0.8}>
            <motion.div className="pt-16">
              <div className="relative">
                {/* Subtle divider line with glow */}
                <div className="w-32 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent mx-auto mb-8" />
                
                <div className="flex flex-col md:flex-row justify-center items-center gap-4 text-sm text-gray-500">
                  <motion.p
                    animate={{
                      opacity: [0.6, 0.9, 0.6]
                    }}
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  >
                    © {new Date().getFullYear()} Marvin Eschenbach. Crafted with passion.
                  </motion.p>
                </div>
              </div>
            </motion.div>
          </ScrollReveal>
        </motion.div>
      </div>

      {/* Floating Particles */}
      {isIntersecting && (
        <div className="absolute inset-0 pointer-events-none">
          {Array.from({ length: 15 }).map((_, index) => (
            <motion.div
              key={index}
              className="absolute w-1 h-1 rounded-full bg-gradient-to-r from-blue-400/30 to-purple-400/30"
              initial={{
                opacity: 0,
                scale: 0
              }}
              animate={{
                y: [0, -100, 0],
                x: [0, Math.sin(index) * 50, 0],
                opacity: [0, 0.8, 0],
                scale: [0, 1, 0]
              }}
              transition={{
                duration: 6 + index * 0.3,
                repeat: Infinity,
                delay: index * 0.2,
                ease: 'easeInOut'
              }}
              style={{
                left: `${20 + Math.random() * 60}%`,
                top: `${20 + Math.random() * 60}%`
              }}
            />
          ))}
        </div>
      )}
      
      {/* Subtle vignette effect */}
      <div className="absolute inset-0 bg-gradient-radial from-transparent via-transparent to-black/30 pointer-events-none" />
    </footer>
  );
}
