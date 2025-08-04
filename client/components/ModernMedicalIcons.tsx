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

    <line
      x1="18"
      y1="18"
      x2="27"
      y2="27"
      stroke="currentColor"
      strokeWidth="1.5"
      opacity="0.5"
    />
    <line
      x1="42"
      y1="18"
      x2="33"
      y2="27"
      stroke="currentColor"
      strokeWidth="1.5"
      opacity="0.5"
    />
  </svg>
);

export const ModernEndocrinologyIcon = () => (
  <svg viewBox="0 0 60 60" className="w-full h-full">
    {/* Thyroid right lobe */}
    <ellipse
      cx="35"
      cy="28"
      rx="8"
      ry="12"
      fill="currentColor"
      opacity="0.7"
    />

    {/* Thyroid left lobe */}
    <ellipse
      cx="25"
      cy="28"
      rx="8"
      ry="12"
      fill="currentColor"
      opacity="0.7"
    />

    {/* Thyroid isthmus (connecting bridge) */}
    <rect
      x="25"
      y="26"
      width="10"
      height="4"
      rx="2"
      fill="currentColor"
      opacity="0.8"
    />

    {/* Thyroid cartilage outline */}
    <path
      d="M22 15 Q30 12 38 15 Q40 18 38 22 Q35 20 30 20 Q25 20 22 22 Q20 18 22 15"
      stroke="currentColor"
      strokeWidth="1.5"
      fill="none"
      opacity="0.6"
    />

    {/* Hormone release points */}
    <circle cx="25" cy="42" r="1.5" fill="currentColor" opacity="0.9"/>
    <circle cx="35" cy="42" r="1.5" fill="currentColor" opacity="0.9"/>
    <circle cx="30" cy="45" r="1" fill="currentColor" opacity="0.8"/>

    {/* Hormone flow lines */}
    <path d="M25 42 Q30 47 35 42" stroke="currentColor" strokeWidth="1" opacity="0.6" fill="none"/>
  </svg>
);

export const ModernGeneralInternalIcon = () => (
  <svg viewBox="0 0 60 60" className="w-full h-full">
    {/* Stethoscope earpieces */}
    <circle cx="20" cy="15" r="4" fill="currentColor" opacity="0.8" />
    <circle cx="40" cy="15" r="4" fill="currentColor" opacity="0.8" />

    {/* Stethoscope tubing */}
    <path
      d="M20 19 Q15 25 15 35 Q15 45 25 50"
      stroke="currentColor"
      strokeWidth="3"
      fill="none"
    />
    <path
      d="M40 19 Q45 25 45 35 Q45 45 35 50"
      stroke="currentColor"
      strokeWidth="3"
      fill="none"
    />

    {/* Chest piece (diaphragm) */}
    <circle cx="30" cy="50" r="8" fill="currentColor" opacity="0.9" />
    <circle
      cx="30"
      cy="50"
      r="5"
      fill="none"
      stroke="white"
      strokeWidth="1.5"
    />

    {/* Binaurals (headset connector) */}
    <path
      d="M20 15 Q30 10 40 15"
      stroke="currentColor"
      strokeWidth="2"
      fill="none"
    />
  </svg>
);

export const ModernPulmonaryCriticalIcon = () => (
  <svg viewBox="0 0 60 60" className="w-full h-full">
    {/* Abstract lungs */}
    <path
      d="M20 15 Q12 20 12 35 Q12 45 20 50 Q28 45 28 35 Q28 20 20 15"
      fill="currentColor"
      opacity="0.6"
    />
    <path
      d="M40 15 Q32 20 32 35 Q32 45 40 50 Q48 45 48 35 Q48 20 40 15"
      fill="currentColor"
      opacity="0.6"
    />

    {/* Modern airway */}
    <rect
      x="28"
      y="10"
      width="4"
      height="10"
      fill="currentColor"
      opacity="0.8"
    />

    {/* Abstract bronchi */}
    <path d="M30 20 L25 25" stroke="currentColor" strokeWidth="2" />
    <path d="M30 20 L35 25" stroke="currentColor" strokeWidth="2" />
  </svg>
);

export const ModernInfectiousIcon = () => (
  <svg viewBox="0 0 60 60" className="w-full h-full">
    {/* Abstract virus/pathogen */}
    <circle cx="30" cy="30" r="10" fill="currentColor" opacity="0.6" />

    {/* Modern spikes */}
    <circle cx="20" cy="20" r="2" fill="currentColor" />
    <circle cx="40" cy="20" r="2" fill="currentColor" />
    <circle cx="20" cy="40" r="2" fill="currentColor" />
    <circle cx="40" cy="40" r="2" fill="currentColor" />
    <circle cx="15" cy="30" r="2" fill="currentColor" />
    <circle cx="45" cy="30" r="2" fill="currentColor" />
    <circle cx="30" cy="15" r="2" fill="currentColor" />
    <circle cx="30" cy="45" r="2" fill="currentColor" />

    {/* Protection element */}
    <circle
      cx="30"
      cy="30"
      r="18"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      opacity="0.4"
      strokeDasharray="4,4"
    />
  </svg>
);

