import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";

interface MissionVision {
  title: string;
  missionTitle: string;
  mission: string;
  visionTitle: string;
  vision: string;
}

interface MissionVisionFormProps {
  data?: MissionVision;
  onSubmit: (data: MissionVision) => void;
}

const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  missionTitle: z.string().min(1, "Mission title is required"),
  mission: z.string().min(1, "Mission is required"),
  visionTitle: z.string().min(1, "Vision title is required"),
  vision: z.string().min(1, "Vision is required"),
});

export function MissionVisionForm({ data, onSubmit }: MissionVisionFormProps) {
  const form = useForm<MissionVision>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: data?.title || "",
      missionTitle: data?.missionTitle || "",
      mission: data?.mission || "",
      visionTitle: data?.visionTitle || "",
      vision: data?.vision || "",
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Section Title</FormLabel>
              <FormControl>
                <Input 
                  placeholder="Enter section title"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="missionTitle"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Mission Title</FormLabel>
              <FormControl>
                <Input 
                  placeholder="Enter mission title"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="mission"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Mission</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Enter company mission"
                  className="min-h-[150px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="visionTitle"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Vision Title</FormLabel>
              <FormControl>
                <Input 
                  placeholder="Enter vision title"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="vision"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Vision</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Enter company vision"
                  className="min-h-[150px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full">
          {data ? 'Update Mission & Vision' : 'Add Mission & Vision'}
        </Button>
      </form>
    </Form>
  );
}
