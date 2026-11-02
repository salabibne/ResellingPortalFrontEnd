/**
 * Icons the Homepage Builder can assign.
 *
 * Icon values are stored as one string:
 *   - a Lucide name from ICON_LIBRARY, e.g. "Truck"
 *   - "emoji:" + an emoji, e.g. "emoji:🚀"
 *   - "none" to hide an optional icon
 *
 * The keys of ICON_LIBRARY must match ALLOWED_ICON_NAMES in the backend's
 * `src/homepage/icon-registry.ts`, or the backend will refuse to store them.
 * Named imports (not `import *`) keep unused lucide icons out of the bundle.
 */
import type { LucideIcon } from "lucide-react";
import {
  Activity, ArrowRight, ArrowUpRight, AtSign, Award, Baby, BadgeCheck, BadgeDollarSign,
  BadgePercent, Banknote, BarChart3, Barcode, Bell, BellRing, Bike, BookOpen, Bookmark, Bot,
  Boxes, Brain, BrainCircuit, Building2, Calculator, Calendar, CalendarCheck, Camera, Car,
  Check, CheckCircle2, ChevronRight, CircleCheck, CircleCheckBig, CircleDollarSign, CircleHelp,
  CirclePlay, Clock, Cloud, Code, Coins, Container, Cpu, CreditCard, Crown, Database,
  DollarSign, Download, Eye, FileText, Film, Fingerprint, Flag, Flame, Folder, Gauge, Gem,
  Gift, Glasses, Globe, GraduationCap, Hammer, HandCoins, Handshake, Headphones, Headset,
  Heart, HeartHandshake, Hourglass, House, Image as ImageIcon, Images, Infinity as InfinityIcon,
  Info, KeyRound, Landmark, Laptop, Layers, LayoutGrid, Leaf, LifeBuoy, Lightbulb, LineChart,
  Link as LinkIcon, Lock, LockKeyhole, Mail, Map as MapIcon, MapPin, Medal, Megaphone, MessageCircle, MessageSquare, MessagesSquare, Mic,
  Monitor, Moon, Navigation, Newspaper, Package, PackageCheck, PackageOpen, Palette, Percent,
  PersonStanding, Phone, PhoneCall, PieChart, PiggyBank, Plane, Play, Plus, Puzzle, QrCode,
  Receipt, Recycle, Rocket, RotateCcw, Route, Rss, Scale, Scissors, Search, Send, Settings,
  Share2, Shield, ShieldCheck, Ship, Shirt, ShoppingBag, ShoppingBasket, ShoppingCart,
  Smartphone, Smile, Sparkles, Star, Store, Sun, Tablet, Tag, Tags, Target, ThumbsUp, Timer,
  TrendingUp, Trophy, Truck, Undo2, Upload, User, UserCheck, UserPlus, Users, Video,
  WandSparkles, Wallet, Warehouse, Watch, Wifi, Wrench, Zap,
} from "lucide-react";

export const ICON_LIBRARY: Record<string, LucideIcon> = {
  Activity, ArrowRight, ArrowUpRight, AtSign, Award, Baby, BadgeCheck, BadgeDollarSign,
  BadgePercent, Banknote, BarChart3, Barcode, Bell, BellRing, Bike, BookOpen, Bookmark, Bot,
  Boxes, Brain, BrainCircuit, Building2, Calculator, Calendar, CalendarCheck, Camera, Car,
  Check, CheckCircle2, ChevronRight, CircleCheck, CircleCheckBig, CircleDollarSign, CircleHelp,
  CirclePlay, Clock, Cloud, Code, Coins, Container, Cpu, CreditCard, Crown, Database,
  DollarSign, Download, Eye, FileText, Film, Fingerprint, Flag, Flame, Folder, Gauge, Gem,
  Gift, Glasses, Globe, GraduationCap, Hammer, HandCoins, Handshake, Headphones, Headset,
  Heart, HeartHandshake, Hourglass, House, Image: ImageIcon, Images, Infinity: InfinityIcon, Info,
  KeyRound, Landmark, Laptop, Layers, LayoutGrid, Leaf, LifeBuoy, Lightbulb, LineChart,
  Link: LinkIcon, Lock, LockKeyhole, Mail, Map: MapIcon, MapPin, Medal, Megaphone, MessageCircle, MessageSquare, MessagesSquare, Mic,
  Monitor, Moon, Navigation, Newspaper, Package, PackageCheck, PackageOpen, Palette, Percent,
  PersonStanding, Phone, PhoneCall, PieChart, PiggyBank, Plane, Play, Plus, Puzzle, QrCode,
  Receipt, Recycle, Rocket, RotateCcw, Route, Rss, Scale, Scissors, Search, Send, Settings,
  Share2, Shield, ShieldCheck, Ship, Shirt, ShoppingBag, ShoppingBasket, ShoppingCart,
  Smartphone, Smile, Sparkles, Star, Store, Sun, Tablet, Tag, Tags, Target, ThumbsUp, Timer,
  TrendingUp, Trophy, Truck, Undo2, Upload, User, UserCheck, UserPlus, Users, Video,
  WandSparkles, Wallet, Warehouse, Watch, Wifi, Wrench, Zap,
};

