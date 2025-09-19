/*  AdvancedArtisticCursor.jsx
    Premium watercolor cursor with natural irregularities and advanced artistic effects */
import React, {
  useState, useEffect, useRef, useCallback, useMemo
} from 'react';
import {
  motion, useSpring, useMotionValue, useTransform, useVelocity
} from 'framer-motion';

const deg = (rad) => rad * (180 / Math.PI);

// Perlin-like noise for organic variations
const noise = (x, y, scale = 0.1) => {
  const X = Math.floor(x * scale) & 255;
  const Y = Math.floor(y * scale) & 255;
  return ((Math.sin(X * 12.9898 + Y * 78.233) * 43758.5453) % 1 + 1) / 2;
};

// Generate organic stroke path with variations
const generateWatercolorPath = (points, pressure = 1, time = 0) => {
  if (points.length < 2) return '';
  
  const segments = [];
  for (let i = 0; i < points.length - 1; i++) {
    const curr = points[i];
    const next = points[i + 1];
    
    // Add organic variation based on position and time
    const variation = noise(curr.x + time * 0.001, curr.y + time * 0.001) * 3 - 1.5;
    const pressureVar = Math.sin(i * 0.3 + time * 0.002) * pressure * 2;
    
    const dx = next.x - curr.x;
    const dy = next.y - curr.y;
    const dist = Math.hypot(dx, dy);
    
    if (dist > 0) {
      const perpX = (-dy / dist) * (2 + variation + pressureVar);
      const perpY = (dx / dist) * (2 + variation + pressureVar);
      
      segments.push({
        x1: curr.x + perpX, y1: curr.y + perpY,
        x2: curr.x - perpX, y2: curr.y - perpY,
        x3: next.x + perpX, y3: next.y + perpY,
        x4: next.x - perpX, y4: next.y - perpY,
        opacity: Math.max(0.1, 0.7 - (i / points.length) * 0.6)
      });
    }
  }
  
  return segments;
};

