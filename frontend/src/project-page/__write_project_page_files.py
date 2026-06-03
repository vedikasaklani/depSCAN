from pathlib import Path

files = {
    'DashboardData.js': '''export const mockProjectMeta = {
  projectName: 'depSCAN Core',
  author: 'Member 6',
  timestamp: '2026-06-03T14:20:00Z',
  complianceScore: 88,
  compliancePercentage: 88,
  totalComponents: 10,
  totalDependencies: 12,
  totalVulnerabilities: 9,
};

export const mockComponents = [
  {
    name: 'django',
    version: '4.2.1',
    supplier: { name: 'Django Software Foundation' },
    purl: 'pkg:pypi/django@4.2.1',
    licenses: [{ license: { id: 'BSD-3-Clause' } }],
    author: 'Django Team',
    status: 'pass',
    severity: 'high',
  },
  {
    name: 'sqlparse',
    version: '0.4.4',
    supplier: { name: 'Python Packaging Authority' },
    purl: 'pkg:pypi/sqlparse@0.4.4',
    licenses: [{ license: { id: 'BSD-3-Clause' } }],
    author: 'SQLParse Contributors',
    status: 'pass',
    severity: 'medium',
  },
  {
    name: 'asgiref',
    version: '3.8.0',
    supplier: { name: 'Django Software Foundation' },
    purl: 'pkg:pypi/asgiref@3.8.0',
    licenses: [{ license: { id: 'BSD-3-Clause' } }],
    author: 'ASGI Contributors',
    status: 'pass',
    severity: 'low',
  },
  {
    name: 'requests',
    version: '2.31.0',
    supplier: { name: 'Python Packaging Authority' },
    purl: 'pkg:pypi/requests@2.31.0',
    licenses: [{ license: { id: 'Apache-2.0' } }],
    author: 'Kenneth Reitz',
    status: 'pass',
    severity: 'medium',
  },
  {
    name: 'urllib3',
    version: '2.0.4',
    supplier: { name: 'Python Packaging Authority' },
    purl: 'pkg:pypi/urllib3@2.0.4',
    licenses: [{ license: { id: 'MIT' } }],
    author: 'urllib3 Contributors',
    status: 'pass',
    severity: 'low',
  },
  {
    name: 'certifi',
    version: '2025.11.3',
    supplier: { name: 'Python Packaging Authority' },
    purl: 'pkg:pypi/certifi@2025.11.3',
    licenses: [{ license: { id: 'MPL-2.0' } }],
    author: 'Mozilla',
    status: 'pass',
    severity: 'low',
  },
  {
    name: 'numpy',
    version: '2.1.0',
    supplier: { name: 'NumPy Developers' },
    purl: 'pkg:pypi/numpy@2.1.0',
    licenses: [{ license: { id: 'BSD-3-Clause' } }],
    author: 'NumPy Community',
    status: 'pass',
    severity: 'safe',
  },
  {
    name: 'react',
    version: '19.2.6',
    supplier: { name: 'Meta Platforms, Inc.' },
    purl: 'pkg:npm/react@19.2.6',
    licenses: [{ license: { id: 'MIT' } }],
    author: 'Facebook Open Source',
    status: 'pass',
    severity: 'medium',
  },
  {
    name: 'axios',
    version: '1.7.0',
    supplier: { name: 'Axios Contributors' },
    purl: 'pkg:npm/axios@1.7.0',
    licenses: [{ license: { id: 'MIT' } }],
    author: 'Axios Team',
    status: 'pass',
    severity: 'high',
  },
  {
    name: 'express',
    version: '4.18.4',
    supplier: { name: 'OpenJS Foundation' },
    purl: 'pkg:npm/express@4.18.4',
    licenses: [{ license: { id: 'MIT' } }],
    author: 'Express Contributors',
    status: 'pass',
    severity: 'medium',
  },
];

export const dependencyTree = [
  {
    id: 'depSCAN',
    name: 'depSCAN',
    version: '1.0.0',
    supplier: { name: 'depSCAN Security' },
    purl: 'pkg:github/depSCAN/depSCAN@1.0.0',
    licenses: [{ license: { id: 'MIT' } }],
    severity: 'safe',
    children: [
      {
        id: 'django',
        name: 'django',
        version: '4.2.1',
        supplier: { name: 'Django Software Foundation' },
        purl: 'pkg:pypi/django@4.2.1',
        severity: 'high',
        children: [
          {
            id: 'sqlparse',
            name: 'sqlparse',
            version: '0.4.4',
            supplier: { name: 'Python Packaging Authority' },
            purl: 'pkg:pypi/sqlparse@0.4.4',
            severity: 'medium',
            children: [],
          },
          {
            id: 'asgiref',
            name: 'asgiref',
            version: '3.8.0',
            supplier: { name: 'Django Software Foundation' },
            purl: 'pkg:pypi/asgiref@3.8.0',
            severity: 'low',
            children: [],
          },
          {
            id: 'pytz',
            name: 'pytz',
            version: '2025.7',
            supplier: { name: 'Python Packaging Authority' },
            purl: 'pkg:pypi/pytz@2025.7',
            severity: 'low',
            children: [],
          },
        ],
      },
      {
        id: 'requests',
        name: 'requests',
        version: '2.31.0',
        supplier: { name: 'Python Packaging Authority' },
        purl: 'pkg:pypi/requests@2.31.0',
        severity: 'medium',
        children: [
          {
            id: 'urllib3',
            name: 'urllib3',
            version: '2.0.4',
            supplier: { name: 'Python Packaging Authority' },
            purl: 'pkg:pypi/urllib3@2.0.4',
            severity: 'low',
            children: [],
          },
          {
            id: 'certifi',
            name: 'certifi',
            version: '2025.11.3',
            supplier: { name: 'Python Packaging Authority' },
            purl: 'pkg:pypi/certifi@2025.11.3',
            severity: 'low',
            children: [],
          },
          {
            id: 'charset-normalizer',
            name: 'charset-normalizer',
            version: '3.3.0',
            supplier: { name: 'Python Packaging Authority' },
            purl: 'pkg:pypi/charset-normalizer@3.3.0',
            severity: 'low',
            children: [],
          },
        ],
      },
      {
        id: 'numpy',
        name: 'numpy',
        version: '2.1.0',
        supplier: { name: 'NumPy Developers' },
        purl: 'pkg:pypi/numpy@2.1.0',
        severity: 'safe',
        children: [],
      },
      {
        id: 'react',
        name: 'react',
        version: '19.2.6',
        supplier: { name: 'Meta Platforms, Inc.' },
        purl: 'pkg:npm/react@19.2.6',
        severity: 'medium',
        children: [
          {
            id: 'axios',
            name: 'axios',
            version: '1.7.0',
            supplier: { name: 'Axios Contributors' },
            purl: 'pkg:npm/axios@1.7.0',
            severity: 'high',
            children: [],
          },
          {
            id: 'express',
            name: 'express',
            version: '4.18.4',
            supplier: { name: 'OpenJS Foundation' },
            purl: 'pkg:npm/express@4.18.4',
            severity: 'medium',
            children: [],
          },
        ],
      },
    ],
  },
];

export const mockDependencies = [
  { parent: 'depSCAN', child: 'django' },
  { parent: 'depSCAN', child: 'requests' },
  { parent: 'depSCAN', child: 'numpy' },
  { parent: 'depSCAN', child: 'react' },
  { parent: 'django', child: 'sqlparse' },
  { parent: 'django', child: 'asgiref' },
  { parent: 'django', child: 'pytz' },
  { parent: 'requests', child: 'urllib3' },
  { parent: 'requests', child: 'certifi' },
  { parent: 'requests', child: 'charset-normalizer' },
  { parent: 'react', child: 'axios' },
  { parent: 'react', child: 'express' },
];

export const mockVulnerabilities = [
  {
    package: 'django',
    version: '4.2.1',
    cve: 'CVE-2026-1234',
    severity: 'High',
    cvss: 8.2,
    fixedVersion: '4.2.2',
    description: 'Template injection vulnerability in admin interface.',
  },
  {
    package: 'requests',
    version: '2.31.0',
    cve: 'CVE-2026-2345',
    severity: 'Medium',
    cvss: 6.1,
    fixedVersion: '2.31.1',
    description: 'Improper certificate validation under certain proxy configurations.',
  },
  {
    package: 'axios',
    version: '1.7.0',
    cve: 'CVE-2026-3456',
    severity: 'High',
    cvss: 8.7,
    fixedVersion: '1.7.1',
    description: 'Prototype pollution in URL parsing module.',
  },
  {
    package: 'react',
    version: '19.2.6',
    cve: 'CVE-2026-4567',
    severity: 'Medium',
    cvss: 5.9,
    fixedVersion: '19.2.7',
    description: 'Cross-site scripting risk in development warnings.',
  },
  {
    package: 'sqlparse',
    version: '0.4.4',
    cve: 'CVE-2026-5678',
    severity: 'Low',
    cvss: 3.1,
    fixedVersion: '0.4.5',
    description: 'SQL parsing edge case could reveal parser state.',
  },
  {
    package: 'certifi',
    version: '2025.11.3',
    cve: 'CVE-2026-6789',
    severity: 'Low',
    cvss: 2.8,
    fixedVersion: '2026.1.0',
    description: 'Certificate bundle update needed for new root CA.',
  },
  {
    package: 'urllib3',
    version: '2.0.4',
    cve: 'CVE-2026-7890',
    severity: 'Medium',
    cvss: 6.5,
    fixedVersion: '2.0.5',
    description: 'HTTP header injection vulnerability in redirect handling.',
  },
  {
    package: 'express',
    version: '4.18.4',
    cve: 'CVE-2026-8901',
    severity: 'Medium',
    cvss: 5.4,
    fixedVersion: '4.18.5',
    description: 'Unsafe request parameter parsing in legacy middleware.',
  },
  {
    package: 'asgiref',
    version: '3.8.0',
    cve: 'CVE-2026-9012',
    severity: 'Low',
    cvss: 3.7,
    fixedVersion: '3.8.1',
    description: 'Async context propagation could leak user data in certain cases.',
  },
];

export const mockReportSummary = {
  projectName: 'depSCAN Core',
  scanDate: '2026-06-03',
  complianceScore: 88,
  compliancePercentage: 88,
  components: mockComponents.length,
  dependencies: mockDependencies.length,
  vulnerabilities: mockVulnerabilities.length,
  critical: 0,
  high: 2,
  medium: 5,
  low: 2,
  author: 'Member 6',
  timestamp: '2026-06-03T14:20:00Z',
  summary: 'The SBOM scan identified the core dependency graph and flagged package-level vulnerability findings. Compliance is strong overall, but a focused patch cycle is recommended for high-severity dependencies.',
};
''',
    'api.js': '''import {
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
''',
    'ComplianceDashboard.jsx': '''import { useEffect, useState } from 'react';
import { fetchComplianceData } from './api';
import './ComplianceDashboard.css';

const statusClasses = {
  pass: 'status-pass',
  fail: 'status-fail',
};

const complianceIndicators = {
  pass: 'Verified',
  fail: 'Review',
};

export default function ComplianceDashboard() {
  const [meta, setMeta] = useState(null);
  const [components, setComponents] = useState([]);

  useEffect(() => {
    fetchComplianceData().then((data) => {
      setMeta(data.projectMeta);
      setComponents(data.components);
    });
  }, []);

  if (!meta) {
    return <div className="compliance-dashboard-shell">Loading compliance dashboard...</div>;
  }

  const passCount = components.filter((item) => item.status === 'pass').length;
  const failCount = components.length - passCount;
  const compliancePercent = meta.compliancePercentage;
  const complianceClass = compliancePercent >= 80 ? 'dashboard-score-good' : 'dashboard-score-warning';

  return (
    <div className="compliance-dashboard-shell">
      <section className="dashboard-topbar">
        <div>
          <p className="dashboard-label">NTIA Compliance Dashboard</p>
          <h1>SBOM Audit &amp; Compliance</h1>
          <p className="dashboard-subtitle">Supplier awareness, component health, and dependency traceability across your software bill of materials.</p>
        </div>
        <div className="dashboard-meta-card">
          <span>Author</span>
          <strong>{meta.author}</strong>
          <span>Scan Date</span>
          <strong>{new Date(meta.timestamp).toLocaleString()}</strong>
        </div>
      </section>

      <section className="dashboard-cards-row">
        <article className="dashboard-card dashboard-score-card">
          <p>Compliance Score</p>
          <div className={complianceClass}>{compliancePercent}%</div>
          <span>Live score based on licensing, supplier metadata, and dependency visibility.</span>
        </article>
        <article className="dashboard-card">
          <p>Components</p>
          <strong>{components.length}</strong>
          <span>Tracked packages within the current SBOM.</span>
        </article>
        <article className="dashboard-card">
          <p>Dependency Relationships</p>
          <strong>{meta.totalDependencies}</strong>
          <span>Parent-child links discovered in the dependency tree.</span>
        </article>
        <article className="dashboard-card">
          <p>Pass / Fail</p>
          <strong>{passCount} / {failCount}</strong>
          <span>Packages meeting compliance criteria versus review candidates.</span>
        </article>
      </section>

      <section className="dashboard-table-panel">
        <div className="table-panel-header">
          <h2>Component Compliance Summary</h2>
          <p>Review supplier, version, PURL, and dependency relationships for each tracked component.</p>
        </div>
        <div className="dashboard-table-wrapper">
          <table className="compliance-table">
            <thead>
              <tr>
                <th>Supplier</th>
                <th>Component</th>
                <th>Version</th>
                <th>PURL</th>
                <th>License</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {components.map((component) => {
                const licenseId = component.licenses?.[0]?.license?.id || 'Unknown';
                return (
                  <tr key={component.name}>
                    <td>{component.supplier.name}</td>
                    <td>{component.name}</td>
                    <td>{component.version}</td>
                    <td className="mono-text">{component.purl}</td>
                    <td>{licenseId}</td>
                    <td>
                      <span className={`status-pill ${statusClasses[component.status]}`}>
                        {complianceIndicators[component.status]}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
''',
    'ComplianceDashboard.css': '''.compliance-dashboard-shell {
  padding: 28px;
  color: #e8eef7;
  background: #08111e;
  min-height: 100vh;
}

.dashboard-topbar,
.dashboard-cards-row,
.dashboard-table-panel {
  margin-bottom: 24px;
}

.dashboard-topbar {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 20px;
  align-items: flex-start;
}

.dashboard-label {
  color: #66f6ff;
  text-transform: uppercase;
  letter-spacing: 0.14em;
  margin-bottom: 10px;
  font-size: 0.9rem;
}

.dashboard-topbar h1 {
  margin: 0;
  font-size: clamp(2rem, 2.4vw, 2.8rem);
}

.dashboard-subtitle {
  margin: 12px 0 0;
  max-width: 620px;
  line-height: 1.7;
  color: #9bb5d7;
}

.dashboard-meta-card {
  background: linear-gradient(135deg, rgba(23, 162, 184, 0.15), rgba(56, 79, 146, 0.2));
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 18px;
  padding: 22px;
  min-width: 240px;
  display: grid;
  gap: 10px;
  color: #dbe8ff;
}

.dashboard-meta-card span {
  font-size: 0.82rem;
  color: #94b0d8;
}

.dashboard-meta-card strong {
  font-size: 1rem;
}

.dashboard-cards-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 18px;
}

.dashboard-card {
  background: rgba(14, 26, 45, 0.88);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 20px;
  padding: 24px;
  box-shadow: 0 30px 50px rgba(0,0,0,0.12);
}

.dashboard-card p {
  margin: 0 0 12px;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: #7cc4ff;
  font-size: 0.82rem;
}

.dashboard-card strong {
  display: block;
  font-size: 2.1rem;
  margin-bottom: 10px;
  color: #ffffff;
}

.dashboard-card span,
.dashboard-card div {
  color: #96aed3;
  font-size: 0.95rem;
  line-height: 1.6;
}

.dashboard-score-card {
  position: relative;
}

.dashboard-score-good {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 90px;
  padding: 14px 18px;
  border-radius: 16px;
  font-size: 1.9rem;
  font-weight: 700;
  background: linear-gradient(135deg, #26d07c, #0db5a2);
  color: #031011;
}

.dashboard-score-warning {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 90px;
  padding: 14px 18px;
  border-radius: 16px;
  font-size: 1.9rem;
  font-weight: 700;
  background: linear-gradient(135deg, #fa7d59, #ffb74d);
  color: #08111e;
}

.table-panel-header h2 {
  margin: 0 0 6px;
  font-size: 1.6rem;
}

.table-panel-header p {
  margin: 0;
  color: #9bb5d7;
}

.dashboard-table-wrapper {
  overflow-x: auto;
  margin-top: 18px;
  border-radius: 20px;
  border: 1px solid rgba(255,255,255,0.08);
}

.compliance-table {
  width: 100%;
  border-collapse: collapse;
  min-width: 900px;
}

.compliance-table th,
.compliance-table td {
  padding: 18px 16px;
  text-align: left;
  border-bottom: 1px solid rgba(255,255,255,0.06);
}

.compliance-table th {
  color: #8cbef5;
  font-size: 0.95rem;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.compliance-table tbody tr:hover {
  background: rgba(255,255,255,0.04);
}

.mono-text {
  font-family: 'Courier New', Courier, monospace;
  color: #b4d0ff;
}

.status-pill {
  display: inline-flex;
  padding: 8px 12px;
  border-radius: 999px;
  font-size: 0.85rem;
  font-weight: 600;
}

.status-pass {
  color: #0b3c25;
  background: #1ced9a33;
}

.status-fail {
  color: #7e1c1c;
  background: #ff6c6c33;
}

@media (max-width: 900px) {
  .dashboard-topbar {
    flex-direction: column;
  }

  .dashboard-cards-row {
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  }
}
''',
    'DependencyGraph.jsx': '''import { useEffect, useMemo, useState, useCallback } from 'react';
import ReactFlow, { Background, Controls, MiniMap, ReactFlowProvider } from 'reactflow';
import 'reactflow/dist/style.css';
import { fetchDependencyTree, fetchVulnerabilityData } from './api';
import './DependencyGraph.css';

const severityStyles = {
  critical: '#d24545',
  high: '#ff8f3f',
  medium: '#f7c948',
  low: '#3fda9f',
  safe: '#4c8cff',
};

const nodeSpacing = 180;

function buildFlowItems(tree) {
  const nodes = [];
  const edges = [];
  const rows = {};

  function walk(item, depth = 0) {
    const row = rows[depth] || 0;
    rows[depth] = row + 1;
    const x = depth * nodeSpacing;
    const y = row * 100;
    const color = severityStyles[item.severity] || severityStyles.safe;
    nodes.push({
      id: item.id,
      position: { x, y },
      data: { label: `${item.name} ${item.version}` },
      style: {
        background: color,
        color: '#071118',
        border: '1px solid rgba(255,255,255,0.12)',
        width: 210,
      },
    });

    (item.children || []).forEach((child) => {
      edges.push({ id: `${item.id}-${child.id}`, source: item.id, target: child.id, animated: false });
      walk(child, depth + 1);
    });
  }

  tree.forEach((item) => walk(item));
  return { nodes, edges };
}

function filterTree(tree, query) {
  if (!query.trim()) {
    return tree;
  }

  const normalized = query.toLowerCase();

  function traverse(node) {
    const match = node.name.toLowerCase().includes(normalized);
    const children = (node.children || []).map(traverse).filter(Boolean);
    if (match || children.length > 0) {
      return { ...node, children };
    }
    return null;
  }

  return tree.map(traverse).filter(Boolean);
}

function renderTree(node, expandedSet, toggleNode, searchTerm) {
  const active = node.name.toLowerCase().includes(searchTerm.toLowerCase());
  const hasChildren = (node.children || []).length > 0;

  return (
    <div key={node.id} className={`tree-node ${active ? 'tree-active' : ''}`}>
      <button type="button" className="tree-label" onClick={() => toggleNode(node.id)}>
        {hasChildren && <span className="tree-arrow">{expandedSet.has(node.id) ? '▾' : '▸'}</span>}
        <span>{node.name}</span>
        <small>{node.version}</small>
      </button>
      {hasChildren && expandedSet.has(node.id) && (
        <div className="tree-children">
          {node.children.map((child) => renderTree(child, expandedSet, toggleNode, searchTerm))}
        </div>
      )}
    </div>
  );
}

export default function DependencyGraph() {
  const [tree, setTree] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [expanded, setExpanded] = useState(new Set(['depSCAN', 'django', 'requests', 'react']));
  const [vulnerabilities, setVulnerabilities] = useState([]);
  const [view, setView] = useState('tree');

  useEffect(() => {
    fetchDependencyTree().then((data) => {
      setTree(data);
      if (data[0]) {
        setSelectedPackage(data[0]);
      }
    });
    fetchVulnerabilityData().then(setVulnerabilities);
  }, []);

  const filteredTree = useMemo(() => filterTree(tree, search), [tree, search]);
  const flowData = useMemo(() => buildFlowItems(filteredTree), [filteredTree]);

  const selectedDetails = useMemo(() => (selectedPackage ? selectedPackage : null), [selectedPackage]);

  const packageHistory = useMemo(() => {
    return vulnerabilities.filter((item) => item.package.toLowerCase() === (selectedDetails?.name || '').toLowerCase());
  }, [selectedDetails, vulnerabilities]);

  const handleToggle = (id) => {
    setExpanded((current) => {
      const next = new Set(current);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleSelectPackage = useCallback((node) => {
    setSelectedPackage(node);
  }, []);

  const allPackages = useMemo(() => {
    const list = [];
    function collect(current) {
      list.push(current);
      (current.children || []).forEach(collect);
    }
    tree.forEach(collect);
    return list;
  }, [tree]);

  const matchPackages = useMemo(() => {
    const query = search.toLowerCase();
    return allPackages.filter((pkg) => pkg.name.toLowerCase().includes(query));
  }, [allPackages, search]);

  return (
    <div className="dependency-graph-shell">
      <section className="graph-dashboard-header">
        <div>
          <p className="graph-label">Dependency Explorer</p>
          <h2>Package Dependency Tree &amp; Graph View</h2>
          <p>Navigate package relationships, assess severity, and inspect package details in a cybersecurity-focused explorer.</p>
        </div>
        <div className="graph-toggle-group">
          <button type="button" className={view === 'tree' ? 'toggle-active' : ''} onClick={() => setView('tree')}>
            Tree View
          </button>
          <button type="button" className={view === 'graph' ? 'toggle-active' : ''} onClick={() => setView('graph')}>
            Graph View
          </button>
        </div>
      </section>

      <div className="graph-layout">
        <section className="graph-pane graph-left-pane">
          <div className="graph-search-bar">
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search package..."
            />
            <span>{matchPackages.length} matches</span>
          </div>

          {view === 'tree' ? (
            <div className="tree-view">
              {filteredTree.length ? filteredTree.map((node) => renderTree(node, expanded, handleToggle, search)) : <p className="empty-state">No package matches that search term.</p>}
            </div>
          ) : (
            <div className="graph-view-panel">
              <ReactFlowProvider>
                <ReactFlow
                  nodes={flowData.nodes}
                  edges={flowData.edges}
                  fitView
                  fitViewOptions={{ padding: 0.85 }}
                  onNodeClick={(event, node) => handleSelectPackage(allPackages.find((item) => item.id === node.id) || node)}
                >
                  <Background color="#20314c" gap={16} />
                  <MiniMap nodeStrokeColor={(node) => node.style.background} nodeColor={(node) => node.style.background} />
                  <Controls showFitView />
                </ReactFlow>
              </ReactFlowProvider>
            </div>
          )}
        </section>

        <aside className="graph-right-pane">
          <div className="detail-card">
            <h3>Package Details</h3>
            {selectedDetails ? (
              <>
                <div className="detail-row">
                  <span>Name</span>
                  <strong>{selectedDetails.name}</strong>
                </div>
                <div className="detail-row">
                  <span>Version</span>
                  <strong>{selectedDetails.version}</strong>
                </div>
                <div className="detail-row">
                  <span>Supplier</span>
                  <strong>{selectedDetails.supplier?.name || 'Unknown'}</strong>
                </div>
                <div className="detail-row">
                  <span>License</span>
                  <strong>{selectedDetails.licenses?.[0]?.license?.id || 'Unknown'}</strong>
                </div>
                <div className="detail-row">
                  <span>PURL</span>
                  <strong className="mono-text">{selectedDetails.purl}</strong>
                </div>
                <div className="detail-row">
                  <span>Severity</span>
                  <strong style={{ color: severityStyles[selectedDetails.severity] }}>{selectedDetails.severity}</strong>
                </div>
                <div className="detail-row">
                  <span>Dependency Count</span>
                  <strong>{(selectedDetails.children || []).length}</strong>
                </div>
                <div className="detail-row">
                  <span>CVE Count</span>
                  <strong>{packageHistory.length}</strong>
                </div>
                <div className="detail-group">
                  <span>Dependencies</span>
                  <ul>
                    {(selectedDetails.children || []).map((child) => (
                      <li key={child.id}>{child.name} ({child.version})</li>
                    ))}
                  </ul>
                </div>
                <div className="detail-group">
                  <span>Active Vulnerabilities</span>
                  {packageHistory.length ? (
                    <ul>
                      {packageHistory.map((item) => (
                        <li key={item.cve}>{item.cve} - {item.severity}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="empty-state">No active CVEs for this package.</p>
                  )}
                </div>
              </>
            ) : (
              <p className="empty-state">Select a package to display details.</p>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
''',
    'DependencyGraph.css': '''.dependency-graph-shell {
  padding: 28px;
  min-height: 100vh;
  color: #e5eef8;
  background: #07101d;
}

.graph-dashboard-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
  margin-bottom: 22px;
}

.graph-label {
  display: block;
  color: #64d6ff;
  text-transform: uppercase;
  letter-spacing: 0.18em;
  font-size: 0.82rem;
  margin-bottom: 10px;
}

.graph-dashboard-header h2 {
  margin: 0;
  font-size: clamp(1.9rem, 2.3vw, 2.4rem);
}

.graph-dashboard-header p {
  margin: 10px 0 0;
  max-width: 640px;
  color: #98b8d8;
}

.graph-toggle-group {
  display: inline-flex;
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 16px;
  overflow: hidden;
  background: rgba(255,255,255,0.03);
}

.graph-toggle-group button {
  padding: 12px 22px;
  border: none;
  background: transparent;
  color: #c2d7ef;
  cursor: pointer;
  transition: background 0.2s ease, color 0.2s ease;
}

.toggle-active {
  background: linear-gradient(135deg, #2f8bff, #15e0c8);
  color: #07101d;
}

.graph-layout {
  display: grid;
  grid-template-columns: 1.5fr 0.9fr;
  gap: 20px;
}

.graph-pane {
  background: rgba(15, 24, 43, 0.95);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 24px;
  padding: 20px;
}

.graph-left-pane {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.graph-search-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 16px;
  border-radius: 18px;
  background: rgba(255,255,255,0.04);
}

.graph-search-bar input {
  width: 100%;
  background: transparent;
  border: none;
  outline: none;
  color: #f0f8ff;
  padding: 10px 0;
  font-size: 1rem;
}

.graph-search-bar span {
  color: #8bb7d5;
  font-size: 0.95rem;
}

.tree-view,
.graph-view-panel {
  min-height: 520px;
  border-radius: 20px;
  border: 1px solid rgba(255,255,255,0.06);
  background: rgba(4, 13, 28, 0.9);
  padding: 16px;
  overflow: auto;
}

.tree-node {
  margin-bottom: 12px;
}

.tree-label {
  width: 100%;
  text-align: left;
  border: none;
  background: transparent;
  color: #dfe9fa;
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 0.98rem;
  cursor: pointer;
  padding: 10px 12px;
  border-radius: 14px;
  transition: background 0.2s ease;
}

.tree-label:hover {
  background: rgba(255,255,255,0.08);
}

.tree-arrow {
  width: 18px;
  display: inline-flex;
  justify-content: center;
}

.tree-label small {
  margin-left: auto;
  color: #7da1cb;
  font-size: 0.82rem;
}

.tree-children {
  padding-left: 24px;
  border-left: 1px solid rgba(255,255,255,0.06);
  margin-top: 8px;
}

.tree-active .tree-label {
  background: rgba(48, 145, 255, 0.18);
}

.graph-right-pane {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.detail-card {
  padding: 24px;
  border-radius: 24px;
  background: rgba(14, 25, 44, 0.96);
  border: 1px solid rgba(255,255,255,0.08);
}

.detail-card h3 {
  margin-top: 0;
  margin-bottom: 16px;
}

.detail-row,
.detail-group {
  margin-bottom: 16px;
}

.detail-row span {
  display: block;
  color: #8db0d5;
  margin-bottom: 6px;
  font-size: 0.88rem;
}

.detail-row strong {
  color: #eff6ff;
  display: block;
}

.detail-group ul {
  margin: 10px 0 0;
  padding-left: 18px;
  color: #c7d7ef;
  line-height: 1.7;
}

.detail-group ul li {
  margin-bottom: 8px;
}

.empty-state {
  color: #7aa1c4;
}

.mono-text {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace;
  word-break: break-all;
}

@media (max-width: 1100px) {
  .graph-layout {
    grid-template-columns: 1fr;
  }
}
''',
    'VulnerabilityTable.jsx': '''import { useEffect, useMemo, useState } from 'react';
import { fetchVulnerabilityData } from './api';
import './VulnerabilityTable.css';

const severityMap = {
  Critical: { color: '#ff5f5f', label: 'Critical' },
  High: { color: '#ff9f43', label: 'High' },
  Medium: { color: '#f7d154', label: 'Medium' },
  Low: { color: '#42d69f', label: 'Low' },
};

const sortOptions = {
  package: 'package',
  severity: 'severity',
  cvss: 'cvss',
  fixedVersion: 'fixedVersion',
};

export default function VulnerabilityTable() {
  const [rows, setRows] = useState([]);
  const [search, setSearch] = useState('');
  const [severityFilter, setSeverityFilter] = useState('All');
  const [sortKey, setSortKey] = useState('severity');
  const [sortDirection, setSortDirection] = useState('desc');

  useEffect(() => {
    fetchVulnerabilityData().then(setRows);
  }, []);

  const filteredRows = useMemo(() => {
    return rows
      .filter((row) => {
        const matchesSearch = `${row.package} ${row.cve} ${row.description}`.toLowerCase().includes(search.toLowerCase());
        const matchesSeverity = severityFilter === 'All' || row.severity === severityFilter;
        return matchesSearch && matchesSeverity;
      })
      .sort((a, b) => {
        if (sortKey === sortOptions.cvss) {
          return sortDirection === 'asc' ? a.cvss - b.cvss : b.cvss - a.cvss;
        }
        if (sortKey === sortOptions.package) {
          return sortDirection === 'asc' ? a.package.localeCompare(b.package) : b.package.localeCompare(a.package);
        }
        if (sortKey === sortOptions.fixedVersion) {
          return sortDirection === 'asc' ? a.fixedVersion.localeCompare(b.fixedVersion) : b.fixedVersion.localeCompare(a.fixedVersion);
        }
        if (sortKey === sortOptions.severity) {
          const order = ['Critical', 'High', 'Medium', 'Low'];
          return sortDirection === 'asc'
            ? order.indexOf(a.severity) - order.indexOf(b.severity)
            : order.indexOf(b.severity) - order.indexOf(a.severity);
        }
        return 0;
      });
  }, [rows, search, severityFilter, sortDirection, sortKey]);

  const totals = useMemo(() => {
    return rows.reduce(
      (acc, row) => {
        acc.total += 1;
        if (row.severity === 'Critical') acc.critical += 1;
        if (row.severity === 'High') acc.high += 1;
        if (row.severity === 'Medium') acc.medium += 1;
        if (row.severity === 'Low') acc.low += 1;
        return acc;
      },
      { total: 0, critical: 0, high: 0, medium: 0, low: 0 }
    );
  }, [rows]);

  const columns = [
    { key: 'package', label: 'Package' },
    { key: 'version', label: 'Version' },
    { key: 'cve', label: 'CVE ID' },
    { key: 'severity', label: 'Severity' },
    { key: 'cvss', label: 'CVSS Score' },
    { key: 'fixedVersion', label: 'Fixed Version' },
    { key: 'description', label: 'Description' },
  ];

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortDirection((current) => (current === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDirection('desc');
    }
  };

  return (
    <div className="vulnerability-table-shell">
      <div className="vuln-summary-cards">
        <div className="vuln-card">
          <span>Total Components</span>
          <strong>{new Set(rows.map((item) => item.package)).size}</strong>
        </div>
        <div className="vuln-card">
          <span>Total Vulnerabilities</span>
          <strong>{totals.total}</strong>
        </div>
        <div className="vuln-card vuln-high">
          <span>High</span>
          <strong>{totals.high}</strong>
        </div>
        <div className="vuln-card vuln-medium">
          <span>Medium</span>
          <strong>{totals.medium}</strong>
        </div>
        <div className="vuln-card vuln-low">
          <span>Low</span>
          <strong>{totals.low}</strong>
        </div>
      </div>

      <div className="vuln-table-controls">
        <input
          type="search"
          placeholder="Search vulnerabilities..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
        <select value={severityFilter} onChange={(event) => setSeverityFilter(event.target.value)}>
          <option>All</option>
          <option>Critical</option>
          <option>High</option>
          <option>Medium</option>
          <option>Low</option>
        </select>
      </div>

      <div className="vuln-table-wrapper">
        <table>
          <thead>
            <tr>
              {columns.map((column) => (
                <th key={column.key} onClick={() => handleSort(column.key)}>
                  {column.label}
                  {sortKey === column.key ? <span className="sort-arrow">{sortDirection === 'asc' ? '↑' : '↓'}</span> : null}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredRows.length ? (
              filteredRows.map((row) => (
                <tr key={`${row.package}-${row.cve}`}>
                  <td>{row.package}</td>
                  <td>{row.version}</td>
                  <td>{row.cve}</td>
                  <td>
                    <span className="severity-badge" style={{ background: severityMap[row.severity]?.color || '#4c8cff' }}>
                      {row.severity}
                    </span>
                  </td>
                  <td>{row.cvss}</td>
                  <td>{row.fixedVersion}</td>
                  <td>{row.description}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="empty-state">
                  No vulnerabilities match the current filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
''',
    'VulnerabilityTable.css': '''.vulnerability-table-shell {
  padding: 28px;
  background: #06101d;
  color: #e6eefb;
}

.vuln-summary-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 16px;
  margin-bottom: 20px;
}

.vuln-card {
  padding: 20px;
  border-radius: 22px;
  background: rgba(15, 27, 47, 0.95);
  border: 1px solid rgba(255,255,255,0.08);
}

.vuln-card span {
  display: block;
  color: #90b6d9;
  font-size: 0.88rem;
  margin-bottom: 10px;
  text-transform: uppercase;
  letter-spacing: 0.12em;
}

.vuln-card strong {
  font-size: 2rem;
  color: #f4f9ff;
}

.vuln-high {
  background: linear-gradient(135deg, rgba(255, 143, 67, 0.18), rgba(255, 94, 94, 0.14));
}

.vuln-medium {
  background: linear-gradient(135deg, rgba(247, 201, 72, 0.18), rgba(255, 230, 138, 0.14));
}

.vuln-low {
  background: linear-gradient(135deg, rgba(66, 214, 159, 0.18), rgba(151, 235, 212, 0.14));
}

.vuln-table-controls {
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
  align-items: center;
  margin-bottom: 16px;
}

.vuln-table-controls input,
.vuln-table-controls select {
  flex: 1;
  min-width: 220px;
  padding: 12px 14px;
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 16px;
  color: #e8f3ff;
  outline: none;
}

.vuln-table-wrapper {
  overflow-x: auto;
  border-radius: 20px;
  border: 1px solid rgba(255,255,255,0.08);
  background: rgba(8, 17, 28, 0.95);
}

table {
  width: 100%;
  border-collapse: collapse;
}

th,
td {
  padding: 18px 16px;
  color: #d7e5fb;
  border-bottom: 1px solid rgba(255,255,255,0.07);
}

th {
  background: rgba(255,255,255,0.03);
  text-align: left;
  font-size: 0.95rem;
  letter-spacing: 0.03em;
  cursor: pointer;
}

tr:hover {
  background: rgba(255,255,255,0.04);
}

.severity-badge {
  display: inline-flex;
  padding: 8px 12px;
  border-radius: 999px;
  color: #07101d;
  font-weight: 700;
}

.sort-arrow {
  margin-left: 8px;
  font-size: 0.8rem;
}

.empty-state {
  text-align: center;
  padding: 32px 0;
  color: #7d9ac7;
}

@media (max-width: 860px) {
  .vuln-summary-cards {
    grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  }

  th,
  td {
    padding: 14px 12px;
  }
}
''',
    'ExportReport.jsx': '''import { useEffect, useState } from 'react';
import { fetchReportSummary } from './api';
import './ExportReport.css';

function downloadBlob(blob, filename) {
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(link.href);
}

export default function ExportReport() {
  const [report, setReport] = useState(null);

  useEffect(() => {
    fetchReportSummary().then(setReport);
  }, []);

  if (!report) {
    return <div className="export-report-shell">Loading export panel...</div>;
  }

  const cyclonePayload = {
    bomFormat: 'CycloneDX',
    specVersion: '1.4',
    metadata: {
      timestamp: report.scanDate,
      component: {
        name: report.projectName,
        author: report.author,
      },
    },
    components: report.components,
    dependencies: report.dependencies,
    vulnerabilities: report.vulnerabilities,
  };

  const spdxPayload = {
    SPDXID: 'SPDXRef-DOCUMENT',
    name: report.projectName,
    documentNamespace: `http://spdx.org/spdxdocs/${report.projectName}-${report.scanDate}`,
    creationInfo: {
      created: report.timestamp,
      creators: [`Person: ${report.author}`],
    },
    packages: report.components,
    relationships: report.dependencies,
  };

  const exportPdf = () => {
    const content = `Compliance Report\n\nProject: ${report.projectName}\nScan date: ${report.scanDate}\nAuthor: ${report.author}\n\nCompliance Score: ${report.complianceScore}%\nTotal Components: ${report.components}\nTotal Dependencies: ${report.dependencies}\nTotal Vulnerabilities: ${report.vulnerabilities}\n\nSummary:\n${report.summary}`;
    const blob = new Blob([content], { type: 'application/pdf' });
    downloadBlob(blob, `${report.projectName.replace(/\s+/g, '-')}-compliance-report.pdf`);
  };

  return (
    <div className="export-report-shell">
      <div className="export-header">
        <div>
          <p>Export &amp; Reporting</p>
          <h2>Compliance Report Preview</h2>
          <p>Download SBOM exports or generate a compliance report for audit sharing and stakeholder review.</p>
        </div>
      </div>

      <div className="export-actions">
        <button
          type="button"
          onClick={() =>
            downloadBlob(
              new Blob([JSON.stringify(cyclonePayload, null, 2)], { type: 'application/json' }),
              `${report.projectName.replace(/\s+/g, '-')}-cyclonedx.json`
            )
          }
        >
          Download CycloneDX JSON
        </button>
        <button
          type="button"
          onClick={() =>
            downloadBlob(
              new Blob([JSON.stringify(spdxPayload, null, 2)], { type: 'application/json' }),
              `${report.projectName.replace(/\s+/g, '-')}-spdx.json`
            )
          }
        >
          Download SPDX JSON
        </button>
        <button type="button" onClick={exportPdf}>
          Download PDF Compliance Report
        </button>
      </div>

      <div className="preview-card">
        <div className="preview-row">
          <div>
            <span>Project</span>
            <strong>{report.projectName}</strong>
          </div>
          <div>
            <span>Scan Date</span>
            <strong>{report.scanDate}</strong>
          </div>
        </div>
        <div className="preview-row">
          <div>
            <span>Components</span>
            <strong>{report.components}</strong>
          </div>
          <div>
            <span>Dependencies</span>
            <strong>{report.dependencies}</strong>
          </div>
        </div>
        <div className="preview-row">
          <div>
            <span>Vulnerabilities</span>
            <strong>{report.vulnerabilities}</strong>
          </div>
          <div>
            <span>Compliance</span>
            <strong>{report.complianceScore}%</strong>
          </div>
        </div>
        <div className="preview-summary">
          <p>{report.summary}</p>
        </div>
      </div>
    </div>
  );
}
''',
    'ExportReport.css': '''.export-report-shell {
  padding: 28px;
  color: #e7f1ff;
  background: #07131f;
  min-height: 100vh;
}

.export-header p {
  color: #6fd1ff;
  text-transform: uppercase;
  letter-spacing: 0.16em;
  font-size: 0.82rem;
  margin-bottom: 10px;
}

.export-header h2 {
  margin: 0 0 10px;
  font-size: clamp(1.9rem, 2.2vw, 2.4rem);
}

.export-header p + p {
  color: #9db6d8;
  max-width: 700px;
}

.export-actions {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 16px;
  margin: 24px 0;
}

.export-actions button {
  border: none;
  border-radius: 18px;
  padding: 16px 20px;
  background: linear-gradient(135deg, rgba(79, 122, 255, 0.95), rgba(58, 222, 188, 0.95));
  color: #07101d;
  font-weight: 700;
  cursor: pointer;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}

.export-actions button:hover {
  transform: translateY(-2px);
  box-shadow: 0 18px 40px rgba(40, 203, 214, 0.18);
}

.preview-card {
  border-radius: 24px;
  background: rgba(10, 22, 39, 0.94);
  border: 1px solid rgba(255,255,255,0.08);
  padding: 28px;
  max-width: 920px;
}

.preview-row {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 24px;
  margin-bottom: 18px;
}

.preview-row div span {
  display: block;
  color: #88b9d9;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  font-size: 0.82rem;
  margin-bottom: 8px;
}

.preview-row div strong {
  display: block;
  font-size: 1.55rem;
  color: #f6fbff;
}

.preview-summary {
  padding: 18px 20px;
  background: rgba(255,255,255,0.04);
  border-radius: 18px;
  color: #cfdcee;
  line-height: 1.8;
}

@media (max-width: 860px) {
  .preview-row {
    grid-template-columns: 1fr;
  }
}
''',
}

base_dir = Path(__file__).parent
for name, text in files.items():
    path = base_dir / name
    path.write_text(text, encoding='utf-8')
print('wrote', len(files), 'files')
