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
    <ellipse cx="35" cy="28" rx="8" ry="12" fill="currentColor" opacity="0.7" />

    {/* Thyroid left lobe */}
    <ellipse cx="25" cy="28" rx="8" ry="12" fill="currentColor" opacity="0.7" />

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
    <circle cx="25" cy="42" r="1.5" fill="currentColor" opacity="0.9" />
    <circle cx="35" cy="42" r="1.5" fill="currentColor" opacity="0.9" />
    <circle cx="30" cy="45" r="1" fill="currentColor" opacity="0.8" />

    {/* Hormone flow lines */}
    <path
      d="M25 42 Q30 47 35 42"
      stroke="currentColor"
      strokeWidth="1"
      opacity="0.6"
      fill="none"
    />
  </svg>
);

export const ModernGeneralInternalIcon = () => (
  <svg viewBox="0 0 60 60" className="w-full h-full">
    {/* Earpieces */}
    <circle cx="20" cy="14" r="3.5" fill="currentColor" opacity="0.9" />
    <circle cx="40" cy="14" r="3.5" fill="currentColor" opacity="0.9" />

    {/* Flexible tubing from each side joining into single tube */}
    <path d="M20 18 C16 26, 16 36, 28 42" stroke="currentColor" strokeWidth="3" fill="none" />
    <path d="M40 18 C44 26, 44 36, 32 42" stroke="currentColor" strokeWidth="3" fill="none" />

    {/* Single tube to chest piece */}
    <path d="M30 42 C32 46, 36 48, 40 48" stroke="currentColor" strokeWidth="3" fill="none" />

    {/* Chest piece and diaphragm */}
    <circle cx="47" cy="48" r="4.5" fill="currentColor" opacity="0.95" />
    <circle cx="47" cy="48" r="2.7" fill="none" stroke="white" strokeWidth="1.5" />

    {/* Short stem connecting tube to chest piece */}
    <path d="M40 48 L43 48" stroke="currentColor" strokeWidth="3" />
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
    {/* Femur (upper leg bone) */}
    <rect
      x="25"
      y="10"
      width="5"
      height="20"
      rx="2"
      fill="currentColor"
      opacity="0.8"
    />

    {/* Tibia (lower leg bone) */}
    <rect
      x="25"
      y="35"
      width="5"
      height="18"
      rx="2"
      fill="currentColor"
      opacity="0.8"
    />

    {/* Femur head (top) */}
    <circle cx="27.5" cy="12" r="3" fill="currentColor" opacity="0.9" />

    {/* Femur condyles (bottom of femur) */}
    <ellipse cx="24" cy="29" rx="3" ry="2" fill="currentColor" opacity="0.9" />
    <ellipse cx="31" cy="29" rx="3" ry="2" fill="currentColor" opacity="0.9" />

    {/* Tibia plateau (top of tibia) */}
    <ellipse
      cx="27.5"
      cy="36"
      rx="5"
      ry="2"
      fill="currentColor"
      opacity="0.9"
    />

    {/* Knee joint space */}
    <ellipse
      cx="27.5"
      cy="32"
      rx="6"
      ry="2"
      fill="currentColor"
      opacity="0.4"
    />

    {/* Patella (kneecap) */}
    <ellipse
      cx="27.5"
      cy="28"
      rx="2.5"
      ry="3"
      fill="currentColor"
      opacity="0.9"
    />

    {/* Joint lines to show articulation */}
    <path
      d="M21 32 Q27.5 34 34 32"
      stroke="currentColor"
      strokeWidth="1"
      opacity="0.6"
      fill="none"
    />

    {/* Ankle representation */}
    <circle cx="27.5" cy="51" r="2" fill="currentColor" opacity="0.8" />
  </svg>
);

export const ModernNephrologyIcon = () => (
  <svg viewBox="0 0 60 60" className="w-full h-full">
    {/* Kidney bean shape */}
    <path
      d="M25 15 Q15 18 12 28 Q10 35 12 42 Q15 50 25 50 Q32 50 35 45 Q40 38 38 32 Q35 25 32 20 Q28 15 25 15"
      fill="currentColor"
      opacity="0.8"
    />

    {/* Renal hilum (indented area) */}
    <path
      d="M32 20 Q35 25 35 30 Q35 35 32 40"
      stroke="currentColor"
      strokeWidth="2"
      fill="none"
      opacity="0.9"
    />

    {/* Renal cortex and medulla structure */}
    <ellipse cx="22" cy="25" rx="3" ry="2" fill="currentColor" opacity="0.6" />
    <ellipse
      cx="20"
      cy="32"
      rx="2.5"
      ry="1.5"
      fill="currentColor"
      opacity="0.6"
    />
    <ellipse cx="23" cy="38" rx="3" ry="2" fill="currentColor" opacity="0.6" />

    {/* Renal pelvis */}
    <ellipse cx="32" cy="30" rx="2" ry="4" fill="currentColor" opacity="0.9" />

    {/* Ureter */}
    <path
      d="M32 34 Q34 40 36 45 Q37 48 38 50"
      stroke="currentColor"
      strokeWidth="2"
      fill="none"
      opacity="0.8"
    />

    {/* Filtration indicators */}
    <circle cx="18" cy="28" r="1" fill="currentColor" opacity="0.7" />
    <circle cx="16" cy="35" r="0.8" fill="currentColor" opacity="0.7" />
    <circle cx="19" cy="42" r="0.9" fill="currentColor" opacity="0.7" />
  </svg>
);

export const ModernGastroenterologyIcon = () => (
  <svg viewBox="0 0 60 60" className="w-full h-full">
    {/* Liver (dominant on right) */}
    <path
      d="M26 22 Q38 18 44 24 Q46 27 46 31 Q46 36 43 40 Q40 45 34 46 Q28 47 24 45 Q20 43 18 38 Q16 33 18 28 Q20 24 26 22"
      fill="currentColor"
      opacity="0.75"
    />
    {/* Simple hepatic markings */}
    <path d="M28 28 Q33 30 38 28" stroke="currentColor" strokeWidth="1.2" fill="none" opacity="0.7" />
    <path d="M26 34 Q32 36 38 34" stroke="currentColor" strokeWidth="1.2" fill="none" opacity="0.7" />

    {/* Stomach (on left, curved sac) */}
    <path
      d="M14 26 C 10 30, 12 39, 20 43 C 26 46, 32 43, 32 37 C 32 33, 30 31, 28 29 C 26 27, 24 25, 22 25"
      fill="currentColor"
      opacity="0.55"
    />
    {/* Stomach outline accent */}
    <path d="M14 26 C 10 30, 12 39, 20 43" stroke="currentColor" strokeWidth="1.2" fill="none" opacity="0.6" />
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
