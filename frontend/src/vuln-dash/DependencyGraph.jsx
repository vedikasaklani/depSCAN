import { useMemo, useState, useCallback } from 'react';
import ReactFlow, { Background, Controls, MiniMap, ReactFlowProvider } from 'reactflow';
import 'reactflow/dist/style.css';

const severityColors = {
  critical: 'var(--critical)',
  high: 'var(--high)',
  medium: 'var(--medium)',
  low: 'var(--low)',
  safe: 'var(--teal)',
};

const NODE_SPACING = 180;

// --- purl parsing -----------------------------------------------------
// "pkg:pypi/django@4.2.1" -> { name: "django", version: "4.2.1" }
// "pkg:generic/my-demo-project" -> { name: "my-demo-project", version: "" }
function parsePurl(purl) {
  if (!purl) return { name: 'unknown', version: '' };
  const withoutScheme = purl.replace(/^pkg:/, '');
  const slashIdx = withoutScheme.indexOf('/');
  const rest = slashIdx >= 0 ? withoutScheme.slice(slashIdx + 1) : withoutScheme;
  const pathPart = rest.split('?')[0].split('#')[0];
  const atIdx = pathPart.lastIndexOf('@');
  const namePart = atIdx > -1 ? pathPart.slice(0, atIdx) : pathPart;
  const version = atIdx > -1 ? pathPart.slice(atIdx + 1) : '';
  const segments = namePart.split('/');
  return { name: segments[segments.length - 1], version };
}

// --- build lookup maps from the /sbom/dependencies edge list -----------
// edges: [{ sbom_id, parent, child }, ...]
// components/vulns are still used purely for metadata enrichment (severity,
// supplier, license) since the edges endpoint only describes structure.
function buildGraphMaps(edges = [], components = [], projectName) {
  const metaByPurl = new Map();
  const metaByName = new Map();
  components.forEach((c) => {
    if (c.purl) metaByPurl.set(c.purl, c);
    if (c.name) metaByName.set(c.name.toLowerCase(), c);
  });

  const childrenByParent = new Map();
  const parentsByChild = new Map();
  const allPurls = new Set();

  edges.forEach(({ parent, child }) => {
    if (!parent || !child) return;
    allPurls.add(parent);
    allPurls.add(child);
    if (!childrenByParent.has(parent)) childrenByParent.set(parent, []);
    childrenByParent.get(parent).push(child);
    if (!parentsByChild.has(child)) parentsByChild.set(child, []);
    parentsByChild.get(child).push(parent);
  });

  // Roots = anything that never appears as a "child" (e.g. the project itself)
  const rootPurls = [...allPurls].filter((p) => !parentsByChild.has(p));
  const rootSet = new Set(rootPurls);

  const nodeCache = new Map();
  allPurls.forEach((purl) => {
    const { name, version } = parsePurl(purl);
    const meta = metaByPurl.get(purl) ?? metaByName.get(name.toLowerCase()) ?? {};
    const licenses = meta.license ? [{ license: { id: meta.license } }] : (meta.licenses ?? []);
    const supplier = typeof meta.supplier === 'string'
      ? { name: meta.supplier }
      : (meta.supplier ?? { name: '—' });
    nodeCache.set(purl, {
      id: purl,
      purl,
      name: rootSet.has(purl) && projectName ? projectName : name,
      version,
      supplier,
      licenses,
      severity: meta.severity ?? 'safe',
    });
  });

  return { nodeCache, childrenByParent, parentsByChild, rootPurls, allPurls: [...allPurls] };
}

// --- tree view -----------------------------------------------------------
// Because the graph is a DAG (a package can have multiple parents — see
// sqlparse under both the project root and django), the same purl can show
// up at multiple positions in the tree. `id`/`purl` stay stable for data
// lookups (severity, selection, vulns); `treeId` is unique per *position*
// so React keys and expand/collapse state don't collide between occurrences.
function buildTree(rootPurls, childrenByParent, nodeCache) {
  function walk(purl, path) {
    const base = nodeCache.get(purl);
    const treeId = [...path, purl].join('>');
    if (path.includes(purl)) {
      // defensive cycle guard — shouldn't happen in a valid SBOM graph
      return { ...base, treeId, children: [] };
    }
    const childPurls = childrenByParent.get(purl) ?? [];
    return {
      ...base,
      treeId,
      children: childPurls.map((c) => walk(c, [...path, purl])),
    };
  }
  return rootPurls.map((r) => walk(r, []));
}

function filterTree(tree, query) {
  if (!query.trim()) return tree;
  const q = query.toLowerCase();
  function traverse(node) {
    const match = node.name.toLowerCase().includes(q);
    const children = (node.children || []).map(traverse).filter(Boolean);
    return (match || children.length > 0) ? { ...node, children } : null;
  }
  return tree.map(traverse).filter(Boolean);
}

