import { MenuItem, Offer, MembershipTier } from "./types";

export const SOCIAL_LINKS = {
  instagram: "https://instagram.com/donlouis",
  facebook: "https://facebook.com/donlouis",
};

export const BRAND_TAGLINE = "Don Louis isn't food. It's a habit.";

export const BRAND_INFO = {
  name: "Don Louis",
  fullName: "Don Louis Club",
  slogan: "Where Culinary Art Meets Luxury",
  description:
    "Premium dining experience featuring signature dishes crafted with passion and excellence.",
  address: "Adonis, Main Road",
  phone: "09 123 456",
  hours: "Daily: 11:00 AM — 03:00 AM",
  lateNightHours: "Late night menu active after 10 PM",
  cuisineType: "Snack-Bar & Grill",
};

export const SOCIAL_PROOF_MESSAGES = [
  "🔥 47 members earned free items this month",
  "🍔 128 items redeemed by club members this week",
  "👋 15 new foodies joined the club today",
  "⭐ 8 members reached Platinum status this week",
  "🧀 32 orders of Merguez Provolone just placed",
];

export const SOCIAL_FEED_MOCK = [
  {
    id: "s1",
    image:
      "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&q=80&w=400",
    username: "elias.j",
    caption: "Best Merguez in Lebanon! 🇱🇧",
  },
  {
    id: "s2",
    image:
      "https://images.unsplash.com/photo-1541544741938-0af808891cc5?auto=format&fit=crop&q=80&w=400",
    username: "sara_khoury",
    caption: "Late night cravings satisfied 🌙",
  },
  {
    id: "s3",
    image:
      "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&q=80&w=400",
    username: "tony.don",
    caption: "DL Special Steak is a must try 🔥",
  },
];

export const SIGNATURE_ITEMS: MenuItem[] = [
  {
    id: "1",
    nameEn: "Don Louis Special Steak",
    nameAr: "ستيك دون لويس الخاص",
    descEn:
      "Marinated steak slices, mushrooms, colored bellpepper, tomato, rocca balsamic mix, and DL special sauce.",
    descAr:
      "شرائح لحم متبلة، فطر، فلفل ألوان، طماطم، جرجير مع صلصة البلسمك، وصلصة دون لويس الخاصة.",
    image:
      "https://images.unsplash.com/photo-1600891964599-f61ba0e24092?auto=format&fit=crop&q=80&w=800",
    badgeEn: "🔥 Signature",
    badgeAr: "🔥 توقيعنا الخاص",
    price: "8.50",
  },
  {
    id: "2",
    nameEn: "Merguez Provolone",
    nameAr: "سجق ميرغيز بروفولون",
    descEn:
      "Special merguez sausage, italian provolone cheese, and our signature argentinian sauce.",
    descAr: "سجق ميرغيز فاخر، جبنة بروفولون إيطالية، وصلصة أرجنتينية خاصة.",
    image:
      "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=800",
    badgeEn: "⭐ Most Loved",
    badgeAr: "⭐ المفضل لدينا",
    price: "7.00",
  },
  {
    id: "3",
    nameEn: "Francisco Chicken",
    nameAr: "فرانسيسكو دجاج",
    descEn:
      "Grilled chicken breast, mix cheese, corn, pickles, and creamy mayo.",
    descAr: "صدر دجاج مشوي، خليط أجبان، ذرة، مخلل ومايونيز.",
    image:
      "https://images.unsplash.com/photo-1606755962773-d324e0a4d58a?auto=format&fit=crop&q=80&w=800",
    badgeEn: "🔥 Best Seller",
    badgeAr: "🔥 الأكثر مبيعاً",
    price: "6.50",
  },
];

export const SECRET_MENU_ITEM: MenuItem = {
  id: "secret1",
  nameEn: "The Godfather Burger",
  nameAr: "برغر العراب",
  descEn:
    "Double Black Angus, Truffle infusion, Aged Swiss, served in a gold-dusted brioche. Ask the owner directly.",
  descAr: "دبل بلاك أنجوس، ترفل، جبنة سويسرية معتقة، خبز مغطى بالذهب.",
  image:
    "https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?auto=format&fit=crop&q=80&w=800",
  badgeEn: "👑 VIP ONLY",
  badgeAr: "👑 كبار الشخصيات",
  price: "??",
};

export const CURRENT_OFFERS: Offer[] = [
  {
    id: "o1",
    titleEn: "Don Louis Midnight Combo",
    titleAr: "كومبو منتصف الليل",
    expiry: "Valid daily after 10 PM",
    type: "latenight",
  },
  {
    id: "o2",
    titleEn: "Weekly Signature Deal",
    titleAr: "عرض الأسبوع المميز",
    expiry: "Expires Sunday",
    type: "weekly",
  },
];

export const TIER_CONFIG = {
  [MembershipTier.BRONZE]: {
    nameEn: "Bronze",
    nameAr: "برونزي",
    minPoints: 0,
    color: "#ECAE7D",
    bg: "bg-gradient-to-br from-[#3E2b22] via-[#2C1A14] to-[#1A0F0A]",
    border: "border-[#5C3A2E]",
    shadow: "shadow-[#3E2b22]/40",
    textColor: "text-[#ECAE7D]",
    badge: "Member",
  },
  [MembershipTier.SILVER]: {
    nameEn: "Silver",
    nameAr: "فضي",
    minPoints: 6,
    color: "#E2E8F0",
    bg: "bg-gradient-to-br from-[#94A3B8] via-[#475569] to-[#1E293B]",
    border: "border-slate-400/50",
    shadow: "shadow-slate-400/40",
    textColor: "text-white",
    badge: "Elite",
  },
  [MembershipTier.GOLD]: {
    nameEn: "Gold",
    nameAr: "ذهبي",
    minPoints: 12,
    color: "#FFD700",
    bg: "bg-gradient-to-br from-[#F59E0B] via-[#B45309] to-[#451A03]",
    border: "border-amber-300/50",
    shadow: "shadow-amber-500/40",
    textColor: "text-[#FEF3C7]",
    badge: "VIP",
  },
  [MembershipTier.PLATINUM]: {
    nameEn: "Platinum",
    nameAr: "بلاتينيوم",
    minPoints: 24,
    color: "#ffffff",
    bg: "bg-gradient-to-br from-[#18181B] via-[#09090B] to-black",
    border: "border-white/20",
    shadow: "shadow-indigo-500/20",
    textColor: "text-white",
    badge: "Owner's Circle",
  },
};
