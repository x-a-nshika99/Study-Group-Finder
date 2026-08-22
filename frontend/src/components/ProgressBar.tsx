import React from "react";

interface ProgressBarProps {
  value: number; // 0 to 100
  colorHex?: string;
  height?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ value, colorHex = "#3B82F6", height = "h-2" }) => {
  const percentage = Math.min(100, Math.max(0, value));

  return (
    <div className={`w-full bg-slate-800 rounded-full overflow-hidden ${height}`}>
      <div
        className="h-full transition-all duration-500 ease-out rounded-full"
        style={{
          width: `${percentage}%`,
          backgroundColor: colorHex,
        }}
      />
    </div>
  );
};
