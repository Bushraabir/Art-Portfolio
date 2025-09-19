import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform, useInView } from 'framer-motion';

/**
 * Professional Acrylic Gallery Component
 * 
 * A responsive, interactive gallery showcasing acrylic paintings with:
 * - Advanced filtering and sorting capabilities
 * - Modal viewing with keyboard navigation
 * - Mobile-optimized touch interactions
 * - SEO-friendly structure with proper metadata
 * - Accessibility features and screen reader support
 * 
 * @author Artist Portfolio
 * @version 2.0
 */

// Import all actual images (keeping exact paths as requested)
import sketch1 from '../../assets/acrylic/1.jpg';
import sketch2 from '../../assets/acrylic/2.jpg';
import sketch3 from '../../assets/acrylic/3.jpg';
import sketch4 from '../../assets/acrylic/4.jpg';
import sketch5 from '../../assets/acrylic/5.jpg';
import sketch6 from '../../assets/acrylic/6.jpg';
import sketch7 from '../../assets/acrylic/7.jpg';
import sketch8 from '../../assets/acrylic/8.jpg';
import sketch9 from '../../assets/acrylic/9.jpg';

// Map images to IDs (keeping exact structure as requested)
const imageMap = {
  1: sketch1,
  2: sketch2,
  3: sketch3,
  4: sketch4,
  5: sketch5,
  6: sketch6,
  7: sketch7,
  8: sketch8,
  9: sketch9,
};

/**
 * Enhanced sketch data with comprehensive metadata for SEO
 * Each artwork includes detailed information for rich snippets and accessibility
 */
const sketchData = [
  { 
    id: 1, 
    title: "The Blue Mosque", 
    description: "The Blue Mosque in Istanbul, officially known as the Sultan Ahmed Mosque, is celebrated for its distinctive architectural features and rich history.", 
    date: "March, 2025",
    technique: "Canvas Painting",
    dimensions: "24 × 30 inches",
    category: "Architecture",
    featured: true,
    keywords: ["blue mosque", "istanbul", "architecture", "canvas painting", "religious art"],
    medium: "Acrylic on Canvas",
    year: 2025
  },
  { 
    id: 2, 
    title: "The Mystery", 
    description: "The fog in winter morning creates the sense of mystery in the forest along with a calm peaceful environment", 
    date: "February, 2025",
    technique: "Acrylic strokes",
    dimensions: "24 × 30 inches",
    category: "Nature",
    keywords: ["fog", "winter", "forest", "mystery", "landscape"],
    medium: "Acrylic on Canvas",
    year: 2025
  },
  { 
    id: 3, 
    title: "Pains in Blood", 
    description: "Dews in the flowers symbolizes blood and pain being shed on the life-mirror", 
    date: "March 17, 2023",
    technique: "Soft Graphite",
    dimensions: "12 × 16 inches",
    category: "Light Study",
    keywords: ["flowers", "dew", "symbolism", "life", "emotions"],
    medium: "Graphite on Paper",
    year: 2023
  },
  { 
    id: 4, 
    title: "Boston", 
    description: "I tried to create a jeans texture using acrylics on the white canvas and then used white paints to draw the buildings", 
    date: "April, 2023",
    technique: "Mixed Media",
    dimensions: "24 × 30 inches",
    category: "Texture Study",
    keywords: ["boston", "cityscape", "texture", "buildings", "urban art"],
    medium: "Mixed Media on Canvas",
    year: 2023
  },
  { 
    id: 5, 
    title: "The Storm", 
    description: "The urge to fight even when the storm is at its peak, ship is sinking", 
    date: "May, 2019",
    technique: "Canvas painting",
    dimensions: "24 × 30 inches",
    category: "Ship",
    featured: true,
    keywords: ["storm", "ship", "struggle", "maritime", "dramatic"],
    medium: "Acrylic on Canvas",
    year: 2019
  },
  { 
    id: 6, 
    title: "Creativity", 
    description: "Art and colors along with pen makes the creativity in my mind", 
    date: "June 14, 2023",
    technique: "Graphite & Charcoal",
    dimensions: "22 × 28 inches",
    category: "Abstract",
    keywords: ["creativity", "abstract", "artistic process", "imagination"],
    medium: "Graphite & Charcoal on Paper",
    year: 2023
  },
  { 
    id: 7, 
    title: "Flower Abstraction", 
    description: "Abstract color splashes and strokes to create the beauty of flower", 
    date: "July, 2018",
    technique: "Canvas Painting",
    dimensions: "24 × 30 inches",
    category: "Abstract",
    keywords: ["flowers", "abstract", "color splash", "beauty", "nature"],
    medium: "Acrylic on Canvas",
    year: 2018
  },
  { 
    id: 8, 
    title: "The Bridge", 
    description: "A bridge connecting to the way to heaven", 
    date: "August, 2024",
    technique: "Graphite Blend",
    dimensions: "6 inches",
    category: "Nature",
    keywords: ["bridge", "heaven", "spiritual", "connection", "landscape"],
    medium: "Graphite on Paper",
    year: 2024
  },
  { 
    id: 9, 
    title: "Eternal Dawn: When Shadows Surrender", 
    description: "Sunrise in forest removing the darkness and bringing the light", 
    date: "September, 2023",
    technique: "Canvas Painting",
    dimensions: "24 × 30 inches",
    category: "Nature",
    keywords: ["sunrise", "forest", "light", "darkness", "dawn"],
    medium: "Acrylic on Canvas",
    year: 2023
  },
];

