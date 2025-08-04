import React from "react";

// Specific medical icons for each subspecialty
export const CardiologySpecificIcon = () => (
  <svg viewBox="0 0 80 80" className="w-full h-full">
    {/* Heart shape */}
    <path
      d="M40 65 C30 55, 15 40, 15 28 C15 20, 22 15, 30 15 C35 15, 39 18, 40 22 C41 18, 45 15, 50 15 C58 15, 65 20, 65 28 C65 40, 50 55, 40 65 Z"
      fill="currentColor"
      opacity="0.8"
    />
    {/* EKG line overlay */}
    <path
      d="M10 40 L25 40 L28 25 L32 55 L36 25 L40 40 L70 40"
      stroke="currentColor"
      strokeWidth="2.5"
      fill="none"
      opacity="0.9"
    />
    {/* Small pulse dots */}
    <circle cx="20" cy="40" r="1.5" fill="currentColor" />
    <circle cx="60" cy="40" r="1.5" fill="currentColor" />
  </svg>
);

export const HemeOncSpecificIcon = () => (
  <svg viewBox="0 0 80 80" className="w-full h-full">
    {/* Cell/molecule structure */}
    <circle
      cx="40"
      cy="40"
      r="18"
      fill="currentColor"
      opacity="0.3"
      stroke="currentColor"
      strokeWidth="2"
    />
    <circle cx="40" cy="40" r="8" fill="currentColor" opacity="0.6" />

    {/* DNA helix representation */}
    <path
      d="M25 20 Q35 30 25 40 Q35 50 25 60"
      stroke="currentColor"
      strokeWidth="2"
      fill="none"
      opacity="0.7"
    />
    <path
      d="M55 20 Q45 30 55 40 Q45 50 55 60"
      stroke="currentColor"
      strokeWidth="2"
      fill="none"
      opacity="0.7"
    />

    {/* Connecting bonds */}
    <line
      x1="28"
      y1="25"
      x2="52"
      y2="25"
      stroke="currentColor"
      strokeWidth="1.5"
      opacity="0.5"
    />
    <line
      x1="25"
      y1="40"
      x2="55"
      y2="40"
      stroke="currentColor"
      strokeWidth="1.5"
      opacity="0.5"
    />
    <line
      x1="28"
      y1="55"
      x2="52"
      y2="55"
      stroke="currentColor"
      strokeWidth="1.5"
      opacity="0.5"
    />
  </svg>
);

export const EndocrinologySpecificIcon = () => (
  <svg viewBox="0 0 80 80" className="w-full h-full">
    {/* Thyroid gland shape */}
    <ellipse cx="35" cy="35" rx="8" ry="12" fill="currentColor" opacity="0.6" />
    <ellipse cx="45" cy="35" rx="8" ry="12" fill="currentColor" opacity="0.6" />
    <rect
      x="38"
      y="25"
      width="4"
      height="8"
      fill="currentColor"
      opacity="0.8"
    />

    {/* Hormone molecules */}
    <circle cx="25" cy="55" r="3" fill="currentColor" opacity="0.4" />
    <circle cx="55" cy="55" r="3" fill="currentColor" opacity="0.4" />
    <circle cx="40" cy="65" r="3" fill="currentColor" opacity="0.4" />

    {/* Flow lines */}
    <path
      d="M35 47 Q30 50 25 55"
      stroke="currentColor"
      strokeWidth="1.5"
      fill="none"
      opacity="0.6"
    />
    <path
      d="M45 47 Q50 50 55 55"
      stroke="currentColor"
      strokeWidth="1.5"
      fill="none"
      opacity="0.6"
    />
    <path
      d="M40 47 L40 62"
      stroke="currentColor"
      strokeWidth="1.5"
      opacity="0.6"
    />
  </svg>
);

