import { useState, useEffect, ReactNode } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorState {
  hasError: boolean;
  error: Error | null;
}

export function ErrorBoundary({ children, fallback }: ErrorBoundaryProps) {
  const [error, setError] = useState<ErrorState>({ hasError: false, error: null });

  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      console.error("Error caught:", event.error);
      setError({ hasError: true, error: event.error });
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error("Unhandled rejection:", event.reason);
      setError({ hasError: true, error: new Error(String(event.reason)) });
    };

    window.addEventListener("error", handleError);
    window.addEventListener("unhandledrejection", handleUnhandledRejection);

    return () => {
      window.removeEventListener("error", handleError);
      window.removeEventListener("unhandledrejection", handleUnhandledRejection);
    };
  }, []);

  if (error.hasError) {
    return (
      fallback || (
        <div className="min-h-screen flex items-center justify-center p-4 bg-background">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="max-w-md w-full">
              <CardContent className="p-8 text-center">
                <div className="flex justify-center mb-4">
                  <div className="rounded-full bg-destructive/10 p-4">
                    <AlertTriangle className="h-8 w-8 text-destructive" />
                  </div>
                </div>
                <h2 className="text-2xl font-bold mb-2">Something went wrong</h2>
                <p className="text-sm text-muted-foreground mb-6">
                  {error.error?.message || "An unexpected error occurred"}
                </p>
                <Button
                  onClick={() => {
                    setError({ hasError: false, error: null });
                    window.location.href = "/";
                  }}
                  className="w-full"
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Go to Home
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      )
    );
  }

  return <>{children}</>;
}
