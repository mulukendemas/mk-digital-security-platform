
import {
  CheckCircle, Award, Clock, User, Globe, Shield, Zap, Key, CreditCard,
  Lock, Server, Database, Fingerprint, Cpu, Network, BadgeCheck,
  HeartHandshake, Headphones, BarChart, Layers, Briefcase, Lightbulb, Target
} from "lucide-react";

import { useQuery } from "@tanstack/react-query";
import apiClient from '@/lib/api-adapter';
import { WhyChooseUs as WhyChooseUsType } from "@/lib/types";
import { LucideIcon } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";

// We're using dynamic icon selection based on title keywords

// Card background colors
const cardColors = [
  {
    bg: "from-blue-500 to-purple-500",
    overlay: "from-blue-900/80 to-purple-900/80",
    accent: "border-blue-300"
  },
  {
    bg: "from-purple-500 to-pink-500",
    overlay: "from-purple-900/80 to-pink-900/80",
    accent: "border-purple-300"
  },
  {
    bg: "from-cyan-500 to-blue-500",
    overlay: "from-cyan-900/80 to-blue-900/80",
    accent: "border-cyan-300"
  },
  {
    bg: "from-amber-500 to-orange-500",
    overlay: "from-amber-900/80 to-orange-900/80",
    accent: "border-amber-300"
  },
  {
    bg: "from-emerald-500 to-green-500",
    overlay: "from-emerald-900/80 to-green-900/80",
    accent: "border-emerald-300"
  },
  {
    bg: "from-rose-500 to-red-500",
    overlay: "from-rose-900/80 to-red-900/80",
    accent: "border-rose-300"
  }
];

