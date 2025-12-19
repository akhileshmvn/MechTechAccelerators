import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { GlassCard, WizardHeader } from "@/components/ui/glass-card";
import { ArrowRight, ArrowLeft, Plus, Trash2 } from "lucide-react";
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

  const createTestCaseId = () => {
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
      try {
        return crypto.randomUUID();
      } catch (err) {
        console.warn("randomUUID unavailable", err);
      }
    }
    return `tc-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  };

  const addTestCase = () => {
    const nextIndex = testCases.length;
    const newCase: TestCase = {
      id: createTestCaseId(),
      name: `Test_Case_${nextIndex + 1}`,
      preReqCount: 1,
      preReqs: [{ app: "PowerChart" }],
      testRailLink: ""
    };
    onUpdate([...testCases, newCase]);
  };

  const removeTestCase = (index: number) => {
    if (testCases.length <= 1) return;
    const updated = testCases.filter((_, i) => i !== index);
    onUpdate(updated);
  };
  
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
        step={2} 
        title="Define Test Cases" 
        subtitle="Name each test case and specify pre-requisites" 
      />

      <div className="flex justify-end mb-3">
        <Button 
          variant="outline" 
          onClick={addTestCase}
          className="border-white/10 hover:bg-white/5 text-muted-foreground hover:text-white"
        >
          <Plus className="mr-2 h-4 w-4" /> Add Test Case
        </Button>
      </div>

      <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
        {testCases.map((tc, index) => (
          <motion.div 
            key={tc.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className="p-4 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 transition-colors"
          >
            <div className="space-y-3">
              <div className="flex flex-wrap md:flex-nowrap items-center gap-4">
                <div className="flex-none w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm border border-primary/20">
                  {index + 1}
                </div>
                
                <div className="flex-grow min-w-[200px] space-y-1">
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

                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => removeTestCase(index)}
                  disabled={testCases.length === 1}
                  className="text-muted-foreground hover:text-red-400 hover:bg-red-500/10 disabled:opacity-50"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-1 md:pl-12">
                <Label className="text-xs text-muted-foreground uppercase tracking-wider">TestRail Link (optional)</Label>
                <Input
                  value={tc.testRailLink ?? ''}
                  onChange={(e) => updateTestCase(index, 'testRailLink', e.target.value)}
                  placeholder="https://your-testrail-link"
                  className="bg-black/20 border-white/10 h-9"
                  type="url"
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
