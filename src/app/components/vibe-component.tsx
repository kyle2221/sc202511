// This is a temporary file to render the generated component.
// It will be overwritten on each new generation.
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function VibeComponent() {
  return (
    <Card className="p-8 text-center">
      <CardHeader>
        <CardTitle className="text-2xl font-semibold text-foreground mb-2">
          Something amazing is cooking up...
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          Describe a vibe in the panel to get started.
        </CardDescription>
      </CardHeader>
    </Card>
  );
}
