import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { GlassCard, WizardHeader } from "@/components/ui/glass-card";
import { ArrowLeft, Download, RefreshCw } from "lucide-react";
import { TestCase } from "@/lib/generator";
import { motion } from "framer-motion";

interface Step3Props {
  testCases: TestCase[];
  testsApp: string;
  testsAppCustom: string;
  onUpdateTestCase: (index: number, reqIndex: number, field: string, value: string) => void;
  onUpdateApp: (app: string, custom?: string) => void;
  onGenerate: () => void;
  onReset: () => void;
  onBack: () => void;
}

export default function Step3({ 
  testCases, 
  testsApp, 
  testsAppCustom, 
  onUpdateTestCase, 
  onUpdateApp, 
  onGenerate, 
  onReset, 
  onBack 
}: Step3Props) {

  return (
    <GlassCard className="w-full max-w-6xl">
      <WizardHeader 
        step={3} 
        title="Assign Pre-Requisites" 
        subtitle="Map specific applications to each pre-requisite" 
      />

      <div className="space-y-6">
        <div className="max-h-[60vh] overflow-y-auto custom-scrollbar rounded-2xl border border-white/10 bg-white/5">
          {testCases.map((tc, tcIndex) => (
            <div key={tc.id} className="grid gap-4 border-b border-white/10 md:grid-cols-[minmax(0,240px)_1fr]">
              <div className="px-5 py-3 flex items-center gap-3 text-left">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold text-sm border border-primary/20">
                  {tcIndex + 1}
                </div>
                <div className="text-lg font-semibold text-primary">
                  {tc.name}
                </div>
              </div>
              <div className="divide-y divide-white/10">
                {tc.preReqs.map((req, reqIndex) => (
                  <div key={reqIndex} className="flex flex-wrap items-center gap-3 px-5 py-3">
                    <Label className="w-20 text-xs text-muted-foreground uppercase shrink-0">
                      Pre-Req {reqIndex + 1}
                    </Label>
                    <div className="flex-1 flex gap-2 min-w-[220px]">
                      <Select 
                        value={req.app} 
                        onValueChange={(val) => onUpdateTestCase(tcIndex, reqIndex, 'app', val)}
                      >
                        <SelectTrigger className={`bg-black/20 border-white/10 h-9 transition-all duration-300 ${req.app === 'Custom' ? 'w-[140px]' : 'w-full'}`}>
                          <SelectValue placeholder="Select App" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="PowerChart">PowerChart</SelectItem>
                          <SelectItem value="Revenue Cycle">Revenue Cycle</SelectItem>
                          <SelectItem value="Database Update">Database Update</SelectItem>
                          <SelectItem value="API">API</SelectItem>
                          <SelectItem value="Custom">Custom</SelectItem>
                        </SelectContent>
                      </Select>
                      
                      {req.app === 'Custom' && (
                        <motion.div initial={{ opacity: 0, flex: 0 }} animate={{ opacity: 1, flex: 1 }} className="min-w-0">
                          <Input 
                            placeholder="Custom App Name"
                            value={req.custom || ''}
                            onChange={(e) => onUpdateTestCase(tcIndex, reqIndex, 'custom', e.target.value)}
                            className="bg-black/20 border-white/10 h-9 w-full"
                          />
                        </motion.div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-4 rounded-xl bg-blue-500/10 dark:bg-blue-900/20 border border-blue-500/20 dark:border-blue-700/30 px-4 py-3">
          <span className="text-sm font-medium text-blue-200 app-exec-label">
            Application where test cases will be executed:
          </span>
          <Select 
            value={testsApp} 
            onValueChange={(val) => onUpdateApp(val, testsAppCustom)}
          >
            <SelectTrigger className={`bg-black/20 border-white/10 transition-all duration-300 ${testsApp === 'Custom' ? 'w-[140px]' : 'w-[220px]'}`}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="PowerChart">PowerChart</SelectItem>
              <SelectItem value="Revenue Cycle">Revenue Cycle</SelectItem>
              <SelectItem value="Database Update">Database Update</SelectItem>
              <SelectItem value="API">API</SelectItem>
              <SelectItem value="Custom">Custom</SelectItem>
            </SelectContent>
          </Select>
          
          {testsApp === 'Custom' && (
            <Input 
              placeholder="Custom Test App"
              value={testsAppCustom}
              onChange={(e) => onUpdateApp(testsApp, e.target.value)}
              className="bg-black/20 border-white/10 flex-1 min-w-[200px]"
            />
          )}
        </div>
      </div>

      <div className="pt-6 flex flex-wrap gap-4 justify-between items-center">
         <Button 
          variant="ghost" 
          onClick={onReset}
          className="text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-full"
        >
          <RefreshCw className="mr-2 h-4 w-4" /> Reset
        </Button>
        
        <div className="flex gap-3">
          <Button 
            variant="secondary" 
            onClick={onBack}
            className="rounded-full"
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>
          <Button 
            size="lg" 
            onClick={onGenerate} 
            className="rounded-full px-8 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 shadow-lg shadow-green-500/25 transition-all hover:scale-105 active:scale-95"
          >
            Generate ZIP <Download className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </GlassCard>
  );
}
