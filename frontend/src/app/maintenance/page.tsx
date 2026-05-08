"use client";

import { useEffect, useState } from "react";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  getMaintenanceRequests,
  getProperties,
  getTenants,
  type MaintenanceRequest,
  type Property,
  type Tenant,
} from "@/lib/api";

export default function MaintenancePage() {
  const [requests, setRequests] = useState<MaintenanceRequest[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);

  useEffect(() => {
    getMaintenanceRequests()
      .then(setRequests)
      .catch(console.error);
    getProperties()
      .then(setProperties)
      .catch(console.error);
    getTenants()
      .then(setTenants)
      .catch(console.error);
  }, []);

  const propertyMap = new Map(properties.map((p) => [p.id, p]));
  const tenantMap = new Map(tenants.map((t) => [t.id, t]));

  const priorityVariant = (p: string) => {
    if (p === "emergency" || p === "high") return "destructive";
    if (p === "medium") return "secondary";
    return "outline";
  };

  return (
    <main>
      <h1 className="text-3xl font-bold mb-6">Maintenance Requests</h1>
      <div className="overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Property</TableHead>
              <TableHead>Tenant</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {requests.map((r) => {
              const prop = propertyMap.get(r.property_id);
              const tenant = r.tenant_id ? tenantMap.get(r.tenant_id) : null;
              return (
                <TableRow key={r.id}>
                  <TableCell>{r.title}</TableCell>
                  <TableCell>{prop ? prop.title : r.property_id}</TableCell>
                  <TableCell>
                    {tenant
                      ? `${tenant.first_name} ${tenant.last_name}`
                      : "—"}
                  </TableCell>
                  <TableCell>
                    <Badge variant={priorityVariant(r.priority)}>
                      {r.priority}
                    </Badge>
                  </TableCell>
                  <TableCell>{r.status}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </main>
  );
}
