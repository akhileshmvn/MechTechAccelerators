import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { GlassCard, WizardHeader } from "@/components/ui/glass-card";
import { Plus, Trash2, Download, ArrowLeft, AlertCircle } from "lucide-react";
import { generatePatientData, Batch } from "@/lib/patientGenerator";
import { useToast } from "@/hooks/use-toast";
import { NumberStepper } from "@/components/ui/number-stepper";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";

export default function PatientGenerator() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const createBatchId = () => {
    // Some hosting setups (e.g. non-HTTPS S3 websites) block crypto.randomUUID
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
      try {
        return crypto.randomUUID();
      } catch (err) {
        console.warn("randomUUID unavailable", err);
      }
    }
    return `batch-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  };

  const [batches, setBatches] = useState<Batch[]>(() => [
    { id: createBatchId(), startName: "EPRNAAAA", count: 10 }
  ]);
  const [fileName, setFileName] = useState("");

  const addBatch = () => {
    setBatches([...batches, { id: createBatchId(), startName: "", count: 10 }]);
  };

  const removeBatch = (id: string) => {
    if (batches.length > 1) {
      setBatches(batches.filter(b => b.id !== id));
    }
  };

  const updateBatch = (id: string, field: keyof Batch, value: any) => {
    setBatches(batches.map(b => b.id === id ? { ...b, [field]: value } : b));
  };

  const handleGenerate = async () => {
    try {
      // Validate
      for (const b of batches) {
        if (!b.startName || b.startName.length < 5) {
          throw new Error(`Invalid start name "${b.startName}". Must match format like EPRNAAAA.`);
        }
      }

      await generatePatientData(batches, fileName);
      
      toast({
        title: "Success!",
        description: "Patient data Excel file generated.",
        className: "bg-green-500/10 border-green-500/20 text-green-200"
      });
    } catch (e: any) {
      toast({
        title: "Generation Failed",
        description: e.message || "Unknown error occurred",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-600/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/20 rounded-full blur-[120px]" />
      </div>

      <GlassCard className="w-full max-w-4xl relative z-10">
        <div className="mb-8 flex items-center justify-between">
            <Button 
              variant="ghost" 
              onClick={() => setLocation('/')}
              className="text-muted-foreground hover:text-white hover:bg-white/5 rounded-full"
            >
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
            </Button>
        </div>

        <WizardHeader 
          step={1} 
          title="Patient Data Generator" 
          subtitle="Generate randomized patient datasets for QA automation" 
          showStep={false}
        />

        <div className="mt-8 space-y-6">
          <div className="grid grid-cols-[1fr_160px_60px] gap-4 px-4 text-xs font-medium uppercase tracking-wider text-muted-foreground mb-2">
            <div>Starting Patient Name</div>
            <div className="text-center">Count</div>
            <div></div>
          </div>

          <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
            <AnimatePresence initial={false}>
              {batches.map((batch) => (
                <motion.div 
                  key={batch.id}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="grid grid-cols-[1fr_160px_60px] gap-4 items-center p-4 bg-white/5 border border-white/5 rounded-xl hover:border-white/10 transition-colors"
                >
                  <Input 
                    value={batch.startName}
                    onChange={(e) => updateBatch(batch.id, 'startName', e.target.value.toUpperCase())}
                    placeholder="e.g. EPRNAAAA"
                    className="bg-black/20 border-white/10 font-mono tracking-widest uppercase placeholder:normal-case placeholder:tracking-normal"
                  />
                  
                  <div className="flex justify-center">
                    <NumberStepper 
                      value={batch.count}
                      onChange={(val) => updateBatch(batch.id, 'count', val)}
                      min={1}
                      className="w-full"
                    />
                  </div>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeBatch(batch.id)}
                    disabled={batches.length === 1}
                    className="text-muted-foreground hover:text-red-400 hover:bg-red-500/10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          <div className="flex gap-4 pt-4 border-t border-white/10">
             <Button 
              variant="outline" 
              onClick={addBatch}
              className="border-white/10 hover:bg-white/5 text-muted-foreground hover:text-white"
            >
              <Plus className="mr-2 h-4 w-4" /> Add Batch
            </Button>
            
            <div className="flex-1 flex gap-4 justify-end">
              <Input 
                placeholder="Optional Filename (e.g. Run_12)"
                value={fileName}
                onChange={(e) => setFileName(e.target.value)}
                className="max-w-[250px] bg-black/20 border-white/10"
              />
              <Button 
                onClick={handleGenerate}
                className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 shadow-lg shadow-green-500/25 text-white border-0"
              >
                Generate Excel <Download className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
        
        <div className="mt-8 p-4 rounded-lg bg-blue-500/10 border border-blue-500/20 text-sm text-blue-200 flex gap-3 items-start">
          <AlertCircle className="h-5 w-5 shrink-0 text-blue-400 mt-0.5" />
          <div className="space-y-1">
            <p className="font-medium text-blue-300">Important Note:</p>
            <p className="opacity-80">The columns <b>Scenario, TestCase, HealthPlan, and Secondary Personnel</b> must be manually updated in the generated Excel file before use.</p>
          </div>
        </div>

      </GlassCard>
    </div>
  );
}
