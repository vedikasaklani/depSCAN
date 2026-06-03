import { useEffect, useMemo, useState, useCallback } from 'react';
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
