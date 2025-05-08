
import React from "react";
import { LucideIcon } from "lucide-react";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  className?: string;
  link?: string;
  showReadMore?: boolean;
}

const FeatureCard: React.FC<FeatureCardProps> = ({
  icon: Icon,
  title,
  description,
  className = "",
  link = "/solutions",
  showReadMore = false,
}) => {
  return (
    <div
      className={`bg-white rounded-lg shadow-sm border border-gray-100 p-6 hover-card flex flex-col ${className}`}
    >
      <div className="w-12 h-12 rounded-full bg-mkdss-accent/10 flex items-center justify-center mb-5">
        <Icon className="w-6 h-6 text-mkdss-accent" />
      </div>
      <h3 className="text-xl font-semibold text-mkdss-blue mb-3">{title}</h3>
      <p className="text-gray-600 mb-4">{description}</p>
      {showReadMore && (
        <div className="mt-auto">
          <Link to={link} className="inline-flex items-center text-sm font-medium text-mkdss-accent hover:text-mkdss-accent/80 transition-colors">
            Read more
            <ArrowRight className="ml-1 h-3 w-3" />
          </Link>
        </div>
      )}
    </div>
  );
};

export default FeatureCard;
