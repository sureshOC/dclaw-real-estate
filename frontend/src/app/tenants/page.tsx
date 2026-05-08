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
import { getTenants, getProperties, type Tenant, type Property } from "@/lib/api";

export default function TenantsPage() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);

  useEffect(() => {
    getTenants()
      .then(setTenants)
      .catch(console.error);
    getProperties()
      .then(setProperties)
      .catch(console.error);
  }, []);

  const propertyMap = new Map(properties.map((p) => [p.id, p]));

  return (
    <main>
      <h1 className="text-3xl font-bold mb-6">Tenants</h1>
      <div className="overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Property</TableHead>
              <TableHead>Lease Start</TableHead>
              <TableHead>Lease End</TableHead>
              <TableHead>Rent</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tenants.map((t) => {
              const prop = t.property_id
                ? propertyMap.get(t.property_id)
                : null;
              return (
                <TableRow key={t.id}>
                  <TableCell>
                    {t.first_name} {t.last_name}
                  </TableCell>
                  <TableCell>{t.email}</TableCell>
                  <TableCell>{prop ? prop.title : "—"}</TableCell>
                  <TableCell>{t.lease_start || "—"}</TableCell>
                  <TableCell>{t.lease_end || "—"}</TableCell>
                  <TableCell>
                    {t.rent_amount ? `$${t.rent_amount}` : "—"}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </main>
  );
}
