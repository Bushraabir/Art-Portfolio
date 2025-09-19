import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  motion,
  useScroll,
  useTransform,
  useInView,
  AnimatePresence,
  useReducedMotion,
} from 'framer-motion';
import { Helmet } from 'react-helmet-async';

// Keep the original image path as requested
import artistPhoto from '../assets/Bushra.jpg';

// ========================================================================================
// CONSTANTS & CONFIGURATION
// ========================================================================================

const PERFORMANCE_CONFIG = {
  THROTTLE_MS: 120,
  PARTICLE_COUNT: {
    DESKTOP: 60,
    TABLET: 40,
    MOBILE: 20,
  },
  ANIMATION_DURATIONS: {
    FAST: 0.3,
    MEDIUM: 0.6,
    SLOW: 1.2,
  },
};

const BREAKPOINTS = {
  SM: 640,
  MD: 768,
  LG: 1024,
  XL: 1280,
};

// ========================================================================================
// UTILITY FUNCTIONS
// ========================================================================================

/**
 * Throttle function for performance optimization
 * @param {Function} fn - Function to throttle
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Throttled function
 */
const throttle = (fn, wait = PERFORMANCE_CONFIG.THROTTLE_MS) => {
  let last = 0;
  return (...args) => {
    const now = Date.now();
    if (now - last >= wait) {
      last = now;
      fn(...args);
    }
  };
};

/**
 * Debounce function for performance optimization
 * @param {Function} fn - Function to debounce
 * @param {number} delay - Delay in milliseconds
 * @returns {Function} Debounced function
 */
const debounce = (fn, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
};

/**
 * Get device type based on window width
 * @param {number} width - Window width
 * @returns {string} Device type
 */
const getDeviceType = (width) => {
  if (width < BREAKPOINTS.SM) return 'mobile';
  if (width < BREAKPOINTS.LG) return 'tablet';
  return 'desktop';
};

// ========================================================================================
// CUSTOM HOOKS
// ========================================================================================

/**
 * Hook for responsive design and device detection
 * @returns {Object} Device and responsive state
 */
const useResponsive = () => {
  const [state, setState] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1024,
    height: typeof window !== 'undefined' ? window.innerHeight : 768,
    deviceType: 'desktop',
    isMobile: false,
    isTablet: false,
    isDesktop: true,
  });

  useEffect(() => {
    const updateState = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const deviceType = getDeviceType(width);

      setState({
        width,
        height,
        deviceType,
        isMobile: deviceType === 'mobile',
        isTablet: deviceType === 'tablet',
        isDesktop: deviceType === 'desktop',
      });

      // Update CSS custom properties for responsive design
      document.documentElement.style.setProperty('--vh', `${height * 0.01}px`);
      document.documentElement.style.setProperty('--vw', `${width * 0.01}px`);
    };

    updateState();

    const debouncedUpdate = debounce(updateState, 150);
    window.addEventListener('resize', debouncedUpdate);
    window.addEventListener('orientationchange', debouncedUpdate);

    return () => {
      window.removeEventListener('resize', debouncedUpdate);
      window.removeEventListener('orientationchange', debouncedUpdate);
    };
  }, []);

  return state;
};

/**
 * Hook for intersection observer with enhanced options
 * @param {Object} options - Intersection observer options
 * @returns {Object} Ref and intersection state
 */
const useIntersectionObserver = (options = {}) => {
  const ref = useRef(null);
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [hasIntersected, setHasIntersected] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        const intersecting = entry.isIntersecting;
        setIsIntersecting(intersecting);
        
        if (intersecting && !hasIntersected) {
          setHasIntersected(true);
        }
      },
      {
        threshold: 0.1,
        rootMargin: '-50px 0px',
        ...options,
      }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [hasIntersected, options]);

  return { ref, isIntersecting, hasIntersected };
};

// ========================================================================================
// ENHANCED COMPONENTS
// ========================================================================================

/**
 * Enhanced Floating Particles Component
 */
