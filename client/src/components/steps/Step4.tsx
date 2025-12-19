import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { GlassCard, WizardHeader } from "@/components/ui/glass-card";
import { ArrowLeft, Download, RefreshCw } from "lucide-react";
import { TestCase } from "@/lib/generator";
import { motion } from "framer-motion";

interface Step4Props {
  testCases: TestCase[];
  testsApp: string;
  testsAppCustom: string;
  onUpdateTestCase: (index: number, reqIndex: number, field: string, value: string) => void;
  onUpdateApp: (app: string, custom?: string) => void;
  onGenerate: () => void;
  onReset: () => void;
  onBack: () => void;
}

export default function Step4({ 
  testCases, 
  testsApp, 
  testsAppCustom, 
  onUpdateTestCase, 
  onUpdateApp, 
  onGenerate, 
  onReset, 
  onBack 
}: Step4Props) {

  return (
    <GlassCard className="w-full max-w-3xl">
      <WizardHeader 
        step={3} 
        title="Assign Pre-Requisites" 
        subtitle="Map specific applications to each pre-requisite" 
      />

      <div className="space-y-6">
        <div className="max-h-[350px] overflow-y-auto pr-2 custom-scrollbar space-y-4">
          {testCases.map((tc, tcIndex) => (
            <div key={tc.id} className="p-5 rounded-xl bg-white/5 border border-white/5">
              <h3 className="font-semibold text-primary mb-3 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-primary/20 text-xs flex items-center justify-center">{tcIndex + 1}</span>
                {tc.name}
              </h3>
              
              <div className="space-y-3 pl-8">
                {tc.preReqs.map((req, reqIndex) => (
                  <div key={reqIndex} className="flex items-center gap-3">
                    <Label className="w-20 text-xs text-muted-foreground uppercase shrink-0">
                      Pre-Req {reqIndex + 1}
                    </Label>
                    <div className="flex-1 flex gap-2">
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

        <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
          <h4 className="text-sm font-semibold text-blue-300 mb-3 uppercase tracking-wider">Global Configuration</h4>
          <div className="flex items-center gap-4">
            <Label className="shrink-0">Tests Application:</Label>
            <Select 
              value={testsApp} 
              onValueChange={(val) => onUpdateApp(val, testsAppCustom)}
            >
              <SelectTrigger className={`bg-black/20 border-white/10 transition-all duration-300 ${testsApp === 'Custom' ? 'w-[140px]' : 'w-[200px]'}`}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PowerChart">PowerChart</SelectItem>
                <SelectItem value="Revenue Cycle">Revenue Cycle</SelectItem>
                <SelectItem value="Database Update">Database Update</SelectItem>
                <SelectItem value="Custom">Custom</SelectItem>
              </SelectContent>
            </Select>
            
            {testsApp === 'Custom' && (
              <Input 
                placeholder="Custom Test App"
                value={testsAppCustom}
                onChange={(e) => onUpdateApp(testsApp, e.target.value)}
                className="bg-black/20 border-white/10 flex-1"
              />
            )}
          </div>
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
