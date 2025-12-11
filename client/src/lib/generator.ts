import JSZip from 'jszip';
import { saveFile } from './file-utils';

export interface TestCase {
  id: string;
  name: string;
  preReqCount: number;
  preReqs: { app: string; custom?: string }[];
}

export interface ScenarioData {
  scenarioName: string;
  author: string;
  testCases: TestCase[];
  testsApp: string;
  testsAppCustom?: string;
}

export const generateZip = async (data: ScenarioData) => {
  const zip = new JSZip();
  const folderName = data.scenarioName.replace(/\s+/g, '_');
  const root = zip.folder(folderName);

  if (!root) throw new Error("Failed to create zip folder");

  // Create a README or metadata file
  const metaContent = `Scenario: ${data.scenarioName}
Author: ${data.author}
Generated: ${new Date().toLocaleString()}
Test App: ${data.testsApp === 'Custom' ? data.testsAppCustom : data.testsApp}

Test Cases:
${data.testCases.map((tc, i) => `${i + 1}. ${tc.name} (Pre-reqs: ${tc.preReqCount})`).join('\n')}
`;
  root.file("info.txt", metaContent);

  // Generate boilerplate for each test case
  data.testCases.forEach((tc) => {
    const tcFolder = root.folder(tc.name.replace(/\s+/g, '_'));
    if (tcFolder) {
      // Create a dummy script file
      const scriptContent = `// Test Case: ${tc.name}
// Author: ${data.author}
// Pre-requisites:
${tc.preReqs.map((pr, i) => `//  ${i + 1}. ${pr.app === 'Custom' ? pr.custom : pr.app}`).join('\n')}

function runTest() {
  console.log("Running ${tc.name}...");
  // TODO: Implement test steps
}
`;
      tcFolder.file(`${tc.name.replace(/\s+/g, '_')}.js`, scriptContent);
      
      // Create a config file
      tcFolder.file("config.json", JSON.stringify({
        id: tc.id,
        name: tc.name,
        preReqs: tc.preReqs
      }, null, 2));
    }
  });

  const content = await zip.generateAsync({ type: "blob" });
  await saveFile(
    content, 
    `${folderName}_Boilerplate.zip`, 
    "ZIP Archive", 
    { "application/zip": [".zip"] }
  );
};