export interface IconCategory {
  id: string;
  label: string;
  icons: string[];
}

export const ICON_CATEGORIES: IconCategory[] = [
  {
    id: "popular",
    label: "Popular",
    icons: [
      "Zap", "Users", "Package", "Truck", "DollarSign", "Shield", "Search", "TrendingUp",
      "Image", "ShoppingBag", "CircleCheckBig", "Star", "BadgeCheck", "HeartHandshake",
      "MessageCircle", "ArrowRight", "Sparkles", "ShieldCheck", "Award", "Rocket",
    ],
  },
  {
    id: "commerce",
    label: "Commerce",
    icons: [
      "ShoppingBag", "ShoppingCart", "ShoppingBasket", "Store", "Package", "PackageCheck",
      "PackageOpen", "Boxes", "Tag", "Tags", "Gift", "Shirt", "Receipt", "Percent", "Barcode",
      "Gem", "Crown", "Watch", "Glasses",
    ],
  },
  {
    id: "delivery",
    label: "Delivery",
    icons: [
      "Truck", "Bike", "Car", "Plane", "Ship", "MapPin", "Map", "Navigation", "Warehouse",
      "Clock", "Timer", "Hourglass", "RotateCcw", "Undo2", "Route", "Container",
    ],
  },
  {
    id: "money",
    label: "Money",
    icons: [
      "DollarSign", "CircleDollarSign", "BadgeDollarSign", "Banknote", "Wallet", "CreditCard",
      "HandCoins", "Coins", "PiggyBank", "Landmark", "BadgePercent", "Calculator", "Scale",
    ],
  },
  {
    id: "trust",
    label: "Trust & security",
    icons: [
      "Shield", "ShieldCheck", "Lock", "LockKeyhole", "KeyRound", "BadgeCheck", "CircleCheckBig",
      "CircleCheck", "CheckCircle2", "Award", "Medal", "Trophy", "ThumbsUp", "Fingerprint",
    ],
  },
  {
    id: "growth",
    label: "Growth",
    icons: [
      "TrendingUp", "LineChart", "BarChart3", "PieChart", "Activity", "Target", "Rocket", "Zap",
      "Flame", "Gauge", "ArrowUpRight",
    ],
  },
  {
    id: "tech",
    label: "AI & tech",
    icons: [
      "Search", "Sparkles", "Bot", "Brain", "BrainCircuit", "Cpu", "WandSparkles", "Lightbulb",
      "Laptop", "Smartphone", "Monitor", "Tablet", "Globe", "Wifi", "Code", "Cloud", "Database",
      "QrCode",
    ],
  },
  {
    id: "people",
    label: "People & support",
    icons: [
      "Users", "User", "UserPlus", "UserCheck", "HeartHandshake", "Handshake", "Headphones",
      "Headset", "LifeBuoy", "GraduationCap", "BookOpen", "Baby", "Smile", "PersonStanding",
    ],
  },
  {
    id: "communication",
    label: "Communication",
    icons: [
      "MessageCircle", "MessageSquare", "MessagesSquare", "Phone", "PhoneCall", "Mail", "Send",
      "Bell", "BellRing", "Megaphone", "Share2", "Newspaper", "AtSign", "Rss",
    ],
  },
  {
    id: "media",
    label: "Media",
    icons: [
      "Image", "Images", "Camera", "Video", "Film", "Play", "CirclePlay", "Download", "Upload",
      "FileText", "Folder", "Mic",
    ],
  },
  {
    id: "general",
    label: "General",
    icons: [
      "Star", "Heart", "Calendar", "CalendarCheck", "Settings", "Layers", "LayoutGrid", "Leaf",
      "Recycle", "House", "Building2", "Flag", "ArrowRight", "ChevronRight", "Check", "Plus",
      "Info", "CircleHelp", "Infinity", "Sun", "Moon", "Bookmark", "Link", "Eye", "Puzzle",
      "Palette", "Scissors", "Hammer", "Wrench",
    ],
  },
];

