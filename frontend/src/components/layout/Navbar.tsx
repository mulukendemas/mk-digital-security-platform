
import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Logo } from "@/components/ui/logo";
import { Button } from "@/components/ui/button";
import { NavigationItem } from "@/lib/types";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";

const navItems: NavigationItem[] = [
  { title: "Home", path: "/" },
  { title: "About Us", path: "/about" },
  { title: "Products", path: "/products" },
  { title: "Solutions", path: "/solutions" },
  { title: "News & Events", path: "/news" },
  { title: "Contact Us", path: "/contact" },
];

export function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleLogin = () => {
    navigate('/admin/login');
  };

  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-spring",
        isScrolled
          ? "bg-white/95 backdrop-blur-md py-2 shadow-sm"
          : "bg-white py-3"
      )}
    >
      <div className="container-lg flex items-center justify-between">
        <Link to="/" className="z-50">
          <Logo size="md" />
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center">
          <nav className="flex items-center space-x-8 mr-6">
            {navItems.map((item) => (
              <Link
                key={item.title}
                to={item.path}
                className={cn(
                  "text-sm font-medium transition-colors duration-300",
                  location.pathname === item.path
                    ? "text-gold font-semibold"
                    : "text-navy hover:text-gold"
                )}
              >
                {item.title}
              </Link>
            ))}
          </nav>
          <div className="flex items-center space-x-3">
            {user ? (
              <>
                <Link to="/admin/dashboard">
                  <Button
                    size="sm"
                    variant="outline"
                    className="bg-white text-navy border-navy rounded-md hover:bg-navy/5"
                  >
                    Dashboard
                  </Button>
                </Link>
                <Button
                  size="sm"
                  className="bg-navy text-white hover:bg-dark-blue"
                  onClick={handleLogout}
                >
                  Logout
                </Button>
              </>
            ) : (
              <Button
                size="sm"
                className="bg-navy text-white hover:bg-dark-blue"
                onClick={handleLogin}
              >
                Login
              </Button>
            )}
          </div>
        </div>

        {/* Mobile Menu Trigger */}
        <button
          className="md:hidden z-50 text-navy"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Mobile Navigation */}
        <div
          className={cn(
            "fixed inset-0 bg-white flex flex-col justify-center items-center transition-all duration-300 ease-spring md:hidden",
            mobileMenuOpen ? "opacity-100" : "opacity-0 pointer-events-none"
          )}
        >
          <nav className="flex flex-col items-center space-y-6">
            {navItems.map((item, index) => (
              <Link
                key={item.title}
                to={item.path}
                className={cn(
                  "text-lg font-medium transition-all duration-300 ease-spring",
                  mobileMenuOpen ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
                  location.pathname === item.path
                    ? "text-gold font-semibold"
                    : "text-navy hover:text-gold"
                )}
                style={{ transitionDelay: `${index * 50}ms` }}
              >
                {item.title}
              </Link>
            ))}
            <div className="flex flex-col space-y-3 mt-6">
              {user ? (
                <>
                  <Link
                    to="/admin/dashboard"
                    className={cn(
                      "transition-all duration-300 ease-spring",
                      mobileMenuOpen ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                    )}
                    style={{ transitionDelay: `${navItems.length * 50}ms` }}
                  >
                    <Button variant="outline" className="w-full border-navy text-navy rounded-md">
                      Dashboard
                    </Button>
                  </Link>
                  <Button
                    className="w-full bg-navy text-white"
                    onClick={handleLogout}
                  >
                    Logout
                  </Button>
                </>
              ) : (
                <Button
                  className="w-full bg-navy text-white"
                  onClick={handleLogin}
                >
                  Login
                </Button>
              )}
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
}

