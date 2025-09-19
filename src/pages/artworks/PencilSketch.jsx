import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform, useInView } from 'framer-motion';

// Import all your actual images (keeping exact paths)
import sketch1 from '../../assets/PencilSketch/1.jpg';
import sketch2 from '../../assets/PencilSketch/2.jpg';
import sketch3 from '../../assets/PencilSketch/3.jpg';
import sketch5 from '../../assets/PencilSketch/5.jpg';
import sketch6 from '../../assets/PencilSketch/6.jpg';
import sketch8 from '../../assets/PencilSketch/8.jpg';
import sketch9 from '../../assets/PencilSketch/9.jpg';
import sketch10 from '../../assets/PencilSketch/10.jpg';
import sketch11 from '../../assets/PencilSketch/11.jpg';
import sketch12 from '../../assets/PencilSketch/12.png';
import sketch13 from '../../assets/PencilSketch/13.jpg';
import sketch14 from '../../assets/PencilSketch/14.jpg';
import sketch15 from '../../assets/PencilSketch/15.jpg';
import sketch16 from '../../assets/PencilSketch/16.jpg';

// Map images to IDs (keeping exact structure)
const imageMap = {
  1: sketch1,
  2: sketch2,
  3: sketch3,
  5: sketch5,
  6: sketch6,
  8: sketch8,
  9: sketch9,
  10: sketch10,
  11: sketch11,
  12: sketch12,
  13: sketch13,
  14: sketch14,
  15: sketch15,
  16: sketch16
};

// Enhanced sketch data with better SEO-friendly descriptions
const sketchData = [
  { 
    id: 1, 
    title: "Veins of life", 
    description: "An experimentation of light effects on natural forms. The new growing leaves indicate life and hope, rebirth.", 
    date: "January, 2022",
    technique: "Graphite on Canvas",
    dimensions: "24 × 30 inches",
    category: "Nature",
    featured: true,
    seoKeywords: "nature art, graphite drawing, botanical illustration, light study"
  },
  { 
    id: 2, 
    title: "The tie", 
    description: "Can we overcome all knots even we want to?", 
    date: "January, 2023",
    technique: "Graphite Pencils",
    dimensions: "16 × 20 inches",
    category: "Texture",
    seoKeywords: "conceptual art, graphite sketch, texture drawing, symbolic art"
  },
  { 
    id: 3, 
    title: "Butea monosperma", 
    description: "Flowers always makes me happy!", 
    date: "January, 2021",
    technique: "Cross-Hatching",
    dimensions: "12 × 18 inches",
    category: "Pen Sketch",
    seoKeywords: "flower drawing, botanical art, pen and ink, cross hatching technique"
  },
  { 
    id: 5, 
    title: "Roar", 
    description: "The roar of king simbolises the power, strength and courage of human civilization", 
    date: "February, 2025",
    technique: "Blending graphites",
    dimensions: "16 × 20 inches",
    category: "Animal",
    seoKeywords: "lion drawing, animal portrait, graphite art, wildlife illustration"
  },
  { 
    id: 6, 
    title: "The warmth of touch", 
    description: "As social being, touch of the loved ones gives us warmth, comfort and security", 
    date: "June, 2024",
    technique: "Graphite & Charcoal",
    dimensions: "22 × 28 inches",
    category: "Anatomy",
    seoKeywords: "human anatomy, charcoal drawing, figure study, emotional art"
  },
  { 
    id: 8, 
    title: "Serenade of Shadows", 
    description: "Studies still life drawing from real picture, focusing on the interplay of light and shadow to create depth and mood.", 
    date: "August, 2024",
    technique: "Graphite Blend",
    dimensions: "12 × 18 inches",
    category: "Still Life",
    seoKeywords: "still life drawing, shadow study, graphite art, realism"
  },
  { 
    id: 9, 
    title: "Stillness in Chaos", 
    description: "I was practising still life drawing from the real picture, maintaining proportionality, textures and balance", 
    date: "December, 2025",
    technique: "Graphite",
    dimensions: "24 × 18 inches",
    category: "Still life",
    featured: true,
    seoKeywords: "still life art, proportional drawing, graphite technique, realistic art"
  },
  { 
    id: 10, 
    title: "Luminescence", 
    description: "A study of light and shadow, capturing the delicate nuances of illumination on a simple object", 
    date: "April, 2021",
    technique: "Graphite",
    dimensions: "18 × 24 inches",
    category: "Light",
    seoKeywords: "light study, chiaroscuro, graphite shading, illumination art"
  },
  { 
    id: 11, 
    title: "Perspective", 
    description: "I was just randomly practising two-point perspective and ended up with this conceptual piece", 
    date: "November, 2023",
    technique: "Graphite",
    dimensions: "20 × 26 inches",
    category: "Perspective",
    seoKeywords: "perspective drawing, architectural art, two point perspective, technical drawing"
  },
  { 
    id: 12, 
    title: "Rebel", 
    description: "Urge to balance everything despite of enchained with metal chains and drawbacks", 
    date: "December, 2025",
    technique: "Graphite",
    dimensions: "16 × 24 inches",
    category: "Still life",
    seoKeywords: "conceptual art, symbolic drawing, graphite illustration, contemporary art"
  },
  { 
    id: 13, 
    title: "The busy life", 
    description: "The bustle and business in a coffee shop, trying to escape from life", 
    date: "May, 2025",
    technique: "One point perspective",
    dimensions: "16 × 24 inches",
    category: "Architecture",
    seoKeywords: "architectural drawing, interior perspective, urban sketching, one point perspective"
  },
  { 
    id: 14, 
    title: "Texture Symphony", 
    description: "Tried to depict the texture of woven cloth, water, and daffodil petals", 
    date: "April, 2025",
    technique: "Graphite Pencils",
    dimensions: "18 × 24 inches",
    category: "Texture",
    featured: true,
    seoKeywords: "texture study, material rendering, graphite technique, detailed drawing"
  },
  { 
    id: 15, 
    title: "The thirst", 
    description: "A single drop of water can fulfill the thirst of a life, can save a life", 
    date: "April, 2024",
    technique: "Metal texturing with Graphite",
    dimensions: "16 × 20 inches",
    category: "Texture",
    seoKeywords: "metal texture, water drop art, hyperrealistic drawing, graphite rendering"
  },
  { 
    id: 16, 
    title: "Blooming", 
    description: "Exploring the textures and shadows of blooming flower.", 
    date: "January, 2023",
    technique: "Graphite Pencils",
    dimensions: "16 × 20 inches",
    category: "Nature",
    seoKeywords: "flower study, botanical drawing, graphite shading, nature art"
  }
];

