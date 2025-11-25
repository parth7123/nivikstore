import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import gsap from 'gsap';

const MagicBento = ({
  textAutoHide = true,
  enableStars = true,
  enableSpotlight = true,
  enableBorderGlow = true,
  enableTilt = true,
  enableMagnetism = true,
  clickEffect = true,
  spotlightRadius = 300,
  particleCount = 12,
  glowColor = "132, 0, 255",
  children,
  className = ""
}) => {
  const bentoRef = useRef(null);
  const spotlightRef = useRef(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const [particles, setParticles] = useState([]);

  // Initialize particles
  useEffect(() => {
    if (enableStars) {
      const newParticles = Array.from({ length: particleCount }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 3 + 1,
        duration: Math.random() * 3 + 2,
        delay: Math.random() * 2
      }));
      setParticles(newParticles);
    }
  }, [enableStars, particleCount]);

  // Handle mouse move for spotlight and tilt
  const handleMouseMove = (e) => {
    if (!bentoRef.current) return;

    const rect = bentoRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setMousePosition({ x, y });

    // Tilt effect
    if (enableTilt) {
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = ((y - centerY) / centerY) * 10;
      const rotateY = ((centerX - x) / centerX) * 10;

      gsap.to(bentoRef.current, {
        rotateX: rotateX,
        rotateY: rotateY,
        duration: 0.3,
        ease: "power2.out"
      });
    }

    // Magnetism effect
    if (enableMagnetism) {
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const deltaX = (x - centerX) / 10;
      const deltaY = (y - centerY) / 10;

      gsap.to(bentoRef.current, {
        x: deltaX,
        y: deltaY,
        duration: 0.3,
        ease: "power2.out"
      });
    }
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
    
    if (enableTilt || enableMagnetism) {
      gsap.to(bentoRef.current, {
        rotateX: 0,
        rotateY: 0,
        x: 0,
        y: 0,
        duration: 0.5,
        ease: "power2.out"
      });
    }
  };

  const handleClick = (e) => {
    if (!clickEffect) return;

    const rect = bentoRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Create ripple effect
    const ripple = document.createElement('div');
    ripple.className = 'magic-bento-ripple';
    ripple.style.left = `${x}px`;
    ripple.style.top = `${y}px`;
    bentoRef.current.appendChild(ripple);

    gsap.fromTo(ripple,
      { scale: 0, opacity: 1 },
      {
        scale: 2,
        opacity: 0,
        duration: 0.6,
        ease: "power2.out",
        onComplete: () => ripple.remove()
      }
    );
  };

  return (
    <motion.div
      ref={bentoRef}
      className={`magic-bento relative overflow-hidden rounded-2xl bg-white/50 backdrop-blur-sm p-6 ${className}`}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      style={{
        transformStyle: 'preserve-3d',
        perspective: '1000px'
      }}
      whileHover={{ scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      {/* Border Glow */}
      {enableBorderGlow && (
        <div
          className="absolute -inset-[1px] rounded-2xl opacity-0 transition-opacity duration-300"
          style={{
            background: `linear-gradient(45deg, rgba(${glowColor}, 0.5), rgba(${glowColor}, 0), rgba(${glowColor}, 0.5))`,
            opacity: isHovering ? 1 : 0
          }}
        />
      )}

      {/* Spotlight Effect */}
      {enableSpotlight && isHovering && (
        <div
          ref={spotlightRef}
          className="pointer-events-none absolute -inset-px transition-opacity duration-300"
          style={{
            background: `radial-gradient(${spotlightRadius}px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(${glowColor}, 0.15), transparent 40%)`,
            opacity: isHovering ? 1 : 0
          }}
        />
      )}

      {/* Stars/Particles */}
      {enableStars && particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full bg-white"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
          }}
          animate={{
            opacity: [0, 1, 0],
            scale: [0, 1, 0],
          }}
          transition={{
            duration: particle.duration,
            repeat: Infinity,
            delay: particle.delay,
            ease: "easeInOut"
          }}
        />
      ))}

      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>

      {/* Ripple effect styles */}
      <style jsx>{`
        .magic-bento-ripple {
          position: absolute;
          width: 100px;
          height: 100px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(${glowColor}, 0.4), transparent);
          transform: translate(-50%, -50%);
          pointer-events: none;
        }
      `}</style>
    </motion.div>
  );
};

export default MagicBento;
