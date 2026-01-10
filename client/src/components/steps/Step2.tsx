import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { GlassCard, WizardHeader } from "@/components/ui/glass-card";
import { ArrowRight, ArrowLeft, Plus, Trash2, AlertTriangle } from "lucide-react";
import { TestCase } from "@/lib/generator";
import { motion } from "framer-motion";
import { NumberStepper } from "@/components/ui/number-stepper";
import { hasNameWarning, normalizeName } from "@/lib/name-utils";
import { useState } from "react";

interface Step2Props {
  testCases: TestCase[];
  onUpdate: (testCases: TestCase[]) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function Step2({ testCases, onUpdate, onNext, onBack }: Step2Props) {
  const [touchedNames, setTouchedNames] = useState<Record<string, boolean>>({});
  const [focusedNames, setFocusedNames] = useState<Record<string, boolean>>({});

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
    <GlassCard className="w-full max-w-6xl">
      <WizardHeader 
        step={2} 
        title="Define Test Cases" 
        subtitle="Name each test case and specify pre-requisites" 
      />

      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
        <div className="text-sm text-muted-foreground">
          {testCases.length} Test Case{testCases.length === 1 ? "" : "s"}
        </div>
        <Button 
          variant="outline" 
          onClick={addTestCase}
          className="border-white/10 hover:bg-white/5 text-muted-foreground hover:text-white"
        >
          <Plus className="mr-2 h-4 w-4" /> Add Test Case
        </Button>
      </div>

      <div className="hidden md:grid grid-cols-[64px_minmax(0,1fr)_160px_44px] gap-4 px-4 py-2 text-xs uppercase tracking-wider text-muted-foreground border-y border-white/10">
        <span>Index</span>
        <span>Test Case</span>
        <span>Pre-Reqs</span>
        <span></span>
      </div>

      <div className="max-h-[55vh] overflow-y-auto rounded-2xl border border-white/10 bg-white/5 custom-scrollbar">
        <div className="divide-y divide-white/10">
          {testCases.map((tc, index) => {
          const hasWarning = hasNameWarning(tc.name);
          const suggestion = hasWarning ? normalizeName(tc.name) : "";
          const canFix = hasWarning && suggestion.length > 0 && suggestion !== tc.name.trim();
          const isTouched = Boolean(touchedNames[tc.id]);
          const isFocused = Boolean(focusedNames[tc.id]);
          const showWarning = isTouched && hasWarning && !isFocused;

          return (
            <motion.div 
              key={tc.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="p-4 transition-colors"
            >
              <div className="grid gap-4 md:grid-cols-[64px_minmax(0,1fr)_160px_44px] items-center">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold text-sm border border-primary/20">
                  {index + 1}
                </div>

                <div className="min-w-0 space-y-2">
                  <Label className="text-xs text-muted-foreground uppercase tracking-wider">Test Case Name</Label>
                  <div className="relative">
                    <Input
                      value={tc.name}
                      onChange={(e) => updateTestCase(index, 'name', e.target.value)}
                      placeholder={`Test_Case_${index + 1}`}
                      className={`bg-black/20 border-white/10 font-mono h-9 ${
                        showWarning ? "border-yellow-400/80 focus-visible:ring-yellow-400/30 pr-10" : ""
                      }`}
                      onFocus={() =>
                        setFocusedNames((prev) => ({
                          ...prev,
                          [tc.id]: true
                        }))
                      }
                      onBlur={() =>
                        {
                          setFocusedNames((prev) => ({
                            ...prev,
                            [tc.id]: false
                          }));
                          setTouchedNames((prev) => ({
                            ...prev,
                            [tc.id]: true
                          }));
                        }
                      }
                    />
                    {showWarning && (
                      <div
                        aria-label="Test case name warning"
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-yellow-400/90"
                      >
                        <AlertTriangle className="h-4 w-4" />
                      </div>
                    )}
                  </div>
                  {showWarning && (
                    <div className="flex flex-wrap items-center gap-2 text-xs text-yellow-300/90">
                      <span>Double underscore or space detected.</span>
                      {suggestion && (
                        <span className="font-mono text-yellow-200">Suggested: {suggestion}</span>
                      )}
                      {canFix && (
                        <Button
                          type="button"
                          size="sm"
                          className="bg-yellow-400 text-black border border-yellow-500 hover:bg-yellow-300 h-6 px-3 text-[11px]"
                          onClick={() => updateTestCase(index, 'name', suggestion)}
                        >
                          Fix
                        </Button>
                      )}
                    </div>
                  )}
                  <div className="space-y-1">
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

                <div className="space-y-1 flex flex-col items-center">
                  <Label className="w-full text-center text-xs text-muted-foreground uppercase tracking-wider">Pre-Reqs</Label>
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
                  className="self-center text-muted-foreground hover:text-red-400 hover:bg-red-500/10 disabled:opacity-50"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </motion.div>
          );
          })}
        </div>
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