const FloatingParticles = ({ disabled, deviceType }) => {
  const canvasRef = useRef(null);
  const particlesRef = useRef([]);
  const mouseRef = useRef({ x: 0, y: 0 });
  const animationIdRef = useRef(null);

  const particleCount = useMemo(() => {
    return PERFORMANCE_CONFIG.PARTICLE_COUNT[deviceType.toUpperCase()] || PERFORMANCE_CONFIG.PARTICLE_COUNT.DESKTOP;
  }, [deviceType]);

  const initParticles = useCallback(() => {
    if (!canvasRef.current || disabled) return;
    
    const canvas = canvasRef.current;
    particlesRef.current = [];

    for (let i = 0; i < particleCount; i++) {
      particlesRef.current.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        size: Math.random() * 3 + 1,
        originalSize: Math.random() * 3 + 1,
        alpha: Math.random() * 0.8 + 0.2,
        hue: Math.random() * 60 + 200,
        pulsePhase: Math.random() * Math.PI * 2,
        magnetism: Math.random() * 0.4 + 0.1,
      });
    }
  }, [particleCount, disabled]);

  useEffect(() => {
    if (disabled || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initParticles();
    };

    resizeCanvas();

    const handleMouseMove = throttle((e) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    }, 16);

    const animate = () => {
      if (!ctx || !canvas) return;
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particlesRef.current.forEach((particle, index) => {
        // Mouse interaction
        const dx = mouseRef.current.x - particle.x;
        const dy = mouseRef.current.y - particle.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 120) {
          const force = (120 - distance) * 0.00012;
          particle.vx += (dx / (distance || 1)) * force * particle.magnetism;
          particle.vy += (dy / (distance || 1)) * force * particle.magnetism;
        }

        // Apply friction and movement
        particle.vx *= 0.999;
        particle.vy *= 0.999;
        particle.x += particle.vx;
        particle.y += particle.vy;

        // Boundary wrapping
        if (particle.x < -20) particle.x = canvas.width + 20;
        if (particle.x > canvas.width + 20) particle.x = -20;
        if (particle.y < -20) particle.y = canvas.height + 20;
        if (particle.y > canvas.height + 20) particle.y = -20;

        // Pulsing effect
        particle.pulsePhase += 0.015;
        const pulse = Math.sin(particle.pulsePhase) * 0.4 + 0.6;
        particle.size = particle.originalSize * pulse;

        // Render particle with glow
        const alpha = particle.alpha * (0.7 + pulse * 0.3);
        const gradient = ctx.createRadialGradient(
          particle.x, particle.y, 0,
          particle.x, particle.y, particle.size * 8
        );

        gradient.addColorStop(0, `hsla(${particle.hue}, 80%, 60%, ${alpha})`);
        gradient.addColorStop(0.3, `hsla(${particle.hue}, 80%, 50%, ${alpha * 0.6})`);
        gradient.addColorStop(1, 'transparent');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size * 8, 0, Math.PI * 2);
        ctx.fill();

        // Connection lines between nearby particles
        particlesRef.current.slice(index + 1).forEach((otherParticle) => {
          const dx2 = particle.x - otherParticle.x;
          const dy2 = particle.y - otherParticle.y;
          const dist = Math.sqrt(dx2 * dx2 + dy2 * dy2);

          if (dist < 80) {
            const opacity = Math.max(0, (1 - dist / 80) * 0.2);
            ctx.strokeStyle = `hsla(${(particle.hue + otherParticle.hue) / 2}, 70%, 60%, ${opacity})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(particle.x, particle.y);
            ctx.lineTo(otherParticle.x, otherParticle.y);
            ctx.stroke();
          }
        });
      });

      animationIdRef.current = requestAnimationFrame(animate);
    };

    animate();

    const handleResize = throttle(resizeCanvas, 150);
    
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
    };
  }, [disabled, initParticles]);

  if (disabled) return null;

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none opacity-60"
      style={{ zIndex: 1 }}
      aria-hidden="true"
    />
  );
};

/**
 * Enhanced Scroll Progress Indicator
 */
const ScrollProgress = () => {
  const { scrollYProgress } = useScroll();
  const scaleX = useTransform(scrollYProgress, [0, 1], [0, 1]);
  const opacity = useTransform(scrollYProgress, [0, 0.1, 0.9, 1], [0, 1, 1, 0]);

  return (
    <motion.div
      className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-500 transform-gpu z-50 origin-left"
      style={{ scaleX, opacity }}
      aria-hidden="true"
    />
  );
};

/**
 * Enhanced Background Elements
 */
const BackgroundElements = ({ reducedMotion, deviceType }) => {
  const isMobile = deviceType === 'mobile';
  
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
      {/* Animated gradient orbs */}
      <motion.div
        className="absolute top-1/4 left-1/4 w-72 h-72 md:w-96 md:h-96 bg-gradient-to-br from-purple-600/30 via-blue-600/20 to-transparent rounded-full blur-3xl"
        animate={reducedMotion ? {} : {
          scale: [1, 1.3, 1],
          opacity: [0.2, 0.4, 0.2],
          x: [0, isMobile ? 20 : 60, 0],
          y: [0, isMobile ? -15 : -40, 0],
        }}
        transition={{
          duration: isMobile ? 6 : 8,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      <motion.div
        className="absolute bottom-1/3 right-1/4 w-64 h-64 md:w-80 md:h-80 bg-gradient-to-br from-cyan-600/25 via-blue-600/20 to-transparent rounded-full blur-3xl"
        animate={reducedMotion ? {} : {
          scale: [1.2, 1, 1.2],
          opacity: [0.3, 0.5, 0.3],
          x: [0, isMobile ? -20 : -50, 0],
          y: [0, isMobile ? 20 : 50, 0],
        }}
        transition={{
          duration: isMobile ? 8 : 10,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 2,
        }}
      />

      {/* Subtle grid pattern */}
      <div className="absolute inset-0 opacity-[0.03]">
        <div
          className="w-full h-full"
          style={{
            backgroundImage: `
              radial-gradient(circle at 25% 25%, white 1px, transparent 1px),
              radial-gradient(circle at 75% 75%, white 1px, transparent 1px)
            `,
            backgroundSize: `${isMobile ? '40px 40px' : '60px 60px'}, ${isMobile ? '40px 40px' : '60px 60px'}`,
            backgroundPosition: '0 0, 20px 20px',
          }}
        />
      </div>

      {/* Floating sparkles */}
      {!isMobile && [...Array(reducedMotion ? 3 : 8)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-white/30 rounded-full"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={reducedMotion ? {} : {
            y: [0, -80, 0],
            opacity: [0.1, 0.6, 0.1],
            scale: [1, 1.8, 1],
          }}
          transition={{
            duration: 4 + Math.random() * 3,
            repeat: Infinity,
            delay: Math.random() * 3,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
};

/**
 * Enhanced Section Wrapper with improved animations
 */
const Section = ({ children, className = '', delay = 0, id }) => {
  const { ref, hasIntersected } = useIntersectionObserver({
    threshold: 0.1,
    rootMargin: '-80px 0px',
  });

  return (
    <motion.section
      id={id}
      ref={ref}
      initial={{ opacity: 0, y: 80 }}
      animate={hasIntersected ? { opacity: 1, y: 0 } : { opacity: 0, y: 80 }}
      transition={{
        duration: 0.8,
        delay,
        ease: [0.25, 0.1, 0.25, 1],
      }}
      className={`relative ${className}`}
      role="region"
      aria-labelledby={id ? `${id}-heading` : undefined}
    >
      {children}
    </motion.section>
  );
};

/**
 * Enhanced Gradient Text Component
 */
const GradientText = ({ children, className = '', gradient = 'from-white via-purple-200 to-blue-200', as: Component = 'span' }) => (
  <Component className={`bg-gradient-to-r ${gradient} bg-clip-text text-transparent ${className}`}>
    {children}
  </Component>
);

/**
 * Enhanced Artist Section with improved responsiveness
 */
const ArtistSection = ({ isMobile, reducedMotion }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <Section className="flex justify-center mb-20 md:mb-32 pt-12 md:pt-20" id="artist">
      <motion.div
        className="relative group cursor-pointer"
        onMouseEnter={() => !isMobile && setIsHovered(true)}
        onMouseLeave={() => !isMobile && setIsHovered(false)}
        onTouchStart={() => setIsHovered(true)}
        onTouchEnd={() => setTimeout(() => setIsHovered(false), 2000)}
        whileHover={!isMobile && !reducedMotion ? { scale: 1.02 } : {}}
        whileTap={{ scale: 0.98 }}
        transition={{ duration: 0.4 }}
        role="img"
        aria-label="Interactive artist portrait with animated rings"
      >
        {/* Outer rotating ring */}
        <motion.div
          className="absolute -inset-8 md:-inset-12 rounded-full opacity-50"
          style={{
            background: 'conic-gradient(from 0deg, #8b5cf6, #06b6d4, #d946ef, #f59e0b, #8b5cf6)',
            filter: 'blur(2px)',
          }}
          animate={reducedMotion ? {} : {
            rotate: isHovered ? 360 : 180,
            scale: isHovered ? 1.1 : 1,
          }}
          transition={{
            rotate: {
              duration: 8,
              ease: 'linear',
              repeat: Infinity,
            },
            scale: {
              duration: 0.4,
            },
          }}
        />

        {/* Inner counter-rotating ring */}
        <motion.div
          className="absolute -inset-4 md:-inset-8 rounded-full opacity-35"
          style={{
            background: 'conic-gradient(from 180deg, #06b6d4, #8b5cf6, #06b6d4)',
            filter: 'blur(1px)',
          }}
          animate={reducedMotion ? {} : {
            rotate: isHovered ? -360 : -180,
            scale: isHovered ? 0.9 : 1,
          }}
          transition={{
            rotate: {
              duration: 12,
              ease: 'linear',
              repeat: Infinity,
            },
            scale: {
              duration: 0.4,
            },
          }}
        />

        {/* Main portrait container */}
        <div className="relative w-48 h-48 sm:w-56 sm:h-56 md:w-72 md:h-72 lg:w-80 lg:h-80 rounded-full overflow-hidden backdrop-blur-2xl bg-white/10 border border-white/20 shadow-[0_0_60px_rgba(139,92,246,0.3)]">
          <div className="absolute inset-2 md:inset-3 rounded-full overflow-hidden">
            <motion.img
              src={artistPhoto}
              alt="Bushra Khandoker — Digital artist and creative visionary from Bangladesh"
              className="w-full h-full object-cover object-center rounded-full"
              whileHover={!isMobile && !reducedMotion ? { scale: 1.1 } : {}}
              transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
              loading="eager"
              onLoad={() => setIsLoaded(true)}
              style={{
                filter: isLoaded ? 'none' : 'blur(20px)',
                transition: 'filter 0.3s ease-in-out',
              }}
            />
            
            {/* Image overlay gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent rounded-full" />
            
            {/* Loading placeholder */}
            {!isLoaded && (
              <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 to-blue-600/20 animate-pulse rounded-full" />
            )}
          </div>
        </div>

        {/* Floating accent elements */}
        {[
          {
            delay: 0,
            color: 'from-purple-400 to-pink-500',
            position: '-top-4 -right-4 md:-top-6 md:-right-6',
            size: 'w-3 h-3 md:w-4 md:h-4 lg:w-5 lg:h-5',
          },
          {
            delay: 1.5,
            color: 'from-blue-400 to-cyan-500',
            position: '-bottom-2 -left-2 md:-bottom-4 md:-left-4',
            size: 'w-3 h-3 md:w-4 md:h-4 lg:w-5 lg:h-5',
          },
          {
            delay: 3,
            color: 'from-amber-400 to-rose-500',
            position: 'top-8 -left-6 md:top-12 md:-left-8',
            size: 'w-2 h-2 md:w-3 md:h-3 lg:w-4 lg:h-4',
          },
          {
            delay: 4.5,
            color: 'from-emerald-400 to-blue-500',
            position: 'bottom-12 -right-1 md:bottom-16 md:-right-2',
            size: 'w-2 h-2 md:w-3 md:h-3 lg:w-4 lg:h-4',
          },
        ].map((item, index) => (
          <motion.div
            key={index}
            className={`absolute ${item.size} bg-gradient-to-br ${item.color} rounded-full shadow-lg ${item.position}`}
            animate={reducedMotion ? {} : {
              y: [0, isMobile ? -10 : -20, 0],
              x: [0, Math.sin(item.delay) * (isMobile ? 5 : 10), 0],
              scale: [1, isMobile ? 1.2 : 1.3, 1],
              rotate: [0, 360, 0],
            }}
            transition={{
              duration: isMobile ? 4 : 6,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: item.delay,
            }}
            style={{
              filter: `drop-shadow(0 0 ${isMobile ? 6 : 10}px ${
                item.color.includes('purple') ? '#8b5cf666' :
                item.color.includes('blue') ? '#3b82f666' :
                item.color.includes('amber') ? '#f59e0b66' : '#10b98166'
              })`,
            }}
          />
        ))}
      </motion.div>
    </Section>
  );
};

/**
 * Enhanced Hero Section with improved typography and animations
 */
const HeroSection = ({ name = 'Bushra', deviceType }) => {
  const [displayedText, setDisplayedText] = useState('');
  const fullText = 'Digital Artist & Creative Visionary';
  const isMobile = deviceType === 'mobile';

  useEffect(() => {
    let index = 0;
    const timer = setInterval(() => {
      if (index < fullText.length) {
        setDisplayedText(fullText.slice(0, index + 1));
        index++;
      } else {
        clearInterval(timer);
      }
    }, isMobile ? 60 : 80);

    return () => clearInterval(timer);
  }, [fullText, isMobile]);

  const titleSizes = {
    mobile: 'text-4xl sm:text-5xl',
    tablet: 'text-5xl md:text-6xl',
    desktop: 'text-6xl lg:text-7xl xl:text-8xl',
  };

  return (
    <Section className="mb-24 md:mb-40 px-4 sm:px-6" id="hero">
      <div className="max-w-6xl mx-auto text-center">
        <motion.header
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mb-8 md:mb-12"
        >
          <h1 
            className={`${titleSizes[deviceType]} font-bold tracking-tight leading-tight mb-6 md:mb-8`}
            id="hero-heading"
          >
            <GradientText 
              as="span" 
              className=" mb-2 md:mb-4"
              gradient="from-white via-purple-100 to-blue-100"
            >
              Hello, I'm
            </GradientText>
            <GradientText 
              as="span"
              gradient="from-purple-400 via-blue-400 to-cyan-400" 
           
            >
              {name}
            </GradientText>
          </h1>

          <motion.div 
            className="text-lg sm:text-xl md:text-2xl lg:text-3xl text-gray-300 font-light mb-6 md:mb-8 min-h-[2.5rem] md:min-h-[3rem]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <span className="relative inline-block">
              {displayedText}
              <motion.span 
                className="absolute -bottom-1 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-purple-400 to-transparent"
                initial={{ scaleX: 0, opacity: 0 }}
                animate={{ scaleX: 1, opacity: 0.8 }}
                transition={{ delay: 1.2, duration: 1.5 }}
              />
            </span>
          </motion.div>
        </motion.header>

        <motion.div 
          className="max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
        >
          <p className="text-base sm:text-lg md:text-xl lg:text-2xl leading-relaxed text-gray-300 font-light">
            As a passionate digital artist from Bangladesh, I blend{' '}
            <GradientText 
              gradient="from-purple-400 to-blue-400" 
              className="font-medium relative inline-block group"
            >
              technology and nature
              <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-gradient-to-r from-purple-400 to-blue-400 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
            </GradientText>{' '}
            to create thought-provoking, abstract works of art. My journey began with a love for color, 
            geometry, and the countless possibilities that modern tools unlock. Each piece is a 
            conversation — a study of harmony, contrast, and human emotion.
          </p>
        </motion.div>
      </div>
    </Section>
  );
};

/**
 * Enhanced Philosophy Section with better layout and interactions
 */
const PhilosophySection = ({ reducedMotion, isMobile }) => {
  const [isHovered, setIsHovered] = useState(false);
  const { ref, hasIntersected } = useIntersectionObserver();

  return (
    <Section className="mb-24 md:mb-40 px-4 sm:px-6" delay={0.2} id="philosophy">
      <div className="max-w-7xl mx-auto">
        <motion.div 
          ref={ref}
          className="relative overflow-hidden rounded-2xl md:rounded-3xl backdrop-blur-2xl bg-gradient-to-br from-white/10 via-white/5 to-white/10 border border-white/20 shadow-[0_20px_80px_-15px_rgba(139,92,246,0.4)]"
          onMouseEnter={() => !isMobile && setIsHovered(true)}
          onMouseLeave={() => !isMobile && setIsHovered(false)}
          whileHover={!reducedMotion ? { scale: 1.01 } : {}}
          transition={{ duration: 0.4 }}
        >
          <div className="relative z-10 p-6 sm:p-8 md:p-12 lg:p-16">
            <h2 
              className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-center mb-12 md:mb-16"
              id="philosophy-heading"
            >
              <GradientText gradient="from-purple-300 via-pink-300 to-blue-300">
                Artistic Philosophy
              </GradientText>
            </h2>

            <div className="grid lg:grid-cols-2 gap-8 md:gap-12 items-center">
              <motion.div 
                className="space-y-6 md:space-y-8"
                initial={{ opacity: 0, x: -30 }}
                animate={hasIntersected ? { opacity: 1, x: 0 } : { opacity: 0, x: -30 }}
                transition={{ duration: 0.8 }}
              >
                <p className="text-base sm:text-lg md:text-xl lg:text-2xl leading-relaxed text-gray-200">
                  My artistic philosophy is rooted in the exploration of{' '}
                  <GradientText 
                    gradient="from-purple-300 to-pink-300" 
                    className="font-medium"
                  >
                    contrast and harmony
                  </GradientText>
                  . Through digital manipulation I aim to bring life to abstract ideas, combining 
                  bold strokes with softer gradients to create visual tension and serenity at once.
                </p>

                <p className="text-sm sm:text-base md:text-lg lg:text-xl leading-relaxed text-gray-300">
                  Each piece invites the viewer into a world where abstraction meets reality — a 
                  transformative visual experience that encourages curiosity and reflection.
                </p>

                <motion.div 
                  className="w-16 md:w-24 h-1 bg-gradient-to-r from-purple-400 to-blue-400 rounded-full"
                  initial={{ width: 0 }}
                  animate={hasIntersected ? { width: isMobile ? 64 : 96 } : { width: 0 }}
                  transition={{ delay: 0.6, duration: 1 }}
                />
              </motion.div>

              <motion.div 
                className="relative"
                initial={{ opacity: 0, x: 30 }}
                animate={hasIntersected ? { opacity: 1, x: 0 } : { opacity: 0, x: 30 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                <div className="aspect-square max-w-xs md:max-w-sm mx-auto rounded-2xl md:rounded-3xl bg-gradient-to-br from-purple-600/20 via-blue-600/20 to-pink-600/20 backdrop-blur-sm border border-white/10 flex items-center justify-center relative overflow-hidden">
                  <motion.div 
                    className="text-6xl md:text-7xl lg:text-8xl xl:text-9xl"
                    animate={reducedMotion ? {} : {
                      rotate: isHovered ? [0, 10, -10, 0] : [0, 2, -2, 0],
                      scale: isHovered ? [1, 1.1, 1] : [1, 1.02, 1],
                    }}
                    transition={{
                      duration: isHovered ? 4 : 8,
                      ease: 'easeInOut',
                      repeat: Infinity,
                    }}
                  >
                    🎨
                  </motion.div>

                  {/* Floating decorative elements */}
                  {!reducedMotion && [...Array(5)].map((_, i) => (
                    <motion.div 
                      key={i}
                      className="absolute w-1.5 h-1.5 md:w-2 md:h-2 bg-white/30 rounded-full"
                      style={{
                        left: `${20 + Math.random() * 60}%`,
                        top: `${20 + Math.random() * 60}%`,
                      }}
                      animate={{
                        y: [0, -15, 0],
                        x: [0, Math.sin(i) * 8, 0],
                        opacity: [0.2, 0.6, 0.2],
                      }}
                      transition={{
                        duration: 3 + Math.random() * 2,
                        repeat: Infinity,
                        delay: Math.random() * 2,
                        ease: 'easeInOut',
                      }}
                    />
                  ))}
                </div>
              </motion.div>
            </div>
          </div>

          {/* Hover effect overlay */}
          <motion.div 
            className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-blue-500/10 to-pink-500/10"
            initial={{ opacity: 0 }}
            animate={{ opacity: isHovered ? 1 : 0 }}
            transition={{ duration: 0.4 }}
          />
        </motion.div>
      </div>
    </Section>
  );
};

/**
 * Enhanced Inspirations Section with improved card design
 */
const InspirationsSection = ({ reducedMotion, deviceType }) => {
  const isMobile = deviceType === 'mobile';
  const { ref, hasIntersected } = useIntersectionObserver();

  const inspirations = [
    {
      title: "Nature's Patterns",
      description: "Organic forms and natural algorithms inspire my digital compositions, bringing balance and mathematical beauty to each piece.",
      icon: '🌿',
      gradient: 'from-emerald-400 via-green-400 to-teal-400',
      bgGradient: 'from-emerald-600/20 to-green-600/20',
      iconBg: 'from-emerald-500/20 to-green-500/20',
    },
    {
      title: 'Digital Innovation',
      description: 'Emerging tools and experimentation let me push beyond traditional artistic boundaries, mixing code-driven forms with hand-crafted gestures.',
      icon: '⚡',
      gradient: 'from-blue-400 via-cyan-400 to-sky-400',
      bgGradient: 'from-blue-600/20 to-cyan-600/20',
      iconBg: 'from-blue-500/20 to-cyan-500/20',
    },
    {
      title: 'Human Connection',
      description: 'I aim to translate universal emotions into visual narratives that connect across cultures and time.',
      icon: '💫',
      gradient: 'from-purple-400 via-pink-400 to-rose-400',
      bgGradient: 'from-purple-600/20 to-pink-600/20',
      iconBg: 'from-purple-500/20 to-pink-500/20',
    },
  ];

  return (
    <Section className="mb-24 md:mb-40 px-4 sm:px-6" delay={0.4} id="inspirations">
      <div className="max-w-7xl mx-auto" ref={ref}>
        <h2 
          className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-center mb-12 md:mb-20"
          id="inspirations-heading"
        >
          <GradientText gradient="from-blue-300 via-purple-300 to-pink-300">
            Creative Inspirations
          </GradientText>
        </h2>

        <div className="grid md:grid-cols-3 gap-6 md:gap-8 lg:gap-12">
          {inspirations.map((inspiration, index) => (
            <motion.article 
              key={index}
              className="group relative overflow-hidden rounded-2xl md:rounded-3xl backdrop-blur-xl bg-gradient-to-br from-white/10 to-white/5 border border-white/20 p-6 sm:p-8 md:p-10 lg:p-12 cursor-pointer"
              initial={{ opacity: 0, y: 50 }}
              animate={hasIntersected ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
              transition={{ duration: 0.8, delay: index * 0.2 }}
              whileHover={!reducedMotion ? { 
                y: -10, 
                scale: 1.02,
                boxShadow: '0 25px 50px -15px rgba(139,92,246,0.4)',
              } : {}}
              whileTap={{ scale: 0.98 }}
            >
              <div className="relative z-10 text-center">
                <motion.div 
                  className="relative inline-block mb-6 md:mb-8"
                  whileHover={!reducedMotion ? { 
                    rotate: [0, -10, 10, 0], 
                    scale: [1, 1.2, 1] 
                  } : {}}
                  transition={{ duration: 0.6 }}
                >
                  <div className={`text-4xl sm:text-5xl md:text-6xl lg:text-7xl relative z-10`}>
                    {inspiration.icon}
                  </div>
                  <div className={`absolute inset-0 bg-gradient-to-br ${inspiration.iconBg} opacity-40 blur-xl scale-150 -z-10`} />
                </motion.div>

                <h3 
                  className={`text-lg sm:text-xl md:text-2xl font-bold mb-4 md:mb-6 bg-gradient-to-r ${inspiration.gradient} bg-clip-text text-transparent`}
                >
                  {inspiration.title}
                </h3>
                
                <p className="text-gray-300 leading-relaxed text-sm sm:text-base md:text-base mb-4 md:mb-6">
                  {inspiration.description}
                </p>

                <motion.div 
                  className={`w-12 md:w-16 h-1 mx-auto bg-gradient-to-r ${inspiration.gradient} rounded-full`}
                  initial={{ width: 0, opacity: 0 }}
                  animate={hasIntersected ? { 
                    width: isMobile ? 48 : 64, 
                    opacity: 1 
                  } : { width: 0, opacity: 0 }}
                  transition={{ delay: 0.6 + index * 0.2, duration: 0.8 }}
                />
              </div>

              {/* Hover effect overlay */}
              <motion.div 
                className={`absolute inset-0 bg-gradient-to-br ${inspiration.bgGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
              />

              {/* Decorative corner elements */}
              <div className="absolute top-4 md:top-6 right-4 md:right-6 w-6 md:w-8 h-6 md:h-8 border border-white/10 rounded-full" />
              <div className="absolute bottom-4 md:bottom-6 left-4 md:left-6 w-4 md:w-6 h-4 md:h-6 border border-white/10 rounded-full" />
            </motion.article>
          ))}
        </div>
      </div>
    </Section>
  );
};



// ========================================================================================
// MAIN COMPONENT
// ========================================================================================

/**
 * Enhanced AboutMe Page Component
 * 
 * Features:
 * - Comprehensive SEO optimization with structured data
 * - Full responsive design with mobile-first approach
 * - Performance optimizations for all device types
 * - Enhanced accessibility with proper ARIA labels
 * - Reduced motion support for user preferences
 * - Progressive loading and error handling
 * - Comprehensive documentation
 */
const AboutMe = () => {
  const [isMounted, setIsMounted] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  
  const responsive = useResponsive();
  const prefersReducedMotion = useReducedMotion();

  // Enhanced mounting and initialization
  useEffect(() => {
    let mounted = true;

    // Initialize page styles and behaviors
    const initializePage = async () => {
      try {
        // Set initial body styles for smooth scrolling
        document.body.style.overflowX = 'hidden';
        document.body.style.overflowY = 'auto';
        document.documentElement.style.scrollBehavior = 'smooth';

        // Simulate loading progress for smoother UX
        const progressSteps = [20, 40, 60, 80, 100];
        for (const step of progressSteps) {
          if (!mounted) return;
          setLoadingProgress(step);
          await new Promise(resolve => setTimeout(resolve, 100));
        }

        if (mounted) {
          setIsMounted(true);
        }
      } catch (error) {
        console.error('Page initialization error:', error);
        if (mounted) {
          setIsMounted(true); // Failsafe to show content
        }
      }
    };

    initializePage();

    return () => {
      mounted = false;
      document.documentElement.style.scrollBehavior = '';
    };
  }, []);

  // Loading screen with progress indicator
  if (!isMounted) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center">
        <motion.div 
          className="w-16 h-16 md:w-20 md:h-20 border-4 border-purple-500/30 border-t-purple-500 rounded-full mb-6"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          aria-hidden="true"
        />
        
        <div className="w-48 md:w-64 h-1 bg-white/10 rounded-full overflow-hidden mb-4">
          <motion.div 
            className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full"
            initial={{ width: '0%' }}
            animate={{ width: `${loadingProgress}%` }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          />
        </div>
        
        <p className="text-gray-400 text-sm md:text-base" role="status" aria-live="polite">
          Loading... {loadingProgress}%
        </p>
      </div>
    );
  }

  // Determine if heavy animations should be disabled
  const heavyAnimationsDisabled = responsive.isMobile || prefersReducedMotion;

  return (
    <>
      {/* Comprehensive SEO and Meta Tags */}
      <Helmet>
        <html lang="en" />
        <title>Bushra Khandoker — Digital Artist & Creative Visionary | Contemporary Art Portfolio</title>
        
        {/* Enhanced Meta Description */}
        <meta 
          name="description" 
          content="Explore Bushra Khandoker's innovative digital art portfolio. A talented artist from Bangladesh creating abstract, thought-provoking artworks that blend technology with nature. Discover contemporary digital art, creative philosophy, and artistic inspirations." 
        />
        
        {/* Enhanced Keywords */}
        <meta 
          name="keywords" 
          content="Bushra Khandoker, digital artist, Bangladesh artist, contemporary art, abstract art, digital art portfolio, creative visionary, technology art, nature-inspired art, modern digital art, artistic philosophy, creative inspirations" 
        />
        
        <meta name="author" content="Bushra Khandoker" />
        <meta name="robots" content="index, follow, max-image-preview:large" />
        <meta name="googlebot" content="index, follow" />
        
        {/* Viewport and Mobile Optimization */}
        <meta name="viewport" content="width=device-width, initial-scale=1.0, shrink-to-fit=no" />
        <meta name="format-detection" content="telephone=no" />
        
        {/* Enhanced Open Graph Tags */}
        <meta property="og:title" content="Bushra Khandoker — Digital Artist & Creative Visionary" />
        <meta property="og:description" content="Discover innovative digital artworks by Bushra Khandoker, a talented artist from Bangladesh who creates abstract pieces blending technology with nature." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://yourdomain.com/about" />
        <meta property="og:site_name" content="Bushra Khandoker Art Portfolio" />
        <meta property="og:locale" content="en_US" />
        <meta property="og:image" content="https://yourdomain.com/social-preview-bushra.jpg" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content="Bushra Khandoker - Digital Artist Portfolio Preview" />
        
        {/* Enhanced Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@bushra_art" />
        <meta name="twitter:creator" content="@bushra_art" />
        <meta name="twitter:title" content="Bushra Khandoker — Digital Artist & Creative Visionary" />
        <meta name="twitter:description" content="Explore contemporary digital art that blends technology with nature. Abstract artworks and creative philosophy by Bangladesh artist Bushra Khandoker." />
        <meta name="twitter:image" content="https://yourdomain.com/social-preview-bushra.jpg" />
        
        {/* Canonical URL */}
        <link rel="canonical" href="https://yourdomain.com/about" />
        
        {/* Preconnect for Performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin />
        
        {/* Theme Color for Mobile Browsers */}
        <meta name="theme-color" content="#8b5cf6" />
        <meta name="msapplication-TileColor" content="#8b5cf6" />
        
        {/* Enhanced Structured Data */}
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Person",
          "name": "Bushra Khandoker",
          "url": "https://yourdomain.com",
          "image": "https://yourdomain.com/assets/Bushra.jpg",
          "sameAs": [
            "https://instagram.com/bushra_art",
            "https://twitter.com/bushra_art",
            "https://linkedin.com/in/bushra-khandoker"
          ],
          "jobTitle": "Digital Artist",
          "worksFor": {
            "@type": "Organization",
            "name": "Independent Artist"
          },
          "nationality": {
            "@type": "Country",
            "name": "Bangladesh"
          },
          "description": "Digital artist and creative visionary from Bangladesh, specializing in abstract artworks that blend technology with nature.",
          "knowsAbout": [
            "Digital Art",
            "Abstract Art",
            "Contemporary Art",
            "Creative Technology",
            "Visual Design"
          ],
          "alumniOf": {
            "@type": "EducationalOrganization",
            "name": "Art Institution"
          }
        })}</script>

        {/* Additional Structured Data for Creative Work */}
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "CreativeWork",
          "name": "Bushra Khandoker Art Portfolio",
          "author": {
            "@type": "Person",
            "name": "Bushra Khandoker"
          },
          "description": "A collection of digital artworks exploring the intersection of technology and nature",
          "dateCreated": "2024",
          "inLanguage": "en-US",
          "genre": "Digital Art",
          "artform": "Digital Art"
        })}</script>
      </Helmet>

      <main 
        className="min-h-screen bg-black text-white relative overflow-x-hidden"
        role="main"
        aria-label="Bushra Khandoker - Digital Artist Portfolio"
      >
        {/* Performance-conscious UI elements */}
        <ScrollProgress />
        
   
        
        <BackgroundElements 
          reducedMotion={prefersReducedMotion} 
          deviceType={responsive.deviceType} 
        />
        
        <FloatingParticles 
          disabled={heavyAnimationsDisabled}
          deviceType={responsive.deviceType}
        />

        {/* Main Content */}
        <div className="relative z-10">
          <div className="max-w-8xl mx-auto">
            {/* Skip to main content link for accessibility */}
            <a 
              href="#hero" 
              className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-purple-600 text-white px-4 py-2 rounded-md z-50"
            >
              Skip to main content
            </a>

            <ArtistSection 
              isMobile={responsive.isMobile}
              reducedMotion={prefersReducedMotion}
            />
            
            <HeroSection 
              name="Bushra"
              deviceType={responsive.deviceType}
            />
            
            <PhilosophySection 
              reducedMotion={prefersReducedMotion}
              isMobile={responsive.isMobile}
            />
            
            <InspirationsSection 
              reducedMotion={prefersReducedMotion}
              deviceType={responsive.deviceType}
            />
            

            
           
          </div>
        </div>

        {/* Performance monitoring and error boundary would go here in production */}
      </main>
    </>
  );
};

export default AboutMe;