import React from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { ContactInfo } from "@/lib/types";
import { Textarea } from "@/components/ui/textarea";

interface ContactInfoFormProps {
  contactInfo?: ContactInfo | null;
  onSubmit: (data: Omit<ContactInfo, "id">) => void;
  onCancel: () => void;
}

const ContactInfoForm: React.FC<ContactInfoFormProps> = ({
  contactInfo,
  onSubmit,
  onCancel,
}) => {
  const form = useForm({
    defaultValues: {
      icon: contactInfo?.icon || "",
      title: contactInfo?.title || "",
      details: contactInfo?.details?.join("\n") || "",
      order: contactInfo?.order || 0,
    },
  });

  const handleSubmit = (values: any) => {
    const formattedData = {
      icon: values.icon,
      title: values.title,
      details: values.details.split("\n").filter((detail: string) => detail.trim() !== ""),
      order: parseInt(values.order),
    };
    onSubmit(formattedData);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="icon"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Icon Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g., MapPin, Phone, Mail" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Visit Us, Call Us" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="details"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Details (one per line)</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Enter details, one per line"
                  {...field}
                  rows={4}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="order"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Display Order</FormLabel>
              <FormControl>
                <Input type="number" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">
            {contactInfo ? "Update" : "Create"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default ContactInfoForm;






