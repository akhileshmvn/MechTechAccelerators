import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { GlassCard, WizardHeader } from "@/components/ui/glass-card";
import { ArrowRight, ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";

interface Step1Props {
  scenarioName: string;
  author: string;
  onUpdate: (data: { scenarioName: string; author: string }) => void;
  onNext: () => void;
}

export default function Step1({ scenarioName, author, onUpdate, onNext }: Step1Props) {
  const isValid = scenarioName.trim().length > 0 && author.trim().length > 0;
  const [, setLocation] = useLocation();

  return (
    <GlassCard className="w-full max-w-lg">
      <WizardHeader 
        step={1} 
        title="MechTechs Boilerplate Files Generator" 
        subtitle="Start by defining your scenario details" 
      />

      <div className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="scenarioName" className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Scenario Name
          </Label>
          <Input
            id="scenarioName"
            placeholder="e.g. Login_Authentication_Flow"
            value={scenarioName}
            onChange={(e) => onUpdate({ scenarioName: e.target.value, author })}
            className="h-12 bg-white/5 border-white/10 text-lg font-mono placeholder:text-muted-foreground/50 focus:border-primary/50 focus:ring-primary/20 transition-all"
            autoFocus
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="author" className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Author
          </Label>
          <Input
            id="author"
            placeholder="e.g. John Doe"
            value={author}
            onChange={(e) => onUpdate({ scenarioName, author: e.target.value })}
            className="h-12 bg-white/5 border-white/10 text-lg font-mono placeholder:text-muted-foreground/50 focus:border-primary/50 focus:ring-primary/20 transition-all"
          />
        </div>

        <div className="pt-4 flex justify-between">
           <Button 
            variant="ghost" 
            onClick={() => setLocation('/')}
            className="text-muted-foreground hover:text-white hover:bg-white/5 rounded-full px-6"
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Home
          </Button>

          <Button 
            size="lg" 
            onClick={onNext} 
            disabled={!isValid}
            className="rounded-full px-8 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 shadow-lg shadow-blue-500/25 transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100"
          >
            Next <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </GlassCard>
  );
}
