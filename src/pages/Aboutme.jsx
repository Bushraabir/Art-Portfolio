
import React, { useState, useEffect, useRef } from 'react';
import {
  motion,
  useScroll,
  useTransform,
  useInView,
  AnimatePresence,
} from 'framer-motion';
import { Helmet } from 'react-helmet-async';

// Local components & assets (keep file paths the same as your project)
import CustomCursor from '../components/CustomCursor.jsx';
import artistPhoto from '../assets/Bushra.jpg';

// ------------------------
// Helpers & configuration
// ------------------------
const THROTTLE_MS = 120; // resize throttle for mobile performance

function throttle(fn, wait = THROTTLE_MS) {
  let last = 0;
  return (...args) => {
    const now = Date.now();
    if (now - last >= wait) {
      last = now;
      fn(...args);
    }
  };
}

// Detect prefers-reduced-motion to respect user accessibility settings
function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    if (!mq) return;
    const onChange = () => setReduced(!!mq.matches);
    onChange();
    mq.addEventListener?.('change', onChange);
    return () => mq.removeEventListener?.('change', onChange);
  }, []);
  return reduced;
}

// ------------------------
// FloatingParticles
// ------------------------
// Keeps the same visuals but automatically disables heavy animation on small screens
const FloatingParticles = ({ disabled }) => {
  const canvasRef = useRef(null);
  const particlesRef = useRef([]);
  const mouseRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (disabled) return; // don't initialize if we disable for performance

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let animationId = null;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();

    const initParticles = () => {
      particlesRef.current = [];
      const particleCount = Math.min(Math.floor(window.innerWidth * 0.04), 80);

      for (let i = 0; i < particleCount; i++) {
        particlesRef.current.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.4,
          vy: (Math.random() - 0.5) * 0.4,
          size: Math.random() * 2 + 1,
          originalSize: Math.random() * 2 + 1,
          alpha: Math.random() * 0.6 + 0.2,
          hue: Math.random() * 60 + 220,
          pulsePhase: Math.random() * Math.PI * 2,
          magnetism: Math.random() * 0.3 + 0.1,
        });
      }
    };

    initParticles();

    const handleMouseMove = (e) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };

    window.addEventListener('mousemove', handleMouseMove);

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particlesRef.current.forEach((particle, index) => {
        const dx = mouseRef.current.x - particle.x;
        const dy = mouseRef.current.y - particle.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 150) {
          const force = (150 - distance) * 0.00008;
          particle.vx += (dx / (distance || 1)) * force * particle.magnetism;
          particle.vy += (dy / (distance || 1)) * force * particle.magnetism;
        }

        particle.vx *= 0.998;
        particle.vy *= 0.998;
        particle.x += particle.vx;
        particle.y += particle.vy;

        if (particle.x < -10) particle.x = canvas.width + 10;
        if (particle.x > canvas.width + 10) particle.x = -10;
        if (particle.y < -10) particle.y = canvas.height + 10;
        if (particle.y > canvas.height + 10) particle.y = -10;

        particle.pulsePhase += 0.02;
        const pulse = Math.sin(particle.pulsePhase) * 0.3 + 0.7;
        particle.size = particle.originalSize * pulse;

        const alpha = particle.alpha * (0.8 + pulse * 0.2);
        const gradient = ctx.createRadialGradient(
          particle.x,
          particle.y,
          0,
          particle.x,
          particle.y,
          particle.size * 6,
        );

        gradient.addColorStop(0, `hsla(${particle.hue}, 100%, 70%, ${alpha})`);
        gradient.addColorStop(0.4, `hsla(${particle.hue}, 100%, 60%, ${alpha * 0.4})`);
        gradient.addColorStop(1, 'transparent');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size * 6, 0, Math.PI * 2);
        ctx.fill();

        particlesRef.current.slice(index + 1).forEach((otherParticle) => {
          const dx2 = particle.x - otherParticle.x;
          const dy2 = particle.y - otherParticle.y;
          const dist = Math.sqrt(dx2 * dx2 + dy2 * dy2);

          if (dist < 100) {
            const opacity = (1 - dist / 100) * 0.15;
            ctx.strokeStyle = `hsla(${(particle.hue + otherParticle.hue) / 2}, 100%, 65%, ${opacity})`;
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(particle.x, particle.y);
            ctx.lineTo(otherParticle.x, otherParticle.y);
            ctx.stroke();
          }
        });
      });

      animationId = window.requestAnimationFrame(animate);
    };

    animate();

    const handleResize = throttle(() => {
      resizeCanvas();
      initParticles();
    });

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationId);
    };
  }, [disabled]);

  return (
    <canvas
      aria-hidden
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 1 }}
    />
  );
};