export const GeneralInternalSpecificIcon = () => (
  <svg viewBox="0 0 80 80" className="w-full h-full">
    {/* Stethoscope */}
    <circle
      cx="35"
      cy="25"
      r="8"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
    />
    <circle
      cx="45"
      cy="25"
      r="8"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
    />

    {/* Stethoscope tubes */}
    <path
      d="M35 33 Q30 40 25 50 Q20 60 30 65"
      stroke="currentColor"
      strokeWidth="3"
      fill="none"
    />
    <path
      d="M45 33 Q50 40 55 50 Q60 60 50 65"
      stroke="currentColor"
      strokeWidth="3"
      fill="none"
    />

    {/* Chest piece */}
    <circle cx="40" cy="65" r="8" fill="currentColor" opacity="0.8" />
    <circle cx="40" cy="65" r="4" fill="currentColor" />

    {/* Earpieces */}
    <circle cx="30" cy="20" r="3" fill="currentColor" />
    <circle cx="50" cy="20" r="3" fill="currentColor" />
  </svg>
);

export const PulmonaryCriticalSpecificIcon = () => (
  <svg viewBox="0 0 80 80" className="w-full h-full">
    {/* Lungs */}
    <path
      d="M25 25 Q15 30 15 45 Q15 60 25 65 Q35 60 35 45 Q35 30 25 25"
      fill="currentColor"
      opacity="0.6"
    />
    <path
      d="M55 25 Q45 30 45 45 Q45 60 55 65 Q65 60 65 45 Q65 30 55 25"
      fill="currentColor"
      opacity="0.6"
    />

    {/* Trachea */}
    <rect
      x="38"
      y="15"
      width="4"
      height="15"
      fill="currentColor"
      opacity="0.8"
    />

    {/* Bronchi */}
    <path
      d="M40 30 Q35 35 30 40"
      stroke="currentColor"
      strokeWidth="2"
      fill="none"
    />
    <path
      d="M40 30 Q45 35 50 40"
      stroke="currentColor"
      strokeWidth="2"
      fill="none"
    />

    {/* Ventilator tube */}
    <rect
      x="35"
      y="10"
      width="10"
      height="4"
      rx="2"
      fill="currentColor"
      opacity="0.9"
    />
    <rect
      x="42"
      y="6"
      width="8"
      height="4"
      rx="1"
      fill="currentColor"
      opacity="0.7"
    />
  </svg>
);

export const InfectiousSpecificIcon = () => (
  <svg viewBox="0 0 80 80" className="w-full h-full">
    {/* Virus/bacteria representation */}
    <circle cx="40" cy="40" r="12" fill="currentColor" opacity="0.6" />

    {/* Spikes around the virus */}
    <circle cx="30" cy="30" r="2" fill="currentColor" />
    <circle cx="50" cy="30" r="2" fill="currentColor" />
    <circle cx="30" cy="50" r="2" fill="currentColor" />
    <circle cx="50" cy="50" r="2" fill="currentColor" />
    <circle cx="25" cy="40" r="2" fill="currentColor" />
    <circle cx="55" cy="40" r="2" fill="currentColor" />
    <circle cx="40" cy="25" r="2" fill="currentColor" />
    <circle cx="40" cy="55" r="2" fill="currentColor" />

    {/* Connecting lines */}
    <line
      x1="28"
      y1="28"
      x2="52"
      y2="52"
      stroke="currentColor"
      strokeWidth="1"
      opacity="0.3"
    />
    <line
      x1="52"
      y1="28"
      x2="28"
      y2="52"
      stroke="currentColor"
      strokeWidth="1"
      opacity="0.3"
    />

    {/* Shield overlay */}
    <path
      d="M40 20 L50 25 L50 40 Q50 50 40 55 Q30 50 30 40 L30 25 Z"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      opacity="0.8"
    />
  </svg>
);

