import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AppScreen, UserProfile, AdminSettings, MenuItem } from "./types";
import SplashScreen from "./screens/SplashScreen";
import WelcomeScreen from "./screens/WelcomeScreen";
import HomeScreen from "./screens/HomeScreen";
import MenuScreen from "./screens/MenuScreen";
import OffersScreen from "./screens/OffersScreen";
import LocationScreen from "./screens/LocationScreen";
import ProfileScreen from "./screens/ProfileScreen";
import CashierScreen from "./screens/CashierScreen";
import AdminAuthScreen from "./screens/AdminAuthScreen";
import AdminDashboard from "./screens/AdminDashboard";
import Layout from "./components/Layout";
import ScanSuccessModal from "./components/ScanSuccessModal";
import InactivityModal from "./components/InactivityModal";
import { supabase } from "./supabaseClient";
import { AlertTriangle, Database } from "lucide-react";
import {
  SIGNATURE_ITEMS,
  CURRENT_OFFERS,
  BRAND_TAGLINE,
  BRAND_INFO,
} from "./constants";

const DEFAULT_SETTINGS: AdminSettings = {
  bestMenuItemId: "1",
  highlightTag: "Today's Pick",
  highlightSetDate: new Date().toISOString(),
  cashierPin: "1977",
  activeOfferIds: ["o1", "o2"],
  pushSchedule: {
    lunch: true,
    dinner: true,
    lateNight: true,
  },
  menuItems: SIGNATURE_ITEMS,
  offers: CURRENT_OFFERS,
  brand: {
    primaryColor: "#BF953F",
    accentColor: "#FBF5B7",
    bgTone: "#030303",
  },
  splash: {
    animationStyle: "cinematic",
    soundEnabled: true,
    animate: true,
    backgroundImage: "",
  },
  ui: {
    intensity: "premium",
    enable3D: true,
    glassmorphism: true,
  },
  content: {
    welcomeHeadline: BRAND_INFO.fullName,
    brandTagline: BRAND_TAGLINE,
    pushTone: "exclusive",
  },
};

