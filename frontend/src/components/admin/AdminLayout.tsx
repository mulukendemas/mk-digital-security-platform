
import React, { ReactNode } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Logo } from "@/components/ui/logo";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  FileText,
  Package,
  Lightbulb,
  Newspaper,
  Mail,
  Users,
  Settings,
  LogOut,
  Home } from "lucide-react";
import { cn } from "@/lib/utils";
import { Logo_white } from "../ui/logo-white";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { HelpCircle } from "lucide-react";

interface AdminLayoutProps {
  children: ReactNode;
  title: string;
}

const AdminLayout = ({ children, title }: AdminLayoutProps) => {
  const { user, logout, hasPermission } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Navigation items for sidebar with role requirements
  const navItems = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/admin/dashboard", requiredRole: "viewer" },
    { icon: Home, label: "Home Page", href: "/admin/home", requiredRole: "viewer" },
    { icon: Package, label: "Products", href: "/admin/products", requiredRole: "viewer" },
    { icon: Lightbulb, label: "Solutions", href: "/admin/solutions", requiredRole: "viewer" },
    { icon: FileText, label: "About", href: "/admin/about", requiredRole: "viewer" },
    { icon: Newspaper, label: "News", href: "/admin/news", requiredRole: "viewer" },
    { icon: Mail, label: "Contact", href: "/admin/contact", requiredRole: "viewer" },
    { icon: Users, label: "Users", href: "/admin/users", requiredRole: "admin" },
    { icon: Settings, label: "Settings", href: "/admin/settings", requiredRole: "admin" },
  ] as const;

  const handleLogout = () => {
    logout();
    navigate("/admin/login");
  };

  // Filter navigation items based on user's role
  const filteredNavItems = navItems.filter(
    (item) => hasPermission(item.requiredRole as 'admin' | 'editor' | 'viewer')
  );

  return (
    <div className="flex h-screen bg-soft-gray">
      {/* Sidebar */}
      <div className="w-64 bg-navy text-white shadow-md h-full flex flex-col">
        <div className="py-8 px-4 border-b border-navy-600 flex justify-center items-center">
          <Logo_white variant="white" size="7xl"/>
        </div>

        <div className="flex-1 overflow-auto py-4">
          <div className="px-4 py-2">
            <p className="text-sm font-medium text-gray-300">Welcome,</p>
            <p className="font-semibold">{user?.name}</p>
            <div className="flex items-center mt-1">
              <span className={`inline-block w-2 h-2 rounded-full mr-2 ${user?.role === 'admin' ? 'bg-green-500' : user?.role === 'editor' ? 'bg-amber-500' : 'bg-blue-500'}`}></span>
              <p className="text-xs text-gray-400 capitalize">{user?.role} Role</p>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="sm" className="px-1 ml-1">
                      <HelpCircle className="h-3 w-3 text-gray-400" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="right" className="max-w-xs">
                    {user?.role === 'admin' && (
                      <p>Admin Role: Full access to create, edit, delete content and manage users and settings.</p>
                    )}
                    {user?.role === 'editor' && (
                      <p>Editor Role: Can create and edit content, but cannot delete content or manage users. Some actions require admin approval.</p>
                    )}
                    {user?.role === 'viewer' && (
                      <p>Viewer Role: Read-only access to content. Cannot create, edit, or delete any content.</p>
                    )}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>

          <nav className="mt-6 px-2">
            <ul className="space-y-1">
              {filteredNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.href;

                return (
                  <li key={item.href}>
                    <Link
                      to={item.href}
                      className={cn(
                        "flex items-center px-4 py-2.5 text-sm font-medium rounded-md transition-colors",
                        isActive
                          ? "bg-gold text-navy"
                          : "text-gray-300 hover:bg-navy-700 hover:text-white"
                      )}
                    >
                      <Icon className="mr-3 h-5 w-5" />
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>

        <div className="p-4 border-t border-navy-600">
          <Button
            variant="outline"
            className="w-full justify-start bg-transparent text-white border-gray-600 hover:bg-navy-700"
            onClick={handleLogout}
          >
            <LogOut className="mr-3 h-5 w-5" />
            Logout
          </Button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white shadow-sm z-10">
          <div className="px-6 py-4">
            <h1 className="text-2xl font-bold text-navy">{title}</h1>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
