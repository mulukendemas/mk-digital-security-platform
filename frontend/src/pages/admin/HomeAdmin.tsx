import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from '@/lib/api-adapter';
import AdminLayout from "@/components/admin/AdminLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash, Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useAuth } from "@/context/AuthContext";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { HeroSection, Feature, TargetMarket, WhyChooseUs } from "@/lib/types";
import { HeroForm } from "@/components/admin/home/HeroForm";
import { FeaturesForm } from "@/components/admin/home/FeaturesForm";
import { TargetMarketsForm } from "@/components/admin/home/TargetMarketsForm";
//import { WhyChooseUsForm } from "@/components/admin/home/WhyChooseUsForm";
import { toast } from "sonner";
import { WhyChooseUsForm } from "@/components/admin/home/WhyChooseUsForm";



export default function HomeAdmin() {
  const queryClient = useQueryClient();
  const { hasPermission } = useAuth();

  // Role-based permissions
  const { user } = useAuth();
  const canEdit = hasPermission('editor');
  const canDelete = hasPermission('admin');

  // Editor-specific permissions
  const isEditor = user?.role === 'editor';

  const [isHeroFormOpen, setIsHeroFormOpen] = useState(false);
  const [isFeatureFormOpen, setIsFeatureFormOpen] = useState(false);
  const [isMarketFormOpen, setIsMarketFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [isWhyChooseUsFormOpen, setIsWhyChooseUsFormOpen] = useState(false);
  // This state is used in the Hero section
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [editingHero, setEditingHero] = useState<HeroSection | null>(null);

  // Query for fetching hero data - get the latest record
  const { data: heroData, isLoading: isHeroLoading } = useQuery({
    queryKey: ["hero-section"],
    queryFn: async () => {
      const response = await apiClient.get("/hero-section/");
      console.log('HomeAdmin - All hero sections:', response.data);

      // Get the latest hero section (highest ID)
      if (response.data && response.data.length > 0) {
        // Sort by ID in descending order
        const sortedData = [...response.data].sort((a, b) => b.id - a.id);
        console.log('HomeAdmin - Latest hero section:', sortedData[0]);
        return sortedData[0];
      }

      return null;
    },
  });

  const { data: features } = useQuery({
    queryKey: ["features"],
    queryFn: async () => {
      const response = await apiClient.get("/features/");
      return response.data;
    },
  });

  const { data: markets } = useQuery({
    queryKey: ["target-markets"],
    queryFn: async () => {
      const response = await apiClient.get("/target-markets/");
      return response.data;
    },
  });

  // Mutation for creating/updating hero section
  const heroMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      // Use the standard URL format
      const url = heroData?.id
        ? `/hero-section/${heroData.id}/`
        : "/hero-section/";

      // Use PATCH for updates to avoid CORS issues
      const method = heroData?.id ? 'patch' : 'post';

      console.log(`HomeAdmin - Sending ${method.toUpperCase()} request to ${url}`);
      console.log('HomeAdmin - FormData entries being sent:');
      for (const pair of formData.entries()) {
        if (pair[1] instanceof File) {
          console.log(`${pair[0]}: File(${(pair[1] as File).name}, ${(pair[1] as File).type}, ${(pair[1] as File).size} bytes)`);
        } else {
          console.log(`${pair[0]}: ${pair[1]}`);
        }
      }

      try {
        // Clear any cached images before making the request
        if (heroData?.background_image) {
          const img = new Image();
          img.src = `${heroData.background_image}?_t=${new Date().getTime()}`;
        }

        // Use a completely different approach - direct manipulation
        let response;

        // Add a unique identifier to the form data to ensure the backend treats it as a new file
        if (formData.has('background_image_file')) {
          console.log('HomeAdmin - Form data has background_image_file');

          // Get the current timestamp for a unique filename
          const timestamp = new Date().getTime();

          // Create a completely new FormData object
          const newFormData = new FormData();

          // Copy all fields except background_image_file
          for (const pair of formData.entries()) {
            if (pair[0] !== 'background_image_file') {
              newFormData.append(pair[0], pair[1]);
            }
          }

          // Get the background_image_file
          const imageFile = formData.get('background_image_file') as File;

          if (imageFile) {
            // Create a new filename with timestamp
            const fileExtension = imageFile.name.split('.').pop();
            const newFileName = `hero_image_${timestamp}.${fileExtension}`;

            // Create a new File object with the new name
            const newFile = new File([imageFile], newFileName, {
              type: imageFile.type,
              lastModified: imageFile.lastModified
            });

            console.log('HomeAdmin - Created new file with name:', newFileName);

            // Add the new file to the form data with the correct field name
            newFormData.append('background_image_file', newFile);
          }

          // Use the new form data
          formData = newFormData;
        }

        // Create a completely new approach - direct API call with hardcoded image
        console.log('HomeAdmin - Using direct API call approach');

        // Extract the form data values
        const title = formData.get('title') as string;
        const description = formData.get('description') as string;
        const button_text = formData.get('button_text') as string;
        const button_link = formData.get('button_link') as string;

        // Check if there's an image in the form data
        const hasImage = formData.has('background_image_file');
        console.log('HomeAdmin - Form data has image:', hasImage);

        // Create a new FormData object
        const newFormData = new FormData();

        // Add the text fields
        newFormData.append('title', title);
        newFormData.append('description', description);
        newFormData.append('button_text', button_text);
        newFormData.append('button_link', button_link);

        // If there's no image, fetch the default image and add it
        if (!hasImage) {
          console.log('HomeAdmin - No image in form data, fetching default image');

          try {
            // Fetch the default image
            const imageResponse = await fetch('/images/image1.jpg');
            const imageBlob = await imageResponse.blob();

            // Create a File object from the blob
            const defaultFile = new File([imageBlob], `hero_image_default_${new Date().getTime()}.jpg`, {
              type: 'image/jpeg',
              lastModified: new Date().getTime()
            });

            // Add the default image to the form data with explicit filename and correct field name
            newFormData.append('background_image_file', defaultFile, defaultFile.name);
            console.log('HomeAdmin - Added default image to form data:', {
              name: defaultFile.name,
              type: defaultFile.type,
              size: defaultFile.size
            });

            // Double-check that the image was appended correctly
            const imageCheck = newFormData.get('background_image_file');
            console.log('HomeAdmin - Default image check after append:', {
              hasImage: !!imageCheck,
              isFile: imageCheck instanceof File,
              fileName: imageCheck instanceof File ? imageCheck.name : 'N/A',
              fileSize: imageCheck instanceof File ? imageCheck.size : 'N/A'
            });
          } catch (error) {
            console.error('HomeAdmin - Error fetching default image:', error);
          }
        } else {
          // Copy the image from the original form data
          const imageFile = formData.get('background_image_file') as File;

          // Explicitly append the file with its name and correct field name
          newFormData.append('background_image_file', imageFile, imageFile.name);

          console.log('HomeAdmin - Copied image from original form data:', {
            name: imageFile.name,
            type: imageFile.type,
            size: imageFile.size
          });

          // Double-check that the image was appended correctly
          const imageCheck = newFormData.get('background_image_file');
          console.log('HomeAdmin - Image check after append:', {
            hasImage: !!imageCheck,
            isFile: imageCheck instanceof File,
            fileName: imageCheck instanceof File ? imageCheck.name : 'N/A',
            fileSize: imageCheck instanceof File ? imageCheck.size : 'N/A'
          });
        }

        // Get all existing hero sections
        const heroSectionsResponse = await apiClient.get('/hero-section/');
        const heroSections = heroSectionsResponse.data;
        console.log('HomeAdmin - All hero sections:', heroSections);

        // Delete all existing hero sections
        if (heroSections && heroSections.length > 0) {
          console.log('HomeAdmin - Deleting all existing hero sections');

          // Delete each hero section
          for (const section of heroSections) {
            console.log(`HomeAdmin - Deleting hero section ${section.id}`);
            await apiClient.delete(`/hero-section/${section.id}/`);
          }
        }

        // Create a new hero section with the new form data
        console.log('HomeAdmin - Creating new hero section with POST');

        // Log the new form data
        console.log('HomeAdmin - New form data entries:');
        for (const pair of newFormData.entries()) {
          if (pair[1] instanceof File) {
            console.log(`${pair[0]}: File(${(pair[1] as File).name}, ${(pair[1] as File).type}, ${(pair[1] as File).size} bytes)`);
          } else {
            console.log(`${pair[0]}: ${pair[1]}`);
          }
        }

        // Add detailed logging for the request
        console.log('HomeAdmin - Sending POST request to /hero-section/');
        console.log('HomeAdmin - Request headers:', {
          'Content-Type': 'multipart/form-data'
        });

        try {
          // Use the correct approach for handling FormData
          response = await apiClient.post('/hero-section/', newFormData, {
            // This is critical - it tells axios not to set Content-Type
            // The browser will automatically set the correct multipart/form-data with boundary
            transformRequest: [(data, headers) => {
              if (headers) delete headers['Content-Type'];
              return data;
            }]
          });

          // Log the response
          console.log('HomeAdmin - POST request successful');
          console.log('HomeAdmin - Response status:', response.status);
          console.log('HomeAdmin - Response data:', response.data);

          // Check if the response includes a background_image
          if (response.data && response.data.background_image) {
            console.log('HomeAdmin - Response includes background_image:', response.data.background_image);
          } else {
            console.warn('HomeAdmin - Response does NOT include background_image');
          }
        } catch (error: any) {
          console.error('HomeAdmin - POST request failed:', error);
          console.error('HomeAdmin - Error response:', error.response);
          throw error;
        }

        console.log('HomeAdmin - Hero mutation response:', response.data);
        return response;
      } catch (error: any) {
        console.error('HomeAdmin - Hero mutation error:', error);
        console.error('HomeAdmin - Error response data:', error.response?.data);
        throw error;
      }
    },
    onSuccess: (response) => {
      console.log('HomeAdmin - Hero mutation successful, response:', response.data);

      // Invalidate and reset the hero section query
      queryClient.invalidateQueries({ queryKey: ["hero-section"] });
      queryClient.resetQueries({ queryKey: ["hero-section"] });
      console.log('HomeAdmin - Invalidated and reset hero section query');

      setIsHeroFormOpen(false);
      setEditingHero(null);
      toast.success(heroData?.id ? "Hero section updated successfully" : "Hero section created successfully");

      // Show a success message without redirecting
      toast.message("Hero section updated successfully. You can view the changes on the home page.");

      // Log the response data for debugging
      console.log('HomeAdmin - Response data details:');
      console.log('HomeAdmin - ID:', response.data.id);
      console.log('HomeAdmin - Title:', response.data.title);
      console.log('HomeAdmin - Description:', response.data.description);
      console.log('HomeAdmin - Button Text:', response.data.button_text);
      console.log('HomeAdmin - Button Link:', response.data.button_link);
      console.log('HomeAdmin - Background Image:', response.data.background_image);
    },
    onError: (error: any) => {
      console.error('HomeAdmin - Mutation error:', error.response?.data);
      toast.error(error.response?.data?.detail || "Failed to save hero section");
    },
  });

  // Delete mutation
  const deleteHeroMutation = useMutation({
    mutationFn: (id: number) =>
      apiClient.delete(`/hero-section/${id}/`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hero-section"] });
      toast.success("Hero section deleted successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || "Failed to delete hero section");
    },
  });

  // Add delete mutation - used for reference
  /*
  const deleteHeroSection = useMutation({
    mutationFn: (id: number) => apiClient.delete(`/hero-section/${id}/`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hero-section"] });
      toast.success("Hero section deleted successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || "Failed to delete hero section");
    },
  });
  */

  // Update the type definition in handleEdit function
  const handleEdit = (item: any, type: 'hero' | 'feature' | 'market' | 'why-choose-us') => {
    setEditingItem(item);
    switch(type) {
      case 'hero':
        setIsHeroFormOpen(true);
        break;
      case 'feature':
        setIsFeatureFormOpen(true);
        break;
      case 'market':
        setIsMarketFormOpen(true);
        break;
      case 'why-choose-us':
        setIsWhyChooseUsFormOpen(true);
        break;
    }
  };

  // State for tracking content pending approval
  const [pendingApproval, setPendingApproval] = useState<{id: string, type: string, data: any}[]>([]);

  // Function to submit content for approval
  const submitForApproval = (data: any, type: string, id?: string) => {
    // In a real app, this would send to the backend
    const approvalItem = { id: id || 'new', type, data };
    setPendingApproval(prev => [...prev, approvalItem]);
    toast.success('Content submitted for admin approval');
  };

  const handleDelete = async (id: string, type: string) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;

    try {
      // Ensure the endpoint always ends with a trailing slash
      const endpoint = type === 'markets'
        ? `target-markets/${id}/`
        : `${type}/${id}/`;  // Added trailing slash here

      await apiClient.delete(endpoint);

      // Update the query key to match the endpoint type
      const queryKey = type === 'markets' ? 'target-markets' : type;
      queryClient.invalidateQueries({ queryKey: [queryKey] });

      toast.success('Item deleted successfully');
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete item');
    }
  };

  // Function to preview content
  const handlePreview = (item: any, type: string) => {
    // Create a preview modal or redirect to a preview page
    toast.success('Preview functionality would open a modal or new tab with a preview of this content');
    console.log('Previewing item:', item, 'of type:', type);
  };

  // Admin notifications for editor requests
  useEffect(() => {
    if (canDelete && pendingApproval.length > 0) {
      toast.success(`You have ${pendingApproval.length} content item(s) pending approval`);
    }
  }, [pendingApproval.length, canDelete]);

  // Function to approve content
  const approveContent = (id: string, type: string) => {
    // In a real app, this would update the backend
    setPendingApproval(prev => prev.filter(item => !(item.id === id && item.type === type)));
    toast.success('Content approved and published');
  };

  // Function to reject content
  const rejectContent = (id: string, type: string) => {
    // In a real app, this would notify the editor
    setPendingApproval(prev => prev.filter(item => !(item.id === id && item.type === type)));
    toast.success('Content rejected and returned to editor');
  };

  const marketMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const formData = new FormData();
      formData.append('title', data.get('title') as string);
      formData.append('description', data.get('description') as string);

      const imageFile = data.get('image');
      if (imageFile instanceof File && imageFile.size > 0) {
        formData.append('image', imageFile);
      } else {
        // Fetch the default image and convert it to a File object
        const defaultImageResponse = await fetch('/images/default-market.jpg');
        const defaultImageBlob = await defaultImageResponse.blob();
        const defaultImageFile = new File([defaultImageBlob], 'default-market.jpg', { type: 'image/jpeg' });
        formData.append('image', defaultImageFile);
      }

      if (editingItem) {
        return apiClient.patch(`target-markets/${editingItem.id}/`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
      }

      return apiClient.post("target-markets/", formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["target-markets"] });
      toast.success(editingItem ? "Market updated" : "Market added");
      setIsMarketFormOpen(false);
      setEditingItem(null);
    },
    onError: (error: any) => {
      console.error('Error details:', error.response?.data);
      const errorMessage = error.response?.data?.detail || "Failed to save market";
      toast.error(errorMessage);
    },
  });

  const featureMutation = useMutation({
    mutationFn: async (data: Partial<Feature>) => {
      if (editingItem) {
        return apiClient.put(`features/${editingItem.id}/`, data);  // Already has trailing slash
      }
      return apiClient.post("features/", data);  // Already has trailing slash
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["features"] });
      toast.success(editingItem ? "Feature updated" : "Feature added");
      setIsFeatureFormOpen(false);
      setEditingItem(null);
    },
  });

  const { data: whyChooseUs } = useQuery({
    queryKey: ["why-choose-us"],
    queryFn: async () => {
      const response = await apiClient.get("/why-choose-us/");
      return response.data;
    },
  });

  const whyChooseUsMutation = useMutation({
    mutationFn: async (data: Partial<WhyChooseUs>) => {
      if (editingItem) {
        return apiClient.put(`why-choose-us/${editingItem.id}/`, data);
      }
      return apiClient.post("why-choose-us/", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["why-choose-us"] });
      toast.success(editingItem ? "Item updated" : "Item added");
      setIsWhyChooseUsFormOpen(false);
      setEditingItem(null);
    },
  });

  return (
    <AdminLayout title="Home Page Management">
      {/* Admin Approval Panel */}
      {canDelete && pendingApproval.length > 0 && (
        <div className="mb-6 bg-amber-50 border border-amber-200 rounded-md p-4">
          <h3 className="text-lg font-medium text-amber-800 mb-2">Pending Approval ({pendingApproval.length})</h3>
          <div className="space-y-3">
            {pendingApproval.map((item, index) => (
              <div key={index} className="flex items-center justify-between bg-white p-3 rounded border border-amber-100">
                <div>
                  <span className="font-medium">{item.type.charAt(0).toUpperCase() + item.type.slice(1)}</span>
                  <span className="mx-2">•</span>
                  <span className="text-sm text-gray-500">
                    {item.id === 'new' ? 'New item' : `Edit item #${item.id}`}
                  </span>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-green-500 text-green-600 hover:bg-green-50"
                    onClick={() => approveContent(item.id, item.type)}
                  >
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-red-500 text-red-600 hover:bg-red-50"
                    onClick={() => rejectContent(item.id, item.type)}
                  >
                    Reject
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <Tabs defaultValue="hero">
        <TabsList>
          <TabsTrigger value="hero">Hero Section</TabsTrigger>
          <TabsTrigger value="features">Features</TabsTrigger>
          <TabsTrigger value="markets">Target Markets</TabsTrigger>
          <TabsTrigger value="why-choose-us">Why Choose Us</TabsTrigger>
        </TabsList>

        <TabsContent value="hero">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Hero Section</h2>
            {canEdit ? (
              <Dialog
                open={isHeroFormOpen}
                onOpenChange={(open) => {
                  setIsHeroFormOpen(open);
                  if (!open) setEditingHero(null);
                }}
              >
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    {heroData ? 'Edit Hero Content' : 'Add Hero Content'}
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>
                      {heroData ? 'Edit Hero Section' : 'Add Hero Section'}
                    </DialogTitle>
                  </DialogHeader>
                  <HeroForm
                    data={heroData}
                    onSubmit={(formData) => heroMutation.mutate(formData)}
                  />
                </DialogContent>
              </Dialog>
            ) : null}
          </div>

          {isHeroLoading ? (
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full mr-2" /> Loading...
            </div>
          ) : heroData ? (
            <div className="bg-white rounded-lg shadow p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-4">Content</h3>
                  <dl className="space-y-4">
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Title</dt>
                      <dd className="mt-1">{heroData.title}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Description</dt>
                      <dd className="mt-1">{heroData.description}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Button</dt>
                      <dd className="mt-1">
                        {heroData.button_text} - <a href={heroData.button_link} className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">{heroData.button_link}</a>
                      </dd>
                    </div>
                  </dl>
                </div>
                {heroData.background_image && (
                  <div>
                    <h3 className="font-semibold mb-4">Background Image</h3>
                    <img
                      src={`http://localhost:8000${heroData.background_image}`}
                      alt="Hero background"
                      className="w-full h-48 object-cover rounded-lg"
                    />
                  </div>
                )}
              </div>
              {canEdit && (
                <div className="mt-6 flex justify-end space-x-3">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setEditingHero(heroData);
                      setIsHeroFormOpen(true);
                    }}
                  >
                    <Pencil className="mr-2 h-4 w-4" />
                    Edit
                  </Button>
                  {canDelete && (
                    <Button
                      variant="destructive"
                      onClick={() => {
                        if (window.confirm('Are you sure you want to delete this hero section?')) {
                          deleteHeroMutation.mutate(heroData.id!);
                        }
                      }}
                    >
                      <Trash className="mr-2 h-4 w-4" />
                      Delete
                    </Button>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">No hero section content found</p>
              {canEdit && (
                <Button
                  onClick={() => {
                    setEditingHero(null);
                    setIsHeroFormOpen(true);
                  }}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Hero Content
                </Button>
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="features">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-semibold">Features</h2>
              {isEditor && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="sm" className="px-2">
                        <Info className="h-4 w-4 text-blue-500" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-xs">As an editor, you can create and edit content, but your changes will be submitted for admin approval before publishing. You cannot delete content - this action is restricted to administrators.</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
            {canEdit && (
              <Dialog open={isFeatureFormOpen} onOpenChange={setIsFeatureFormOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Feature
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{editingItem ? 'Edit' : 'Add'} Feature</DialogTitle>
                  </DialogHeader>
                  <FeaturesForm
                    data={editingItem}
                    onSubmit={(data) => {
                      if (isEditor && !canDelete) {
                        // Editors submit for approval
                        submitForApproval(data, 'feature', editingItem?.id);
                        setIsFeatureFormOpen(false);
                        setEditingItem(null);
                      } else {
                        // Admins can directly publish
                        featureMutation.mutate(data);
                      }
                    }}
                  />
                </DialogContent>
              </Dialog>
            )}
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Icon</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {features?.map((feature: Feature) => (
                <TableRow key={feature.id}>
                  <TableCell>{feature.icon}</TableCell>
                  <TableCell>{feature.title}</TableCell>
                  <TableCell>{feature.description}</TableCell>
                  <TableCell className="flex gap-2">
                    {canEdit && (
                      <>
                        <Button variant="ghost" size="sm" onClick={() => handleEdit(feature, 'feature')}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handlePreview(feature, 'feature')}>
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                        </Button>
                      </>
                    )}
                    {canDelete && (
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(feature.id, 'features')}>
                        <Trash className="h-4 w-4" />
                      </Button>
                    )}
                    {!canEdit && !canDelete && (
                      <span className="text-xs text-gray-500 italic">View only</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TabsContent>

        <TabsContent value="markets">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-semibold">Target Markets</h2>
              {isEditor && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="sm" className="px-2">
                        <Info className="h-4 w-4 text-blue-500" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-xs">As an editor, you can create and edit content, but your changes will be submitted for admin approval before publishing. You cannot delete content - this action is restricted to administrators.</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
            {canEdit && (
              <Dialog
                open={isMarketFormOpen}
                onOpenChange={setIsMarketFormOpen}
              >
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Market
                  </Button>
                </DialogTrigger>
                <DialogContent
                  className="sm:max-w-[425px]"
                  onInteractOutside={(e) => e.preventDefault()}
                  onEscapeKeyDown={(e) => e.preventDefault()}
                >
                  <DialogHeader>
                    <DialogTitle>{editingItem ? 'Edit' : 'Add'} Market</DialogTitle>
                  </DialogHeader>
                  <TargetMarketsForm
                    data={editingItem}
                    onSubmit={(data) => {
                      if (isEditor && !canDelete) {
                        // Editors submit for approval
                        submitForApproval(data, 'market', editingItem?.id);
                        setIsMarketFormOpen(false);
                        setEditingItem(null);
                      } else {
                        // Admins can directly publish
                        marketMutation.mutate(data);
                      }
                    }}
                  />
                </DialogContent>
              </Dialog>
            )}
          </div>

          <Table>
            <TableHeader>
              <TableRow>

                <TableHead>Title</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {markets?.map((market: TargetMarket) => (
                <TableRow key={market.id}>

                  <TableCell>{market.title}</TableCell>
                  <TableCell>{market.description}</TableCell>
                  <TableCell className="flex gap-2">
                    {canEdit && (
                      <>
                        <Button variant="ghost" size="sm" onClick={() => handleEdit(market, 'market')}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handlePreview(market, 'market')}>
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                        </Button>
                      </>
                    )}
                    {canDelete && (
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(market.id, 'markets')}>
                        <Trash className="h-4 w-4" />
                      </Button>
                    )}
                    {!canEdit && !canDelete && (
                      <span className="text-xs text-gray-500 italic">View only</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TabsContent>

        <TabsContent value="why-choose-us">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-semibold">Why Choose Us</h2>
              {isEditor && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="sm" className="px-2">
                        <Info className="h-4 w-4 text-blue-500" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-xs">As an editor, you can create and edit content, but your changes will be submitted for admin approval before publishing. You cannot delete content - this action is restricted to administrators.</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
            {canEdit && (
              <Dialog open={isWhyChooseUsFormOpen} onOpenChange={setIsWhyChooseUsFormOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Item
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{editingItem ? 'Edit' : 'Add'} Item</DialogTitle>
                  </DialogHeader>
                  <WhyChooseUsForm
                    data={editingItem}
                    onSubmit={(data) => {
                      if (isEditor && !canDelete) {
                        // Editors submit for approval
                        submitForApproval(data, 'why-choose-us', editingItem?.id);
                        setIsWhyChooseUsFormOpen(false);
                        setEditingItem(null);
                      } else {
                        // Admins can directly publish
                        whyChooseUsMutation.mutate(data);
                      }
                    }}
                  />
                </DialogContent>
              </Dialog>
            )}
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Icon</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {whyChooseUs?.map((item: WhyChooseUs) => (
                <TableRow key={item.id}>
                  <TableCell>{item.icon}</TableCell>
                  <TableCell>{item.title}</TableCell>
                  <TableCell>{item.description}</TableCell>
                  <TableCell className="flex gap-2">
                    {canEdit && (
                      <>
                        <Button variant="ghost" size="sm" onClick={() => handleEdit(item, 'why-choose-us')}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handlePreview(item, 'why-choose-us')}>
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                        </Button>
                      </>
                    )}
                    {canDelete && (
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(item.id, 'why-choose-us')}>
                        <Trash className="h-4 w-4" />
                      </Button>
                    )}
                    {!canEdit && !canDelete && (
                      <span className="text-xs text-gray-500 italic">View only</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TabsContent>
      </Tabs>
    </AdminLayout>
  );
}