// Enhanced categories with proper capitalization
const categories = ["All", "Nature", "Abstract", "Architecture", "Ship", "Texture Study", "Light Study"];

/**
 * Animated background elements component
 * Creates ambient lighting effects and visual depth
 */
const BackgroundElements = React.memo(() => {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
      {/* Ambient gradient orbs for visual appeal */}
      <motion.div
        className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-br from-purple-600/20 via-blue-600/15 to-transparent rounded-full blur-3xl"
        animate={{ 
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
          x: [0, 50, 0],
          y: [0, -30, 0]
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      
      <motion.div
        className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-gradient-to-br from-cyan-600/20 via-blue-600/15 to-transparent rounded-full blur-3xl"
        animate={{ 
          scale: [1.2, 1, 1.2],
          opacity: [0.4, 0.6, 0.4],
          x: [0, -40, 0],
          y: [0, 40, 0]
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
      />
      
      {/* Subtle geometric pattern overlay */}
      <div className="absolute inset-0 opacity-[0.02]">
        <div 
          className="w-full h-full"
          style={{
            backgroundImage: `
              radial-gradient(circle at 25% 25%, white 1px, transparent 1px),
              radial-gradient(circle at 75% 75%, white 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px, 60px 60px',
            backgroundPosition: '0 0, 30px 30px'
          }}
        />
      </div>
      
      {/* Floating particles for atmosphere */}
      {[...Array(12)].map((_, i) => (
        <motion.div
          key={`particle-${i}`}
          className="absolute w-1 h-1 bg-white/20 rounded-full"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [0, -100, 0],
            opacity: [0.2, 0.8, 0.2],
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
});

/**
 * Scroll progress indicator component
 * Provides visual feedback for page scroll position
 */
const ScrollProgress = React.memo(() => {
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
});

/**
 * Reusable section wrapper with intersection observer animations
 * Handles entrance animations for better performance
 */
const Section = ({ children, className = "", delay = 0, id = "" }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  
  return (
    <motion.section
      id={id}
      ref={ref}
      initial={{ opacity: 0, y: 60 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 60 }}
      transition={{ duration: 0.8, delay, ease: [0.25, 0.1, 0.25, 1] }}
      className={`relative ${className}`}
    >
      {children}
    </motion.section>
  );
};

/**
 * Enhanced gradient text component with accessibility
 * Provides visual emphasis while maintaining readability
 */
const GradientText = ({ children, className = "", gradient = "from-white via-purple-200 to-blue-200" }) => {
  return (
    <span 
      className={`bg-gradient-to-r ${gradient} bg-clip-text text-transparent ${className}`}
      style={{ WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
    >
      {children}
    </span>
  );
};

/**
 * Main Gallery Component
 * Handles state management, filtering, and user interactions
 */
const AcrylicColor = () => {
  // State management
  const [selectedSketch, setSelectedSketch] = useState(null);
  const [activeCategory, setActiveCategory] = useState("All");
  const [sortBy, setSortBy] = useState("date");
  const [isMounted, setIsMounted] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  
  // Scroll-based animations
  const { scrollYProgress } = useScroll();
  const headerOpacity = useTransform(scrollYProgress, [0, 0.1], [1, 0.9]);

  // Touch interaction constants
  const minSwipeDistance = 50;

  /**
   * Filter and sort sketches based on current selection
   * Optimized for performance with useMemo equivalent logic
   */
  const filteredSketches = React.useMemo(() => {
    return sketchData
      .filter(sketch => activeCategory === "All" || sketch.category === activeCategory)
      .sort((a, b) => {
        if (sortBy === "date") return new Date(b.date) - new Date(a.date);
        if (sortBy === "title") return a.title.localeCompare(b.title);
        if (sortBy === "featured") return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
        return 0;
      });
  }, [activeCategory, sortBy]);

  /**
   * Component initialization and cleanup
   * Handles viewport, scroll behavior, and loading states
   */
  useEffect(() => {
    document.body.style.overflowY = 'auto';
    document.documentElement.style.scrollBehavior = 'smooth';
    
    const updateVH = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    };
    
    updateVH();
    window.addEventListener('resize', updateVH);
    
    // Simulate loading for better UX
    const timer = setTimeout(() => {
      setIsMounted(true);
      setIsLoading(false);
    }, 800);
    
    return () => {
      window.removeEventListener('resize', updateVH);
      document.body.style.overflow = 'auto';
      clearTimeout(timer);
    };
  }, []);

  /**
   * Modal interaction handlers
   * Manages image viewing, navigation, and accessibility
   */
  const openModal = (sketch) => {
    setSelectedSketch(sketch);
    setImageLoaded(false);
    document.body.style.overflow = 'hidden';
    // Announce to screen readers
    const announcement = `Opened artwork: ${sketch.title}. Use arrow keys to navigate, escape to close.`;
    // Create temporary element for screen reader announcement
    const announcement_elem = document.createElement('div');
    announcement_elem.setAttribute('aria-live', 'polite');
    announcement_elem.setAttribute('aria-atomic', 'true');
    announcement_elem.style.position = 'absolute';
    announcement_elem.style.left = '-10000px';
    announcement_elem.textContent = announcement;
    document.body.appendChild(announcement_elem);
    setTimeout(() => document.body.removeChild(announcement_elem), 1000);
  };

  const closeModal = () => {
    setSelectedSketch(null);
    setImageLoaded(false);
    document.body.style.overflow = 'auto';
  };

  /**
   * Navigate between artworks in modal view
   * Supports both keyboard and touch interactions
   */
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

  /**
   * Touch gesture handlers for mobile navigation
   * Enables swipe navigation in modal view
   */
  const onTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe && selectedSketch) {
      navigateSketch('next');
    }
    if (isRightSwipe && selectedSketch) {
      navigateSketch('prev');
    }
  };

  /**
   * Keyboard navigation event handler
   * Provides accessibility compliance and improved UX
   */
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') closeModal();
      if (e.key === 'ArrowRight' && selectedSketch) navigateSketch('next');
      if (e.key === 'ArrowLeft' && selectedSketch) navigateSketch('prev');
      if (e.key === 'Enter' && e.target.classList.contains('gallery-item')) {
        e.target.click();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedSketch, filteredSketches]);

  /**
   * Generate structured data for SEO
   * Creates rich snippets for search engines
   */
  const generateStructuredData = () => {
    const structuredData = {
      "@context": "https://schema.org",
      "@type": "ImageGallery",
      "name": "Acrylic Paintings Gallery - Colors of Imagination",
      "description": "Professional gallery showcasing original acrylic paintings featuring nature, architecture, and abstract artworks.",
      "url": window.location.href,
      "image": filteredSketches.map(sketch => ({
        "@type": "ImageObject",
        "name": sketch.title,
        "description": sketch.description,
        "contentUrl": imageMap[sketch.id],
        "creator": {
          "@type": "Person",
          "name": "Artist"
        },
        "dateCreated": sketch.date,
        "artMedium": sketch.medium,
        "artworkSurface": "Canvas",
        "keywords": sketch.keywords?.join(", ")
      }))
    };

    return (
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
    );
  };

  // Loading screen
  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <motion.div
          className="text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <motion.div
            className="w-16 h-16 border-4 border-purple-500/30 border-t-purple-500 rounded-full mx-auto mb-4"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
          <p className="text-gray-400 text-lg">Loading Gallery...</p>
        </motion.div>
      </div>
    );
  }

  if (!isMounted) return null;

  return (
    <>
      {/* SEO Meta Tags */}
      <head>
        <title>Acrylic Paintings Gallery - Colors of Imagination | Professional Art Portfolio</title>
        <meta name="description" content="Explore a stunning collection of original acrylic paintings featuring landscapes, architecture, and abstract art. Professional gallery with high-quality artwork showcasing creativity and artistic vision." />
        <meta name="keywords" content="acrylic paintings, art gallery, canvas art, landscape paintings, abstract art, architecture art, professional artist, art portfolio" />
        <meta name="author" content="Professional Artist" />
        <meta property="og:title" content="Acrylic Paintings Gallery - Colors of Imagination" />
        <meta property="og:description" content="Discover original acrylic paintings in this professional art gallery. From serene landscapes to vibrant abstracts." />
        <meta property="og:type" content="website" />
        <meta property="og:image" content={imageMap[1]} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Acrylic Paintings Gallery - Colors of Imagination" />
        <meta name="twitter:description" content="Professional gallery showcasing original acrylic paintings" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <link rel="canonical" href={window.location.href} />
      </head>

      {/* Structured Data */}
      {generateStructuredData()}

      <div className="min-h-screen bg-black text-white relative overflow-x-hidden">
        <ScrollProgress />
        
        {/* Background Elements */}
        <BackgroundElements />
        
        {/* Skip Navigation Link for Accessibility */}
        <a 
          href="#main-content" 
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-purple-600 text-white px-4 py-2 rounded-md z-50"
        >
          Skip to main content
        </a>
        
        {/* Main Content */}
        <main id="main-content" className="relative z-10">
          {/* Hero Section */}
          <Section className="px-4 sm:px-6 pt-20 pb-16" id="hero">
            <motion.div
              className="max-w-6xl mx-auto text-center"
              style={{ opacity: headerOpacity }}
            >
              <motion.header
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="mb-16"
              >
                <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl font-bold tracking-tight leading-tight mb-8">
                  <GradientText 
                    gradient="from-purple-400 via-blue-400 to-cyan-400"
                    className="block"
                  >
                    Acrylics
                  </GradientText>
                </h1>
                
                <motion.div
                  className="text-lg sm:text-xl md:text-2xl lg:text-3xl text-gray-300 font-light mb-8"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.8, delay: 0.6 }}
                >
                  <span className="relative inline-block">
                    Colors of Imagination
                    <motion.span 
                      className="absolute -bottom-1 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-purple-400 to-transparent"
                      initial={{ scaleX: 0, opacity: 0 }}
                      animate={{ scaleX: 1, opacity: 0.8 }}
                      transition={{ delay: 1.2, duration: 1.5 }}
                    />
                  </span>
                </motion.div>

                <motion.p
                  className="text-base sm:text-lg text-gray-400 max-w-2xl mx-auto leading-relaxed"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.8 }}
                >
                  Explore a curated collection of original acrylic paintings that capture the essence of nature, architecture, and abstract imagination. Each piece tells a unique story through vibrant colors and masterful techniques.
                </motion.p>
              </motion.header>
            </motion.div>
          </Section>

          {/* Controls Section */}
          <Section className="mb-16 px-4 sm:px-6" delay={0.2} id="gallery-controls">
            <div className="max-w-7xl mx-auto">
              <motion.div
                className="relative overflow-hidden rounded-2xl sm:rounded-3xl backdrop-blur-2xl bg-gradient-to-br from-white/10 via-white/5 to-white/10 border border-white/20 shadow-[0_20px_80px_-15px_rgba(139,92,246,0.4)] p-4 sm:p-6 lg:p-8"
                whileHover={{ scale: 1.01 }}
                transition={{ duration: 0.4 }}
                role="region"
                aria-label="Gallery controls"
              >
                <div className="flex flex-col lg:flex-row items-center justify-between gap-6 lg:gap-8">
                  {/* Category Filter */}
                  <div className="flex flex-wrap gap-2 sm:gap-3 justify-center lg:justify-start">
                    <span className="sr-only">Filter by category:</span>
                    {categories.map((category, index) => (
                      <motion.button
                        key={category}
                        onClick={() => setActiveCategory(category)}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className={`px-3 sm:px-4 lg:px-6 py-2 sm:py-3 rounded-full text-xs sm:text-sm font-medium transition-all duration-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 ${
                          activeCategory === category
                            ? 'bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 text-white shadow-lg shadow-purple-500/30 border border-purple-400/50'
                            : 'bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white border border-white/10 hover:border-purple-400/30'
                        }`}
                        whileHover={{ scale: 1.05, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                        aria-pressed={activeCategory === category}
                        aria-label={`Filter by ${category} category`}
                      >
                        {category}
                      </motion.button>
                    ))}
                  </div>

                  {/* Sort Control */}
                  <div className="flex items-center gap-4">
                    <label htmlFor="sort-select" className="sr-only">Sort artworks by:</label>
                    <select
                      id="sort-select"
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="bg-white/5 border border-purple-400/30 rounded-xl px-3 sm:px-4 lg:px-6 py-2 sm:py-3 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-400/50 backdrop-blur-sm text-white min-w-[140px]"
                      aria-label="Sort gallery by"
                    >
                      <option value="date" className="bg-black">Sort by Date</option>
                      <option value="title" className="bg-black">Sort by Title</option>
                      <option value="featured" className="bg-black">Sort by Featured</option>
                    </select>
                    
                    {/* Results Count */}
                    <div className="hidden sm:flex items-center text-sm text-gray-400 bg-white/5 px-4 py-2 rounded-full border border-white/10">
                      <span className="font-medium text-purple-300">{filteredSketches.length}</span>
                      <span className="ml-1">artworks</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </Section>

          {/* Gallery Section */}
          <Section className="px-4 sm:px-6 pb-32" delay={0.4} id="gallery-grid">
            <div className="max-w-8xl mx-auto">
              <motion.div 
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8 lg:gap-12"
                layout
                role="grid"
                aria-label="Acrylic paintings gallery"
              >
                <AnimatePresence mode="popLayout">
                  {filteredSketches.map((sketch, index) => (
                    <motion.article
                      key={sketch.id}
                      layout
                      initial={{ opacity: 0, scale: 0.8, y: 60 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.8, y: 60 }}
                      transition={{ 
                        duration: 0.8, 
                        delay: index * 0.1,
                        type: "spring",
                        stiffness: 60,
                        damping: 20
                      }}
                      whileHover={{ 
                        y: -16, 
                        transition: { duration: 0.4, type: "spring", stiffness: 300 } 
                      }}
                      className="group cursor-pointer gallery-item"
                      onClick={() => openModal(sketch)}
                      onKeyPress={(e) => e.key === 'Enter' && openModal(sketch)}
                      tabIndex={0}
                      role="gridcell"
                      aria-label={`View artwork: ${sketch.title}`}
                    >
                      <div className="relative">
                        {/* Outer Glow Effect */}
                        <div className="absolute -inset-4 sm:-inset-6 bg-gradient-to-r from-purple-600/10 via-blue-400/5 to-cyan-600/10 rounded-2xl sm:rounded-3xl blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                        
                        {/* Main Artwork Frame */}
                        <div className="relative bg-gradient-to-br from-white/10 via-white/5 to-white/10 rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl shadow-black/50 border border-white/20 group-hover:border-white/40 transition-all duration-500 backdrop-blur-sm">
                          
                          {/* Featured Badge */}
                          {sketch.featured && (
                            <motion.div 
                              className="absolute top-4 sm:top-6 left-4 sm:left-6 z-20"
                              initial={{ scale: 0, rotate: -180 }}
                              animate={{ scale: 1, rotate: 0 }}
                              transition={{ delay: index * 0.1 + 0.6, type: "spring" }}
                            >
                              <div className="bg-gradient-to-r from-purple-600 via-blue-500 to-cyan-600 text-white text-xs px-3 sm:px-4 py-1 sm:py-2 rounded-full font-medium shadow-lg shadow-purple-500/40 border border-purple-400/60 backdrop-blur-sm flex items-center gap-1 sm:gap-2">
                                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                                <span className="hidden sm:inline">Featured</span>
                              </div>
                            </motion.div>
                          )}
                          
                          {/* Image Container with Enhanced Accessibility */}
                          <div className="relative overflow-hidden bg-black">
                            {/* Decorative Border Frames */}
                            <div className="absolute inset-2 sm:inset-3 border-2 border-white/30 rounded-xl sm:rounded-2xl z-10 pointer-events-none group-hover:border-white/50 transition-colors duration-500" aria-hidden="true"></div>
                            <div className="absolute inset-3 sm:inset-5 border border-white/20 rounded-lg sm:rounded-xl z-10 pointer-events-none group-hover:border-white/40 transition-colors duration-500" aria-hidden="true"></div>
                            
                            {/* Artwork Image */}
                            <img
                              src={imageMap[sketch.id]}
                              alt={`${sketch.title} - ${sketch.description}`}
                              className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110 filter group-hover:contrast-110 group-hover:brightness-105"
                              style={{ 
                                minHeight: "300px",
                                aspectRatio: "4/5",
                                filter: 'drop-shadow(0 10px 30px rgba(0,0,0,0.3))'
                              }}
                              loading="lazy"
                            />
                            
                            {/* Hover Overlay with Information */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-purple-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-600"></div>
                            
                            {/* Hover Content - Desktop Only */}
                            <div className="absolute inset-0 p-4 sm:p-6 lg:p-8 flex flex-col justify-end opacity-0 group-hover:opacity-100 transition-all duration-600 transform translate-y-12 group-hover:translate-y-0 hidden md:flex">
                              <div className="text-purple-300 text-xs sm:text-sm font-medium mb-2 sm:mb-3 tracking-wide uppercase">
                                {sketch.category}
                              </div>
                              <h3 className="text-white text-lg sm:text-xl lg:text-2xl font-light mb-2 sm:mb-4 leading-tight">
                                {sketch.title}
                              </h3>
                              <p className="text-gray-300 text-xs sm:text-sm leading-relaxed line-clamp-2 sm:line-clamp-3 mb-2 sm:mb-4">
                                {sketch.description}
                              </p>
                              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center text-xs text-gray-400 pt-2 sm:pt-3 border-t border-white/20 gap-1 sm:gap-0">
                                <span className="font-medium">{sketch.date}</span>
                                <span className="italic">{sketch.technique}</span>
                              </div>
                            </div>
                          </div>

                          {/* Info Panel - Always Visible */}
                          <div className="p-4 sm:p-6 bg-gradient-to-r from-black/90 via-gray-900/80 to-black/90 backdrop-blur-xl border-t border-white/10">
                            <div className="flex justify-between items-center gap-4">
                              <div className="flex-1 min-w-0">
                                <h4 className="text-white font-light text-base sm:text-lg mb-1 truncate">{sketch.title}</h4>
                                <p className="text-gray-400 text-xs sm:text-sm truncate">{sketch.technique}</p>
                                <p className="text-gray-500 text-xs mt-1 hidden sm:block">{sketch.dimensions}</p>
                              </div>
                              
                              {/* View Button */}
                              <motion.button 
                                className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-r from-purple-600/20 to-blue-500/20 flex items-center justify-center group-hover:from-purple-600 group-hover:to-blue-500 transition-all duration-500 border border-purple-400/30 group-hover:border-purple-400 backdrop-blur-sm shadow-lg flex-shrink-0"
                                whileHover={{ rotate: 45, scale: 1.1 }}
                                whileTap={{ scale: 0.95 }}
                                aria-label={`View ${sketch.title} in detail`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openModal(sketch);
                                }}
                              >
                                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400 group-hover:text-white transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                              </motion.button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.article>
                  ))}
                </AnimatePresence>
              </motion.div>
              
              {/* No Results Message */}
              {filteredSketches.length === 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center py-16"
                >
                  <div className="text-gray-400 text-xl mb-4">No artworks found</div>
                  <p className="text-gray-500">Try adjusting your filters to see more results.</p>
                </motion.div>
              )}
            </div>
          </Section>
        </main>

        {/* Enhanced Modal with Full Accessibility */}
        <AnimatePresence>
          {selectedSketch && (
            <motion.div
              className="fixed inset-0 z-50 bg-black/96 backdrop-blur-3xl flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeModal}
              onTouchStart={onTouchStart}
              onTouchMove={onTouchMove}
              onTouchEnd={onTouchEnd}
              role="dialog"
              aria-modal="true"
              aria-labelledby="modal-title"
              aria-describedby="modal-description"
            >
              <motion.div
                className="relative w-full max-w-7xl bg-gradient-to-br from-white/10 via-white/5 to-white/10 rounded-2xl sm:rounded-3xl shadow-[0_25px_100px_-15px_rgba(0,0,0,0.8)] overflow-hidden border border-white/20 backdrop-blur-xl max-h-[95vh] sm:max-h-[90vh]"
                initial={{ scale: 0.85, opacity: 0, y: 60 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.85, opacity: 0, y: 60 }}
                transition={{ type: "spring", damping: 30, stiffness: 300 }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex flex-col lg:flex-row h-full max-h-[95vh] sm:max-h-[90vh]">
                  {/* Image Section */}
                  <div className="flex-1 relative overflow-hidden bg-black min-h-[40vh] sm:min-h-[50vh] lg:min-h-[80vh] flex items-center justify-center">
                    {/* Decorative Border Frames */}
                    <div className="absolute inset-4 sm:inset-6 border-2 border-white/40 rounded-xl sm:rounded-2xl z-10 pointer-events-none shadow-inner" aria-hidden="true"></div>
                    <div className="absolute inset-6 sm:inset-8 border border-white/30 rounded-lg sm:rounded-xl z-10 pointer-events-none" aria-hidden="true"></div>
                    
                    {/* Loading Indicator */}
                    {!imageLoaded && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <motion.div
                          className="w-12 h-12 border-2 border-purple-400 rounded-full border-t-transparent"
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        />
                      </div>
                    )}
                    
                    {/* Main Artwork Image */}
                    <img
                      src={imageMap[selectedSketch.id]}
                      alt={`${selectedSketch.title} - ${selectedSketch.description}`}
                      className={`max-w-full max-h-full object-contain p-4 sm:p-8 transition-opacity duration-500 ${
                        imageLoaded ? 'opacity-100' : 'opacity-0'
                      }`}
                      style={{ 
                        filter: 'drop-shadow(0 25px 50px rgba(0,0,0,0.5))',
                        maxHeight: 'calc(95vh - 8rem)'
                      }}
                      onLoad={() => setImageLoaded(true)}
                    />
                    
                    {/* Ambient Background Glow */}
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-600/5 via-transparent to-blue-600/5 pointer-events-none" aria-hidden="true"></div>
                  </div>

                  {/* Information Panel */}
                  <div className="w-full lg:w-[420px] xl:w-[480px] p-6 sm:p-8 lg:p-12 xl:p-16 flex flex-col justify-between bg-gradient-to-b from-black/98 via-gray-900/95 to-black/98 backdrop-blur-xl border-t lg:border-t-0 lg:border-l border-white/20 overflow-y-auto">
                    <div>
                      {/* Category Badge */}
                      <motion.div 
                        className="inline-flex items-center px-4 sm:px-5 py-2 sm:py-3 bg-gradient-to-r from-purple-600/30 to-blue-500/30 border border-purple-400/40 rounded-full text-purple-200 text-xs sm:text-sm font-medium uppercase tracking-wider mb-6 sm:mb-8 backdrop-blur-sm shadow-lg"
                        initial={{ x: -30, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.3 }}
                      >
                        <span className="w-2 h-2 bg-purple-300 rounded-full mr-2 sm:mr-3 animate-pulse" aria-hidden="true"></span>
                        {selectedSketch.category}
                      </motion.div>
                      
                      {/* Artwork Title */}
                      <motion.h2 
                        id="modal-title"
                        className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-thin text-white mb-6 sm:mb-8 leading-tight"
                        initial={{ y: 30, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.4 }}
                      >
                        <GradientText gradient="from-white via-purple-100 to-white">
                          {selectedSketch.title}
                        </GradientText>
                      </motion.h2>
                      
                      {/* Artwork Metadata */}
                      <motion.div 
                        className="space-y-3 sm:space-y-5 text-sm mb-8 sm:mb-10"
                        initial={{ y: 30, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.5 }}
                      >
                        <div className="flex justify-between items-center py-3 sm:py-4 border-b border-white/20">
                          <span className="text-gray-400 font-medium tracking-wide">Date Created</span>
                          <span className="text-purple-100 font-light">{selectedSketch.date}</span>
                        </div>
                        <div className="flex justify-between items-center py-3 sm:py-4 border-b border-white/20">
                          <span className="text-gray-400 font-medium tracking-wide">Medium</span>
                          <span className="text-purple-100 font-light">{selectedSketch.technique}</span>
                        </div>
                        <div className="flex justify-between items-center py-3 sm:py-4 border-b border-white/20">
                          <span className="text-gray-400 font-medium tracking-wide">Dimensions</span>
                          <span className="text-purple-100 font-light">{selectedSketch.dimensions}</span>
                        </div>
                      </motion.div>
                      
                      {/* Artist's Description */}
                      <motion.div
                        initial={{ y: 30, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.6 }}
                      >
                        <h3 className="text-purple-200 text-lg sm:text-xl font-light mb-4 sm:mb-6 tracking-wide">Artist's Vision</h3>
                        <p 
                          id="modal-description"
                          className="text-gray-200 leading-relaxed text-sm sm:text-base lg:text-lg font-light"
                        >
                          {selectedSketch.description}
                        </p>
                      </motion.div>
                    </div>

                    {/* Featured Badge - Bottom */}
                    {selectedSketch.featured && (
                      <motion.div 
                        className="mt-8 sm:mt-10 inline-flex items-center px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-purple-600 via-blue-500 to-cyan-600 text-white rounded-full text-base sm:text-lg font-medium shadow-lg shadow-purple-500/40 border border-purple-400/60"
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ delay: 0.8, type: "spring" }}
                      >
                        <svg className="w-5 h-5 sm:w-6 sm:h-6 mr-3 sm:mr-4" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        Featured Masterpiece
                      </motion.div>
                    )}
                  </div>
                </div>

                {/* Modal Control Buttons */}
                {/* Close Button */}
                <motion.button
                  onClick={closeModal}
                  className="absolute top-2 sm:top-4 right-2 sm:right-4 w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 bg-black/80 hover:bg-black/95 rounded-full flex items-center justify-center text-white transition-all duration-300 border border-white/30 hover:border-white/60 backdrop-blur-xl shadow-2xl z-20 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                  whileHover={{ rotate: 90, scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.7 }}
                  aria-label="Close modal"
                >
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 md:w-7 md:h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </motion.button>

                {/* Previous Button */}
                <motion.button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigateSketch('prev');
                  }}
                  className="absolute left-1 sm:left-2 md:left-4 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 bg-black/80 hover:bg-black/95 rounded-full flex items-center justify-center text-white transition-all duration-300 border border-white/30 hover:border-white/60 backdrop-blur-xl shadow-2xl z-20 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                  whileHover={{ x: -8, scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.8 }}
                  aria-label="Previous artwork"
                >
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
                  </svg>
                </motion.button>

                {/* Next Button */}
                <motion.button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigateSketch('next');
                  }}
                  className="absolute right-1 sm:right-2 md:right-4 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 bg-black/80 hover:bg-black/95 rounded-full flex items-center justify-center text-white transition-all duration-300 border border-white/30 hover:border-white/60 backdrop-blur-xl shadow-2xl z-20 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                  whileHover={{ x: 8, scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.8 }}
                  aria-label="Next artwork"
                >
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
                  </svg>
                </motion.button>

                {/* Navigation Counter */}
                <motion.div 
                  className="absolute bottom-2 sm:bottom-4 left-1/2 -translate-x-1/2 px-4 sm:px-6 py-2 sm:py-3 bg-black/90 border border-white/40 rounded-full text-white text-xs sm:text-sm md:text-base backdrop-blur-xl shadow-2xl z-20"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.9 }}
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

                {/* Mobile Swipe Hint */}
                <motion.div
                  className="absolute bottom-16 sm:bottom-20 left-1/2 -translate-x-1/2 text-gray-400 text-xs text-center sm:hidden"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.5 }}
                >
                  Swipe left or right to navigate
                </motion.div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer with SEO Information */}
        <footer className="relative z-10 bg-gradient-to-r from-black via-gray-900/95 to-black backdrop-blur-xl border-t border-white/10 py-12 px-4 sm:px-6">
          <div className="max-w-6xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h3 className="text-xl sm:text-2xl font-light text-white mb-4">
                <GradientText gradient="from-purple-400 to-blue-400">
                  Acrylic Gallery Collection
                </GradientText>
              </h3>
              <p className="text-gray-400 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed mb-6">
                A curated showcase of original acrylic paintings featuring diverse themes from architectural marvels to abstract expressions. Each piece represents a unique artistic journey through color, texture, and imagination.
              </p>
              
              {/* Gallery Statistics */}
              <div className="flex flex-wrap justify-center gap-6 sm:gap-8 text-sm text-gray-300">
                <div className="text-center">
                  <div className="text-purple-400 font-semibold text-lg">{sketchData.length}</div>
                  <div>Artworks</div>
                </div>
                <div className="text-center">
                  <div className="text-blue-400 font-semibold text-lg">{categories.length - 1}</div>
                  <div>Categories</div>
                </div>
                <div className="text-center">
                  <div className="text-cyan-400 font-semibold text-lg">{sketchData.filter(s => s.featured).length}</div>
                  <div>Featured</div>
                </div>
              </div>
            </motion.div>
          </div>
        </footer>
      </div>
    </>
  );
};

export default AcrylicColor;