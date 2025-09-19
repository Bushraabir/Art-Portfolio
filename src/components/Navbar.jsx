import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';

/**
 * Navbar Component
 * 
 * A responsive, animated navigation bar with the following features:
 * - Smooth scroll-based backdrop blur and height adjustment
 * - Animated dropdown menus for desktop
 * - Mobile-friendly hamburger menu with proper touch interactions
 * - Active route highlighting
 * - Accessibility features (ARIA labels, keyboard navigation)
 * - SEO-friendly semantic HTML structure
 * - Performance optimized with proper event cleanup
 * 

 */
const Navbar = () => {
  // State management
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [isMobileDropdownOpen, setIsMobileDropdownOpen] = useState({});
  
  // Refs for DOM manipulation
  const dropdownRef = useRef(null);
  const mobileMenuRef = useRef(null);
  const location = useLocation();

  /**
   * Navigation structure with SEO-friendly titles and descriptions
   * Centralized configuration for easy maintenance
   */
  const navLinks = [
    { 
      title: 'Home', 
      path: '/',
      description: 'Welcome to Bushra Khandoker\'s portfolio homepage',
      ariaLabel: 'Navigate to homepage'
    },
    { 
      title: 'About Me', 
      path: '/aboutme',
      description: 'Learn about Bushra Khandoker\'s background and story',
      ariaLabel: 'Navigate to about page'
    },
    {
      title: 'My Artworks',
      path: '/artworks',
      description: 'Explore Bushra Khandoker\'s diverse art portfolio',
      ariaLabel: 'Open artworks menu',
      children: [
        { 
          title: 'Pencil Sketches', 
          path: '/artworks/pencil-sketch',
          description: 'Hand-drawn pencil artwork collection',
          ariaLabel: 'View pencil sketch gallery'
        },
        { 
          title: 'Watercolor Paintings', 
          path: '/artworks/water-color',
          description: 'Beautiful watercolor painting collection',
          ariaLabel: 'View watercolor gallery'
        },
        { 
          title: 'Acrylic Paintings', 
          path: '/artworks/acrylic-color',
          description: 'Vibrant acrylic painting collection',
          ariaLabel: 'View acrylic painting gallery'
        },
        { 
          title: 'Handmade Crafts', 
          path: '/artworks/crafts',
          description: 'Unique handcrafted art pieces',
          ariaLabel: 'View craft gallery'
        },
        { 
          title: '3D Modeling', 
          path: '/artworks/modeling',
          description: 'Digital 3D modeling and design work',
          ariaLabel: 'View 3D modeling gallery'
        },
      ],
    },
    { 
      title: 'Contact', 
      path: '/contact',
      description: 'Get in touch with Bushra Khandoker',
      ariaLabel: 'Navigate to contact page'
    },
  ];

  /**
   * Optimized scroll handler with throttling for better performance
   */
  const handleScroll = useCallback(() => {
    const scrolled = window.scrollY > 20;
    if (scrolled !== isScrolled) {
      setIsScrolled(scrolled);
    }
  }, [isScrolled]);

  /**
   * Throttle function to limit scroll event frequency
   */
  const throttle = (func, delay) => {
    let timeoutId;
    let lastExecTime = 0;
    return (...args) => {
      const currentTime = Date.now();
      if (currentTime - lastExecTime > delay) {
        func(...args);
        lastExecTime = currentTime;
      } else {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          func(...args);
          lastExecTime = Date.now();
        }, delay - (currentTime - lastExecTime));
      }
    };
  };

  // Scroll effect with performance optimization
  useEffect(() => {
    const throttledHandleScroll = throttle(handleScroll, 10);
    window.addEventListener('scroll', throttledHandleScroll, { passive: true });
    return () => window.removeEventListener('scroll', throttledHandleScroll);
  }, [handleScroll]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setActiveDropdown(null);
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(e.target) && isOpen) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Close mobile menu and dropdowns on route change
  useEffect(() => {
    setIsOpen(false);
    setActiveDropdown(null);
    setIsMobileDropdownOpen({});
  }, [location.pathname]);

  // Keyboard navigation support
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
        setActiveDropdown(null);
        setIsMobileDropdownOpen({});
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  /**
   * Toggle desktop dropdown menu
   */
  const toggleDropdown = useCallback((index) => {
    setActiveDropdown(prev => prev === index ? null : index);
  }, []);

  /**
   * Toggle mobile dropdown menu
   */
  const toggleMobileDropdown = useCallback((index) => {
    setIsMobileDropdownOpen(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  }, []);

  /**
   * Check if current route is active
   */
  const isActiveRoute = useCallback((path) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  }, [location.pathname]);

  /**
   * Animation variants for better performance
   */
  const navVariants = {
    hidden: { y: -100 },
    visible: { 
      y: 0,
      transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] }
    }
  };

  const dropdownVariants = {
    hidden: { 
      opacity: 0, 
      y: -10, 
      scale: 0.95,
      transition: { duration: 0.2 }
    },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: { duration: 0.2, ease: 'easeOut' }
    }
  };

  const mobileMenuVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 }
  };

  const mobileContentVariants = {
    hidden: { y: 50, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { delay: 0.1, duration: 0.4, ease: 'easeOut' }
    },
    exit: { y: 50, opacity: 0 }
  };

  return (
    <>
      {/* SEO-friendly semantic navigation */}
      <motion.nav
        role="navigation"
        aria-label="Main navigation"
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled 
            ? 'py-2 md:py-3 bg-black/80 backdrop-blur-xl shadow-lg' 
            : 'py-4 md:py-5 bg-transparent'
        }`}
        variants={navVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="max-w-7xl mx-auto px-4 md:px-6 flex items-center justify-between">
          
          {/* Logo with proper SEO attributes */}
          <Link
            to="/"
            className="text-xl md:text-2xl font-light tracking-wide bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent hover:from-purple-300 hover:via-pink-300 hover:to-blue-300 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 focus:ring-offset-black rounded-md px-2 py-1"
            aria-label="Bushra Khandoker - Portfolio Home"
            title="Return to homepage"
          >
            Bushra Khandoker
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1" ref={dropdownRef}>
            {navLinks.map((link, idx) =>
              link.children ? (
                <div key={idx} className="relative">
                  <button
                    onClick={() => toggleDropdown(idx)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        toggleDropdown(idx);
                      }
                    }}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full text-gray-300 hover:text-white hover:bg-white/10 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 focus:ring-offset-black ${
                      isActiveRoute(link.path) ? 'bg-white/10 text-white' : ''
                    }`}
                    aria-label={link.ariaLabel}
                    aria-expanded={activeDropdown === idx}
                    aria-haspopup="true"
                    title={link.description}
                  >
                    {link.title}
                    <motion.svg
                      className="w-4 h-4"
                      animate={{ rotate: activeDropdown === idx ? 180 : 0 }}
                      transition={{ duration: 0.3, ease: 'easeInOut' }}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </motion.svg>
                  </button>

                  <AnimatePresence mode="wait">
                    {activeDropdown === idx && (
                      <motion.div
                        role="menu"
                        className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-56 backdrop-blur-xl bg-black/90 border border-white/20 rounded-2xl overflow-hidden shadow-2xl"
                        variants={dropdownVariants}
                        initial="hidden"
                        animate="visible"
                        exit="hidden"
                      >
                        {link.children.map((child) => (
                          <Link
                            key={child.path}
                            to={child.path}
                            role="menuitem"
                            className={`block px-4 py-3 text-sm text-gray-300 hover:bg-white/10 hover:text-white transition-colors duration-200 focus:outline-none focus:bg-white/10 focus:text-white ${
                              isActiveRoute(child.path) ? 'bg-white/10 text-white' : ''
                            }`}
                            onClick={() => setActiveDropdown(null)}
                            aria-label={child.ariaLabel}
                            title={child.description}
                          >
                            {child.title}
                          </Link>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-4 py-2 rounded-full text-gray-300 hover:text-white hover:bg-white/10 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 focus:ring-offset-black ${
                    isActiveRoute(link.path) ? 'bg-white/10 text-white' : ''
                  }`}
                  aria-label={link.ariaLabel}
                  title={link.description}
                >
                  {link.title}
                </Link>
              )
            )}
          </div>

          {/* Mobile Menu Button with improved accessibility */}
          <motion.button
            className="md:hidden text-white p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 focus:ring-offset-black"
            onClick={() => setIsOpen(!isOpen)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setIsOpen(!isOpen);
              }
            }}
            whileTap={{ scale: 0.95 }}
            aria-label={isOpen ? 'Close mobile menu' : 'Open mobile menu'}
            aria-expanded={isOpen}
            aria-controls="mobile-menu"
          >
            <motion.svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              animate={{ rotate: isOpen ? 180 : 0 }}
              transition={{ duration: 0.3 }}
            >
              <path
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                d={isOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'}
              />
            </motion.svg>
          </motion.button>
        </div>
      </motion.nav>

      {/* Mobile Menu Overlay with improved structure */}
      <AnimatePresence mode="wait">
        {isOpen && (
          <motion.div
            id="mobile-menu"
            role="dialog"
            aria-modal="true"
            aria-label="Mobile navigation menu"
            className="fixed inset-0 z-40 bg-black/95 backdrop-blur-xl md:hidden"
            variants={mobileMenuVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            ref={mobileMenuRef}
          >
            <motion.div
              className="flex flex-col justify-center h-full px-6 py-20 overflow-y-auto"
              variants={mobileContentVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <nav role="navigation" aria-label="Mobile navigation" className="space-y-2">
                {navLinks.map((link, idx) => (
                  <div key={idx} className="w-full">
                    {link.children ? (
                      <div className="w-full">
                        <button
                          onClick={() => toggleMobileDropdown(idx)}
                          className={`w-full flex items-center justify-between px-6 py-4 text-xl font-light text-gray-300 hover:text-white hover:bg-white/10 transition-all duration-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 ${
                            isActiveRoute(link.path) ? 'bg-white/10 text-white' : ''
                          }`}
                          aria-expanded={isMobileDropdownOpen[idx]}
                          aria-label={`${link.ariaLabel} - ${isMobileDropdownOpen[idx] ? 'expanded' : 'collapsed'}`}
                        >
                          {link.title}
                          <motion.svg
                            className="w-5 h-5"
                            animate={{ rotate: isMobileDropdownOpen[idx] ? 180 : 0 }}
                            transition={{ duration: 0.3 }}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                          </motion.svg>
                        </button>

                        <AnimatePresence>
                          {isMobileDropdownOpen[idx] && (
                            <motion.div
                              className="ml-4 mt-2 space-y-1"
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.3, ease: 'easeInOut' }}
                            >
                              {link.children.map((child) => (
                                <Link
                                  key={child.path}
                                  to={child.path}
                                  className={`block px-6 py-3 text-lg font-light text-gray-400 hover:text-white hover:bg-white/5 transition-all duration-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 ${
                                    isActiveRoute(child.path) ? 'bg-white/10 text-white' : ''
                                  }`}
                                  onClick={() => {
                                    setIsOpen(false);
                                    setIsMobileDropdownOpen({});
                                  }}
                                  aria-label={child.ariaLabel}
                                >
                                  {child.title}
                                </Link>
                              ))}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    ) : (
                      <Link
                        to={link.path}
                        className={`block px-6 py-4 text-xl font-light text-gray-300 hover:text-white hover:bg-white/10 transition-all duration-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 ${
                          isActiveRoute(link.path) ? 'bg-white/10 text-white' : ''
                        }`}
                        onClick={() => setIsOpen(false)}
                        aria-label={link.ariaLabel}
                      >
                        {link.title}
                      </Link>
                    )}
                  </div>
                ))}
              </nav>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;