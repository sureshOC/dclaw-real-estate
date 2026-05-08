"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { getDashboardStats } from "@/lib/api";

export default function DashboardPage() {
  const [stats, setStats] = useState({
    total_properties: 0,
    occupied: 0,
    vacant: 0,
    open_maintenance: 0,
  });

  useEffect(() => {
    getDashboardStats()
      .then(setStats)
      .catch(console.error);
  }, []);

  return (
    <main>
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Total Properties</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-semibold">{stats.total_properties}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Occupied</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-semibold">{stats.occupied}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Vacant</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-semibold">{stats.vacant}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Open Maintenance</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-semibold">{stats.open_maintenance}</p>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
