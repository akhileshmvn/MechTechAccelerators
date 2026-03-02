import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { GlassCard, WizardHeader } from "@/components/ui/glass-card";
import { Plus, Trash2, Download, ArrowLeft, AlertCircle } from "lucide-react";
import { generatePatientData, Batch, generateNewConventionNames } from "@/lib/patientGenerator";
import { useToast } from "@/hooks/use-toast";
import { NumberStepper } from "@/components/ui/number-stepper";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function PatientGenerator() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [namingMode, setNamingMode] = useState<'legacy' | 'new'>('new');
  
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

  // Legacy mode state
  const [batches, setBatches] = useState<Batch[]>(() => [
    { id: createBatchId(), startName: "EPRNAAAA", count: 10 }
  ]);
  
  // New mode state
  const [newBatches, setNewBatches] = useState<Array<{ id: string; startCounter: number; count: number; environment: 'Build' | 'Release' | 'Cert' }>>(() => [
    { id: createBatchId(), startCounter: 0, count: 10, environment: 'Cert' }
  ]);
  
  const [fileName, setFileName] = useState("");
  const [includeRCEncounters, setIncludeRCEncounters] = useState(true);
  const [previewData, setPreviewData] = useState<Array<{ last: string; first: string }>>([]);
  const [showPreview, setShowPreview] = useState(false);

  const generatePreview = () => {
    try {
      if (namingMode === 'new' && newBatches.length > 0) {
        const preview: Array<{ last: string; first: string }> = [];
        for (const b of newBatches) {
          const names = generateNewConventionNames(b.startCounter, Math.min(b.count, 10), b.environment);
          preview.push(...names);
        }
        setPreviewData(preview.slice(0, 20)); // Show max 20 names
        setShowPreview(true);
      } else if (namingMode === 'legacy' && batches.length > 0) {
        // Legacy preview
        const preview: Array<{ last: string; first: string }> = [];
        for (const b of batches) {
          if (!b.startName || b.startName.length < 5) return;
          const names = (generateNewConventionNames as any)(0, Math.min(b.count, 10), 'Cert');
          // For legacy, we'd need to import generateNames or create a different preview
          // For now, just show a message
        }
        setShowPreview(true);
      }
    } catch (e: any) {
      toast({
        title: "Preview Error",
        description: e.message,
        variant: "destructive"
      });
    }
  };

  const addBatch = () => {
    if (namingMode === 'legacy') {
      setBatches([...batches, { id: createBatchId(), startName: "", count: 10 }]);
    } else {
      setNewBatches([...newBatches, { id: createBatchId(), startCounter: 0, count: 10, environment: 'Cert' }]);
    }
  };

  const removeBatch = (id: string) => {
    if (namingMode === 'legacy') {
      if (batches.length > 1) {
        setBatches(batches.filter(b => b.id !== id));
      }
    } else {
      if (newBatches.length > 1) {
        setNewBatches(newBatches.filter(b => b.id !== id));
      }
    }
  };

  const updateBatch = (id: string, field: string, value: any) => {
    if (namingMode === 'legacy') {
      setBatches(batches.map(b => b.id === id ? { ...b, [field]: value } : b));
    } else {
      setNewBatches(newBatches.map(b => b.id === id ? { ...b, [field]: value } : b));
    }
  };

  const handleGenerate = async () => {
    try {
      if (namingMode === 'legacy') {
        // Validate legacy batches
        for (const b of batches) {
          if (!b.startName || b.startName.length < 5) {
            throw new Error(`Invalid start name "${b.startName}". Must match format like EPRNAAAA.`);
          }
        }
        await generatePatientData(batches, fileName, { includeRCEncounters });
      } else {
        // Generate new convention batches
        const expandedBatches: Batch[] = [];
        for (const b of newBatches) {
          // Generate names for this batch
          const names = generateNewConventionNames(b.startCounter, b.count, b.environment);
          // Create a synthetic batch with all names
          let batchIndex = 0;
          for (const n of names) {
            expandedBatches.push({
              id: `${b.id}-${batchIndex}`,
              startName: `${n.last}${n.first}`, // This won't be used, but field is required
              count: 1
            });
            batchIndex++;
          }
        }
        // For now, use legacy generation - we'll handle the names mapping in the generation function
        // Actually, let's refactor to pass the new names directly
        await generatePatientData(newBatches as any, fileName, { includeRCEncounters, useNewConvention: true });
      }
      
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
          {/* Naming Convention Mode Selector */}
          <div className="flex gap-3 p-4 bg-white/5 border border-white/10 rounded-lg">
            <button
              onClick={() => setNamingMode('new')}
              className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all ${
                namingMode === 'new' 
                  ? 'bg-emerald-500/20 border border-emerald-500/50 text-emerald-300' 
                  : 'bg-white/5 border border-white/10 text-muted-foreground hover:text-white'
              }`}
            >
              New Convention (EPPAT)
            </button>
            <button
              onClick={() => setNamingMode('legacy')}
              className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all ${
                namingMode === 'legacy' 
                  ? 'bg-blue-500/20 border border-blue-500/50 text-blue-300' 
                  : 'bg-white/5 border border-white/10 text-muted-foreground hover:text-white'
              }`}
            >
              Legacy Convention
            </button>
          </div>

          {/* New Convention Mode */}
          {namingMode === 'new' && (
            <>
              <div className="grid grid-cols-[1fr_140px_120px_60px] gap-4 px-4 text-xs font-medium uppercase tracking-wider text-muted-foreground mb-2">
                <div>Start Counter</div>
                <div className="text-center">Environment</div>
                <div className="text-center">Count</div>
                <div></div>
              </div>

              <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                <AnimatePresence initial={false}>
                  {newBatches.map((batch) => (
                    <motion.div 
                      key={batch.id}
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="grid grid-cols-[1fr_140px_120px_60px] gap-4 items-center p-4 bg-white/5 border border-white/5 rounded-xl hover:border-white/10 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <Input 
                          type="number"
                          value={batch.startCounter}
                          onChange={(e) => updateBatch(batch.id, 'startCounter', parseInt(e.target.value) || 0)}
                          placeholder="0"
                          className="bg-black/20 border-white/10 font-mono"
                        />
                        <span className="text-xs text-muted-foreground whitespace-nowrap">EPPAT[...]</span>
                      </div>
                      
                      <Select value={batch.environment} onValueChange={(val) => updateBatch(batch.id, 'environment', val)}>
                        <SelectTrigger className="bg-black/20 border-white/10">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Build">Build (B)</SelectItem>
                          <SelectItem value="Release">Release (R)</SelectItem>
                          <SelectItem value="Cert">Cert (C)</SelectItem>
                        </SelectContent>
                      </Select>
                      
                      <div className="flex justify-center">
                        <NumberStepper 
                          value={batch.count}
                          onChange={(val) => updateBatch(batch.id, 'count', val)}
                          min={1}
                        />
                      </div>

                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeBatch(batch.id)}
                        disabled={newBatches.length === 1}
                        className="text-muted-foreground hover:text-red-400 hover:bg-red-500/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </>
          )}
            </>
          )}

          {/* Legacy Convention Mode */}
          {namingMode === 'legacy' && (
            <>
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
                    placeholder="E.G. EPRNAAAA"
                    className="bg-black/20 border-white/10 font-mono tracking-widest uppercase placeholder:uppercase placeholder:tracking-normal"
                  />
                  
                  <div className="flex justify-center">
                    <NumberStepper 
                      value={batch.count}
                      onChange={(val) => updateBatch(batch.id, 'count', val)}
                      min={1}
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

          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <Switch checked={includeRCEncounters} onCheckedChange={setIncludeRCEncounters} />
            <p className="flex items-center gap-2">
              {includeRCEncounters ? (
                "RC encounter columns added"
              ) : (
                <>
                  RC encounter columns not added
                  <span className="text-amber-300">(Patient creation in RC only)</span>
                </>
              )}
            </p>
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
              <Button
                variant="outline"
                onClick={generatePreview}
                className="border-white/10 hover:bg-white/5 text-muted-foreground hover:text-white"
              >
                Preview Names
              </Button>
              
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

        {/* Preview Section */}
        <AnimatePresence>
          {showPreview && previewData.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="mt-8 p-4 rounded-lg bg-blue-500/5 border border-blue-500/20"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-blue-300">Preview ({previewData.length} names shown)</h3>
                <button
                  onClick={() => setShowPreview(false)}
                  className="text-muted-foreground hover:text-white text-sm"
                >
                  ✕ Close
                </button>
              </div>
              
              <div className="max-h-[300px] overflow-y-auto rounded border border-blue-500/20 bg-black/30 custom-scrollbar">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-blue-600/20">
                    <tr>
                      <th className="px-4 py-2 text-left font-medium text-blue-300">Last Name</th>
                      <th className="px-4 py-2 text-left font-medium text-blue-300">First Name</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-blue-500/10">
                    {previewData.map((patient, idx) => (
                      <tr key={idx} className="hover:bg-blue-500/10 transition-colors">
                        <td className="px-4 py-2 font-mono text-emerald-300">{patient.last}</td>
                        <td className="px-4 py-2 font-mono text-blue-300">{patient.first}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              <p className="mt-3 text-xs text-muted-foreground flex items-center gap-2">
                <AlertCircle className="h-3 w-3" />
                {previewData.length < newBatches.reduce((sum, b) => sum + b.count, 0)
                  ? `Showing first ${previewData.length} of ${newBatches.reduce((sum, b) => sum + b.count, 0)} total patients`
                  : 'All patients shown'}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
        
        <div className="mt-8 p-4 rounded-lg bg-blue-500/10 border border-blue-500/20 text-sm text-blue-200 flex gap-3 items-start note-text">
          <AlertCircle className="h-5 w-5 shrink-0 text-blue-400 mt-0.5 note-icon" />
          <div className="space-y-1">
            <p className="font-medium text-blue-300 note-title">Important Note:</p>
            <p className="opacity-80">The columns <b>Scenario, TestCase, HealthPlan, and Secondary Personnel</b> must be manually updated in the generated Excel file before use.</p>
          </div>
        </div>

      </GlassCard>
    </div>
  );
}