const AdvancedArtisticCursor = ({
  size = 28,
  trailSize = 24,
  color = '#3b82f6',
  accentColor = '#8b5cf6',
  opacity = 0.65,
  hoverScale = 2.8,
  clickScale = 0.6,
  className = '',
  disabled = false,
  theme = 'watercolor', // 'watercolor','premium','aurora','liquid','ethereal','cosmic'
  particleCount = 16,
  magneticStrength = 0.4,
  inkWord = 'create'
}) => {
  /* ---------- state ---------- */
  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  const [hovering, setHovering] = useState(false);
  const [clicking, setClicking] = useState(false);
  const [visible, setVisible] = useState(true);
  const [magnetic, setMagnetic] = useState(null);
  const [trail, setTrail] = useState([]);
  const [watercolorStrokes, setWatercolorStrokes] = useState([]);
  const [currentStroke, setCurrentStroke] = useState([]);
  const [pressure, setPressure] = useState(1);

  /* ---------- refs ---------- */
  const raf = useRef();
  const timeRef = useRef(0);
  const lastPoint = useRef({ x: 0, y: 0 });
  const strokeIdRef = useRef(0);
  const canvasRef = useRef();

  /* ---------- motion values ---------- */
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const vx = useVelocity(mx);
  const vy = useVelocity(my);

  const springConf = { damping: 25, stiffness: 400, mass: 0.3 };
  const sx = useSpring(mx, springConf);
  const sy = useSpring(my, springConf);

  /* ---------- derived transforms ---------- */
  const angle = useTransform(
    [mx, my],
    () => deg(Math.atan2(vy.get(), vx.get()))
  );
  const speed = useTransform(
    [vx, vy],
    () => Math.min(Math.hypot(vx.get(), vy.get()) * 0.05, 12)
  );

  /* ---------- animation loop ---------- */
  useEffect(() => {
    const animate = () => {
      timeRef.current += 16;
      raf.current = requestAnimationFrame(animate);
    };
    animate();
    return () => cancelAnimationFrame(raf.current);
  }, []);

  /* ---------- watercolor stroke management ---------- */
  const addStrokePoint = useCallback((x, y, pressure = 1) => {
    const distance = Math.hypot(x - lastPoint.current.x, y - lastPoint.current.y);
    
    if (distance > 3) { // Minimum distance for smoother strokes
      setCurrentStroke(prev => [...prev, { x, y, pressure, time: timeRef.current }]);
      lastPoint.current = { x, y };
    }
  }, []);

  const completeStroke = useCallback(() => {
    if (currentStroke.length > 1) {
      setWatercolorStrokes(prev => [...prev, {
        id: strokeIdRef.current++,
        points: [...currentStroke],
        color: `hsl(${220 + Math.random() * 40}, ${70 + Math.random() * 20}%, ${50 + Math.random() * 20}%)`,
        birth: timeRef.current
      }]);
    }
    setCurrentStroke([]);
  }, [currentStroke]);

  /* ---------- premium trail physics ---------- */
  const pushTrail = useCallback((x, y, velocity = 0) => {
    setTrail(prev => {
      const life = Math.max(0.3, Math.min(1, velocity * 0.1 + 0.5));
      const newPoint = {
        x, y,
        id: performance.now() + Math.random(),
        life,
        size: 8 + Math.random() * 12,
        hue: Math.random() * 60,
        birth: timeRef.current
      };
      
      return [...prev, newPoint]
        .map(p => ({
          ...p,
          life: p.life - (0.02 + Math.random() * 0.01),
          x: p.x + (Math.random() - 0.5) * 0.5, // organic drift
          y: p.y + (Math.random() - 0.5) * 0.5
        }))
        .filter(p => p.life > 0)
        .slice(-particleCount * 2);
    });
  }, [particleCount]);

  /* ---------- enhanced magnetic field ---------- */
  const applyMagnetic = useCallback((x, y) => {
    if (!magnetic) return { x, y };
    
    const rect = magnetic.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const d = Math.hypot(x - cx, y - cy);
    const maxRange = 140;
    
    if (d < maxRange) {
      const f = Math.pow((maxRange - d) / maxRange, 1.5);
      const wobble = Math.sin(timeRef.current * 0.003) * 2;
      
      return {
        x: x + (cx - x) * magneticStrength * f + wobble,
        y: y + (cy - y) * magneticStrength * f + Math.cos(timeRef.current * 0.003) * 2
      };
    }
    return { x, y };
  }, [magnetic, magneticStrength]);

  /* ---------- mouse & global listeners ---------- */
  useEffect(() => {
    if (disabled) return;

    let lastUpdate = 0;
    const throttle = 10;

    const onMove = (e) => {
      const now = performance.now();
      if (now - lastUpdate < throttle) return;
      lastUpdate = now;

      const velocity = Math.hypot(e.movementX || 0, e.movementY || 0);
      const calculatedPressure = Math.min(1, velocity * 0.1 + 0.3);
      setPressure(calculatedPressure);

      const raw = { x: e.clientX, y: e.clientY };
      const { x, y } = applyMagnetic(raw.x, raw.y);

      setMouse({ x, y });
      mx.set(x);
      my.set(y);
      
      pushTrail(x, y, velocity);
      
      if (theme === 'watercolor' && clicking) {
        addStrokePoint(x, y, calculatedPressure);
      }
    };

    const onDown = (e) => {
      setClicking(true);
      if (theme === 'watercolor') {
        const { x, y } = applyMagnetic(e.clientX, e.clientY);
        setCurrentStroke([{ x, y, pressure: 1, time: timeRef.current }]);
        lastPoint.current = { x, y };
      }
    };
    
    const onUp = () => {
      setClicking(false);
      if (theme === 'watercolor') {
        completeStroke();
      }
    };

    const onOver = (e) => {
      const t = e.target;
      const interactive = 
        t.tagName === 'A' ||
        t.tagName === 'BUTTON' ||
        t.closest('a,button,[role="button"],[data-cursor]') ||
        window.getComputedStyle(t).cursor === 'pointer';
      
      setHovering(interactive);
      setMagnetic(interactive ? t.closest('a,button') : null);
    };

    const onLeave = () => setVisible(false);
    const onEnter = () => setVisible(true);
    const onScroll = () => {
      setTrail([]);
      completeStroke();
    };

    document.addEventListener('mousemove', onMove, { passive: true });
    document.addEventListener('mousedown', onDown);
    document.addEventListener('mouseup', onUp);
    document.addEventListener('mouseover', onOver);
    document.addEventListener('mouseleave', onLeave);
    document.addEventListener('mouseenter', onEnter);
    window.addEventListener('scroll', onScroll, { passive: true });
    document.body.style.cursor = 'none';

    return () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('mouseup', onUp);
      document.removeEventListener('mouseover', onOver);
      document.removeEventListener('mouseleave', onLeave);
      document.removeEventListener('mouseenter', onEnter);
      window.removeEventListener('scroll', onScroll);
      document.body.style.cursor = 'auto';
      cancelAnimationFrame(raf.current);
    };
  }, [disabled, applyMagnetic, pushTrail, addStrokePoint, completeStroke, clicking, theme]);

  /* ---------- cleanup old strokes ---------- */
  useEffect(() => {
    const cleanup = setInterval(() => {
      setWatercolorStrokes(prev => 
        prev.filter(stroke => timeRef.current - stroke.birth < 30000) // Keep for 30s
      );
    }, 5000);
    return () => clearInterval(cleanup);
  }, []);

  /* ---------- premium theme styles ---------- */
  const styles = useMemo(() => {
    const base = { opacity };
    const time = timeRef.current * 0.001;
    
    switch (theme) {
      case 'premium':
        return {
          ...base,
          background: `conic-gradient(from ${angle.get() + time * 30}deg, 
            ${color}ff 0%, ${accentColor}aa 25%, #ffffff44 50%, ${color}ff 75%, ${accentColor}aa 100%)`,
          boxShadow: `
            0 0 30px ${color}66,
            0 0 60px ${accentColor}44,
            inset 0 0 20px rgba(255,255,255,0.3)
          `,
          backdropFilter: 'blur(1px)',
          border: `1px solid rgba(255,255,255,0.4)`
        };
        
      case 'aurora':
        return {
          ...base,
          background: `radial-gradient(ellipse at ${30 + Math.sin(time) * 20}% ${40 + Math.cos(time) * 15}%, 
            #00ff8866, #0080ff66, #8000ff66, transparent 70%)`,
          filter: `blur(${0.5 + Math.sin(time * 2) * 0.3}px) hue-rotate(${time * 20}deg)`,
          boxShadow: `0 0 ${40 + Math.sin(time * 3) * 10}px #00ff8844`
        };
        
      case 'liquid':
        const liquidScale = 1 + Math.sin(time * 4) * 0.1;
        return {
          ...base,
          background: `radial-gradient(circle at ${mouse.x % 100}% ${mouse.y % 100}%, 
            ${color}dd, ${accentColor}88, transparent 60%)`,
          transform: `scale(${liquidScale}) rotate(${Math.sin(time * 2) * 5}deg)`,
          filter: `blur(${Math.sin(time * 3) * 0.5 + 1}px)`,
          borderRadius: `${50 + Math.sin(time * 5) * 20}%`
        };
        
      case 'ethereal':
        return {
          ...base,
          background: `linear-gradient(${angle.get() + time * 10}deg, 
            rgba(255,255,255,0.1), ${color}33, ${accentColor}55, rgba(255,255,255,0.1))`,
          boxShadow: `
            0 0 50px rgba(255,255,255,0.3),
            0 0 100px ${color}33,
            inset 0 0 30px rgba(255,255,255,0.1)
          `,
          backdropFilter: `blur(2px) brightness(1.1)`,
          border: `1px solid rgba(255,255,255,0.2)`
        };
        
      case 'cosmic':
        return {
          ...base,
          background: `conic-gradient(from ${time * 50}deg, 
            #000000, #1a1a2e, #16213e, #0f3460, #533483, #000000)`,
          boxShadow: `
            0 0 20px #533483,
            0 0 40px #0f3460,
            0 0 80px #16213e,
            inset 0 0 10px rgba(255,255,255,0.1)
          `,
          filter: 'saturate(1.5)'
        };
        
      default: // watercolor
        return {
          ...base,
          background: `radial-gradient(circle at 40% 30%, 
            rgba(255,255,255,0.8), ${color}aa 30%, ${accentColor}66 70%, transparent)`,
          filter: `blur(0.8px) contrast(1.1) saturate(1.3)`,
          boxShadow: `0 0 25px ${color}44, inset 0 0 15px rgba(255,255,255,0.5)`,
          border: `1px solid rgba(255,255,255,0.6)`
        };
    }
  }, [theme, color, accentColor, opacity, angle, mouse]);

  if (disabled || !visible) return null;

  return (
    <>
      {/* ---- watercolor canvas ---- */}
      {theme === 'watercolor' && (
        <svg
          className="fixed pointer-events-none z-[9990]"
          style={{ 
            left: 0, 
            top: 0, 
            width: '100vw', 
            height: '100vh',
            mixBlendMode: 'multiply'
          }}
        >
          <defs>
            {/* Watercolor texture filters */}
            <filter id="watercolor" x="-50%" y="-50%" width="200%" height="200%">
              <feTurbulence 
                baseFrequency="0.04 0.08" 
                numOctaves="3" 
                result="noise" 
                seed="2"
              />
              <feDisplacementMap in="SourceGraphic" in2="noise" scale="3"/>
              <feGaussianBlur stdDeviation="0.8"/>
            </filter>
            
            <filter id="paper" x="-20%" y="-20%" width="140%" height="140%">
              <feTurbulence 
                baseFrequency="0.9" 
                numOctaves="4" 
                result="texture" 
                seed="5"
              />
              <feColorMatrix in="texture" type="saturate" values="0"/>
              <feComponentTransfer>
                <feFuncA type="discrete" tableValues="0.1 0.2 0.05 0.15 0.08"/>
              </feComponentTransfer>
              <feComposite in2="SourceGraphic" operator="multiply"/>
            </filter>
          </defs>

          {/* Completed watercolor strokes */}
          {watercolorStrokes.map(stroke => {
            const segments = generateWatercolorPath(stroke.points, 1, timeRef.current - stroke.birth);
            return (
              <g key={stroke.id} filter="url(#watercolor)">
                {segments.map((seg, i) => (
                  <polygon
                    key={i}
                    points={`${seg.x1},${seg.y1} ${seg.x3},${seg.y3} ${seg.x4},${seg.y4} ${seg.x2},${seg.y2}`}
                    fill={stroke.color}
                    fillOpacity={seg.opacity * 0.3}
                    stroke="none"
                  />
                ))}
                
                {/* Core stroke path */}
                <path
                  d={stroke.points.length < 2 ? '' : 
                    `M ${stroke.points.map(p => `${p.x + (Math.random() - 0.5) * 2},${p.y + (Math.random() - 0.5) * 2}`).join(' L ')}`
                  }
                  fill="none"
                  stroke={stroke.color}
                  strokeWidth={Math.max(1, stroke.points[0]?.pressure * 4 || 2)}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeOpacity="0.6"
                  filter="url(#paper)"
                />
              </g>
            );
          })}

          {/* Current stroke being drawn */}
          {currentStroke.length > 1 && (
            <g filter="url(#watercolor)">
              <path
                d={`M ${currentStroke.map(p => 
                  `${p.x + Math.sin(timeRef.current * 0.01 + p.x * 0.01) * 1},${p.y + Math.cos(timeRef.current * 0.01 + p.y * 0.01) * 1}`
                ).join(' L ')}`}
                fill="none"
                stroke={color}
                strokeWidth={Math.max(2, pressure * 6)}
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeOpacity="0.7"
                filter="url(#paper)"
              />
            </g>
          )}
        </svg>
      )}

      {/* ---- enhanced fluid trail ---- */}
      {trail.map((p, i) => (
        <motion.div
          key={p.id}
          className="fixed pointer-events-none z-[9996] rounded-full"
          style={{
            left: p.x - p.size / 2,
            top: p.y - p.size / 2,
            width: p.size,
            height: p.size,
            background: `radial-gradient(circle, 
              hsl(${220 + p.hue}, 70%, 60%, ${p.life * 0.4}), 
              hsl(${240 + p.hue}, 80%, 70%, ${p.life * 0.2}), 
              transparent 70%)`,
            filter: `blur(${(1 - p.life) * 2}px)`
          }}
          animate={{
            scale: [1, 0.3],
            rotate: [0, 360 * (Math.random() > 0.5 ? 1 : -1)]
          }}
          transition={{ 
            duration: 2.5 + Math.random(), 
            ease: [0.23, 1, 0.32, 1] 
          }}
        />
      ))}

      {/* ---- outer energy ring ---- */}
      <motion.div
        className="fixed pointer-events-none z-[9997]"
        style={{
          x: sx.get() - trailSize / 2,
          y: sy.get() - trailSize / 2,
          width: trailSize,
          height: trailSize
        }}
        animate={{
          scale: hovering ? 1.5 : 1,
          rotate: angle.get() * 0.5
        }}
        transition={{ type: 'spring', damping: 20, stiffness: 300 }}
      >
        <div
          className="w-full h-full rounded-full relative"
          style={{
            background: `conic-gradient(from ${angle.get()}deg, 
              transparent, ${color}22, ${accentColor}33, transparent, ${color}22, transparent)`,
            filter: 'blur(1px)',
            animation: `spin ${10 + Math.random() * 5}s linear infinite`
          }}
        />
        
        {/* Inner shimmer */}
        <div
          className="absolute inset-2 rounded-full"
          style={{
            background: `radial-gradient(circle at 60% 40%, 
              rgba(255,255,255,0.3), transparent 50%)`,
            animation: `pulse 2s ease-in-out infinite alternate`
          }}
        />
      </motion.div>

      {/* ---- main cursor ---- */}
      <motion.div
        className={`fixed pointer-events-none z-[9999] rounded-full ${className}`}
        style={{
          x: sx.get() - size / 2,
          y: sy.get() - size / 2,
          width: size,
          height: size
        }}
        animate={{
          scale: clicking ? clickScale : hovering ? hoverScale : 1,
          rotate: angle.get() * 0.3
        }}
        transition={{ type: 'spring', damping: 15, stiffness: 400 }}
      >
        <div
          className="w-full h-full rounded-full relative overflow-hidden"
          style={styles}
        >
          {/* Multi-layer specular highlights */}
          <div
            className="absolute inset-1 rounded-full"
            style={{
              background: `radial-gradient(ellipse at 35% 25%, 
                rgba(255,255,255,0.8) 0%, 
                rgba(255,255,255,0.3) 30%, 
                transparent 60%)`,
              mixBlendMode: 'overlay'
            }}
          />
          
          <div
            className="absolute inset-3 rounded-full"
            style={{
              background: `radial-gradient(circle at 70% 30%, 
                rgba(255,255,255,0.6), transparent 40%)`,
              mixBlendMode: 'soft-light'
            }}
          />
        </div>
      </motion.div>

      {/* ---- click explosion ---- */}
      {clicking && (
        <>
          <motion.div
            className="fixed pointer-events-none z-[9995] rounded-full"
            style={{
              left: mouse.x - size * 2,
              top: mouse.y - size * 2,
              width: size * 4,
              height: size * 4,
              background: `radial-gradient(circle, ${color}33, transparent 60%)`,
              filter: 'blur(2px)'
            }}
            initial={{ scale: 0, opacity: 1 }}
            animate={{ scale: 2.5, opacity: 0 }}
            transition={{ duration: 1.2, ease: [0.23, 1, 0.32, 1] }}
          />
          
          {/* Shockwave rings */}
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              className="fixed pointer-events-none z-[9994] rounded-full border"
              style={{
                left: mouse.x - size,
                top: mouse.y - size,
                width: size * 2,
                height: size * 2,
                borderColor: `${accentColor}${Math.floor((3-i) * 85 / 3).toString(16).padStart(2, '0')}`,
                borderWidth: 2 - i * 0.5
              }}
              initial={{ scale: 0, opacity: 1 }}
              animate={{ scale: 4 + i * 2, opacity: 0 }}
              transition={{ 
                duration: 1.5 + i * 0.3, 
                delay: i * 0.1,
                ease: 'easeOut' 
              }}
            />
          ))}
        </>
      )}

      {/* ---- floating essence particles ---- */}
      {hovering &&
        [...Array(12)].map((_, i) => {
          const angle = (i * 30) * Math.PI / 180;
          const radius = 50 + Math.sin(timeRef.current * 0.003 + i) * 20;
          
          return (
            <motion.div
              key={i}
              className="fixed pointer-events-none z-[9993] rounded-full"
              style={{
                left: mouse.x,
                top: mouse.y,
                width: 6 + Math.random() * 4,
                height: 6 + Math.random() * 4,
                background: `radial-gradient(circle, ${accentColor}, transparent 70%)`
              }}
              animate={{
                x: Math.cos(angle) * radius + (Math.random() - 0.5) * 10,
                y: Math.sin(angle) * radius + (Math.random() - 0.5) * 10,
                opacity: [0.8, 0.2, 0.8],
                scale: [0.5, 1.2, 0.5]
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: i * 0.2,
                ease: 'easeInOut'
              }}
            />
          );
        })}

      <style jsx>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.8; }
        }
      `}</style>
    </>
  );
};

export default AdvancedArtisticCursor;