export function WhyChooseUs() {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  // Fetch data
  const { data: advantages, isLoading, isError, error } = useQuery<WhyChooseUsType[]>({
    queryKey: ["why-choose-us"],
    queryFn: async () => {
      try {
        const response = await apiClient.get("/why-choose-us/");
        return response.data;
      } catch (error) {
        console.error("Error fetching Why Choose Us data:", error);
        throw error;
      }
    }
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

  // Animation variants
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

  if (isError) {
    console.error("Failed to load Why Choose Us section:", error);
  }

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
          <div className="absolute -top-40 right-1/4 w-96 h-96 rounded-full bg-gradient-to-br from-blue-500/5 to-purple-500/5 blur-3xl"></div>
          <div className="absolute -bottom-40 left-1/4 w-96 h-96 rounded-full bg-gradient-to-br from-purple-500/5 to-pink-500/5 blur-3xl"></div>
        </div>

        {/* Animated floating elements */}
        <div className="absolute top-1/3 left-1/5 w-16 h-16 rounded-full border border-blue-200/30 animate-float-slow"></div>
        <div className="absolute bottom-1/4 right-1/5 w-12 h-12 rounded-full border border-purple-200/30 animate-float-medium"></div>

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
            <div className="w-12 h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mx-auto"></div>
          </div>

          {/* Title with gradient */}
          <h2 className="text-2xl md:text-3xl font-bold mb-2 bg-gradient-to-r from-blue-700 to-purple-700 inline-block text-transparent bg-clip-text">
            Why Choose MK Digital Security Solutions
          </h2>

          <p className="text-sm text-gray-600 max-w-2xl mx-auto">
            We provide comprehensive security solutions tailored to your specific needs
          </p>
        </div>

        {/* Cards grid with staggered animation */}
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
          </div>
        ) : (
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6"
            variants={containerVariants}
            initial="hidden"
            animate={isVisible ? "visible" : "hidden"}
          >
            {advantages?.map((item: WhyChooseUsType, index: number) => {
              // Choose appropriate icon based on the title
              let IconComponent: LucideIcon;

              if (item.title.toLowerCase().includes('expert')) {
                IconComponent = Award;
              } else if (item.title.toLowerCase().includes('security') || item.title.toLowerCase().includes('secure')) {
                IconComponent = Shield;
              } else if (item.title.toLowerCase().includes('support') || item.title.toLowerCase().includes('service')) {
                IconComponent = HeartHandshake;
              } else if (item.title.toLowerCase().includes('innovation') || item.title.toLowerCase().includes('innovative')) {
                IconComponent = Lightbulb;
              } else if (item.title.toLowerCase().includes('experience')) {
                IconComponent = BadgeCheck;
              } else if (item.title.toLowerCase().includes('solution')) {
                IconComponent = Layers;
              } else if (item.title.toLowerCase().includes('technology') || item.title.toLowerCase().includes('technical')) {
                IconComponent = Cpu;
              } else if (item.title.toLowerCase().includes('global') || item.title.toLowerCase().includes('worldwide')) {
                IconComponent = Globe;
              } else if (item.title.toLowerCase().includes('data')) {
                IconComponent = Database;
              } else if (item.title.toLowerCase().includes('authentication') || item.title.toLowerCase().includes('identity')) {
                IconComponent = Fingerprint;
              } else if (item.title.toLowerCase().includes('network')) {
                IconComponent = Network;
              } else if (item.title.toLowerCase().includes('performance')) {
                IconComponent = BarChart;
              } else if (item.title.toLowerCase().includes('business')) {
                IconComponent = Briefcase;
              } else if (item.title.toLowerCase().includes('key') || item.title.toLowerCase().includes('access')) {
                IconComponent = Key;
              } else if (item.title.toLowerCase().includes('payment') || item.title.toLowerCase().includes('financial')) {
                IconComponent = CreditCard;
              } else if (item.title.toLowerCase().includes('time') || item.title.toLowerCase().includes('fast')) {
                IconComponent = Clock;
              } else if (item.title.toLowerCase().includes('customer') || item.title.toLowerCase().includes('client')) {
                IconComponent = User;
              } else if (item.title.toLowerCase().includes('target') || item.title.toLowerCase().includes('goal')) {
                IconComponent = Target;
              } else if (item.title.toLowerCase().includes('server') || item.title.toLowerCase().includes('hosting')) {
                IconComponent = Server;
              } else if (item.title.toLowerCase().includes('encryption') || item.title.toLowerCase().includes('privacy')) {
                IconComponent = Lock;
              } else if (item.title.toLowerCase().includes('power') || item.title.toLowerCase().includes('speed')) {
                IconComponent = Zap;
              } else if (item.title.toLowerCase().includes('support') || item.title.toLowerCase().includes('help')) {
                IconComponent = Headphones;
              } else {
                // Default icon if no match is found
                IconComponent = CheckCircle;
              }
              const colorScheme = cardColors[index % cardColors.length];

              return (
                <motion.div
                  key={item.id}
                  className="h-64 relative rounded-xl overflow-hidden shadow-lg group"
                  variants={cardVariants}
                  whileHover="hover"
                >
                  {/* Card background with gradient */}
                  <div className="absolute inset-0 w-full h-full">
                    <div className={`w-full h-full bg-gradient-to-br ${colorScheme.bg}`}></div>
                  </div>

                  {/* Gradient overlay */}
                  <div className={`absolute inset-0 bg-gradient-to-t ${colorScheme.overlay}`}></div>

                  {/* Decorative elements */}
                  <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                    <div className="absolute top-4 right-4 w-32 h-32 rounded-full bg-white/5 backdrop-blur-sm opacity-70 animate-pulse"></div>
                    <div className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full bg-white/5 backdrop-blur-sm"></div>

                    {/* Additional decorative elements */}
                    <div className="absolute top-1/3 right-1/4 w-6 h-6 rounded-full bg-white/5 backdrop-blur-sm opacity-70"></div>
                    <div className="absolute bottom-1/4 left-1/3 w-4 h-4 rounded-full bg-white/5 backdrop-blur-sm opacity-70"></div>

                    {/* Subtle pattern */}
                    <div className="absolute inset-0 opacity-[0.03]"
                      style={{
                        backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)',
                        backgroundSize: '20px 20px'
                      }}>
                    </div>
                  </div>

                  {/* Glass effect card content */}
                  <div className="absolute inset-0 p-5 flex flex-col">
                    {/* Icon */}
                    <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center mb-3 border border-white/20 transform transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3">
                      <IconComponent className="w-6 h-6 text-white" />
                    </div>

                    {/* Content */}
                    <div className="flex flex-col justify-between h-full">
                      {/* Top content */}
                      <div>
                        {/* Title */}
                        <h3 className="text-xl font-bold text-white mb-2 transform transition-all duration-500 group-hover:-translate-y-1">{item.title}</h3>

                        {/* Feature bullets - always visible */}
                        <div className="mt-3 space-y-2">
                          {/* Generate 3 feature points based on the title */}
                          {[1, 2, 3].map((num) => (
                            <div key={num} className="flex items-center space-x-2">
                              <div className={`w-1.5 h-1.5 rounded-full ${colorScheme.accent}`}></div>
                              <p className="text-xs text-white/80">
                                {num === 1 ? `Advanced ${item.title.split(' ')[0]} technology` :
                                 num === 2 ? `Reliable and secure solutions` :
                                 `24/7 expert support`}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Bottom content */}
                      <div>
                        {/* Description with reveal animation */}
                        <div className="overflow-hidden mt-3">
                          <p className="text-sm text-white/80 transform transition-all duration-500 max-h-0 group-hover:max-h-32">
                            {item.description}
                          </p>
                        </div>

                        {/* Animated line */}
                        <div className="w-0 h-0.5 bg-white/30 mt-4 group-hover:w-full transition-all duration-700"></div>
                      </div>
                    </div>
                  </div>

                  {/* Decorative corner elements */}
                  <div className={`absolute top-4 left-4 w-8 h-8 border-t-2 border-l-2 ${colorScheme.accent} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
                  <div className={`absolute bottom-4 right-4 w-8 h-8 border-b-2 border-r-2 ${colorScheme.accent} opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100`}></div>
                </motion.div>
              );
            })}
          </motion.div>
        )}


      </div>
    </section>
  );
}


