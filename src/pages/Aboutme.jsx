import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { 
  motion, 
  useScroll, 
  useTransform, 
  useInView, 
  AnimatePresence, 
  useReducedMotion 
} from 'framer-motion';

// Keep the original image path as requested
import artistPhoto from '../assets/Bushra.jpg';

// ========================================================================================
// CONSTANTS & CONFIGURATION
// ========================================================================================

const PERFORMANCE_CONFIG = {
  THROTTLE_MS: 120,
  PARTICLE_COUNT: {
    DESKTOP: 50,
    TABLET: 30,
    MOBILE: 15,
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

      // Update CSS custom properties
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
 * Enhanced intersection observer hook
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
 * Floating Particles Background Component
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
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        size: Math.random() * 2 + 0.5,
        originalSize: Math.random() * 2 + 0.5,
        alpha: Math.random() * 0.6 + 0.2,
        hue: Math.random() * 360,
        pulsePhase: Math.random() * Math.PI * 2,
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

      particlesRef.current.forEach((particle) => {
        // Mouse interaction
        const dx = mouseRef.current.x - particle.x;
        const dy = mouseRef.current.y - particle.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 100) {
          const force = (100 - distance) * 0.0001;
          particle.vx += (dx / (distance || 1)) * force;
          particle.vy += (dy / (distance || 1)) * force;
        }

        // Apply movement with gentle friction
        particle.vx *= 0.998;
        particle.vy *= 0.998;
        particle.x += particle.vx;
        particle.y += particle.vy;

        // Boundary wrapping
        if (particle.x < -20) particle.x = canvas.width + 20;
        if (particle.x > canvas.width + 20) particle.x = -20;
        if (particle.y < -20) particle.y = canvas.height + 20;
        if (particle.y > canvas.height + 20) particle.y = -20;

        // Gentle pulsing
        particle.pulsePhase += 0.01;
        const pulse = Math.sin(particle.pulsePhase) * 0.3 + 0.7;
        particle.size = particle.originalSize * pulse;

        // Render with soft glow
        const alpha = particle.alpha * (0.6 + pulse * 0.4);
        const gradient = ctx.createRadialGradient(
          particle.x, particle.y, 0,
          particle.x, particle.y, particle.size * 6
        );

        gradient.addColorStop(0, `hsla(${particle.hue}, 70%, 60%, ${alpha})`);
        gradient.addColorStop(0.5, `hsla(${particle.hue}, 70%, 50%, ${alpha * 0.4})`);
        gradient.addColorStop(1, 'transparent');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size * 6, 0, Math.PI * 2);
        ctx.fill();
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
      className="fixed inset-0 pointer-events-none opacity-40"
      style={{ zIndex: 1 }}
      aria-hidden="true"
    />
  );
};

/**
 * Scroll Progress Indicator
 */
const ScrollProgress = () => {
  const { scrollYProgress } = useScroll();
  const scaleX = useTransform(scrollYProgress, [0, 1], [0, 1]);
  const opacity = useTransform(scrollYProgress, [0, 0.1, 0.9, 1], [0, 1, 1, 0]);

  return (
    <motion.div
      className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 via-rose-500 to-violet-500 transform-gpu z-50 origin-left"
      style={{ scaleX, opacity }}
      aria-hidden="true"
    />
  );
};

/**
 * Background Elements with Art-inspired Gradients
 */