const App: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<AppScreen>(
    AppScreen.SPLASH
  );
  const [user, setUser] = useState<UserProfile | null>(null);
  const [adminSettings, setAdminSettings] =
    useState<AdminSettings>(DEFAULT_SETTINGS);
  const [showScanSuccess, setShowScanSuccess] = useState(false);
  const [showInactivityModal, setShowInactivityModal] = useState(false);
  const [dbError, setDbError] = useState<string | null>(null);

  // --- Dynamic Theme Engine ---
  useEffect(() => {
    const root = document.documentElement;
    const { brand } = adminSettings;

    root.style.setProperty("--gold-base", brand.primaryColor);
    root.style.setProperty("--obsidian", brand.bgTone);
    root.style.setProperty("--gold-light", brand.accentColor);
  }, [adminSettings.brand]);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from("settings")
        .select("*")
        .eq("id", "app_config")
        .single();

      if (error) {
        if (error.code === "PGRST205") {
          setDbError(
            "Database tables missing. Please run the SQL schema in Supabase."
          );
          return;
        }
        throw error;
      }

      if (data) {
        const serverSettings: AdminSettings = {
          ...DEFAULT_SETTINGS,
          ...data.config,
          // Ensure arrays are merged or default to constants if empty in DB (e.g. fresh install)
          menuItems:
            data.config.menuItems && data.config.menuItems.length > 0
              ? data.config.menuItems
              : DEFAULT_SETTINGS.menuItems,
          offers:
            data.config.offers && data.config.offers.length > 0
              ? data.config.offers
              : DEFAULT_SETTINGS.offers,

          brand: { ...DEFAULT_SETTINGS.brand, ...data.config.brand },
          splash: { ...DEFAULT_SETTINGS.splash, ...data.config.splash },
          ui: { ...DEFAULT_SETTINGS.ui, ...data.config.ui },
          content: { ...DEFAULT_SETTINGS.content, ...data.config.content },
        };

        // Auto-reset highlight logic
        if (
          serverSettings.highlightTag === "Today's Pick" &&
          serverSettings.highlightSetDate
        ) {
          const setDate = new Date(serverSettings.highlightSetDate).getTime();
          const now = new Date().getTime();
          if (now - setDate > 24 * 60 * 60 * 1000) {
            serverSettings.highlightTag = "Chef's Selection";
          }
        }

        setAdminSettings(serverSettings);
      } else {
        await supabase
          .from("settings")
          .upsert([{ id: "app_config", config: DEFAULT_SETTINGS }]);
      }
    } catch (err) {
      console.error("Settings fetch error:", err);
    }
  };

  const syncUserFromSupabase = async (memberId: string) => {
    try {
      const { data, error } = await supabase
        .from("members")
        .select("*")
        .eq("member_id", memberId)
        .single();

      if (data && !error) {
        const syncedUser: UserProfile = {
          firstName: data.first_name,
          phone: data.phone,
          points: data.points,
          visitsInCycle: data.visits_in_cycle,
          rewardsAvailable: data.rewards_available,
          isRegistered: true,
          memberId: data.member_id,
          lastVisitDate: data.last_visit_date,
          isFollowingSocial: data.is_following_social,
        };
        setUser(syncedUser);
        localStorage.setItem("don_louis_user", JSON.stringify(syncedUser));
      }
    } catch (err) {
      console.error("Failed to sync user:", err);
    }
  };

  useEffect(() => {
    fetchSettings();
    const savedUser = localStorage.getItem("don_louis_user");
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      setUser(parsedUser);
      syncUserFromSupabase(parsedUser.memberId);

      if (parsedUser.lastVisitDate) {
        const lastVisit = new Date(parsedUser.lastVisitDate).getTime();
        const now = new Date().getTime();
        const diffDays = (now - lastVisit) / (1000 * 3600 * 24);
        const hasSeenInactivity = sessionStorage.getItem("inactivity_seen");

        if (diffDays > 14 && !hasSeenInactivity) {
          setTimeout(() => {
            setShowInactivityModal(true);
            sessionStorage.setItem("inactivity_seen", "true");
          }, 3500);
        }
      }
    }

    const timer = setTimeout(() => {
      if (!dbError) {
        if (savedUser) {
          setCurrentScreen(AppScreen.HOME);
        } else {
          setCurrentScreen(AppScreen.JOIN);
        }
      }
    }, 2500);

    return () => clearTimeout(timer);
  }, [dbError]);

  // Real-time listener
  useEffect(() => {
    if (!user?.memberId) return;
    const channel = supabase
      .channel("member_updates")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "members",
          filter: `member_id=eq.${user.memberId}`,
        },
        (payload) => {
          const newData = payload.new;
          const updatedUser: UserProfile = {
            firstName: newData.first_name,
            phone: newData.phone,
            points: newData.points,
            visitsInCycle: newData.visits_in_cycle,
            rewardsAvailable: newData.rewards_available,
            isRegistered: true,
            memberId: newData.member_id,
            lastVisitDate: newData.last_visit_date,
            isFollowingSocial: newData.is_following_social,
          };
          setUser(updatedUser);
          localStorage.setItem("don_louis_user", JSON.stringify(updatedUser));
          setShowScanSuccess(true);
          setShowInactivityModal(false);
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.memberId]);

  const handleRegister = async (
    name: string,
    phone: string,
    followedSocial: boolean
  ) => {
    const randomId = Math.random().toString(36).substring(2, 8).toUpperCase();
    const memberId = `DL-${randomId}`;
    const newUser: UserProfile = {
      firstName: name,
      phone: phone,
      points: followedSocial ? 2 : 1,
      visitsInCycle: 1,
      rewardsAvailable: 0,
      isRegistered: true,
      memberId: memberId,
      isFollowingSocial: followedSocial,
      lastVisitDate: new Date().toISOString(),
    };
    try {
      const { error } = await supabase.from("members").insert([
        {
          member_id: newUser.memberId,
          first_name: newUser.firstName,
          phone: newUser.phone,
          points: newUser.points,
          visits_in_cycle: newUser.visitsInCycle,
          rewards_available: newUser.rewardsAvailable,
          is_following_social: newUser.isFollowingSocial,
          last_visit_date: new Date().toISOString(),
        },
      ]);
      if (error && error.code !== "PGRST205") throw error;
      localStorage.setItem("don_louis_user", JSON.stringify(newUser));
      setUser(newUser);
      setCurrentScreen(AppScreen.HOME);
    } catch (err) {
      localStorage.setItem("don_louis_user", JSON.stringify(newUser));
      setUser(newUser);
      setCurrentScreen(AppScreen.HOME);
    }
  };

  const handleUpdateUser = async (updatedUser: UserProfile) => {
    setUser(updatedUser);
    localStorage.setItem("don_louis_user", JSON.stringify(updatedUser));
    try {
      await supabase
        .from("members")
        .update({
          points: updatedUser.points,
          visits_in_cycle: updatedUser.visitsInCycle,
          rewards_available: updatedUser.rewardsAvailable,
          is_following_social: updatedUser.isFollowingSocial,
          last_visit_date: updatedUser.lastVisitDate,
        })
        .eq("member_id", updatedUser.memberId);
    } catch (err) {}
  };

  const updateAdminSettings = async (newSettings: AdminSettings) => {
    // Instant UI update
    setAdminSettings(newSettings);
    // Background Persist
    try {
      await supabase
        .from("settings")
        .update({ config: newSettings })
        .eq("id", "app_config");
    } catch (err) {
      console.error("Failed to save settings:", err);
    }
  };

  const handleCashierScanResult = async (memberId: string) => {
    try {
      const { data: member, error } = await supabase
        .from("members")
        .select("*")
        .eq("member_id", memberId)
        .single();
      if (error || !member)
        return { success: false, message: "Member Not Found" };
      const newVisits = member.visits_in_cycle + 1;
      let newRewards = member.rewards_available;
      let finalVisits = newVisits;
      if (newVisits >= 5) {
        newRewards += 1;
        finalVisits = 0;
      }
      const { data: updatedData } = await supabase
        .from("members")
        .update({
          points: member.points + 1,
          visits_in_cycle: finalVisits,
          rewards_available: newRewards,
          last_visit_date: new Date().toISOString(),
        })
        .eq("member_id", memberId)
        .select()
        .single();
      const updatedMember: UserProfile = {
        firstName: updatedData.first_name,
        phone: updatedData.phone,
        points: updatedData.points,
        visitsInCycle: updatedData.visits_in_cycle,
        rewardsAvailable: updatedData.rewards_available,
        isRegistered: true,
        memberId: updatedData.member_id,
        lastVisitDate: updatedData.last_visit_date,
        isFollowingSocial: updatedData.is_following_social,
      };
      if (user?.memberId === memberId) {
        setUser(updatedMember);
        localStorage.setItem("don_louis_user", JSON.stringify(updatedMember));
        setShowScanSuccess(true);
      }
      return {
        success: true,
        member: updatedMember,
        rewardUnlocked: newVisits >= 5,
      };
    } catch (err) {
      return { success: false, message: "Server Error" };
    }
  };

  if (dbError) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-8 text-center text-white">
        <AlertTriangle size={48} className="text-red-500 mb-4" />
        <h2 className="text-xl font-bold mb-2">Connection Error</h2>
        <p className="text-zinc-500 mb-4">{dbError}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-2 bg-white text-black rounded-full font-bold"
        >
          Retry
        </button>
      </div>
    );
  }

  const renderScreen = () => {
    switch (currentScreen) {
      case AppScreen.SPLASH:
        return <SplashScreen settings={adminSettings.splash} />;
      case AppScreen.JOIN:
        return <WelcomeScreen onJoin={handleRegister} />;
      case AppScreen.HOME:
        return (
          <HomeScreen
            user={user}
            adminSettings={adminSettings}
            onScan={() => {}}
          />
        );
      case AppScreen.MENU:
        return <MenuScreen adminSettings={adminSettings} />;
      case AppScreen.OFFERS:
        return <OffersScreen adminSettings={adminSettings} />;
      case AppScreen.LOCATION:
        return (
          <LocationScreen
            onStaffAccess={() => setCurrentScreen(AppScreen.CASHIER_AUTH)}
            onAdminAccess={() => setCurrentScreen(AppScreen.ADMIN_AUTH)}
          />
        );
      case AppScreen.PROFILE:
        return <ProfileScreen user={user} onUpdateUser={handleUpdateUser} />;
      case AppScreen.CASHIER_AUTH:
      case AppScreen.CASHIER_SCAN:
        return (
          <CashierScreen
            onScanResult={handleCashierScanResult}
            onExit={() => setCurrentScreen(AppScreen.LOCATION)}
            cashierPin={adminSettings.cashierPin}
          />
        );
      case AppScreen.ADMIN_AUTH:
        return (
          <AdminAuthScreen
            onSuccess={() => setCurrentScreen(AppScreen.ADMIN_DASHBOARD)}
            onExit={() => setCurrentScreen(AppScreen.LOCATION)}
          />
        );
      case AppScreen.ADMIN_DASHBOARD:
        return (
          <AdminDashboard
            settings={adminSettings}
            onUpdateSettings={updateAdminSettings}
            onExit={() => setCurrentScreen(AppScreen.LOCATION)}
          />
        );
      default:
        return (
          <HomeScreen
            user={user}
            adminSettings={adminSettings}
            onScan={() => {}}
          />
        );
    }
  };

  const isFullPageMode = [
    AppScreen.SPLASH,
    AppScreen.JOIN,
    AppScreen.CASHIER_AUTH,
    AppScreen.CASHIER_SCAN,
    AppScreen.ADMIN_AUTH,
    AppScreen.ADMIN_DASHBOARD,
  ].includes(currentScreen);

  return (
    <div className="relative min-h-screen bg-black overflow-hidden select-none">
      <AnimatePresence mode="wait">{renderScreen()}</AnimatePresence>

      {!isFullPageMode && (
        <Layout currentScreen={currentScreen} onNavigate={setCurrentScreen} />
      )}

      <AnimatePresence>
        {showScanSuccess && (
          <ScanSuccessModal
            onClose={() => setShowScanSuccess(false)}
            points={user?.points || 0}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showInactivityModal && user && (
          <InactivityModal
            onClose={() => setShowInactivityModal(false)}
            userPoints={user.points}
            userName={user.firstName}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default App;
