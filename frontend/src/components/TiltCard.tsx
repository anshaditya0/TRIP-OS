import React, { useRef, useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'motion/react';

interface TiltCardProps {
  children: React.ReactNode;
  className?: string;
  maxTilt?: number;
  glareColor?: string;
  glareMaxOpacity?: number;
  onClick?: () => void;
  id?: string;
  style?: React.CSSProperties;
  scaleOnHover?: number;
}

export const TiltCard: React.FC<TiltCardProps> = ({
  children,
  className = '',
  maxTilt = 7,
  glareColor = 'rgba(255, 255, 255, 0.65)',
  glareMaxOpacity = 0.35,
  onClick,
  id,
  style,
  scaleOnHover = 1.015,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  // Mouse position values (-0.5 to 0.5)
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Smooth springs for rotational tilt
  const springConfig = { damping: 22, stiffness: 280 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  // Map to 3D rotation angles
  const rotateX = useTransform(smoothY, [-0.5, 0.5], [maxTilt, -maxTilt]);
  const rotateY = useTransform(smoothX, [-0.5, 0.5], [-maxTilt, maxTilt]);

  // Glare position percentages
  const [glarePos, setGlarePos] = useState({ x: 50, y: 50 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const normX = x / rect.width - 0.5;
    const normY = y / rect.height - 0.5;

    mouseX.set(normX);
    mouseY.set(normY);

    setGlarePos({
      x: (x / rect.width) * 100,
      y: (y / rect.height) * 100,
    });
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    mouseX.set(0);
    mouseY.set(0);
  };

  return (
    <motion.div
      ref={cardRef}
      id={id}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX,
        rotateY,
        transformStyle: 'preserve-3d',
        ...style,
      }}
      whileHover={{
        scale: scaleOnHover,
        transition: { duration: 0.25, ease: [0.16, 1, 0.3, 1] },
      }}
      whileTap={{ scale: 0.985 }}
      className={`relative perspective-1000 ${className}`}
    >
      {/* Specular glare sheen overlay */}
      <div
        className="glass-glare transition-opacity duration-300 pointer-events-none"
        style={{
          opacity: isHovered ? glareMaxOpacity : 0,
          background: `radial-gradient(circle 280px at ${glarePos.x}% ${glarePos.y}%, ${glareColor}, transparent 75%)`,
        }}
        aria-hidden="true"
      />

      {/* Main card content */}
      <div className="w-full h-full relative z-[1]">
        {children}
      </div>
    </motion.div>
  );
};
