import { useParams, Link } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ChevronLeft, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { productsService } from "@/lib/api-service";
import { Product } from "@/lib/types";
import { PlasticCardDetail } from "@/components/products/PlasticCardDetail";
import { SmartCardDetail } from "@/components/products/SmartCardDetail";

const ProductDetail = () => {
  // Get the product ID from the URL
  const { id } = useParams<{ id: string }>();

  // Fetch the product data
  const { data: product, isLoading, error } = useQuery({
    queryKey: ["product", id],
    queryFn: async () => {
      if (!id) throw new Error("Product ID is required");
      try {
        const result = await productsService.getById(id);
        return result;
      } catch (error) {
        console.error('ProductDetail: Error fetching product:', error);
        throw error;
      }
    },
    enabled: !!id,
    retry: 1,
    staleTime: 5 * 60 * 1000
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow pt-24">
          <div className="container-lg py-16">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
              <div className="h-64 bg-gray-200 rounded mb-6"></div>
              <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-4/6"></div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow">
          {/* Hero Section for Error */}
          <section className="pt-24 bg-navy text-white">
            <div className="container-lg py-24 text-center">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">Product Not Found</h1>
              <p className="text-lg text-white/90 max-w-3xl mx-auto">
                The product you're looking for doesn't exist or has been removed.
              </p>
              <Button asChild variant="outline" className="mt-8 text-white border-white hover:bg-white hover:text-navy">
                <Link to="/products">Return to Products</Link>
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
              <Link to="/products" className="hover:text-gold/80 transition-colors flex items-center gap-1">
                <ChevronLeft className="h-4 w-4" />
                Back to Products
              </Link>
            </div>
            <div className="max-w-4xl">
              <h1 className="text-4xl md:text-5xl font-bold mb-6">{product.name}</h1>
            </div>
          </div>
        </section>

        {/* Product Content */}
        <section className="py-16">
          <div className="container-lg">
            {/* Top section: Image and Key Features */}
            <div className="mb-12">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Image - takes up 2/3 of the width on large screens */}
                <div className="lg:col-span-2 flex items-center justify-center bg-white p-8 border rounded-lg shadow-sm h-[400px]">
                  {product.image ? (
                    <img
                      src={product.image}
                      alt={product.name}
                      className="max-w-full max-h-full object-contain"
                      onError={(e) => {
                        console.error("Error loading product image in detail view:", product.image);
                        console.log("Full product object:", product);
                        // Hide the image on error
                        (e.target as HTMLImageElement).style.display = 'none';

                        // Show product name instead
                        const parent = (e.target as HTMLImageElement).parentElement;
                        if (parent) {
                          const nameDiv = document.createElement('div');
                          nameDiv.className = "flex flex-col items-center justify-center text-gray-400 py-12";
                          nameDiv.innerHTML = `
                            <div class="text-6xl mb-4">📷</div>
                            <div class="text-xl">${product.name}</div>
                            <div class="text-md mt-2">No Image Available</div>
                          `;
                          parent.appendChild(nameDiv);
                        }
                      }}
                      onLoad={() => {
                        console.log("Successfully loaded detail image:", product.image);
                      }}
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-gray-400 py-12">
                      <div className="text-6xl mb-4">📷</div>
                      <div className="text-xl">{product.name}</div>
                      <div className="text-md mt-2">No Image Available</div>
                    </div>
                  )}
                </div>

                {/* Features - takes up 1/3 of the width on large screens */}
                <div className="bg-white p-6 border rounded-lg shadow-sm">
                  <h2 className="text-2xl font-bold mb-6 text-navy">Key Features</h2>

                  {Array.isArray(product.items) && product.items.length > 0 ? (
                    <ul className="space-y-3">
                      {product.items.map((item, idx) => (
                        <li key={idx} className="flex">
                          <Check className="h-5 w-5 text-gold shrink-0 mr-2" />
                          <span className="text-gray-700">{item}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-500 italic">No features specified for this product.</p>
                  )}

                  <div className="mt-6">
                    <Button asChild className="bg-navy hover:bg-navy/90 text-white w-full">
                      <Link to="/contact">Contact Us About This Product</Link>
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom section: Product Details */}
            <div>
              <h2 className="text-2xl font-bold mb-6 text-navy">Product Details</h2>

              {product.description && (
                <div>
                  {(product.id === 1 || product.id === "1" ||
                   (product.name && product.name.includes("Plastic Card"))) ? (
                    <PlasticCardDetail description={product.description} />
                  ) : (product.id === 3 || product.id === "3" ||
                   (product.name && product.name.includes("Smart Card") && !product.name.includes("Reader"))) ? (
                    <SmartCardDetail description={product.description} />
                  ) : (
                    <div className="bg-white p-6 border rounded-lg shadow-sm">
                      <h3 className="text-lg font-semibold mb-4">Description</h3>
                      <p className="text-gray-700">{product.description}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default ProductDetail;
