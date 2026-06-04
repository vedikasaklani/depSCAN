import {
  mockProjectMeta,
  mockComponents,
  mockDependencies,
  mockVulnerabilities,
  mockReportSummary,
  dependencyTree,
} from './DashboardData';

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export async function fetchComplianceData() {
  await wait(180);
  return {
    projectMeta: mockProjectMeta,
    components: mockComponents,
    dependencies: mockDependencies,
  };
}

export async function fetchDependencyTree() {
  await wait(220);
  return dependencyTree;
}

export async function fetchVulnerabilityData() {
  await wait(200);
  return mockVulnerabilities;
}

export async function fetchReportSummary() {
  await wait(160);
  return mockReportSummary;
}

export async function fetchPackageDetails(packageId) {
  await wait(120);
  const allComponents = mockComponents.concat({
    name: 'depSCAN',
    version: '1.0.0',
    supplier: { name: 'depSCAN Security' },
    purl: 'pkg:github/depSCAN/depSCAN@1.0.0',
    licenses: [{ license: { id: 'MIT' } }],
    author: 'depSCAN Security',
    status: 'pass',
    severity: 'safe',
  });
  return allComponents.find((entry) => entry.name === packageId || entry.id === packageId) || null;
}
