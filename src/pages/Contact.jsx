import React, { useState, useRef, useEffect } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import emailjs from '@emailjs/browser';

// Enhanced floating particles background
const ContactParticles = () => {
  const canvasRef = useRef(null);
  const particlesRef = useRef([]);
  const mouseRef = useRef({ x: 0, y: 0 });
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    let animationId;
    
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    resizeCanvas();
    
    const initParticles = () => {
      particlesRef.current = [];
      const particleCount = Math.min(Math.floor(window.innerWidth * 0.025), 50);
      
      for (let i = 0; i < particleCount; i++) {
        particlesRef.current.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.3,
          vy: (Math.random() - 0.5) * 0.3,
          size: Math.random() * 1.5 + 0.5,
          alpha: Math.random() * 0.4 + 0.1,
          hue: Math.random() * 40 + 240,
          pulsePhase: Math.random() * Math.PI * 2,
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
      
      particlesRef.current.forEach((particle) => {
        const dx = mouseRef.current.x - particle.x;
        const dy = mouseRef.current.y - particle.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < 100) {
          const force = (100 - distance) * 0.00005;
          particle.vx += (dx / distance) * force;
          particle.vy += (dy / distance) * force;
        }
        
        particle.vx *= 0.999;
        particle.vy *= 0.999;
        particle.x += particle.vx;
        particle.y += particle.vy;
        
        if (particle.x < 0) particle.x = canvas.width;
        if (particle.x > canvas.width) particle.x = 0;
        if (particle.y < 0) particle.y = canvas.height;
        if (particle.y > canvas.height) particle.y = 0;
        
        particle.pulsePhase += 0.015;
        const pulse = Math.sin(particle.pulsePhase) * 0.3 + 0.7;
        
        const gradient = ctx.createRadialGradient(
          particle.x, particle.y, 0,
          particle.x, particle.y, particle.size * 4
        );
        
        gradient.addColorStop(0, `hsla(${particle.hue}, 80%, 65%, ${particle.alpha * pulse})`);
        gradient.addColorStop(1, 'transparent');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size * 4, 0, Math.PI * 2);
        ctx.fill();
      });
      
      animationId = requestAnimationFrame(animate);
    };
    
    animate();
    
    const handleResize = () => {
      resizeCanvas();
      initParticles();
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationId);
    };
  }, []);
  
  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none"
      style={{ zIndex: 1 }}
    />
  );
};

// Gradient text component
const GradientText = ({ children, className = "", gradient = "from-white via-purple-200 to-blue-200" }) => {
  return (
    <span className={`bg-gradient-to-r ${gradient} bg-clip-text text-transparent ${className}`}>
      {children}
    </span>
  );
};

// Enhanced input field component
const FormField = ({ label, type = "text", name, placeholder, required = false, isTextArea = false, value, onChange }) => {
  const [isFocused, setIsFocused] = useState(false);
  const [hasValue, setHasValue] = useState(false);
  
  const handleChange = (e) => {
    onChange(e);
    setHasValue(e.target.value.length > 0);
  };
  
  const InputComponent = isTextArea ? 'textarea' : 'input';
  
  return (
    <motion.div 
      className="relative group"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <motion.label
        className={`absolute left-4 transition-all duration-300 pointer-events-none ${
          isFocused || hasValue
            ? '-top-6 text-sm text-purple-400 font-medium'
            : 'top-4 text-gray-400'
        }`}
        animate={{
          y: isFocused || hasValue ? -10 : 0,
          scale: isFocused || hasValue ? 0.85 : 1,
          color: isFocused ? '#a855f7' : hasValue ? '#8b5cf6' : '#9ca3af'
        }}
      >
        {label} {required && <span className="text-red-400">*</span>}
      </motion.label>
      
      <InputComponent
        type={type}
        name={name}
        value={value}
        onChange={handleChange}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        required={required}
        rows={isTextArea ? 6 : undefined}
        className={`
          w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-4 mt-2
          text-white placeholder-gray-500 backdrop-blur-xl
          focus:border-purple-400/50 focus:bg-white/10 focus:outline-none focus:ring-2 focus:ring-purple-400/20
          transition-all duration-300 resize-none
          ${isTextArea ? 'min-h-[140px]' : ''}
        `}
        placeholder=""
      />
      
      {/* Animated border effect */}
      <motion.div
        className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-purple-400 to-blue-400 rounded-full"
        initial={{ width: 0 }}
        animate={{ width: isFocused ? '100%' : '0%' }}
        transition={{ duration: 0.3 }}
      />
    </motion.div>
  );
};