export const RheumatologySpecificIcon = () => (
  <svg viewBox="0 0 80 80" className="w-full h-full">
    {/* Joint representation */}
    <rect
      x="30"
      y="20"
      width="8"
      height="20"
      rx="4"
      fill="currentColor"
      opacity="0.7"
    />
    <rect
      x="42"
      y="20"
      width="8"
      height="20"
      rx="4"
      fill="currentColor"
      opacity="0.7"
    />

    {/* Joint space */}
    <ellipse cx="40" cy="35" rx="12" ry="6" fill="currentColor" opacity="0.4" />

    {/* Bone ends */}
    <ellipse cx="34" cy="25" rx="6" ry="4" fill="currentColor" opacity="0.8" />
    <ellipse cx="46" cy="25" rx="6" ry="4" fill="currentColor" opacity="0.8" />
    <ellipse cx="34" cy="45" rx="6" ry="4" fill="currentColor" opacity="0.8" />
    <ellipse cx="46" cy="45" rx="6" ry="4" fill="currentColor" opacity="0.8" />

    {/* Inflammation indicators */}
    <circle cx="25" cy="35" r="2" fill="currentColor" opacity="0.6" />
    <circle cx="55" cy="35" r="2" fill="currentColor" opacity="0.6" />
    <circle cx="40" cy="55" r="2" fill="currentColor" opacity="0.6" />
  </svg>
);

export const NephrologySpecificIcon = () => (
  <svg viewBox="0 0 80 80" className="w-full h-full">
    {/* Left Kidney - Bean shape */}
    <path
      d="M30 20 Q22 25 22 40 Q22 55 30 60 Q38 55 42 50 Q46 45 42 40 Q46 35 42 30 Q38 25 30 20"
      fill="currentColor"
      opacity="0.8"
    />

    {/* Right Kidney - Bean shape */}
    <path
      d="M50 20 Q58 25 58 40 Q58 55 50 60 Q42 55 38 50 Q34 45 38 40 Q34 35 38 30 Q42 25 50 20"
      fill="currentColor"
      opacity="0.8"
    />

    {/* Kidney indentations (hilum) */}
    <path
      d="M42 35 Q44 38 42 40 Q44 42 42 45"
      stroke="currentColor"
      strokeWidth="2"
      fill="none"
      opacity="0.9"
    />
    <path
      d="M38 35 Q36 38 38 40 Q36 42 38 45"
      stroke="currentColor"
      strokeWidth="2"
      fill="none"
      opacity="0.9"
    />

    {/* Nephron structures */}
    <circle cx="30" cy="35" r="2" fill="currentColor" opacity="0.6" />
    <circle cx="50" cy="35" r="2" fill="currentColor" opacity="0.6" />
    <circle cx="30" cy="45" r="1.5" fill="currentColor" opacity="0.6" />
    <circle cx="50" cy="45" r="1.5" fill="currentColor" opacity="0.6" />

    {/* Ureter tubes */}
    <path
      d="M40 60 L40 70"
      stroke="currentColor"
      strokeWidth="3"
      opacity="0.7"
    />
    <circle cx="40" cy="72" r="2" fill="currentColor" opacity="0.6" />
  </svg>
);

export const GastroenterologySpecificIcon = () => (
  <svg viewBox="0 0 80 80" className="w-full h-full">
    {/* Stomach/GI tract */}
    <path
      d="M25 20 Q35 15 45 20 Q55 25 55 35 Q55 45 50 55 Q45 65 35 65 Q25 65 20 55 Q15 45 15 35 Q15 25 25 20"
      fill="currentColor"
      opacity="0.6"
    />

    {/* Intestinal loops */}
    <path
      d="M50 40 Q60 45 65 55 Q65 65 55 70 Q45 65 50 55"
      fill="currentColor"
      opacity="0.5"
    />

    {/* Inner lining detail */}
    <path
      d="M25 25 Q35 30 35 40 Q35 50 30 60"
      stroke="currentColor"
      strokeWidth="2"
      fill="none"
      opacity="0.8"
    />

    {/* Digestive elements */}
    <circle cx="30" cy="35" r="2" fill="currentColor" opacity="0.7" />
    <circle cx="40" cy="45" r="1.5" fill="currentColor" opacity="0.7" />
    <circle cx="35" cy="55" r="1.5" fill="currentColor" opacity="0.7" />

    {/* Endoscope representation */}
    <path
      d="M10 15 Q20 20 30 25 Q35 28 40 30"
      stroke="currentColor"
      strokeWidth="2.5"
      fill="none"
      opacity="0.9"
    />
    <circle cx="8" cy="13" r="3" fill="currentColor" opacity="0.8" />
  </svg>
);