const categories = ["All", "Nature", "Texture", "Architecture", "Still life", "Perspective", "Texture", "Anatomy", "Animal", "Pen Sketch"];

/**
 * SEO Metadata Component
 * Provides structured data for better search engine optimization
 */
const SEOMetadata = () => {
  useEffect(() => {
    // Set page title and meta description
    document.title = "Pencil & Soul - Original Graphite Art Portfolio | Bushra's Drawings";
    
    // Update meta description
    const metaDesc = document.querySelector('meta[name="description"]') || document.createElement('meta');
    metaDesc.name = "description";
    metaDesc.content = "Explore Bushra's collection of original graphite drawings and pencil sketches. Features nature studies, portraits, still life, and architectural drawings created with traditional drawing techniques.";
    if (!document.querySelector('meta[name="description"]')) {
      document.head.appendChild(metaDesc);
    }

    // Add keywords meta tag
    const metaKeywords = document.querySelector('meta[name="keywords"]') || document.createElement('meta');
    metaKeywords.name = "keywords";
    metaKeywords.content = "graphite art, pencil drawings, art portfolio, nature sketches, still life drawings, portrait art, architectural drawings, texture studies";
    if (!document.querySelector('meta[name="keywords"]')) {
      document.head.appendChild(metaKeywords);
    }

    // Add viewport meta tag for mobile responsiveness
    const metaViewport = document.querySelector('meta[name="viewport"]') || document.createElement('meta');
    metaViewport.name = "viewport";
    metaViewport.content = "width=device-width, initial-scale=1.0, maximum-scale=5.0";
    if (!document.querySelector('meta[name="viewport"]')) {
      document.head.appendChild(metaViewport);
    }

    // Add structured data for artwork
    const structuredData = {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      "name": "Pencil & Soul Art Portfolio",
      "description": "Original graphite drawings and pencil sketches by artist Bushra",
      "creator": {
        "@type": "Person",
        "name": "Bushra"
      },
      "about": {
        "@type": "VisualArtwork",
        "artMedium": "Graphite, Charcoal, Pencil",
        "artworkSurface": "Paper, Canvas"
      }
    };

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(structuredData);
    document.head.appendChild(script);

    return () => {
      // Cleanup structured data on unmount
      const existingScript = document.querySelector('script[type="application/ld+json"]');
      if (existingScript) {
        existingScript.remove();
      }
    };
  }, []);

  return null;
};

