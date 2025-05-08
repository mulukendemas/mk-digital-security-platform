import { useCallback, useEffect, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { solutionsService } from '@/lib/api-service';
import { motion } from 'framer-motion';

interface Solution {
  id: number | string;
  title: string;
  description: string;
  image: string;
}

export function SolutionsSlideshow() {
  const [solutions, setSolutions] = useState<Solution[]>([]);
  const [loading, setLoading] = useState(true);
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: 'center' });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);

  // Fetch solutions data
  useEffect(() => {
    const fetchSolutions = async () => {
      try {
        setLoading(true);
        const data = await solutionsService.getAll();

        // Filter out solutions without images
        const solutionsWithImages = data.filter((solution: any) => solution.image);

        // Map to the format we need
        const formattedSolutions = solutionsWithImages.map((solution: any) => ({
          id: solution.id,
          title: solution.title,
          description: solution.description.length > 100
            ? solution.description.substring(0, 100) + '...'
            : solution.description,
          image: solution.image.startsWith('http')
            ? solution.image
            : `${import.meta.env.VITE_API_URL}${solution.image}?quality=100&width=1920`
        }));

        setSolutions(formattedSolutions);
      } catch (error) {
        console.error('Error fetching solutions for slideshow:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSolutions();
  }, []);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());

    // Framer Motion handles animations automatically through the key prop
    // and animate prop changes when selectedIndex changes
  }, [emblaApi]);

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  const scrollTo = useCallback(
    (index: number) => {
      if (emblaApi) emblaApi.scrollTo(index);
    },
    [emblaApi]
  );

  useEffect(() => {
    if (!emblaApi) return;

    setScrollSnaps(emblaApi.scrollSnapList());
    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect);

    return () => {
      emblaApi.off('select', onSelect);
      emblaApi.off('reInit', onSelect);
    };
  }, [emblaApi, onSelect]);

  // Auto-play functionality
  useEffect(() => {
    if (!emblaApi) return;

    const interval = setInterval(() => {
      emblaApi.scrollNext();
    }, 5000); // Change slide every 5 seconds

    return () => clearInterval(interval);
  }, [emblaApi]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-80">
        <div className="animate-spin h-8 w-8 border-4 border-navy border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (solutions.length === 0) {
    return null;
  }

  return (
    <div className="relative">
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex">
          {solutions.map((solution) => (
            <div
              key={solution.id}
              className="flex-[0_0_100%] min-w-0 relative h-[400px] md:h-[500px]"
            >
              <div className="h-full w-full overflow-hidden group relative">
                {/* Multiple gradient overlays for a more sophisticated look */}
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/80 z-10"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-transparent to-black/30 z-10"></div>

                {/* Decorative elements with glow effects - more subtle */}
                <div className="absolute top-0 left-0 w-full h-full z-5 overflow-hidden pointer-events-none">
                  {/* Top right decorative circle with glow */}
                  <div className="absolute top-6 right-6 w-20 h-20 rounded-full bg-white/10 backdrop-blur-sm shadow-[0_0_15px_rgba(255,255,255,0.2)]"></div>

                  {/* Bottom left decorative circle with glow */}
                  <div className="absolute bottom-20 left-6 w-16 h-16 rounded-full bg-white/5 backdrop-blur-sm shadow-[0_0_10px_rgba(255,255,255,0.1)]"></div>

                  {/* Diagonal line decoration - more subtle */}
                  <div className="absolute top-0 left-0 w-full h-full">
                    <div className="absolute top-0 right-0 w-1/4 h-px bg-gradient-to-r from-transparent to-white/10"></div>
                    <div className="absolute bottom-0 left-0 w-1/4 h-px bg-gradient-to-r from-white/10 to-transparent"></div>
                  </div>
                </div>

                <div className="w-full h-full overflow-hidden">
                  <motion.img
                    key={`image-${solution.id}-${selectedIndex}`}
                    src={solution.image}
                    alt={solution.title}
                    className="w-full h-full object-cover object-center"
                    initial={{ scale: 1.1, opacity: 0 }}
                    animate={{
                      scale: [1.1, 1.0, 1.05],
                      opacity: 1,
                      filter: ["brightness(1)", "brightness(1.05)", "brightness(1)"]
                    }}
                    transition={{
                      duration: 20,
                      repeat: Infinity,
                      repeatType: "reverse",
                      ease: "easeInOut",
                      times: [0, 0.5, 1],
                      opacity: { duration: 0.5 }
                    }}
                    style={{
                      transformOrigin: 'center center',
                      objectPosition: 'center center'
                    }}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.onerror = null;
                      target.src = '/images/placeholder.jpg';
                    }}
                  />
                </div>

                <div className="absolute bottom-0 left-0 right-0 p-5 z-20 text-white">
                  {/* Container for content positioning */}
                  <div className="container mx-auto">
                    {/* Premium content container with glass effect */}
                    <motion.div
                      key={`content-${solution.id}-${selectedIndex}`}
                      className="bg-black/30 backdrop-blur-md p-4 rounded-xl border border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.1)] max-w-2xl mx-auto md:mx-0"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.7, delay: 0.2 }}
                    >
                      <div className="flex flex-col md:flex-row md:items-center">
                        <div className="flex-1">
                          {/* Title with text shadow for better readability */}
                          <div className="flex items-center">
                            {/* Decorative line */}
                            <motion.div
                              key={`line-${solution.id}-${selectedIndex}`}
                              className="w-0 h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mr-3 hidden md:block"
                              animate={{ width: "2rem" }}
                              transition={{ duration: 0.8, delay: 0.5 }}
                            ></motion.div>

                            <motion.h3
                              key={`title-${solution.id}-${selectedIndex}`}
                              className="text-xl md:text-2xl font-bold"
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ duration: 0.6, delay: 0.7 }}
                              style={{ textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}
                            >
                              {solution.title}
                            </motion.h3>
                          </div>

                          {/* Description with improved styling - only show on larger screens */}
                          <motion.p
                            key={`desc-${solution.id}-${selectedIndex}`}
                            className="text-white/90 text-sm mt-2 mb-3 md:mb-0 md:pr-4 line-clamp-2 md:line-clamp-1"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6, delay: 0.9 }}
                            style={{ lineHeight: '1.5', fontWeight: '300' }}
                          >
                            {solution.description}
                          </motion.p>
                        </div>

                        {/* Button with enhanced styling */}
                        <motion.div
                          key={`button-${solution.id}-${selectedIndex}`}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.6, delay: 1.1 }}
                          className="md:ml-4 flex-shrink-0"
                        >
                          <Link to={`/solution/${solution.id}`}>
                            <Button
                              variant="outline"
                              size="sm"
                              className="bg-gradient-to-r from-blue-500/80 to-purple-500/80 hover:from-blue-500 hover:to-purple-500 backdrop-blur-sm border-white/20 text-white transition-all duration-300 hover:scale-105 shadow-lg w-full md:w-auto"
                            >
                              Learn More
                            </Button>
                          </Link>
                        </motion.div>
                      </div>
                    </motion.div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation buttons with glass effect */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.5 }}
        whileHover={{ scale: 1.1 }}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-10"
      >
        <Button
          variant="outline"
          size="icon"
          className="bg-black/30 hover:bg-black/50 backdrop-blur-md border-white/20 shadow-[0_4px_20px_rgba(0,0,0,0.2)] w-10 h-10 rounded-full hover:shadow-[0_4px_25px_rgba(0,0,0,0.3)]"
          onClick={scrollPrev}
        >
          <ArrowLeft className="h-4 w-4 text-white" />
        </Button>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.5 }}
        whileHover={{ scale: 1.1 }}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-10"
      >
        <Button
          variant="outline"
          size="icon"
          className="bg-black/30 hover:bg-black/50 backdrop-blur-md border-white/20 shadow-[0_4px_20px_rgba(0,0,0,0.2)] w-10 h-10 rounded-full hover:shadow-[0_4px_25px_rgba(0,0,0,0.3)]"
          onClick={scrollNext}
        >
          <ArrowRight className="h-4 w-4 text-white" />
        </Button>
      </motion.div>

      {/* Premium dots indicator with glass effect container */}
      <div className="flex justify-center mt-4 mb-2">
        <motion.div
          className="bg-black/20 backdrop-blur-md px-4 py-2 rounded-full inline-flex gap-2 shadow-[0_4px_20px_rgba(0,0,0,0.15)] border border-white/10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.5 }}
        >
          {scrollSnaps.map((_, index) => (
            <motion.button
              key={index}
              className={`${
                index === selectedIndex
                  ? 'bg-gradient-to-r from-blue-500 to-purple-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]'
                  : 'bg-white/30 hover:bg-white/50'
              } rounded-full`}
              initial={{
                width: index === selectedIndex ? '1.5rem' : '0.5rem',
                height: '0.5rem'
              }}
              animate={{
                width: index === selectedIndex ? '1.5rem' : '0.5rem',
                height: '0.5rem'
              }}
              transition={{ duration: 0.3 }}
              onClick={() => scrollTo(index)}
              aria-label={`Go to slide ${index + 1}`}
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
            />
          ))}
        </motion.div>
      </div>
    </div>
  );
}