/** Extra search terms (English and Bangla) for the most-used icons. */
export const ICON_KEYWORDS: Record<string, string> = {
  Truck: "delivery shipping courier ডেলিভারি",
  Package: "box product parcel পণ্য প্যাকেজ",
  DollarSign: "money price profit taka টাকা লাভ",
  Banknote: "cash money taka টাকা",
  Wallet: "payout balance ওয়ালেট",
  HandCoins: "cod cash on delivery payment",
  Users: "people resellers customers community রিসেলার",
  Shield: "secure safe verified নিরাপদ",
  ShieldCheck: "secure safe verified guarantee নিরাপদ",
  BadgeCheck: "verified check tick যাচাইকৃত",
  CircleCheckBig: "check done tick success",
  CheckCircle2: "check done tick success",
  Search: "find ai analysis খুঁজুন",
  Sparkles: "ai magic new",
  Bot: "ai robot assistant",
  TrendingUp: "growth sales strategy বিক্রয়",
  Image: "photo picture media ছবি",
  ShoppingBag: "shop sell store বিক্রি",
  Zap: "fast instant quick lightning দ্রুত",
  Star: "rating review favourite",
  HeartHandshake: "partner trust support",
  MessageCircle: "chat whatsapp message",
  Headset: "support call centre সাপোর্ট",
  Headphones: "support help",
  RotateCcw: "return refund exchange",
  Clock: "time 24/7 hours",
  Rocket: "launch start grow",
  GraduationCap: "learn course training শিখুন",
  Newspaper: "news blog updates",
  Gift: "offer bonus present",
  Percent: "discount sale offer ছাড়",
  Store: "shop outlet",
  Smartphone: "mobile phone app",
  Laptop: "computer online",
};

export interface EmojiGroup {
  id: string;
  label: string;
  emojis: string[];
}

export const EMOJI_GROUPS: EmojiGroup[] = [
  { id: "popular", label: "Popular", emojis: ["🚀", "📱", "🛒", "🚚", "💰", "🎓", "💻", "📰", "🔍", "✅"] },
  { id: "commerce", label: "Commerce", emojis: ["🛍️", "📦", "🏷️", "🎁", "💎", "👕", "👗", "👟", "⌚", "🧾"] },
  { id: "money", label: "Money", emojis: ["💵", "💳", "💸", "🪙", "🏦", "📈", "📊", "💹"] },
  { id: "trust", label: "Trust", emojis: ["🛡️", "🔒", "🏆", "🥇", "⭐", "🌟", "👍", "💯", "✔️", "🤝"] },
  { id: "people", label: "People & support", emojis: ["👥", "🙋", "📞", "💬", "🎧", "❤️", "😊", "🙏", "📣", "🔔"] },
  { id: "misc", label: "Speed & more", emojis: ["⚡", "🔥", "✨", "🎯", "⏱️", "🕒", "📍", "🌍", "💡", "🧠"] },
];

export const NO_ICON = "none";
const EMOJI_PREFIX = "emoji:";

export type ParsedIcon =
  | { kind: "lucide"; name: string; Icon: LucideIcon }
  | { kind: "emoji"; emoji: string }
  | { kind: "none" };

/** Resolves a stored icon value; unknown or empty values return null. */
export function parseIconValue(value?: string | null): ParsedIcon | null {
  const v = value?.trim();
  if (!v) return null;
  if (v === NO_ICON) return { kind: "none" };
  if (v.startsWith(EMOJI_PREFIX)) {
    const emoji = v.slice(EMOJI_PREFIX.length).trim();
    return emoji ? { kind: "emoji", emoji } : null;
  }
  if (!Object.prototype.hasOwnProperty.call(ICON_LIBRARY, v)) return null;
  return { kind: "lucide", name: v, Icon: ICON_LIBRARY[v] };
}

export function emojiValue(emoji: string): string {
  return `${EMOJI_PREFIX}${emoji.trim()}`;
}

/** "CircleCheckBig" → "Circle check big" */
export function iconLabel(name: string): string {
  const words = name.replace(/([a-z])([A-Z0-9])/g, "$1 $2").toLowerCase();
  return words.charAt(0).toUpperCase() + words.slice(1);
}
