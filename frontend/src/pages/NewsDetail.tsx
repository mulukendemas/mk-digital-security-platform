import { useParams, Link } from "react-router-dom";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Calendar, User as UserIcon, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { newsService } from "@/lib/api-service";
import { userService } from "@/lib/api-service";
import type { User } from "@/lib/types";

const NewsDetail = () => {
  const { id } = useParams<{ id: string }>();

  // Add date formatting helper
  const formatDate = (dateString: string | Date | undefined): string => {
    if (!dateString) return 'N/A';

    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Invalid Date';

      return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      }).format(date);
    } catch (error) {
      console.error('Date parsing error:', error);
      return 'Invalid Date';
    }
  };

  const { data: authors = [] } = useQuery<User[]>({
    queryKey: ["authors"],
    queryFn: () => userService.getAuthors(),
    staleTime: 5 * 60 * 1000
  });



  const { data: article, isLoading, error } = useQuery({
    queryKey: ["news", id],
    queryFn: async () => {
      if (!id) throw new Error("Article ID is required");
      console.log(`NewsDetail: Fetching article with ID: ${id}`);
      try {
        const result = await newsService.getById(id);
        console.log('NewsDetail: Article fetch result:', result);
        return result;
      } catch (error) {
        console.error('NewsDetail: Error fetching article:', error);
        throw error;
      }
    },
    enabled: !!id,
    retry: 1,
    staleTime: 5 * 60 * 1000
  });

  // Log error details if present
  useEffect(() => {
    if (error) {
      console.error('NewsDetail: Error state details:', error);
      if ((error as any).response) {
        console.error('Response status:', (error as any).response.status);
        console.error('Response data:', (error as any).response.data);
      }
    }
  }, [error]);

  const getAuthorName = (authorId: string | number | undefined): string => {
    console.log('NewsDetail: Getting author name for ID:', authorId);
    console.log('NewsDetail: Available authors:', authors);

    if (!authorId) {
      console.log('NewsDetail: No author ID provided, returning Unknown');
      return 'Unknown';
    }

    // Convert authorId to string for comparison
    const authorIdStr = authorId.toString();
    console.log('NewsDetail: Looking for author with ID:', authorIdStr);

    const author = authors.find(a => {
      const aIdStr = a.id.toString();
      console.log(`NewsDetail: Comparing author ID ${aIdStr} with ${authorIdStr}`);
      return aIdStr === authorIdStr;
    });

    if (author) {
      console.log('NewsDetail: Author found:', author);
      return author.name || author.username || 'Unknown';
    } else {
      console.log('NewsDetail: Author not found, returning Unknown');
      return 'Unknown';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow">
          {/* Hero Section Skeleton */}
          <div className="h-[240px] bg-navy animate-pulse" />
          {/* Content Skeleton */}
          <div className="container-lg py-16">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-48 bg-gray-200 rounded"></div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }



  if (error || !article) {
    // Error state - already logged in useEffect
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow">
          {/* Hero Section for Error */}
          <section className="pt-24 bg-navy text-white">
            <div className="container-lg py-24 text-center">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">Article Not Found</h1>
              <p className="text-lg text-white/90 max-w-3xl mx-auto">
                The article you're looking for doesn't exist or has been removed.
              </p>
              <Button asChild variant="outline" className="mt-8 text-white border-white hover:bg-white hover:text-navy">
                <Link to="/news">Return to News</Link>
              </Button>
            </div>
          </section>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="pt-24 bg-navy text-white">
          <div className="container-lg py-24">
            <div className="flex items-center gap-2 text-gold mb-6">
              <Link to="/news" className="hover:text-gold/80 transition-colors flex items-center gap-1">
                <ChevronLeft className="h-4 w-4" />
                Back to News
              </Link>
            </div>
            <div className="max-w-4xl">
              <h1 className="text-4xl md:text-5xl font-bold mb-6">{article.title}</h1>
              <div className="flex items-center text-sm text-white/80 gap-6">
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2" />
                  <span>{formatDate(article.published_at)}</span>
                </div>
                <div className="flex items-center">
                  <UserIcon className="h-4 w-4 mr-2" />
                  <span>
                    {article.authorName ||
                     (typeof article.author === 'object' && (article.author as any)?.name) ||
                     getAuthorName(article.author) ||
                     (typeof article.author === 'number' ? `Author ID: ${article.author}` : 'Unknown')}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Article Content */}
        <article className="py-16">
          <div className="container-lg">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left column: Content */}
              <div className="prose prose-lg max-w-none">
                {article.content}
              </div>

              {/* Right column: Image */}
              <div className="lg:sticky lg:top-8">
                {article.image && (
                  <div className="rounded-lg overflow-hidden shadow-lg">
                    <img
                      src={article.image}
                      alt={article.title}
                      className="w-full h-auto object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.onerror = null;
                        target.style.display = 'none';

                        // Create a gradient background div and append it to the parent
                        const parent = target.parentElement;
                        if (parent) {
                          const gradientDiv = document.createElement('div');
                          gradientDiv.className = "w-full h-64 bg-gradient-to-r from-navy to-blue-900 rounded-lg flex items-center justify-center";

                          // Add the article title
                          const titleDiv = document.createElement('div');
                          titleDiv.className = "text-white text-xl font-medium px-6 text-center";
                          titleDiv.textContent = article.title;

                          gradientDiv.appendChild(titleDiv);
                          parent.appendChild(gradientDiv);
                        }
                      }}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </article>
      </main>
      <Footer />
    </div>
  );
};

export default NewsDetail;






