
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { User, UserFormData } from "@/lib/types";
import { useState } from 'react';
import { userService } from '@/lib/api-service';
import debounce from 'lodash/debounce';
import { toast } from "sonner";
// Password validation imports removed

// User schema without password fields
const userSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().email("Please enter a valid email address"),
  first_name: z.string().optional(),
  last_name: z.string().optional(),
  role: z.string().default('viewer')
});

// Define the type based on the schema
type UserFormValues = z.infer<typeof userSchema>;

interface UserFormProps {
  user: User | null;
  onSubmit: (data: UserFormData) => void;
  onCancel: () => void;
}

export function UserForm({ user, onSubmit, onCancel }: UserFormProps) {
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [isUsernameValid, setIsUsernameValid] = useState(true);

  const form = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      username: user?.username || "",
      email: user?.email || "",
      first_name: user?.first_name || "",
      last_name: user?.last_name || "",
      role: typeof user?.role === 'object' ? user.role.role : (user?.role || "viewer"),
    },
  });

  // Modified checkUsername function
  const checkUsername = debounce(async (username: string) => {
    if (username.length < 3) {
      setIsUsernameValid(false);
      return;
    }

    // If username hasn't changed from current user's username, it's valid
    if (user && user.username === username) {
      setIsUsernameValid(true);
      setUsernameError(null);
      return;
    }

    setIsCheckingUsername(true);
    try {
      const available = await userService.checkUsername(
        username,
        user?.id?.toString()
      );

      setIsUsernameValid(available);
      if (!available) {
        setUsernameError("This username is already taken");
        form.setError("username", {
          type: "manual",
          message: "This username is already taken"
        });
      } else {
        setUsernameError(null);
        form.clearErrors("username");
      }
    } catch (error) {
      console.error('Error checking username:', error);
      setIsUsernameValid(false);
    } finally {
      setIsCheckingUsername(false);
    }
  }, 500);

  // Modified handleSubmit function
  const handleSubmit = async (data: UserFormData) => {
    // Check username availability one final time before submission
    if (!isUsernameValid) {
      toast.error("Please choose a different username");
      return;
    }

    if (isCheckingUsername) {
      toast.error("Please wait while username is being verified");
      return;
    }

    // Only proceed if username is valid and not being checked
    onSubmit(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Username</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      {...field}
                      onChange={(e) => {
                        field.onChange(e);
                        checkUsername(e.target.value);
                      }}
                      className={usernameError ? "border-red-500" : ""}
                    />
                    {isCheckingUsername && (
                      <div className="absolute right-2 top-2">
                        <span className="loading loading-spinner loading-sm" />
                      </div>
                    )}
                  </div>
                </FormControl>
                {usernameError && (
                  <p className="text-sm text-red-500 mt-1">{usernameError}</p>
                )}
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input type="email" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="first_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>First Name</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="last_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Last Name</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="role"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Role</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  value={field.value} // Add this to ensure the value is controlled
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="viewer">Viewer</SelectItem>
                    <SelectItem value="editor">Editor</SelectItem>
                    <SelectItem value="admin">Administrator</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Password fields have been moved to a separate form */}

        <div className="flex justify-end space-x-2">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isCheckingUsername || !isUsernameValid}
          >
            {user ? "Update" : "Create"} User
          </Button>
        </div>
      </form>
    </Form>
  );
}












