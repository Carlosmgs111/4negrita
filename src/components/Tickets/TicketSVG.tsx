export const TicketSVG = ({
  backgroundColor = "#ffffff",
  lineColor = "#333333",
  lineWidth = 2.5,
  width = 100,
  height = 68,
}) => {
  const padding = 4;
  const viewBoxWidth = 180 + padding * 2;
  const viewBoxHeight = 80 + padding * 2;

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d={`M ${8 + padding} ${0 + padding} 
                 L ${172 + padding} ${0 + padding} 
                 Q ${180 + padding} ${0 + padding} ${180 + padding} ${
          8 + padding
        }
                 L ${180 + padding} ${30 + padding}
                 A 8 8 0 0 0 ${180 + padding} ${46 + padding}
                 L ${180 + padding} ${72 + padding}
                 Q ${180 + padding} ${80 + padding} ${172 + padding} ${
          80 + padding
        }
                 L ${8 + padding} ${80 + padding}
                 Q ${0 + padding} ${80 + padding} ${0 + padding} ${72 + padding}
                 L ${0 + padding} ${46 + padding}
                 A 8 8 0 0 0 ${0 + padding} ${30 + padding}
                 L ${0 + padding} ${8 + padding}
                 Q ${0 + padding} ${0 + padding} ${8 + padding} ${
          0 + padding
        } Z`}
        fill={backgroundColor}
        stroke={lineColor}
        strokeWidth={lineWidth}
      />

      <g stroke={"#000"} strokeWidth={4 * 0.8} fill="none">
        <line
          x1={20 + padding}
          y1={10 + padding}
          x2={20 + padding}
          y2={14 + padding}
          strokeDasharray="2,4"
        />
        <line
          x1={20 + padding}
          y1={20 + padding}
          x2={20 + padding}
          y2={24 + padding}
          strokeDasharray="2,4"
        />
        <line
          x1={20 + padding}
          y1={55 + padding}
          x2={20 + padding}
          y2={59 + padding}
          strokeDasharray="2,4"
        />
        <line
          x1={20 + padding}
          y1={65 + padding}
          x2={20 + padding}
          y2={70 + padding}
          strokeDasharray="2,4"
        />

        <line
          x1={160 + padding}
          y1={10 + padding}
          x2={160 + padding}
          y2={14 + padding}
          strokeDasharray="2,4"
        />
        <line
          x1={160 + padding}
          y1={20 + padding}
          x2={160 + padding}
          y2={24 + padding}
          strokeDasharray="2,4"
        />
        <line
          x1={160 + padding}
          y1={55 + padding}
          x2={160 + padding}
          y2={59 + padding}
          strokeDasharray="2,4"
        />
        <line
          x1={160 + padding}
          y1={65 + padding}
          x2={160 + padding}
          y2={70 + padding}
          strokeDasharray="2,4"
        />
      </g>
    </svg>
  );
};
