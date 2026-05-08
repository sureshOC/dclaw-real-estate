"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select } from "@/components/ui/select";
import { getProperties, type Property } from "@/lib/api";

export default function PropertiesPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [typeFilter, setTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  useEffect(() => {
    const params: Record<string, string> = {};
    if (typeFilter) params.property_type = typeFilter;
    if (statusFilter) params.status = statusFilter;
    getProperties(params)
      .then(setProperties)
      .catch(console.error);
  }, [typeFilter, statusFilter]);

  return (
    <main>
      <h1 className="text-3xl font-bold mb-6">Properties</h1>
      <div className="flex flex-wrap gap-4 mb-6">
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <option value="">All Types</option>
          <option value="house">House</option>
          <option value="apartment">Apartment</option>
          <option value="condo">Condo</option>
          <option value="commercial">Commercial</option>
          <option value="land">Land</option>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <option value="">All Statuses</option>
          <option value="available">Available</option>
          <option value="rented">Rented</option>
          <option value="sold">Sold</option>
          <option value="pending">Pending</option>
        </Select>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {properties.map((p) => (
          <Link key={p.id} href={`/properties/${p.id}`}>
            <Card className="cursor-pointer hover:shadow-md transition h-full">
              <CardHeader>
                <CardTitle>{p.title}</CardTitle>
                <CardDescription>
                  {p.address}, {p.city}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-lg font-semibold">
                  ${p.price.toLocaleString()}
                </p>
                <div className="flex gap-2 mt-2">
                  <Badge>{p.property_type}</Badge>
                  <Badge
                    variant={
                      p.status === "available"
                        ? "default"
                        : p.status === "rented"
                        ? "secondary"
                        : "outline"
                    }
                  >
                    {p.status}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </main>
  );
}