/**
 * Background Elements Component
 * Creates animated background decorations
 */
const BackgroundElements = () => {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
      {/* Animated gradient orbs */}
      <motion.div
        className="absolute top-1/4 left-1/4 w-72 sm:w-96 h-72 sm:h-96 bg-gradient-to-br from-purple-600/15 via-blue-600/10 to-transparent rounded-full blur-3xl"
        animate={{ 
          scale: [1, 1.2, 1],
          opacity: [0.2, 0.4, 0.2],
          x: [0, 50, 0],
          y: [0, -30, 0]
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      
      <motion.div
        className="absolute bottom-1/3 right-1/4 w-64 sm:w-80 h-64 sm:h-80 bg-gradient-to-br from-cyan-600/15 via-blue-600/10 to-transparent rounded-full blur-3xl"
        animate={{ 
          scale: [1.2, 1, 1.2],
          opacity: [0.3, 0.5, 0.3],
          x: [0, -40, 0],
          y: [0, 40, 0]
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
      />
      
      {/* Geometric patterns */}
      <div className="absolute inset-0 opacity-[0.015]">
        <div 
          className="w-full h-full"
          style={{
            backgroundImage: `
              radial-gradient(circle at 25% 25%, white 1px, transparent 1px),
              radial-gradient(circle at 75% 75%, white 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px, 50px 50px',
            backgroundPosition: '0 0, 25px 25px'
          }}
        />
      </div>
      
      {/* Floating particles */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-white/15 rounded-full"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [0, -100, 0],
            opacity: [0.1, 0.6, 0.1],
            scale: [1, 1.5, 1],
          }}
          transition={{
            duration: 6 + Math.random() * 4,
            repeat: Infinity,
            delay: Math.random() * 4,
            ease: "easeInOut"
          }}
        />
      ))}
    </div>
  );
};

/**
 * Scroll Progress Indicator
 * Shows reading progress at the top of the page
 */
const ScrollProgress = () => {
  const { scrollYProgress } = useScroll();
  const scaleX = useTransform(scrollYProgress, [0, 1], [0, 1]);
  
  return (
    <motion.div
      className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-500 transform-gpu z-50"
      style={{ scaleX, transformOrigin: '0%' }}
      role="progressbar"
      aria-label="Page scroll progress"
    />
  );
};

/**
 * Animated Section Wrapper
 * Provides consistent scroll-triggered animations
 */
const Section = ({ children, className = "", delay = 0 }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  
  return (
    <motion.section
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
      transition={{ duration: 0.6, delay, ease: [0.25, 0.1, 0.25, 1] }}
      className={`relative ${className}`}
    >
      {children}
    </motion.section>
  );
};

/**
 * Gradient Text Component
 * Creates consistent gradient text styling
 */
const GradientText = ({ children, className = "", gradient = "from-white via-purple-200 to-blue-200" }) => {
  return (
    <span className={`bg-gradient-to-r ${gradient} bg-clip-text text-transparent ${className}`}>
      {children}
    </span>
  );
};

/**
 * Filter Controls Component
 * Handles category filtering and sorting
 */
const FilterControls = ({ activeCategory, setActiveCategory, sortBy, setSortBy }) => {
  return (
    <Section className="px-4 sm:px-6 pb-16" delay={0.2}>
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row gap-8 items-start lg:items-center justify-between mb-12">
          {/* Category Filters */}
          <div className="w-full lg:w-auto">
            <h3 className="text-white text-sm font-medium mb-4 tracking-wide">Filter by Category</h3>
            <div className="flex flex-wrap gap-3">
              {categories.map((category) => (
                <motion.button
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  className={`px-4 sm:px-6 py-2 sm:py-3 rounded-full text-sm sm:text-base font-medium transition-all duration-300 border backdrop-blur-sm ${
                    activeCategory === category
                      ? 'bg-gradient-to-r from-purple-600 to-blue-500 text-white border-purple-400 shadow-lg shadow-purple-500/25'
                      : 'bg-black/40 text-gray-300 border-white/20 hover:border-white/40 hover:text-white hover:bg-white/10'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                  aria-pressed={activeCategory === category}
                >
                  {category}
                </motion.button>
              ))}
            </div>
          </div>
          
          {/* Sort Controls */}
          <div className="w-full lg:w-auto">
            <h3 className="text-white text-sm font-medium mb-4 tracking-wide">Sort by</h3>
            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-black/40 border border-white/20 text-white px-4 py-2 rounded-lg focus:border-purple-400 focus:outline-none backdrop-blur-sm transition-colors duration-300"
              aria-label="Sort artworks by"
            >
              <option value="date">Date Created</option>
              <option value="title">Title (A-Z)</option>
              <option value="featured">Featured First</option>
            </select>
          </div>
        </div>
      </div>
    </Section>
  );
};

/**
 * Main Portfolio Component
 */
const PencilSketchGallery = () => {
  // State management
  const [selectedSketch, setSelectedSketch] = useState(null);
  const [activeCategory, setActiveCategory] = useState("All");
  const [sortBy, setSortBy] = useState("date");
  const [isMounted, setIsMounted] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  
  const { scrollYProgress } = useScroll();
  const headerOpacity = useTransform(scrollYProgress, [0, 0.1], [1, 0.95]);

  // Filter and sort sketches
  const filteredSketches = sketchData
    .filter(sketch => activeCategory === "All" || sketch.category === activeCategory)
    .sort((a, b) => {
      if (sortBy === "date") return new Date(b.date) - new Date(a.date);
      if (sortBy === "title") return a.title.localeCompare(b.title);
      if (sortBy === "featured") return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
      return 0;
    });

  // Initialize component
  useEffect(() => {
    document.body.style.overflowY = 'auto';
    document.documentElement.style.scrollBehavior = 'smooth';
    
    // Mobile viewport height fix
    const updateVH = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    };
    
    updateVH();
    window.addEventListener('resize', updateVH);
    setIsMounted(true);
    
    return () => {
      window.removeEventListener('resize', updateVH);
      document.body.style.overflow = 'auto';
    };
  }, []);

  // Modal functions
  const openModal = (sketch) => {
    setSelectedSketch(sketch);
    setImageLoaded(false);
    document.body.style.overflow = 'hidden';
    
    // Track view for analytics (if needed)
    console.log(`Viewed artwork: ${sketch.title}`);
  };

  const closeModal = () => {
    setSelectedSketch(null);
    setImageLoaded(false);
    document.body.style.overflow = 'auto';
  };

  const navigateSketch = (direction) => {
    const currentIndex = filteredSketches.findIndex(sketch => sketch.id === selectedSketch.id);
    let newIndex;
    
    if (direction === 'next') {
      newIndex = (currentIndex + 1) % filteredSketches.length;
    } else {
      newIndex = (currentIndex - 1 + filteredSketches.length) % filteredSketches.length;
    }
    
    setSelectedSketch(filteredSketches[newIndex]);
    setImageLoaded(false);
  };

  // Touch handling for mobile swipe
  const handleTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe && selectedSketch) {
      navigateSketch('next');
    }
    if (isRightSwipe && selectedSketch) {
      navigateSketch('prev');
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!selectedSketch) return;
      
      switch(e.key) {
        case 'Escape':
          closeModal();
          break;
        case 'ArrowRight':
          e.preventDefault();
          navigateSketch('next');
          break;
        case 'ArrowLeft':
          e.preventDefault();
          navigateSketch('prev');
          break;
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedSketch, filteredSketches]);

  // Loading state
  if (!isMounted) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <motion.div
          className="w-12 h-12 border-2 border-purple-500/30 border-t-purple-500 rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          aria-label="Loading portfolio"
        />
      </div>
    );
  }

  return (
    <>
      <SEOMetadata />
      <div className="min-h-screen bg-black text-white relative overflow-x-hidden">
        <ScrollProgress />
        
        {/* Background elements */}
        <BackgroundElements />
        
        {/* Skip to content link for accessibility */}
        <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-purple-600 text-white p-2 rounded z-50">
          Skip to main content
        </a>
        
        {/* Main content */}
        <main id="main-content" className="relative z-10">
          {/* Hero Section */}
          <Section className="px-4 sm:px-6 pt-16 sm:pt-20 pb-12 sm:pb-16">
            <motion.header
              className="max-w-6xl mx-auto text-center"
              style={{ opacity: headerOpacity }}
            >
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="mb-12 sm:mb-16"
              >
                <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl font-bold tracking-tight leading-tight mb-6 sm:mb-8">
                  <GradientText 
                    gradient="from-purple-400 via-blue-400 to-cyan-400"
                    className="block"
                  >
                    Sketches
                  </GradientText>
                </h1>
                
                <motion.div
                  className="text-lg sm:text-xl md:text-2xl lg:text-3xl text-gray-300 font-light mb-6 sm:mb-8"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                >
                  <span className="relative inline-block">
                    Where graphite and ink meets imagination
                    <motion.span 
                      className="absolute -bottom-1 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-purple-400 to-transparent"
                      initial={{ scaleX: 0, opacity: 0 }}
                      animate={{ scaleX: 1, opacity: 0.8 }}
                      transition={{ delay: 0.8, duration: 1.2 }}
                    />
                  </span>
                </motion.div>
              </motion.div>
              
              <motion.div
                className="max-w-4xl mx-auto"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
              >
                <p className="text-base sm:text-lg md:text-xl lg:text-2xl leading-relaxed text-gray-300 font-light">
                  A collection of {' '}
                  <GradientText 
                    gradient="from-purple-400 to-blue-400"
                    className="font-medium"
                  >
                    pencil and pen Sketches
                  </GradientText>{' '}
                  that i do in my free time. Each piece is a journey into the world of graphite and ink, capturing moments, emotions, and the beauty of everyday life with intricate detail and a touch of imagination.
                </p>
              </motion.div>
            </motion.header>
          </Section>

          {/* Filter Controls */}
          <FilterControls 
            activeCategory={activeCategory}
            setActiveCategory={setActiveCategory}
            sortBy={sortBy}
            setSortBy={setSortBy}
          />

          {/* Gallery Section */}
          <Section className="px-4 sm:px-6 pb-20 sm:pb-32" delay={0.3}>
            <div className="max-w-8xl mx-auto">
              <motion.div 
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8 lg:gap-10 xl:gap-12"
                layout
              >
                <AnimatePresence mode="popLayout">
                  {filteredSketches.map((sketch, index) => (
                    <motion.article
                      key={sketch.id}
                      layout
                      initial={{ opacity: 0, scale: 0.9, y: 40 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9, y: 40 }}
                      transition={{ 
                        duration: 0.6, 
                        delay: index * 0.08,
                        type: "spring",
                        stiffness: 80,
                        damping: 25
                      }}
                      whileHover={{ 
                        y: -12, 
                        transition: { duration: 0.3, type: "spring", stiffness: 400 } 
                      }}
                      className="group cursor-pointer"
                      onClick={() => openModal(sketch)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          openModal(sketch);
                        }
                      }}
                      aria-label={`View ${sketch.title} - ${sketch.description}`}
                    >
                      <div className="relative">
                        {/* Outer Glow */}
                        <div className="absolute -inset-4 bg-gradient-to-r from-purple-600/8 via-blue-400/4 to-cyan-600/8 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                        
                        {/* Main Frame */}
                        <div className="relative bg-gradient-to-br from-white/8 via-white/4 to-white/8 rounded-2xl overflow-hidden shadow-xl shadow-black/40 border border-white/15 group-hover:border-white/30 transition-all duration-400 backdrop-blur-sm">
                          
                          {/* Featured Badge */}
                          {sketch.featured && (
                            <motion.div 
                              className="absolute top-4 left-4 z-20"
                              initial={{ scale: 0, rotate: -90 }}
                              animate={{ scale: 1, rotate: 0 }}
                              transition={{ delay: index * 0.08 + 0.4, type: "spring" }}
                            >
                              <div className="bg-gradient-to-r from-purple-600 via-blue-500 to-cyan-600 text-white text-xs px-3 py-2 rounded-full font-medium shadow-md shadow-purple-500/30 border border-purple-400/50 backdrop-blur-sm flex items-center gap-2">
                                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                                Featured
                              </div>
                            </motion.div>
                          )}
                          
                          {/* Image Container */}
                          <div className="relative overflow-hidden bg-black">
                            {/* Double border frames */}
                            <div className="absolute inset-3 border-2 border-white/25 rounded-xl z-10 pointer-events-none group-hover:border-white/40 transition-colors duration-400"></div>
                            <div className="absolute inset-5 border border-white/15 rounded-lg z-10 pointer-events-none group-hover:border-white/30 transition-colors duration-400"></div>
                            
                            {/* Image */}
                            <img
                              src={imageMap[sketch.id]}
                              alt={`${sketch.title} - ${sketch.technique} artwork by Bushra`}
                              className="w-full h-full object-cover transition-all duration-500 group-hover:scale-105 filter group-hover:contrast-105 group-hover:brightness-105"
                              style={{ 
                                minHeight: "350px",
                                aspectRatio: "4/5",
                                filter: 'drop-shadow(0 8px 25px rgba(0,0,0,0.25))'
                              }}
                              loading="lazy"
                            />
                            
                            {/* Hover Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-purple-900/15 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                            
                            {/* Hover Content */}
                            <div className="absolute inset-0 p-6 flex flex-col justify-end opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-8 group-hover:translate-y-0">
                              <div className="text-purple-300 text-xs font-medium mb-2 tracking-wide uppercase">
                                {sketch.category}
                              </div>
                              <h3 className="text-white text-xl font-light mb-3 leading-tight">
                                {sketch.title}
                              </h3>
                              <p className="text-gray-300 text-sm leading-relaxed line-clamp-2 mb-3">
                                {sketch.description}
                              </p>
                              <div className="flex justify-between items-center text-xs text-gray-400 pt-2 border-t border-white/20">
                                <span className="font-medium">{sketch.date}</span>
                                <span className="italic">{sketch.technique}</span>
                              </div>
                            </div>
                          </div>

                          {/* Info Panel */}
                          <div className="p-5 bg-gradient-to-r from-black/85 via-gray-900/75 to-black/85 backdrop-blur-xl border-t border-white/10">
                            <div className="flex justify-between items-center">
                              <div className="flex-1 min-w-0">
                                <h4 className="text-white font-light text-lg mb-1 truncate">{sketch.title}</h4>
                                <p className="text-gray-400 text-sm truncate">{sketch.technique}</p>
                                <p className="text-gray-500 text-xs mt-1">{sketch.dimensions}</p>
                              </div>
                              <motion.div 
                                className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-600/20 to-blue-500/20 flex items-center justify-center group-hover:from-purple-600 group-hover:to-blue-500 transition-all duration-400 border border-purple-400/25 group-hover:border-purple-400 backdrop-blur-sm shadow-md ml-3 flex-shrink-0"
                                whileHover={{ rotate: 45, scale: 1.1 }}
                                whileTap={{ scale: 0.95 }}
                                aria-hidden="true"
                              >
                                <svg className="w-4 h-4 text-purple-400 group-hover:text-white transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                              </motion.div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.article>
                  ))}
                </AnimatePresence>
              </motion.div>
              
              {/* No results message */}
              {filteredSketches.length === 0 && (
                <motion.div 
                  className="text-center py-20"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="text-gray-400 text-lg mb-4">No artworks found in this category</div>
                  <button 
                    onClick={() => setActiveCategory("All")}
                    className="text-purple-400 hover:text-purple-300 transition-colors duration-300 underline"
                  >
                    View all artworks
                  </button>
                </motion.div>
              )}
            </div>
          </Section>
        </main>

        {/* Enhanced Modal */}
        <AnimatePresence>
          {selectedSketch && (
            <motion.div
              className="fixed inset-0 z-50 bg-black/95 backdrop-blur-3xl flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-y-auto"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeModal}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              role="dialog"
              aria-modal="true"
              aria-labelledby="modal-title"
              aria-describedby="modal-description"
            >
              <motion.div
                className="relative w-full max-w-7xl bg-gradient-to-br from-white/8 via-white/4 to-white/8 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden border border-white/15 backdrop-blur-xl my-4 sm:my-8"
                initial={{ scale: 0.9, opacity: 0, y: 40 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 40 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                onClick={(e) => e.stopPropagation()}
                style={{ maxHeight: 'calc(100vh - 2rem)' }}
              >
                <div className="flex flex-col lg:flex-row min-h-0">
                  {/* Image Section */}
                  <div className="flex-1 relative overflow-hidden bg-black min-h-[40vh] sm:min-h-[50vh] lg:min-h-[80vh] flex items-center justify-center">
                    {/* Double border frames */}
                    <div className="absolute inset-4 sm:inset-6 border-2 border-white/30 rounded-xl sm:rounded-2xl z-10 pointer-events-none shadow-inner"></div>
                    <div className="absolute inset-6 sm:inset-8 border border-white/20 rounded-lg sm:rounded-xl z-10 pointer-events-none"></div>
                    
                    {/* Loading indicator */}
                    {!imageLoaded && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <motion.div
                          className="w-10 h-10 border-2 border-purple-400 rounded-full border-t-transparent"
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          aria-label="Loading image"
                        />
                      </div>
                    )}
                    
                    <img
                      src={imageMap[selectedSketch.id]}
                      alt={`${selectedSketch.title} - ${selectedSketch.technique} artwork by Bushra`}
                      className={`max-w-full max-h-full object-contain p-4 sm:p-8 transition-opacity duration-400 ${
                        imageLoaded ? 'opacity-100' : 'opacity-0'
                      }`}
                      style={{ 
                        filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.4))',
                        maxHeight: 'calc(80vh - 2rem)'
                      }}
                      onLoad={() => setImageLoaded(true)}
                    />
                    
                    {/* Ambient glow */}
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-600/3 via-transparent to-blue-600/3 pointer-events-none"></div>
                  </div>

                  {/* Info Section */}
                  <div className="w-full lg:w-[420px] xl:w-[480px] p-6 sm:p-8 lg:p-12 xl:p-16 flex flex-col justify-between bg-gradient-to-b from-black/95 via-gray-900/90 to-black/95 backdrop-blur-xl border-t lg:border-t-0 lg:border-l border-white/15 overflow-y-auto">
                    <div>
                      {/* Category Badge */}
                      <motion.div 
                        className="inline-flex items-center px-4 py-2 sm:px-5 sm:py-3 bg-gradient-to-r from-purple-600/25 to-blue-500/25 border border-purple-400/35 rounded-full text-purple-200 text-xs sm:text-sm font-medium uppercase tracking-wider mb-6 sm:mb-8 backdrop-blur-sm shadow-md"
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                      >
                        <span className="w-2 h-2 bg-purple-300 rounded-full mr-2 sm:mr-3 animate-pulse"></span>
                        {selectedSketch.category}
                      </motion.div>
                      
                      {/* Title */}
                      <motion.h2 
                        id="modal-title"
                        className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-thin text-white mb-6 sm:mb-8 leading-tight"
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.3 }}
                      >
                        <GradientText gradient="from-white via-purple-100 to-white">
                          {selectedSketch.title}
                        </GradientText>
                      </motion.h2>
                      
                      {/* Metadata */}
                      <motion.div 
                        className="space-y-4 text-sm mb-8 sm:mb-10"
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.4 }}
                      >
                        <div className="flex justify-between items-center py-3 border-b border-white/15">
                          <span className="text-gray-400 font-medium tracking-wide">Date Created</span>
                          <span className="text-purple-100 font-light">{selectedSketch.date}</span>
                        </div>
                        <div className="flex justify-between items-center py-3 border-b border-white/15">
                          <span className="text-gray-400 font-medium tracking-wide">Medium</span>
                          <span className="text-purple-100 font-light">{selectedSketch.technique}</span>
                        </div>
                        <div className="flex justify-between items-center py-3 border-b border-white/15">
                          <span className="text-gray-400 font-medium tracking-wide">Dimensions</span>
                          <span className="text-purple-100 font-light">{selectedSketch.dimensions}</span>
                        </div>
                      </motion.div>
                      
                      {/* Description */}
                      <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.5 }}
                      >
                        <h3 className="text-purple-200 text-lg sm:text-xl font-light mb-4 sm:mb-6 tracking-wide">Artist's Vision</h3>
                        <p id="modal-description" className="text-gray-200 leading-relaxed text-sm sm:text-base lg:text-lg font-light">
                          {selectedSketch.description}
                        </p>
                      </motion.div>
                    </div>

                    {/* Featured Badge */}
                    {selectedSketch.featured && (
                      <motion.div 
                        className="mt-8 sm:mt-10 inline-flex items-center px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-purple-600 via-blue-500 to-cyan-600 text-white rounded-full text-base sm:text-lg font-medium shadow-lg shadow-purple-500/30 border border-purple-400/50"
                        initial={{ scale: 0, rotate: -90 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ delay: 0.6, type: "spring" }}
                      >
                        <svg className="w-5 h-5 sm:w-6 sm:h-6 mr-3 sm:mr-4" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        Featured Masterpiece
                      </motion.div>
                    )}
                  </div>
                </div>

                {/* Control Buttons */}
                <motion.button
                  onClick={closeModal}
                  className="absolute top-2 right-2 sm:top-4 sm:right-4 w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 bg-black/75 hover:bg-black/90 rounded-full flex items-center justify-center text-white transition-all duration-300 border border-white/25 hover:border-white/50 backdrop-blur-xl shadow-xl z-20 focus:outline-none focus:ring-2 focus:ring-purple-400"
                  whileHover={{ rotate: 90, scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 }}
                  aria-label="Close modal"
                >
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 md:w-7 md:h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </motion.button>

                {/* Navigation Buttons */}
                <motion.button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigateSketch('prev');
                  }}
                  className="absolute left-1 sm:left-2 md:left-4 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 bg-black/75 hover:bg-black/90 rounded-full flex items-center justify-center text-white transition-all duration-300 border border-white/25 hover:border-white/50 backdrop-blur-xl shadow-xl z-20 focus:outline-none focus:ring-2 focus:ring-purple-400"
                  whileHover={{ x: -6, scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 }}
                  aria-label="Previous artwork"
                >
                  <svg className="w-4 h-4 sm:w-6 sm:h-6 md:w-8 md:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
                  </svg>
                </motion.button>

                <motion.button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigateSketch('next');
                  }}
                  className="absolute right-1 sm:right-2 md:right-4 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 bg-black/75 hover:bg-black/90 rounded-full flex items-center justify-center text-white transition-all duration-300 border border-white/25 hover:border-white/50 backdrop-blur-xl shadow-xl z-20 focus:outline-none focus:ring-2 focus:ring-purple-400"
                  whileHover={{ x: 6, scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 }}
                  aria-label="Next artwork"
                >
                  <svg className="w-4 h-4 sm:w-6 sm:h-6 md:w-8 md:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
                  </svg>
                </motion.button>

                {/* Counter */}
                <motion.div 
                  className="absolute bottom-2 sm:bottom-4 left-1/2 -translate-x-1/2 px-4 sm:px-6 py-2 sm:py-3 bg-black/85 border border-white/30 rounded-full text-white text-xs sm:text-sm md:text-base backdrop-blur-xl shadow-xl z-20"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                  role="status"
                  aria-live="polite"
                >
                  <span className="font-light text-purple-200">
                    {filteredSketches.findIndex(s => s.id === selectedSketch.id) + 1}
                  </span>
                  <span className="text-gray-400 mx-2">of</span>
                  <span className="font-light text-purple-200">
                    {filteredSketches.length}
                  </span>
                </motion.div>

                {/* Mobile swipe hint */}
                <div className="absolute bottom-16 sm:bottom-20 left-1/2 -translate-x-1/2 text-gray-400 text-xs opacity-75 sm:hidden">
                  Swipe left/right to navigate
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>


      </div>
    </>
  );
};

export default PencilSketchGallery;