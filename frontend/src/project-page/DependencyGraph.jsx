import { useEffect, useMemo, useState, useCallback } from 'react';
import ReactFlow, { Background, Controls, MiniMap, ReactFlowProvider } from 'reactflow';
import 'reactflow/dist/style.css';
import { fetchDependencyTree, fetchVulnerabilityData } from './api';
// No own CSS import — styles live in vuln-dash.css

const severityColors = {
  critical: 'var(--critical)',
  high:     'var(--high)',
  medium:   'var(--medium)',
  low:      'var(--low)',
  safe:     'var(--teal)',
};

const nodeSpacing = 180;

function buildFlowItems(tree) {
  const nodes = [];
  const edges = [];
  const rows  = {};

  function walk(item, depth = 0) {
    const row = rows[depth] || 0;
    rows[depth] = row + 1;
    const color = severityColors[item.severity] || severityColors.safe;
    nodes.push({
      id: item.id,
      position: { x: depth * nodeSpacing, y: row * 100 },
      data: { label: `${item.name} ${item.version}` },
      style: {
        background: color,
        color: '#07101d',
        border: '1px solid rgba(255,255,255,0.12)',
        width: 210,
        fontFamily: 'Anta',
        fontSize: '0.8rem',
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
  if (!query.trim()) return tree;
  const normalized = query.toLowerCase();
  function traverse(node) {
    const match    = node.name.toLowerCase().includes(normalized);
    const children = (node.children || []).map(traverse).filter(Boolean);
    return (match || children.length > 0) ? { ...node, children } : null;
  }
  return tree.map(traverse).filter(Boolean);
}

function renderTree(node, expandedSet, toggleNode, searchTerm, onSelect) {
  const active      = node.name.toLowerCase().includes(searchTerm.toLowerCase());
  const hasChildren = (node.children || []).length > 0;

  return (
    <div key={node.id} className={`dep-tree-node${active ? ' dep-tree-active' : ''}`}>
      <button
        type="button"
        className="dep-tree-label"
        onClick={() => { toggleNode(node.id); onSelect(node); }}
      >
        {hasChildren && (
          <span className="dep-tree-arrow">
            {expandedSet.has(node.id) ? '▾' : '▸'}
          </span>
        )}
        <span>{node.name}</span>
        <small style={{ marginLeft: 'auto', color: 'rgba(255,255,255,0.4)', fontSize: '0.8em' }}>
          {node.version}
        </small>
      </button>
      {hasChildren && expandedSet.has(node.id) && (
        <div className="dep-tree-children">
          {node.children.map((child) => renderTree(child, expandedSet, toggleNode, searchTerm, onSelect))}
        </div>
      )}
    </div>
  );
}

export default function DependencyGraph() {
  const [tree,            setTree]            = useState([]);
  const [search,          setSearch]          = useState('');
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [expanded,        setExpanded]        = useState(new Set(['depSCAN', 'django', 'requests', 'react']));
  const [vulnerabilities, setVulnerabilities] = useState([]);
  const [view,            setView]            = useState('tree');

  useEffect(() => {
    fetchDependencyTree().then((data) => {
      setTree(data);
      if (data[0]) setSelectedPackage(data[0]);
    });
    fetchVulnerabilityData().then(setVulnerabilities);
  }, []);

  const filteredTree = useMemo(() => filterTree(tree, search), [tree, search]);
  const flowData     = useMemo(() => buildFlowItems(filteredTree), [filteredTree]);

  const packageHistory = useMemo(() =>
    vulnerabilities.filter(
      (item) => item.package.toLowerCase() === (selectedPackage?.name || '').toLowerCase()
    ),
    [selectedPackage, vulnerabilities]
  );

  const handleToggle = (id) => {
    setExpanded((cur) => {
      const next = new Set(cur);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleSelectPackage = useCallback((node) => setSelectedPackage(node), []);

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
    const q = search.toLowerCase();
    return allPackages.filter((pkg) => pkg.name.toLowerCase().includes(q));
  }, [allPackages, search]);

  return (
    <div className="dep-panel">

      {/* Sub-header: view toggle + search */}
      <div className="dep-subheader cardvuln">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1em', flex: 1 }}>
          <input
            type="search"
            className="dep-search-input"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search package..."
          />
          <span className="stat-label">{matchPackages.length} matches</span>
        </div>
        <div className="dep-toggle-group">
          <button
            type="button"
            className={`filter-btn${view === 'tree' ? '-active' : ''}`}
            onClick={() => setView('tree')}
          >
            Tree
          </button>
          <button
            type="button"
            className={`filter-btn${view === 'graph' ? '-active' : ''}`}
            onClick={() => setView('graph')}
          >
            Graph
          </button>
        </div>
      </div>

      {/* Main split: tree/graph left, details right */}
      <div className="dep-layout">

        {/* Left — tree or flow */}
        <div className="cardvuln dep-left">
          {view === 'tree' ? (
            filteredTree.length
              ? filteredTree.map((node) =>
                  renderTree(node, expanded, handleToggle, search, handleSelectPackage)
                )
              : <p style={{ color: 'rgba(255,255,255,0.35)' }}>No package matches that search term.</p>
          ) : (
            <div style={{ height: '100%', minHeight: 520 }}>
              <ReactFlowProvider>
                <ReactFlow
                  nodes={flowData.nodes}
                  edges={flowData.edges}
                  fitView
                  fitViewOptions={{ padding: 0.85 }}
                  onNodeClick={(_, node) =>
                    handleSelectPackage(allPackages.find((item) => item.id === node.id) || node)
                  }
                >
                  <Background color="#1a2a3a" gap={16} />
                  <MiniMap
                    nodeStrokeColor={(n) => n.style.background}
                    nodeColor={(n) => n.style.background}
                  />
                  <Controls showFitView />
                </ReactFlow>
              </ReactFlowProvider>
            </div>
          )}
        </div>

        {/* Right — package details */}
        <aside className="cardvuln dep-detail-card">
          <h2 style={{ paddingBottom: '0.75em' }}>Package Details</h2>
          {selectedPackage ? (
            <>
              {[
                ['Name',             selectedPackage.name],
                ['Version',         selectedPackage.version],
                ['Supplier',        selectedPackage.supplier?.name || 'Unknown'],
                ['License',         selectedPackage.licenses?.[0]?.license?.id || 'Unknown'],
                ['PURL',            selectedPackage.purl],
                ['Severity',        selectedPackage.severity],
                ['Direct Deps',     (selectedPackage.children || []).length],
                ['CVE Count',       packageHistory.length],
              ].map(([label, value]) => (
                <div className="dep-detail-row" key={label}>
                  <span className="stat-label">{label}</span>
                  <strong
                    className={label === 'PURL' ? 'mono-cell' : ''}
                    style={label === 'Severity'
                      ? { color: severityColors[value] }
                      : label === 'Name'
                      ? { color: 'var(--teal)', fontFamily: 'Anta' }
                      : {}}
                  >
                    {value}
                  </strong>
                </div>
              ))}

              {(selectedPackage.children || []).length > 0 && (
                <div className="dep-detail-row" style={{ flexDirection: 'column', gap: '0.4em' }}>
                  <span className="stat-label">Dependencies</span>
                  {selectedPackage.children.map((child) => (
                    <div key={child.id} className="remedy-item">
                      <span className="component-name">{child.name}</span>
                      <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.8em' }}>{child.version}</span>
                    </div>
                  ))}
                </div>
              )}

              <div className="dep-detail-row" style={{ flexDirection: 'column', gap: '0.4em' }}>
                <span className="stat-label">Active Vulnerabilities</span>
                {packageHistory.length ? (
                  packageHistory.map((item) => (
                    <div key={item.cve} className="remedy-item">
                      <span className="component-name">{item.cve}</span>
                      <span className={`status-badge-${item.severity.toLowerCase() === 'high' || item.severity.toLowerCase() === 'critical' ? 'unfixed' : 'new'}`}>
                        {item.severity}
                      </span>
                    </div>
                  ))
                ) : (
                  <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.88em' }}>
                    No active CVEs for this package.
                  </p>
                )}
              </div>
            </>
          ) : (
            <p style={{ color: 'rgba(255,255,255,0.35)' }}>Select a package to view details.</p>
          )}
        </aside>
      </div>
    </div>
  );
}