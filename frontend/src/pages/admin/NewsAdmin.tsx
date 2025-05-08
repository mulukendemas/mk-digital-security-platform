import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import AdminLayout from "@/components/admin/AdminLayout";
import { newsService, userService, newsDescriptionService } from "@/lib/api-service";
import { NewsArticle, User, NewsDescription } from "@/lib/types";
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
import { Calendar, Edit, Trash, Plus } from "lucide-react";
import { toast } from "sonner";
import NewsForm from "@/components/admin/NewsForm";
import NewsDescriptionForm from "@/components/admin/NewsDescriptionForm";
import { useAuth } from "@/context/AuthContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const NewsAdmin = () => {
  // News Article state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<NewsArticle | null>(null);

  // News Description state
  const [isDescriptionFormOpen, setIsDescriptionFormOpen] = useState(false);
  const [selectedDescription, setSelectedDescription] = useState<NewsDescription | null>(null);

  const queryClient = useQueryClient();
  const { hasPermission } = useAuth();

  // Check if user has edit permissions
  const canEdit = hasPermission('editor');
  const canDelete = hasPermission('admin');

  // Add this function near the top of the component
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

  // Fetch articles with author details
  const { data: articles = [], isLoading: articlesLoading, error: articlesError } = useQuery({
    queryKey: ["news"],
    queryFn: async () => {
      const articles = await newsService.getAll();
      // Log the response to debug
      console.log('Fetched articles:', articles);
      return articles;
    },
  });

  // Fetch news descriptions
  const { data: descriptions = [], isLoading: descriptionsLoading, error: descriptionsError } = useQuery({
    queryKey: ["news-descriptions"],
    queryFn: async () => {
      try {
        const response = await newsDescriptionService.getAll();
        console.log('Fetched news descriptions:', response);

        // Ensure response is an array
        if (!Array.isArray(response)) {
          console.error('News descriptions response is not an array:', response);
          return [];
        }

        // Transform the snake_case to camelCase if needed
        return response.map((desc: any) => ({
          id: desc.id,
          title: desc.title,
          description: desc.description,
          hero_image: desc.hero_image,
          createdAt: desc.created_at,
          updatedAt: desc.updated_at
        }));
      } catch (error) {
        console.error('Error processing news descriptions:', error);
        return [];
      }
    },
  });

  // Fetch authors list
  const { data: authors = [] } = useQuery<User[]>({
    queryKey: ["users"],
    queryFn: async () => {
      const response = await userService.getAll();
      console.log('Fetched authors:', response); // Debug log
      return response;
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  // Handle errors outside the useQuery options
  useEffect(() => {
    if (articlesError) {
      console.error("Error fetching news articles:", articlesError);
      toast.error("Failed to load news articles");
    }
    if (descriptionsError) {
      console.error("Error fetching news descriptions:", descriptionsError);
      toast.error("Failed to load news descriptions");
    }
  }, [articlesError, descriptionsError]);

  // News Article mutations
  const createMutation = useMutation({
    mutationFn: (formData: FormData) => {
      return newsService.create(formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["news"] });
      toast.success("News article created successfully");
      handleCloseForm();
    },
    onError: (error: any) => {
      console.error('Create error:', error);

      // Improved error handling
      if (error.response?.data) {
        // Check for specific field errors
        const errorData = error.response.data;
        if (typeof errorData === 'object') {
          // Handle field-specific errors
          const fieldErrors = Object.entries(errorData)
            .map(([field, errors]) => `${field}: ${Array.isArray(errors) ? errors.join(', ') : errors}`)
            .join('\n');

          toast.error(`Failed to create news article:\n${fieldErrors}`);
          return;
        }
      }

      // Generic error handling
      const errorMessage = error.message || "Failed to create news article";
      try {
        // Try to parse the error message if it's a JSON string
        const parsedError = JSON.parse(errorMessage);
        if (parsedError.image) {
          toast.error(`Image error: ${parsedError.image[0]}`);
        } else {
          toast.error(JSON.stringify(parsedError));
        }
      } catch {
        toast.error(error.response?.data?.detail || errorMessage);
      }
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: FormData }) => {
      // Ensure the ID has a trailing slash
      const formattedId = id.toString().endsWith('/') ? id.toString() : `${id.toString()}/`;
      return newsService.update(formattedId, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["news"] });
      toast.success("News article updated successfully");
      handleCloseForm();
    },
    onError: (error: any) => {
      console.error('Update error:', error);

      // Improved error handling
      if (error.response?.data) {
        // Check for specific field errors
        const errorData = error.response.data;
        if (typeof errorData === 'object') {
          // Handle field-specific errors
          const fieldErrors = Object.entries(errorData)
            .map(([field, errors]) => `${field}: ${Array.isArray(errors) ? errors.join(', ') : errors}`)
            .join('\n');

          toast.error(`Failed to update news article:\n${fieldErrors}`);
          return;
        }
      }

      // Generic error handling
      const errorMessage = error.message || "Failed to update news article";
      try {
        // Try to parse the error message if it's a JSON string
        const parsedError = JSON.parse(errorMessage);
        if (parsedError.image) {
          toast.error(`Image error: ${parsedError.image[0]}`);
        } else {
          toast.error(JSON.stringify(parsedError));
        }
      } catch {
        toast.error(error.response?.data?.detail || errorMessage);
      }
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => newsService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["news"] });
      toast.success("News article deleted successfully");
    },
    onError: () => {
      toast.error("Failed to delete news article");
    },
  });

  const handleCreateArticle = (formData: FormData) => {
    try {
      // Validate required fields
      const requiredFields = ['title', 'content', 'author', 'published_at'];
      for (const field of requiredFields) {
        if (!formData.get(field)) {
          toast.error(`${field.replace('_', ' ')} is required`);
          return;
        }
      }

      // Log the original form data
      console.log('Original FormData entries:');
      for (const [key, value] of formData.entries()) {
        console.log(`${key}: ${value instanceof File ? `File: ${value.name}, ${value.type}, ${value.size} bytes` : value}`);
      }

      const modifiedFormData = new FormData();

      for (const [key, value] of formData.entries()) {
        if (key === 'author') {
          const authorId = formData.get('author');
          if (typeof authorId === 'string') {
            // Verify author exists
            const author = authors.find(a => a.id.toString() === authorId);
            if (!author) {
              toast.error('Invalid author selection');
              return;
            }
            modifiedFormData.append('author', authorId);
            console.log(`Added author to FormData: ${authorId}`);
          }
        } else if (key === 'published_at') {
          const date = new Date(value as string);
          if (isNaN(date.getTime())) {
            toast.error('Invalid publication date');
            return;
          }
          const isoDate = date.toISOString();
          modifiedFormData.append('published_at', isoDate);
          console.log(`Added published_at to FormData: ${isoDate}`);
        } else if (key === 'image') {
          if (value instanceof File && value.size > 0) {
            modifiedFormData.append('image', value);
            console.log(`Added image to FormData: ${value.name}, ${value.type}, ${value.size} bytes`);
          } else {
            console.log(`Skipped image: not a valid file or empty`);
          }
        } else {
          modifiedFormData.append(key, value as string);
          console.log(`Added ${key} to FormData: ${value}`);
        }
      }

      // Log the final form data
      console.log('Final FormData entries:');
      for (const [key, value] of modifiedFormData.entries()) {
        console.log(`${key}: ${value instanceof File ? `File: ${value.name}, ${value.type}, ${value.size} bytes` : value}`);
      }

      createMutation.mutate(modifiedFormData);
    } catch (error) {
      console.error('Error preparing form data:', error);
      toast.error('Failed to prepare article data');
    }
  };

  const handleUpdateArticle = (formData: FormData) => {
    try {
      if (!selectedArticle?.id) {
        toast.error("Invalid article selection");
        return;
      }

      // Log the original form data
      console.log('Original Update FormData entries:');
      for (const [key, value] of formData.entries()) {
        console.log(`${key}: ${value instanceof File ? `File: ${value.name}, ${value.type}, ${value.size} bytes` : value}`);
      }

      const modifiedFormData = new FormData();

      // Ensure all fields are included in the FormData
      const requiredFields = ['title', 'slug', 'excerpt', 'content', 'author', 'published_at'];

      for (const [key, value] of formData.entries()) {
        if (key === 'author') {
          const authorId = value.toString();
          const author = authors.find(a => a.id.toString() === authorId);
          if (!author) {
            toast.error('Invalid author selection');
            return;
          }
          modifiedFormData.append('author', authorId);
          console.log(`Added author to update FormData: ${authorId}`);
        } else if (key === 'published_at') {
          const date = new Date(value.toString());
          if (isNaN(date.getTime())) {
            toast.error('Invalid publication date');
            return;
          }
          const isoDate = date.toISOString();
          modifiedFormData.append('published_at', isoDate);
          console.log(`Added published_at to update FormData: ${isoDate}`);
        } else if (key === 'image') {
          if (value instanceof File && value.size > 0) {
            modifiedFormData.append('image', value);
            console.log(`Added image to update FormData: ${value.name}, ${value.type}, ${value.size} bytes`);
          } else {
            console.log(`Skipped image in update: not a valid file or empty`);
          }
        } else {
          // Ensure empty strings are not sent as undefined
          const stringValue = value?.toString() || '';
          modifiedFormData.append(key, stringValue);
          console.log(`Added ${key} to update FormData: ${stringValue}`);
        }
      }

      // Log the final form data
      console.log('Final Update FormData entries:');
      for (const [key, value] of modifiedFormData.entries()) {
        console.log(`${key}: ${value instanceof File ? `File: ${value.name}, ${value.type}, ${value.size} bytes` : value}`);
      }

      // Verify all required fields are present
      for (const field of requiredFields) {
        if (!modifiedFormData.has(field)) {
          console.error(`Missing required field: ${field}`);
          toast.error(`Missing required field: ${field}`);
          return;
        }
      }

      updateMutation.mutate({
        id: selectedArticle.id,
        data: modifiedFormData
      });
    } catch (error) {
      console.error('Error preparing form data:', error);
      toast.error('Failed to prepare article data');
    }
  };

  const handleEditArticle = (article: NewsArticle) => {
    // Add detailed logging to verify all fields
    console.log("Editing article with full details:", {
      id: article.id,
      title: article.title,
      slug: article.slug,
      excerpt: article.excerpt,
      content: article.content,
      image: article.image,
      author: article.author,
      publishedAt: article.published_at
    });

    setSelectedArticle(article);
    setIsFormOpen(true);
  };

  const handleDeleteArticle = (id: string) => {
    if (window.confirm("Are you sure you want to delete this news article?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleAddNew = () => {
    setSelectedArticle(null);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setSelectedArticle(null);
  };

  // Add this helper function to get author name
  const getAuthorName = (authorId: string | number | undefined) => {
    if (!authorId) return 'Unknown';
    const author = authors.find(a => a.id.toString() === authorId.toString());
    return author ? author.name || author.username : 'Unknown';
  };

  // News Description mutations
  const createDescriptionMutation = useMutation({
    mutationFn: (formData: FormData) => {
      console.log("Creating news description with FormData");
      // Log FormData contents for debugging
      for (const pair of formData.entries()) {
        if (pair[1] instanceof File) {
          console.log(`${pair[0]}: File(${(pair[1] as File).name}, ${(pair[1] as File).type}, ${(pair[1] as File).size} bytes)`);
        } else {
          console.log(`${pair[0]}: ${pair[1]}`);
        }
      }
      return newsDescriptionService.create(formData);
    },
    onSuccess: () => {
      // Invalidate and refetch the news descriptions query
      queryClient.invalidateQueries({ queryKey: ["news-descriptions"] });

      // Force a refetch of the news descriptions
      queryClient.refetchQueries({ queryKey: ["news-descriptions"] });

      // Close the form and clear the selection
      setIsDescriptionFormOpen(false);
      setSelectedDescription(null);

      toast.success("News description created successfully!");

      // Add a delay and refetch again to ensure the latest data is loaded
      setTimeout(() => {
        queryClient.refetchQueries({ queryKey: ["news-descriptions"] });
      }, 1000);
    },
    onError: (error) => {
      console.error("Error creating news description:", error);
      toast.error("Failed to create news description");
    },
  });

  const updateDescriptionMutation = useMutation({
    mutationFn: ({ id, formData }: { id: string, formData: FormData }) => {
      console.log(`Updating news description ${id} with FormData`);
      // Log FormData contents for debugging
      for (const pair of formData.entries()) {
        if (pair[1] instanceof File) {
          console.log(`${pair[0]}: File(${(pair[1] as File).name}, ${(pair[1] as File).type}, ${(pair[1] as File).size} bytes)`);
        } else {
          console.log(`${pair[0]}: ${pair[1]}`);
        }
      }
      return newsDescriptionService.update(id, formData);
    },
    onSuccess: () => {
      // Invalidate and refetch the news descriptions query
      queryClient.invalidateQueries({ queryKey: ["news-descriptions"] });

      // Force a refetch of the news descriptions
      queryClient.refetchQueries({ queryKey: ["news-descriptions"] });

      // Close the form and clear the selection
      setIsDescriptionFormOpen(false);
      setSelectedDescription(null);

      toast.success("News description updated successfully!");

      // Add a delay and refetch again to ensure the latest data is loaded
      setTimeout(() => {
        queryClient.refetchQueries({ queryKey: ["news-descriptions"] });
      }, 1000);
    },
    onError: (error) => {
      console.error("Error updating news description:", error);
      toast.error("Failed to update news description");
    },
  });

  const deleteDescriptionMutation = useMutation({
    mutationFn: (id: string) => {
      return newsDescriptionService.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["news-descriptions"] });
      toast.success("News description deleted successfully!");
    },
    onError: (error) => {
      console.error("Error deleting news description:", error);
      toast.error("Failed to delete news description");
    },
  });

  const handleCreateDescription = (formData: FormData) => {
    createDescriptionMutation.mutate(formData);
  };

  const handleUpdateDescription = (formData: FormData) => {
    if (selectedDescription && selectedDescription.id) {
      updateDescriptionMutation.mutate({
        id: selectedDescription.id,
        formData
      });
    } else {
      toast.error("Cannot update description: Missing ID");
    }
  };

  const handleDeleteDescription = (id: string) => {
    if (window.confirm("Are you sure you want to delete this news description?")) {
      deleteDescriptionMutation.mutate(id);
    }
  };

  const handleCloseDescriptionForm = () => {
    setIsDescriptionFormOpen(false);
    setSelectedDescription(null);
  };

  if (articlesError || descriptionsError) {
    return (
      <AdminLayout title="News Management">
        <div className="bg-red-50 p-4 rounded-md">
          <p className="text-red-500">Error loading data</p>
          <p className="text-sm text-red-400">
            {articlesError ? (articlesError as any).message : ''}
            {descriptionsError ? (descriptionsError as any).message : ''}
          </p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="News Management">
      <Tabs defaultValue="articles" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="articles">News Articles</TabsTrigger>
          <TabsTrigger value="descriptions">News Descriptions</TabsTrigger>
        </TabsList>

        {/* News Articles Tab */}
        <TabsContent value="articles">
          <div className="mb-6 flex justify-between items-center">
            <div>
              <h2 className="text-lg font-medium">Manage News Articles</h2>
              <p className="text-muted-foreground">
                Add, edit, or remove news articles
              </p>
            </div>
            {canEdit && (
              <Button onClick={handleAddNew} className="flex items-center gap-2">
                <Plus className="h-4 w-4" /> Add New Article
              </Button>
            )}
          </div>

          {isFormOpen ? (
            <NewsForm
              article={selectedArticle}
              authors={authors}
              onSubmit={selectedArticle ? handleUpdateArticle : handleCreateArticle}
              onCancel={handleCloseForm}
            />
          ) : (
            <div className="bg-white rounded-md shadow">
              {articlesLoading ? (
                <div className="p-8 text-center">
                  <p>Loading news articles...</p>
                </div>
              ) : (
                <Table>
                  <TableCaption>A list of news articles</TableCaption>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Author</TableHead>
                      <TableHead>Published Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {articles.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-8">
                          No news articles found. Click "Add New Article" to create one.
                        </TableCell>
                      </TableRow>
                    ) : (
                      articles.map((article: NewsArticle) => (
                        <TableRow key={article.id}>
                          <TableCell className="font-medium">{article.title}</TableCell>
                          <TableCell>
                            {article.authorName || getAuthorName(article.author)}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                              {formatDate(article.published_at)}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              {canEdit && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleEditArticle(article)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                              )}
                              {canDelete && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeleteArticle(article.id)}
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

        {/* News Descriptions Tab */}
        <TabsContent value="descriptions">
          <div className="mb-6 flex justify-between items-center">
            <div>
              <h2 className="text-lg font-medium">Manage News Descriptions</h2>
              <p className="text-muted-foreground">
                Add, edit, or remove news descriptions
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
            <NewsDescriptionForm
              initialData={selectedDescription}
              onSubmit={selectedDescription ? handleUpdateDescription : handleCreateDescription}
              onCancel={handleCloseDescriptionForm}
            />
          ) : (
            <div className="bg-white rounded-md shadow">
              {descriptionsLoading ? (
                <div className="p-8 text-center">
                  <p>Loading news descriptions...</p>
                </div>
              ) : (
                <Table>
                  <TableCaption>A list of news descriptions</TableCaption>
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
                          No news descriptions found. Click "Add New Description" to create one.
                        </TableCell>
                      </TableRow>
                    ) : (
                      Array.isArray(descriptions) && descriptions.map((description) => (
                        <TableRow key={description.id}>
                          <TableCell className="font-medium">{description.title || 'No Title'}</TableCell>
                          <TableCell className="max-w-md truncate">
                            {description.description
                              ? (description.description.length > 100
                                ? `${description.description.substring(0, 100)}...`
                                : description.description)
                              : 'No Description'}
                          </TableCell>
                          <TableCell>
                            {description.hero_image ? (
                              <div className="relative w-16 h-16 rounded overflow-hidden">
                                <img
                                  src={description.hero_image}
                                  alt="Hero"
                                  className="object-cover w-full h-full"
                                />
                              </div>
                            ) : (
                              <span className="text-gray-400 text-sm">No image</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {formatDate(description.updatedAt)}
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
                      ))
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

export default NewsAdmin;
