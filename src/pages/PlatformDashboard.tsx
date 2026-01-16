/**
 * Platform Dashboard Page
 * Main landing page for Ceigall AI Platform
 */

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PlatformDashboardUI } from "@/components/platform/PlatformDashboardUI";
import { getPlatformSummary, getRecentActivity, getCurrentUserProfile } from "@/lib/api/platform";
import { PlatformSummary, RecentActivity, UserProfile } from "@/lib/types/platform";

// Cache platform dashboard data for instant loading
const PLATFORM_CACHE_KEY = 'platform_dashboard_cache_v1';
const CACHE_DURATION = 2 * 60 * 1000; // 2 minutes

interface CachedPlatformData {
  summary: PlatformSummary;
  recentActivity: RecentActivity[];
  userProfile: UserProfile;
  timestamp: number;
}

const getCachedPlatformData = (): CachedPlatformData | null => {
  try {
    const cached = localStorage.getItem(PLATFORM_CACHE_KEY);
    if (!cached) return null;
    
    const data = JSON.parse(cached);
    const now = Date.now();
    
    if (now - data.timestamp > 60 * 60 * 1000) { // 1 hour max
      localStorage.removeItem(PLATFORM_CACHE_KEY);
      return null;
    }
    
    return data;
  } catch {
    return null;
  }
};

const setCachedPlatformData = (summary: PlatformSummary, recentActivity: RecentActivity[], userProfile: UserProfile): void => {
  try {
    localStorage.setItem(PLATFORM_CACHE_KEY, JSON.stringify({
      summary,
      recentActivity,
      userProfile,
      timestamp: Date.now()
    }));
  } catch {
    // Ignore cache errors
  }
};

const isCacheFresh = (): boolean => {
  try {
    const cached = localStorage.getItem(PLATFORM_CACHE_KEY);
    if (!cached) return false;
    const { timestamp } = JSON.parse(cached);
    return Date.now() - timestamp < CACHE_DURATION;
  } catch {
    return false;
  }
};

export default function PlatformDashboard() {
  const navigate = useNavigate();
  const cachedData = getCachedPlatformData();
  
  const [summary, setSummary] = useState<PlatformSummary | null>(cachedData?.summary || null);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>(cachedData?.recentActivity || []);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(cachedData?.userProfile || null);

  useEffect(() => {
    // If cache is fresh, don't fetch
    if (isCacheFresh()) {
      return;
    }

    // Fetch fresh data (silently in background if we have cache)
    Promise.all([
      getPlatformSummary(),
      getRecentActivity(),
      getCurrentUserProfile(),
    ]).then(([summaryData, activityData, profileData]) => {
      setSummary(summaryData);
      setRecentActivity(activityData);
      setUserProfile(profileData);
      setCachedPlatformData(summaryData, activityData, profileData);
    });
  }, []);

  if (!summary || !userProfile) {
    return <div>Loading...</div>;
  }

  return (
    <PlatformDashboardUI
      summary={summary}
      recentActivity={recentActivity}
      userDepartment={userProfile.department}
      onNavigate={navigate}
    />
  );
}