// Contact info card component
const ContactCard = ({ icon, title, info, href, delay = 0 }) => {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <motion.div
      className="group relative overflow-hidden rounded-2xl backdrop-blur-xl bg-white/5 border border-white/10 p-6 cursor-pointer"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay }}
      whileHover={{ 
        scale: 1.02,
        y: -5,
        boxShadow: '0 20px 40px -15px rgba(139,92,246,0.3)'
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <motion.a
        href={href}
        className="block text-center"
        whileTap={{ scale: 0.98 }}
      >
        <motion.div 
          className="text-4xl mb-4 inline-block"
          animate={{ 
            rotate: isHovered ? [0, -10, 10, 0] : 0,
            scale: isHovered ? 1.1 : 1
          }}
          transition={{ duration: 0.6 }}
        >
          {icon}
        </motion.div>
        
        <h3 className="text-lg font-semibold mb-2 text-white group-hover:text-purple-300 transition-colors duration-300">
          {title}
        </h3>
        
        <p className="text-gray-400 text-sm group-hover:text-gray-300 transition-colors duration-300">
          {info}
        </p>
        
        {/* Hover glow effect */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-blue-500/10 to-pink-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        />
      </motion.a>
    </motion.div>
  );
};

// Main contact component
const ContactMe = () => {
  const form = useRef();
  const [formData, setFormData] = useState({
    user_name: '',
    user_email: '',
    message: ''
  });
  const [status, setStatus] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });
  
  // EmailJS configuration
  const SERVICE_ID = "service_6yma427";
  const TEMPLATE_ID = "template_lisnygg";
  const PUBLIC_KEY = "kmUboLhmdojghVh1T";
  
  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };
  
  const sendEmail = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatus(null);
    
    try {
      await emailjs.sendForm(SERVICE_ID, TEMPLATE_ID, form.current, PUBLIC_KEY);
      setStatus('success');
      setFormData({ user_name: '', user_email: '', message: '' });
      form.current.reset();
    } catch (error) {
      setStatus('error');
      console.error('EmailJS error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <section className="min-h-screen bg-black text-white relative overflow-hidden py-20">
      {/* Background elements */}
      <div className="absolute inset-0">
        <ContactParticles />
        
        {/* Gradient orbs */}
        <motion.div
          className="absolute top-1/4 left-1/6 w-72 h-72 bg-gradient-to-br from-purple-600/20 via-blue-600/15 to-transparent rounded-full blur-3xl"
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
            x: [0, 30, 0],
            y: [0, -20, 0]
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        
        <motion.div
          className="absolute bottom-1/4 right-1/6 w-80 h-80 bg-gradient-to-br from-cyan-600/20 via-blue-600/15 to-transparent rounded-full blur-3xl"
          animate={{ 
            scale: [1.1, 1, 1.1],
            opacity: [0.4, 0.6, 0.4],
            x: [0, -25, 0],
            y: [0, 25, 0]
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        />
      </div>
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6">
        <motion.div
          ref={sectionRef}
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.8 }}
        >
          {/* Header */}
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 40 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6">
              <GradientText gradient="from-purple-400 via-blue-400 to-cyan-400">
                Let's Connect
              </GradientText>
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Ready to bring your vision to life? I'd love to hear about your project 
              and explore how we can create something amazing together.
            </p>
          </motion.div>
          

          
          {/* Main contact form */}
          <motion.div
            className="max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 40 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <div className="relative overflow-hidden rounded-3xl backdrop-blur-2xl bg-white/5 border border-white/10 shadow-[0_20px_80px_-15px_rgba(139,92,246,0.3)]">
              <div className="p-8 sm:p-12 md:p-16">
                <div className="text-center mb-12">
                  <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">
                    <GradientText gradient="from-purple-300 via-pink-300 to-blue-300">
                      Send Me a Message
                    </GradientText>
                  </h2>
                  <p className="text-gray-400 text-lg">
                    Tell me about your project, and I'll get back to you within 24 hours.
                  </p>
                </div>
                
                <form ref={form} onSubmit={sendEmail} className="space-y-8">
                  <div className="grid md:grid-cols-2 gap-6">
                    <FormField
                      label="Your Name"
                      type="text"
                      name="user_name"
                      value={formData.user_name}
                      onChange={handleInputChange}
                      required={true}
                    />
                    
                    <FormField
                      label="Email Address"
                      type="email"
                      name="user_email"
                      value={formData.user_email}
                      onChange={handleInputChange}
                      required={true}
                    />
                  </div>
                  
                  <FormField
                    label="Your Message"
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    required={true}
                    isTextArea={true}
                  />
                  
                  {/* Submit button */}
                  <motion.div className="text-center pt-4">
                    <motion.button
                      type="submit"
                      disabled={isSubmitting}
                      className="relative inline-flex items-center px-8 sm:px-12 py-4 sm:py-5 text-lg font-semibold text-white bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 rounded-2xl shadow-2xl overflow-hidden group disabled:opacity-50 disabled:cursor-not-allowed"
                      whileHover={!isSubmitting ? { scale: 1.02 } : {}}
                      whileTap={!isSubmitting ? { scale: 0.98 } : {}}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.8 }}
                    >
                      <span className="relative z-10 flex items-center">
                        {isSubmitting ? (
                          <>
                            <motion.div
                              className="w-5 h-5 mr-3 border-2 border-white/30 border-t-white rounded-full"
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            />
                            Sending...
                          </>
                        ) : (
                          <>
                            Send Message
                            <motion.svg 
                              xmlns="http://www.w3.org/2000/svg" 
                              className="h-5 w-5 ml-3" 
                              fill="none" 
                              viewBox="0 0 24 24" 
                              stroke="currentColor"
                              whileHover={{ x: 5 }}
                              transition={{ duration: 0.2 }}
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                            </motion.svg>
                          </>
                        )}
                      </span>
                      
                      {/* Enhanced shimmer effect */}
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12"
                        initial={{ x: '-100%' }}
                        animate={!isSubmitting ? { x: '200%' } : {}}
                        transition={{ duration: 1.5, ease: "easeOut", repeat: Infinity, repeatDelay: 3 }}
                      />
                    </motion.button>
                  </motion.div>
                </form>
                
                {/* Status messages */}
                <AnimatePresence>
                  {status === 'success' && (
                    <motion.div
                      className="mt-8 p-4 rounded-2xl bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 text-center"
                      initial={{ opacity: 0, y: 20, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -20, scale: 0.95 }}
                      transition={{ duration: 0.4 }}
                    >
                      <motion.div
                        className="text-2xl mb-2"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                      >
                        ✨
                      </motion.div>
                      <p className="text-green-300 font-semibold text-lg">
                        Thank you! Your message has been sent successfully.
                      </p>
                      <p className="text-green-400/80 text-sm mt-1">
                        I'll get back to you within 24 hours.
                      </p>
                    </motion.div>
                  )}
                  
                  {status === 'error' && (
                    <motion.div
                      className="mt-8 p-4 rounded-2xl bg-gradient-to-r from-red-500/20 to-pink-500/20 border border-red-500/30 text-center"
                      initial={{ opacity: 0, y: 20, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -20, scale: 0.95 }}
                      transition={{ duration: 0.4 }}
                    >
                      <motion.div
                        className="text-2xl mb-2"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                      >
                        ⚠️
                      </motion.div>
                      <p className="text-red-300 font-semibold text-lg">
                        Oops! Something went wrong.
                      </p>
                      <p className="text-red-400/80 text-sm mt-1">
                        Please try again or contact me directly via email.
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default ContactMe;