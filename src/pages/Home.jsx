// Home.jsx
/**
 * Home Component - Artist Portfolio Landing Page
 * 
 * @description Main landing page component for Bushra's artist portfolio website.
 *              Features a hero section with interactive artist photo, animated particle background,
 *              and introductory text showcasing various art mediums.
 * 
 * @author Bushra
 * @version 2.0.0
 * 
 * @features
 * - Responsive design (mobile-first approach)
 * - Interactive animated artist photo with rotating gradient rings
 * - Animated particle system background
 * - Gradient text effects with CSS animations
 * - SEO-optimized semantic HTML structure
 * - Accessibility compliant (ARIA labels, alt text)
 * - Modern CSS with Tailwind utility classes
 * - Touch-friendly interactions for mobile devices
 * 
 * @dependencies
 * - React 18+
 * - Framer Motion for animations
 * - ParticleSystem component
 * - ArtistSection component
 * - Tailwind CSS 3+
 * - Artist photo asset (Bushra.jpg)
 * 
 * @responsive_breakpoints
 * - Mobile: < 768px
 * - Tablet: 768px - 1024px  
 * - Desktop: > 1024px
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import ParticleSystem from '../components/particle';
import artistPhoto from '../assets/Bushra.jpg'; // Artist portfolio photo

// ------------------------
// ArtistSection Component
// ------------------------
const ArtistSection = ({ isMobile }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className="shrink-0">
      <motion.div
        className="relative group cursor-pointer"
        onMouseEnter={() => !isMobile && setIsHovered(true)}
        onMouseLeave={() => !isMobile && setIsHovered(false)}
        onTouchStart={() => setIsHovered(true)}
        onTouchEnd={() => setTimeout(() => setIsHovered(false), 2000)}
        whileHover={!isMobile ? { scale: 1.02 } : {}}
        whileTap={{ scale: 0.98 }}
        transition={{ duration: 0.4 }}
        aria-label="Interactive artist portrait with animated effects"
      >
        {/* Outer rotating gradient ring */}
        <motion.div
          className="absolute -inset-12 rounded-full opacity-40"
          style={{
            background: 'conic-gradient(from 0deg, #8b5cf6, #06b6d4, #d946ef, #f59e0b, #8b5cf6)',
            filter: 'blur(3px)',
          }}
          animate={{ rotate: isHovered ? 360 : 180, scale: isHovered ? 1.1 : 1 }}
          transition={{ rotate: { duration: 8, ease: 'linear', repeat: Infinity }, scale: { duration: 0.4 } }}
        />

        {/* Inner rotating gradient ring */}
        <motion.div
          className="absolute -inset-8 rounded-full opacity-25"
          style={{
            background: 'conic-gradient(from 180deg, #06b6d4, #8b5cf6, #06b6d4)',
            filter: 'blur(2px)',
          }}
          animate={{ rotate: isHovered ? -360 : -180, scale: isHovered ? 0.9 : 1 }}
          transition={{ rotate: { duration: 12, ease: 'linear', repeat: Infinity }, scale: { duration: 0.4 } }}
        />

        {/* Main photo container */}
        <div className="relative w-48 h-48 sm:w-60 sm:h-60 lg:w-80 lg:h-80 rounded-full overflow-hidden backdrop-blur-2xl bg-white/10 border border-white/20 shadow-[0_0_60px_rgba(139,92,246,0.3)]">
          <div className="absolute inset-3 rounded-full overflow-hidden">
            <motion.img
              src={artistPhoto}
              alt="Bushra Khandoker — Digital and Traditional Artist specializing in pencil, acrylic, and mixed media artwork"
              className="w-full h-full object-cover rounded-full"
              whileHover={!isMobile ? { scale: 1.1 } : {}}
              transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
              loading="eager"
              width="320"
              height="320"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent rounded-full" />
          </div>
        </div>

        {/* Floating animated particles */}
        {[
          { delay: 0, color: 'from-purple-400 to-pink-500', position: '-top-6 -right-6' },
          { delay: 1.5, color: 'from-blue-400 to-cyan-500', position: '-bottom-4 -left-4' },
          { delay: 3, color: 'from-amber-400 to-rose-500', position: 'top-12 -left-8' },
          { delay: 4.5, color: 'from-emerald-400 to-blue-500', position: 'bottom-16 -right-2' },
        ].map((item, index) => (
          <motion.div
            key={index}
            className={`absolute w-3 h-3 sm:w-4 sm:h-4 lg:w-6 lg:h-6 bg-gradient-to-br ${item.color} rounded-full shadow-lg ${item.position}`}
            animate={{
              y: [0, -20, 0],
              x: [0, Math.sin(item.delay) * 10, 0],
              scale: [1, 1.3, 1],
              rotate: [0, 360, 0],
            }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: item.delay }}
            style={{
              filter: `drop-shadow(0 0 10px ${item.color.includes('purple') ? '#8b5cf6' : item.color.includes('blue') ? '#3b82f6' : item.color.includes('amber') ? '#f59e0b' : '#10b981'}66)`,
            }}
          />
        ))}
      </motion.div>
    </div>
  );
};

/**
 * Home Component
 * 
 * Renders the main landing page with hero section containing:
 * - Interactive particle background system
 * - Interactive artist profile photo with animated rings and particles
 * - Animated typography introducing the artist
 * - Description of artistic mediums and philosophy
 * 
 * @returns {JSX.Element} Fully responsive hero section component
 */
const Home = () => {
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile device for touch interactions
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    // Main container - Full viewport height with gradient background
    <div 
      className="w-full h-screen relative overflow-hidden bg-gradient-to-br from-gray-900 via-black to-indigo-950"
      role="main"
      aria-label="Artist portfolio home page"
    >

      {/* Particle System Background Layer */}
      <div 
        className="absolute inset-0 z-0 bg-amber-200 opacity-60"
        aria-hidden="true"
        role="presentation"
      >
        <ParticleSystem />
      </div>

      {/* Main Content Layer - Foreground */}
      <div className="pointer-events-none relative z-10 h-full flex items-center justify-center px-6 lg:px-24">

        {/* Content Wrapper: Interactive Artist Photo + Introductory Text */}
        <div className="flex flex-col lg:flex-row items-center gap-10 max-w-6xl w-full">

          {/* Interactive Artist Profile Photo Section */}
          <ArtistSection isMobile={isMobile} className= "pointer-events-auto" />

          {/* Artist Introduction Text Block */}
          <div className="text-center lg:text-left pointer-events-auto">
            {/* Primary Greeting - Animated Purple Gradient */}
            <motion.h1 
              className="text-4xl sm:text-5xl lg:text-6xl font-extrabold mb-4 bg-gradient-to-r from-purple-400 bg-clip-text text-transparent"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              Hello, 
            </motion.h1>
            
            {/* Artist Name - Animated Yellow Gradient */}
            <motion.h1 
              className="text-4xl sm:text-5xl lg:text-6xl font-extrabold mb-4 bg-yellow-400 bg-clip-text text-transparent"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              I'm Bushra
            </motion.h1>
            
            {/* Artist Philosophy and Medium Description */}
            <motion.p 
              className="text-lg sm:text-xl lg:text-2xl font-light max-w-2xl text-gray-300 leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              "Through pencil, acrylic, digital, and crafted mediums, I create my world of imagination — every piece narrates a story, every stroke infused with emotion and care."
            </motion.p>
          </div>

        </div>
      </div>

    </div>
  );
};

export default Home;