import { useEffect, useState, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { TargetMarket } from "@/lib/types";
import { targetMarketsService } from "@/lib/api-service";
import { motion } from "framer-motion";

export function TargetMarketSection() {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  // Fetch target markets data
  const { data: markets, isLoading } = useQuery<TargetMarket[]>({
    queryKey: ["target-markets"],
    queryFn: async () => {
      return await targetMarketsService.getAll();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Intersection observer for animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, []);

  // Card variants for staggered animations
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const cardVariants = {
    hidden: {
      y: 50,
      opacity: 0,
      scale: 0.9
    },
    visible: {
      y: 0,
      opacity: 1,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15
      }
    },
    hover: {
      y: -10,
      scale: 1.03,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 10
      }
    }
  };

  return (
    <section
      ref={sectionRef}
      className="pt-8 pb-16 relative overflow-hidden"
      style={{
        background: 'linear-gradient(to bottom, #f1f5f9, #f8fafc)'
      }}
    >
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Large gradient circles */}
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute -top-40 left-1/4 w-96 h-96 rounded-full bg-gradient-to-br from-emerald-500/5 to-blue-500/5 blur-3xl"></div>
          <div className="absolute -bottom-40 right-1/4 w-96 h-96 rounded-full bg-gradient-to-br from-amber-500/5 to-red-500/5 blur-3xl"></div>
        </div>

        {/* Animated floating elements */}
        <div className="absolute top-1/3 right-1/5 w-16 h-16 rounded-full border border-emerald-200/30 animate-float-slow"></div>
        <div className="absolute bottom-1/4 left-1/5 w-12 h-12 rounded-full border border-amber-200/30 animate-float-medium"></div>

        {/* Subtle pattern overlay */}
        <div className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: 'radial-gradient(circle, #000 1px, transparent 1px)',
            backgroundSize: '30px 30px'
          }}>
        </div>
      </div>

      <div className="container mx-auto px-4">
        {/* Section header with animation */}
        <div className={`text-center max-w-3xl mx-auto mb-8 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          {/* Decorative line */}
          <div className="inline-block mb-2">
            <div className="w-12 h-1 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-full mx-auto"></div>
          </div>

          {/* Title with gradient */}
          <h2 className="text-2xl md:text-3xl font-bold mb-2 bg-gradient-to-r from-emerald-700 to-blue-700 inline-block text-transparent bg-clip-text">
            Target Markets
          </h2>

          <p className="text-sm text-gray-600 max-w-2xl mx-auto">
            Specialized digital security solutions for various sectors
          </p>
        </div>

        {/* Cards grid with staggered animation */}
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin h-8 w-8 border-4 border-emerald-500 border-t-transparent rounded-full"></div>
          </div>
        ) : (
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6"
            variants={containerVariants}
            initial="hidden"
            animate={isVisible ? "visible" : "hidden"}
          >
            {markets?.map((market, index) => (
              <motion.div
                key={market.id}
                className="h-64 relative rounded-xl overflow-hidden shadow-lg group"
                variants={cardVariants}
                whileHover="hover"
              >
                {/* Card background with image or gradient */}
                <div className="absolute inset-0 w-full h-full">
                  {market.image ? (
                    <img
                      src={market.image}
                      alt={market.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.onerror = null;
                        target.src = '/images/placeholder.jpg';
                      }}
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-emerald-500 to-blue-500"></div>
                  )}
                </div>

                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/25 to-transparent"></div>

                {/* Glass effect card at bottom */}
                <div className="absolute bottom-0 left-0 right-0 p-6 backdrop-blur-lg bg-black/20 border-t border-white/10 transform transition-transform duration-500 group-hover:translate-y-0">
                  {/* Card content */}
                  <div className="relative z-10">
                    {/* Icon indicator */}
                    <div className="w-10 h-10 rounded-full bg-white/15 backdrop-blur-md flex items-center justify-center mb-3 border border-white/30 shadow-[0_0_10px_rgba(255,255,255,0.2)]">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white drop-shadow-sm" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>

                    {/* Title */}
                    <h3 className="text-xl font-bold text-white drop-shadow-sm mb-2">{market.title}</h3>

                    {/* Description with reveal animation */}
                    <div className="overflow-hidden">
                      <p className="text-white text-sm drop-shadow-sm transform transition-all duration-500 max-h-0 group-hover:max-h-40">
                        {market.description}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Decorative elements */}
                <div className="absolute top-4 right-4 w-8 h-8 rounded-full border border-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="absolute top-6 right-6 w-4 h-4 rounded-full border border-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-700 delay-100"></div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </section>
  );
}
