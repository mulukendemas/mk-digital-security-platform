
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import AdminLayout from "@/components/admin/AdminLayout";
import { productsService, productDescriptionService } from "@/lib/api-service";
import { Product, ProductDescription } from "@/lib/types";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash, Plus, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";
import ProductForm from "@/components/admin/ProductForm";
import ProductDescriptionForm from "@/components/admin/ProductDescriptionForm";
import { useAuth } from "@/context/AuthContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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

const ProductsAdmin = () => {
  // Product state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Product Description state
  const [isDescriptionFormOpen, setIsDescriptionFormOpen] = useState(false);
  const [selectedDescription, setSelectedDescription] = useState<ProductDescription | null>(null);

  const queryClient = useQueryClient();
  const { hasPermission } = useAuth();

  // Check if user has edit permissions
  const canEdit = hasPermission('editor');
  const canDelete = hasPermission('admin');

  // Products query
  const { data: products = [], isLoading: productsLoading, error: productsError } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      console.log("ProductsAdmin: Fetching products from backend...");
      const response = await productsService.getAll();
      console.log("ProductsAdmin: Raw products response:", response);

      // Transform the snake_case to camelCase
      const transformedProducts = response.map((product: any) => {
        console.log(`ProductsAdmin: Processing product ${product.id}:`, product);
        console.log(`ProductsAdmin: Image URL for product ${product.id}: ${product.image || 'No image'}`);

        // Test if the image URL is valid by creating a new Image object
        if (product.image) {
          const img = new Image();
          img.onload = () => console.log(`ProductsAdmin: Image loaded successfully: ${product.image}`);
          img.onerror = () => console.error(`ProductsAdmin: Image failed to load: ${product.image}`);
          img.src = product.image;
        }

        return {
          id: product.id,
          name: product.name,
          description: product.description || "",
          items: product.items,
          image: product.image || null,
          createdAt: product.created_at,
          updatedAt: product.updated_at
        };
      });

      console.log("ProductsAdmin: Transformed products:", transformedProducts);
      return transformedProducts;
    },
  });

  // Product Descriptions query
  const { data: descriptions = [], isLoading: descriptionsLoading, error: descriptionsError } = useQuery({
    queryKey: ["product-descriptions"],
    queryFn: async () => {
      try {
        const response = await productDescriptionService.getAll();
        console.log('Product descriptions response:', response);

        // Ensure response is an array
        if (!Array.isArray(response)) {
          console.warn('Product descriptions response is not an array:', response);
          return response ? [response] : [];
        }

        // Transform the snake_case to camelCase if needed
        return response.map((desc: any) => {
          console.log(`Processing description ${desc.id}:`, desc);

          // Log all properties of the description
          console.log("Description properties:");
          Object.keys(desc).forEach(key => {
            console.log(`${key}: ${desc[key]}`);
          });

          return {
            id: desc.id,
            title: desc.title || null,
            description: desc.description || null,
            hero_image: desc.hero_image || null,
            createdAt: desc.created_at || null,
            updatedAt: desc.updated_at || null
          };
        });
      } catch (error) {
        console.error('Error fetching product descriptions:', error);
        throw error;
      }
    },
  });

  const createMutation = useMutation({
    mutationFn: (newProduct: FormData | Omit<Product, "id" | "createdAt" | "updatedAt">) => {
      // Log the data being sent
      console.log("Creating product with data:", newProduct);

      // If it's FormData, log its contents
      if (newProduct instanceof FormData) {
        console.log("FormData contents:");
        for (const pair of newProduct.entries()) {
          if (pair[1] instanceof File) {
            console.log(`${pair[0]}: File(${(pair[1] as File).name}, ${(pair[1] as File).type}, ${(pair[1] as File).size} bytes)`);
          } else {
            console.log(`${pair[0]}: ${pair[1]}`);
          }
        }
      }

      // Don't set dates here - let the backend handle it
      return productsService.create(newProduct);
    },
    onSuccess: (data) => {
      console.log("Product created successfully, response:", data);
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("Product created successfully");
      handleCloseForm();
    },
    onError: (error: any) => {
      console.error("Error creating product:", error);
      console.error("Error details:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      toast.error(error.response?.data?.detail || "Failed to create product");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: FormData | Partial<Product> }) => {
      const formattedId = String(id).endsWith('/') ? String(id) : `${String(id)}/`;

      // Log the data being sent
      console.log(`Updating product ${id} with data:`, data);

      // If it's FormData, log its contents
      if (data instanceof FormData) {
        console.log("FormData contents:");
        for (const pair of data.entries()) {
          if (pair[1] instanceof File) {
            console.log(`${pair[0]}: File(${(pair[1] as File).name}, ${(pair[1] as File).type}, ${(pair[1] as File).size} bytes)`);
          } else {
            console.log(`${pair[0]}: ${pair[1]}`);
          }
        }
      }

      // Don't set updatedAt - let the backend handle it
      return productsService.update(formattedId, data);
    },
    onSuccess: (data) => {
      console.log("Product updated successfully, response:", data);
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("Product updated successfully");
      handleCloseForm();
    },
    onError: (error: any) => {
      console.error("Error updating product:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      toast.error(error.response?.data?.detail || "Failed to update product");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => productsService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("Product deleted successfully");
    },
    onError: () => {
      toast.error("Failed to delete product");
    },
  });

  const handleCreateProduct = (productData: FormData | Omit<Product, "id" | "createdAt" | "updatedAt">) => {
    createMutation.mutate(productData);
  };

  const handleUpdateProduct = (productData: FormData | Omit<Product, "id" | "createdAt" | "updatedAt">) => {
    if (selectedProduct) {
      updateMutation.mutate({ id: selectedProduct.id, data: productData });
    }
  };

  const handleEditProduct = (product: Product) => {
    setSelectedProduct(product);
    setIsFormOpen(true);
  };

  const handleDeleteProduct = (id: string) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleAddNew = () => {
    setSelectedProduct(null);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setSelectedProduct(null);
  };

  // Product Description mutations
  const createDescriptionMutation = useMutation({
    mutationFn: (formData: FormData) => {
      console.log("Creating product description with FormData");
      return productDescriptionService.create(formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["product-descriptions"] });
      setIsDescriptionFormOpen(false);
      setSelectedDescription(null);
      toast.success("Product description created successfully!");
    },
    onError: (error) => {
      console.error("Error creating product description:", error);
      toast.error("Failed to create product description");
    },
  });

  const updateDescriptionMutation = useMutation({
    mutationFn: ({ id, formData }: { id: string, formData: FormData }) => {
      console.log(`Updating product description ${id} with FormData`);

      // Log the FormData contents for debugging
      console.log('FormData entries in mutation:');
      for (const pair of formData.entries()) {
        if (pair[1] instanceof File) {
          console.log(`${pair[0]}: File(${(pair[1] as File).name}, ${(pair[1] as File).type}, ${(pair[1] as File).size} bytes)`);
        } else {
          console.log(`${pair[0]}: ${pair[1]}`);
        }
      }

      return productDescriptionService.update(id, formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["product-descriptions"] });
      setIsDescriptionFormOpen(false);
      setSelectedDescription(null);
      toast.success("Product description updated successfully!");
    },
    onError: (error) => {
      console.error("Error updating product description:", error);
      toast.error("Failed to update product description");
    },
  });

  const deleteDescriptionMutation = useMutation({
    mutationFn: (id: string) => {
      return productDescriptionService.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["product-descriptions"] });
      toast.success("Product description deleted successfully!");
    },
    onError: (error) => {
      console.error("Error deleting product description:", error);
      toast.error("Failed to delete product description");
    },
  });

  const handleCreateDescription = (formData: FormData) => {
    console.log("Handling create description with FormData");
    createDescriptionMutation.mutate(formData);
  };

  const handleUpdateDescription = (formData: FormData) => {
    if (selectedDescription && selectedDescription.id) {
      console.log(`Handling update description ${selectedDescription.id} with FormData`);
      updateDescriptionMutation.mutate({
        id: selectedDescription.id,
        formData
      });
    } else {
      toast.error("Cannot update description: Missing ID");
    }
  };

  const handleDeleteDescription = (id: string) => {
    if (window.confirm("Are you sure you want to delete this product description?")) {
      deleteDescriptionMutation.mutate(id);
    }
  };

  const handleCloseDescriptionForm = () => {
    setIsDescriptionFormOpen(false);
    setSelectedDescription(null);
  };

  if (productsError || descriptionsError) {
    return (
      <AdminLayout title="Products Management">
        <div className="bg-red-50 p-4 rounded-md">
          <p className="text-red-500">Error loading products</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Products Management">
      <Tabs defaultValue="products" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="descriptions">Product Descriptions</TabsTrigger>
        </TabsList>

        {/* Products Tab */}
        <TabsContent value="products">
          <div className="mb-6 flex justify-between items-center">
            <div>
              <h2 className="text-lg font-medium">Manage Products</h2>
              <p className="text-muted-foreground">
                Add, edit, or remove products from the catalog
              </p>
            </div>
            {canEdit && (
              <Button onClick={handleAddNew} className="flex items-center gap-2">
                <Plus className="h-4 w-4" /> Add New Product
              </Button>
            )}
          </div>

          {isFormOpen ? (
            <ProductForm
              product={selectedProduct}
              onSubmit={selectedProduct ? handleUpdateProduct : handleCreateProduct}
              onCancel={handleCloseForm}
            />
          ) : (
            <div className="bg-white rounded-md shadow">
              {productsLoading ? (
                <div className="p-8 text-center">
                  <p>Loading products...</p>
                </div>
              ) : (
                <Table>
                  <TableCaption>A list of products</TableCaption>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Image</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Items</TableHead>
                      <TableHead>Last Updated</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {products.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8">
                          No products found. Click "Add New Product" to create one.
                        </TableCell>
                      </TableRow>
                    ) : (
                      products.map((product) => (
                        <TableRow key={product.id}>
                          <TableCell>
                            <div className="w-16 h-16 flex items-center justify-center bg-gray-50 rounded overflow-hidden">
                              {/* All images are null, so always show the placeholder */}
                              <div className="text-gray-300 flex items-center justify-center">
                                <ImageIcon className="w-8 h-8" />
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="font-medium">{product.name}</TableCell>

                          <TableCell>
                            <div className="max-w-xs truncate">
                              {product.description ?
                                (product.description.length > 80 ?
                                  `${product.description.substring(0, 80)}...` :
                                  product.description) :
                                <span className="text-gray-400 italic">No description</span>
                              }
                            </div>
                          </TableCell>

                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {product.items && product.items.slice(0, 2).map((feature: string, i: number) => (
                                <Badge key={i} variant="outline" className="mr-1">
                                  {feature}
                                </Badge>
                              ))}
                              {product.items && product.items.length > 2 && (
                                <Badge variant="outline">+{product.items.length - 2}</Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            {formatDate(product.updatedAt)}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              {canEdit && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleEditProduct(product)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                              )}
                              {canDelete && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeleteProduct(product.id)}
                                >
                                  <Trash className="h-4 w-4" />
                                </Button>
                              )}
                              {!canEdit && !canDelete && (
                                <span className="text-xs text-gray-500 italic">View only</span>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              )}
            </div>
          )}
        </TabsContent>

        {/* Product Descriptions Tab */}
        <TabsContent value="descriptions">
          <div className="mb-6 flex justify-between items-center">
            <div>
              <h2 className="text-lg font-medium">Manage Product Descriptions</h2>
              <p className="text-muted-foreground">
                Add, edit, or remove product descriptions
              </p>
            </div>
            {canEdit && (
              <Button
                onClick={() => {
                  setSelectedDescription(null);
                  setIsDescriptionFormOpen(true);
                }}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" /> Add New Description
              </Button>
            )}
          </div>

          {isDescriptionFormOpen ? (
            <ProductDescriptionForm
              initialData={selectedDescription}
              onSubmit={selectedDescription ? handleUpdateDescription : handleCreateDescription}
              onCancel={handleCloseDescriptionForm}
            />
          ) : (
            <div className="bg-white rounded-md shadow">
              {descriptionsLoading ? (
                <div className="p-8 text-center">
                  <p>Loading product descriptions...</p>
                </div>
              ) : (
                <Table>
                  <TableCaption>A list of product descriptions</TableCaption>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Hero Image</TableHead>
                      <TableHead>Last Updated</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {!descriptions || descriptions.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8">
                          No product descriptions found. Click "Add New Description" to create one.
                        </TableCell>
                      </TableRow>
                    ) : (
                      Array.isArray(descriptions) ? descriptions.map((description) => (
                        <TableRow key={description.id}>
                          <TableCell className="font-medium">{description.title || <span className="text-gray-400 italic">No title</span>}</TableCell>
                          <TableCell className="max-w-md truncate">
                            {description.description ? (
                              description.description.length > 100
                                ? `${description.description.substring(0, 100)}...`
                                : description.description
                            ) : (
                              <span className="text-gray-400 italic">No description</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {description.hero_image ? (
                              <div className="w-16 h-16 relative">
                                <img
                                  src={description.hero_image}
                                  alt="Hero"
                                  className="w-full h-full object-cover rounded"
                                  onError={(e) => {
                                    console.error("Error loading hero image in admin:", e);
                                    (e.target as HTMLImageElement).src = "/placeholder-product.svg";
                                  }}
                                />
                                <div className="mt-1 text-xs text-gray-500 truncate max-w-[100px]">
                                  {description.hero_image}
                                </div>
                              </div>
                            ) : (
                              <span className="text-gray-400">No image</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {description.updatedAt ? formatDate(description.updatedAt) : 'N/A'}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end space-x-2">
                              {canEdit && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedDescription(description);
                                    setIsDescriptionFormOpen(true);
                                  }}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                              )}
                              {canDelete && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeleteDescription(description.id!)}
                                >
                                  <Trash className="h-4 w-4" />
                                </Button>
                              )}
                              {!canEdit && !canDelete && (
                                <span className="text-xs text-gray-500 italic">View only</span>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      )) : (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center py-8">
                            Error: Invalid data format for descriptions.
                          </TableCell>
                        </TableRow>
                      )
                    )}
                  </TableBody>
                </Table>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </AdminLayout>
  );
};

export default ProductsAdmin;








