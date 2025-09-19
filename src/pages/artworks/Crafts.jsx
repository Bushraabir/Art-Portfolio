import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform, useInView } from 'framer-motion';

// Import all your actual images (keeping exact paths)
import sketch1 from '../../assets/crafts/1.jpg';
import sketch3 from '../../assets/crafts/3.jpg';
import sketch4 from '../../assets/crafts/4.jpg';
import sketch5 from '../../assets/crafts/5.jpg';
import sketch6 from '../../assets/crafts/6.jpg';
import sketch8 from '../../assets/crafts/8.jpg';
import sketch9 from '../../assets/crafts/9.jpg';
import sketch10 from '../../assets/crafts/10.jpg';


// Map images to IDs (keeping exact structure)
const imageMap = {
  1: sketch1,
  3: sketch3,
  4: sketch4,
  5: sketch5,
  6: sketch6,
  8: sketch8,
  9: sketch9,
  10: sketch10,

};

// Enhanced sketch data with more artistic descriptions
const sketchData = [
  { 
    id: 1, 
    title: "Lines and Resonance", 
    description: "I made a line composition and then created resoace from it. ", 
    date: "October, 2024",
    technique: "Modeling with Plastic-wood",
    dimensions: "30 × 30 x 6 inches",
    category: "Composition",
    featured: true
  },

  { 
    id: 3, 
    title: "Conversion of dot composition and line composition", 
    description: "Collecting natural Photos, I created the dot composition, then converted into line composition then eventually convered into a 3d line and resonance using 3mm platic wood", 
    date: "October, 2024",
    technique: "Modeling with Plastic-wood",
    dimensions: "30 × 30 x 6 inches",
    category: "Composition",
    featured: true
  },
  { 
    id: 4, 
    title: "Dot Compositions", 
    description: "Collected pictures from the nature to find compositions in them, then sketeched out on plastic wood and after that made a 3d model with bamboo sticks and cork sheet.I represented the dots using the negative spaces.", 
    date: "August, 2025",
    technique: "Pastic wood, Bamboo sticks & Cork sheet",
    dimensions: "24 × 24 x 5 inches",
    category: "Composition"
  },
  { 
    id: 5, 
    title: "Anxiety", 
    description: "Here I tried to give the intengible form of anxiety into a tangible form, the shap corners and the floating state creates the anxiety of mind. It is made with 5 mm black plastic wood", 
    date: "October, 2025",
    technique: "Technical Pencil",
    dimensions: "12 × 12 x 12 inches",
    category: "Abstruct",
    featured: true
  },
  { 
    id: 6, 
    title: "Fear of being noticed", 
    description: "We often have the thinking that everyone around us is noticing our every steps, so we often hide ourself.But all these are created from out brain, no one is actually noticing us. So I made this artwork to represent this thinking.", 
    date: "December, 2024",
    technique: "Clay Sculpting and wiring",
    dimensions: "12 × 12 x 9 inches",
    category: "Clay Sculpture"
  },

  { 
    id: 8, 
    title: "Crows and electric poles", 
    description: "I created the penholder with tissue mesh and one-time used plastic glass. there are crows sitting in he electric poles, a pair sitting together, a pair flying, one bird sitting along--basically representing the different span of human life", 
    date: "April, 2024",
    technique: "Tissue mesh & Plastic",
    dimensions: "12 × 18 x 12 inches",
    category: "Pen Holder"
  },
  { 
    id: 9, 
    title: "Lyrics on Pen-holder", 
    description: "Calligraphy art on pen-holder. I made this pen-holder with used bottle and then wrote some lyrics on it with a Acrylic Colors", 
    date: "April, 2022",
    technique: "Calligraphy & Acrylic",
    dimensions: " 4 × 4 x 7 inches",
    category: "Abstract",
    featured: true
  },
  { 
    id: 10, 
    title: "The battle", 
    description: "A clay model of chess with something different in colors. Each chess piece ishand -crafted and designed by my own.", 
    date: "May, 2025",
    technique: "Clay Sculpting",
    dimensions: "16 × 16 x 5 inches",
    category: "Clay Sculpture",
    featured: true
  },

];

const categories = ["All", "Composition", "Abstruct", "Clay Sculpture", "Pen Holder"];

