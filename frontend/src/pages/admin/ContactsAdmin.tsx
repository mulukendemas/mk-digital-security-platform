
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import AdminLayout from "@/components/admin/AdminLayout";
import { contactsService, contactInfoService, contactDescriptionService } from "@/lib/api-service";
import { ContactMessage, ContactInfo, ContactDescription } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Eye, Trash, Calendar, Mail, Plus, Pencil } from "lucide-react";
import { toast } from "sonner";
import ContactMessageDetail from "@/components/admin/ContactMessageDetail";
import ContactForm from "@/components/admin/ContactForm";
import ContactInfoForm from "@/components/admin/ContactInfoForm";
import ContactDescriptionForm from "@/components/admin/ContactDescriptionForm";

const formatDate = (dateString: string | undefined): string => {
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

const ContactsAdmin = () => {
  const [activeTab, setActiveTab] = useState("messages");
  const [isMessageFormOpen, setIsMessageFormOpen] = useState(false);
  const [isInfoFormOpen, setIsInfoFormOpen] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [selectedInfo, setSelectedInfo] = useState<ContactInfo | null>(null);
  const [isDescriptionFormOpen, setIsDescriptionFormOpen] = useState(false);
  const [selectedDescription, setSelectedDescription] = useState<ContactDescription | null>(null);
  const queryClient = useQueryClient();
  const { hasPermission } = useAuth();

  // Check if user has edit permissions
  const canEdit = hasPermission('editor');
  const canDelete = hasPermission('admin');

  // Messages Query
  const {
    data: messages = [],
    isLoading: messagesLoading,
    error: messagesError,
    isError: isMessagesError
  } = useQuery({
    queryKey: ["contacts", "messages"],
    queryFn: async () => {
      const response = await contactsService.getAll();
      console.log('Backend Messages Data:', response); // Log the entire response
      console.log('First message example:', response[0]); // Log the first message for detailed inspection
      return response;
    },
    retry: 1,
  });

  // Contact Info Query
  const {
    data: contactInfo = [],
    isLoading: infoLoading,
    error: infoError,
    isError: isInfoError
  } = useQuery({
    queryKey: ["contacts", "info"],
    queryFn: contactInfoService.getAll,
    retry: 1,
  });

  // Contact Descriptions Query
  const {
    data: descriptions = [],
    isLoading: descriptionsLoading
  } = useQuery({
    queryKey: ["contact-descriptions"],
    queryFn: contactDescriptionService.getAll,
    retry: 1,
  });

  // Messages Mutations
  const createMessageMutation = useMutation({
    mutationFn: (newMessage: Omit<ContactMessage, "id" | "createdAt">) => {
      return contactsService.create({ ...newMessage, createdAt: new Date().toISOString() });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contacts", "messages"] });
      toast.success("Message created successfully");
      handleCloseMessageForm();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || "Failed to create message");
    },
  });

  const updateMessageMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<ContactMessage> }) => {
      return contactsService.update(id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contacts", "messages"] });
      toast.success("Message updated successfully");
      handleCloseMessageForm();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || "Failed to update message");
    },
  });

  const deleteMessageMutation = useMutation({
    mutationFn: (id: string) => contactsService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contacts", "messages"] });
      toast.success("Message deleted successfully");
      setSelectedMessage(null);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || "Failed to delete message");
    },
  });

  // Contact Info Mutations
  const createInfoMutation = useMutation({
    mutationFn: (newInfo: Omit<ContactInfo, "id">) => {
      return contactInfoService.create(newInfo);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contacts", "info"] });
      toast.success("Contact info created successfully");
      handleCloseInfoForm();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || "Failed to create contact info");
    },
  });

  const updateInfoMutation = useMutation({
    mutationFn: ({ id, data }: { id: string | number; data: Partial<ContactInfo> }) => {
      console.log('Mutation received:', { id, data }); // Debug log
      return contactInfoService.update(id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contacts", "info"] });
      toast.success("Contact info updated successfully");
      handleCloseInfoForm();
    },
    onError: (error: any) => {
      console.error('Update error:', error);
      toast.error(error.response?.data?.detail || "Failed to update contact info");
    },
  });

  const deleteInfoMutation = useMutation({
    mutationFn: (id: string) => contactInfoService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contacts", "info"] });
      toast.success("Contact info deleted successfully");
      setSelectedInfo(null);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || "Failed to delete contact info");
    },
  });

  // Contact Descriptions Mutations
  const createDescriptionMutation = useMutation({
    mutationFn: (newDescription: Omit<ContactDescription, "id">) => {
      return contactDescriptionService.create(newDescription);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contact-descriptions"] });
      toast.success("Description created successfully");
      handleCloseDescriptionForm();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || "Failed to create description");
    },
  });

  const updateDescriptionMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<ContactDescription> }) => {
      return contactDescriptionService.update(id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contact-descriptions"] });
      toast.success("Description updated successfully");
      handleCloseDescriptionForm();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || "Failed to update description");
    },
  });

  const deleteDescriptionMutation = useMutation({
    mutationFn: (id: string) => contactDescriptionService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contact-descriptions"] });
      toast.success("Description deleted successfully");
      setSelectedDescription(null);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || "Failed to delete description");
    },
  });

  // Message Handlers
  const handleCreateMessage = (data: Omit<ContactMessage, "id" | "createdAt">) => {
    createMessageMutation.mutate(data);
  };

  const handleUpdateMessage = (data: Omit<ContactMessage, "id" | "createdAt">) => {
    if (selectedMessage) {
      updateMessageMutation.mutate({ id: selectedMessage.id, data });
    }
  };

  const handleDeleteMessage = (id: string) => {
    if (window.confirm("Are you sure you want to delete this message?")) {
      deleteMessageMutation.mutate(id);
    }
  };

  const handleCloseMessageForm = () => {
    setIsMessageFormOpen(false);
    setSelectedMessage(null);
  };

  // Contact Info Handlers
  const handleCreateInfo = (data: Omit<ContactInfo, "id">) => {
    createInfoMutation.mutate(data);
  };

  const handleUpdateInfo = (data: Omit<ContactInfo, "id">) => {
    if (selectedInfo && selectedInfo.id) {
      const id = selectedInfo.id;
      console.log('Handling update for:', { id, data }); // Debug log
      updateInfoMutation.mutate({ id, data });
    }
  };

  const handleDeleteInfo = (id: string) => {
    if (window.confirm("Are you sure you want to delete this contact info?")) {
      deleteInfoMutation.mutate(id);
    }
  };

  const handleCloseInfoForm = () => {
    setIsInfoFormOpen(false);
    setSelectedInfo(null);
  };

  // Description Handlers
  const handleCreateDescription = (data: Omit<ContactDescription, "id">) => {
    createDescriptionMutation.mutate(data);
  };

  const handleUpdateDescription = (data: Omit<ContactDescription, "id">) => {
    if (selectedDescription) {
      updateDescriptionMutation.mutate({ id: selectedDescription.id, data });
    }
  };

  const handleDeleteDescription = (id: string) => {
    if (window.confirm("Are you sure you want to delete this description?")) {
      deleteDescriptionMutation.mutate(id);
    }
  };

  const handleCloseDescriptionForm = () => {
    setIsDescriptionFormOpen(false);
    setSelectedDescription(null);
  };

  return (
    <AdminLayout title="Contact Management">
      <Tabs defaultValue="messages" className="space-y-6">
        <TabsList>
          <TabsTrigger value="messages">Messages</TabsTrigger>
          <TabsTrigger value="info">Contact Information</TabsTrigger>
          <TabsTrigger value="descriptions">Descriptions</TabsTrigger>
        </TabsList>

        <TabsContent value="messages">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-xl font-semibold">Contact Messages</h2>
              <p className="text-muted-foreground">
                Manage messages received through the contact form
              </p>
            </div>
            {/* <Button onClick={() => setIsMessageFormOpen(true)}>
              <Plus className="mr-2 h-4 w-4" /> Add New Message
            </Button> */}
          </div>

          {isMessageFormOpen && (
            <ContactForm
              initialData={selectedMessage}
              onSubmit={selectedMessage ? handleUpdateMessage : handleCreateMessage}
              onCancel={handleCloseMessageForm}
            />
          )}

          {!isMessageFormOpen && selectedMessage && (
            <ContactMessageDetail
              message={selectedMessage}
              onClose={() => setSelectedMessage(null)}
              onDelete={() => handleDeleteMessage(selectedMessage.id)}
              onEdit={() => setIsMessageFormOpen(true)}
            />
          )}

          {!isMessageFormOpen && !selectedMessage && (
            <MessagesTable
              messages={messages}
              isLoading={messagesLoading}
              onView={setSelectedMessage}
              onEdit={(message: ContactMessage) => {
                setSelectedMessage(message);
                setIsMessageFormOpen(true);
              }}
              onDelete={handleDeleteMessage}
              canEdit={canEdit}
              canDelete={canDelete}
            />
          )}
        </TabsContent>

        <TabsContent value="info">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Contact Information</h2>
            {canEdit && (
              <Button onClick={() => setIsInfoFormOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Contact Info
              </Button>
            )}
          </div>

          {isInfoFormOpen ? (
            <ContactInfoForm
              contactInfo={selectedInfo}
              onSubmit={(data) => {
                if (selectedInfo) {
                  updateInfoMutation.mutate({
                    id: selectedInfo.id,
                    data,
                  });
                } else {
                  createInfoMutation.mutate(data);
                }
              }}
              onCancel={handleCloseInfoForm}
            />
          ) : (
            <ContactInfoTable
              contactInfo={contactInfo}
              isLoading={infoLoading}
              onEdit={(info) => {
                setSelectedInfo(info);
                setIsInfoFormOpen(true);
              }}
              onDelete={handleDeleteInfo}
              canEdit={canEdit}
              canDelete={canDelete}
            />
          )}
        </TabsContent>

        <TabsContent value="descriptions">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-xl font-semibold">Contact Descriptions</h2>
              <p className="text-muted-foreground">
                Manage contact page descriptions
              </p>
            </div>
            {canEdit && (
              <Dialog open={isDescriptionFormOpen} onOpenChange={setIsDescriptionFormOpen}>
                <DialogTrigger asChild>
                  <Button onClick={() => setSelectedDescription(null)}>
                    <Plus className="mr-2 h-4 w-4" /> Add Description
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>
                      {selectedDescription ? "Edit Description" : "Add Description"}
                    </DialogTitle>
                  </DialogHeader>
                  <ContactDescriptionForm
                    initialData={selectedDescription}
                    onSubmit={selectedDescription ? handleUpdateDescription : handleCreateDescription}
                    onCancel={handleCloseDescriptionForm}
                  />
                </DialogContent>
              </Dialog>
            )}
          </div>

          <DescriptionsTable
            descriptions={descriptions}
            isLoading={descriptionsLoading}
            onEdit={(description: ContactDescription) => {
              setSelectedDescription(description);
              setIsDescriptionFormOpen(true);
            }}
            onDelete={handleDeleteDescription}
            canEdit={canEdit}
            canDelete={canDelete}
          />
        </TabsContent>
      </Tabs>
    </AdminLayout>
  );
};

