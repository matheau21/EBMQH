import React from "react";

// Medical bed/hospital icons inspired by oliveviewim.org
export const CardiologyIcon = () => (
  <svg viewBox="0 0 80 60" className="w-full h-full">
    {/* Bed base */}
    <rect x="10" y="35" width="60" height="20" rx="3" fill="currentColor" opacity="0.8"/>
    {/* Bed legs */}
    <rect x="12" y="55" width="3" height="8" fill="currentColor"/>
    <rect x="18" y="55" width="3" height="8" fill="currentColor"/>
    <rect x="59" y="55" width="3" height="8" fill="currentColor"/>
    <rect x="65" y="55" width="3" height="8" fill="currentColor"/>
    {/* Patient with heart monitor */}
    <ellipse cx="40" cy="25" rx="8" ry="6" fill="currentColor" opacity="0.6"/>
    <rect x="35" y="28" width="10" height="12" rx="2" fill="currentColor" opacity="0.6"/>
    {/* Heart rate line */}
    <path d="M20 15 L25 15 L27 10 L29 20 L31 10 L33 15 L60 15" stroke="currentColor" strokeWidth="2" fill="none"/>
  </svg>
);

export const HemeOncIcon = () => (
  <svg viewBox="0 0 80 60" className="w-full h-full">
    {/* Bed base */}
    <rect x="10" y="35" width="60" height="20" rx="3" fill="currentColor" opacity="0.8"/>
    {/* Bed legs */}
    <rect x="12" y="55" width="3" height="8" fill="currentColor"/>
    <rect x="18" y="55" width="3" height="8" fill="currentColor"/>
    <rect x="59" y="55" width="3" height="8" fill="currentColor"/>
    <rect x="65" y="55" width="3" height="8" fill="currentColor"/>
    {/* Patient */}
    <ellipse cx="40" cy="25" rx="8" ry="6" fill="currentColor" opacity="0.6"/>
    <rect x="35" y="28" width="10" height="12" rx="2" fill="currentColor" opacity="0.6"/>
    {/* IV drip */}
    <rect x="55" y="10" width="2" height="25" fill="currentColor"/>
    <circle cx="56" cy="8" r="3" fill="currentColor" opacity="0.6"/>
    <path d="M56 15 L45 25" stroke="currentColor" strokeWidth="1.5"/>
  </svg>
);

export const EndocrinologyIcon = () => (
  <svg viewBox="0 0 80 60" className="w-full h-full">
    {/* Bed base */}
    <rect x="10" y="35" width="60" height="20" rx="3" fill="currentColor" opacity="0.8"/>
    {/* Bed legs */}
    <rect x="12" y="55" width="3" height="8" fill="currentColor"/>
    <rect x="18" y="55" width="3" height="8" fill="currentColor"/>
    <rect x="59" y="55" width="3" height="8" fill="currentColor"/>
    <rect x="65" y="55" width="3" height="8" fill="currentColor"/>
    {/* Patient */}
    <ellipse cx="40" cy="25" rx="8" ry="6" fill="currentColor" opacity="0.6"/>
    <rect x="35" y="28" width="10" height="12" rx="2" fill="currentColor" opacity="0.6"/>
    {/* Syringe/injection */}
    <rect x="20" y="15" width="8" height="2" fill="currentColor"/>
    <rect x="18" y="14" width="2" height="4" fill="currentColor"/>
    <circle cx="22" cy="16" r="1" fill="currentColor"/>
  </svg>
);

export const GeneralInternalIcon = () => (
  <svg viewBox="0 0 80 60" className="w-full h-full">
    {/* Bed base */}
    <rect x="10" y="35" width="60" height="20" rx="3" fill="currentColor" opacity="0.8"/>
    {/* Bed legs */}
    <rect x="12" y="55" width="3" height="8" fill="currentColor"/>
    <rect x="18" y="55" width="3" height="8" fill="currentColor"/>
    <rect x="59" y="55" width="3" height="8" fill="currentColor"/>
    <rect x="65" y="55" width="3" height="8" fill="currentColor"/>
    {/* Patient */}
    <ellipse cx="40" cy="25" rx="8" ry="6" fill="currentColor" opacity="0.6"/>
    <rect x="35" y="28" width="10" height="12" rx="2" fill="currentColor" opacity="0.6"/>
    {/* Stethoscope */}
    <circle cx="30" cy="18" r="3" fill="none" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M30 21 Q25 25 25 30" stroke="currentColor" strokeWidth="1.5" fill="none"/>
  </svg>
);