// ------------------------
// ScrollProgress
// ------------------------
const ScrollProgress = () => {
  const { scrollYProgress } = useScroll();
  const scaleX = useTransform(scrollYProgress, [0, 1], [0, 1]);

  return (
    <motion.div
      aria-hidden
      className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-500 transform-gpu z-50"
      style={{ scaleX, transformOrigin: '0%' }}
    />
  );
};

// ------------------------
// BackgroundElements
// ------------------------
const BackgroundElements = ({ reducedMotion }) => (
  <div className="fixed inset-0 pointer-events-none overflow-hidden" aria-hidden>
    <motion.div
      className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-br from-purple-600/20 via-blue-600/15 to-transparent rounded-full blur-3xl"
      animate={reducedMotion ? undefined : {
        scale: [1, 1.2, 1],
        opacity: [0.3, 0.5, 0.3],
        x: [0, 50, 0],
        y: [0, -30, 0],
      }}
      transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
    />

    <motion.div
      className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-gradient-to-br from-cyan-600/20 via-blue-600/15 to-transparent rounded-full blur-3xl"
      animate={reducedMotion ? undefined : {
        scale: [1.2, 1, 1.2],
        opacity: [0.4, 0.6, 0.4],
        x: [0, -40, 0],
        y: [0, 40, 0],
      }}
      transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
    />

    <div className="absolute inset-0 opacity-[0.02]">
      <div
        className="w-full h-full"
        style={{
          backgroundImage: `
              radial-gradient(circle at 25% 25%, white 1px, transparent 1px),
              radial-gradient(circle at 75% 75%, white 1px, transparent 1px)
            `,
          backgroundSize: '60px 60px, 60px 60px',
          backgroundPosition: '0 0, 30px 30px',
        }}
      />
    </div>

    {[...Array(6)].map((_, i) => (
      <motion.div
        key={i}
        className="absolute w-1 h-1 bg-white/20 rounded-full"
        style={{
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
        }}
        animate={reducedMotion ? undefined : {
          y: [0, -100, 0],
          opacity: [0.2, 0.8, 0.2],
          scale: [1, 1.5, 1],
        }}
        transition={{ duration: 6 + Math.random() * 4, repeat: Infinity, delay: Math.random() * 4, ease: 'easeInOut' }}
      />
    ))}
  </div>
);

// ------------------------
// Section wrapper
// ------------------------
const Section = ({ children, className = '', delay = 0 }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <motion.section
      ref={ref}
      initial={{ opacity: 0, y: 60 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 60 }}
      transition={{ duration: 0.8, delay, ease: [0.25, 0.1, 0.25, 1] }}
      className={`relative ${className}`}
      role="region"
    >
      {children}
    </motion.section>
  );
};

