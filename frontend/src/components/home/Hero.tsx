
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function Hero() {
  return (
    <section className="pt-32 pb-20 md:pt-40 md:pb-32 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 -z-10 opacity-30">
        <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-gradient-to-br from-primary/10 to-transparent"></div>
        <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-gradient-to-tr from-primary/10 to-transparent"></div>
      </div>
      
      <div className="container-lg relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <div className="animate-fade-in">
            <span className="inline-block py-1 px-3 text-sm font-medium bg-primary/10 text-primary rounded-full mb-6">
              Secure Authentication Solutions
            </span>
            
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6 leading-tight">
              Digital Security for a{" "}
              <span className="text-primary">Connected</span> World
            </h1>
            
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              MK Digital Security Solutions provides cutting-edge smart card and secure authentication solutions for government, banking, telecom, and enterprise sectors.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/solutions">
                <Button size="lg" className="group min-w-[180px]">
                  Explore Solutions
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <Link to="/contact">
                <Button size="lg" variant="outline" className="min-w-[180px]">
                  Contact Us
                </Button>
              </Link>
            </div>
          </div>
          
          {/* Trusted By Section */}
          <div className="mt-20 animate-slide-in" style={{ animationDelay: "0.3s" }}>
            <p className="text-muted-foreground mb-6 text-sm font-medium">
              TRUSTED BY LEADING ORGANIZATIONS
            </p>
            <div className="flex flex-wrap justify-center gap-x-12 gap-y-8">
              {["Government", "Banking", "Telecom", "Education", "Transportation"].map((org, i) => (
                <div 
                  key={org} 
                  className={cn(
                    "text-gray-500 text-lg font-semibold",
                    "opacity-0 animate-fade-in"
                  )}
                  style={{ animationDelay: `${0.4 + i * 0.1}s`, animationFillMode: "forwards" }}
                >
                  {org}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
