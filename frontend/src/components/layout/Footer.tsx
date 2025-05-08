
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Mail, Phone, MapPin, ArrowRight, ArrowUp } from "lucide-react";
import { Logo_white } from "../ui/logo-white";
import { useEffect, useState } from "react";
import { settingsService } from "@/lib/api-service";
import { SiteSettings } from "@/lib/types";

// Import social media icons
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from "react-icons/fa";

export function Footer() {
  const currentYear = new Date().getFullYear();
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [settings, setSettings] = useState<SiteSettings | null>(null);

  // Fetch settings from the API
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const data = await settingsService.getAll();
        console.log('Settings data:', data);
        if (data && data.length > 0) {
          setSettings(data[0]);
          console.log('Social links:', data[0].socialLinks);
          console.log('Show social links:', data[0].showSocialLinks);
        }
      } catch (error) {
        console.error('Error fetching settings:', error);
      }
    };

    fetchSettings();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      // Show button when page is scrolled more than 400px
      setShowBackToTop(window.scrollY > 400);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <footer className="bg-navy text-white pt-16 pb-8 relative">
      <div className="container-lg">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Company Info */}
          <div className="space-y-6">
            <div className="flex justify-start mb-4">
              <Logo_white variant="white" size="lg" />
            </div>
            <p className="text-gray-300 text-sm leading-relaxed">
              {settings?.footerText || "A leading smart card and secure authentication solution provider in Ethiopia and surrounding countries."}
            </p>
            {/* Social Media Icons */}
            <div className="flex space-x-4">
              {/* Always show default social media icons for now */}
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-gold hover:text-navy transition-colors duration-300">
                <FaFacebook size={20} />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-gold hover:text-navy transition-colors duration-300">
                <FaTwitter size={20} />
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-gold hover:text-navy transition-colors duration-300">
                <FaLinkedin size={20} />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-gold hover:text-navy transition-colors duration-300">
                <FaInstagram size={20} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-6 text-lg">Quick Links</h4>
            <ul className="space-y-3">
              {/* Dynamic Footer Links - filtered by category */}
              {settings?.footerLinks?.filter(link => link.category === 'quick-links')?.length > 0 ? (
                // Sort by order property if available
                settings?.footerLinks
                  ?.filter(link => link.category === 'quick-links')
                  ?.sort((a, b) => (a.order || 0) - (b.order || 0))
                  ?.map((link, index) => (
                    <li key={index}>
                      <Link
                        to={link.url}
                        className="text-gray-300 hover:text-gold transition-colors duration-300 flex items-center"
                      >
                        <ArrowRight className="w-4 h-4 mr-2" />
                        {link.text}
                      </Link>
                    </li>
                  ))
              ) : (
                // Default links if no settings are available
                <>
                  <li>
                    <Link to="/about" className="text-gray-300 hover:text-gold transition-colors duration-300 flex items-center">
                      <ArrowRight className="w-4 h-4 mr-2" />
                      About Us
                    </Link>
                  </li>
                  <li>
                    <Link to="/products" className="text-gray-300 hover:text-gold transition-colors duration-300 flex items-center">
                      <ArrowRight className="w-4 h-4 mr-2" />
                      Products
                    </Link>
                  </li>
                  <li>
                    <Link to="/solutions" className="text-gray-300 hover:text-gold transition-colors duration-300 flex items-center">
                      <ArrowRight className="w-4 h-4 mr-2" />
                      Solutions
                    </Link>
                  </li>
                  <li>
                    <Link to="/news" className="text-gray-300 hover:text-gold transition-colors duration-300 flex items-center">
                      <ArrowRight className="w-4 h-4 mr-2" />
                      News
                    </Link>
                  </li>
                  <li>
                    <Link to="/contact" className="text-gray-300 hover:text-gold transition-colors duration-300 flex items-center">
                      <ArrowRight className="w-4 h-4 mr-2" />
                      Contact Us
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </div>

          {/* Target Markets */}
          <div>
            <h4 className="text-white font-semibold mb-6 text-lg">Target Markets</h4>
            <ul className="space-y-3">
              {settings?.targetMarkets?.length > 0 ? (
                // Sort by order property if available
                settings?.targetMarkets
                  ?.sort((a, b) => (a.order || 0) - (b.order || 0))
                  ?.map((market, index) => (
                    <li key={index} className="text-gray-300 hover:text-gold transition-colors duration-300 flex items-center">
                      <ArrowRight className="w-4 h-4 mr-2" />
                      {market.url ? (
                        <Link to={market.url} className="hover:text-gold transition-colors duration-300">
                          {market.name}
                        </Link>
                      ) : (
                        market.name
                      )}
                    </li>
                  ))
              ) : (
                // Default target markets if no settings are available
                <>
                  <li className="text-gray-300 hover:text-gold transition-colors duration-300 flex items-center">
                    <ArrowRight className="w-4 h-4 mr-2" />
                    Government
                  </li>
                  <li className="text-gray-300 hover:text-gold transition-colors duration-300 flex items-center">
                    <ArrowRight className="w-4 h-4 mr-2" />
                    Banking and Finance
                  </li>
                  <li className="text-gray-300 hover:text-gold transition-colors duration-300 flex items-center">
                    <ArrowRight className="w-4 h-4 mr-2" />
                    Telecommunication
                  </li>
                  <li className="text-gray-300 hover:text-gold transition-colors duration-300 flex items-center">
                    <ArrowRight className="w-4 h-4 mr-2" />
                    Enterprise
                  </li>
                  <li className="text-gray-300 hover:text-gold transition-colors duration-300 flex items-center">
                    <ArrowRight className="w-4 h-4 mr-2" />
                    Education
                  </li>
                  <li className="text-gray-300 hover:text-gold transition-colors duration-300 flex items-center">
                    <ArrowRight className="w-4 h-4 mr-2" />
                    Transportation
                  </li>
                </>
              )}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-white font-semibold mb-6 text-lg">Contact Us</h4>
            <ul className="space-y-4">
              <li className="flex items-start">
                <MapPin className="w-5 h-5 mr-3 text-gold shrink-0 mt-0.5" />
                <span className="text-gray-300">{settings?.contactInfo?.address || "Addis Ababa, Ethiopia"}</span>
              </li>
              <li className="flex items-center">
                <Phone className="w-5 h-5 mr-3 text-gold shrink-0" />
                <span className="text-gray-300">{settings?.contactInfo?.phone || "+251 11 123 4567"}</span>
              </li>
              <li className="flex items-center">
                <Mail className="w-5 h-5 mr-3 text-gold shrink-0" />
                <span className="text-gray-300">{settings?.contactInfo?.email || settings?.contactEmail || "info@mkdss.com"}</span>
              </li>
            </ul>
            {(settings?.contactInfo?.showGetInTouchButton !== false) && (
              <div className="mt-6">
                <Link to="/contact">
                  <Button className="bg-gold hover:bg-gold/90 text-navy">
                    Get In Touch
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>

        <div className="border-t border-white/10 mt-12 pt-6 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">
            {settings?.copyrightText?.replace('{year}', currentYear.toString()) || `© ${currentYear} MK Digital Security Solutions. All rights reserved.`}
          </p>
          <div className="mt-4 md:mt-0 text-sm text-gray-400 flex space-x-6">
            {settings?.footerLinks?.filter(link => link.category === 'legal')?.length > 0 ? (
              settings?.footerLinks
                ?.filter(link => link.category === 'legal')
                ?.sort((a, b) => (a.order || 0) - (b.order || 0))
                ?.map((link, index) => (
                  <Link key={index} to={link.url} className="hover:text-gold transition-colors duration-300">
                    {link.text}
                  </Link>
                ))
            ) : (
              <>
                <a href="#" className="hover:text-gold transition-colors duration-300">Privacy Policy</a>
                <a href="#" className="hover:text-gold transition-colors duration-300">Terms of Service</a>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Back to Top Button */}
      <button
        onClick={scrollToTop}
        className={`fixed bottom-8 right-8 bg-gold hover:bg-gold/90 text-navy p-3 rounded-full shadow-lg transition-all duration-300 ${
          showBackToTop ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-16'
        }`}
        aria-label="Back to top"
      >
        <ArrowUp className="h-5 w-5" />
      </button>
    </footer>
  );
}