// ------------------------
// ArtistSection
// ------------------------
const ArtistSection = ({ isMobile }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Section className="flex justify-center mb-32 pt-20">
      <motion.div
        className="relative group cursor-pointer"
        onMouseEnter={() => !isMobile && setIsHovered(true)}
        onMouseLeave={() => !isMobile && setIsHovered(false)}
        onTouchStart={() => setIsHovered(true)}
        onTouchEnd={() => setTimeout(() => setIsHovered(false), 2000)}
        whileHover={!isMobile ? { scale: 1.02 } : {}}
        whileTap={{ scale: 0.98 }}
        transition={{ duration: 0.4 }}
        aria-label="Artist portrait and interactive rings"
      >
        <motion.div
          className="absolute -inset-12 rounded-full opacity-40"
          style={{
            background: 'conic-gradient(from 0deg, #8b5cf6, #06b6d4, #d946ef, #f59e0b, #8b5cf6)',
            filter: 'blur(3px)',
          }}
          animate={{ rotate: isHovered ? 360 : 180, scale: isHovered ? 1.1 : 1 }}
          transition={{ rotate: { duration: 8, ease: 'linear', repeat: Infinity }, scale: { duration: 0.4 } }}
        />

        <motion.div
          className="absolute -inset-8 rounded-full opacity-25"
          style={{
            background: 'conic-gradient(from 180deg, #06b6d4, #8b5cf6, #06b6d4)',
            filter: 'blur(2px)',
          }}
          animate={{ rotate: isHovered ? -360 : -180, scale: isHovered ? 0.9 : 1 }}
          transition={{ rotate: { duration: 12, ease: 'linear', repeat: Infinity }, scale: { duration: 0.4 } }}
        />

        <div className="relative w-72 h-72 sm:w-60 sm:h-60 md:w-76 md:h-76 rounded-full overflow-hidden backdrop-blur-2xl bg-white/10 border border-white/20 shadow-[0_0_60px_rgba(139,92,246,0.3)]">
          <div className="mt-2.5 absolute inset-3 rounded-full overflow-hidden">
            <motion.img
              src={artistPhoto}
              alt="Bushra Khandoker — digital artist portrait"
              className="w-full h-full object-cover rounded-full"
              whileHover={!isMobile ? { scale: 1.1 } : {}}
              transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
              loading="eager"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent rounded-full" />
          </div>
        </div>

        {[
          { delay: 0, color: 'from-purple-400 to-pink-500', position: '-top-6 -right-6' },
          { delay: 1.5, color: 'from-blue-400 to-cyan-500', position: '-bottom-4 -left-4' },
          { delay: 3, color: 'from-amber-400 to-rose-500', position: 'top-12 -left-8' },
          { delay: 4.5, color: 'from-emerald-400 to-blue-500', position: 'bottom-16 -right-2' },
        ].map((item, index) => (
          <motion.div
            key={index}
            className={`absolute w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 bg-gradient-to-br ${item.color} rounded-full shadow-lg ${item.position}`}
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
    </Section>
  );
};

// ------------------------
// GradientText
// ------------------------
const GradientText = ({ children, className = '', gradient = 'from-white via-purple-200 to-blue-200' }) => (
  <span className={`bg-gradient-to-r ${gradient} bg-clip-text text-transparent ${className}`}>{children}</span>
);

// ------------------------
// HeroSection
// ------------------------
const HeroSection = ({ name = 'Bushra' }) => {
  const [displayedText, setDisplayedText] = useState('');
  const fullText = 'Digital Artist & Creative Visionary';

  useEffect(() => {
    let index = 0;
    const timer = setInterval(() => {
      if (index < fullText.length) {
        setDisplayedText(fullText.slice(0, index + 1));
        index++;
      } else clearInterval(timer);
    }, 80);

    return () => clearInterval(timer);
  }, []);

  return (
    <Section className="mb-40 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto text-center">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }} className="mb-12">
          <h1 className="text-2xl sm:text-2xl md:text-3xl lg:text-8xl font-bold tracking-tight leading-tight mb-8">
            <GradientText className="block">Hello, I'm</GradientText>
            <GradientText gradient="from-purple-400 via-blue-400 to-cyan-400" className="block">
              {name}
            </GradientText>
          </h1>

          <motion.div className="text-xl sm:text-2xl md:text-3xl text-gray-300 font-light mb-8 h-10" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay: 0.6 }}>
            <span className="relative inline-block">
              {displayedText}
              <motion.span className="absolute -bottom-1 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-purple-400 to-transparent" initial={{ scaleX: 0, opacity: 0 }} animate={{ scaleX: 1, opacity: 0.8 }} transition={{ delay: 1.2, duration: 1.5 }} />
            </span>
          </motion.div>
        </motion.div>

        <motion.div className="max-w-4xl mx-auto" initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.8 }}>
          <p className="text-lg sm:text-xl md:text-2xl leading-relaxed text-gray-300 font-light">
            As a passionate digital artist from Bangladesh, I blend <GradientText gradient="from-purple-400 to-blue-400" className="font-medium relative inline-block group">technology and nature<span className="absolute -bottom-1 left-0 w-full h-0.5 bg-gradient-to-r from-purple-400 to-blue-400 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></span></GradientText> to create thought-provoking, abstract works of art. My journey began with a love for color, geometry, and the countless possibilities that modern tools unlock. Each piece is a conversation — a study of harmony, contrast, and human emotion.
          </p>
        </motion.div>
      </div>
    </Section>
  );
};

