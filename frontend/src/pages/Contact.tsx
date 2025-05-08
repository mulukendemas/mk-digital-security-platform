
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Mail, Phone, MapPin, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { useQuery, useMutation } from "@tanstack/react-query";
import { contactsService, contactInfoService, contactDescriptionService } from "@/lib/api-service";
import { ContactInfo, ContactDescription } from "@/lib/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

// Define the form schema
const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  subject: z.string().min(2, "Subject must be at least 2 characters"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

type ContactFormValues = z.infer<typeof formSchema>;

const Contact = () => {
  const { toast } = useToast();

  // Fetch descriptions
  const {
    data: descriptions = [],
    isLoading: isDescriptionsLoading
  } = useQuery({
    queryKey: ["contact-descriptions"],
    queryFn: contactDescriptionService.getAll
  });

  // Fetch contact info
  const {
    data: contactInfo = [],
    isLoading: isContactInfoLoading
  } = useQuery({
    queryKey: ["contact-info"],
    queryFn: contactInfoService.getAll
  });

  // Initialize form
  const form = useForm<ContactFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      subject: "",
      message: "",
    },
  });

  // Create contact message mutation
  const createContactMutation = useMutation({
    mutationFn: (data: ContactFormValues) => {
      // Debug log
      console.log('Submitting contact form to:', import.meta.env.VITE_API_URL);
      console.log('Form data:', data);

      const contactData = {
        name: data.name,
        email: data.email,
        subject: data.subject,
        message: data.message
      };

      return contactsService.create(contactData);
    },
    onSuccess: () => {
      toast({
        title: "Message Sent",
        description: "Thank you for your message. We'll get back to you soon.",
      });
      form.reset();
    },
    onError: (error: any) => {
      // Enhanced error logging
      console.error('Contact form error:', error);
      console.error('Error details:', {
        status: error.response?.status,
        data: error.response?.data,
        config: error.config
      });

      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive"
      });
    }
  });

  // Form submit handler
  const onSubmit = (data: ContactFormValues) => {
    createContactMutation.mutate(data);
  };

  // Helper function to render icon
  const renderIcon = (iconName: string) => {
    const icons = {
      MapPin: <MapPin className="h-6 w-6 text-gray-700" />,
      Phone: <Phone className="h-6 w-6 text-gray-700" />,
      Mail: <Mail className="h-6 w-6 text-gray-700" />,
      Clock: <Clock className="h-6 w-6 text-gray-700" />
    };
    return icons[iconName as keyof typeof icons] || null;
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-grow">
        {/* Hero Section with Description - Matching the About Us page approach */}
        <section className="pt-24 text-white relative overflow-hidden h-[500px]">
          <div className="absolute inset-0 opacity-100 bg-gray-100">
            {!isDescriptionsLoading && descriptions.length > 0 && descriptions[0].background_image ? (
              <img
                src={descriptions[0].background_image}
                alt="Contact Hero Background"
                className="w-full h-full object-contain"
                style={{
                  objectPosition: 'center center'
                }}
                onError={(e) => {
                  console.error("Error loading contact hero image:", (e.target as HTMLImageElement).src);
                  // Hide the image on error
                  (e.target as HTMLImageElement).style.display = 'none';

                  // Create a gradient background div and append it to the parent
                  const parent = (e.target as HTMLImageElement).parentElement;
                  if (parent) {
                    const gradientDiv = document.createElement('div');
                    gradientDiv.className = "w-full h-full bg-gradient-to-r from-navy to-blue-900";
                    parent.appendChild(gradientDiv);
                  }
                }}
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-r from-navy to-blue-900"></div>
            )}
            {/* No overlay to let the original image display without modifications */}
          </div>

          {/* Content Container - Title and description commented out as requested */}
          {/*
          <div className="container-lg py-24 text-center relative z-10 px-8">
            <div className="bg-black/20 py-6 px-8 rounded-lg backdrop-blur-sm inline-block">
              {isDescriptionsLoading ? (
                <div>Loading...</div>
              ) : descriptions.length > 0 ? (
                <>
                  <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-white">
                    {descriptions[0].title}
                  </h1>
                  <p className="text-lg md:text-xl text-white max-w-3xl mx-auto font-medium">
                    {descriptions[0].description}
                  </p>
                </>
              ) : (
                <>
                  <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-white">Get In Touch</h1>
                  <p className="text-lg md:text-xl text-white max-w-3xl mx-auto font-medium">
                    Have questions about our products or services? We're here to help.
                  </p>
                </>
              )}
            </div>
          </div>
          */}
        </section>
        {/* Contact Information */}
        <section className="py-12 bg-white">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {isContactInfoLoading ? (
                <div>Loading contact information...</div>
              ) : (
                contactInfo.map((info: ContactInfo) => (
                  <Card key={info.id} className="border-none shadow-md hover-card">
                    <CardContent className="p-6 text-center">
                      <div className="mx-auto bg-gray-100 p-3 rounded-full w-fit mb-4">
                        {renderIcon(info.icon)}
                      </div>
                      <h3 className="font-bold text-xl mb-3 text-gray-800">{info.title}</h3>
                      {info.details.map((detail, idx) => (
                        <p key={idx} className="text-mkdss-darkgray">{detail}</p>
                      ))}
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        </section>

        {/* Additional Descriptions Section */}
        {descriptions.length > 1 && (
          <section className="py-12 bg-gray-50">
            <div className="container mx-auto px-4">
              <div className="grid md:grid-cols-2 gap-8">
                {descriptions.slice(1).map((desc: ContactDescription) => (
                  <Card key={desc.id} className="border-none shadow-md">
                    <CardContent className="p-6">
                      <h3 className="text-xl font-bold mb-4 text-gray-800">{desc.title}</h3>
                      <p className="text-mkdss-darkgray">{desc.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Contact Form & Info */}
        <section className="py-16">
          <div className="container-lg">
            <div className="grid md:grid-cols-2 gap-12">
              {/* Contact Form */}
              <div className="bg-white rounded-lg shadow-sm p-8">
                <h2 className="text-2xl font-bold mb-6 text-gray-800">Send Us a Message</h2>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Your Name</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Your Email</FormLabel>
                          <FormControl>
                            <Input type="email" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="subject"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Subject</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="message"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Your Message</FormLabel>
                          <FormControl>
                            <Textarea
                              rows={5}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button
                      type="submit"
                      className="w-full bg-gray-800 hover:bg-gray-700"
                      disabled={createContactMutation.isPending}
                    >
                      {createContactMutation.isPending ? "Sending..." : "Send Message"}
                    </Button>
                  </form>
                </Form>
              </div>

              {/* Map Section */}
              <div>
                <h2 className="text-3xl font-bold mb-6 text-gray-800">Our Location</h2>
                <Card className="border-none shadow-lg overflow-hidden">
                  <CardContent className="p-0">
                    <div className="rounded-lg overflow-hidden h-[400px] w-full">
                      <iframe
                        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3941.066095886576!2d38.83560837752168!3d8.966057268126088!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x164b9bd9d4e73acf%3A0x6ba4e655bdf6c707!2sICT%20Park!5e0!3m2!1sen!2set!4v1743082003218!5m2!1sen!2set"
                        className="w-full h-full"
                        style={{ border: 0 }}
                        allowFullScreen
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Contact;






