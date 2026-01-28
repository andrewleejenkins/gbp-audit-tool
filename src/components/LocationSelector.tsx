"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Plus, ChevronRight } from "lucide-react";
import { cn, formatDate } from "@/lib/utils";
import type { Location } from "@/types/audit";

interface LocationSelectorProps {
  locations: Location[];
  onSelect: (location: Location) => void;
  onAddNew: () => void;
  className?: string;
}

export function LocationSelector({
  locations,
  onSelect,
  onAddNew,
  className,
}: LocationSelectorProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const handleSelect = (location: Location) => {
    setSelectedId(location.id);
    onSelect(location);
  };

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Your Locations</h3>
        <Button onClick={onAddNew} size="sm">
          <Plus className="h-4 w-4 mr-1" />
          Add Location
        </Button>
      </div>

      {locations.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <MapPin className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h4 className="font-medium text-lg mb-2">No locations yet</h4>
            <p className="text-muted-foreground mb-4">
              Add your first Google Business Profile location to start auditing.
            </p>
            <Button onClick={onAddNew}>
              <Plus className="h-4 w-4 mr-1" />
              Add Your First Location
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {locations.map((location) => (
            <LocationCard
              key={location.id}
              location={location}
              isSelected={selectedId === location.id}
              onClick={() => handleSelect(location)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface LocationCardProps {
  location: Location;
  isSelected?: boolean;
  onClick: () => void;
}

function LocationCard({ location, isSelected, onClick }: LocationCardProps) {
  const getScoreColor = (score?: number) => {
    if (!score) return "bg-gray-100 text-gray-600";
    if (score >= 80) return "bg-green-100 text-green-800";
    if (score >= 60) return "bg-yellow-100 text-yellow-800";
    return "bg-red-100 text-red-800";
  };

  return (
    <Card
      className={cn(
        "cursor-pointer transition-all hover:shadow-md",
        isSelected && "ring-2 ring-primary"
      )}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <MapPin className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h4 className="font-medium">{location.name}</h4>
              {location.address && (
                <p className="text-sm text-muted-foreground">{location.address}</p>
              )}
              {location.primaryCategory && (
                <Badge variant="outline" className="mt-1 text-xs">
                  {location.primaryCategory}
                </Badge>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3">
            {location.lastAuditScore !== undefined && (
              <div className="text-right">
                <div
                  className={cn(
                    "inline-flex items-center px-2 py-1 rounded-md text-sm font-medium",
                    getScoreColor(location.lastAuditScore)
                  )}
                >
                  {location.lastAuditScore}%
                </div>
                {location.lastAuditDate && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatDate(location.lastAuditDate)}
                  </p>
                )}
              </div>
            )}
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface LocationListItemProps {
  location: Location;
  onSelect: () => void;
  onAudit: () => void;
}

export function LocationListItem({
  location,
  onSelect,
  onAudit,
}: LocationListItemProps) {
  return (
    <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
      <div className="flex items-center gap-3" onClick={onSelect}>
        <MapPin className="h-5 w-5 text-muted-foreground" />
        <div>
          <h4 className="font-medium">{location.name}</h4>
          {location.address && (
            <p className="text-sm text-muted-foreground">{location.address}</p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2">
        {location.lastAuditScore !== undefined && (
          <Badge
            variant={
              location.lastAuditScore >= 80
                ? "success"
                : location.lastAuditScore >= 60
                ? "warning"
                : "destructive"
            }
          >
            {location.lastAuditScore}%
          </Badge>
        )}
        <Button size="sm" onClick={onAudit}>
          Run Audit
        </Button>
      </div>
    </div>
  );
}