// ------------------------
// PhilosophySection
// ------------------------
const PhilosophySection = () => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Section className="mb-40 px-4 sm:px-6" delay={0.2}>
      <div className="max-w-7xl mx-auto">
        <motion.div className="relative overflow-hidden rounded-3xl backdrop-blur-2xl bg-gradient-to-br from-white/10 via-white/5 to-white/10 border border-white/20 shadow-[0_20px_80px_-15px_rgba(139,92,246,0.4)]" onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)} whileHover={{ scale: 1.01 }} transition={{ duration: 0.4 }}>
          <div className="relative z-10 p-8 sm:p-12 md:p-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-center mb-16">
              <GradientText gradient="from-purple-300 via-pink-300 to-blue-300">Artistic Philosophy</GradientText>
            </h2>

            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <motion.div className="space-y-8" initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }} viewport={{ once: true }}>
                <p className="text-lg sm:text-xl md:text-2xl leading-relaxed text-gray-200">My artistic philosophy is rooted in the exploration of <GradientText gradient="from-purple-300 to-pink-300" className="font-medium">contrast and harmony</GradientText>. Through digital manipulation I aim to bring life to abstract ideas, combining bold strokes with softer gradients to create visual tension and serenity at once.</p>

                <p className="text-base sm:text-lg md:text-xl leading-relaxed text-gray-300">Each piece invites the viewer into a world where abstraction meets reality — a transformative visual experience that encourages curiosity and reflection.</p>

                <motion.div className="w-24 h-1 bg-gradient-to-r from-purple-400 to-blue-400 rounded-full" initial={{ width: 0 }} whileInView={{ width: 96 }} transition={{ delay: 0.6, duration: 1 }} viewport={{ once: true }} />
              </motion.div>

              <motion.div className="relative" initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, delay: 0.2 }} viewport={{ once: true }}>
                <div className="aspect-square max-w-sm mx-auto rounded-3xl bg-gradient-to-br from-purple-600/20 via-blue-600/20 to-pink-600/20 backdrop-blur-sm border border-white/10 flex items-center justify-center relative overflow-hidden">
                  <motion.div className="text-8xl md:text-9xl" animate={{ rotate: isHovered ? [0, 10, -10, 0] : [0, 2, -2, 0], scale: isHovered ? [1, 1.1, 1] : [1, 1.02, 1] }} transition={{ duration: isHovered ? 4 : 8, ease: 'easeInOut', repeat: Infinity }}>
                    🎨
                  </motion.div>

                  {[...Array(5)].map((_, i) => (
                    <motion.div key={i} className="absolute w-2 h-2 bg-white/30 rounded-full" style={{ left: `${20 + Math.random() * 60}%`, top: `${20 + Math.random() * 60}%` }} animate={{ y: [0, -20, 0], x: [0, Math.sin(i) * 10, 0], opacity: [0.3, 0.8, 0.3] }} transition={{ duration: 4 + Math.random() * 2, repeat: Infinity, delay: Math.random() * 2, ease: 'easeInOut' }} />
                  ))}
                </div>
              </motion.div>
            </div>
          </div>

          <motion.div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-blue-500/10 to-pink-500/10" initial={{ opacity: 0 }} animate={{ opacity: isHovered ? 1 : 0 }} transition={{ duration: 0.4 }} />
        </motion.div>
      </div>
    </Section>
  );
};

