import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

// Create a schema factory function that takes the editing state
const createFormSchema = (isEditing: boolean) => z.object({
  name: z.string().min(1, "Name is required"),
  position: z.string().min(1, "Position is required"),
  image: z.any().refine(val => {
    // For new team members, image is required
    if (!isEditing) {
      // Check if val is a File or a FileList
      if (val instanceof File) {
        return true; // File is valid
      } else if (val instanceof FileList && val.length > 0) {
        return true; // FileList with items is valid
      }
      return false; // No file selected
    }
    // For existing team members, image is optional
    return true;
  }, "Image is required for new team members"),
});

// Define the form data type
type TeamMemberFormData = {
  name: string;
  position: string;
  image?: FileList;
};

interface TeamFormProps {
  data?: any;
  onSubmit: (data: FormData) => void;
}

export function TeamForm({ data, onSubmit }: TeamFormProps) {
  // Determine if we're editing an existing team member
  const isEditing = !!data?.id;

  // Create the form schema based on whether we're editing
  const formSchema = createFormSchema(isEditing);

  const form = useForm<TeamMemberFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: data?.name || "",
      position: data?.position || "",
      image: undefined,
    },
  });

  const handleSubmit = (formData: TeamMemberFormData) => {
    console.log('=== TEAM FORM SUBMISSION START ===');
    console.log('Original form data:', formData);
    console.log('Is editing?', isEditing);
    console.log('Current data:', data);

    // Create a new FormData object
    const submitData = new FormData();

    // Add basic fields
    submitData.append('name', formData.name);
    submitData.append('position', formData.position);
    console.log('Added basic fields: name, position');

    // Handle image upload - following the same pattern as TargetMarketForm
    console.log('Image type check:', {
      isFile: formData.image instanceof File,
      isFileList: formData.image instanceof FileList,
      hasFileList: formData.image && formData.image[0],
      imageType: formData.image ? typeof formData.image : 'undefined',
      imageValue: formData.image
    });

    if (formData.image instanceof File) {
      // If formData.image is already a File object (from the TargetMarketForm pattern)
      console.log('Appending image as File object:', {
        name: formData.image.name,
        type: formData.image.type,
        size: formData.image.size
      });

      // Use a more explicit way to append the file with its name
      submitData.append('image', formData.image, formData.image.name);

      // Double-check that the image was appended correctly
      const imageCheck = submitData.get('image');
      console.log('Image check after append:', {
        hasImage: !!imageCheck,
        isFile: imageCheck instanceof File,
        fileName: imageCheck instanceof File ? imageCheck.name : 'N/A'
      });
    } else if (formData.image && formData.image[0]) {
      // If formData.image is a FileList (from our current implementation)
      const imageFile = formData.image[0];
      console.log('Appending image from FileList:', {
        name: imageFile.name,
        type: imageFile.type,
        size: imageFile.size
      });

      // Use a more explicit way to append the file with its name
      submitData.append('image', imageFile, imageFile.name);

      // Double-check that the image was appended correctly
      const imageCheck = submitData.get('image');
      console.log('Image check after append:', {
        hasImage: !!imageCheck,
        isFile: imageCheck instanceof File,
        fileName: imageCheck instanceof File ? imageCheck.name : 'N/A'
      });
    } else if (!isEditing) {
      // For new team members, image is required
      console.error('No image selected for new team member');
      toast.error('Please select an image for the team member');
      return; // Don't submit the form
    } else {
      console.log('No new image selected for existing team member');
    }

    // Log the FormData contents for debugging
    console.log('Final FormData contents:');
    for (const pair of submitData.entries()) {
      if (pair[1] instanceof File) {
        console.log(`${pair[0]}: File(${(pair[1] as File).name}, ${(pair[1] as File).type}, ${(pair[1] as File).size} bytes)`);
      } else {
        console.log(`${pair[0]}: ${pair[1]}`);
      }
    }
    console.log('=== TEAM FORM SUBMISSION END ===');

    // If editing, include the ID
    if (data?.id) {
      submitData.append('id', data.id.toString());
    }

    // Log the final form data
    console.log('Submitting form data:');
    for (const pair of submitData.entries()) {
      console.log(`${pair[0]}: ${pair[1]}`);
    }

    onSubmit(submitData);
  };

  // Log form state for debugging
  console.log('Form state:', {
    isValid: form.formState.isValid,
    errors: form.formState.errors,
    isDirty: form.formState.isDirty,
    dirtyFields: form.formState.dirtyFields,
    touchedFields: form.formState.touchedFields,
  });

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(
          handleSubmit,
          (errors) => {
            console.error('Form validation errors:', errors);
            if (errors.image) {
              toast.error('Please select an image for the team member');
            }
          }
        )}
        className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="position"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Position</FormLabel>
              <FormControl>
                <Input placeholder="Enter position" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="image"
          render={({ field: { onChange, value, ...field } }) => (
            <FormItem>
              <FormLabel>{isEditing ? "Update Image (Optional)" : "Image *"}</FormLabel>
              <FormControl>
                <div className="flex flex-col gap-2">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        console.log('File selected:', {
                          name: file.name,
                          type: file.type,
                          size: file.size
                        });
                        // Store the File object directly (not the FileList)
                        onChange(file);

                        // Trigger validation immediately after file selection
                        form.trigger('image');
                      }
                    }}
                    // Don't pass the value prop to the file input
                    // as it's read-only and will cause a React warning
                    {...field}
                    value={undefined}
                    className="cursor-pointer"
                  />
                  {!isEditing && (
                    <p className="text-xs text-red-500">* Required</p>
                  )}
                </div>
              </FormControl>
              <p className="text-xs text-muted-foreground mt-1">
                {isEditing
                  ? "Leave empty to keep the current image"
                  : "Please select an image for the team member (required)"}
              </p>
              <FormMessage />
            </FormItem>
          )}
        />

        {isEditing && data?.image && (
          <div className="mt-4 p-4 border rounded-md bg-gray-50">
            <p className="text-sm font-medium mb-2">Current Image:</p>
            <div className="flex justify-center">
              <img
                src={typeof data.image === 'string' ? data.image : URL.createObjectURL(data.image)}
                alt={data.name}
                className="w-32 h-32 object-cover rounded-md shadow-sm"
                onError={(e) => {
                  console.error('Error loading image:', data.image);
                  e.currentTarget.src = '/placeholder.svg';
                }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-2 text-center">
              Upload a new image above to replace this one
            </p>
          </div>
        )}

        <Button type="submit" className="w-full">
          {data ? 'Update' : 'Add'} Team Member
        </Button>
      </form>
    </Form>
  );
}
