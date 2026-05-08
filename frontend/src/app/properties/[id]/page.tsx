"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  getProperty,
  getTenants,
  getMaintenanceRequests,
  type Property,
  type Tenant,
  type MaintenanceRequest,
} from "@/lib/api";

export default function PropertyDetailPage() {
  const { id } = useParams();
  const [property, setProperty] = useState<Property | null>(null);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [maintenance, setMaintenance] = useState<MaintenanceRequest[]>([]);

  useEffect(() => {
    if (!id) return;
    getProperty(id as string)
      .then(setProperty)
      .catch(console.error);
    getTenants({ property_id: id as string })
      .then(setTenants)
      .catch(console.error);
    getMaintenanceRequests({ property_id: id as string })
      .then(setMaintenance)
      .catch(console.error);
  }, [id]);

  if (!property) {
    return <p className="p-8">Loading...</p>;
  }

  return (
    <main>
      <h1 className="text-3xl font-bold mb-2">{property.title}</h1>
      <p className="text-slate-500 mb-4">
        {property.address}, {property.city}, {property.state} {property.zip_code}
      </p>
      <div className="flex gap-2 mb-4">
        <Badge>{property.property_type}</Badge>
        <Badge
          variant={
            property.status === "available"
              ? "default"
              : property.status === "rented"
              ? "secondary"
              : "outline"
          }
        >
          {property.status}
        </Badge>
      </div>
      <p className="text-2xl font-semibold mb-6">
        ${property.price.toLocaleString()}
      </p>
      {property.description && (
        <p className="mb-6 text-slate-700">{property.description}</p>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Tenants</CardTitle>
          </CardHeader>
          <CardContent>
            {tenants.length === 0 ? (
              <p className="text-slate-500">No tenants</p>
            ) : (
              <ul className="space-y-2">
                {tenants.map((t) => (
                  <li key={t.id} className="border-b pb-2">
                    <p className="font-medium">
                      {t.first_name} {t.last_name}
                    </p>
                    <p className="text-sm text-slate-500">{t.email}</p>
                    {t.rent_amount && (
                      <p className="text-sm">${t.rent_amount}/mo</p>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Maintenance History</CardTitle>
          </CardHeader>
          <CardContent>
            {maintenance.length === 0 ? (
              <p className="text-slate-500">No maintenance requests</p>
            ) : (
              <ul className="space-y-2">
                {maintenance.map((m) => (
                  <li key={m.id} className="border-b pb-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{m.title}</span>
                      <Badge
                        variant={
                          m.priority === "emergency" || m.priority === "high"
                            ? "destructive"
                            : m.priority === "medium"
                            ? "secondary"
                            : "outline"
                        }
                      >
                        {m.priority}
                      </Badge>
                    </div>
                    <p className="text-sm text-slate-500">{m.status}</p>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
