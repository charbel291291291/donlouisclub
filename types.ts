
export enum MembershipTier {
  BRONZE = 'bronze',
  SILVER = 'silver',
  GOLD = 'gold',
  PLATINUM = 'platinum'
}

export interface UserProfile {
  firstName: string;
  phone: string;
  points: number; 
  visitsInCycle: number; 
  rewardsAvailable: number; 
  isRegistered: boolean;
  memberId: string;
  lastVisitDate?: string;
  isFollowingSocial?: boolean; 
}

export interface PushSchedule {
  lunch: boolean;
  dinner: boolean;
  lateNight: boolean;
}

export interface BrandSettings {
  primaryColor: string;
  accentColor: string;
  bgTone: string;
}

export interface SplashSettings {
  animationStyle: 'fade' | 'glow' | 'cinematic';
  soundEnabled: boolean;
  animate: boolean;
  backgroundImage: string;
}

export interface UiSettings {
  intensity: 'calm' | 'premium' | 'ultra';
  enable3D: boolean;
  glassmorphism: boolean;
}

export interface ContentSettings {
  welcomeHeadline: string;
  brandTagline: string;
  pushTone: 'calm' | 'energetic' | 'exclusive';
}

export interface MenuItem {
  id: string;
  nameEn: string;
  nameAr: string;
  descEn: string;
  descAr: string;
  image: string;
  badgeEn: string;
  badgeAr: string;
  price: string;
  isHidden?: boolean;
}

export interface Offer {
  id: string;
  titleEn: string;
  titleAr: string;
  expiry: string;
  type: 'weekly' | 'latenight' | 'student' | 'social';
}

export interface AdminSettings {
  // Core config
  bestMenuItemId: string;
  highlightTag: string;
  highlightSetDate?: string;
  cashierPin: string;
  activeOfferIds: string[];
  pushSchedule: PushSchedule;
  
  // Dynamic Data
  menuItems: MenuItem[];
  offers: Offer[];
  
  // Visual Config
  brand: BrandSettings;
  splash: SplashSettings;
  ui: UiSettings;
  content: ContentSettings;
}

export enum AppScreen {
  SPLASH = 'splash',
  JOIN = 'join',
  HOME = 'home',
  MENU = 'menu',
  OFFERS = 'offers',
  LOCATION = 'location',
  PROFILE = 'profile',
  SCAN_SUCCESS = 'scan_success',
  CASHIER_AUTH = 'cashier_auth',
  CASHIER_SCAN = 'cashier_scan',
  ADMIN_AUTH = 'admin_auth',
  ADMIN_DASHBOARD = 'admin_dashboard'
}
