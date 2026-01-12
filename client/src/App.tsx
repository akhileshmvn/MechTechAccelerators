import { Switch, Route } from "wouter";
import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import NotFound from "@/pages/not-found";
import Wizard from "@/pages/Wizard";
import Landing from "@/pages/Landing";
import PatientGenerator from "@/pages/PatientGenerator";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/boilerplate" component={Wizard} />
      <Route path="/patient-generator" component={PatientGenerator} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "light") {
      root.classList.add("light");
    } else {
      root.classList.remove("light");
    }
    window.localStorage.setItem("mechtech-theme", theme);
  }, [theme]);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <button
          type="button"
          onClick={() => setTheme((prev) => (prev === "dark" ? "light" : "dark"))}
          aria-label="Toggle theme"
          className="fixed top-4 right-6 z-50 inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/70 px-3 py-2 text-muted-foreground shadow-lg backdrop-blur transition-colors hover:text-foreground"
        >
          <Sun
            className={cn(
              "h-4 w-4 transition-all",
              theme === "light" ? "text-primary" : "opacity-50"
            )}
          />
          <Moon
            className={cn(
              "h-4 w-4 transition-all",
              theme === "dark" ? "text-primary" : "opacity-50"
            )}
          />
        </button>
        <Router />
        <div className="fixed bottom-4 right-6 text-xs text-muted-foreground/40 font-mono pointer-events-none select-none z-50">
          Created By Akhilesh
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
