import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { solutionsService } from "@/lib/api-service";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ShieldCheck, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { FinancialCardIssuanceDetail } from "@/components/solutions/FinancialCardIssuanceDetail";
import { IdentificationSolutionDetail } from "@/components/solutions/IdentificationSolutionDetail";

const SolutionDetail = () => {
  // Get the solution ID from the URL
  const { id } = useParams<{ id: string }>();

  // Fetch the solution data
  const { data: solution, isLoading, error } = useQuery({
    queryKey: ["solution", id],
    queryFn: async () => {
      if (!id) throw new Error("Solution ID is required");
      try {
        console.log("SolutionDetail: Fetching solution with ID:", id);
        const result = await solutionsService.getById(id);
        console.log("SolutionDetail: Fetched solution data:", result);
        console.log("SolutionDetail: Solution ID type:", typeof result.id);

        // Check if this is the Financial Card Issuance solution
        if (result.id === 2 || result.id === "2" ||
            (result.title && result.title.includes("Financial Card Issuance"))) {
          console.log("SolutionDetail: This is the Financial Card Issuance solution!");
        }

        return result;
      } catch (error) {
        console.error('SolutionDetail: Error fetching solution:', error);
        throw error;
      }
    },
    enabled: !!id,
    retry: 1,
    staleTime: 5 * 60 * 1000
  });

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="pt-24 pb-12 bg-navy text-white">
          <div className="container-lg">
            {isLoading ? (
              <div className="animate-pulse">
                <div className="h-12 bg-white/30 rounded w-1/2 mx-auto mb-6"></div>
                <div className="h-4 bg-white/30 rounded w-3/4 mx-auto mb-2"></div>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <h1 className="text-2xl font-bold mb-4">Error Loading Solution</h1>
                <p className="text-red-300">We couldn't load the solution details. Please try again later.</p>
                <Button asChild className="mt-6">
                  <Link to="/solutions">Back to Solutions</Link>
                </Button>
              </div>
            ) : solution ? (
              <div className="text-center">
                <h1 className="text-4xl md:text-5xl font-bold mb-6">{solution.title}</h1>
                {/* Debug info - only visible in development */}
                
              </div>
            ) : (
              <div className="text-center py-12">
                <h1 className="text-2xl font-bold mb-4">Solution Not Found</h1>
                <p>The solution you're looking for doesn't exist or has been removed.</p>
                <Button asChild className="mt-6">
                  <Link to="/solutions">Back to Solutions</Link>
                </Button>
              </div>
            )}
          </div>
        </section>

        {/* Solution Content */}
        {solution && (
          <section className="py-16">
            <div className="container-lg">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                {/* Solution Image */}
                <div className="bg-light-blue rounded-xl p-8 h-80 flex items-center justify-center">
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
                        <ShieldCheck />
                      </div>
                    </div>
                  )}
                </div>

                {/* Solution Details */}
                <div>
                  <h2 className="text-3xl font-bold text-mkdss-blue mb-6">Key Features</h2>
                  <Card className="mb-6 border-none shadow-md">
                    <CardContent className="p-6">
                      <ul className="space-y-4">
                        {solution.features && solution.features.length > 0 ? (
                          solution.features.map((feature: string, idx: number) => (
                            <li key={idx} className="flex items-start">
                              <ShieldCheck className="h-5 w-5 text-gold shrink-0 mr-3 mt-0.5" />
                              <span>{feature}</span>
                            </li>
                          ))
                        ) : (
                          <li className="text-gray-500">No features specified for this solution.</li>
                        )}
                      </ul>
                    </CardContent>
                  </Card>

                  <div className="mt-8 flex flex-wrap gap-4">
                    <Button asChild>
                      <Link to="/contact">Contact Us About This Solution</Link>
                    </Button>
                    <Button
                      asChild
                      variant="outline"
                      className="text-mkdss-blue hover:text-mkdss-blue/80 hover:bg-light-blue/50 border-mkdss-blue/30"
                    >
                      <Link to="/solutions" className="flex items-center gap-2">
                        <ArrowRight className="h-4 w-4 rotate-180" /> Back to All Solutions
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>

              {/* Additional Information */}
              <div className="mt-16">
                <h2 className="text-3xl font-bold text-mkdss-blue mb-6">About This Solution</h2>
                <div className="prose prose-lg max-w-none">
                  {(solution.id === 2 || solution.id === "2" ||
                   (solution.title && solution.title.includes("Financial Card Issuance"))) ? (
                    <FinancialCardIssuanceDetail description={solution.description} />
                  ) : (solution.id === 1 || solution.id === "1" ||
                   (solution.title && solution.title.includes("Identification"))) ? (
                    <IdentificationSolutionDetail description={solution.description} />
                  ) : (
                    <p className="text-gray-700">
                      {solution.description || "No additional information available for this solution."}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </section>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default SolutionDetail;
