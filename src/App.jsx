import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet, HelmetProvider } from 'react-helmet-async';

// Page imports
import Home from './pages/Home';
import Aboutme from './pages/Aboutme';
import PencilSketch from './pages/artworks/PencilSketch';
import WaterColor from './pages/artworks/WaterColor';
import AcrylicColor from './pages/artworks/AcrylicColor';
import Crafts from './pages/artworks/Crafts';
import Modeling from './pages/artworks/Modeling';
import Contact from './pages/Contact';

// Component imports
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import CustomCursor from './components/CustomCursor';

/**
 * PageTransition Component
 * Handles smooth transition animations and loading effects between routes.
 */
const PageTransition = ({ children }) => {
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, [location.pathname]);

  return (
    <>
      <AnimatePresence mode="wait">
        {isLoading && <Loader key="loader" />}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {!isLoading && (
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: 'easeInOut' }}
            className="min-h-screen bg-black relative overflow-x-hidden"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

/**
 * Loader Component
 * Displays a premium spinner with custom animation and "BUSHRA" branding.
 */
const Loader = () => (
  <motion.div
    className="fixed inset-0 bg-black z-50 flex items-center justify-center"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.3 }}
  >
    <motion.div
      className="relative"
      animate={{ rotate: 360 }}
      transition={{
        duration: 1.5,
        ease: 'linear',
        repeat: Infinity,
      }}
    >
      <div className="w-16 h-16 rounded-full border-t-2 border-r-2 border-b-2 border-transparent border-t-purple-500 border-r-blue-500 border-b-cyan-500" />
    </motion.div>
    <div className="absolute">
      <motion.div
        className="text-sm text-white/70 font-light tracking-widest"
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 1, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        BUSHRA
      </motion.div>
    </div>
  </motion.div>
);

/**
 * Main App Component
 * Wraps the application with Router, SEO (HelmetProvider), and navigation layout.
 */
function App() {
  useEffect(() => {
    document.body.style.overflowY = 'auto';
    document.documentElement.style.overflowY = 'auto';

    const updateHeight = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    };

    updateHeight();
    window.addEventListener('resize', updateHeight);

    document.documentElement.style.scrollBehavior = 'smooth';

    return () => {
      window.removeEventListener('resize', updateHeight);
      document.documentElement.style.scrollBehavior = '';
    };
  }, []);

  return (
    <HelmetProvider>
      <Router>
        <ScrollToTop />
        <CustomCursor theme="ink" inkWord="design" />

        <div className="App">
          <Navbar />

          <Routes>
            <Route
              path="/"
              element={
                <PageTransition>
                  <Helmet>
                    <title>Home | Bushra’s Art Portfolio</title>
                    <meta
                      name="description"
                      content="Explore Bushra's creative journey through pencil sketches, watercolors, acrylic paintings, crafts, and modeling artworks."
                    />
                    <meta name="keywords" content="Bushra, Art, Portfolio, Sketch, Acrylic, Watercolor, Crafts" />
                  </Helmet>
                  <Home />
                </PageTransition>
              }
            />
            <Route
              path="/aboutme"
              element={
                <PageTransition>
                  <Helmet>
                    <title>About Me | Bushra’s Art Portfolio</title>
                    <meta
                      name="description"
                      content="Learn about Bushra, a passionate and innovative artist expressing imagination through pencil, acrylic, watercolor, crafts, and modeling."
                    />
                  </Helmet>
                  <Aboutme />
                </PageTransition>
              }
            />

            {/* Artwork Routes */}
            <Route path="/artworks">
              <Route index element={<Navigate to="/artworks/gallery" replace />} />

              <Route
                path="pencil-sketch"
                element={
                  <PageTransition>
                    <Helmet>
                      <title>Pencil Sketches | Bushra’s Art Portfolio</title>
                      <meta name="description" content="A gallery of expressive pencil sketches created by Bushra." />
                    </Helmet>
                    <PencilSketch />
                  </PageTransition>
                }
              />
              <Route
                path="water-color"
                element={
                  <PageTransition>
                    <Helmet>
                      <title>Watercolor Art | Bushra’s Art Portfolio</title>
                      <meta name="description" content="Vibrant watercolor paintings showcasing creativity and detail." />
                    </Helmet>
                    <WaterColor />
                  </PageTransition>
                }
              />
              <Route
                path="acrylic-color"
                element={
                  <PageTransition>
                    <Helmet>
                      <title>Acrylic Paintings | Bushra’s Art Portfolio</title>
                      <meta name="description" content="Acrylic paintings filled with imagination, colors, and emotion." />
                    </Helmet>
                    <AcrylicColor />
                  </PageTransition>
                }
              />
              <Route
                path="crafts"
                element={
                  <PageTransition>
                    <Helmet>
                      <title>Crafts | Bushra’s Art Portfolio</title>
                      <meta name="description" content="Handmade crafts designed with creativity and passion." />
                    </Helmet>
                    <Crafts />
                  </PageTransition>
                }
              />
              <Route
                path="modeling"
                element={
                  <PageTransition>
                    <Helmet>
                      <title>Modeling Works | Bushra’s Art Portfolio</title>
                      <meta name="description" content="Modeling artworks and 3D forms crafted with precision and creativity." />
                    </Helmet>
                    <Modeling />
                  </PageTransition>
                }
              />
              <Route
                path="gallery"
                element={
                  <PageTransition>
                    <Helmet>
                      <title>Artwork Gallery | Bushra’s Art Portfolio</title>
                      <meta name="description" content="Browse the full collection of Bushra's artworks in one gallery." />
                    </Helmet>
                    <ArtworkGallery />
                  </PageTransition>
                }
              />
            </Route>

            <Route
              path="/contact"
              element={
                <PageTransition>
                  <Helmet>
                    <title>Contact | Bushra’s Art Portfolio</title>
                    <meta
                      name="description"
                      content="Get in touch with Bushra for art collaborations, commissions, or inquiries."
                    />
                  </Helmet>
                  <Contact />
                </PageTransition>
              }
            />
          </Routes>

          <Footer />
        </div>
      </Router>
    </HelmetProvider>
  );
}