// ------------------------
// InspirationsSection
// ------------------------
const InspirationsSection = () => {
  const inspirations = [
    {
      title: "Nature's Patterns",
      description: "Organic forms and natural algorithms inspire my digital compositions, bringing balance and mathematical beauty to each piece.",
      icon: '🌿',
      gradient: 'from-emerald-400 via-green-400 to-teal-400',
      bgGradient: 'from-emerald-600/20 to-green-600/20',
    },
    {
      title: 'Digital Innovation',
      description: 'Emerging tools and experimentation let me push beyond traditional artistic boundaries, mixing code-driven forms with hand-crafted gestures.',
      icon: '⚡',
      gradient: 'from-blue-400 via-cyan-400 to-sky-400',
      bgGradient: 'from-blue-600/20 to-cyan-600/20',
    },
    {
      title: 'Human Connection',
      description: 'I aim to translate universal emotions into visual narratives that connect across cultures and time.',
      icon: '💫',
      gradient: 'from-purple-400 via-pink-400 to-rose-400',
      bgGradient: 'from-purple-600/20 to-pink-600/20',
    },
  ];

  return (
    <Section className="mb-40 px-4 sm:px-6" delay={0.4}>
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-center mb-20">
          <GradientText gradient="from-blue-300 via-purple-300 to-pink-300">Creative Inspirations</GradientText>
        </h2>

        <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
          {inspirations.map((inspiration, index) => (
            <motion.div key={index} className="group relative overflow-hidden rounded-3xl backdrop-blur-xl bg-gradient-to-br from-white/10 to-white/5 border border-white/20 p-8 sm:p-10 md:p-12 cursor-pointer" initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: index * 0.2 }} viewport={{ once: true }} whileHover={{ y: -10, scale: 1.02, boxShadow: '0 25px 50px -15px rgba(139,92,246,0.4)' }} whileTap={{ scale: 0.98 }}>
              <div className="relative z-10 text-center">
                <motion.div className="text-6xl sm:text-7xl mb-8 relative inline-block" whileHover={{ rotate: [0, -10, 10, 0], scale: [1, 1.2, 1] }} transition={{ duration: 0.6 }}>
                  {inspiration.icon}
                  <div className={`absolute inset-0 bg-gradient-to-br ${inspiration.gradient} opacity-20 blur-2xl scale-150 -z-10`} />
                </motion.div>

                <h3 className={`text-xl sm:text-2xl font-bold mb-6 bg-gradient-to-r ${inspiration.gradient} bg-clip-text text-transparent`}>{inspiration.title}</h3>
                <p className="text-gray-300 leading-relaxed text-sm sm:text-base mb-6">{inspiration.description}</p>

                <motion.div className={`w-16 h-1 mx-auto bg-gradient-to-r ${inspiration.gradient} rounded-full`} initial={{ width: 0, opacity: 0 }} whileInView={{ width: 64, opacity: 1 }} transition={{ delay: 0.6 + index * 0.2, duration: 0.8 }} viewport={{ once: true }} />
              </div>

              <motion.div className={`absolute inset-0 bg-gradient-to-br ${inspiration.bgGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

              <div className="absolute top-6 right-6 w-8 h-8 border border-white/10 rounded-full" />
              <div className="absolute bottom-6 left-6 w-6 h-6 border border-white/10 rounded-full" />
            </motion.div>
          ))}
        </div>
      </div>
    </Section>
  );
};

// ------------------------
// CallToActionSection
// ------------------------
const CallToActionSection = ({ reducedMotion }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Section className="text-center mb-40 px-4 sm:px-6" delay={0.6}>
      <motion.div className="relative inline-block" onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
        <motion.div className="absolute -inset-6 bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 rounded-3xl opacity-30 blur-xl"/>

        <motion.a href="#portfolio" className="relative inline-flex items-center px-8 sm:px-12 py-4 sm:py-6 text-lg sm:text-xl font-semibold text-white bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 rounded-3xl shadow-2xl overflow-hidden group transition-all duration-300"  whileTap={{ scale: 0.95 }}>
          <span className="relative z-10 flex items-center">
            Explore My Portfolio
            <motion.svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" animate={isHovered && !reducedMotion ? { x: [0, 5, 0] } : undefined} transition={{ duration: 1, repeat: isHovered && !reducedMotion ? Infinity : 0 }}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </motion.svg>
          </span>

          <motion.div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -skew-x-12" initial={{ x: '-100%' }} animate={isHovered && !reducedMotion ? { x: '200%' } : undefined} transition={{ duration: 1.2, ease: 'easeOut' }} />
        </motion.a>

        <motion.div className="mt-12 flex justify-center space-x-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1, duration: 0.8 }}>
          {[0, 1, 2].map((index) => (
            <motion.div key={index} className="w-3 h-3 bg-gradient-to-r from-purple-400 to-blue-400 rounded-full" animate={{ scale: [1, 2, 1], opacity: [0.4, 1, 0.4] }} transition={{ duration: 2, repeat: Infinity, delay: index * 0.4, ease: 'easeInOut' }} />
          ))}
        </motion.div>
      </motion.div>
    </Section>
  );
};




// ------------------------
// AboutMe (page)
// ------------------------
/**
 * AboutMe page component — main export.
 * - Adds Helmet SEO tags (title, description, OG, Twitter)
 * - Uses prefers-reduced-motion to adapt interactive elements
 * - Disables heavy visuals on small screens for smoother experience
 */
const AboutMe = () => {
  const [isMounted, setIsMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    // Accessibility / scroll behavior
    document.body.style.overflowY = 'auto';
    document.documentElement.style.scrollBehavior = 'smooth';

    const updateVH = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
      setIsMobile(window.innerWidth < 768);
    };

    updateVH();

    const onResize = throttle(updateVH, 120);
    window.addEventListener('resize', onResize);

    // Prevent flash of unstyled content
    setIsMounted(true);

    return () => {
      window.removeEventListener('resize', onResize);
      document.documentElement.style.scrollBehavior = '';
    };
  }, []);

  if (!isMounted) {
    // lightweight loader to avoid FOUC
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <motion.div className="w-16 h-16 border-4 border-purple-500/30 border-t-purple-500 rounded-full" animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} aria-hidden />
      </div>
    );
  }

  // Decide whether to enable heavy visuals: disabled on mobile or when reduced motion requested
  const heavyVisualsDisabled = isMobile || reducedMotion;

  return (
    <main className="min-h-screen bg-black text-white relative overflow-x-hidden">
      {/* SEO + Social MetaTags for this page */}
      <Helmet>
        <title>Bushra — Digital Artist & Creative Visionary</title>
        <meta name="description" content="Explore Bushra's digital art portfolio: pencil sketches, watercolors, acrylics, crafts and experimental digital pieces inspired by nature and technology." />
        <meta name="keywords" content="Bushra, art portfolio, digital art, pencil sketch, watercolor, acrylic, crafts, modeling, Bangladesh artist" />

        {/* Open Graph */}
        <meta property="og:title" content="Bushra — Digital Artist & Creative Visionary" />
        <meta property="og:description" content="Browse Bushra's portfolio of digital and traditional artworks—where nature meets code and color meets geometry." />
        <meta property="og:type" content="website" />
        <meta property="og:locale" content="en_US" />
        {/* Provide a social preview image path if available in your public folder */}
        <meta property="og:image" content="/social-preview.png" />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Bushra — Digital Artist & Creative Visionary" />
        <meta name="twitter:description" content="Explore a collection of artworks blending technology, nature and color." />
        <meta name="twitter:image" content="/social-preview.png" />

        {/* Canonical link (update if hosted under a subpath) */}
        <link rel="canonical" href="https://yourdomain.com/about" />

        {/* Structured data (Person) */}
        <script type="application/ld+json">{`{
          "@context": "https://schema.org",
          "@type": "Person",
          "name": "Bushra",
          "url": "https://yourdomain.com",
          "sameAs": [
            "https://instagram.com/yourhandle",
            "https://twitter.com/yourhandle"
          ],
          "jobTitle": "Digital Artist",
          "description": "Digital artist blending technology and nature to create abstract, thought-provoking artworks."
        }`}</script>
      </Helmet>

      {/* Performance-conscious UI elements */}
      <ScrollProgress />

      <CustomCursor
        size={20}
        trailSize={40}
        color="rgba(139, 92, 246, 0.8)"
        opacity={0.8}
        hoverScale={1.8}
        disabled={heavyVisualsDisabled}
      />

      <BackgroundElements reducedMotion={reducedMotion} />

      <FloatingParticles disabled={heavyVisualsDisabled} />

      <div className="relative z-10">
        <div className="max-w-8xl mx-auto">
          <ArtistSection isMobile={isMobile} />
          <HeroSection name="Bushra" />
          <PhilosophySection />
          <InspirationsSection />
          
        </div>
      </div>

      
    </main>
  );
};

export default AboutMe;
