import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
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
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
        <div className="fixed bottom-4 right-6 text-xs text-muted-foreground/40 font-mono pointer-events-none select-none z-50">
          Created By Akhilesh
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