// Separate components for tables
const MessagesTable = ({
  messages,
  isLoading,
  onView,
  onEdit,
  onDelete,
  canEdit,
  canDelete
}: {
  messages: ContactMessage[];
  isLoading: boolean;
  onView: (message: ContactMessage) => void;
  onEdit: (message: ContactMessage) => void;
  onDelete: (id: string) => void;
  canEdit: boolean;
  canDelete: boolean;
}) => {
  // Use the canEdit and canDelete props
  console.log('Messages being rendered:', { messages, canEdit, canDelete });

  if (isLoading) {
    return (
      <div className="p-8 text-center">
        <div className="animate-spin h-8 w-8 border-4 border-navy border-t-transparent rounded-full mx-auto mb-4"></div>
        <p>Loading messages...</p>
      </div>
    );
  }

  return (
    <Table>
      <TableCaption>Contact messages from website visitors</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Status</TableHead>
          <TableHead>Name</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Subject</TableHead>
          <TableHead>Date</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {messages.length === 0 ? (
          <TableRow>
            <TableCell colSpan={6} className="text-center py-8">
              No messages found.
            </TableCell>
          </TableRow>
        ) : (
          messages.map((message) => (
            <TableRow key={message.id} className={message.read ? "" : "bg-blue-50"}>
              <TableCell>
                <Badge variant={message.read ? "outline" : "default"}>
                  {message.read ? "Read" : "New"}
                </Badge>
              </TableCell>
              <TableCell className="font-medium">{message.name}</TableCell>
              <TableCell>{message.email}</TableCell>
              <TableCell>{message.subject}</TableCell>
              <TableCell>
                <div className="flex items-center text-muted-foreground">
                  <Calendar className="mr-2 h-4 w-4" />
                  {formatDate(message.createdAt)}
                </div>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onView(message)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  {canDelete && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDelete(message.id)}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
};

const ContactInfoTable = ({
  contactInfo,
  isLoading,
  onEdit,
  onDelete,
  canEdit,
  canDelete
}: {
  contactInfo: ContactInfo[];
  isLoading: boolean;
  onEdit: (info: ContactInfo) => void;
  onDelete: (id: string) => void;
  canEdit: boolean;
  canDelete: boolean;
}) => {
  if (isLoading) {
    return (
      <div className="p-8 text-center">
        <div className="animate-spin h-8 w-8 border-4 border-navy border-t-transparent rounded-full mx-auto mb-4"></div>
        <p>Loading contact information...</p>
      </div>
    );
  }

  return (
    <Table>
      <TableCaption>Contact information displayed on the website</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Order</TableHead>
          <TableHead>Title</TableHead>
          <TableHead>Icon</TableHead>
          <TableHead>Details</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {contactInfo.length === 0 ? (
          <TableRow>
            <TableCell colSpan={5} className="text-center py-8">
              No contact information found.
            </TableCell>
          </TableRow>
        ) : (
          contactInfo.map((info) => (
            <TableRow key={info.id}>
              <TableCell>{info.order}</TableCell>
              <TableCell className="font-medium">{info.title}</TableCell>
              <TableCell>{info.icon}</TableCell>
              <TableCell>
                <ul className="list-disc list-inside">
                  {Array.isArray(info.details) && info.details.map((detail, index) => (
                    <li key={index}>{detail}</li>
                  ))}
                </ul>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  {canEdit && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit(info)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                  )}
                  {canDelete && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDelete(info.id)}
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
  );
};

const DescriptionsTable = ({
  descriptions,
  isLoading,
  onEdit,
  onDelete,
  canEdit,
  canDelete
}: {
  descriptions: ContactDescription[];
  isLoading: boolean;
  onEdit: (description: ContactDescription) => void;
  onDelete: (id: string) => void;
  canEdit: boolean;
  canDelete: boolean;
}) => {
  if (isLoading) {
    return (
      <div className="p-8 text-center">
        <div className="animate-spin h-8 w-8 border-4 border-navy border-t-transparent rounded-full mx-auto mb-4"></div>
        <p>Loading descriptions...</p>
      </div>
    );
  }

  return (
    <Table>
      <TableCaption>Contact page descriptions</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Title</TableHead>
          <TableHead>Description</TableHead>
          <TableHead>Background Image</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {descriptions.length === 0 ? (
          <TableRow>
            <TableCell colSpan={4} className="text-center py-8">
              No descriptions found.
            </TableCell>
          </TableRow>
        ) : (
          descriptions.map((description) => (
            <TableRow key={description.id}>
              <TableCell className="font-medium">{description.title}</TableCell>
              <TableCell>{description.description}</TableCell>
              <TableCell>
                {description.background_image ? (
                  <div className="relative w-16 h-16 rounded overflow-hidden">
                    <img
                      src={description.background_image}
                      alt="Background"
                      className="object-cover w-full h-full"
                    />
                  </div>
                ) : (
                  <span className="text-gray-400 text-sm">No image</span>
                )}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  {canEdit && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit(description)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                  )}
                  {canDelete && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDelete(description.id)}
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
  );
};

export default ContactsAdmin;





























