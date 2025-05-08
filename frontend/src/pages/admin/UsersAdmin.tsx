
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import AdminLayout from "@/components/admin/AdminLayout";
import { User, UserFormData } from "@/lib/types";
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
import { Edit, Trash, Plus, UserCircle, Clock, Key } from "lucide-react";
import { toast } from "sonner";
import { UserForm } from "@/components/admin/UserForm";
import { ChangePasswordForm } from "@/components/admin/ChangePasswordForm";
import { userService } from "@/lib/api-service"; // Import userService

const UsersAdmin = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isPasswordFormOpen, setIsPasswordFormOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const queryClient = useQueryClient();

  const { data: users = [], isLoading, error } = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const response = await userService.getAll();

      // Transform the data to match the approach in ProductsAdmin
      return response.map((user: any) => ({
        id: user.id,
        username: user.username,
        email: user.email,
        name: user.name,
        role: user.role,
        // Use date_joined as the created_at field
        created_at: user.date_joined,
      }));
    },
  });

  const createMutation = useMutation({
    mutationFn: (formData: UserFormData) => {
      const { confirmPassword, ...userData } = formData;
      const formattedData = {
        ...userData,
        role: userData.role
      };
      return userService.create(formattedData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("User created successfully");
      handleCloseForm();
    },
    onError: (error: any) => {
      console.error('Error creating user:', error);
      let errorMessage = "Failed to create user";

      try {
        const errorData = JSON.parse(error.message);
        if (errorData.detail) {
          if (typeof errorData.detail === 'string') {
            errorMessage = errorData.detail;
          } else {
            const fieldErrors = JSON.parse(errorData.detail);
            if (fieldErrors.username) {
              errorMessage = `Username error: ${fieldErrors.username}`;
            } else {
              errorMessage = Object.entries(fieldErrors)
                .map(([field, errors]) => `${field}: ${errors}`)
                .join(', ');
            }
          }
        }
      } catch (e) {
        errorMessage = error.response?.data?.detail || "Failed to create user";
      }

      toast.error(errorMessage);
    },
  });

  const handleCreateUser = async (data: UserFormData) => {
    console.log('handleCreateUser called with:', data); // Debug log
    try {
      await createMutation.mutateAsync(data);
    } catch (error) {
      console.error("Failed to create user:", error);
    }
  };

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UserFormData }) => {
      const { confirmPassword, ...userData } = data;

      // Create an object with only the modified fields
      const updatedFields: Partial<UserFormData> = {};

      // Only include password if it was provided
      if (userData.password) {
        updatedFields.password = userData.password;
      }

      // Only include other fields if they've changed from the current values
      if (selectedUser) {
        if (userData.first_name !== selectedUser.first_name) {
          updatedFields.first_name = userData.first_name;
        }
        if (userData.last_name !== selectedUser.last_name) {
          updatedFields.last_name = userData.last_name;
        }
        if (userData.role !== selectedUser.role) {
          updatedFields.role = userData.role;
        }
        // Only include username and email if they've actually changed
        if (userData.username !== selectedUser.username) {
          updatedFields.username = userData.username;
        }
        if (userData.email !== selectedUser.email) {
          updatedFields.email = userData.email;
        }
      }

      const formattedId = id.endsWith('/') ? id : `${id}/`;
      return userService.update(formattedId, updatedFields);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("User updated successfully");
      handleCloseForm();
    },
    onError: (error: any) => {
      console.error('Update error:', error);
      let errorMessage = "Failed to update user";

      try {
        const errorData = JSON.parse(error.message);
        if (errorData.username) {
          errorMessage = Array.isArray(errorData.username)
            ? errorData.username[0]
            : errorData.username;
        } else if (errorData.detail) {
          errorMessage = errorData.detail;
        } else {
          errorMessage = Object.entries(errorData)
            .map(([field, errors]) => {
              const errorMsg = Array.isArray(errors) ? errors[0] : errors;
              return `${field}: ${errorMsg}`;
            })
            .join(', ');
        }
      } catch (e) {
        errorMessage = error.message || "Failed to update user";
      }

      toast.error(errorMessage);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => userService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("User deleted successfully");
    },
    onError: (error: any) => {
      console.error("Delete error:", error);
      toast.error(error.response?.data?.detail || "Failed to delete user");
    },
  });

  const handleUpdateUser = (userData: UserFormData) => {
    if (selectedUser) {
      updateMutation.mutate({ id: String(selectedUser.id), data: userData });
    }
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setIsFormOpen(true);
  };

  const handleDeleteUser = (id: string) => {
    // Prevent deleting the admin user
    if (id === "1") {
      toast.error("Cannot delete the main admin user");
      return;
    }

    if (window.confirm("Are you sure you want to delete this user?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleAddNew = () => {
    setSelectedUser(null);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setSelectedUser(null);
  };

  const handleOpenPasswordForm = (user: User) => {
    setSelectedUser(user);
    setIsPasswordFormOpen(true);
  };

  const handleClosePasswordForm = () => {
    setIsPasswordFormOpen(false);
    setSelectedUser(null);
  };

  const getRoleBadgeVariant = (role: { role: 'admin' | 'editor' | 'viewer' } | null) => {
    // Default to viewer if role is null
    if (!role) return "secondary";

    switch (role.role) {
      case "admin":
        return "destructive";
      case "editor":
        return "default";
      default:
        return "secondary";
    }
  };

  // Helper function to get display name
  const getDisplayName = (user: User): string => {
    if (user.name) return user.name;
    if (user.first_name || user.last_name) {
      return `${user.first_name} ${user.last_name}`.trim();
    }
    return user.username;
  };

  // Simple formatDate function matching ProductsAdmin
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

  if (error) {
    return (
      <AdminLayout title="User Management">
        <div className="bg-red-50 p-4 rounded-md">
          <p className="text-red-500">Error loading users: {(error as any).message}</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="User Management">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-lg font-medium">Manage Users</h2>
          <p className="text-muted-foreground">
            Add, edit, or remove users and manage their access rights
          </p>
        </div>
        <Button onClick={handleAddNew} className="flex items-center gap-2">
          <Plus className="h-4 w-4" /> Add New User
        </Button>
      </div>

      {isFormOpen ? (
        <UserForm
          user={selectedUser}
          onSubmit={selectedUser ? handleUpdateUser : handleCreateUser}
          onCancel={handleCloseForm}
        />
      ) : isPasswordFormOpen && selectedUser ? (
        <div className="bg-white rounded-md shadow p-6">
          <h2 className="text-xl font-bold mb-4">Change Password for {getDisplayName(selectedUser)}</h2>
          <ChangePasswordForm
            userId={String(selectedUser.id)}
            onSuccess={handleClosePasswordForm}
            onCancel={handleClosePasswordForm}
          />
        </div>
      ) : (
        <div className="bg-white rounded-md shadow">
          {isLoading ? (
            <div className="p-8 text-center">
              <p>Loading users...</p>
            </div>
          ) : (
            <Table>
              <TableCaption>A list of system users</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Username</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      No users found. Click "Add New User" to create one.
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center">
                          <UserCircle className="mr-2 h-5 w-5 text-muted-foreground" />
                          {getDisplayName(user)}
                        </div>
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.username}</TableCell>
                      <TableCell>
                        <Badge variant={getRoleBadgeVariant(
                          typeof user.role === 'object' && user.role?.role ? user.role : { role: (user.role || 'viewer') as 'admin' | 'editor' | 'viewer' }
                        )}>
                          {typeof user.role === 'object' && user.role?.role ? (
                            user.role.role.charAt(0).toUpperCase() + user.role.role.slice(1)
                          ) : (
                            'Viewer'
                          )}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center text-muted-foreground">
                          <Clock className="mr-2 h-4 w-4" />
                          {user.created_at ? formatDate(user.created_at) : 'N/A'}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditUser(user)}
                            title="Edit User"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenPasswordForm(user)}
                            title="Change Password"
                          >
                            <Key className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteUser(String(user.id))}
                            disabled={String(user.id) === "1"}
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
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
    </AdminLayout>
  );
};

export default UsersAdmin;























