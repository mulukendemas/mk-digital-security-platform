import { Description } from "@radix-ui/react-toast";

export interface WhyChooseUs {
  id: string;
  icon: string;
  title: string;
  description: string;
}

export interface Feature {
  id: string;
  title: string;
  description: string;
  icon: string;
}
export interface TargetMarket {
  id: string;
  title: string;
  description: string;
  image: string;
}

export interface HeroSection {
  id?: number;
  title: string;
  description: string;
  button_text: string;
  button_link: string;
  background_image: string | null;
}
export interface User {
  id: number;
  username: string;
  email: string;
  password?: string;
  first_name?: string;
  last_name?: string;
  name?: string;
  role?: { role: 'admin' | 'editor' | 'viewer' } | 'admin' | 'editor' | 'viewer';
  created_at?: string;
  updated_at?: string;
}

export interface Product {
  id: string;
  name: string;
  items?: string[];
  image?: string;  // Add image field
  description?: string;  // Add description field
  createdAt: Date | string;  // Allow both Date and string
  updatedAt: Date | string;  // Allow both Date and string
}

export interface ProductDescription {
  id?: string;
  title: string;
  description: string;
  hero_image?: string;
  hero_image_file?: File;
  created_at?: Date | string;
  updated_at?: Date | string;
  createdAt?: Date | string; // For compatibility
  updatedAt?: Date | string; // For compatibility
}

// Update the Solution type to include the image property
export interface Solution {
  id: string;
  title: string;
  slug: string;
  description: string;
  features: string[];
  image?: string;
  icon?: string; // Add this line
  createdAt: string;
  updatedAt: string;
}

export interface SolutionDescription {
  id?: string;
  title?: string;
  description?: string;
  hero_image?: string;
  hero_image_file?: File;
  created_at?: Date | string;
  updated_at?: Date | string;
  createdAt?: Date | string; // For compatibility
  updatedAt?: Date | string; // For compatibility
}

export interface NewsArticle {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  author: string | number;
  authorName?: string;
  image?: string | null;
  published_at: string;
  created_at: string;
  updated_at: string;
}

export interface NewsDescription {
  id?: string;
  title?: string;
  description?: string;
  hero_image?: string;
  hero_image_file?: File;
  created_at?: Date | string;
  updated_at?: Date | string;
  createdAt?: Date | string; // For compatibility
  updatedAt?: Date | string; // For compatibility
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export interface ContactInfo {
  id: string;
  icon: string;
  title: string;
  details: string[];
  order: number;
}

export interface ContactDescription {
  id: string;
  title: string;
  description: string;
  background_image?: string;
  background_image_file?: File;
}

export interface NavigationItem {
  title: string;
  path: string;
  children?: NavigationItem[];
}

export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
  error: string | null;
}
export interface AboutHero {
  id: string;
  title?: string;
  description?: string;
  background_image?: string;
}

export interface CompanyOverview {
  id: string;
  title: string;
  description: string;
  quote: string;
  quote_author: string;
  quote_position: string;
}

export interface MissionVision {
  id?: string;
  title: string;
  missionTitle: string;
  mission: string;
  visionTitle: string;
  vision: string;
}

export interface TeamMember {
  id: string;
  name: string;
  position: string;
  image: string;
}

export interface TeamDescription {
  id: string;
  title: string;
  description: string;
}


export interface Partner {
  id: string;
  name: string;
  logo: string;
}

export interface PartnerDescription {
  id: string;
  title: string;
  description: string;
}


export interface DashboardStats {
  products: number;
  solutions: number;
  news: number;
  contacts: number;
  users: number;
}

export interface Activity {
  id: string;
  action: string;
  time: string;
  user: string;
}

// Add a new type for the form values
export type UserFormData = {
  username: string;
  email: string;
  first_name?: string;
  last_name?: string;
  role: 'admin' | 'editor' | 'viewer';
  password?: string;
  confirmPassword?: string;
}

export interface SiteSettings {
  id?: string;
  maintenanceMode: boolean;
  maintenanceMessage?: string;
  siteName?: string;
  siteDescription?: string;
  contactEmail?: string;
  lastUpdated?: string;
  // Security settings
  enableTwoFactorAuth?: boolean;
  passwordPolicy?: {
    minLength: number;
    requireUppercase: boolean;
    requireLowercase: boolean;
    requireNumbers: boolean;
    requireSpecialChars: boolean;
    expiryDays: number;
  };
  maxLoginAttempts?: number;
  sessionTimeout?: number; // in minutes
  allowedIPs?: string[];
  enableCaptcha?: boolean;
  // Logo settings
  logo?: string;
  logoWhite?: string; // White version of the logo for dashboard and footer
  logoAlt?: string;
  logoWidth?: number;
  logoHeight?: number;
  favicon?: string;
  // Footer settings
  footerText?: string;
  footerLinks?: {
    text: string;
    url: string;
    category?: string; // For categorizing links (e.g., 'quick-links', 'legal', etc.)
    order?: number; // For controlling the order of links
  }[];
  copyrightText?: string;
  showSocialLinks?: boolean;
  socialLinks?: {
    platform: string;
    url: string;
    icon?: string;
  }[];
  // Target Markets settings
  targetMarkets?: {
    name: string;
    url?: string;
    order?: number;
  }[];
  // Contact Information
  contactInfo?: {
    address?: string;
    phone?: string;
    email?: string;
    showGetInTouchButton?: boolean;
  };
}
















