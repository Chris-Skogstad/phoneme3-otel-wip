"use client";

import { useEffect, useState } from "react";
import PageHeading from "../components/PageHeading";
import StatCard from "../components/StatCard";
import { getApiUrl } from "../lib/config";

type Stats = {
  status: string;
  totalActivitiesCreated: number;
  totalWordSearches: number;
  totalWordles: number;
  successCount: number;
  failCount: number;
  avgTimeOnPageMs: number;
  mostUsedActivityType: string;
};

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [healthStatus, setHealthStatus] = useState<"ok" | "down" | "checking">("checking");
  const [loading, setLoading] = useState(true);

  const fetchStats = () => {
    setLoading(true);
    fetch(`${getApiUrl()}/api/stats`)
      .then((res) => res.json())
      .then((data: Stats) => setStats(data))
      .catch((err) => console.error("Error fetching stats:", err))
      .finally(() => setLoading(false));

    fetch(`${getApiUrl()}/health`)
      .then((res) => setHealthStatus(res.ok ? "ok" : "down"))
      .catch(() => setHealthStatus("down"));
  };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 15000); // refresh every 15s
    return () => clearInterval(interval);
  }, []);

  return (
    <main className="flex flex-col items-center py-10 px-4 min-h-screen bg-white dark:bg-gray-900 transition-colors">
      <PageHeading
        title="Dashboard"
        description="Live usage statistics and system health for the phoneme activity builder."
      />

      <div className="flex items-center gap-2 mb-6">
        <span
          className={`w-3 h-3 rounded-full ${
            healthStatus === "ok"
              ? "bg-green-500"
              : healthStatus === "down"
              ? "bg-red-500"
              : "bg-gray-400 animate-pulse"
          }`}
        />
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {healthStatus === "ok"
            ? "System healthy"
            : healthStatus === "down"
            ? "System unavailable"
            : "Checking status..."}
        </span>
      </div>

      {loading && !stats ? (
        <p className="text-gray-500">Loading statistics...</p>
      ) : stats ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full max-w-4xl">
          <StatCard label="Total Activities Created" value={stats.totalActivitiesCreated} />
          <StatCard label="Word Searches" value={stats.totalWordSearches} />
          <StatCard label="Wordles" value={stats.totalWordles} />
          <StatCard label="Successful Generations" value={stats.successCount} accent="success" />
          <StatCard label="Failed Generations" value={stats.failCount} accent="warning" />
          <StatCard
            label="Avg. Time on Page"
            value={`${(stats.avgTimeOnPageMs / 1000).toFixed(1)}s`}
          />
          <StatCard
            label="Most-Used Activity Type"
            value={stats.mostUsedActivityType === "none" ? "N/A" : stats.mostUsedActivityType}
          />
        </div>
      ) : (
        <p className="text-red-500">Could not load statistics.</p>
      )}
    </main>
  );
}
