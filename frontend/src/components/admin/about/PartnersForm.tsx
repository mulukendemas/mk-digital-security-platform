import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";

interface Partners {
  name: string;
  logo: FileList | null;
}

interface PartnersDescription {
  title: string;
  description: string;
}

interface PartnersFormProps {
  type: 'partner' | 'description';
  data?: {
    name?: string;
    logo?: string;
    title?: string;
    description?: string;
  };
  onSubmit: (data: FormData) => void;
}

export function PartnersForm({ type, data, onSubmit }: PartnersFormProps) {
  // State to store preview URL for selected image
  const [previewUrl, setPreviewUrl] = useState<string | null>(data?.logo || null);
  const form = useForm<Partners | PartnersDescription>({
    defaultValues: type === 'partner'
      ? {
          name: data?.name || "",
          logo: null,
        }
      : {
          title: data?.title || "",
          description: data?.description || "",
        },
  });

  const handleSubmit = (values: Partners | PartnersDescription) => {
    if (type === 'partner') {
      const formData = new FormData();
      const partnerValues = values as Partners;
      formData.append('name', partnerValues.name);

      // Check if we have a new logo file to upload
      if (partnerValues.logo && partnerValues.logo.length > 0) {
        console.log('Appending logo file:', partnerValues.logo[0]);
        formData.append('logo_file', partnerValues.logo[0]);
      } else if (data?.logo) {
        // If we're editing and there's no new file but there is an existing logo,
        // we need to keep the existing logo
        console.log('Keeping existing logo:', data.logo);
      }

      // Log the FormData contents for debugging
      console.log('FormData entries:');
      for (const pair of formData.entries()) {
        console.log(pair[0], pair[1]);
      }

      onSubmit(formData);
    } else {
      // For partner descriptions, send as regular JSON
      const descriptionValues = values as PartnersDescription;
      const formData = new FormData();
      formData.append('title', descriptionValues.title);
      formData.append('description', descriptionValues.description);
      onSubmit(formData);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        {type === 'partner' ? (
          <>
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Partner Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter partner name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="logo"
              render={({ field: { value, onChange, ...field } }) => (
                <FormItem>
                  <FormLabel>Partner Logo</FormLabel>
                  <FormControl>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        onChange(e.target.files);

                        // Create preview URL for the selected file
                        if (e.target.files && e.target.files.length > 0) {
                          const file = e.target.files[0];
                          const url = URL.createObjectURL(file);
                          setPreviewUrl(url);
                          console.log('Created preview URL:', url);
                        }
                      }}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Show preview of selected file or current logo */}
            {previewUrl && (
              <div className="mt-2">
                <p className="text-sm text-muted-foreground">
                  {data?.logo ? 'Current logo:' : 'Selected logo preview:'}
                </p>
                <img
                  src={previewUrl}
                  alt="Logo preview"
                  className="w-20 h-20 object-contain mt-1 border border-gray-200 rounded p-1"
                />
              </div>
            )}
          </>
        ) : (
          <>
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter description" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        )}

        <Button type="submit" className="w-full">
          {data ? 'Update' : 'Add'} {type === 'partner' ? 'Partner' : 'Description'}
        </Button>
      </form>
    </Form>
  );
}
