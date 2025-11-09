// Custom Map Marker Icons for Hazard Types
// Shapes represent source, colors represent severity
import React from 'react';

interface MapMarkerProps {
  className?: string;
}

// Color palette based on severity
const SEVERITY_COLORS = {
  high: {
    fill: '#DC2626',      // Red
    stroke: '#991B1B',
    shadow: '#DC2626'
  },
  medium: {
    fill: '#F59E0B',      // Amber/Orange
    stroke: '#D97706',
    shadow: '#F59E0B'
  },
  low: {
    fill: '#EAB308',      // Yellow
    stroke: '#CA8A04',
    shadow: '#EAB308'
  },
  resolving: {
    fill: '#94A3B8',      // Grey
    stroke: '#64748B',
    shadow: '#94A3B8'
  }
};

// ==================== SQUARE MARKERS (V2X Source) ====================

export function V2XMarkerHigh({ className = "w-8 h-8" }: MapMarkerProps) {
  return (
    <svg 
      viewBox="0 0 40 40" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Pulse effect */}
      <rect
        x="6"
        y="6"
        width="28"
        height="28"
        fill="none"
        stroke={SEVERITY_COLORS.high.shadow}
        strokeWidth="1"
        opacity="0.5"
      >
        <animate
          attributeName="width"
          from="28"
          to="36"
          dur="1.5s"
          repeatCount="indefinite"
        />
        <animate
          attributeName="height"
          from="28"
          to="36"
          dur="1.5s"
          repeatCount="indefinite"
        />
        <animate
          attributeName="x"
          from="6"
          to="2"
          dur="1.5s"
          repeatCount="indefinite"
        />
        <animate
          attributeName="y"
          from="6"
          to="2"
          dur="1.5s"
          repeatCount="indefinite"
        />
        <animate
          attributeName="opacity"
          from="0.5"
          to="0"
          dur="1.5s"
          repeatCount="indefinite"
        />
      </rect>
      {/* Square shape */}
      <rect
        x="8"
        y="8"
        width="24"
        height="24"
        fill={SEVERITY_COLORS.high.fill}
        stroke={SEVERITY_COLORS.high.stroke}
        strokeWidth="2"
        rx="2"
      />
      {/* Warning icon */}
      <path
        d="M20 14V22M20 25V26"
        stroke="white"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function V2XMarkerMedium({ className = "w-8 h-8" }: MapMarkerProps) {
  return (
    <svg 
      viewBox="0 0 40 40" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <rect
        x="8"
        y="8"
        width="24"
        height="24"
        fill={SEVERITY_COLORS.medium.fill}
        stroke={SEVERITY_COLORS.medium.stroke}
        strokeWidth="2"
        rx="2"
      />
      <path
        d="M20 14V22M20 25V26"
        stroke="white"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function V2XMarkerLow({ className = "w-8 h-8" }: MapMarkerProps) {
  return (
    <svg 
      viewBox="0 0 40 40" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <rect
        x="8"
        y="8"
        width="24"
        height="24"
        fill={SEVERITY_COLORS.low.fill}
        stroke={SEVERITY_COLORS.low.stroke}
        strokeWidth="2"
        rx="2"
      />
      <path
        d="M20 14V22M20 25V26"
        stroke="white"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

// ==================== CIRCLE MARKERS (Your Car Source) ====================

export function YourCarMarkerHigh({ className = "w-8 h-8" }: MapMarkerProps) {
  return (
    <svg 
      viewBox="0 0 40 40" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Pulse effect */}
      <circle
        cx="20"
        cy="20"
        r="14"
        stroke={SEVERITY_COLORS.high.shadow}
        strokeWidth="1"
        fill="none"
        opacity="0.5"
      >
        <animate
          attributeName="r"
          from="14"
          to="20"
          dur="1.5s"
          repeatCount="indefinite"
        />
        <animate
          attributeName="opacity"
          from="0.5"
          to="0"
          dur="1.5s"
          repeatCount="indefinite"
        />
      </circle>
      {/* Circle shape */}
      <circle
        cx="20"
        cy="20"
        r="12"
        fill={SEVERITY_COLORS.high.fill}
        stroke={SEVERITY_COLORS.high.stroke}
        strokeWidth="2"
      />
      {/* Warning icon */}
      <path
        d="M20 14V22M20 25V26"
        stroke="white"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function YourCarMarkerMedium({ className = "w-8 h-8" }: MapMarkerProps) {
  return (
    <svg 
      viewBox="0 0 40 40" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <circle
        cx="20"
        cy="20"
        r="12"
        fill={SEVERITY_COLORS.medium.fill}
        stroke={SEVERITY_COLORS.medium.stroke}
        strokeWidth="2"
      />
      <path
        d="M20 14V22M20 25V26"
        stroke="white"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function YourCarMarkerLow({ className = "w-8 h-8" }: MapMarkerProps) {
  return (
    <svg 
      viewBox="0 0 40 40" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <circle
        cx="20"
        cy="20"
        r="12"
        fill={SEVERITY_COLORS.low.fill}
        stroke={SEVERITY_COLORS.low.stroke}
        strokeWidth="2"
      />
      <path
        d="M20 14V22M20 25V26"
        stroke="white"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

// ==================== TRIANGLE MARKERS (Network Source) ====================

export function NetworkMarkerHigh({ className = "w-8 h-8" }: MapMarkerProps) {
  return (
    <svg 
      viewBox="0 0 40 40" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Pulse effect */}
      <path
        d="M20 6L32 30H8L20 6Z"
        stroke={SEVERITY_COLORS.high.shadow}
        strokeWidth="1"
        fill="none"
        opacity="0.5"
      >
        <animate
          attributeName="opacity"
          from="0.5"
          to="0"
          dur="1.5s"
          repeatCount="indefinite"
        />
      </path>
      {/* Triangle shape */}
      <path
        d="M20 8L31 30H9L20 8Z"
        fill={SEVERITY_COLORS.high.fill}
        stroke={SEVERITY_COLORS.high.stroke}
        strokeWidth="2"
        strokeLinejoin="round"
      />
      {/* Warning icon */}
      <path
        d="M20 16V22M20 25V26"
        stroke="white"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function NetworkMarkerMedium({ className = "w-8 h-8" }: MapMarkerProps) {
  return (
    <svg 
      viewBox="0 0 40 40" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M20 8L31 30H9L20 8Z"
        fill={SEVERITY_COLORS.medium.fill}
        stroke={SEVERITY_COLORS.medium.stroke}
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M20 16V22M20 25V26"
        stroke="white"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function NetworkMarkerLow({ className = "w-8 h-8" }: MapMarkerProps) {
  return (
    <svg 
      viewBox="0 0 40 40" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M20 8L31 30H9L20 8Z"
        fill={SEVERITY_COLORS.low.fill}
        stroke={SEVERITY_COLORS.low.stroke}
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M20 16V22M20 25V26"
        stroke="white"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

// ==================== RESOLVING MARKERS (Faded versions) ====================

export function ResolvingV2XMarker({ className = "w-8 h-8" }: MapMarkerProps) {
  return (
    <svg 
      viewBox="0 0 40 40" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <rect
        x="8"
        y="8"
        width="24"
        height="24"
        fill={SEVERITY_COLORS.resolving.fill}
        stroke={SEVERITY_COLORS.resolving.stroke}
        strokeWidth="2"
        rx="2"
        opacity="0.6"
      />
      <path
        d="M20 14V22M20 25V26"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.6"
      />
    </svg>
  );
}

export function ResolvingYourCarMarker({ className = "w-8 h-8" }: MapMarkerProps) {
  return (
    <svg 
      viewBox="0 0 40 40" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <circle
        cx="20"
        cy="20"
        r="12"
        fill={SEVERITY_COLORS.resolving.fill}
        stroke={SEVERITY_COLORS.resolving.stroke}
        strokeWidth="2"
        opacity="0.6"
      />
      <path
        d="M20 14V22M20 25V26"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.6"
      />
    </svg>
  );
}

export function ResolvingNetworkMarker({ className = "w-8 h-8" }: MapMarkerProps) {
  return (
    <svg 
      viewBox="0 0 40 40" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M20 8L31 30H9L20 8Z"
        fill={SEVERITY_COLORS.resolving.fill}
        stroke={SEVERITY_COLORS.resolving.stroke}
        strokeWidth="2"
        strokeLinejoin="round"
        opacity="0.6"
      />
      <path
        d="M20 16V22M20 25V26"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.6"
      />
    </svg>
  );
}

// ==================== LEGACY EXPORTS (for backwards compatibility) ====================

export function CriticalHazardMarker({ className = "w-10 h-10" }: MapMarkerProps) {
  return <YourCarMarkerHigh className={className} />;
}

export function HighHazardMarker({ className = "w-8 h-8" }: MapMarkerProps) {
  return <YourCarMarkerMedium className={className} />;
}

export function MediumHazardMarker({ className = "w-7 h-7" }: MapMarkerProps) {
  return <YourCarMarkerLow className={className} />;
}

export function V2XMarker({ className = "w-9 h-9" }: MapMarkerProps) {
  return <V2XMarkerHigh className={className} />;
}

// ==================== VEHICLE MARKER ====================

export function VehicleMarker({ className = "w-10 h-10" }: MapMarkerProps) {
  return (
    <svg 
      viewBox="0 0 40 40" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Outer glow ring */}
      <circle
        cx="20"
        cy="20"
        r="18"
        fill="#0070E1"
        opacity="0.2"
      />
      {/* Main circle */}
      <circle
        cx="20"
        cy="20"
        r="12"
        fill="#0070E1"
        stroke="white"
        strokeWidth="3"
      />
      {/* Direction arrow */}
      <path
        d="M20 14L24 20L20 18L16 20L20 14Z"
        fill="white"
      />
      {/* Pulse animation */}
      <circle
        cx="20"
        cy="20"
        r="12"
        stroke="#0070E1"
        strokeWidth="2"
        fill="none"
        opacity="0.6"
      >
        <animate
          attributeName="r"
          from="12"
          to="20"
          dur="2s"
          repeatCount="indefinite"
        />
        <animate
          attributeName="opacity"
          from="0.6"
          to="0"
          dur="2s"
          repeatCount="indefinite"
        />
      </circle>
    </svg>
  );
}

// ==================== MARKER SELECTION HELPER ====================

export function getMarkerIcon(
  severity: string,
  source: string,
  status?: string
): React.ComponentType<MapMarkerProps> {
  // Handle resolving status
  if (status === 'resolving') {
    switch (source) {
      case 'v2x':
        return ResolvingV2XMarker;
      case 'your-car':
        return ResolvingYourCarMarker;
      case 'network':
        return ResolvingNetworkMarker;
      default:
        return ResolvingNetworkMarker;
    }
  }

  // V2X hazards (Square)
  if (source === 'v2x') {
    switch (severity) {
      case 'high':
        return V2XMarkerHigh;
      case 'medium':
        return V2XMarkerMedium;
      case 'low':
        return V2XMarkerLow;
      default:
        return V2XMarkerMedium;
    }
  }

  // Your Car hazards (Circle)
  if (source === 'your-car') {
    switch (severity) {
      case 'high':
        return YourCarMarkerHigh;
      case 'medium':
        return YourCarMarkerMedium;
      case 'low':
        return YourCarMarkerLow;
      default:
        return YourCarMarkerMedium;
    }
  }

  // Network hazards (Triangle) - default for any other source
  switch (severity) {
    case 'high':
      return NetworkMarkerHigh;
    case 'medium':
      return NetworkMarkerMedium;
    case 'low':
      return NetworkMarkerLow;
    default:
      return NetworkMarkerMedium;
  }
}
