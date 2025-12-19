import JSZip from 'jszip';
import { saveFile } from './file-utils';

export interface TestCase {
  id: string;
  name: string;
  preReqCount: number;
  preReqs: { app: string; custom?: string }[];
  testRailLink?: string;
}

export interface ScenarioData {
  scenarioName: string;
  author: string;
  testCases: TestCase[];
  testsApp: string;
  testsAppCustom?: string;
}

type NormalizedTestCase = TestCase & {
  name: string;
  preReqs: { app: string; custom?: string }[];
  testRailLink?: string;
};

const DEFAULT_CUSTOM_APP = 'CustomApp';

const normalizeTestCases = (testCases: TestCase[]): NormalizedTestCase[] =>
  testCases.map((tc, index) => {
    const name = tc.name?.trim() || `Test_Case_${index + 1}`;
    const count = Math.max(1, Number(tc.preReqCount) || tc.preReqs?.length || 1);
    const testRailLink = tc.testRailLink?.trim() || '';
    const normalizedReqs = Array.from({ length: count }, (_, preIdx) => {
      const existing = tc.preReqs?.[preIdx];
      return {
        app: existing?.app || 'PowerChart',
        custom: existing?.custom?.trim()
      };
    });

    return {
      ...tc,
      name,
      preReqCount: count,
      preReqs: normalizedReqs,
      testRailLink
    };
  });

const getApplicationName = (app: string, custom?: string) =>
  app === 'Custom' ? (custom?.trim() || DEFAULT_CUSTOM_APP) : app;

const buildPreReqScript = (
  tcName: string,
  preIndex: number,
  tcPreReqCount: number,
  maxPre: number,
  author: string,
  scenario: string,
  app: string
) => {
  let workflowLabel: string;
  if (maxPre === 1) {
    workflowLabel = `PreReq_${scenario}`;
  } else {
    const level = tcPreReqCount > 1 ? preIndex + 1 : 1;
    workflowLabel = `PreReq_${scenario}_${level}`;
  }

  const suffix = tcPreReqCount > 1 ? `_${preIndex + 1}` : '';
  const fullName = `PreReq_${tcName}${suffix}`;

  return `#Author: ${author}
#Application: ${app}
#Workflow: ${workflowLabel}
#Test Case Name: ${fullName}

(*Prerequisites
*)

Params 

BeginTestCase "${fullName}"
Try
	//Add Code Here
Catch
	LogError "Test Case: ${fullName} has failed" && The Exception
	CaptureScreen "${fullName}_Failure"
	Put The Result
End Try
EndTestCase "${fullName}"`;
};

const buildPreReqWorkflow = (
  levelIndex: number,
  maxPre: number,
  scenario: string,
  testCases: NormalizedTestCase[]
) => {
  const level = levelIndex + 1;
  const workflowName = maxPre === 1 ? `PreReq_${scenario}` : `PreReq_${scenario}_${level}`;

  let content = `Global TestDataConnection
Set ScenarioRows = the records of TestDataConnection where Scenario is "${scenario}"

Repeat With Each Scenario in ScenarioRows By Reference
`;

  testCases.forEach((tc) => {
    if (tc.preReqs.length >= level) {
      const suffix = tc.preReqs.length > 1 ? `_${level}` : '';
      content += `If Trim(Scenario.TestCase) is "TCP1_${tc.name}" Then
	Set ReturnData = "PreRequisites/PreReq_${tc.name}${suffix}"(Scenario.PatientMRN)
End If

`;
    }
  });

  content += 'End Repeat';
  return { workflowName, content };
};

const buildMainWorkflow = (scenario: string, testCases: NormalizedTestCase[]) =>
  `Global TestDataConnection
Set TestDataRows = the records of TestDataConnection where Scenario is "${scenario}"

Repeat With Each TestData in TestDataRows By Reference
${testCases
  .map(
    (tc) =>
      `If Trim(TestData.TestCase) is "TCP1_${tc.name}" Then 
	RunWithNewResults "Tests/TCP1_${tc.name}", TestData.PatientMRN
End If`
  )
  .join('\n')}
End Repeat`;

const buildTestScript = (
  tcName: string,
  scenario: string,
  author: string,
  app: string,
  testRailLink?: string
) => {
  const sanitizedLink = testRailLink?.trim() || '';

  return `#Author: ${author}
#Application: ${app}
#Workflow: ${scenario}
#Test Case Name: TCP1_${tcName}
#TestRail Link: ${sanitizedLink}

(*Prerequisites

*)

Params 
BeginTestCase "TCP1_${tcName}"
Try
	//Add Code Here
Catch
	LogError "TCP1_${tcName} has failed" && The Exception
	CaptureScreen "TCP1_${tcName}_Failure"
	Put The Result
End Try
EndTestCase "TCP1_${tcName}"`;
};

export const generateZip = async (data: ScenarioData) => {
  const scenario = data.scenarioName?.trim();
  const author = data.author?.trim();

  if (!scenario || !author) {
    throw new Error('Scenario name and author are required.');
  }

  if (!data.testCases?.length) {
    throw new Error('At least one test case is required.');
  }

  const normalizedCases = normalizeTestCases(data.testCases);
  const maxPre = Math.max(...normalizedCases.map((tc) => tc.preReqs.length));
  const testsApp = getApplicationName(data.testsApp || 'PowerChart', data.testsAppCustom);

  const zip = new JSZip();
  const preFolder = zip.folder('PreRequisites');
  const preWorkflowFolder = zip.folder('PreReq_Workflow');
  const testsFolder = zip.folder('Tests');
  const workflowFolder = zip.folder('Workflow');

  if (!preFolder || !preWorkflowFolder || !testsFolder || !workflowFolder) {
    throw new Error('Failed to create ZIP folders.');
  }

  normalizedCases.forEach((tc, tcIndex) => {
    tc.preReqs.forEach((req, preIdx) => {
      const app = getApplicationName(req.app, req.custom);
      const script = buildPreReqScript(tc.name, preIdx, tc.preReqs.length, maxPre, author, scenario, app);
      const suffix = tc.preReqs.length > 1 ? `_${preIdx + 1}` : '';
      const fileName = `PreReq_${tc.name}${suffix}.script`;
      preFolder.file(fileName, script);
    });
  });

  for (let levelIndex = 0; levelIndex < maxPre; levelIndex++) {
    const wf = buildPreReqWorkflow(levelIndex, maxPre, scenario, normalizedCases);
    preWorkflowFolder.file(`${wf.workflowName}.script`, wf.content);
  }

  workflowFolder.file(`${scenario}.script`, buildMainWorkflow(scenario, normalizedCases));

  normalizedCases.forEach((tc) => {
    const script = buildTestScript(tc.name, scenario, author, testsApp, tc.testRailLink);
    testsFolder.file(`TCP1_${tc.name}.script`, script);
  });

  const content = await zip.generateAsync({ type: 'blob' });
  await saveFile(content, `${scenario}.zip`, 'ZIP Archive', { 'application/zip': ['.zip'] });
};
