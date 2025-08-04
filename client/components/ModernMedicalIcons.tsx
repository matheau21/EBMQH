import React from "react";

// Modern, abstract medical icons for each subspecialty
export const ModernCardiologyIcon = () => (
  <svg viewBox="0 0 60 60" className="w-full h-full">
    {/* Abstract heart shape with geometric elements */}
    <path 
      d="M30 45 C22 37, 10 25, 10 18 C10 12, 15 8, 21 8 C25 8, 28 10, 30 13 C32 10, 35 8, 39 8 C45 8, 50 12, 50 18 C50 25, 38 37, 30 45 Z" 
      fill="currentColor" 
      opacity="0.8"
    />
    {/* Modern pulse line */}
    <path 
      d="M5 30 L15 30 L18 20 L22 40 L26 20 L30 30 L55 30" 
      stroke="currentColor" 
      strokeWidth="2" 
      fill="none"
      opacity="0.9"
    />
  </svg>
);

export const ModernHemeOncIcon = () => (
  <svg viewBox="0 0 60 60" className="w-full h-full">
    {/* Abstract cell with modern geometric design */}
    <circle cx="30" cy="30" r="15" fill="currentColor" opacity="0.3" />
    <circle cx="30" cy="30" r="8" fill="currentColor" opacity="0.6" />
    <circle cx="30" cy="30" r="3" fill="currentColor" />
    
    {/* Modern connecting elements */}
    <circle cx="15" cy="15" r="3" fill="currentColor" opacity="0.4" />
    <circle cx="45" cy="15" r="3" fill="currentColor" opacity="0.4" />
    <circle cx="15" cy="45" r="3" fill="currentColor" opacity="0.4" />
    <circle cx="45" cy="45" r="3" fill="currentColor" opacity="0.4" />
    
    <line x1="18" y1="18" x2="27" y2="27" stroke="currentColor" strokeWidth="1.5" opacity="0.5"/>
    <line x1="42" y1="18" x2="33" y2="27" stroke="currentColor" strokeWidth="1.5" opacity="0.5"/>
  </svg>
);

export const ModernEndocrinologyIcon = () => (
  <svg viewBox="0 0 60 60" className="w-full h-full">
    {/* Abstract endocrine gland */}
    <ellipse cx="30" cy="25" rx="10" ry="8" fill="currentColor" opacity="0.7"/>
    
    {/* Hormone flow visualization */}
    <circle cx="20" cy="40" r="2" fill="currentColor" opacity="0.5"/>
    <circle cx="30" cy="45" r="2" fill="currentColor" opacity="0.5"/>
    <circle cx="40" cy="40" r="2" fill="currentColor" opacity="0.5"/>
    
    {/* Flow lines */}
    <path d="M30 33 L20 40" stroke="currentColor" strokeWidth="1.5" opacity="0.6"/>
    <path d="M30 33 L30 43" stroke="currentColor" strokeWidth="1.5" opacity="0.6"/>
    <path d="M30 33 L40 40" stroke="currentColor" strokeWidth="1.5" opacity="0.6"/>
  </svg>
);

export const ModernGeneralInternalIcon = () => (
  <svg viewBox="0 0 60 60" className="w-full h-full">
    {/* Stethoscope earpieces */}
    <circle cx="20" cy="15" r="4" fill="currentColor" opacity="0.8"/>
    <circle cx="40" cy="15" r="4" fill="currentColor" opacity="0.8"/>

    {/* Stethoscope tubing */}
    <path d="M20 19 Q15 25 15 35 Q15 45 25 50" stroke="currentColor" strokeWidth="3" fill="none"/>
    <path d="M40 19 Q45 25 45 35 Q45 45 35 50" stroke="currentColor" strokeWidth="3" fill="none"/>

    {/* Chest piece (diaphragm) */}
    <circle cx="30" cy="50" r="8" fill="currentColor" opacity="0.9"/>
    <circle cx="30" cy="50" r="5" fill="none" stroke="white" strokeWidth="1.5"/>

    {/* Binaurals (headset connector) */}
    <path d="M20 15 Q30 10 40 15" stroke="currentColor" strokeWidth="2" fill="none"/>
  </svg>
);

