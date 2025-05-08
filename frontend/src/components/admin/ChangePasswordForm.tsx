import { z } from "zod";
import { useState } from "react";
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
import { toast } from "sonner";
import { usePasswordPolicy } from "@/hooks/usePasswordPolicy";
import { createPasswordSchema, formatPasswordPolicy } from "@/lib/password-validator";
import { userService } from "@/lib/api-service";

// Create the schema with password validation
const createChangePasswordSchema = (passwordPolicy: any) => {
  // Create a password schema based on the policy
  const passwordSchema = createPasswordSchema(passwordPolicy);

  return z.object({
    password: passwordSchema,
    confirmPassword: z.string(),
  }).refine((data) => {
    return data.password === data.confirmPassword;
  }, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });
};

interface ChangePasswordFormProps {
  userId: string;
  onSuccess?: () => void;
  onCancel: () => void;
}

export function ChangePasswordForm({ userId, onSuccess, onCancel }: ChangePasswordFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch the password policy from site settings
  const { passwordPolicy, isLoading: policyLoading } = usePasswordPolicy();

  // Create the schema with the current password policy
  const passwordSchema = createChangePasswordSchema(passwordPolicy);

  const form = useForm({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const handleSubmit = async (data: { password: string; confirmPassword: string }) => {
    if (data.password !== data.confirmPassword) {
      form.setError("confirmPassword", {
        type: "manual",
        message: "Passwords don't match"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Format the user ID
      const formattedId = userId.endsWith('/') ? userId : `${userId}/`;

      // Only send the password field
      await userService.update(formattedId, { password: data.password });

      toast.success("Password updated successfully");

      // Reset the form
      form.reset();

      // Call the onSuccess callback if provided
      if (onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
      console.error("Failed to update password:", error);

      // Handle validation errors
      if (error.response?.data) {
        const errorData = error.response.data;

        if (errorData.password) {
          form.setError("password", {
            type: "manual",
            message: Array.isArray(errorData.password)
              ? errorData.password[0]
              : errorData.password
          });
        } else {
          toast.error(error.response?.data?.detail || "Failed to update password");
        }
      } else {
        toast.error("Failed to update password");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>New Password</FormLabel>
              <FormControl>
                <Input type="password" {...field} />
              </FormControl>
              <FormDescription className="whitespace-pre-line">
                {`Password requirements:
• ${formatPasswordPolicy(passwordPolicy)}`}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirm New Password</FormLabel>
              <FormControl>
                <Input type="password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

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
            disabled={isSubmitting}
          >
            {isSubmitting ? "Updating..." : "Update Password"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
