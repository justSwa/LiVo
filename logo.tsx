// components/LiVoLogo.tsx
import React from 'react';

interface LiVoLogoProps {
  size?: number;
  color?: string;
  className?: string;
}

const LiVoLogo: React.FC<LiVoLogoProps> = ({ 
  size = 64, 
  color = 'var(--app-accent, #8b7355)',
  className = '' 
}) => {
  return (
    <div 
      className={`relative ${className}`}
      style={{ width: `${size}px`, height: `${size}px` }}
    >
      {/* Background Square */}
      <div 
        className="absolute inset-0 rounded-2xl shadow-lg"
        style={{ backgroundColor: color }}
      />
      
      {/* Lotus Icon - White */}
      <svg
        viewBox="0 0 100 100"
        className="absolute inset-0 p-3"
        fill="white"
      >
        {/* Center circle (person) */}
        <circle cx="50" cy="50" r="6" />
        
        {/* Top petal */}
        <path d="M 50,15 L 58,30 L 42,30 Z" />
        
        {/* Left-top petal */}
        <path d="M 25,30 L 35,40 L 20,45 Z" />
        
        {/* Right-top petal */}
        <path d="M 75,30 L 65,40 L 80,45 Z" />
        
        {/* Left-bottom petal */}
        <path d="M 30,60 L 37,70 L 25,67 Z" />
        
        {/* Right-bottom petal */}
        <path d="M 70,60 L 63,70 L 75,67 Z" />
        
        {/* Bottom-left petal */}
        <path d="M 35,75 L 40,85 L 28,80 Z" />
        
        {/* Bottom-right petal */}
        <path d="M 65,75 L 60,85 L 72,80 Z" />
        
        {/* Stem */}
        <rect x="47" y="56" width="6" height="30" rx="3" />
      </svg>
    </div>
  );
};

export default LiVoLogo;