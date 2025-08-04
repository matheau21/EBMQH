interface EBMLogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function EBMLogo({ className = "", size = "md" }: EBMLogoProps) {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-10 h-10", 
    lg: "w-16 h-16"
  };

  return (
    <svg 
      className={`${sizeClasses[size]} ${className}`}
      viewBox="0 0 100 100" 
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Blue square background */}
      <rect 
        x="5" 
        y="5" 
        width="90" 
        height="90" 
        rx="12" 
        ry="12" 
        fill="#2774AE"
        stroke="#1e5f8c"
        strokeWidth="2"
      />
      
      {/* Subtle gradient overlay */}
      <defs>
        <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#3d85c6" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#1e5f8c" stopOpacity="0.1" />
        </linearGradient>
      </defs>
      
      <rect 
        x="5" 
        y="5" 
        width="90" 
        height="90" 
        rx="12" 
        ry="12" 
        fill="url(#logoGradient)"
      />
      
      {/* EBM Text */}
      <text 
        x="50" 
        y="62" 
        textAnchor="middle" 
        fontSize="28" 
        fontWeight="900" 
        fontFamily="Inter, sans-serif"
        fill="#E6BC00"
        stroke="#B8940A"
        strokeWidth="0.5"
      >
        EBM
      </text>
      
      {/* Small highlight for depth */}
      <rect 
        x="8" 
        y="8" 
        width="20" 
        height="3" 
        rx="1.5" 
        fill="rgba(255, 255, 255, 0.2)"
      />
    </svg>
  );
}
