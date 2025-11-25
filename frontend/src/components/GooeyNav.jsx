import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';

const GooeyNav = ({ 
  items = [], 
  particleCount = 15, 
  particleDistances = [90, 10], 
  particleR = 100, 
  initialActiveIndex = 0, 
  animationTime = 600, 
  timeVariance = 300, 
  colors = [1, 2, 3, 1, 2, 3, 1, 4] 
}) => {
  const [activeIndex, setActiveIndex] = useState(initialActiveIndex);
  const location = useLocation();
  const navRef = useRef(null);
  // Map colors to actual CSS colors
  const colorPalette = [
    '#ff0080', // 1: Pink
    '#7928ca', // 2: Purple
    '#0070f3', // 3: Blue
    '#00dfd8', // 4: Cyan
    '#ff4d4d', // 5: Red
  ];

  const getParticleColor = (index) => {
    const colorIndex = colors[index % colors.length] - 1;
    return colorPalette[colorIndex % colorPalette.length] || '#000';
  };

  useEffect(() => {
    const index = items.findIndex(item => item.href === location.pathname);
    if (index !== -1) {
      setActiveIndex(index);
    }
  }, [location.pathname, items]);

  // Calculate active item position and size
  const [activeStyle, setActiveStyle] = useState({ left: 0, width: 0 });

  useEffect(() => {
    const currentItem = document.getElementById(`nav-item-${activeIndex}`);
    if (currentItem) {
      setActiveStyle({
        left: currentItem.offsetLeft,
        width: currentItem.offsetWidth,
      });
    }
  }, [activeIndex, items]);

  return (
    <div className="relative flex items-center justify-center py-10">
      {/* SVG Filter for Gooey Effect */}
      <svg style={{ position: 'absolute', width: 0, height: 0 }}>
        <defs>
          <filter id="goo">
            <feGaussianBlur in="SourceGraphic" stdDeviation="10" result="blur" />
            <feColorMatrix 
              in="blur" 
              mode="matrix" 
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 19 -9" 
              result="goo" 
            />
            <feComposite in="SourceGraphic" in2="goo" operator="atop" />
          </filter>
        </defs>
      </svg>

      {/* Main Container with Liquid Glass Theme */}
      <div 
        className="relative flex items-center gap-2 px-2 py-2 rounded-full backdrop-blur-xl bg-white/10 border border-white/20 shadow-[0_8px_32px_0_rgba(31,38,135,0.37)]"
        ref={navRef}
      >
        {/* Gooey Layer (Background) */}
        <div 
          className="absolute inset-0 overflow-hidden rounded-full"
          style={{ filter: 'url(#goo)' }}
        >
          {/* Active Indicator Blob/Pill */}
          <motion.div
            className="absolute top-2 bottom-2 bg-white rounded-full"
            animate={{
              left: activeStyle.left,
              width: activeStyle.width,
            }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 30
            }}
            style={{
              zIndex: 0,
              opacity: 0.8, // Slightly transparent to blend
            }}
          />

          {/* Particles */}
          {items.map((_, index) => {
             if (index !== activeIndex) return null;
             return (
               <div key={index} className="absolute top-1/2 left-0 w-full h-0 flex justify-center items-center" style={{ transform: `translateX(${activeStyle.left + activeStyle.width/2}px)` }}>
                  {[...Array(particleCount)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute rounded-full"
                      style={{
                        backgroundColor: getParticleColor(i),
                        width: Math.random() * 15 + 5,
                        height: Math.random() * 15 + 5,
                      }}
                      animate={{
                        x: [0, (Math.random() - 0.5) * particleDistances[0]],
                        y: [0, (Math.random() - 0.5) * particleDistances[0]],
                        scale: [1, 0],
                        opacity: [1, 0],
                        rotate: [0, (Math.random() - 0.5) * particleR],
                      }}
                      transition={{
                        duration: animationTime / 1000 + Math.random() * (timeVariance / 1000),
                        repeat: Infinity,
                        ease: "easeOut",
                      }}
                    />
                  ))}
               </div>
             )
          })}
        </div>

        {/* Content Layer (Foreground) */}
        <div className="relative z-10 flex items-center gap-2">
          {items.map((item, index) => (
            <Link 
              key={index} 
              id={`nav-item-${index}`}
              to={item.href}
              className={`relative px-6 py-2 rounded-full text-sm font-medium transition-colors duration-300 ${
                activeIndex === index ? 'text-black' : 'text-gray-700 hover:text-black'
              }`}
              onClick={() => setActiveIndex(index)}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GooeyNav;
