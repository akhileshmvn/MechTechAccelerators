import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { GlassCard, WizardHeader } from "@/components/ui/glass-card";
import { ArrowRight, ArrowLeft } from "lucide-react";
import { TestCase } from "@/lib/generator";
import { motion } from "framer-motion";
import { NumberStepper } from "@/components/ui/number-stepper";

interface Step3Props {
  testCases: TestCase[];
  onUpdate: (testCases: TestCase[]) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function Step3({ testCases, onUpdate, onNext, onBack }: Step3Props) {
  
  const updateTestCase = (index: number, field: keyof TestCase, value: any) => {
    const newTestCases = [...testCases];
    newTestCases[index] = { ...newTestCases[index], [field]: value };
    
    // If updating preReqCount, we might need to adjust the preReqs array
    if (field === 'preReqCount') {
       const count = parseInt(value) || 1;
       const currentReqs = newTestCases[index].preReqs || [];
       if (count > currentReqs.length) {
         // Add more
         for (let i = currentReqs.length; i < count; i++) {
           currentReqs.push({ app: 'PowerChart' });
         }
       } else if (count < currentReqs.length) {
         // Remove extras
         currentReqs.splice(count);
       }
       newTestCases[index].preReqs = currentReqs;
    }
    
    onUpdate(newTestCases);
  };

  return (
    <GlassCard className="w-full max-w-2xl">
      <WizardHeader 
        step={3} 
        title="Define Test Cases" 
        subtitle="Name each test case and specify pre-requisites" 
      />

      <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
        {testCases.map((tc, index) => (
          <motion.div 
            key={tc.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className="p-4 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className="flex-none w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm border border-primary/20">
                {index + 1}
              </div>
              
              <div className="flex-grow space-y-1">
                <Label className="text-xs text-muted-foreground uppercase tracking-wider">Test Case Name</Label>
                <Input
                  value={tc.name}
                  onChange={(e) => updateTestCase(index, 'name', e.target.value)}
                  placeholder={`Test_Case_${index + 1}`}
                  className="bg-black/20 border-white/10 font-mono h-9"
                />
              </div>

              <div className="w-40 space-y-1">
                <Label className="text-xs text-muted-foreground uppercase tracking-wider pl-1">Pre-Reqs</Label>
                <NumberStepper 
                  value={tc.preReqCount} 
                  onChange={(val) => updateTestCase(index, 'preReqCount', val)}
                  min={1}
                  className="h-9"
                />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="pt-6 flex justify-between items-center">
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
          className="rounded-full px-8 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 shadow-lg shadow-blue-500/25 transition-all hover:scale-105 active:scale-95"
        >
          Next <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </GlassCard>
  );
}
