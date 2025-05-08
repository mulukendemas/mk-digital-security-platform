
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Features } from "@/components/home/Features";
import { WhyChooseUs } from "@/components/home/WhyChooseUs";
import { TargetMarketSection } from "@/components/home/TargetMarketSection";
import { useQuery } from "@tanstack/react-query";
import { HeroSection, Feature, WhyChooseUs as WhyChooseUsType } from "@/lib/types";
import { featuresService, whyChooseUsService } from "@/lib/api-service";
import { useState, useEffect } from "react";
import { HeroImage } from "@/components/home/HeroImage";


const Index = () => {

  // State to store the hero data
  const [heroData, setHeroData] = useState<HeroSection | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Use useEffect to fetch the hero data directly
  useEffect(() => {
    const fetchHeroData = async () => {
      try {
        setLoading(true);
        console.log('Index - Fetching hero section data directly');

        // Create a unique URL with timestamp to bypass caching
        const timestamp = new Date().getTime();
        const randomString = Math.random().toString(36).substring(7);
        const url = `http://localhost:8000/api/hero-section/?_t=${timestamp}&r=${randomString}`;

        // Make a direct fetch request without custom headers to avoid CORS issues
        const response = await fetch(url);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Index - Hero section raw data:', data);
        console.log('Index - Response status:', response.status);
        console.log('Index - Response headers:', {
          'content-type': response.headers.get('content-type'),
          'cache-control': response.headers.get('cache-control')
        });

        if (data && data.length > 0) {
          console.log('Index - All hero sections:', data);
          console.log('Index - Number of hero sections:', data.length);

          // Log each hero section
          data.forEach((hero: any, index: number) => {
            console.log(`Index - Hero section ${index + 1}:`, {
              id: hero.id,
              title: hero.title,
              description: hero.description,
              button_text: hero.button_text,
              button_link: hero.button_link,
              background_image: hero.background_image
            });
          });

          // Get the latest hero section (highest ID)
          const sortedData = [...data].sort((a, b) => b.id - a.id);
          const latestHero = sortedData[0];

          console.log('Index - Latest hero section (after sorting):', latestHero);
          console.log('Index - Background image from API:', latestHero.background_image);

          // Check if the background_image is null
          if (!latestHero.background_image) {
            console.warn('Index - WARNING: Background image is null in the latest hero section');
          }

          // Store the hero data
          setHeroData(latestHero);

          // Log image information
          if (latestHero.background_image) {
            console.log('Index - Background image from API:', latestHero.background_image);
          } else {
            console.log('Index - No background image found, will use default image');
          }
        } else {
          console.log('Index - No hero section data found');
          setHeroData(null);
        }

        setLoading(false);
      } catch (err) {
        console.error('Index - Error fetching hero data:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
        setLoading(false);
      }
    };

    fetchHeroData();

    // Set up an interval to refetch the data every 5 seconds
    const interval = setInterval(fetchHeroData, 5000);

    // Clean up the interval when the component unmounts
    return () => clearInterval(interval);
  }, []);

  // These queries are used by the Features and WhyChooseUs components
  useQuery<Feature[]>({
    queryKey: ["features"],
    queryFn: async () => {
      return await featuresService.getAll();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  useQuery<WhyChooseUsType[]>({
    queryKey: ["why-choose-us"],
    queryFn: async () => {
      return await whyChooseUsService.getAll();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="pt-24 text-white relative overflow-hidden h-[500px]">
          <div className="absolute inset-0 opacity-100 bg-gray-100">
            {/* Use the HeroImage component */}
            <HeroImage
              imageUrl={heroData?.background_image || null}
            />
            {/* No overlay to let the original image display without modifications */}
          </div>

        </section>

        {/* Features Section */}
        <div className="mb-[-30px]">
          <Features />
        </div>

        {/* Why Choose Us Section */}
        <div className="mb-[-30px]">
          <WhyChooseUs />
        </div>

        {/* Target Markets Section */}
        <TargetMarketSection />

      </main>

      <Footer />
    </div>
  );
};

export default Index;


