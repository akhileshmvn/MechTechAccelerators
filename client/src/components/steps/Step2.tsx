import { Button } from "@/components/ui/button";
import { GlassCard, WizardHeader } from "@/components/ui/glass-card";
import { ArrowRight, ArrowLeft, Files } from "lucide-react";
import { NumberStepper } from "@/components/ui/number-stepper";

interface Step2Props {
  count: number;
  onUpdate: (count: number) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function Step2({ count, onUpdate, onNext, onBack }: Step2Props) {
  const isValid = count > 0;

  return (
    <GlassCard className="w-full max-w-lg text-center">
      <WizardHeader 
        step={2} 
        title="Test Case Count" 
        subtitle="How many test cases belong to this scenario?" 
      />

      <div className="py-8 flex flex-col items-center justify-center space-y-8">
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full opacity-20 group-hover:opacity-40 blur transition-all" />
          <div className="relative bg-black/50 rounded-full p-8 border border-white/10">
            <Files className="w-12 h-12 text-primary" />
          </div>
        </div>

        <div className="flex flex-col items-center gap-2">
          <NumberStepper 
            value={count || 1} 
            onChange={onUpdate}
            min={1}
            className="w-48 scale-125" 
          />
          <p className="text-sm text-muted-foreground mt-4">Test Cases</p>
        </div>
      </div>

      <div className="pt-4 flex justify-between items-center">
        <Button 
          variant="ghost" 
          onClick={onBack}
          className="text-muted-foreground hover:text-white hover:bg-white/5 rounded-full px-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        <Button 
          size="lg" 
          onClick={onNext} 
          disabled={!isValid}
          className="rounded-full px-8 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 shadow-lg shadow-blue-500/25 transition-all hover:scale-105 active:scale-95"
        >
          Next <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </GlassCard>
  );
}