export const PulmonaryCriticalIcon = () => (
  <svg viewBox="0 0 80 60" className="w-full h-full">
    {/* Bed base */}
    <rect x="10" y="35" width="60" height="20" rx="3" fill="currentColor" opacity="0.8"/>
    {/* Bed legs */}
    <rect x="12" y="55" width="3" height="8" fill="currentColor"/>
    <rect x="18" y="55" width="3" height="8" fill="currentColor"/>
    <rect x="59" y="55" width="3" height="8" fill="currentColor"/>
    <rect x="65" y="55" width="3" height="8" fill="currentColor"/>
    {/* Patient */}
    <ellipse cx="40" cy="25" rx="8" ry="6" fill="currentColor" opacity="0.6"/>
    <rect x="35" y="28" width="10" height="12" rx="2" fill="currentColor" opacity="0.6"/>
    {/* Ventilator/breathing tube */}
    <rect x="55" y="12" width="12" height="8" rx="2" fill="currentColor" opacity="0.6"/>
    <path d="M55 20 Q50 22 48 25" stroke="currentColor" strokeWidth="2" fill="none"/>
  </svg>
);

export const InfectiousIcon = () => (
  <svg viewBox="0 0 80 60" className="w-full h-full">
    {/* Bed base */}
    <rect x="10" y="35" width="60" height="20" rx="3" fill="currentColor" opacity="0.8"/>
    {/* Bed legs */}
    <rect x="12" y="55" width="3" height="8" fill="currentColor"/>
    <rect x="18" y="55" width="3" height="8" fill="currentColor"/>
    <rect x="59" y="55" width="3" height="8" fill="currentColor"/>
    <rect x="65" y="55" width="3" height="8" fill="currentColor"/>
    {/* Patient */}
    <ellipse cx="40" cy="25" rx="8" ry="6" fill="currentColor" opacity="0.6"/>
    <rect x="35" y="28" width="10" height="12" rx="2" fill="currentColor" opacity="0.6"/>
    {/* Protective barrier/isolation */}
    <rect x="25" y="10" width="30" height="35" rx="3" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.5"/>
    <rect x="27" y="12" width="26" height="2" fill="currentColor" opacity="0.3"/>
  </svg>
);

export const RheumatologyIcon = () => (
  <svg viewBox="0 0 80 60" className="w-full h-full">
    {/* Bed base */}
    <rect x="10" y="35" width="60" height="20" rx="3" fill="currentColor" opacity="0.8"/>
    {/* Bed legs */}
    <rect x="12" y="55" width="3" height="8" fill="currentColor"/>
    <rect x="18" y="55" width="3" height="8" fill="currentColor"/>
    <rect x="59" y="55" width="3" height="8" fill="currentColor"/>
    <rect x="65" y="55" width="3" height="8" fill="currentColor"/>
    {/* Patient */}
    <ellipse cx="40" cy="25" rx="8" ry="6" fill="currentColor" opacity="0.6"/>
    <rect x="35" y="28" width="10" height="12" rx="2" fill="currentColor" opacity="0.6"/>
    {/* Joint/bone outline */}
    <circle cx="32" cy="32" r="3" fill="none" stroke="currentColor" strokeWidth="1.5"/>
    <circle cx="48" cy="32" r="3" fill="none" stroke="currentColor" strokeWidth="1.5"/>
  </svg>
);

export const NephrologyIcon = () => (
  <svg viewBox="0 0 80 60" className="w-full h-full">
    {/* Bed base */}
    <rect x="10" y="35" width="60" height="20" rx="3" fill="currentColor" opacity="0.8"/>
    {/* Bed legs */}
    <rect x="12" y="55" width="3" height="8" fill="currentColor"/>
    <rect x="18" y="55" width="3" height="8" fill="currentColor"/>
    <rect x="59" y="55" width="3" height="8" fill="currentColor"/>
    <rect x="65" y="55" width="3" height="8" fill="currentColor"/>
    {/* Patient */}
    <ellipse cx="40" cy="25" rx="8" ry="6" fill="currentColor" opacity="0.6"/>
    <rect x="35" y="28" width="10" height="12" rx="2" fill="currentColor" opacity="0.6"/>
    {/* Dialysis machine */}
    <rect x="55" y="10" width="12" height="15" rx="2" fill="currentColor" opacity="0.6"/>
    <circle cx="61" cy="13" r="1" fill="currentColor"/>
    <path d="M55 20 L45 30" stroke="currentColor" strokeWidth="1.5"/>
  </svg>
);

export const GastroenterologyIcon = () => (
  <svg viewBox="0 0 80 60" className="w-full h-full">
    {/* Bed base */}
    <rect x="10" y="35" width="60" height="20" rx="3" fill="currentColor" opacity="0.8"/>
    {/* Bed legs */}
    <rect x="12" y="55" width="3" height="8" fill="currentColor"/>
    <rect x="18" y="55" width="3" height="8" fill="currentColor"/>
    <rect x="59" y="55" width="3" height="8" fill="currentColor"/>
    <rect x="65" y="55" width="3" height="8" fill="currentColor"/>
    {/* Patient */}
    <ellipse cx="40" cy="25" rx="8" ry="6" fill="currentColor" opacity="0.6"/>
    <rect x="35" y="28" width="10" height="12" rx="2" fill="currentColor" opacity="0.6"/>
    {/* Endoscope */}
    <path d="M20 15 Q25 20 35 25 Q40 27 45 25" stroke="currentColor" strokeWidth="2" fill="none"/>
    <circle cx="18" cy="14" r="2" fill="currentColor"/>
  </svg>
);
