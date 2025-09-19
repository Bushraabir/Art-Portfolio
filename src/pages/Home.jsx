// Home.jsx
/**
 * Home Component - Artist Portfolio Landing Page
 * 
 * @description Main landing page component for Bushra's artist portfolio website.
 *              Features a hero section with artist photo, animated particle background,
 *              and introductory text showcasing various art mediums.
 * 
 * @author Bushra
 * @version 1.0.0
 * 
 * @features
 * - Responsive design (mobile-first approach)
 * - Animated particle system background
 * - Gradient text effects with CSS animations
 * - SEO-optimized semantic HTML structure
 * - Accessibility compliant (ARIA labels, alt text)
 * - Modern CSS with Tailwind utility classes
 * 
 * @dependencies
 * - React 18+
 * - ParticleSystem component
 * - Tailwind CSS 3+
 * - Artist photo asset (Bushra1.jpg)
 * 
 * @responsive_breakpoints
 * - Mobile: < 768px
 * - Tablet: 768px - 1024px  
 * - Desktop: > 1024px
 */

import React from 'react';
import ParticleSystem from '../components/particle';
import artistPhoto from '../assets/Bushra.jpg'; // Artist portfolio photo

/**
 * Home Component
 * 
 * Renders the main landing page with hero section containing:
 * - Interactive particle background system
 * - Artist profile photo with styling
 * - Animated typography introducing the artist
 * - Description of artistic mediums and philosophy
 * 
 * @returns {JSX.Element} Fully responsive hero section component
 */
const Home = () => {


  
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

        {/* Content Wrapper: Artist Photo + Introductory Text */}
        <div className="flex flex-col lg:flex-row items-center gap-10 max-w-6xl w-full">

          {/* Artist Profile Photo Section */}
          <div className="shrink-0">
            <img
              src={artistPhoto}
              alt="Bushra - Digital and Traditional Artist specializing in pencil, acrylic, and mixed media artwork"
              className="w-48 h-48 lg:w-80 lg:h-80 rounded-xl border-4 border-blue-400 shadow-lg object-cover"
              loading="eager"
              width="320"
              height="320"
            />
          </div>

          {/* Artist Introduction Text Block */}
          <div className="text-center lg:text-left">
            {/* Primary Greeting - Animated Purple Gradient */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold mb-4 bg-gradient-to-r from-purple-400 bg-clip-text text-transparent animate-fadeIn">
              Hello, 
            </h1>
            
            {/* Artist Name - Animated Yellow Gradient */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold mb-4 bg-yellow-400 bg-clip-text text-transparent animate-fadeIn">
              I'm Bushra
            </h1>
            
            {/* Artist Philosophy and Medium Description */}
            <p className="text-lg sm:text-xl lg:text-2xl font-light max-w-2xl text-gray-300 leading-relaxed animate-slideIn">
              "Through pencil, acrylic, digital, and crafted mediums, I create my world of imagination — every piece narrates a story, every stroke infused with emotion and care."
            </p>
          </div>

        </div>
      </div>

    </div>
  );
};

export default Home;