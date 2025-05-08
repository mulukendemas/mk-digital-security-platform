
import React, { useEffect, useRef } from "react";

interface AnimatedSectionProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}

const AnimatedSection: React.FC<AnimatedSectionProps> = ({
  children,
  className = "",
  delay = 0,
}) => {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;

    if (!section) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setTimeout(() => {
              section.classList.add("visible");
            }, delay);
            observer.unobserve(section);
          }
        });
      },
      {
        threshold: 0.1,
      }
    );

    observer.observe(section);

    return () => {
      if (section) {
        observer.unobserve(section);
      }
    };
  }, [delay]);

  return (
    <div
      ref={sectionRef}
      className={`animate-on-scroll ${className}`}
    >
      {children}
    </div>
  );
};

export default AnimatedSection;
