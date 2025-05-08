import React, { useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Plus, Pencil, Trash } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import {
  aboutHeroService,
  companyOverviewService,
  missionVisionService,
  teamMemberService,
  partnersService,
  teamDescriptionService,
  partnerDescriptionService,
} from "@/lib/api-service";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { AboutHeroForm } from "@/components/admin/about/AboutHeroForm";
import { CompanyOverviewForm } from "@/components/admin/about/CompanyOverviewForm";
import { MissionVisionForm } from "@/components/admin/about/MissionVisionForm";
import { TeamForm } from "@/components/admin/about/TeamForm";
import { PartnersForm } from "@/components/admin/about/PartnersForm";
import { TeamDescriptionForm } from "@/components/admin/about/TeamDescriptionForm";
//import apiClient from "@/lib/api-adapter";
import { CompanyOverview, MissionVision, TeamDescription } from "@/lib/types";

const AboutAdmin: React.FC = () => {
  const queryClient = useQueryClient();
  const { hasPermission } = useAuth();

  // Check if user has edit permissions
  const canEdit = hasPermission('editor');
  const canDelete = hasPermission('admin');

  const [isHeroFormOpen, setIsHeroFormOpen] = useState(false);
  const [isCompanyFormOpen, setIsCompanyFormOpen] = useState(false);
  const [isMissionVisionFormOpen, setIsMissionVisionFormOpen] = useState(false);
  const [isTeamFormOpen, setIsTeamFormOpen] = useState(false);
  const [isPartnerFormOpen, setIsPartnerFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);


  // Queries
  const { data: heroData } = useQuery({
    queryKey: ["about-hero"],
    queryFn: aboutHeroService.getAll,
  });

  const { data: companyData, isLoading: isCompanyLoading } = useQuery({
    queryKey: ["company-overview"],
    queryFn: companyOverviewService.getAll,
  });

  const { data: missionVisionData } = useQuery({
    queryKey: ["mission-vision"],
    queryFn: missionVisionService.getAll,
  });

  const { data: teamData } = useQuery({
    queryKey: ["team-members"],
    queryFn: teamMemberService.getAll,
  });

  const { data: partnersData } = useQuery({
    queryKey: ["partners"],
    queryFn: partnersService.getAll,
  });

  // Mutations
  const heroMutation = useMutation({
    mutationFn: async (data: FormData) => {
      console.log('AboutAdmin - Submitting hero form data');

      // Log the form data
      console.log('AboutAdmin - Form data entries:');
      for (const pair of data.entries()) {
        if (pair[1] instanceof File) {
          console.log(`${pair[0]}: File(${(pair[1] as File).name}, ${(pair[1] as File).type}, ${(pair[1] as File).size} bytes)`);
        } else {
          console.log(`${pair[0]}: ${pair[1]}`);
        }
      }

      // Use transformRequest to ensure Content-Type is not set
      const config = {
        headers: {
          // Don't set Content-Type, let the browser set it with the boundary
        },
        transformRequest: [(data: any, headers: any) => {
          if (headers) delete headers['Content-Type'];
          return data;
        }]
      };

      if (editingItem) {
        console.log(`AboutAdmin - Updating hero section ${editingItem.id}`);
        const response = await aboutHeroService.update(editingItem.id, data);
        console.log('AboutAdmin - Update response:', response);
        return response;
      } else {
        console.log('AboutAdmin - Creating new hero section');
        const response = await aboutHeroService.create(data);
        console.log('AboutAdmin - Create response:', response);
        return response;
      }
    },
    onSuccess: (response) => {
      console.log('AboutAdmin - Hero mutation successful, response:', response);
      queryClient.invalidateQueries({ queryKey: ["about-hero"] });
      setIsHeroFormOpen(false);
      setEditingItem(null);
      toast.success(
        editingItem
          ? "Hero section updated successfully"
          : "Hero section created successfully"
      );
    },
    onError: (error: any) => {
      console.error('AboutAdmin - Hero mutation error:', error);
      toast.error(
        error.response?.data?.detail || "Failed to save hero section"
      );
    },
  });

  const deleteHero = useMutation({
    mutationFn: aboutHeroService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["about-hero"] });
      toast.success("Hero section deleted successfully");
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.detail || "Failed to delete hero section"
      );
    },
  });

  const missionVisionMutation = useMutation({
    mutationFn: (data: any) =>
      editingItem
        ? missionVisionService.update(editingItem.id, data)
        : missionVisionService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mission-vision"] });
      setIsMissionVisionFormOpen(false);
      setEditingItem(null);
      toast.success(
        editingItem
          ? "Mission & Vision updated successfully"
          : "Mission & Vision created successfully"
      );
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.detail || "Failed to save Mission & Vision"
      );
    },
  });


  const partnersMutation = useMutation({
    mutationFn: (data: FormData) =>
      editingItem
        ? partnersService.update(`${editingItem.id}/`, data)  // Add trailing slash
        : partnersService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["partners"] });
      setIsPartnerFormOpen(false);
      setEditingItem(null);
      toast.success(
        editingItem
          ? "Partner updated successfully"
          : "Partner added successfully"
      );
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || "Failed to save partner");
    },
  });

  const deletePartner = useMutation({
    mutationFn: partnersService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["partners"] });
      toast.success("Partner deleted successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || "Failed to delete partner");
    },
  });

  const handleMissionVisionSubmit = (data: MissionVision) => {
    missionVisionMutation.mutate(data);
  };

  const companyOverviewMutation = useMutation({
    mutationFn: async (data: CompanyOverview) => {
      if (!editingItem) {
        return companyOverviewService.create(data);
      }

      // For updates, ensure we're sending the correct format
      const updateData = {
        id: editingItem.id,
        title: data.title,
        description: data.description,
        quote: data.quote,
        quote_author: data.quote_author,
        quote_position: data.quote_position
      };

      try {
        // Add trailing slash to the ID
        const response = await companyOverviewService.update(
          `${editingItem.id}/`,  // Add trailing slash here
          updateData
        );
        return response;
      } catch (error: any) {
        console.error('Update error details:', {
          error,
          requestData: updateData,
          editingItem
        });
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["company-overview"] });
      setIsCompanyFormOpen(false);
      setEditingItem(null);
      toast.success(
        editingItem
          ? "Company overview updated successfully"
          : "Company overview created successfully"
      );
    },
    onError: (error: any) => {
      console.error("Mutation error:", {
        response: error.response?.data,
        status: error.response?.status,
        message: error.message
      });
      toast.error(
        error.response?.data?.detail ||
        error.message ||
        "Failed to save company overview"
      );
    }
  });

  const deleteCompanyOverview = useMutation({
    mutationFn: (id: number) => companyOverviewService.delete(id.toString()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["company-overview"] });
      toast.success("Company overview deleted successfully");
    },
    onError: (error: any) => {
      console.error("Delete error:", error);
      toast.error(
        error.response?.data?.detail || "Failed to delete company overview"
      );
    },
  });

  const handleCompanySubmit = (data: CompanyOverview) => {
    companyOverviewMutation.mutate(data);
  };

  //parteners
  const [isPartnerDescriptionFormOpen, setIsPartnerDescriptionFormOpen] =
    useState(false);

  // Add new query for partner descriptions
  const { data: partnerDescription } = useQuery({
    queryKey: ["partner-descriptions"],
    queryFn: async () => {
      try {
        const response = await partnerDescriptionService.getAll();
        // Ensure we always return an array
        return Array.isArray(response) ? response : (response ? [response] : []);
      } catch (error) {
        console.error('Error fetching partner descriptions:', error);
        return []; // Return empty array on error
      }
    },
  });

  // Add new mutation for partner descriptions
  const partnerDescriptionMutation = useMutation({
    mutationFn: async (data: FormData) => {
      if (editingItem) {
        return partnerDescriptionService.update(
          `${editingItem.id}/`,  // Fixed path
          data
        );
      }
      return partnerDescriptionService.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["partner-descriptions"] });
      setIsPartnerDescriptionFormOpen(false);
      setEditingItem(null);
      toast.success(
        editingItem
          ? "Partner description updated successfully"
          : "Partner description added successfully"
      );
    },
    onError: (error: any) => {
      console.error("Mutation error:", {
        error,
        response: error.response?.data,
        status: error.response?.status
      });
      toast.error(
        error.response?.data?.detail || "Failed to save partner description"
      );
    },
  });

  // Add delete mutation for partner descriptions
  const deletePartnerDescription = useMutation({
    mutationFn: (id: string) => partnerDescriptionService.delete(id.toString()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["partner-descriptions"] });
      toast.success("Partner description deleted successfully");
    },
    onError: (error: any) => {
      console.error("Delete error:", error.response?.data);
      toast.error(
        error.response?.data?.detail || "Failed to delete partner description"
      );
    },
  });

  const [isTeamDescriptionFormOpen, setIsTeamDescriptionFormOpen] =
    useState(false);

  // Add new query for team descriptions
  const { data: teamDescriptionsData } = useQuery({
    queryKey: ["team-descriptions"],
    queryFn: async () => {
      try {
        const response = await teamDescriptionService.getAll();
        // Ensure we always return an array
        return Array.isArray(response) ? response : (response ? [response] : []);
      } catch (error) {
        console.error('Error fetching team descriptions:', error);
        return []; // Return empty array on error
      }
    },
  });

  const teamMutation = useMutation({
    mutationFn: async (data: FormData) => {
      console.log('=== TEAM MUTATION START ===');
      console.log('Original FormData received:', data);
      console.log('Editing item:', editingItem);

      // Log all incoming form data entries
      console.log('Incoming FormData entries:');
      for (const pair of data.entries()) {
        if (pair[1] instanceof File) {
          console.log(`${pair[0]}: File(${(pair[1] as File).name}, ${(pair[1] as File).type}, ${(pair[1] as File).size} bytes)`);
        } else {
          console.log(`${pair[0]}: ${pair[1]}`);
        }
      }

      // Create a new FormData object to ensure proper handling
      const formData = new FormData();

      // Add the basic fields
      formData.append('name', data.get('name') as string);
      formData.append('position', data.get('position') as string);
      console.log('Added basic fields to new FormData');

      // Handle the image field
      const imageFile = data.get('image');
      console.log('Image from FormData:', imageFile);
      console.log('Image type check:', {
        isFile: imageFile instanceof File,
        nullCheck: imageFile === null,
        undefinedCheck: imageFile === undefined,
        typeofCheck: typeof imageFile,
        hasSize: imageFile instanceof File ? 'size: ' + imageFile.size : 'N/A'
      });

      if (imageFile instanceof File && imageFile.size > 0) {
        console.log('Valid image file found:', {
          name: imageFile.name,
          type: imageFile.type,
          size: imageFile.size
        });

        // Use a more explicit way to append the file with its name
        formData.append('image', imageFile, imageFile.name);

        // Double-check that the image was appended correctly
        const imageCheck = formData.get('image');
        console.log('Image check after append:', {
          hasImage: !!imageCheck,
          isFile: imageCheck instanceof File,
          fileName: imageCheck instanceof File ? imageCheck.name : 'N/A'
        });

        console.log('Image appended to FormData');
      } else {
        // Check if we're editing and if so, don't require an image
        if (!editingItem) {
          // For debugging, log all form data entries
          console.log('All FormData entries:');
          for (const pair of data.entries()) {
            console.log(`${pair[0]}: ${pair[1]}`);
          }

          console.warn('No valid image file found for new team member, but continuing anyway');
        } else {
          console.log('No new image provided for existing team member - keeping current image');
        }
      }

      // Log the final FormData contents
      console.log('Final FormData entries:');
      for (const pair of formData.entries()) {
        if (pair[1] instanceof File) {
          console.log(`${pair[0]}: File(${(pair[1] as File).name}, ${(pair[1] as File).type}, ${(pair[1] as File).size} bytes)`);
        } else {
          console.log(`${pair[0]}: ${pair[1]}`);
        }
      }

      let result;
      try {
        if (editingItem) {
          // Update existing team member
          console.log(`Updating team member with ID: ${editingItem.id}`);
          result = await teamMemberService.update(`${editingItem.id}/`, formData);
          console.log('Update result:', result);
        } else {
          // Create new team member
          console.log('Creating new team member');
          result = await teamMemberService.create(formData);
          console.log('Create result:', result);
        }
        console.log('=== TEAM MUTATION SUCCESS ===');
        return result;
      } catch (error) {
        console.error('=== TEAM MUTATION ERROR ===', error);
        throw error;
      }
    },
    onSuccess: (data) => {
      console.log('=== TEAM MUTATION SUCCESS CALLBACK ===');
      console.log('Response data:', data);

      // Invalidate the query to refetch the data
      console.log('Invalidating team-members query');
      queryClient.invalidateQueries({ queryKey: ["team-members"] });

      // Log the current team data before refetch
      console.log('Current team data before refetch:', teamData);

      // Close the form and reset the editing state
      setIsTeamFormOpen(false);
      setEditingItem(null);

      // Show success message
      toast.success(editingItem ? "Team member updated successfully" : "Team member added successfully");

      // Force a refetch to ensure we have the latest data
      setTimeout(() => {
        console.log('Forcing refetch of team-members');
        queryClient.refetchQueries({ queryKey: ["team-members"] });
      }, 500);
    },
    onError: (error: any) => {
      console.error("Team member mutation error:", {
        originalError: error,
        responseData: error.response?.data,
        message: error.message
      });

      let errorMessage;
      try {
        const errorData = JSON.parse(error.message);
        errorMessage = Object.entries(errorData)
          .map(([key, value]) => `${key}: ${value}`)
          .join(', ');
      } catch (e) {
        errorMessage = error.response?.data?.detail ||
                      error.message ||
                      "Failed to save team member";
      }

      toast.error(errorMessage);
    },
  });

  // Add new mutation for team descriptions
  const teamDescriptionMutation = useMutation({
    mutationFn: async (data: any) => {
      if (editingItem) {
        // Ensure ID is converted to string and has trailing slash
        const id = `${editingItem.id}/`;
        return teamDescriptionService.update(id, data);
      }
      return teamDescriptionService.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["team-descriptions"] }); // Fixed query key
      setIsTeamDescriptionFormOpen(false);
      setEditingItem(null);
      toast.success(
        editingItem
          ? "Team description updated successfully"
          : "Team description created successfully"
      );
    },
    onError: (error: any) => {
      console.error("Mutation error:", {
        response: error.response?.data,
        status: error.response?.status,
        message: error.message
      });
      toast.error(
        error.response?.data?.detail ||
        error.message ||
        "Failed to save team description"
      );
    },
  });

  // Add delete mutation for team descriptions
  const deleteTeamDescription = useMutation({
    mutationFn: (id: string) =>
      teamDescriptionService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["team-descriptions"] });
      toast.success("Team description deleted successfully");
    },
  });

  const deleteTeamMember = useMutation({
    mutationFn: (id: string) => teamMemberService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["team-members"] });
      toast.success("Team member deleted successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || "Failed to delete team member");
    },
  });

  const deleteMissionVision = useMutation({
    mutationFn: (id: string) => missionVisionService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mission-vision"] });
      toast.success("Mission & Vision deleted successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || "Failed to delete Mission & Vision");
    },
  });

  /* Authentication is now handled by the ProtectedRoute component */

  return (
    <AdminLayout title="About Page Management">
      <Tabs defaultValue="hero">
        <TabsList>
          <TabsTrigger value="hero">Hero Section</TabsTrigger>
          <TabsTrigger value="company">Company Overview</TabsTrigger>
          <TabsTrigger value="mission-vision">Mission & Vision</TabsTrigger>
          <TabsTrigger value="team">Team</TabsTrigger>
          <TabsTrigger value="partners">Partners</TabsTrigger>
        </TabsList>

        <TabsContent value="hero">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Hero Section</h2>
            {canEdit && (
              <Dialog open={isHeroFormOpen} onOpenChange={setIsHeroFormOpen}>
                <DialogTrigger asChild>
                  <Button onClick={() => setEditingItem(null)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Hero Content
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>
                      {editingItem ? "Edit" : "Add"} Hero Content
                    </DialogTitle>
                  </DialogHeader>
                  <AboutHeroForm
                    data={editingItem}
                    onSubmit={(formData) => {
                      heroMutation.mutate(formData);
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
                <TableHead>Background Image</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.isArray(heroData)
                ? heroData.map((hero: any) => (
                    <TableRow key={hero.id}>
                      <TableCell>{hero.title || "No title"}</TableCell>
                      <TableCell>{hero.description || "No description"}</TableCell>
                      <TableCell>
                        {hero.background_image ? (
                          <div className="w-16 h-16 relative">
                            <img
                              src={hero.background_image}
                              alt="Background"
                              className="w-full h-full object-cover rounded"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = "/images/image1.jpg";
                              }}
                            />
                          </div>
                        ) : (
                          <span className="text-xs text-gray-500">No image</span>
                        )}
                      </TableCell>
                      <TableCell className="space-x-2">
                        {canEdit && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setEditingItem(hero);
                              setIsHeroFormOpen(true);
                            }}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                        )}
                        {canDelete && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              if (
                                window.confirm(
                                  "Are you sure you want to delete this hero section?"
                                )
                              ) {
                                deleteHero.mutate(hero.id);
                              }
                            }}
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        )}
                        {!canEdit && !canDelete && (
                          <span className="text-xs text-gray-500 italic">View only</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                : heroData && (
                    <TableRow>
                      <TableCell>{(heroData as AboutHero).title || "No title"}</TableCell>
                      <TableCell>{(heroData as AboutHero).description || "No description"}</TableCell>
                      <TableCell>
                        {(heroData as AboutHero).background_image ? (
                          <div className="w-16 h-16 relative">
                            <img
                              src={(heroData as AboutHero).background_image}
                              alt="Background"
                              className="w-full h-full object-cover rounded"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = "/images/image1.jpg";
                              }}
                            />
                          </div>
                        ) : (
                          <span className="text-xs text-gray-500">No image</span>
                        )}
                      </TableCell>
                      <TableCell className="space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setEditingItem(heroData);
                            setIsHeroFormOpen(true);
                          }}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            if (
                              window.confirm(
                                "Are you sure you want to delete this hero section?"
                              )
                            ) {
                              deleteHero.mutate((heroData as AboutHero).id);
                            }
                          }}
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  )}
            </TableBody>
          </Table>
        </TabsContent>

        <TabsContent value="company">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Company Overview</h2>
            {canEdit && (
              <Dialog
                open={isCompanyFormOpen}
                onOpenChange={(open) => {
                  setIsCompanyFormOpen(open);
                  if (!open) setEditingItem(null);
                }}
              >
                <DialogTrigger asChild>
                  <Button onClick={() => setEditingItem(null)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Company Overview
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>
                      {editingItem ? "Edit" : "Add"} Company Overview
                    </DialogTitle>
                  </DialogHeader>
                  <CompanyOverviewForm
                    data={editingItem}
                    onSubmit={(data: Omit<CompanyOverview, "id">) => handleCompanySubmit(data as CompanyOverview)}
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
                <TableHead>Quote</TableHead>
                <TableHead>Quote Author</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isCompanyLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : !companyData ||
                (Array.isArray(companyData) && companyData.length === 0) ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    No company overview found. Click "Add Company Overview" to
                    create one.
                  </TableCell>
                </TableRow>
              ) : (
                (Array.isArray(companyData) ? companyData : [companyData]).map(
                  (item: any) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.title}</TableCell>
                      <TableCell>{item.description}</TableCell>
                      <TableCell>{item.quote}</TableCell>
                      <TableCell>{item.quote_author}</TableCell>
                      <TableCell className="space-x-2">
                        {canEdit && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setEditingItem(item);
                              setIsCompanyFormOpen(true);
                            }}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                        )}
                        {canDelete && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              if (
                                window.confirm(
                                  "Are you sure you want to delete this company overview?"
                                )
                              ) {
                                deleteCompanyOverview.mutate(item.id);
                              }
                            }}
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        )}
                        {!canEdit && !canDelete && (
                          <span className="text-xs text-gray-500 italic">View only</span>
                        )}
                      </TableCell>
                    </TableRow>
                  )
                )
              )}
            </TableBody>
          </Table>
        </TabsContent>

        <TabsContent value="mission-vision">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Mission & Vision</h2>
            {canEdit && (
              <Dialog
                open={isMissionVisionFormOpen}
                onOpenChange={(open) => {
                  setIsMissionVisionFormOpen(open);
                  if (!open) setEditingItem(null);
                }}
              >
                <DialogTrigger asChild>
                  <Button onClick={() => setEditingItem(null)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Mission & Vision
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>
                      {editingItem
                        ? "Edit Mission & Vision"
                        : "Add Mission & Vision"}
                    </DialogTitle>
                  </DialogHeader>
                  <MissionVisionForm
                    data={editingItem}
                    onSubmit={handleMissionVisionSubmit}
                  />
                </DialogContent>
              </Dialog>
            )}
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>

                <TableHead>Mission</TableHead>

                <TableHead>Vision</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.isArray(missionVisionData) ? (
                missionVisionData.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.title}</TableCell>
                    <TableCell>{item.mission}</TableCell>
                    <TableCell>{item.vision}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {canEdit && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setEditingItem(item);
                              setIsMissionVisionFormOpen(true);
                            }}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                        )}
                        {canDelete && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              if (window.confirm("Are you sure you want to delete this mission & vision?")) {
                                if (item.id) {
                                  deleteMissionVision.mutate(item.id);
                                }
                              }
                            }}
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
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-4">
                    No mission & vision data found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TabsContent>

        <TabsContent value="team">
          <div className="space-y-8">
            {/* Team Description Section */}
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">Team Description</h2>
                {canEdit && (
                  <Dialog
                    open={isTeamDescriptionFormOpen}
                    onOpenChange={(open) => {
                      setIsTeamDescriptionFormOpen(open);
                      if (!open) setEditingItem(null);
                    }}
                  >
                    <DialogTrigger asChild>
                      <Button onClick={() => setEditingItem(null)}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Team Description
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>
                          {editingItem ? "Edit" : "Add"} Team Description
                        </DialogTitle>
                      </DialogHeader>
                      <TeamDescriptionForm
                        data={editingItem}
                        onSubmit={(data) => {
                          // Pass the data directly as TeamDescription
                          teamDescriptionMutation.mutate(data as TeamDescription);
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
                  {teamDescriptionsData && teamDescriptionsData.length > 0 ? (
                    teamDescriptionsData.map((desc: any) => (
                      <TableRow key={desc.id}>
                        <TableCell>{desc.title}</TableCell>
                        <TableCell>{desc.description}</TableCell>
                        <TableCell className="space-x-2">
                        {canEdit && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setEditingItem(desc);
                              setIsTeamDescriptionFormOpen(true);
                            }}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                        )}
                        {canDelete && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              if (
                                window.confirm(
                                  "Are you sure you want to delete this description?"
                                )
                              ) {
                                deleteTeamDescription.mutate(desc.id);
                              }
                            }}
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        )}
                        {!canEdit && !canDelete && (
                          <span className="text-xs text-gray-500 italic">View only</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center py-4">
                        No team descriptions found. {canEdit && "Click 'Add Team Description' to create one."}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Team Members Section */}
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">Team Members</h2>
                {canEdit && (
                  <Dialog
                    open={isTeamFormOpen}
                    onOpenChange={(open) => {
                      setIsTeamFormOpen(open);
                      if (!open) setEditingItem(null);
                    }}
                  >
                    <DialogTrigger asChild>
                      <Button onClick={() => setEditingItem(null)}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Team Member
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>
                          {editingItem ? "Edit" : "Add"} Team Member
                        </DialogTitle>
                      </DialogHeader>
                      <TeamForm
                        data={editingItem}
                        onSubmit={(data) => teamMutation.mutate(data)}
                      />
                    </DialogContent>
                  </Dialog>
                )}
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Image</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Position</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {teamData?.map((member: any) => (
                    <TableRow key={member.id}>
                      <TableCell>
                        {member.image && (
                          <img
                            src={member.image}
                            alt={member.name}
                            className="w-12 h-12 rounded-full object-cover"
                            onError={(e) => {
                              console.error('Error loading team member image:', member.image);
                              e.currentTarget.src = '/placeholder.svg';
                            }}
                          />
                        )}
                      </TableCell>
                      <TableCell>{member.name}</TableCell>
                      <TableCell>{member.position}</TableCell>
                      <TableCell className="space-x-2">
                        {canEdit && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setEditingItem(member);
                              setIsTeamFormOpen(true);
                            }}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                        )}
                        {canDelete && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              if (
                                window.confirm(
                                  "Are you sure you want to delete this team member?"
                                )
                              ) {
                                deleteTeamMember.mutate(member.id);
                              }
                            }}
                          >
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
            </div>
          </div>
        </TabsContent>

        <TabsContent value="partners">
          <div className="space-y-8">
            {/* Partners Section */}
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">Partners</h2>
                {canEdit && (
                  <Dialog
                    open={isPartnerFormOpen}
                    onOpenChange={(open) => {
                      setIsPartnerFormOpen(open);
                      if (!open) setEditingItem(null);
                    }}
                  >
                    <DialogTrigger asChild>
                      <Button onClick={() => setEditingItem(null)}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Partner
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>
                          {editingItem ? "Edit" : "Add"} Partner
                        </DialogTitle>
                      </DialogHeader>
                      <PartnersForm
                        type="partner"
                        data={editingItem}
                        onSubmit={(data) => partnersMutation.mutate(data)}
                      />
                    </DialogContent>
                  </Dialog>
                )}
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Logo</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {partnersData?.map((partner: any) => (
                    <TableRow key={partner.id}>
                      <TableCell>{partner.name}</TableCell>
                      <TableCell>
                        <img
                          src={partner.logo || '/images/default-partner.png'}
                          alt={partner.name}
                          className="w-10 h-10 object-contain"
                        />
                      </TableCell>
                      <TableCell className="space-x-2">
                        {canEdit && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setEditingItem(partner);
                              setIsPartnerFormOpen(true);
                            }}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                        )}
                        {canDelete && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              if (
                                window.confirm(
                                  "Are you sure you want to delete this partner?"
                                )
                              ) {
                                deletePartner.mutate(partner.id);
                              }
                            }}
                          >
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
            </div>

            {/* Partner Descriptions Section */}
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">Partner Descriptions</h2>
                {canEdit && (
                  <Dialog
                    open={isPartnerDescriptionFormOpen}
                    onOpenChange={(open) => {
                      setIsPartnerDescriptionFormOpen(open);
                      if (!open) setEditingItem(null);
                    }}
                  >
                    <DialogTrigger asChild>
                      <Button onClick={() => setEditingItem(null)}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Partner Description
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>
                          {editingItem ? "Edit" : "Add"} Partner Description
                        </DialogTitle>
                      </DialogHeader>
                      <PartnersForm
                        type="description"
                        data={editingItem}
                        onSubmit={(data) => {
                        // Convert FormData to JSON object for partner descriptions
                        const formObject = {
                          title: data.get("title"),
                          description: data.get("description"),
                        };
                        partnerDescriptionMutation.mutate(formObject as any);
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
                  {partnerDescription && partnerDescription.length > 0 ? (
                    partnerDescription.map((desc: any) => (
                    <TableRow key={desc.id}>
                      <TableCell>{desc.title}</TableCell>
                      <TableCell>{desc.description}</TableCell>
                      <TableCell className="space-x-2">
                        {canEdit && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setEditingItem(desc);
                              setIsPartnerDescriptionFormOpen(true);
                            }}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                        )}
                        {canDelete && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              if (
                                window.confirm(
                                  "Are you sure you want to delete this description?"
                                )
                              ) {
                                deletePartnerDescription.mutate(desc.id);
                              }
                            }}
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        )}
                        {!canEdit && !canDelete && (
                          <span className="text-xs text-gray-500 italic">View only</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center py-4">
                        No partner descriptions found. {canEdit && "Click 'Add Partner Description' to create one."}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </AdminLayout>
  );
};

export default AboutAdmin;
