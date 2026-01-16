import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getDashboardData } from "@/lib/api/dashboard";
import { DashboardData } from "@/lib/types/dashboard";
import { DashboardUI } from "@/components/dashboard/DashboardUI";

// Cache dashboard data for instant loading
const DASHBOARD_CACHE_KEY = 'dashboard_cache_v1';
const CACHE_DURATION = 2 * 60 * 1000; // 2 minutes

const getCachedDashboard = (): DashboardData | null => {
  try {
    const cached = localStorage.getItem(DASHBOARD_CACHE_KEY);
    if (!cached) return null;
    
    const { data, timestamp } = JSON.parse(cached);
    const now = Date.now();
    
    // If cache is too old, discard it
    if (now - timestamp > 60 * 60 * 1000) { // 1 hour max
      localStorage.removeItem(DASHBOARD_CACHE_KEY);
      return null;
    }
    
    return data;
  } catch {
    return null;
  }
};

const setCachedDashboard = (data: DashboardData): void => {
  try {
    localStorage.setItem(DASHBOARD_CACHE_KEY, JSON.stringify({
      data,
      timestamp: Date.now()
    }));
  } catch {
    // Ignore cache errors
  }
};

const isCacheFresh = (cachedData: DashboardData | null): boolean => {
  if (!cachedData) return false;
  try {
    const cached = localStorage.getItem(DASHBOARD_CACHE_KEY);
    if (!cached) return false;
    const { timestamp } = JSON.parse(cached);
    return Date.now() - timestamp < CACHE_DURATION;
  } catch {
    return false;
  }
};

export default function Dashboard() {
  const navigate = useNavigate();
  const cachedData = getCachedDashboard();
  const [data, setData] = useState<DashboardData | null>(cachedData);

  useEffect(() => {
    // If cache is fresh, don't fetch
    if (isCacheFresh(cachedData)) {
      return;
    }

    // Fetch fresh data (silently in background if we have cache)
    getDashboardData().then((newData) => {
      setData(newData);
      setCachedDashboard(newData);
    });
  }, []);

  if (!data) {
    return <div>Loading...</div>;
  }

  return <DashboardUI data={data} onNavigate={navigate} />;
}