function renderTree(node, expandedSet, toggleNode, searchTerm, onSelect) {
  const active = node.name.toLowerCase().includes(searchTerm.toLowerCase());
  const hasChildren = (node.children || []).length > 0;
  return (
    <div key={node.treeId} className={`dep-tree-node${active ? ' dep-tree-active' : ''}`}>
      <button type="button" className="dep-tree-label" onClick={() => { toggleNode(node.treeId); onSelect(node); }}>
        {hasChildren && <span className="dep-tree-arrow">{expandedSet.has(node.treeId) ? '▾' : '▸'}</span>}
        <span>{node.name}</span>
        <small style={{ marginLeft: 'auto', color: 'rgba(255,255,255,0.4)', fontSize: '0.8em' }}>{node.version}</small>
      </button>
      {hasChildren && expandedSet.has(node.treeId) && (
        <div className="dep-tree-children">
          {node.children.map((child) => renderTree(child, expandedSet, toggleNode, searchTerm, onSelect))}
        </div>
      )}
    </div>
  );
}

function computeDepths(allPurls, parentsByChild, childrenByParent) {
  const indegree = new Map();
  allPurls.forEach((p) => indegree.set(p, (parentsByChild.get(p) ?? []).length));

  const depth = new Map();
  const queue = [];
  allPurls.forEach((p) => {
    if ((indegree.get(p) ?? 0) === 0) {
      depth.set(p, 0);
      queue.push(p);
    }
  });

  let i = 0;
  while (i < queue.length) {
    const p = queue[i++];
    const d = depth.get(p);
    (childrenByParent.get(p) ?? []).forEach((c) => {
      depth.set(c, Math.max(depth.get(c) ?? 0, d + 1));
      indegree.set(c, indegree.get(c) - 1);
      if (indegree.get(c) === 0) queue.push(c);
    });
  }
  allPurls.forEach((p) => { if (!depth.has(p)) depth.set(p, 0); });
  return depth;
}

function getConnected(startPurls, forwardMap, backwardMap) {
  const keep = new Set();
  function dfs(purl, map) {
    if (keep.has(purl)) return;
    keep.add(purl);
    (map.get(purl) ?? []).forEach((next) => dfs(next, map));
  }
  startPurls.forEach((p) => {
    keep.add(p);
    dfs(p, forwardMap);
    dfs(p, backwardMap);
  });
  return keep;
}

function buildFlowItems(purls, edges, depths, nodeCache) {
  const purlSet = new Set(purls);
  const rows = {};
  const nodes = purls.map((purl) => {
    const d = depths.get(purl) ?? 0;
    const row = rows[d] || 0;
    rows[d] = row + 1;
    const meta = nodeCache.get(purl);
    const color = severityColors[meta.severity] || severityColors.safe;
    return {
      id: purl,
      position: { x: d * NODE_SPACING, y: row * 100 },
      data: { label: `${meta.name}${meta.version ? ' ' + meta.version : ''}` },
      style: { background: color, color: '#07101d', border: '1px solid rgba(255,255,255,0.12)', width: 210, fontFamily: 'Anta', fontSize: '0.8rem' },
    };
  });
  const flowEdges = edges
    .filter((e) => purlSet.has(e.parent) && purlSet.has(e.child))
    .map((e) => ({ id: `${e.parent}->${e.child}`, source: e.parent, target: e.child, animated: false }));
  return { nodes, edges: flowEdges };
}