// Background elements matching AboutMe theme
const BackgroundElements = () => {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {/* Animated gradient orbs */}
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
      
      {/* Geometric patterns */}
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
      
      {/* Floating geometric shapes */}
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={i}
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
};

// Enhanced scroll progress indicator
const ScrollProgress = () => {
  const { scrollYProgress } = useScroll();
  const scaleX = useTransform(scrollYProgress, [0, 1], [0, 1]);
  
  return (
    <motion.div
      className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-500 transform-gpu z-50"
      style={{ scaleX, transformOrigin: '0%' }}
    />
  );
};

// Section wrapper with enhanced animations
const Section = ({ children, className = "", delay = 0 }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  
  return (
    <motion.section
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

// Enhanced gradient text component
const GradientText = ({ children, className = "", gradient = "from-white via-purple-200 to-blue-200" }) => {
  return (
    <span className={`bg-gradient-to-r ${gradient} bg-clip-text text-transparent ${className}`}>
      {children}
    </span>
  );
};

const crafts = () => {
  const [selectedSketch, setSelectedSketch] = useState(null);
  const [activeCategory, setActiveCategory] = useState("All");
  const [sortBy, setSortBy] = useState("date");
  const [isMounted, setIsMounted] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  
  const { scrollYProgress } = useScroll();
  const headerOpacity = useTransform(scrollYProgress, [0, 0.1], [1, 0.9]);

  // Filter and sort sketches
  const filteredSketches = sketchData
    .filter(sketch => activeCategory === "All" || sketch.category === activeCategory)
    .sort((a, b) => {
      if (sortBy === "date") return new Date(b.date) - new Date(a.date);
      if (sortBy === "title") return a.title.localeCompare(b.title);
      if (sortBy === "featured") return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
      return 0;
    });

  useEffect(() => {
    document.body.style.overflowY = 'auto';
    document.documentElement.style.scrollBehavior = 'smooth';
    
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

  const openModal = (sketch) => {
    setSelectedSketch(sketch);
    setImageLoaded(false);
    document.body.style.overflow = 'hidden';
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

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') closeModal();
      if (e.key === 'ArrowRight' && selectedSketch) navigateSketch('next');
      if (e.key === 'ArrowLeft' && selectedSketch) navigateSketch('prev');
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedSketch, filteredSketches]);

  if (!isMounted) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <motion.div
          className="w-16 h-16 border-4 border-purple-500/30 border-t-purple-500 rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white relative overflow-x-hidden">
      <ScrollProgress />
      
      {/* Background elements */}
      <BackgroundElements />
      
      {/* Main content */}
      <main className="relative z-10">
        {/* Hero Section */}
        <Section className="px-4 sm:px-6 pt-20 pb-16">
          <motion.div
            className="max-w-6xl mx-auto text-center"
            style={{ opacity: headerOpacity }}
          >
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="mb-16"
            >
              <h1 className="text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-bold tracking-tight leading-tight mb-8">
                <GradientText 
                  gradient="from-purple-400 via-blue-400 to-cyan-400"
                  className="block"
                >
                  Craftings
                </GradientText>
              </h1>
              
              <motion.div
                className="text-xl sm:text-2xl md:text-3xl text-gray-300 font-light mb-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.6 }}
              >
                <span className="relative inline-block">
                  Where imagination takes form
                  <motion.span 
                    className="absolute -bottom-1 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-purple-400 to-transparent"
                    initial={{ scaleX: 0, opacity: 0 }}
                    animate={{ scaleX: 1, opacity: 0.8 }}
                    transition={{ delay: 1.2, duration: 1.5 }}
                  />
                </span>
              </motion.div>
            </motion.div>
            

          </motion.div>
        </Section>

        {/* Controls Section */}
        <Section className="mb-16 px-4 sm:px-6" delay={0.2}>
          <div className="max-w-7xl mx-auto">
            <motion.div
              className="relative overflow-hidden rounded-3xl backdrop-blur-2xl bg-gradient-to-br from-white/10 via-white/5 to-white/10 border border-white/20 shadow-[0_20px_80px_-15px_rgba(139,92,246,0.4)] p-8"
              whileHover={{ scale: 1.01 }}
              transition={{ duration: 0.4 }}
            >
              <div className="flex flex-wrap items-center justify-between gap-8">
                {/* Category Filter */}
                <div className="flex flex-wrap gap-3">
                  {categories.map((category, index) => (
                    <motion.button
                      key={category}
                      onClick={() => setActiveCategory(category)}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={`px-6 py-3 rounded-full text-sm font-medium transition-all duration-500 ${
                        activeCategory === category
                          ? 'bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 text-white shadow-lg shadow-purple-500/30 border border-purple-400/50'
                          : 'bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white border border-white/10 hover:border-purple-400/30'
                      }`}
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {category}
                    </motion.button>
                  ))}
                </div>

                {/* Sort Control */}
                <div className="flex items-center gap-4">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="bg-white/5 border border-purple-400/30 rounded-xl px-6 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-400/50 backdrop-blur-sm text-white"
                  >
                    <option value="date" className="bg-black">Sort by Date</option>
                    <option value="title" className="bg-black">Sort by Title</option>
                    <option value="featured" className="bg-black">Sort by Featured</option>
                  </select>
                </div>
              </div>
            </motion.div>
          </div>
        </Section>

        {/* Gallery Section */}
        <Section className="px-4 sm:px-6 pb-32" delay={0.4}>
          <div className="max-w-8xl mx-auto">
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 lg:gap-12"
              layout
            >
              <AnimatePresence mode="popLayout">
                {filteredSketches.map((sketch, index) => (
                  <motion.div
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
                    className="group cursor-pointer"
                    onClick={() => openModal(sketch)}
                  >
                    <div className="relative">
                      {/* Outer Glow */}
                      <div className="absolute -inset-6 bg-gradient-to-r from-purple-600/10 via-blue-400/5 to-cyan-600/10 rounded-3xl blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                      
                      {/* Main Frame */}
                      <div className="relative bg-gradient-to-br from-white/10 via-white/5 to-white/10 rounded-3xl overflow-hidden shadow-2xl shadow-black/50 border border-white/20 group-hover:border-white/40 transition-all duration-500 backdrop-blur-sm">
                        
                        {/* Featured Badge */}
                        {sketch.featured && (
                          <motion.div 
                            className="absolute top-6 left-6 z-20"
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ delay: index * 0.1 + 0.6, type: "spring" }}
                          >
                            <div className="bg-gradient-to-r from-purple-600 via-blue-500 to-cyan-600 text-white text-xs px-4 py-2 rounded-full font-medium shadow-lg shadow-purple-500/40 border border-purple-400/60 backdrop-blur-sm flex items-center gap-2">
                              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                              Featured
                            </div>
                          </motion.div>
                        )}
                        
                        {/* Image Container with Double Borders (keeping your preference) */}
                        <div className="relative overflow-hidden bg-black">
                          {/* Double border frames as requested */}
                          <div className="absolute inset-3 border-2 border-white/30 rounded-2xl z-10 pointer-events-none group-hover:border-white/50 transition-colors duration-500"></div>
                          <div className="absolute inset-5 border border-white/20 rounded-xl z-10 pointer-events-none group-hover:border-white/40 transition-colors duration-500"></div>
                          
                          {/* Image */}
                          <img
                            src={imageMap[sketch.id]}
                            alt={sketch.title}
                            className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110 filter group-hover:contrast-110 group-hover:brightness-105"
                            style={{ 
                              minHeight: "400px",
                              aspectRatio: "4/5",
                              filter: 'drop-shadow(0 10px 30px rgba(0,0,0,0.3))'
                            }}
                            loading="lazy"
                          />
                          
                          {/* Hover Overlay */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-purple-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-600"></div>
                          
                          {/* Hover Content */}
                          <div className="absolute inset-0 p-8 flex flex-col justify-end opacity-0 group-hover:opacity-100 transition-all duration-600 transform translate-y-12 group-hover:translate-y-0">
                            <div className="text-purple-300 text-sm font-medium mb-3 tracking-wide uppercase">
                              {sketch.category}
                            </div>
                            <h3 className="text-white text-2xl font-light mb-4 leading-tight">
                              {sketch.title}
                            </h3>
                            <p className="text-gray-300 text-sm leading-relaxed line-clamp-3 mb-4">
                              {sketch.description}
                            </p>
                            <div className="flex justify-between items-center text-xs text-gray-400 pt-3 border-t border-white/20">
                              <span className="font-medium">{sketch.date}</span>
                              <span className="italic">{sketch.technique}</span>
                            </div>
                          </div>
                        </div>

                        {/* Info Panel */}
                        <div className="p-6 bg-gradient-to-r from-black/90 via-gray-900/80 to-black/90 backdrop-blur-xl border-t border-white/10">
                          <div className="flex justify-between items-center">
                            <div className="flex-1">
                              <h4 className="text-white font-light text-lg mb-1">{sketch.title}</h4>
                              <p className="text-gray-400 text-sm">{sketch.technique}</p>
                              <p className="text-gray-500 text-xs mt-1">{sketch.dimensions}</p>
                            </div>
                            <motion.div 
                              className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-600/20 to-blue-500/20 flex items-center justify-center group-hover:from-purple-600 group-hover:to-blue-500 transition-all duration-500 border border-purple-400/30 group-hover:border-purple-400 backdrop-blur-sm shadow-lg"
                              whileHover={{ rotate: 45, scale: 1.1 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              <svg className="w-5 h-5 text-purple-400 group-hover:text-white transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                            </motion.div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          </div>
        </Section>
      </main>

      {/* Enhanced Modal */}
      <AnimatePresence>
        {selectedSketch && (
          <motion.div
            className="fixed inset-0 z-50 bg-black/96 backdrop-blur-3xl flex items-center justify-center p-4 md:p-6 overflow-y-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeModal}
          >
            <motion.div
              className="relative w-full max-w-7xl bg-gradient-to-br from-white/10 via-white/5 to-white/10 rounded-3xl shadow-[0_25px_100px_-15px_rgba(0,0,0,0.8)] overflow-hidden border border-white/20 backdrop-blur-xl my-8"
              initial={{ scale: 0.85, opacity: 0, y: 60 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.85, opacity: 0, y: 60 }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              style={{ maxHeight: 'calc(100vh - 4rem)' }}
            >
              <div className="flex flex-col lg:flex-row min-h-0">
                {/* Image Section */}
                <div className="flex-1 relative overflow-hidden bg-black min-h-[50vh] lg:min-h-[80vh] flex items-center justify-center">
                  {/* Double border frames (keeping your preference) */}
                  <div className="absolute inset-6 border-2 border-white/40 rounded-2xl z-10 pointer-events-none shadow-inner"></div>
                  <div className="absolute inset-8 border border-white/30 rounded-xl z-10 pointer-events-none"></div>
                  
                  {/* Loading indicator */}
                  {!imageLoaded && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <motion.div
                        className="w-12 h-12 border-2 border-purple-400 rounded-full border-t-transparent"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      />
                    </div>
                  )}
                  
                  <img
                    src={imageMap[selectedSketch.id]}
                    alt={selectedSketch.title}
                    className={`max-w-full max-h-full object-contain p-8 transition-opacity duration-500 ${
                      imageLoaded ? 'opacity-100' : 'opacity-0'
                    }`}
                    style={{ 
                      filter: 'drop-shadow(0 25px 50px rgba(0,0,0,0.5))',
                      maxHeight: 'calc(80vh - 4rem)'
                    }}
                    onLoad={() => setImageLoaded(true)}
                  />
                  
                  {/* Ambient glow */}
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600/5 via-transparent to-blue-600/5 pointer-events-none"></div>
                </div>

                {/* Info Section */}
                <div className="w-full lg:w-[480px] p-8 lg:p-16 flex flex-col justify-between bg-gradient-to-b from-black/98 via-gray-900/95 to-black/98 backdrop-blur-xl border-t lg:border-t-0 lg:border-l border-white/20 overflow-y-auto">
                  <div>
                    {/* Category Badge */}
                    <motion.div 
                      className="inline-flex items-center px-5 py-3 bg-gradient-to-r from-purple-600/30 to-blue-500/30 border border-purple-400/40 rounded-full text-purple-200 text-sm font-medium uppercase tracking-wider mb-8 backdrop-blur-sm shadow-lg"
                      initial={{ x: -30, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.3 }}
                    >
                      <span className="w-2 h-2 bg-purple-300 rounded-full mr-3 animate-pulse"></span>
                      {selectedSketch.category}
                    </motion.div>
                    
                    {/* Title */}
                    <motion.h2 
                      className="text-4xl lg:text-6xl font-thin text-white mb-8 leading-tight"
                      initial={{ y: 30, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.4 }}
                    >
                      <GradientText gradient="from-white via-purple-100 to-white">
                        {selectedSketch.title}
                      </GradientText>
                    </motion.h2>
                    
                    {/* Metadata */}
                    <motion.div 
                      className="space-y-5 text-sm mb-10"
                      initial={{ y: 30, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.5 }}
                    >
                      <div className="flex justify-between items-center py-4 border-b border-white/20">
                        <span className="text-gray-400 font-medium tracking-wide">Date Created</span>
                        <span className="text-purple-100 font-light">{selectedSketch.date}</span>
                      </div>
                      <div className="flex justify-between items-center py-4 border-b border-white/20">
                        <span className="text-gray-400 font-medium tracking-wide">Medium</span>
                        <span className="text-purple-100 font-light">{selectedSketch.technique}</span>
                      </div>
                      <div className="flex justify-between items-center py-4 border-b border-white/20">
                        <span className="text-gray-400 font-medium tracking-wide">Dimensions</span>
                        <span className="text-purple-100 font-light">{selectedSketch.dimensions}</span>
                      </div>
                    </motion.div>
                    
                    {/* Description */}
                    <motion.div
                      initial={{ y: 30, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.6 }}
                    >
                      <h3 className="text-purple-200 text-xl font-light mb-6 tracking-wide">Artist's Vision</h3>
                      <p className="text-gray-200 leading-relaxed text-base lg:text-lg font-light">
                        {selectedSketch.description}
                      </p>
                    </motion.div>
                  </div>

                  {/* Featured Badge */}
                  {selectedSketch.featured && (
                    <motion.div 
                      className="mt-10 inline-flex items-center px-8 py-4 bg-gradient-to-r from-purple-600 via-blue-500 to-cyan-600 text-white rounded-full text-lg font-medium shadow-lg shadow-purple-500/40 border border-purple-400/60"
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ delay: 0.8, type: "spring" }}
                    >
                      <svg className="w-6 h-6 mr-4" fill="currentColor" viewBox="0 0 20 20">
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
                className="absolute top-4 right-4 w-12 h-12 md:w-16 md:h-16 bg-black/80 hover:bg-black/95 rounded-full flex items-center justify-center text-white transition-all duration-300 border border-white/30 hover:border-white/60 backdrop-blur-xl shadow-2xl z-20"
                whileHover={{ rotate: 90, scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.7 }}
              >
                <svg className="w-5 h-5 md:w-7 md:h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </motion.button>

              {/* Navigation Buttons */}
              <motion.button
                onClick={(e) => {
                  e.stopPropagation();
                  navigateSketch('prev');
                }}
                className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 w-12 h-12 md:w-16 md:h-16 bg-black/80 hover:bg-black/95 rounded-full flex items-center justify-center text-white transition-all duration-300 border border-white/30 hover:border-white/60 backdrop-blur-xl shadow-2xl z-20"
                whileHover={{ x: -8, scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 }}
              >
                <svg className="w-6 h-6 md:w-8 md:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
                </svg>
              </motion.button>

              <motion.button
                onClick={(e) => {
                  e.stopPropagation();
                  navigateSketch('next');
                }}
                className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 w-12 h-12 md:w-16 md:h-16 bg-black/80 hover:bg-black/95 rounded-full flex items-center justify-center text-white transition-all duration-300 border border-white/30 hover:border-white/60 backdrop-blur-xl shadow-2xl z-20"
                whileHover={{ x: 8, scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 }}
              >
                <svg className="w-6 h-6 md:w-8 md:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
                </svg>
              </motion.button>

              {/* Counter */}
              <motion.div 
                className="absolute bottom-4 left-1/2 -translate-x-1/2 px-6 py-3 bg-black/90 border border-white/40 rounded-full text-white text-sm md:text-base backdrop-blur-xl shadow-2xl z-20"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 }}
              >
                <span className="font-light text-purple-200">
                  {filteredSketches.findIndex(s => s.id === selectedSketch.id) + 1}
                </span>
                <span className="text-gray-400 mx-3">of</span>
                <span className="font-light text-purple-200">
                  {filteredSketches.length}
                </span>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      
    </div>
  );
};

export default crafts;