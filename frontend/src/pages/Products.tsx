import { useMemo, useEffect } from "react";
import { Link } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { productsService, productDescriptionService } from "@/lib/api-service";
import { useQuery } from "@tanstack/react-query";
import { Product as ProductType, ProductDescription } from "@/lib/types";

// Define a type for the product item with flexible id type
interface ProductItem extends Omit<ProductType, 'id'> {
  id: string | number;
}

const Products = () => {
  // Get category from URL query parameter
  const searchParams = new URLSearchParams(window.location.search);
  const categoryParam = searchParams.get('category');
  // Fetch product descriptions
  const { data: productDescription, isLoading: descriptionLoading } = useQuery<ProductDescription>({
    queryKey: ["product-descriptions"],
    queryFn: async () => {
      const data = await productDescriptionService.getAll();
      console.log("Product description data:", data);

      // Return the first description or null if none exists
      const description = data.length > 0 ? data[0] : null;

      console.log("Using product description:", description);
      return description;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Fetch products
  const { data: allProducts = [], isLoading: productsLoading, error: productsError } = useQuery<ProductItem[]>({
    queryKey: ["products"],
    queryFn: async () => {
      console.log("Fetching products from backend...");
      const products = await productsService.getAll();
      console.log("Raw products data received:", products);

      // Log each product's image URL for debugging
      products.forEach((product: ProductItem, index: number) => {
        console.log(`Product ${index + 1} (${product.id}): ${product.name}`);
        console.log(`  - Image URL: ${product.image || 'No image'}`);
        if (product.image) {
          // Test if the image URL is valid by creating a new Image object
          const img = new Image();
          img.onload = () => console.log(`  - Image loaded successfully: ${product.image}`);
          img.onerror = () => console.error(`  - Image failed to load: ${product.image}`);
          img.src = product.image;
        }
      });

      return products;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Filter products by category if a category parameter is present
  const products = useMemo(() => {
    if (!categoryParam) return allProducts;

    // Map URL category parameters to potential product name matches
    const categoryMap: Record<string, string[]> = {
      'plastic-card': ['plastic card', 'plastic cards'],
      'smart-card': ['smart card', 'smart cards'],
      'smart-card-reader': ['smart card reader', 'card reader', 'reader'],
      'card-issuance-systems': ['card issuance', 'issuance system', 'card system'],
      'security-devices': ['security device', 'security']
    };

    const matchTerms = categoryMap[categoryParam] || [];

    return allProducts.filter(product => {
      // Check if product name contains any of the match terms
      const productNameLower = product.name.toLowerCase();
      return matchTerms.some(term => productNameLower.includes(term.toLowerCase()));
    });
  }, [allProducts, categoryParam]);

  // Check if products array is empty
  const hasProducts = products && products.length > 0;
  const loading = descriptionLoading || productsLoading;
  const error = productsError ? "Failed to load products" : null;

  // Log the hero image URL for debugging
  console.log("Product description:", productDescription);
  console.log("Hero image URL:", productDescription?.hero_image);

  // Log all properties of the product description
  if (productDescription) {
    console.log("Product description properties:");
    Object.keys(productDescription).forEach(key => {
      console.log(`${key}: ${(productDescription as any)[key]}`);
    });
  }

  // Check if the hero image URL is valid
  useEffect(() => {
    if (productDescription?.hero_image) {
      // Create a new image element to test if the URL is valid
      const img = new Image();
      img.onload = () => {
        console.log("Hero image loaded successfully:", productDescription.hero_image);
      };
      img.onerror = () => {
        console.error("Hero image failed to load:", productDescription.hero_image);
      };
      img.src = productDescription.hero_image;
    }
  }, [productDescription?.hero_image]);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-grow">
        {/* Dynamic Hero Section - Responsive for mobile devices */}
        <section className="pt-16 md:pt-24 text-white relative overflow-hidden">
          <div className="w-full relative" style={{ height: 'auto', maxHeight: '70vh', marginBottom: '-20px' }}>
            {productDescription?.hero_image ? (
              <div className="relative w-full h-full">
                <img
                  src={productDescription.hero_image}
                  alt="Products"
                  className="w-full h-auto object-cover object-center"
                  style={{
                    maxWidth: '100%',
                    display: 'block',
                    margin: '0 auto'
                  }}
                  onError={(e) => {
                    console.error("Error loading hero image:", productDescription.hero_image);
                    console.log("Product description:", productDescription);
                    // Hide the image on error
                    (e.target as HTMLImageElement).style.display = 'none';

                    // Create a gradient background div and append it to the parent
                    const parent = (e.target as HTMLImageElement).parentElement;
                    if (parent) {
                      const gradientDiv = document.createElement('div');
                      gradientDiv.className = "w-full h-64 bg-gradient-to-r from-navy to-blue-900";
                      parent.appendChild(gradientDiv);
                    }
                  }}
                  onLoad={() => {
                    console.log("Successfully loaded hero image:", productDescription.hero_image);
                  }}
                />
                {/* Add a subtle overlay for better text readability on mobile */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/10 to-black/30 md:bg-transparent"></div>
              </div>
            ) : (
              <div className="w-full h-48 sm:h-56 md:h-64 bg-gradient-to-r from-navy to-blue-900"></div>
            )}
          </div>
          <div className="container-lg py-4 md:py-8 text-center relative z-10">
            {descriptionLoading ? (
              <div className="animate-pulse">
                <div className="h-8 md:h-12 bg-white/30 rounded w-1/2 mx-auto mb-4 md:mb-6"></div>
                <div className="h-3 md:h-4 bg-white/30 rounded w-3/4 mx-auto mb-2"></div>
                <div className="h-3 md:h-4 bg-white/30 rounded w-2/3 mx-auto"></div>
              </div>
            ) : (
              /* Removed semi-transparent container to ensure no text is covered */
              <></>
            )}
          </div>
        </section>

        {/* Products section with sidebar and improved layout */}
        <section className="py-8 -mt-4">
          <div className="container-lg">
            <div className="flex flex-col md:flex-row gap-8">
              {/* Sidebar with product categories */}
              <div className="w-full md:w-64 shrink-0">
                <h2 className="text-xl font-bold mb-4 text-navy uppercase">PRODUCTS</h2>
                <div className="border-t border-gray-200">
                  <ul className="space-y-1 mt-4">
                    <li className="py-2 border-b border-gray-100">
                      <a
                        href="/products"
                        className={`${!categoryParam ? 'text-navy font-medium' : 'text-gray-700'} hover:text-navy transition-colors`}
                      >
                        All Products
                      </a>
                    </li>
                    <li className="py-2 border-b border-gray-100">
                      <a
                        href="/products?category=plastic-card"
                        className={`${categoryParam === 'plastic-card' ? 'text-navy font-medium' : 'text-gray-700'} hover:text-navy transition-colors`}
                      >
                        Plastic card
                      </a>
                    </li>
                    <li className="py-2 border-b border-gray-100">
                      <a
                        href="/products?category=smart-card"
                        className={`${categoryParam === 'smart-card' ? 'text-navy font-medium' : 'text-gray-700'} hover:text-navy transition-colors`}
                      >
                        Smart card
                      </a>
                    </li>
                    <li className="py-2 border-b border-gray-100">
                      <a
                        href="/products?category=smart-card-reader"
                        className={`${categoryParam === 'smart-card-reader' ? 'text-navy font-medium' : 'text-gray-700'} hover:text-navy transition-colors`}
                      >
                        Smart card reader
                      </a>
                    </li>
                    <li className="py-2 border-b border-gray-100">
                      <a
                        href="/products?category=card-issuance-systems"
                        className={`${categoryParam === 'card-issuance-systems' ? 'text-navy font-medium' : 'text-gray-700'} hover:text-navy transition-colors`}
                      >
                        Card issuance systems
                      </a>
                    </li>
                    <li className="py-2 border-b border-gray-100">
                      <a
                        href="/products?category=security-devices"
                        className={`${categoryParam === 'security-devices' ? 'text-navy font-medium' : 'text-gray-700'} hover:text-navy transition-colors`}
                      >
                        Security devices
                      </a>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Main content area */}
              <div className="flex-1">
                <h2 className="text-2xl font-bold mb-8 text-navy">
                  {categoryParam ? (
                    <>
                      {categoryParam === 'plastic-card' && 'Plastic Cards'}
                      {categoryParam === 'smart-card' && 'Smart Cards'}
                      {categoryParam === 'smart-card-reader' && 'Smart Card Readers'}
                      {categoryParam === 'card-issuance-systems' && 'Card Issuance Systems'}
                      {categoryParam === 'security-devices' && 'Security Devices'}
                    </>
                  ) : 'All Products'}
                </h2>

                {loading ? (
                  <div className="text-center py-12">
                    <div className="animate-spin h-8 w-8 border-4 border-navy border-t-transparent rounded-full mx-auto mb-4"></div>
                    <p>Loading products...</p>
                  </div>
                ) : error ? (
                  <div className="text-center py-12 text-red-500">
                    {error}
                  </div>
                ) : !hasProducts ? (
                  <div className="text-center py-12">
                    <p>No products available at the moment.</p>
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {products.map((product: ProductItem) => (
                      <div
                        key={product.id.toString()}
                        className="border rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow flex flex-col group cursor-pointer"
                        onClick={() => {
                          const url = `/product/${product.id}`;
                          window.location.href = url;
                        }}>
                        <div className="p-4 flex items-center justify-center bg-white h-48">
                          {product.image ? (
                            <img
                              src={product.image}
                              alt={product.name}
                              className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
                              onError={(e) => {
                                console.error("Error loading product image:", product.image);
                                console.log("Product object:", product);
                                // Hide the image on error
                                (e.target as HTMLImageElement).style.display = 'none';
                                // Show product name instead
                                const parent = (e.target as HTMLImageElement).parentElement;
                                if (parent) {
                                  const nameDiv = document.createElement('div');
                                  nameDiv.className = "flex flex-col items-center justify-center text-gray-700";
                                  nameDiv.innerHTML = `<div class="text-sm font-medium">${product.name}</div>`;
                                  parent.appendChild(nameDiv);
                                }
                              }}
                              onLoad={() => {
                                console.log("Successfully loaded image:", product.image);
                              }}
                            />
                          ) : (
                            <div className="flex flex-col items-center justify-center text-gray-700">
                              <div className="text-sm font-medium">{product.name}</div>
                            </div>
                          )}
                        </div>
                        <div className="p-4 bg-white border-t">
                          <h3 className="text-lg font-semibold text-center mb-2 group-hover:text-navy transition-colors">{product.name}</h3>
                          <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                            {product.id === 1 || (product.name && product.name.includes("Plastic Card")) ||
                             product.id === 3 || (product.name && product.name.includes("Smart Card") && !product.name.includes("Reader"))
                              ? (product.description && product.description.length > 100
                                  ? product.description.substring(0, 100).split('\n')[0] + '...'
                                  : product.description)
                              : (product.description ||
                                (Array.isArray(product.items) && product.items.length > 0
                                  ? product.items[0]
                                  : ""))}
                          </p>
                          <div className="mt-auto text-center">
                            <Link
                              to={`/product/${product.id}`}
                              className="inline-block px-4 py-2 bg-white border border-navy text-navy rounded hover:bg-navy hover:text-white transition-colors"
                              onClick={(e) => {
                                e.stopPropagation(); // Prevent the parent onClick from firing
                              }}
                            >
                              Read more
                            </Link>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
};

export default Products;


