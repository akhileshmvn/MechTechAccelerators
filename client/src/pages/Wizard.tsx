import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { generateZip, TestCase } from "@/lib/generator";
import Step1 from "@/components/steps/Step1";
import Step3 from "@/components/steps/Step3";
import Step4 from "@/components/steps/Step4";
import { useToast } from "@/hooks/use-toast";

const createTestCaseId = () => {
  // randomUUID is only available in secure contexts; fall back for static http hosting
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    try {
      return crypto.randomUUID();
    } catch (err) {
      console.warn("randomUUID unavailable", err);
    }
  }
  return `tc-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
};

const createTestCase = (index: number): TestCase => ({
  id: createTestCaseId(),
  name: `Test_Case_${index + 1}`,
  preReqCount: 1,
  preReqs: [{ app: "PowerChart" }],
  testRailLink: ""
});

export default function Wizard() {
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  
  // Data State
  const [scenarioName, setScenarioName] = useState("");
  const [author, setAuthor] = useState("");
  const [testCases, setTestCases] = useState<TestCase[]>(() => [createTestCase(0)]);
  const [testsApp, setTestsApp] = useState("PowerChart");
  const [testsAppCustom, setTestsAppCustom] = useState("");

  const nextStep = () => setStep((s) => Math.min(s + 1, 3));
  const prevStep = () => setStep((s) => Math.max(s - 1, 1));

  const handleReset = () => {
    if (confirm("Are you sure you want to reset everything?")) {
      setStep(1);
      setScenarioName("");
      setAuthor("");
      setTestCases([createTestCase(0)]);
      setTestsApp("PowerChart");
      setTestsAppCustom("");
    }
  };

  const handleGenerate = async () => {
    try {
      await generateZip({
        scenarioName,
        author,
        testCases,
        testsApp,
        testsAppCustom
      });
      toast({
        title: "Success!",
        description: "Your boilerplate ZIP has been generated.",
        className: "bg-green-500/10 border-green-500/20 text-green-200"
      });
    } catch (e) {
      console.error(e);
      toast({
        title: "Error",
        description: "Failed to generate ZIP file.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/20 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 w-full flex justify-center">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div key="step1" className="w-full flex justify-center">
              <Step1 
                scenarioName={scenarioName} 
                author={author} 
                onUpdate={(d) => { setScenarioName(d.scenarioName); setAuthor(d.author); }}
                onNext={nextStep} 
              />
            </motion.div>
          )}
          {step === 2 && (
            <motion.div key="step2" className="w-full flex justify-center">
              <Step3 
                testCases={testCases} 
                onUpdate={setTestCases}
                onNext={nextStep}
                onBack={prevStep}
              />
            </motion.div>
          )}
          {step === 3 && (
            <motion.div key="step3" className="w-full flex justify-center">
              <Step4 
                testCases={testCases} 
                testsApp={testsApp}
                testsAppCustom={testsAppCustom}
                onUpdateTestCase={(idx, rIdx, field, val) => {
                  const newCases = [...testCases];
                  if (field === 'app') newCases[idx].preReqs[rIdx].app = val;
                  if (field === 'custom') newCases[idx].preReqs[rIdx].custom = val;
                  setTestCases(newCases);
                }}
                onUpdateApp={(app, custom) => {
                  setTestsApp(app);
                  if (custom !== undefined) setTestsAppCustom(custom);
                }}
                onGenerate={handleGenerate}
                onReset={handleReset}
                onBack={prevStep}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
