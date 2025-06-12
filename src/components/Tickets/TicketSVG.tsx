export const TicketSVG = ({
  backgroundColor = "#ffffff",
  lineColor = "#333333",
  lineWidth = 2.5,
  width = 100,
  height = 120,
}) => {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 200 120"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Cuerpo principal del ticket con muescas semicirculares */}
      <path
        d="M 18 20 
                 L 182 20 
                 Q 190 20 190 28
                 L 190 50
                 A 8 8 0 0 0 190 66
                 L 190 92
                 Q 190 100 182 100
                 L 18 100
                 Q 10 100 10 92
                 L 10 66
                 A 8 8 0 0 0 10 50
                 L 10 28
                 Q 10 20 18 20 Z"
        fill={backgroundColor}
        stroke={lineColor}
        strokeWidth={lineWidth}
      />

      {/* Líneas perforadas en los lados */}
      <g stroke={"black"} strokeWidth={2 * 0.8} fill="none">
        {/* Lado izquierdo */}
        <line x1="30" y1="30" x2="30" y2="34" strokeDasharray="2,4" />
        <line x1="30" y1="40" x2="30" y2="44" strokeDasharray="2,4" />
        <line x1="30" y1="75" x2="30" y2="79" strokeDasharray="2,4" />
        <line x1="30" y1="85" x2="30" y2="90" strokeDasharray="2,4" />

        {/* Lado derecho */}
        <line x1="170" y1="30" x2="170" y2="34" strokeDasharray="2,4" />
        <line x1="170" y1="40" x2="170" y2="44" strokeDasharray="2,4" />
        <line x1="170" y1="75" x2="170" y2="79" strokeDasharray="2,4" />
        <line x1="170" y1="85" x2="170" y2="90" strokeDasharray="2,4" />
      </g>
    </svg>
  );
};
