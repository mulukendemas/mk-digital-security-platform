import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import AdminLayout from "@/components/admin/AdminLayout";
import { solutionsService, solutionDescriptionService } from "@/lib/api-service";
import { Solution, SolutionDescription } from "@/lib/types";
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
import { Edit, Trash, Plus } from "lucide-react";
import { toast } from "sonner";
import SolutionForm from "@/components/admin/SolutionForm";
import SolutionDescriptionForm from "@/components/admin/SolutionDescriptionForm";
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

const SolutionsAdmin = () => {
  // Solution state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedSolution, setSelectedSolution] = useState<Solution | null>(null);

  // Solution Description state
  const [isDescriptionFormOpen, setIsDescriptionFormOpen] = useState(false);
  const [selectedDescription, setSelectedDescription] = useState<SolutionDescription | null>(null);

  const queryClient = useQueryClient();
  const { hasPermission } = useAuth();

  // Check if user has edit permissions
  const canEdit = hasPermission('editor');
  const canDelete = hasPermission('admin');

  // Solutions query
  const { data: solutions = [], isLoading: solutionsLoading, error: solutionsError } = useQuery({
    queryKey: ["solutions"],
    queryFn: async () => {
      const response = await solutionsService.getAll();
      // Transform the snake_case to camelCase
      return response.map((solution: any) => ({
        ...solution,
        createdAt: solution.created_at,
        updatedAt: solution.updated_at
      }));
    },
  });

  // Solution Descriptions query
  const { data: descriptions = [], isLoading: descriptionsLoading, error: descriptionsError, refetch: refetchDescriptions } = useQuery({
    queryKey: ["solution-descriptions"],
    queryFn: async () => {
      try {
        console.log('Fetching solution descriptions in SolutionsAdmin');
        const response = await solutionDescriptionService.getAll();
        console.log('Solution descriptions response in SolutionsAdmin:', response);

        // Ensure response is an array
        if (!Array.isArray(response)) {
          console.warn('Solution descriptions response is not an array:', response);
          return response ? [response] : [];
        }

        // Log each description for debugging
        if (response.length > 0) {
          console.log(`Found ${response.length} solution descriptions`);
          console.log(`First description:`, response[0]);
          console.log(`First description properties:`, Object.keys(response[0]));
        } else {
          console.log('No solution descriptions found');
        }

        // The service now handles the transformation, so we can return the response directly
        return response;
      } catch (error) {
        console.error('Error fetching solution descriptions:', error);
        // Return empty array instead of throwing to prevent breaking the UI
        return [];
      }
    },
    // Add retry options to handle temporary backend errors
    retry: 3,
    retryDelay: 1000,
    // Don't refetch on window focus to avoid unnecessary requests
    refetchOnWindowFocus: false,
  });

  // Handle errors outside the useQuery options
  useEffect(() => {
    if (solutionsError) {
      console.error("Error fetching solutions:", solutionsError);
      toast.error("Failed to load solutions");
    }
    if (descriptionsError) {
      console.error("Error fetching solution descriptions:", descriptionsError);
      toast.error("Failed to load solution descriptions");
    }
  }, [solutionsError, descriptionsError]);

  // Solution mutations
  const createMutation = useMutation({
    mutationFn: (solutionData: Omit<Solution, "id" | "createdAt" | "updatedAt">) => {
      return solutionsService.create(solutionData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["solutions"] });
      setIsFormOpen(false);
      setSelectedSolution(null);
      toast.success("Solution created successfully!");
    },
    onError: (error) => {
      console.error("Error creating solution:", error);
      toast.error("Failed to create solution");
    },
  });

  const updateMutation = useMutation({
    mutationFn: (solutionData: Solution) => {
      return solutionsService.update(solutionData.id, solutionData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["solutions"] });
      setIsFormOpen(false);
      setSelectedSolution(null);
      toast.success("Solution updated successfully!");
    },
    onError: (error) => {
      console.error("Error updating solution:", error);
      toast.error("Failed to update solution");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => {
      return solutionsService.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["solutions"] });
      toast.success("Solution deleted successfully!");
    },
    onError: (error) => {
      console.error("Error deleting solution:", error);
      toast.error("Failed to delete solution");
    },
  });

  const handleCreateSolution = (solutionData: Omit<Solution, "id" | "createdAt" | "updatedAt">) => {
    createMutation.mutate(solutionData);
  };

  const handleUpdateSolution = (solutionData: Omit<Solution, "id" | "createdAt" | "updatedAt">) => {
    if (!selectedSolution?.id) {
      toast.error("No solution selected for update");
      return;
    }

    updateMutation.mutate({
      ...solutionData,
      id: selectedSolution.id,
      createdAt: selectedSolution.createdAt,
      updatedAt: selectedSolution.updatedAt,
    });
  };

  const handleEditSolution = (solution: Solution) => {
    setSelectedSolution(solution);
    setIsFormOpen(true);
  };

  const handleDeleteSolution = (id: string) => {
    if (window.confirm("Are you sure you want to delete this solution?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleAddNew = () => {
    setSelectedSolution(null);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setSelectedSolution(null);
  };

  // Solution Description mutations
  const createDescriptionMutation = useMutation({
    mutationFn: (formData: FormData) => {
      console.log("Creating solution description with FormData");

      // Log FormData contents for debugging
      console.log('FormData entries:');
      for (const pair of formData.entries()) {
        if (pair[1] instanceof File) {
          console.log(`${pair[0]}: File(${(pair[1] as File).name}, ${(pair[1] as File).type}, ${(pair[1] as File).size} bytes)`);
        } else {
          console.log(`${pair[0]}: ${pair[1]}`);
        }
      }

      return solutionDescriptionService.create(formData);
    },
    onSuccess: (data) => {
      console.log("Solution description created successfully:", data);
      setIsDescriptionFormOpen(false);
      setSelectedDescription(null);
      toast.success("Solution description created successfully!");

      // Force a refetch to ensure we get the latest data
      queryClient.invalidateQueries({ queryKey: ["solution-descriptions"] });

      // Use the refetch function directly
      setTimeout(() => {
        refetchDescriptions();
      }, 1000);
    },
    onError: (error) => {
      console.error("Error creating solution description:", error);
      toast.error("Failed to create solution description");
    },
  });

  const updateDescriptionMutation = useMutation({
    mutationFn: (data: { id: string; formData: FormData }) => {
      console.log(`Updating solution description ${data.id} with FormData`);
      return solutionDescriptionService.update(data.id, data.formData);
    },
    onSuccess: (data) => {
      console.log("Solution description updated successfully:", data);
      setIsDescriptionFormOpen(false);
      setSelectedDescription(null);
      toast.success("Solution description updated successfully!");

      // Force a refetch to ensure we get the latest data
      queryClient.invalidateQueries({ queryKey: ["solution-descriptions"] });

      // Use the refetch function directly
      setTimeout(() => {
        refetchDescriptions();
      }, 1000);
    },
    onError: (error) => {
      console.error("Error updating solution description:", error);
      toast.error("Failed to update solution description");
    },
  });

  const deleteDescriptionMutation = useMutation({
    mutationFn: (id: string) => {
      return solutionDescriptionService.delete(id);
    },
    onSuccess: () => {
      toast.success("Solution description deleted successfully!");

      // Force a refetch to ensure we get the latest data
      queryClient.invalidateQueries({ queryKey: ["solution-descriptions"] });

      // Use the refetch function directly
      setTimeout(() => {
        refetchDescriptions();
      }, 1000);
    },
    onError: (error) => {
      console.error("Error deleting solution description:", error);
      toast.error("Failed to delete solution description");
    },
  });

  const handleCreateDescription = (formData: FormData) => {
    console.log("Handling create description with FormData");
    createDescriptionMutation.mutate(formData);
  };

  const handleUpdateDescription = (formData: FormData) => {
    if (selectedDescription && selectedDescription.id) {
      console.log("Handling update description with FormData");

      // Create a new object with the ID and FormData
      const updateData = {
        formData,
        id: selectedDescription.id
      };

      updateDescriptionMutation.mutate(updateData);
    } else {
      toast.error("Cannot update description: Missing ID");
    }
  };

  const handleDeleteDescription = (id: string) => {
    if (window.confirm("Are you sure you want to delete this solution description?")) {
      deleteDescriptionMutation.mutate(id);
    }
  };

  const handleCloseDescriptionForm = () => {
    setIsDescriptionFormOpen(false);
    setSelectedDescription(null);
  };

  if (solutionsError || descriptionsError) {
    return (
      <AdminLayout title="Solutions Management">
        <div className="bg-red-50 p-4 rounded-md">
          <p className="text-red-500">Error loading data</p>
          <p className="text-sm text-red-400">
            {solutionsError ? (solutionsError as any).message : ''}
            {descriptionsError ? (descriptionsError as any).message : ''}
          </p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Solutions Management">
      <Tabs defaultValue="solutions" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="solutions">Solutions</TabsTrigger>
          <TabsTrigger value="descriptions">Solution Descriptions</TabsTrigger>
        </TabsList>

        {/* Solutions Tab */}
        <TabsContent value="solutions">
          <div className="mb-6 flex justify-between items-center">
            <div>
              <h2 className="text-lg font-medium">Manage Solutions</h2>
              <p className="text-muted-foreground">
                Add, edit, or remove solutions
              </p>
            </div>
            {canEdit && (
              <Button onClick={handleAddNew} className="flex items-center gap-2">
                <Plus className="h-4 w-4" /> Add New Solution
              </Button>
            )}
          </div>

          {isFormOpen ? (
            <SolutionForm
              solution={selectedSolution}
              onSubmit={selectedSolution ? handleUpdateSolution : handleCreateSolution}
              onCancel={handleCloseForm}
            />
          ) : (
            <div className="bg-white rounded-md shadow">
              {solutionsLoading ? (
                <div className="p-8 text-center">
                  <p>Loading solutions...</p>
                </div>
              ) : (
                <Table>
                  <TableCaption>A list of solutions</TableCaption>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Features</TableHead>
                      <TableHead>Last Updated</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {solutions.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8">
                          No solutions found. Click "Add New Solution" to create one.
                        </TableCell>
                      </TableRow>
                    ) : (
                      solutions.map((solution) => (
                        <TableRow key={solution.id}>
                          <TableCell className="font-medium">{solution.title}</TableCell>
                          <TableCell className="max-w-md truncate">
                            {solution.description.length > 50
                              ? `${solution.description.substring(0, 50)}...`
                              : solution.description}
                          </TableCell>
                          <TableCell>
                            {solution.features && solution.features.length > 0 ? (
                              <div className="flex flex-wrap gap-1">
                                {solution.features.slice(0, 2).map((feature: string, i: number) => (
                                  <Badge key={i} variant="outline" className="mr-1">
                                    {feature}
                                  </Badge>
                                ))}
                                {solution.features.length > 2 && (
                                  <Badge variant="outline">+{solution.features.length - 2}</Badge>
                                )}
                              </div>
                            ) : (
                              <span className="text-muted-foreground">No features</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {formatDate(solution.updatedAt)}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              {canEdit && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleEditSolution(solution)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                              )}
                              {canDelete && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeleteSolution(solution.id)}
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

        {/* Solution Descriptions Tab */}
        <TabsContent value="descriptions">
          <div className="mb-6 flex justify-between items-center">
            <div>
              <h2 className="text-lg font-medium">Manage Solution Descriptions</h2>
              <p className="text-muted-foreground">
                Add, edit, or remove solution descriptions
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
            <SolutionDescriptionForm
              initialData={selectedDescription}
              onSubmit={selectedDescription ? handleUpdateDescription : handleCreateDescription}
              onCancel={handleCloseDescriptionForm}
            />
          ) : (
            <div className="bg-white rounded-md shadow">
              {descriptionsLoading ? (
                <div className="p-8 text-center">
                  <p>Loading solution descriptions...</p>
                </div>
              ) : (
                <Table>
                  <TableCaption>A list of solution descriptions</TableCaption>
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
                          No solution descriptions found. Click "Add New Description" to create one.
                        </TableCell>
                      </TableRow>
                    ) : (
                      Array.isArray(descriptions) ? descriptions.map((description) => (
                        <TableRow key={description.id}>
                          <TableCell className="font-medium">{description.title}</TableCell>
                          <TableCell className="max-w-md truncate">
                            {description.description.length > 100
                              ? `${description.description.substring(0, 100)}...`
                              : description.description}
                          </TableCell>
                          <TableCell>
                            {description.hero_image ? (
                              <div className="w-16 h-16 relative">
                                <img
                                  src={description.hero_image && description.hero_image.startsWith('/') && !description.hero_image.startsWith('//')
                                    ? `${import.meta.env.VITE_API_URL || ''}${description.hero_image}`
                                    : description.hero_image}
                                  alt="Hero"
                                  className="w-full h-full object-cover rounded"
                                  onError={(e) => {
                                    // Fall back to default image without logging
                                    (e.target as HTMLImageElement).src = "/images/default-market.jpg";
                                  }}
                                />
                              </div>
                            ) : (
                              <span className="text-gray-400">No image</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {formatDate(description.updatedAt || description.updated_at)}
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
                          <TableCell colSpan={5} className="text-center py-8">
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

export default SolutionsAdmin;
