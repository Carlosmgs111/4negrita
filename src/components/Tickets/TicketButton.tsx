import { TicketSVG } from "./TicketSVG";

export const TicketButton = ({
  children,
  className,
  disabled,
  onClick,
  backgroundColor = "#ffffff",
  lineColor = "#333333",
  lineWidth = 2.5,
}: {
  children: React.ReactNode;
  onClick: () => void;
  backgroundColor?: string;
  lineColor?: string;
  lineWidth?: number;
  className?: string;
  disabled?: boolean;
}) => {
  return (
    <button
      onClick={onClick}
      className={[
        "relative inline-block hover:scale-[1.05] transition-all duration-200 w-fit h-fit",
        disabled ? "opacity-50 cursor-not-allowed" : "",
        className
      ].join(" ")}
    >
      <TicketSVG
        backgroundColor={backgroundColor}
        lineColor={lineColor}
        lineWidth={lineWidth}
        width={125}
        height={58}
      />
      <span className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-transparent text-sm font-bold text-gray-800">
        {children}
      </span>
    </button>
  );
};
