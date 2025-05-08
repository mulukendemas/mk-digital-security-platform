import React, { useState, useEffect } from 'react';
import AdminLayout from "@/components/admin/AdminLayout";
import { productsService } from '@/lib/api-service';
import { fixImageUrl } from '@/lib/api-service';

const ImageTest = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const data = await productsService.getAll();
        console.log('Raw products data:', data);
        setProducts(data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching products:', err);
        setError('Failed to load products');
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return (
    <AdminLayout title="Image Test">
      <div className="space-y-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Product Image Status</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Image</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created At</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Updated At</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {products.map(product => (
                  <tr key={product.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{product.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {product.image ? (
                        <span className="text-green-500">Available</span>
                      ) : (
                        <span className="text-red-500">NULL</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(product.created_at).toLocaleString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(product.updated_at).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Raw Product Data</h2>
          <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-60 text-xs">
            {JSON.stringify(products, null, 2)}
          </pre>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Image URL Test</h2>

          {loading ? (
            <p>Loading products...</p>
          ) : error ? (
            <p className="text-red-500">{error}</p>
          ) : (
            <div className="space-y-8">
              {products.map(product => (
                <div key={product.id} className="mb-8 border-b pb-8">
                  <h3 className="text-lg font-medium mb-2">{product.name}</h3>

                  {product.image ? (
                    <div className="space-y-6">
                      <div>
                        <h4 className="font-medium mb-2">Original URL</h4>
                        <p className="text-sm mb-2 break-all">{product.image}</p>
                        <div className="border p-4 bg-gray-50 h-40 flex items-center justify-center">
                          <img
                            src={product.image}
                            alt={`${product.name} - Original URL`}
                            className="max-h-full max-w-full object-contain"
                            onError={(e) => {
                              console.error(`Error loading image with original URL: ${product.image}`);
                              (e.target as HTMLImageElement).classList.add('opacity-30');
                            }}
                            onLoad={() => {
                              console.log(`Successfully loaded image with original URL: ${product.image}`);
                            }}
                          />
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium mb-2">Direct Media URL</h4>
                        <p className="text-sm mb-2 break-all">{`http://localhost:8000/media/${(product.image || '').replace(/^.*\/media\//, '')}`}</p>
                        <div className="border p-4 bg-gray-50 h-40 flex items-center justify-center">
                          <img
                            src={`http://localhost:8000/media/${(product.image || '').replace(/^.*\/media\//, '')}`}
                            alt={`${product.name} - Direct Media URL`}
                            className="max-h-full max-w-full object-contain"
                            onError={(e) => {
                              console.error(`Error loading image with direct media URL: http://localhost:8000/media/${(product.image || '').replace(/^.*\/media\//, '')}`);
                              (e.target as HTMLImageElement).classList.add('opacity-30');
                            }}
                            onLoad={() => {
                              console.log(`Successfully loaded image with direct media URL: http://localhost:8000/media/${(product.image || '').replace(/^.*\/media\//, '')}`);
                            }}
                          />
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium mb-2">Relative Media URL</h4>
                        <p className="text-sm mb-2 break-all">{`/media/${(product.image || '').replace(/^.*\/media\//, '')}`}</p>
                        <div className="border p-4 bg-gray-50 h-40 flex items-center justify-center">
                          <img
                            src={`/media/${(product.image || '').replace(/^.*\/media\//, '')}`}
                            alt={`${product.name} - Relative Media URL`}
                            className="max-h-full max-w-full object-contain"
                            onError={(e) => {
                              console.error(`Error loading image with relative media URL: /media/${(product.image || '').replace(/^.*\/media\//, '')}`);
                              (e.target as HTMLImageElement).classList.add('opacity-30');
                            }}
                            onLoad={() => {
                              console.log(`Successfully loaded image with relative media URL: /media/${(product.image || '').replace(/^.*\/media\//, '')}`);
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p>No image available</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default ImageTest;
