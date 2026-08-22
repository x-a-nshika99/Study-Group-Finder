import React from "react";
import { Subject } from "@/types";

interface SubjectBadgeProps {
  subject: Subject;
  size?: "sm" | "md";
}

export const SubjectBadge: React.FC<SubjectBadgeProps> = ({ subject, size = "md" }) => {
  const sizeClasses = size === "sm" ? "px-2 py-0.5 text-xs" : "px-3 py-1 text-sm";

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full ${sizeClasses}`}
      style={{
        backgroundColor: `${subject.colorHex}1A`,
        color: subject.colorHex,
        border: `1px solid ${subject.colorHex}40`,
      }}
    >
      <span className="w-2 h-2 rounded-full mr-1.5" style={{ backgroundColor: subject.colorHex }} />
      {subject.name}
    </span>
  );
};
