import { useEffect, useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ChevronRight, Calendar, User } from "lucide-react";
import { newsService, userService, newsDescriptionService } from "@/lib/api-service";
import { NewsArticle, User as UserType, NewsDescription } from "@/lib/types";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";

const News = () => {
  const [loadedImages, setLoadedImages] = useState<Record<string, boolean>>({});

  // Add query for authors
  const { data: authors = [] } = useQuery<UserType[]>({
    queryKey: ["authors"],
    queryFn: () => userService.getAuthors(),
    staleTime: 5 * 60 * 1000
  });

  // Add query for news description (for hero section)
  const { data: newsDescription, isLoading: isDescriptionLoading, refetch: refetchNewsDescription } = useQuery<NewsDescription>({
    queryKey: ["news-descriptions"],
    queryFn: async () => {
      try {
        console.log("Fetching news descriptions for hero section");

        // Use the newsDescriptionService to get the data
        const data = await newsDescriptionService.getAll();
        console.log("News description data received:", data);

        // Return the first description or null if none exists
        const description = data.length > 0 ? data[0] : null;

        if (description) {
          console.log("Using news description:", description);
          console.log("Description properties:", Object.keys(description));
          console.log("Hero image from description:", description.hero_image);

          // If there's a hero image, log it for debugging
          if (description.hero_image) {
            console.log("Hero image URL found:", description.hero_image);
            console.log("Hero image type:", typeof description.hero_image);
          } else {
            console.warn("No hero image found in the description");
          }
        } else {
          console.warn("No news description found");
        }

        return description;
      } catch (error) {
        console.error("Error fetching news description:", error);
        return null;
      }
    },
    staleTime: 0, // Don't cache the data
    refetchOnMount: true, // Always refetch when the component mounts
    refetchOnWindowFocus: true // Refetch when the window regains focus
  });

  // Process the hero image URL
  const [processedHeroImage, setProcessedHeroImage] = useState<string | null>(null);

  useEffect(() => {
    console.log("useEffect for hero image processing triggered");
    console.log("newsDescription:", newsDescription);

    if (!newsDescription) {
      console.log("No newsDescription available, skipping hero image processing");
      setProcessedHeroImage(null);
      return;
    }

    // Process the hero image URL
    if (newsDescription.hero_image) {
      console.log("Raw hero image URL:", newsDescription.hero_image);
      console.log("Hero image type:", typeof newsDescription.hero_image);

      // Check if it's a blob URL (temporary URL created by the browser)
      if (typeof newsDescription.hero_image === 'string' && newsDescription.hero_image.startsWith('blob:')) {
        console.log("Hero image is a blob URL, setting to null");
        setProcessedHeroImage(null);
        return;
      }

      // Construct the full URL with the base URL
      const baseUrl = 'http://localhost:8000';
      let fullUrl = newsDescription.hero_image;

      // If it's not an absolute URL, add the base URL
      if (!fullUrl.startsWith('http')) {
        if (fullUrl.startsWith('/')) {
          fullUrl = `${baseUrl}${fullUrl}`;
        } else {
          fullUrl = `${baseUrl}/${fullUrl}`;
        }
      }

      // Add a cache-busting parameter
      const timestamp = new Date().getTime();
      const cacheBuster = `?t=${timestamp}`;
      fullUrl = `${fullUrl}${fullUrl.includes('?') ? '&' : cacheBuster}${cacheBuster}`;

      console.log("Processed hero image URL:", fullUrl);

      // Store the processed URL in state
      setProcessedHeroImage(fullUrl);
      console.log("Updated processedHeroImage state:", fullUrl);

      // Preload the image to ensure it's in the browser cache
      const img = new Image();
      img.onload = () => console.log("Hero image preloaded successfully:", fullUrl);
      img.onerror = (e) => {
        console.error("Error preloading hero image:", e);
        // If there's an error loading the image, set to null
        setProcessedHeroImage(null);
      };
      img.src = fullUrl;
    } else {
      // No image provided, set to null
      console.log("No hero image in newsDescription, setting to null");
      setProcessedHeroImage(null);
    }
  }, [newsDescription?.id, newsDescription?.hero_image]);

  const { data: newsArticles = [], isLoading, error } = useQuery<NewsArticle[]>({
    queryKey: ["news"],
    queryFn: () => newsService.getAll(),
    retry: 1,
    staleTime: 5 * 60 * 1000
  });

  // Add helper function to get author name
  const getAuthorName = (authorId: string | number | undefined): string => {
    console.log('Getting author name for ID:', authorId);
    console.log('Available authors:', authors);

    if (!authorId) {
      console.log('No author ID provided, returning empty string');
      return '';
    }

    // Convert authorId to string for comparison
    const authorIdStr = authorId.toString();
    console.log('Looking for author with ID:', authorIdStr);

    const author = authors.find(a => {
      const aIdStr = a.id.toString();
      console.log(`Comparing author ID ${aIdStr} with ${authorIdStr}`);
      return aIdStr === authorIdStr;
    });

    if (author) {
      console.log('Author found:', author);
      return author.name || author.username || '';
    } else {
      console.log('Author not found, returning empty string');
      return '';
    }
  };

  // Add effect to monitor query state
  useEffect(() => {
    if (error) {
      console.error('News Component Error State:', error);
    }
  }, [error]);

  // Add effect to monitor newsDescription changes
  useEffect(() => {
    console.log('newsDescription changed:', newsDescription);
    if (newsDescription?.hero_image) {
      console.log('Hero image in newsDescription:', newsDescription.hero_image);
    }
  }, [newsDescription]);

  if (error) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow">
          <div className="container-lg py-16">
            <div className="text-center text-red-500">
              <p>Failed to load news articles. Please try again later.</p>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Simplified image handling
  const handleImageLoad = (articleId: string) => {
    setLoadedImages(prev => ({ ...prev, [articleId]: true }));
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const target = e.target as HTMLImageElement;
    target.onerror = null;
    // Hide the image instead of showing a placeholder
    target.style.display = 'none';
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-grow">
        {/* Hero Section with Background Image */}
        <section className="pt-24 text-white relative overflow-hidden h-[500px]">
          <div className="absolute inset-0 opacity-100 bg-gray-100">
            {/* Log the current state */}
            {(() => { console.log("Current processedHeroImage state:", processedHeroImage); return null; })()}

            {processedHeroImage ? (
              <img
                key={`hero-image-${Date.now()}`} // Force re-render on each render cycle
                src={processedHeroImage}
                alt="News Hero Background"
                className="w-full h-full object-cover"
                style={{
                  objectPosition: 'center center'
                }}
                onLoad={(e) => {
                  const img = e.target as HTMLImageElement;
                  console.log("News hero image loaded successfully:", img.src);
                  console.log("Image dimensions:", img.naturalWidth, "x", img.naturalHeight);
                  console.log("Image complete:", img.complete);
                }}
                onError={() => {
                  console.error("Error loading news hero image:", processedHeroImage);
                  setProcessedHeroImage(null);
                }}
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-r from-navy to-blue-900"></div>
            )}
          </div>

          <div className="container-lg py-24 text-center relative z-10 px-8">
            {/* Only show title and description if they are provided */}
            {newsDescription?.title || newsDescription?.description ? (
              <div className="bg-black/20 py-6 px-8 rounded-lg backdrop-blur-sm inline-block">
                {newsDescription?.title && (
                  <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-white">
                    {newsDescription.title}
                  </h1>
                )}
                {newsDescription?.description && (
                  <p className="text-lg md:text-xl text-white max-w-3xl mx-auto font-medium">
                    {newsDescription.description}
                  </p>
                )}
              </div>
            ) : null}
          </div>
        </section>

        {/* News Articles */}
        <section className="py-16">
          <div className="container-lg">
            {/* News/Events Header */}
            <div className="mb-10 text-center">
              <h2 className="text-3xl md:text-4xl font-bold text-navy mb-4">News - Events</h2>
              <div className="w-24 h-1 bg-navy mx-auto"></div>
            </div>

            {isLoading ? (
              <div className="grid md:grid-cols-2 gap-8">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="border rounded-lg shadow-sm overflow-hidden">
                    <Skeleton className="w-full h-48" />
                    <div className="p-6">
                      <Skeleton className="h-6 w-3/4 mb-3" />
                      <Skeleton className="h-4 w-1/2 mb-4" />
                      <Skeleton className="h-20 w-full mb-4" />
                      <Skeleton className="h-8 w-24" />
                    </div>
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="text-center py-8 text-red-500">
                <p>Error loading news articles. Please try again later.</p>
              </div>
            ) : (newsArticles as NewsArticle[]).length === 0 ? (
              <div className="text-center py-8">
                <p>No news articles available at the moment.</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-8">
                {(newsArticles as NewsArticle[]).map((article: NewsArticle) => (
                  <div key={article.id} className="border rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                    <div className="w-full h-48 bg-gray-200 relative">
                      {!loadedImages[article.id] && (
                        <div className="absolute inset-0">
                          <Skeleton className="w-full h-full" />
                        </div>
                      )}
                      <img
                        src={article.image || ''}
                        alt={article.title}
                        className={`w-full h-full object-cover transition-opacity duration-300 ${
                          loadedImages[article.id] ? 'opacity-100' : 'opacity-0'
                        }`}
                        onLoad={() => handleImageLoad(article.id)}
                        onError={handleImageError}
                      />
                    </div>
                    <div className="p-6">
                      <h2 className="text-xl font-bold mb-3 text-navy">{article.title}</h2>
                      <div className="flex items-center text-sm text-muted-foreground mb-4">
                        <div className="flex items-center mr-4">
                          <Calendar className="h-4 w-4 mr-1" />
                          <span>{new Date(article.published_at).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center">
                          <User className="h-4 w-4 mr-1" />
                          <span>
                            {article.authorName ||
                             (typeof article.author === 'object' && (article.author as any)?.name) ||
                             getAuthorName(article.author) ||
                             ''}
                          </span>
                        </div>
                      </div>
                      <p className="text-muted-foreground mb-4">{article.excerpt}</p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="group text-navy border-navy hover:bg-navy hover:text-white"
                        asChild
                      >
                        <Link
                          to={`/news/${article.id}`}
                          onClick={() => {
                            console.log('Navigating to article:', {
                              id: article.id,
                              url: `/news/${article.id}`
                            });
                          }}
                        >
                          Read More
                          <ChevronRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </Link>
                      </Button>
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

export default News;




