export const ModernPulmonaryCriticalIcon = () => (
  <svg viewBox="0 0 60 60" className="w-full h-full">
    {/* Abstract lungs */}
    <path d="M20 15 Q12 20 12 35 Q12 45 20 50 Q28 45 28 35 Q28 20 20 15" fill="currentColor" opacity="0.6"/>
    <path d="M40 15 Q32 20 32 35 Q32 45 40 50 Q48 45 48 35 Q48 20 40 15" fill="currentColor" opacity="0.6"/>
    
    {/* Modern airway */}
    <rect x="28" y="10" width="4" height="10" fill="currentColor" opacity="0.8"/>
    
    {/* Abstract bronchi */}
    <path d="M30 20 L25 25" stroke="currentColor" strokeWidth="2" />
    <path d="M30 20 L35 25" stroke="currentColor" strokeWidth="2" />
  </svg>
);

export const ModernInfectiousIcon = () => (
  <svg viewBox="0 0 60 60" className="w-full h-full">
    {/* Abstract virus/pathogen */}
    <circle cx="30" cy="30" r="10" fill="currentColor" opacity="0.6"/>
    
    {/* Modern spikes */}
    <circle cx="20" cy="20" r="2" fill="currentColor"/>
    <circle cx="40" cy="20" r="2" fill="currentColor"/>
    <circle cx="20" cy="40" r="2" fill="currentColor"/>
    <circle cx="40" cy="40" r="2" fill="currentColor"/>
    <circle cx="15" cy="30" r="2" fill="currentColor"/>
    <circle cx="45" cy="30" r="2" fill="currentColor"/>
    <circle cx="30" cy="15" r="2" fill="currentColor"/>
    <circle cx="30" cy="45" r="2" fill="currentColor"/>
    
    {/* Protection element */}
    <circle cx="30" cy="30" r="18" fill="none" stroke="currentColor" strokeWidth="2" opacity="0.4" strokeDasharray="4,4"/>
  </svg>
);

export const ModernRheumatologyIcon = () => (
  <svg viewBox="0 0 60 60" className="w-full h-full">
    {/* Abstract joint representation */}
    <rect x="20" y="15" width="6" height="15" rx="3" fill="currentColor" opacity="0.7"/>
    <rect x="34" y="15" width="6" height="15" rx="3" fill="currentColor" opacity="0.7"/>
    
    {/* Joint space */}
    <ellipse cx="30" cy="25" rx="8" ry="4" fill="currentColor" opacity="0.4"/>
    
    {/* Modern bone ends */}
    <circle cx="23" cy="18" r="4" fill="currentColor" opacity="0.8"/>
    <circle cx="37" cy="18" r="4" fill="currentColor" opacity="0.8"/>
    <circle cx="23" cy="32" r="4" fill="currentColor" opacity="0.8"/>
    <circle cx="37" cy="32" r="4" fill="currentColor" opacity="0.8"/>
  </svg>
);

export const ModernNephrologyIcon = () => (
  <svg viewBox="0 0 60 60" className="w-full h-full">
    {/* Modern kidney design */}
    <path d="M25 15 Q18 20 18 30 Q18 40 25 45 Q32 40 35 35 Q38 30 35 25 Q32 20 25 15" 
          fill="currentColor" opacity="0.8"/>
    
    {/* Simplified filtration */}
    <circle cx="25" cy="28" r="2" fill="currentColor" opacity="0.6"/>
    <circle cx="25" cy="35" r="1.5" fill="currentColor" opacity="0.6"/>
    
    {/* Modern flow indicators */}
    <circle cx="42" cy="20" r="1" fill="currentColor" opacity="0.5"/>
    <circle cx="45" cy="30" r="1" fill="currentColor" opacity="0.5"/>
    <circle cx="42" cy="40" r="1" fill="currentColor" opacity="0.5"/>
  </svg>
);

export const ModernGastroenterologyIcon = () => (
  <svg viewBox="0 0 60 60" className="w-full h-full">
    {/* Abstract GI tract */}
    <path d="M20 15 Q25 12 30 15 Q35 18 35 25 Q35 32 32 40 Q29 48 25 48 Q21 48 18 40 Q15 32 15 25 Q15 18 20 15" 
          fill="currentColor" opacity="0.6"/>
    
    {/* Modern digestive elements */}
    <circle cx="25" cy="25" r="2" fill="currentColor" opacity="0.7"/>
    <circle cx="27" cy="35" r="1.5" fill="currentColor" opacity="0.7"/>
    
    {/* Abstract scope */}
    <path d="M10 12 Q15 15 22 20" 
          stroke="currentColor" strokeWidth="2" fill="none" opacity="0.8"/>
    <circle cx="8" cy="10" r="2" fill="currentColor" opacity="0.8"/>
  </svg>
);
