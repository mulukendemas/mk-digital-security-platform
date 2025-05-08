
import * as React from 'react';
import { useState } from 'react';
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Target, Shield } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import publicApiClient from '@/lib/public-api';
import { Skeleton } from "@/components/ui/skeleton";

const About = () => {
  // Add the loadedImages state
  const [loadedImages, setLoadedImages] = useState<Record<string, boolean>>({});

  // Image handling functions - simplified to match exactly what works in the team section
  const handleImageLoad = (id: string) => {
    setLoadedImages(prev => ({ ...prev, [id]: true }));
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const target = e.target as HTMLImageElement;
    target.onerror = null; // Prevent infinite loop
    target.style.display = 'none'; // Hide the image

    // Create a gradient background div and append it to the parent
    const parent = target.parentElement;
    if (parent) {
      const gradientDiv = document.createElement('div');
      gradientDiv.className = "w-full h-full bg-gradient-to-r from-navy to-blue-900 rounded-t-lg";
      parent.appendChild(gradientDiv);
    }
  };

  // Helper function to ensure URL is absolute
  const getAbsoluteUrl = (url: string | null | undefined): string | null => {
    if (!url) return null; // Return null if URL is null or undefined
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url; // Already absolute
    }
    // Assume it's a relative URL and prepend the API base URL
    const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
    return `${apiBaseUrl}${url}`;
  };

  // Fetch about hero section data
  const { data: heroData } = useQuery({
    queryKey: ["about-hero"],
    queryFn: async () => {
      const response = await publicApiClient.get('/about-hero/');
      console.log('About Hero API response:', response.data);

      if (response.data && response.data.length > 0) {
        const heroData = response.data[0];
        console.log('About Hero data:', heroData);
        console.log('About Hero background_image:', heroData.background_image);
        console.log('About Hero background_image absolute URL:', getAbsoluteUrl(heroData.background_image));
        return heroData;
      }

      return response.data[0];
    },
  });

  // Fetch company overview data
  const { data: companyData } = useQuery({
    queryKey: ["company-overview"],
    queryFn: async () => {
      const response = await publicApiClient.get('/company-overview/');
      return response.data[0];
    },
  });

  // Fetch mission and vision data
  const { data: missionVisionData } = useQuery({
    queryKey: ["mission-vision"],
    queryFn: async () => {
      const response = await publicApiClient.get('/mission-vision/');
      return response.data[0];
    },
  });

  // Fetch team members data
  const { data: teamMembers } = useQuery({
    queryKey: ["team-members"],
    queryFn: async () => {
      const response = await publicApiClient.get('/team-members/');

      // No need to preload images anymore

      return response.data;
    },
  });

  // Fetch partners data
  const { data: partners, error: partnersError } = useQuery({
    queryKey: ["partners"],
    queryFn: async () => {
      try {
        const response = await publicApiClient.get('/partners/');
        return response.data;
      } catch (error) {
        console.error('Error fetching partners:', error);
        throw error;
      }
    },
  });

  // Fetch team description
  const { data: teamDescription } = useQuery({
    queryKey: ["team-descriptions"],
    queryFn: async () => {
      try {
        const response = await publicApiClient.get('/team-descriptions/');
        return response.data[0];
      } catch (error) {
        console.error('Error fetching team descriptions:', error);
        // Return a default value if the endpoint is not available
        return {
          title: "Our Leadership Team",
          description: "Meet the experienced professionals leading MK Digital Security Solutions."
        };
      }
    },
  });

  // Fetch partners description
  const { data: partnersDescription } = useQuery({
    queryKey: ["partner-descriptions"],
    queryFn: async () => {
      try {
        const response = await publicApiClient.get('/partner-descriptions/');
        return response.data[0];
      } catch (error) {
        console.error('Error fetching partner descriptions:', error);
        // Return a default value if the endpoint is not available
        return {
          title: "Our Partners",
          description: "We work with leading organizations to deliver the best solutions."
        };
      }
    },
  });

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-grow">
        {/* Hero Section - Matching the Product and Solution pages approach */}
        <section className="pt-24 text-white relative overflow-hidden" style={{ backgroundColor: 'transparent', marginBottom: '-40px' }}>
          <div className="w-full bg-transparent" style={{ height: 'auto', maxHeight: '70vh', marginBottom: '0' }}>
            {heroData?.background_image ? (
              <img
                src={heroData.background_image}
                alt="About Hero Background"
                className="w-full h-auto"
                style={{
                  maxWidth: '100%',
                  display: 'block',
                  margin: '0 auto',
                  backgroundColor: 'transparent'
                }}
                onLoad={(e) => {
                  console.log("About hero image loaded successfully:", (e.target as HTMLImageElement).src);
                }}
                onError={(e) => {
                  console.error("Error loading about hero image:", (e.target as HTMLImageElement).src);
                  // Hide the image on error
                  (e.target as HTMLImageElement).style.display = 'none';

                  // Create a gradient background div and append it to the parent
                  const parent = (e.target as HTMLImageElement).parentElement;
                  if (parent) {
                    const gradientDiv = document.createElement('div');
                    gradientDiv.className = "w-full h-full bg-gradient-to-r from-navy to-blue-900";
                    parent.appendChild(gradientDiv);
                  }
                }}
              />
            ) : (
              <div className="w-full h-64 bg-gradient-to-r from-navy to-blue-900"></div>
            )}
          </div>

          {/* Content Container - Matching Product and Solution pages */}
          <div className="container-lg py-12 text-center relative z-10 px-8">
            <div className="py-6 px-8 rounded-lg inline-block">
              {heroData?.title && (
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-white">
                  {heroData.title}
                </h1>
              )}
              {heroData?.description && (
                <p className="text-lg md:text-xl text-white max-w-3xl mx-auto font-medium">
                  {heroData.description}
                </p>
              )}
            </div>
          </div>

        </section>

        {/* Company Overview */}
        <section className="pt-8 pb-16 relative">
          <div className="container-lg">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-bold mb-6 text-navy">{companyData?.title || "Our Company"}</h2>
                <div className="text-muted-foreground mb-6 leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: companyData?.description || "" }}
                />
              </div>
              <div className="bg-gray-100 p-8 rounded-lg">
                <blockquote className="text-lg italic text-gray-700 mb-6">
                  {companyData?.quote || ""}
                </blockquote>
                <div className="flex items-center">
                  <div>
                    <p className="font-semibold">{companyData?.quote_author || ""}</p>
                    <p className="text-sm text-muted-foreground">{companyData?.quote_position || ""}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Mission and Vision */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-mkdss-blue">
                {missionVisionData?.title || "Our Mission & Vision"}
              </h2>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <Card className="shadow-lg border-none hover-card">
                <CardContent className="p-8">
                  <div className="bg-mkdss-accent/10 p-3 rounded-full w-fit mb-6">
                    <Target className="h-8 w-8 text-mkdss-accent" />
                  </div>
                  <h3 className="text-2xl font-bold mb-4 text-mkdss-blue">Our Mission</h3>
                  <p className="text-mkdss-darkgray">{missionVisionData?.mission || ""}</p>
                </CardContent>
              </Card>

              <Card className="shadow-lg border-none hover-card">
                <CardContent className="p-8">
                  <div className="bg-mkdss-accent/10 p-3 rounded-full w-fit mb-6">
                    <Shield className="h-8 w-8 text-mkdss-accent" />
                  </div>
                  <h3 className="text-2xl font-bold mb-4 text-mkdss-blue">Our Vision</h3>
                  <p className="text-mkdss-darkgray">{missionVisionData?.vision || ""}</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-mkdss-blue">
                {teamDescription?.title || "Our Leadership Team"}
              </h2>
              <p className="text-mkdss-darkgray max-w-3xl mx-auto">
                {teamDescription?.description || "Meet the experienced professionals leading MK Digital Security Solutions."}
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {teamMembers?.map((member: any) => {
                // Determine if we should show the image or skeleton
                const isLoaded = loadedImages[member.id];

                return (
                  <Card key={member.id} className="border-none shadow-lg hover-card">
                    <CardContent className="p-0">
                      <div className="relative w-full h-48 overflow-hidden">
                        {/* Only show skeleton if image is not loaded */}
                        {!isLoaded && (
                          <div className="absolute inset-0">
                            <Skeleton className="w-full h-full rounded-t-lg" />
                          </div>
                        )}

                        {/* Container for centering the image */}
                        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-t-lg">
                          {/* Only render the image if there is one */}
                          {member.image ? (
                            <img
                              src={member.image}
                              alt={member.name}
                              data-id={member.id}
                              className={`w-full h-full object-cover object-center ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
                              style={{ transition: 'none' }} /* Disable any transitions */
                              onLoad={() => handleImageLoad(member.id)}
                              onError={(e) => {
                                handleImageError(e);
                                // Mark as loaded when using fallback
                                handleImageLoad(member.id);
                              }}
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-r from-navy to-blue-900 rounded-t-lg"></div>
                          )}
                        </div>
                      </div>
                    <div className="p-6">
                      <h3 className="font-bold text-xl mb-1 text-mkdss-blue">{member.name}</h3>
                      <p className="text-mkdss-accent">{member.position}</p>
                    </div>
                  </CardContent>
                </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* Partners Section */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-mkdss-blue">
                {partnersDescription?.title || "Our Partners"}
              </h2>
              <p className="text-mkdss-darkgray max-w-3xl mx-auto">
                {partnersDescription?.description || "We work with leading organizations to deliver the best solutions."}
              </p>
            </div>

            {/* Error state */}
            {partnersError && (
              <div className="text-red-500 text-center my-8">
                Failed to load partners. Please try again later.
              </div>
            )}

            {/* Loading state */}
            {!partners && !partnersError && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-white p-8 rounded-xl shadow-md">
                    <Skeleton className="w-full h-20" />
                  </div>
                ))}
              </div>
            )}

            {/* Partners grid with dynamic data */}
            {partners && partners.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
                {partners.map((partner: any) => {
                  // Create a unique key for this partner
                  const partnerKey = `partner-${partner.id}`;
                  // Determine if we should show the image or skeleton
                  const isLoaded = loadedImages[partnerKey];

                  return (
                    <div
                      key={partner.id}
                      className="bg-white p-8 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 flex items-center justify-center"
                    >
                      <div className="relative w-full h-20 flex items-center justify-center">
                        {/* Only show skeleton if image is not loaded */}
                        {!isLoaded && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <Skeleton className="w-32 h-12" />
                          </div>
                        )}

                        {/* Partner logo with no fallback */}
                        {/* Debug info - only shown in development mode */}
                        {false && process.env.NODE_ENV === 'development' && (
                          <div className="absolute bottom-0 left-0 right-0 text-xs text-gray-400 text-center">
                            Logo URL: {partner.logo || 'null'}<br />
                            Absolute URL: {getAbsoluteUrl(partner.logo) || 'null'}
                          </div>
                        )}
                        {getAbsoluteUrl(partner.logo) ? (
                          <img
                            src={getAbsoluteUrl(partner.logo) as string}
                            alt={partner.name}
                            data-id={partnerKey}
                            className={`max-h-20 w-auto object-contain ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
                            style={{ transition: 'none' }}
                            onLoad={() => handleImageLoad(partnerKey)}
                            onError={(e) => {
                              handleImageError(e);
                              handleImageLoad(partnerKey);
                            }}
                          />
                        ) : (
                          <div className="h-12 w-32 bg-gradient-to-r from-navy/20 to-blue-900/20 rounded"></div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* No partners message */}
            {partners && partners.length === 0 && (
              <div className="text-center text-gray-500 my-8">
                No partners found.
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default About;