/**
 * ArtworkGallery Component
 * Displays categories of artwork in a visually appealing grid.
 */
const ArtworkGallery = () => (
  <div className="min-h-screen pt-32 pb-20 px-6">
    <div className="max-w-7xl mx-auto">
      <motion.h1
        className="text-5xl sm:text-6xl md:text-7xl font-bold text-center mb-20"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <span className="bg-gradient-to-r from-purple-300 via-blue-300 to-cyan-300 bg-clip-text text-transparent">
          My Artwork Gallery
        </span>
      </motion.h1>

      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.3 }}
      >
        <CategoryCard title="Pencil Sketch" path="/artworks/pencil-sketch" gradient="from-gray-500 to-gray-700" delay={0} />
        <CategoryCard title="Water Color" path="/artworks/water-color" gradient="from-blue-500 to-cyan-600" delay={0.1} />
        <CategoryCard title="Acrylic Color" path="/artworks/acrylic-color" gradient="from-purple-500 to-pink-600" delay={0.2} />
        <CategoryCard title="Crafts" path="/artworks/crafts" gradient="from-amber-500 to-orange-600" delay={0.3} />
      </motion.div>
    </div>
  </div>
);

/**
 * CategoryCard Component
 * Individual category card with hover animations and gradient backgrounds.
 */
const CategoryCard = ({ title, path, gradient, delay }) => (
  <motion.div
    className="group"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: delay + 0.2, duration: 0.6 }}
    whileHover={{ y: -10 }}
  >
    <a
      href={path}
      className="block rounded-2xl overflow-hidden backdrop-blur-sm bg-white/5 border border-white/10 aspect-square relative group transition-all duration-500 hover:border-white/20 hover:shadow-lg hover:shadow-purple-900/20"
    >
      <div className={`absolute inset-0 opacity-20 bg-gradient-to-br ${gradient}`} />
      <div className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500 bg-white" />

      <div className="absolute inset-0 p-6 flex flex-col justify-end">
        <h3 className={`text-2xl font-bold mb-2 bg-gradient-to-r ${gradient} bg-clip-text text-transparent`}>
          {title}
        </h3>
        <p className="text-gray-400 text-sm">Explore my collection</p>

        <div className="mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
          <span className="inline-flex items-center text-sm text-white">
            View Gallery
            <svg
              className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </span>
        </div>
      </div>
    </a>
  </motion.div>
);

/**
 * ScrollToTop Component
 * Ensures window scrolls to top on every route change.
 */
const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

export default App;
