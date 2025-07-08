// components/ReactTooltip.tsx
import React, { useState, useRef, useEffect } from "react";

interface TooltipProps {
  content: string | React.ReactNode;
  position?: "top" | "bottom" | "left" | "right";
  delay?: number;
  children: React.ReactNode;
  className?: string;
  // Nuevo parámetro: permitir hover sobre el tooltip
  allowHover?: boolean;
  // Distancia desde el componente envuelto al tooltip (en píxeles)
  distance?: number;
  active?: boolean;
}

export const Tooltip: React.FC<TooltipProps> = ({
  content,
  position = "top",
  delay = 300,
  children,
  className = "",
  allowHover = false, // Por defecto deshabilitado para mantener comportamiento actual
  distance = 8, // Distancia por defecto de 8px (2 en Tailwind = 8px)
  active = true,
}) => {
  if (!active) return <>{children}</>;
  const [isVisible, setIsVisible] = useState(false);
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  // Usar 'text' si se proporciona para compatibilidad, sino usar 'content'
  const tooltipContent = content;

  const showTooltip = () => {
    if (timeoutId) clearTimeout(timeoutId);
    const id = setTimeout(() => setIsVisible(true), delay);
    setTimeoutId(id);
  };

  const hideTooltip = () => {
    if (timeoutId) clearTimeout(timeoutId);
    setIsVisible(false);
  };

  const handleContainerMouseEnter = () => {
    showTooltip();
  };

  const handleContainerMouseLeave = () => {
    if (!allowHover) {
      hideTooltip();
    } else {
      // Si allowHover está habilitado, agregamos un pequeño delay antes de ocultar
      // para dar tiempo al usuario de mover el cursor al tooltip
      if (timeoutId) clearTimeout(timeoutId);
      const id = setTimeout(() => {
        // Verificar si el cursor no está sobre el tooltip antes de ocultarlo
        if (tooltipRef.current && !tooltipRef.current.matches(":hover")) {
          setIsVisible(false);
        }
      }, 100);
      setTimeoutId(id);
    }
  };

  const handleTooltipMouseEnter = () => {
    if (allowHover && isVisible && timeoutId) {
      clearTimeout(timeoutId);
      setTimeoutId(null);
    }
  };

  const handleTooltipMouseLeave = () => {
    if (allowHover && isVisible) {
      hideTooltip();
    }
  };

  useEffect(() => {
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [timeoutId]);

  const getTooltipClasses = () => {
    const baseClasses = `
      absolute z-50 px-3 py-2 text-sm text-white bg-gray-900 rounded-md shadow-lg
      transition-opacity duration-300
      ${isVisible ? "opacity-100 z-50" : "opacity-0 z-[-1]"}
      ${typeof tooltipContent === "string" ? "whitespace-nowrap" : ""}
      ${allowHover ? "pointer-events-auto" : "pointer-events-none"}
    `;

    const positionClasses = {
      top: "bottom-full left-1/2 -translate-x-1/2",
      bottom: "top-full left-1/2 -translate-x-1/2",
      left: "right-full top-1/2 -translate-y-1/2",
      right: "left-full top-1/2 -translate-y-1/2",
    };

    return `${baseClasses} ${positionClasses[position]}`;
  };

  const getTooltipStyle = () => {
    const positionStyles = {
      top: { marginBottom: `${distance}px` },
      bottom: { marginTop: `${distance}px` },
      left: { marginRight: `${distance}px` },
      right: { marginLeft: `${distance}px` },
    };

    return positionStyles[position];
  };

  const getArrowClasses = () => {
    const baseClasses = "absolute w-0 h-0 border-4 border-transparent";

    const arrowClasses = {
      top: "top-full left-1/2 -translate-x-1/2 border-t-gray-900",
      bottom: "bottom-full left-1/2 -translate-x-1/2 border-b-gray-900",
      left: "left-full top-1/2 -translate-y-1/2 border-l-gray-900",
      right: "right-full top-1/2 -translate-y-1/2 border-r-gray-900",
    };

    return `${baseClasses} ${arrowClasses[position]}`;
  };

  return (
    <div
      ref={containerRef}
      className={`relative inline-block ${className}`}
      onMouseEnter={handleContainerMouseEnter}
      onMouseLeave={handleContainerMouseLeave}
    >
      {children}
      <div
        ref={tooltipRef}
        className={getTooltipClasses()}
        style={getTooltipStyle()}
        onMouseEnter={
          isVisible && allowHover ? handleTooltipMouseEnter : undefined
        }
        onMouseLeave={
          isVisible && allowHover ? handleTooltipMouseLeave : undefined
        }
      >
        {tooltipContent}
        <div className={getArrowClasses()}></div>
      </div>
    </div>
  );
};
