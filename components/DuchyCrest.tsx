import React from 'react';

interface DuchyCrestProps {
  className?: string;
  size?: number;
}

export const DuchyCrest: React.FC<DuchyCrestProps> = ({ className = "w-8 h-8", size }) => {
  return (
    <svg 
      viewBox="0 0 100 100" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={size ? { width: size, height: size } : undefined}
    >
      {/* Background Rounded Shield / Tile */}
      <rect x="4" y="4" width="92" height="92" rx="20" fill="#F59E0B" />
      <rect x="7" y="7" width="86" height="86" rx="17" fill="#0B0E14" />
      
      {/* Gold Border Highlight */}
      <rect x="9" y="9" width="82" height="82" rx="15" stroke="#F59E0B" strokeWidth="2" strokeOpacity="0.4" />
      
      {/* Inner Shield */}
      <path 
        d="M26 28 H74 V54 C74 68 50 82 50 82 C50 82 26 68 26 54 Z" 
        fill="#0F172A" 
        stroke="#F59E0B" 
        strokeWidth="3.5"
      />
      
      {/* Crown on top */}
      <path 
        d="M33 34 L38 43 L50 33 L62 43 L67 34 L64 47 H36 Z" 
        fill="#F59E0B"
      />
      <circle cx="33" cy="33" r="2.5" fill="#FDE68A" />
      <circle cx="50" cy="31" r="3" fill="#FDE68A" />
      <circle cx="67" cy="33" r="2.5" fill="#FDE68A" />

      {/* Cornish 15 Golden Bezants / Cross Accent */}
      <circle cx="50" cy="55" r="3" fill="#F59E0B" />
      <circle cx="42" cy="55" r="2.5" fill="#F59E0B" />
      <circle cx="58" cy="55" r="2.5" fill="#F59E0B" />
      <circle cx="46" cy="62" r="2.5" fill="#F59E0B" />
      <circle cx="54" cy="62" r="2.5" fill="#F59E0B" />
      <circle cx="50" cy="69" r="2.5" fill="#F59E0B" />
    </svg>
  );
};