export const ModernRheumatologyIcon = () => (
  <svg viewBox="0 0 60 60" className="w-full h-full">
    {/* Abstract joint representation */}
    <rect
      x="20"
      y="15"
      width="6"
      height="15"
      rx="3"
      fill="currentColor"
      opacity="0.7"
    />
    <rect
      x="34"
      y="15"
      width="6"
      height="15"
      rx="3"
      fill="currentColor"
      opacity="0.7"
    />

    {/* Joint space */}
    <ellipse cx="30" cy="25" rx="8" ry="4" fill="currentColor" opacity="0.4" />

    {/* Modern bone ends */}
    <circle cx="23" cy="18" r="4" fill="currentColor" opacity="0.8" />
    <circle cx="37" cy="18" r="4" fill="currentColor" opacity="0.8" />
    <circle cx="23" cy="32" r="4" fill="currentColor" opacity="0.8" />
    <circle cx="37" cy="32" r="4" fill="currentColor" opacity="0.8" />
  </svg>
);

export const ModernNephrologyIcon = () => (
  <svg viewBox="0 0 60 60" className="w-full h-full">
    {/* Modern kidney design */}
    <path
      d="M25 15 Q18 20 18 30 Q18 40 25 45 Q32 40 35 35 Q38 30 35 25 Q32 20 25 15"
      fill="currentColor"
      opacity="0.8"
    />

    {/* Simplified filtration */}
    <circle cx="25" cy="28" r="2" fill="currentColor" opacity="0.6" />
    <circle cx="25" cy="35" r="1.5" fill="currentColor" opacity="0.6" />

    {/* Modern flow indicators */}
    <circle cx="42" cy="20" r="1" fill="currentColor" opacity="0.5" />
    <circle cx="45" cy="30" r="1" fill="currentColor" opacity="0.5" />
    <circle cx="42" cy="40" r="1" fill="currentColor" opacity="0.5" />
  </svg>
);

export const ModernGastroenterologyIcon = () => (
  <svg viewBox="0 0 60 60" className="w-full h-full">
    {/* Liver shape - right lobe */}
    <path
      d="M20 20 Q35 15 40 22 Q42 25 42 30 Q42 35 40 40 Q38 45 35 46 Q30 47 25 45 Q20 43 18 38 Q16 33 16 28 Q16 23 20 20"
      fill="currentColor"
      opacity="0.7"
    />

    {/* Liver shape - left lobe */}
    <path
      d="M16 28 Q14 25 12 22 Q10 20 8 22 Q6 25 6 30 Q6 35 8 38 Q10 40 13 41 Q16 42 18 40 Q18 35 16 28"
      fill="currentColor"
      opacity="0.6"
    />

    {/* Liver vessels/hepatic structure */}
    <path
      d="M25 25 Q30 27 35 25"
      stroke="currentColor"
      strokeWidth="1.5"
      opacity="0.8"
      fill="none"
    />
    <path
      d="M22 32 Q28 34 34 32"
      stroke="currentColor"
      strokeWidth="1.5"
      opacity="0.8"
      fill="none"
    />
    <path
      d="M24 38 Q30 40 36 38"
      stroke="currentColor"
      strokeWidth="1.5"
      opacity="0.8"
      fill="none"
    />

    {/* Hepatic portal */}
    <circle cx="30" cy="30" r="1.5" fill="currentColor" opacity="0.9"/>
    <circle cx="25" cy="35" r="1" fill="currentColor" opacity="0.9"/>
    <circle cx="32" cy="37" r="1" fill="currentColor" opacity="0.9"/>
  </svg>
);

export const ModernNeurologyIcon = () => (
  <svg viewBox="0 0 60 60" className="w-full h-full">
    {/* Left brain hemisphere */}
    <path
      d="M15 30 C15 20, 20 12, 30 12 C30 12, 30 48, 30 48 C20 48, 15 40, 15 30 Z"
      fill="currentColor"
      opacity="0.7"
    />

    {/* Right brain hemisphere */}
    <path
      d="M45 30 C45 20, 40 12, 30 12 C30 12, 30 48, 30 48 C40 48, 45 40, 45 30 Z"
      fill="currentColor"
      opacity="0.5"
    />

    {/* Brain folds/sulci */}
    <path
      d="M18 20 Q22 18, 26 20 Q24 22, 20 22"
      stroke="currentColor"
      strokeWidth="1"
      fill="none"
      opacity="0.8"
    />
    <path
      d="M34 20 Q38 18, 42 20 Q40 22, 36 22"
      stroke="currentColor"
      strokeWidth="1"
      fill="none"
      opacity="0.8"
    />
    <path
      d="M18 28 Q24 26, 28 28"
      stroke="currentColor"
      strokeWidth="1"
      fill="none"
      opacity="0.8"
    />
    <path
      d="M32 28 Q36 26, 42 28"
      stroke="currentColor"
      strokeWidth="1"
      fill="none"
      opacity="0.8"
    />

    {/* Central fissure */}
    <line
      x1="30"
      y1="15"
      x2="30"
      y2="45"
      stroke="currentColor"
      strokeWidth="1.5"
      opacity="0.6"
    />

    {/* Brain stem */}
    <rect
      x="27"
      y="44"
      width="6"
      height="8"
      rx="3"
      fill="currentColor"
      opacity="0.8"
    />
  </svg>
);
