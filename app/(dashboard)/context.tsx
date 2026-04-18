"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";

interface Organization {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
}

interface MeData {
  user: { id: string; name: string; email: string; image: string | null };
  organization: Organization | null;
}

interface DashboardContextType {
  me: MeData | null;
  loading: boolean;
  refetch: () => void;
}

const DashboardContext = createContext<DashboardContextType>({
  me: null,
  loading: true,
  refetch: () => {},
});

export function DashboardProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [me, setMe] = useState<MeData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchMe = useCallback(async () => {
    try {
      const res = await fetch("/api/me");
      if (res.status === 401) { router.push("/login"); return; }
      const data: MeData = await res.json();
      setMe(data);

      // Google OAuth users with no org → onboarding
      if (!data.organization) {
        router.push("/onboarding");
      }
    } catch {
      router.push("/login");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => { fetchMe(); }, [fetchMe]);

  return (
    <DashboardContext.Provider value={{ me, loading, refetch: fetchMe }}>
      {children}
    </DashboardContext.Provider>
  );
}

export const useDashboard = () => useContext(DashboardContext);
