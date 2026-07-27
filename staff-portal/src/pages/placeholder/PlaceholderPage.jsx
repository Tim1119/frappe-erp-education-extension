import { Construction } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import PageBreadcrumbs from "@/components/layout/PageBreadcrumbs";

export default function PlaceholderPage({ title }) {
  return (
    <>
      <Card className="mt-2">
        <CardContent className="flex flex-col items-center justify-center py-20 text-center">
          <Construction className="mb-4 h-12 w-12 text-muted-foreground/40" />
          <h2 className="text-lg font-semibold">{title || "Coming Soon"}</h2>
          <p className="mt-1 max-w-md text-sm text-muted-foreground">
            This module is under development and will be available soon.
          </p>
        </CardContent>
      </Card>
    </>
  );
}
