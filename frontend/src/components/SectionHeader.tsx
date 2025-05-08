
import React from "react";

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  centered?: boolean;
}

const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  subtitle,
  centered = true,
}) => {
  return (
    <div className={`max-w-3xl ${centered ? "mx-auto text-center" : ""} mb-12`}>
      <h2 className="text-3xl md:text-4xl font-bold text-mkdss-blue mb-4">{title}</h2>
      {subtitle && (
        <p className="text-lg text-gray-600 leading-relaxed">{subtitle}</p>
      )}
      {centered && (
        <div className="h-1 w-20 bg-mkdss-accent mx-auto mt-4"></div>
      )}
    </div>
  );
};

export default SectionHeader;
