import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Fingerprint, Shield, CreditCard, IdCard, Lock, ShieldCheck, Building, Users, Database, Server, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { solutionsService, solutionDescriptionService, fixImageUrl } from "@/lib/api-service";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

// Define the solution type for the transformed data
interface SolutionItem {
  id: number | string;
  title: string;
  description: string;
  features: string[];
  image: string;
  summary?: string;
  icon?: React.ReactNode;
}

const Solutions = () => {
  // Helper function to get the appropriate icon for a solution
  const getIconForSolution = (title: string, iconName?: string) => {
    if (iconName) {
      const iconMap: Record<string, React.ReactNode> = {
        "Fingerprint": <Fingerprint />,
        "Shield": <Shield />,
        "CreditCard": <CreditCard />,
        "IdCard": <IdCard />,
        "Lock": <Lock />,
        "ShieldCheck": <ShieldCheck />,
        "Building": <Building />,
        "Users": <Users />,
        "Database": <Database />,
        "Server": <Server />
      };

      if (iconMap[iconName]) {
        return iconMap[iconName];
      }
    }

    const titleIconMap: Record<string, React.ReactNode> = {
      "Identity Management": <IdCard />,
      "Access Control": <Lock />,
      "Smart Card Solutions": <CreditCard />,
      "Biometric Authentication": <Fingerprint />,
      "Digital Security": <Shield />,
      "Enterprise Security": <Building />,
      "User Authentication": <Users />,
      "Data Protection": <Database />,
      "Infrastructure Security": <Server />
    };

    for (const key in titleIconMap) {
      if (title.toLowerCase().includes(key.toLowerCase())) {
        return titleIconMap[key];
      }
    }

    return <ShieldCheck />;
  };

  // Fetch solution descriptions
  const { data: solutionDescription, isLoading: descriptionLoading, refetch: refetchSolutionDescription } = useQuery({
    queryKey: ["solution-descriptions"],
    queryFn: async () => {
      try {
        // First try the solution-descriptions endpoint
        const data = await solutionDescriptionService.getAll();

        // Log the raw data received from the backend
        console.log("RAW Solution descriptions from API:", JSON.stringify(data, null, 2));

        // Log each solution description in detail
        if (Array.isArray(data) && data.length > 0) {
          console.log("First solution description details:");
          console.log("- ID:", data[0].id);
          console.log("- Title:", data[0].title);
          console.log("- Description:", data[0].description);
          console.log("- Hero Image:", data[0].hero_image);
          console.log("- All properties:", Object.keys(data[0]));

          // Check if hero_image is a string and not empty
          if (data[0].hero_image) {
            console.log("- Hero Image is present");
            console.log("- Hero Image type:", typeof data[0].hero_image);
            console.log("- Hero Image value:", data[0].hero_image);

            // Check if the hero_image is a valid URL
            if (data[0].hero_image.startsWith('/api/')) {
              console.log("- WARNING: Hero Image URL starts with /api/ which is incorrect");

              // Try to fix the URL by replacing /api/ with /media/
              const fixedUrl = data[0].hero_image.replace('/api/', '/media/');
              console.log("- Suggested fix:", fixedUrl);

              // Update the hero_image in the data
              data[0].hero_image = fixedUrl;
            }
          } else {
            console.log("- Hero Image is missing or empty");
          }

          // Return the first description
          const firstDescription = data[0];

          // Log the selected description
          console.log("Selected solution description:", firstDescription);
          console.log("Hero image URL:", firstDescription.hero_image);

          // Log all properties of the solution description
          console.log("Solution description properties:");
          Object.keys(firstDescription).forEach(key => {
            console.log(`${key}: ${(firstDescription as any)[key]}`);
          });

          return firstDescription;
        } else {
          console.log("No solution descriptions found in API response, returning null");

          // Return null if no data is found
          return null;
        }
      } catch (error) {
        console.error("Error fetching solution descriptions:", error);
        // Return null if there's an error
        return null;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Fetch solutions
  const { data: solutionsData = [], isLoading: solutionsLoading, error: solutionsError } = useQuery<SolutionItem[]>({
    queryKey: ["solutions"],
    queryFn: async () => {
      const data = await solutionsService.getAll();

      return data.map((solution: any) => ({
        id: solution.id,
        title: solution.title,
        description: solution.description,
        features: solution.features || [],
        summary: solution.summary || `${solution.title} provides comprehensive security features for your organization.`,
        icon: getIconForSolution(solution.title, solution.icon),
        // Add image handling
        image: solution.image
          ? solution.image.startsWith('http')
            ? solution.image
            : `${import.meta.env.VITE_API_URL}${solution.image}`
          : null
      }));
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Derived state
  const loading = descriptionLoading || solutionsLoading;
  const error = solutionsError ? "Failed to load solutions. Please try again later." : null;
  const solutions: SolutionItem[] = solutionsData;

  // Process the hero image URL once when the solution description changes
  const [processedHeroImage, setProcessedHeroImage] = useState<string | null>(null);

  // Automatically refetch the solution description when the component mounts
  useEffect(() => {
    console.log("Component mounted, refetching solution description");
    refetchSolutionDescription();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // Only run this effect once when solutionDescription changes
    if (!solutionDescription) {
      setProcessedHeroImage(null);
      return;
    }

    console.log("Solution description in useEffect:", solutionDescription);

    // Process the hero image URL
    if (solutionDescription.hero_image) {
      console.log("Raw hero image URL:", solutionDescription.hero_image);

      // Check if it's a placeholder URL
      if (solutionDescription.hero_image.includes('via.placeholder.com')) {
        console.log("Detected placeholder URL, setting to null");
        setProcessedHeroImage(null);
      }
      // Check if it's an incorrect API URL
      else if (solutionDescription.hero_image.startsWith('/api/')) {
        console.log("Detected incorrect API URL, fixing it");
        // Fix the URL by replacing /api/ with /media/
        const fixedUrl = solutionDescription.hero_image.replace('/api/', '/media/');
        console.log("Fixed URL:", fixedUrl);

        // Use the fixImageUrl function to get the correct absolute URL
        const imageUrl = fixImageUrl(fixedUrl);
        console.log("Processed hero image URL:", imageUrl);

        // Store the processed URL in state
        setProcessedHeroImage(imageUrl);
      }
      else {
        // Use the fixImageUrl function to get the correct URL
        const imageUrl = fixImageUrl(solutionDescription.hero_image);
        console.log("Processed hero image URL:", imageUrl);

        // Store the processed URL in state
        setProcessedHeroImage(imageUrl);
      }
    } else {
      // No image provided, set to null
      console.log("No hero image provided, setting to null");
      setProcessedHeroImage(null);
    }
  }, [solutionDescription?.id]); // Only re-run if the ID changes, not the entire object

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-grow">
        {/* Dynamic Hero Section with Background Image - Responsive for mobile */}
        <section className="pt-16 md:pt-24 text-white relative overflow-hidden h-[300px] sm:h-[400px] md:h-[500px]">
          <div className="absolute inset-0 opacity-100">
            {processedHeroImage ? (
              <div className="relative w-full h-full">
                <img
                  src={processedHeroImage}
                  alt="Solutions"
                  className="w-full h-full object-cover object-center"
                  onLoad={(e) => {
                    console.log("Hero image loaded successfully:", (e.target as HTMLImageElement).src);
                  }}
                  onError={(e) => {
                    console.error("Error loading hero image:", (e.target as HTMLImageElement).src);

                    const currentSrc = (e.target as HTMLImageElement).src;

                    // Check if the current src is an API URL
                    if (currentSrc.includes('/api/')) {
                      console.log("Detected API URL in error handler, fixing it");
                      // Fix the URL by replacing /api/ with /media/
                      const fixedUrl = currentSrc.replace('/api/', '/media/');
                      console.log("Fixed URL in error handler:", fixedUrl);
                      (e.target as HTMLImageElement).src = fixedUrl;
                    } else {
                      // Hide the image on error
                      (e.target as HTMLImageElement).style.display = 'none';

                      // Create a gradient background div and append it to the parent
                      const parent = (e.target as HTMLImageElement).parentElement;
                      if (parent) {
                        const gradientDiv = document.createElement('div');
                        gradientDiv.className = "w-full h-full bg-gradient-to-r from-navy to-blue-900";
                        parent.appendChild(gradientDiv);
                      }
                    }
                  }}
                />
                {/* Add a subtle overlay for better text readability on mobile */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/10 to-black/30 md:bg-transparent"></div>
              </div>
            ) : (
              <div className="w-full h-full bg-gradient-to-r from-navy to-blue-900"></div>
            )}
          </div>
          <div className="container-lg py-12 md:py-16 lg:py-24 text-center relative z-10">
            {descriptionLoading ? (
              <div className="animate-pulse">
                <div className="h-8 md:h-12 bg-white/30 rounded w-1/2 mx-auto mb-4 md:mb-6"></div>
                <div className="h-3 md:h-4 bg-white/30 rounded w-3/4 mx-auto mb-2"></div>
                <div className="h-3 md:h-4 bg-white/30 rounded w-2/3 mx-auto"></div>
              </div>
            ) : (
              <div className="bg-black/20 py-4 md:py-6 px-4 md:px-8 rounded-lg backdrop-blur-sm inline-block max-w-full md:max-w-auto">
                {/* Hidden content - kept for reference */}
                {/* <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 md:mb-6">
                  {solutionDescription?.title && solutionDescription.title.trim() !== ""
                    ? solutionDescription.title
                    : ""}
                </h1>
                <p className="text-base md:text-lg text-white/90 max-w-3xl mx-auto">
                  {solutionDescription?.description && solutionDescription.description.trim() !== ""
                    ? solutionDescription.description
                    : ""}
                </p> */}
                {/* Add a hidden button for development purposes */}
                <button
                  className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 hidden"
                  onClick={() => {
                    console.log("Manually refetching solution description");
                    refetchSolutionDescription();
                  }}
                >
                  Refresh
                </button>
              </div>
            )}
          </div>
        </section>

        {/* Solutions Overview */}
        <section className="py-10 bg-white">
          <div className="container mx-auto px-4">


            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-12">
              {solutions.map((solution) => (
                <div key={solution.id} className="group relative">
                  {/* Link to the solution detail page */}
                  <Link
                    to={`/solution/${solution.id}`}
                    className="absolute inset-0 z-10"
                    aria-label={`View details for ${solution.title}`}
                  />

                  {/* Card content - still scrolls to the section when clicked */}
                  <a
                    href={`#solution-${solution.id}`}
                    className="flex flex-col items-center justify-center p-4 rounded-lg bg-light-blue group-hover:bg-gold/10 transition-colors min-h-[120px] relative"
                    onClick={(e) => {
                      // Prevent the default behavior to avoid navigating away
                      e.preventDefault();

                      // Scroll to the section
                      const element = document.getElementById(`solution-${solution.id}`);
                      if (element) {
                        element.scrollIntoView({ behavior: 'smooth' });
                      }
                    }}
                  >
                    <div className="h-8 w-8 mb-2 text-mkdss-accent">
                      {solution.icon}
                    </div>
                    <span className="text-center text-sm font-medium text-navy">
                      {solution.title}
                    </span>

                    {/* Small indicator that this is clickable */}
                    <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <ArrowRight className="h-3 w-3 text-mkdss-blue" />
                    </div>
                  </a>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Solutions Listing */}
        <section className="py-16">
          <div className="container-lg">
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-navy border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
                <p className="mt-4 text-muted-foreground">Loading solutions...</p>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <p className="text-red-500">{error}</p>
              </div>
            ) : (
              <div className="space-y-16">
                {solutions.map((solution, index) => (
                  <div id={`solution-${solution.id}`} key={solution.id} className={`grid md:grid-cols-2 gap-12 items-center ${index % 2 === 1 ? 'md:grid-flow-dense' : ''}`}>
                    <div className={index % 2 === 1 ? 'md:col-start-2' : ''}>
                      <div className="flex items-center mb-4">
                        <span className="h-8 w-8 mr-2 text-mkdss-accent">{solution.icon}</span>
                        <h2 className="text-3xl font-bold text-mkdss-blue">{solution.title}</h2>
                      </div>
                      <p className="text-muted-foreground mb-6">
                        {solution.id === 2 || (solution.title && solution.title.includes("Financial Card Issuance")) ||
                         solution.id === 1 || (solution.title && solution.title.includes("Identification"))
                          ? (solution.description.length > 150
                              ? solution.description.substring(0, 150).split('\n')[0] + '...'
                              : solution.description)
                          : solution.description}
                      </p>
                      <Card className="mb-6 border-none shadow-md">
                        <CardContent className="p-6">
                          <h3 className="text-lg font-semibold mb-3 text-mkdss-blue">Key Features</h3>
                          <ul className="space-y-3 mb-6">
                            {solution.features.map((feature: string, idx: number) => (
                              <li key={idx} className="flex items-start">
                                <ShieldCheck className="h-5 w-5 text-gold shrink-0 mr-3 mt-0.5" />
                                <span>{feature}</span>
                              </li>
                            ))}
                          </ul>

                          <div className="mt-4 text-right">
                            <Button
                              asChild
                              variant="outline"
                              size="sm"
                              className="text-mkdss-blue hover:text-mkdss-blue/80 hover:bg-light-blue/50 border-mkdss-blue/30"
                            >
                              <Link to={`/solution/${solution.id}`} className="flex items-center gap-2">
                                Read More <ArrowRight className="h-3.5 w-3.5" />
                              </Link>
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                    <div className={`bg-light-blue rounded-xl p-8 h-80 flex items-center justify-center ${index % 2 === 1 ? 'md:col-start-1' : ''}`}>
                      {solution.image ? (
                        <img
                          src={solution.image}
                          alt={solution.title}
                          className="w-full h-full object-contain"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.onerror = null; // Prevent infinite loop
                            target.style.display = 'none';

                            // Show the icon instead
                            const parent = target.parentElement;
                            if (parent) {
                              const iconDiv = document.createElement('div');
                              iconDiv.className = "bg-navy/10 w-24 h-24 rounded-full flex items-center justify-center";

                              // Create a div for the icon
                              const innerDiv = document.createElement('div');
                              innerDiv.className = "h-12 w-12 text-navy";

                              // Append the icon div to the parent
                              iconDiv.appendChild(innerDiv);
                              parent.appendChild(iconDiv);

                              // Render the icon (this is a simplified approach)
                              const iconContainer = document.createElement('div');
                              iconContainer.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-shield-check"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/><path d="m9 12 2 2 4-4"/></svg>`;
                              innerDiv.appendChild(iconContainer.firstChild as Node);
                            }
                          }}
                        />
                      ) : (
                        <div className="bg-navy/10 w-24 h-24 rounded-full flex items-center justify-center">
                          <div className="h-12 w-12 text-navy">
                            {solution.icon}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Solutions;