export default function DependencyGraph({ edges = [], components = [], vulns = [], projectName = 'Project' }) {
  const { nodeCache, childrenByParent, parentsByChild, rootPurls, allPurls } = useMemo(
    () => buildGraphMaps(edges, components, projectName),
    [edges, components, projectName]
  );

  const tree = useMemo(
    () => buildTree(rootPurls, childrenByParent, nodeCache),
    [rootPurls, childrenByParent, nodeCache]
  );

  const depths = useMemo(
    () => computeDepths(allPurls, parentsByChild, childrenByParent),
    [allPurls, parentsByChild, childrenByParent]
  );

  const [search, setSearch] = useState('');
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [expanded, setExpanded] = useState(() => new Set(rootPurls));
  const [view, setView] = useState('tree');

  const effectiveSelected = selectedPackage ?? (rootPurls.length ? nodeCache.get(rootPurls[0]) : null);

  const filteredTree = useMemo(() => filterTree(tree, search), [tree, search]);

  // Packages matching the search (deduped — a package only counts once even
  // if it appears under multiple parents in the tree).
  const matchPackages = useMemo(() => {
    const all = [...nodeCache.values()];
    if (!search.trim()) return all;
    const q = search.toLowerCase();
    return all.filter((p) => p.name.toLowerCase().includes(q));
  }, [nodeCache, search]);

  // For the graph view, keep matched nodes plus their ancestors/descendants
  // so the surrounding structure stays visible while filtering.
  const filteredPurls = useMemo(() => {
    if (!search.trim()) return allPurls;
    const matched = matchPackages.map((p) => p.purl);
    return [...getConnected(matched, childrenByParent, parentsByChild)];
  }, [search, matchPackages, allPurls, childrenByParent, parentsByChild]);

  const flowData = useMemo(
    () => buildFlowItems(filteredPurls, edges, depths, nodeCache),
    [filteredPurls, edges, depths, nodeCache]
  );

  const packageHistory = useMemo(() =>
    vulns.filter((v) => {
      const name = (v.component ?? v.package ?? '').toLowerCase();
      return name === (effectiveSelected?.name ?? '').toLowerCase();
    }),
    [vulns, effectiveSelected]
  );

  const directDepsCount = (childrenByParent.get(effectiveSelected?.purl) ?? []).length;

  const handleToggle = (treeId) => {
    setExpanded((cur) => {
      const next = new Set(cur);
      next.has(treeId) ? next.delete(treeId) : next.add(treeId);
      return next;
    });
  };

  const handleSelectPackage = useCallback((node) => setSelectedPackage(node), []);

  return (
    <div className="dep-panel">
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
          <button type="button" className={`filter-btn${view === 'tree' ? '-active' : ''}`} onClick={() => setView('tree')}>Tree</button>
          <button type="button" className={`filter-btn${view === 'graph' ? '-active' : ''}`} onClick={() => setView('graph')}>Graph</button>
        </div>
      </div>

      <div className="dep-layout">
        <div className="cardvuln dep-left">
          {view === 'tree' ? (
            filteredTree.length
              ? filteredTree.map((node) => renderTree(node, expanded, handleToggle, search, handleSelectPackage))
              : (
                <p style={{ color: 'rgba(255,255,255,0.35)' }}>
                  {search.trim() ? 'No package matches that search term.' : 'No dependency data available.'}
                </p>
              )
          ) : (
            <div style={{ height: '100%', minHeight: 520 }}>
              <ReactFlowProvider>
                <ReactFlow
                  nodes={flowData.nodes}
                  edges={flowData.edges}
                  fitView
                  fitViewOptions={{ padding: 0.85 }}
                  onNodeClick={(_, node) => handleSelectPackage(nodeCache.get(node.id) || node)}
                >
                  <Background color="#1a2a3a" gap={16} />
                  <MiniMap nodeStrokeColor={(n) => n.style.background} nodeColor={(n) => n.style.background} />
                  <Controls showFitView />
                </ReactFlow>
              </ReactFlowProvider>
            </div>
          )}
        </div>

        <aside className="cardvuln dep-detail-card">
          <h2 style={{ paddingBottom: '0.75em' }}>Package Details</h2>
          {effectiveSelected ? (
            <>
              {[
                ['Name', effectiveSelected.name],
                ['Version', effectiveSelected.version || '—'],
                ['Supplier', effectiveSelected.supplier?.name || '—'],
                ['License', effectiveSelected.licenses?.[0]?.license?.id || '—'],
                ['PURL', effectiveSelected.purl || '—'],
                ['Severity', effectiveSelected.severity || 'safe'],
                ['Direct Deps', directDepsCount],
                ['CVE Count', packageHistory.length],
              ].map(([label, value]) => (
                <div className="dep-detail-row" key={label}>
                  <span className="stat-label">{label}</span>
                  <strong
                    className={label === 'PURL' ? 'mono-cell' : ''}
                    style={label === 'Severity' ? { color: severityColors[value] ?? 'var(--teal)' }
                      : label === 'Name' ? { color: 'var(--teal)', fontFamily: 'Anta' }
                        : {}}
                  >
                    {String(value)}
                  </strong>
                </div>
              ))}

              <div className="dep-detail-row" style={{ flexDirection: 'column', gap: '0.4em' }}>
                <span className="stat-label">Active Vulnerabilities</span>
                {packageHistory.length ? (
                  packageHistory.map((v, i) => (
                    <div key={v.cve_id ?? v.cve ?? i} className="remedy-item">
                      <span className="component-name">{v.cve_id ?? v.cve ?? 'CVE Unknown'}</span>
                      <span className={`status-badge-${['high', 'critical'].includes((v.severity ?? '').toLowerCase()) ? 'unfixed' : 'new'
                        }`}>
                        {v.severity ?? '—'}
                      </span>
                    </div>
                  ))
                ) : (
                  <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.88em' }}>No active CVEs for this package.</p>
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