const BackgroundElements = ({ reducedMotion, deviceType }) => {
  const isMobile = deviceType === 'mobile';
  
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
      {/* Artistic gradient orbs inspired by paint mixing */}
      <motion.div
        className="absolute top-1/4 left-1/4 w-64 h-64 md:w-96 md:h-96 bg-gradient-to-br from-amber-600/20 via-rose-600/15 to-transparent rounded-full blur-3xl"
        animate={reducedMotion ? {} : {
          scale: [1, 1.2, 1],
          opacity: [0.15, 0.3, 0.15],
          x: [0, isMobile ? 30 : 80, 0],
          y: [0, isMobile ? -20 : -60, 0],
        }}
        transition={{
          duration: isMobile ? 8 : 12,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      <motion.div
        className="absolute bottom-1/3 right-1/4 w-48 h-48 md:w-80 md:h-80 bg-gradient-to-br from-violet-600/20 via-blue-600/15 to-transparent rounded-full blur-3xl"
        animate={reducedMotion ? {} : {
          scale: [1.1, 0.9, 1.1],
          opacity: [0.2, 0.35, 0.2],
          x: [0, isMobile ? -30 : -70, 0],
          y: [0, isMobile ? 30 : 80, 0],
        }}
        transition={{
          duration: isMobile ? 10 : 15,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 3,
        }}
      />

      {/* Subtle texture overlay */}
      <div className="absolute inset-0 opacity-[0.02]">
        <div
          className="w-full h-full"
          style={{
            backgroundImage: `
              radial-gradient(circle at 30% 40%, rgba(245, 158, 11, 0.1) 1px, transparent 1px),
              radial-gradient(circle at 70% 80%, rgba(139, 92, 246, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: `${isMobile ? '50px 50px' : '80px 80px'}, ${isMobile ? '50px 50px' : '80px 80px'}`,
            backgroundPosition: '0 0, 25px 25px',
          }}
        />
      </div>
    </div>
  );
};

/**
 * Section Wrapper with Intersection Observer
 */
const Section = ({ children, className = '', delay = 0, id }) => {
  const { ref, hasIntersected } = useIntersectionObserver({
    threshold: 0.1,
    rootMargin: '-60px 0px',
  });

  return (
    <motion.section
      id={id}
      ref={ref}
      initial={{ opacity: 0, y: 60 }}
      animate={hasIntersected ? { opacity: 1, y: 0 } : { opacity: 0, y: 60 }}
      transition={{
        duration: 0.8,
        delay,
        ease: [0.25, 0.1, 0.25, 1],
      }}
      className={`relative ${className}`}
      role="region"
    >
      {children}
    </motion.section>
  );
};

/**
 * Gradient Text Component
 */
const GradientText = ({ 
  children, 
  className = '', 
  gradient = 'from-white via-amber-100 to-rose-100', 
  as: Component = 'span' 
}) => (
  <Component className={`bg-gradient-to-r ${gradient} bg-clip-text text-transparent ${className}`}>
    {children}
  </Component>
);

/**
 * Enhanced Artist Portrait Section
 */
const ArtistSection = ({ isMobile, reducedMotion }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <Section className="flex justify-center mb-16 md:mb-24 pt-8 md:pt-16" id="artist">
      <motion.div
        className="relative group cursor-pointer"
        onMouseEnter={() => !isMobile && setIsHovered(true)}
        onMouseLeave={() => !isMobile && setIsHovered(false)}
        onTouchStart={() => setIsHovered(true)}
        onTouchEnd={() => setTimeout(() => setIsHovered(false), 2000)}
        whileHover={!isMobile && !reducedMotion ? { scale: 1.02 } : {}}
        whileTap={{ scale: 0.98 }}
        transition={{ duration: 0.4 }}
      >
        {/* Rotating art-inspired rings */}
        <motion.div
          className="absolute -inset-6 md:-inset-10 rounded-full opacity-40"
          style={{
            background: 'conic-gradient(from 0deg, #f59e0b, #ef4444, #8b5cf6, #06b6d4, #f59e0b)',
            filter: 'blur(2px)',
          }}
          animate={reducedMotion ? {} : {
            rotate: isHovered ? 360 : 180,
            scale: isHovered ? 1.1 : 1,
          }}
          transition={{
            rotate: {
              duration: 10,
              ease: 'linear',
              repeat: Infinity,
            },
            scale: {
              duration: 0.5,
            },
          }}
        />

        <motion.div
          className="absolute -inset-3 md:-inset-6 rounded-full opacity-30"
          style={{
            background: 'conic-gradient(from 180deg, #ec4899, #8b5cf6, #06b6d4, #ec4899)',
            filter: 'blur(1px)',
          }}
          animate={reducedMotion ? {} : {
            rotate: isHovered ? -360 : -180,
            scale: isHovered ? 0.95 : 1,
          }}
          transition={{
            rotate: {
              duration: 15,
              ease: 'linear',
              repeat: Infinity,
            },
            scale: {
              duration: 0.5,
            },
          }}
        />

        {/* Main portrait */}
        <div className="relative w-40 h-40 sm:w-48 sm:h-48 md:w-64 md:h-64 lg:w-72 lg:h-72 rounded-full overflow-hidden backdrop-blur-xl bg-white/10 border border-white/20 shadow-2xl">
          <div className="absolute inset-2 md:inset-3 rounded-full overflow-hidden">
            <motion.img
              src={artistPhoto}
              alt="Bushra Khandoker — Multidisciplinary visual artist from Bangladesh"
              className="w-full h-full object-cover object-center rounded-full"
              whileHover={!isMobile && !reducedMotion ? { scale: 1.1 } : {}}
              transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
              loading="eager"
              onLoad={() => setIsLoaded(true)}
              style={{
                filter: isLoaded ? 'none' : 'blur(10px)',
                transition: 'filter 0.3s ease',
              }}
            />
            
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent rounded-full" />
            
            {!isLoaded && (
              <div className="absolute inset-0 bg-gradient-to-br from-amber-500/20 to-violet-500/20 animate-pulse rounded-full" />
            )}
          </div>
        </div>

        {/* Floating art tools */}
        {[
          { tool: '🎨', delay: 0, position: '-top-3 -right-3 md:-top-4 md:-right-4' },
          { tool: '✏️', delay: 2, position: '-bottom-2 -left-2 md:-bottom-3 md:-left-3' },
          { tool: '🖌️', delay: 4, position: 'top-6 -left-4 md:top-8 md:-left-6' },
          { tool: '⚡', delay: 6, position: 'bottom-8 -right-1 md:bottom-12 md:-right-2' },
        ].map((item, index) => (
          <motion.div
            key={index}
            className={`absolute text-lg md:text-2xl ${item.position}`}
            animate={reducedMotion ? {} : {
              y: [0, -15, 0],
              rotate: [0, 15, -15, 0],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: item.delay,
            }}
          >
            {item.tool}
          </motion.div>
        ))}
      </motion.div>
    </Section>
  );
};

/**
 * Hero Section with Artist Information
 */
const HeroSection = ({ name = 'Bushra', deviceType }) => {
  const [displayedText, setDisplayedText] = useState('');
  const tagline = 'Digital artist & maker — sketches, acrylic, watercolor, 3D modeling, digital art, and sculpture. I turn imagined worlds into tangible experiences.';
  const isMobile = deviceType === 'mobile';

  useEffect(() => {
    let index = 0;
    const timer = setInterval(() => {
      if (index < tagline.length) {
        setDisplayedText(tagline.slice(0, index + 1));
        index++;
      } else {
        clearInterval(timer);
      }
    }, isMobile ? 30 : 40);

    return () => clearInterval(timer);
  }, [tagline, isMobile]);

  return (
    <Section className="mb-20 md:mb-32 px-4 sm:px-6" id="hero">
      <div className="max-w-6xl mx-auto text-center">
        <motion.header
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mb-8 md:mb-12"
        >
          <h1 className="text-xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold tracking-tight leading-tight mb-6 md:mb-8">
            <GradientText 
             
             
              gradient="from-white via-amber-100 to-rose-100"
            >
              Hello, I'm
            </GradientText>
            <GradientText 
             
              gradient="from-amber-400 via-rose-400 to-violet-400"
            >
              {name}
            </GradientText>
          </h1>

          <motion.div 
            className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-300 font-light mb-8 md:mb-12 max-w-4xl mx-auto leading-relaxed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <span className="relative inline-block">
              {displayedText}
              <motion.span 
                className="absolute top-0 -right-1 w-0.5 h-full bg-amber-400"
                animate={{ opacity: [1, 0, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              />
            </span>
          </motion.div>
        </motion.header>

        <motion.div 
          className="max-w-5xl mx-auto"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
        >
          <p className="text-base sm:text-lg md:text-xl leading-relaxed text-gray-200 font-light">
            I am Bushra Khandoker, a multidisciplinary visual artist from Bangladesh. I work across sketching, acrylic and watercolor painting, 3D modeling, digital composition, and sculpture — always with one goal: to translate inner imagination into real, touchable form. My practice blends{' '}
            <GradientText 
              gradient="from-amber-400 to-rose-400" 
              className="font-medium"
            >
              hands-on craft with computational processes
            </GradientText>
            , exploring color, geometry, and texture to create pieces that invite curiosity and emotional connection. Each work is a prototype of a thought — designed to be seen, felt, and experienced.
          </p>
        </motion.div>
      </div>
    </Section>
  );
};

/**
 * Artist Philosophy Section
 */
const PhilosophySection = ({ reducedMotion, isMobile }) => {
  const [isHovered, setIsHovered] = useState(false);
  const { ref, hasIntersected } = useIntersectionObserver();

  const statement = `My work sits at the meeting point of observation and invention. I begin with simple marks — a pencil line or a quick watercolor study — and follow the idea through layers of material and method until it becomes a finished object: a painting, a rendered scene, or a small sculptural form. I use traditional techniques (sketch, acrylic, watercolor) alongside digital tools and 3D modeling to push ideas between the physical and the virtual.

The central aim of my practice is transformation: to make internal landscapes visible and to test how imagination behaves when given material constraints. I'm interested in how color systems, geometric rhythm, and textural contrast can be composed to produce emotional weight and narrative ambiguity. At times the work is intimate — small drawings or tactile sculptures — and at times it expands into immersive, screen-based pieces that invite longer attention.

Looking forward, I'm exploring hybrid work that fuses algorithmic processes with handmade techniques — for example, using generative patterns as a scaffold for hand-painted surfaces, or translating 3D prints into painted and cast sculptures. I work experimentally: prototypes, rapid iterations, and collaborations are part of my process. My practice is driven by the conviction that imagination should be given form — not only to be seen, but to be touched, questioned, and shared.`;

  return (
    <Section className="mb-20 md:mb-32 px-4 sm:px-6" delay={0.2} id="philosophy">
      <div className="max-w-7xl mx-auto">
        <motion.div 
          ref={ref}
          className="relative overflow-hidden rounded-2xl md:rounded-3xl backdrop-blur-xl bg-gradient-to-br from-white/8 via-white/4 to-white/8 border border-white/20"
          onMouseEnter={() => !isMobile && setIsHovered(true)}
          onMouseLeave={() => !isMobile && setIsHovered(false)}
          whileHover={!reducedMotion ? { y: -5 } : {}}
          transition={{ duration: 0.3 }}
        >
          <div className="relative z-10 p-6 sm:p-8 md:p-12 lg:p-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-center mb-8 md:mb-12">
              <GradientText gradient="from-amber-300 via-rose-300 to-violet-300">
                Artist Statement
              </GradientText>
            </h2>

            <div className="grid lg:grid-cols-3 gap-8 md:gap-12">
              <motion.div 
                className="lg:col-span-2 space-y-6 md:space-y-8"
                initial={{ opacity: 0, x: -30 }}
                animate={hasIntersected ? { opacity: 1, x: 0 } : { opacity: 0, x: -30 }}
                transition={{ duration: 0.8 }}
              >
                {statement.split('\n\n').map((paragraph, index) => (
                  <p key={index} className="text-sm sm:text-base md:text-lg leading-relaxed text-gray-200 first-letter:text-2xl first-letter:font-bold first-letter:text-amber-400 first-letter:float-left first-letter:mr-2 first-letter:mt-1">
                    {paragraph}
                  </p>
                ))}
              </motion.div>

              <motion.div 
                className="relative"
                initial={{ opacity: 0, x: 30 }}
                animate={hasIntersected ? { opacity: 1, x: 0 } : { opacity: 0, x: 30 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                <div className="aspect-square rounded-2xl bg-gradient-to-br from-amber-600/15 via-rose-600/15 to-violet-600/15 backdrop-blur-sm border border-white/10 flex flex-col items-center justify-center p-6 text-center relative overflow-hidden">
                  <motion.div 
                    className="text-4xl md:text-5xl mb-4"
                    animate={reducedMotion ? {} : {
                      rotate: isHovered ? [0, 5, -5, 0] : 0,
                      scale: isHovered ? [1, 1.1, 1] : 1,
                    }}
                    transition={{ duration: 2, ease: 'easeInOut' }}
                  >
                    🎭
                  </motion.div>
                  
                  <h3 className="text-lg md:text-xl font-semibold mb-2">
                    <GradientText gradient="from-amber-300 to-rose-300">
                      Creative Process
                    </GradientText>
                  </h3>
                  
                  <p className="text-sm text-gray-300">
                    From sketch to sculpture, each medium informs the next
                  </p>

                  {/* Floating elements */}
                  {!reducedMotion && ['🖊️', '🎨', '💻', '🏺'].map((tool, i) => (
                    <motion.div
                      key={i}
                      className="absolute text-lg opacity-30"
                      style={{
                        left: `${20 + (i * 20)}%`,
                        top: `${15 + (i % 2) * 70}%`,
                      }}
                      animate={{
                        y: [0, -10, 0],
                        rotate: [0, 5, -5, 0],
                      }}
                      transition={{
                        duration: 3 + i,
                        repeat: Infinity,
                        delay: i * 0.5,
                      }}
                    >
                      {tool}
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>

          <motion.div 
            className="absolute inset-0 bg-gradient-to-br from-amber-500/5 via-rose-500/5 to-violet-500/5"
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
 * Creative Mediums Section
 */
const MediumsSection = ({ reducedMotion, deviceType }) => {
  const isMobile = deviceType === 'mobile';
  const { ref, hasIntersected } = useIntersectionObserver();

  const mediums = [
    {
      title: "Traditional Arts",
      description: "Sketching, acrylic painting, and watercolor — the foundation of my visual language and tactile exploration.",
      icon: '🎨',
      gradient: 'from-amber-400 via-orange-400 to-red-400',
      bgGradient: 'from-amber-600/20 to-orange-600/20',
      iconBg: 'from-amber-500/20 to-orange-500/20',
    },
    {
      title: 'Digital Creation',
      description: 'Digital composition and 3D modeling that extends physical possibilities into virtual realms.',
      icon: '💻',
      gradient: 'from-blue-400 via-cyan-400 to-teal-400',
      bgGradient: 'from-blue-600/20 to-cyan-600/20',
      iconBg: 'from-blue-500/20 to-cyan-500/20',
    },
    {
      title: 'Sculptural Form',
      description: 'Three-dimensional works that bring digital concepts into tangible, touchable reality.',
      icon: '🏺',
      gradient: 'from-purple-400 via-pink-400 to-rose-400',
      bgGradient: 'from-purple-600/20 to-pink-600/20',
      iconBg: 'from-purple-500/20 to-pink-500/20',
    },
  ];

  return (
    <Section className="mb-20 md:mb-32 px-4 sm:px-6" delay={0.4} id="mediums">
      <div className="max-w-7xl mx-auto" ref={ref}>
        <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-center mb-12 md:mb-20">
          <GradientText gradient="from-blue-300 via-purple-300 to-pink-300">
            Creative Mediums
          </GradientText>
        </h2>

        <div className="grid md:grid-cols-3 gap-6 md:gap-8 lg:gap-12">
          {mediums.map((medium, index) => (
            <motion.article 
              key={index}
              className="group relative overflow-hidden rounded-2xl md:rounded-3xl backdrop-blur-xl bg-gradient-to-br from-white/8 to-white/4 border border-white/20 p-6 sm:p-8 md:p-10 cursor-pointer"
              initial={{ opacity: 0, y: 50 }}
              animate={hasIntersected ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
              transition={{ duration: 0.8, delay: index * 0.2 }}
              whileHover={!reducedMotion ? { 
                y: -8, 
                scale: 1.02,
              } : {}}
              whileTap={{ scale: 0.98 }}
            >
              <div className="relative z-10 text-center">
                <motion.div 
                  className="relative inline-block mb-6 md:mb-8"
                  whileHover={!reducedMotion ? { 
                    rotate: [0, -8, 8, 0], 
                    scale: [1, 1.2, 1] 
                  } : {}}
                  transition={{ duration: 0.6 }}
                >
                  <div className="text-4xl sm:text-5xl md:text-6xl relative z-10">
                    {medium.icon}
                  </div>
                  <div className={`absolute inset-0 bg-gradient-to-br ${medium.iconBg} opacity-40 blur-xl scale-150 -z-10`} />
                </motion.div>

                <h3 className={`text-lg sm:text-xl md:text-2xl font-bold mb-4 md:mb-6 bg-gradient-to-r ${medium.gradient} bg-clip-text text-transparent`}>
                  {medium.title}
                </h3>
                
                <p className="text-gray-300 leading-relaxed text-sm sm:text-base mb-4 md:mb-6">
                  {medium.description}
                </p>

                <motion.div 
                  className={`w-12 md:w-16 h-1 mx-auto bg-gradient-to-r ${medium.gradient} rounded-full`}
                  initial={{ width: 0, opacity: 0 }}
                  animate={hasIntersected ? { 
                    width: isMobile ? 48 : 64, 
                    opacity: 1 
                  } : { width: 0, opacity: 0 }}
                  transition={{ delay: 0.6 + index * 0.2, duration: 0.8 }}
                />
              </div>

              <motion.div 
                className={`absolute inset-0 bg-gradient-to-br ${medium.bgGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
              />

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
// MAIN COMPONENT WITH SEO
// ========================================================================================

/**
 * Main Portfolio Component with Enhanced SEO and Accessibility
 */
const BushraPortfolio = () => {
  const [isMounted, setIsMounted] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  
  const responsive = useResponsive();
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    let mounted = true;

    const initializePage = async () => {
      try {
        document.body.style.overflowX = 'hidden';
        document.body.style.overflowY = 'auto';
        document.documentElement.style.scrollBehavior = 'smooth';

        const progressSteps = [25, 50, 75, 100];
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
          setIsMounted(true);
        }
      }
    };

    initializePage();

    return () => {
      mounted = false;
      document.documentElement.style.scrollBehavior = '';
    };
  }, []);

  if (!isMounted) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center">
        <motion.div 
          className="w-16 h-16 md:w-20 md:h-20 border-4 border-amber-500/30 border-t-amber-500 rounded-full mb-6"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          aria-hidden="true"
        />
        
        <div className="w-48 md:w-64 h-1 bg-white/10 rounded-full overflow-hidden mb-4">
          <motion.div 
            className="h-full bg-gradient-to-r from-amber-500 to-rose-500 rounded-full"
            initial={{ width: '0%' }}
            animate={{ width: `${loadingProgress}%` }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          />
        </div>
        
        <p className="text-gray-400 text-sm md:text-base" role="status" aria-live="polite">
          Loading Portfolio... {loadingProgress}%
        </p>
      </div>
    );
  }

  const heavyAnimationsDisabled = responsive.isMobile || prefersReducedMotion;

  return (
    <>
      {/* Enhanced SEO Meta Tags */}
      <head>
        <title>Bushra Khandoker — Multidisciplinary Visual Artist | Sketches, Paintings, 3D Art & Sculpture</title>
        
        <meta 
          name="description" 
          content="Multidisciplinary artist from Bangladesh — sketches, acrylics, watercolors, 3D modeling, digital art, and sculpture. Transforming imagination into reality." 
        />
        
        <meta 
          name="keywords" 
          content="Bushra Khandoker, multidisciplinary artist, Bangladesh artist, sketching, acrylic painting, watercolor, 3D modeling, digital art, sculpture, contemporary art, visual artist, traditional art, digital sculpture, art portfolio" 
        />
        
        <meta name="author" content="Bushra Khandoker" />
        <meta name="robots" content="index, follow, max-image-preview:large" />
        
        <meta property="og:title" content="Bushra Khandoker — Multidisciplinary Visual Artist" />
        <meta property="og:description" content="Explore the diverse artistic practice of Bushra Khandoker, blending traditional techniques with digital innovation to create tangible forms from imagination." />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="/assets/Bushra.jpg" />
        <meta property="og:image:alt" content="Bushra Khandoker - Multidisciplinary Visual Artist" />
        
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Bushra Khandoker — Multidisciplinary Visual Artist" />
        <meta name="twitter:description" content="Multidisciplinary artist turning sketches and digital models into paintings and sculptures — crafting tangible forms from imagination." />
        
        <link rel="canonical" href="https://yourdomain.com" />
        <meta name="theme-color" content="#f59e0b" />
        
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Person",
          "name": "Bushra Khandoker",
          "jobTitle": "Multidisciplinary Visual Artist",
          "description": "Visual artist from Bangladesh specializing in sketching, acrylic and watercolor painting, 3D modeling, digital art, and sculpture",
          "nationality": "Bangladesh",
          "url": "https://yourdomain.com",
          "image": "/assets/Bushra.jpg",
          "knowsAbout": [
            "Sketching",
            "Acrylic Painting", 
            "Watercolor Painting",
            "3D Modeling",
            "Digital Art",
            "Sculpture",
            "Contemporary Art",
            "Mixed Media"
          ],
          "artform": ["Traditional Art", "Digital Art", "Sculpture"],
          "hasOccupation": {
            "@type": "Occupation",
            "name": "Visual Artist",
            "occupationLocation": {
              "@type": "Country",
              "name": "Bangladesh"
            }
          }
        })}</script>
      </head>

      <main 
        className="min-h-screen bg-black text-white relative overflow-x-hidden"
        role="main"
        aria-label="Bushra Khandoker Portfolio - Multidisciplinary Visual Artist"
      >
        <ScrollProgress />
        
        <BackgroundElements 
          reducedMotion={prefersReducedMotion} 
          deviceType={responsive.deviceType} 
        />
        
        <FloatingParticles 
          disabled={heavyAnimationsDisabled}
          deviceType={responsive.deviceType}
        />

        <div className="relative z-10">
          <div className="max-w-8xl mx-auto">
            <a 
              href="#hero" 
              className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-amber-600 text-white px-4 py-2 rounded-md z-50"
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
            
            <MediumsSection 
              reducedMotion={prefersReducedMotion}
              deviceType={responsive.deviceType}
            />


          </div>
        </div>
      </main>
    </>
  );
};

export default BushraPortfolio;