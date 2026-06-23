import { useEffect, useMemo, useRef, useState } from 'react';
import { drag } from 'd3-drag';
import {
  forceCenter,
  forceCollide,
  forceLink,
  forceManyBody,
  forceSimulation,
  forceX,
  forceY,
} from 'd3-force';
import { select } from 'd3-selection';
import { zoom } from 'd3-zoom';

const severityColors = {
  critical: 'var(--critical)',
  high: 'var(--high)',
  medium: 'var(--medium)',
  low: 'var(--low)',
  safe: 'var(--teal)',
};

const severityRank = {
  critical: 4,
  high: 3,
  medium: 2,
  low: 1,
  safe: 0,
};

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
  return { name: decodeURIComponent(segments[segments.length - 1] || 'unknown'), version };
}

function normalizeSeverity(value) {
  const key = String(value ?? '').toLowerCase();
  return key in severityRank ? key : 'safe';
}

function buildGraphMaps(edges = [], components = [], vulns = [], projectName) {
  const metaByPurl = new Map();
  const metaByName = new Map();
  components.forEach((component) => {
    if (component.purl) metaByPurl.set(component.purl, component);
    if (component.name) metaByName.set(component.name.toLowerCase(), component);
  });

  const worstSeverityByName = new Map();
  vulns.forEach((vuln) => {
    const name = (vuln.component_name ?? vuln.component ?? vuln.package ?? '').toLowerCase();
    if (!name) return;
    const severity = normalizeSeverity(vuln.severity);
    const current = worstSeverityByName.get(name) ?? 'safe';
    if (severityRank[severity] > severityRank[current]) {
      worstSeverityByName.set(name, severity);
    }
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

  components.forEach((component) => {
    if (component.purl) allPurls.add(component.purl);
  });

  const rootPurls = [...allPurls].filter((purl) => !parentsByChild.has(purl));
  const rootSet = new Set(rootPurls);
  const nodeCache = new Map();

  allPurls.forEach((purl) => {
    const { name, version } = parsePurl(purl);
    const meta = metaByPurl.get(purl) ?? metaByName.get(name.toLowerCase()) ?? {};
    const displayName = rootSet.has(purl) && projectName ? projectName : (meta.name || name);
    const licenses = meta.license ? [{ license: { id: meta.license } }] : (meta.licenses ?? []);
    const supplier = typeof meta.supplier === 'string'
      ? { name: meta.supplier }
      : (meta.supplier ?? { name: '-' });
    const severity = worstSeverityByName.get((meta.name || name).toLowerCase()) ?? normalizeSeverity(meta.severity);

    nodeCache.set(purl, {
      id: purl,
      purl,
      name: displayName,
      version: meta.version || version,
      supplier,
      licenses,
      severity,
    });
  });

  return { nodeCache, childrenByParent, parentsByChild, rootPurls, allPurls: [...allPurls] };
}

function buildTree(rootPurls, childrenByParent, nodeCache) {
  function walk(purl, path) {
    const base = nodeCache.get(purl);
    if (!base) return null;
    const treeId = [...path, purl].join('>');
    if (path.includes(purl)) return { ...base, treeId, children: [] };
    const children = (childrenByParent.get(purl) ?? [])
      .map((child) => walk(child, [...path, purl]))
      .filter(Boolean);
    return { ...base, treeId, children };
  }
  return rootPurls.map((root) => walk(root, [])).filter(Boolean);
}

function filterTree(tree, query) {
  if (!query.trim()) return tree;
  const q = query.toLowerCase();
  function traverse(node) {
    const match = node.name.toLowerCase().includes(q);
    const children = (node.children || []).map(traverse).filter(Boolean);
    return match || children.length > 0 ? { ...node, children } : null;
  }
  return tree.map(traverse).filter(Boolean);
}

function renderTree(node, expandedSet, toggleNode, searchTerm, onSelect) {
  const active = node.name.toLowerCase().includes(searchTerm.toLowerCase());
  const hasChildren = (node.children || []).length > 0;
  return (
    <div key={node.treeId} className={`dep-tree-node${active ? ' dep-tree-active' : ''}`}>
      <button type="button" className="dep-tree-label" onClick={() => { toggleNode(node.treeId); onSelect(node); }}>
        {hasChildren && <span className="dep-tree-arrow">{expandedSet.has(node.treeId) ? 'v' : '>'}</span>}
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

function getConnected(startPurls, forwardMap, backwardMap) {
  const keep = new Set();
  function dfs(purl, map) {
    if (keep.has(purl)) return;
    keep.add(purl);
    (map.get(purl) ?? []).forEach((next) => dfs(next, map));
  }
  startPurls.forEach((purl) => {
    keep.add(purl);
    dfs(purl, forwardMap);
    dfs(purl, backwardMap);
  });
  return keep;
}

function D3ForceGraph({ purls, edges, nodeCache, onSelect }) {
  const svgRef = useRef(null);

  useEffect(() => {
    const svgNode = svgRef.current;
    if (!svgNode) return undefined;

    const width = svgNode.clientWidth || 900;
    const height = svgNode.clientHeight || 520;
    const purlSet = new Set(purls);
    const nodes = purls.map((purl) => ({ ...nodeCache.get(purl) })).filter((node) => node.id);
    const links = edges
      .filter((edge) => purlSet.has(edge.parent) && purlSet.has(edge.child))
      .map((edge) => ({ source: edge.parent, target: edge.child }));

    const svg = select(svgNode);
    svg.selectAll('*').remove();
    svg.attr('viewBox', [0, 0, width, height]);

    if (!nodes.length) return undefined;

    const root = svg.append('g');
    const zoomBehavior = zoom()
      .scaleExtent([0.25, 2.4])
      .on('zoom', (event) => root.attr('transform', event.transform));
    svg.call(zoomBehavior);

    const link = root.append('g')
      .attr('stroke', 'rgba(207,233,228,0.16)')
      .attr('stroke-width', 1.4)
      .selectAll('line')
      .data(links)
      .join('line');

    const node = root.append('g')
      .selectAll('g')
      .data(nodes)
      .join('g')
      .attr('class', 'd3-dep-node')
      .style('cursor', 'grab')
      .on('click', (_, datum) => onSelect(datum));

    node.append('circle')
      .attr('r', (datum) => (datum.name === nodes[0]?.name ? 10 : 7))
      .attr('fill', (datum) => severityColors[datum.severity] ?? severityColors.safe)
      .attr('stroke', 'rgba(255,255,255,0.8)')
      .attr('stroke-width', 1);

    node.append('text')
      .text((datum) => datum.name)
      .attr('x', 14)
      .attr('y', 4)
      .attr('fill', 'var(--textlight)')
      .attr('font-size', 11)
      .attr('font-family', 'Share Tech Mono, monospace')
      .attr('paint-order', 'stroke')
      .attr('stroke', 'rgba(7,10,16,0.9)')
      .attr('stroke-width', 4);

    node.append('title')
      .text((datum) => `${datum.name}\n${datum.purl}\nSeverity: ${datum.severity}`);

    const simulation = forceSimulation(nodes)
      .force('link', forceLink(links).id((datum) => datum.id).distance(95).strength(0.65))
      .force('charge', forceManyBody().strength(-360))
      .force('center', forceCenter(width / 2, height / 2))
      .force('collision', forceCollide().radius(48))
      .force('x', forceX(width / 2).strength(0.035))
      .force('y', forceY(height / 2).strength(0.035));

    function dragstarted(event) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      event.subject.fx = event.subject.x;
      event.subject.fy = event.subject.y;
    }

    function dragged(event) {
      event.subject.fx = event.x;
      event.subject.fy = event.y;
    }

    function dragended(event) {
      if (!event.active) simulation.alphaTarget(0);
      event.subject.fx = null;
      event.subject.fy = null;
    }

    node.call(drag()
      .on('start', dragstarted)
      .on('drag', dragged)
      .on('end', dragended));

    simulation.on('tick', () => {
      link
        .attr('x1', (datum) => datum.source.x)
        .attr('y1', (datum) => datum.source.y)
        .attr('x2', (datum) => datum.target.x)
        .attr('y2', (datum) => datum.target.y);

      node.attr('transform', (datum) => `translate(${datum.x},${datum.y})`);
    });

    return () => simulation.stop();
  }, [purls, edges, nodeCache, onSelect]);

  return <svg ref={svgRef} className="d3-force-graph" role="img" aria-label="D3 force-directed dependency graph" />;
}

export default function DependencyGraph({ edges = [], components = [], vulns = [], projectName = 'Project' }) {
  const { nodeCache, childrenByParent, parentsByChild, rootPurls, allPurls } = useMemo(
    () => buildGraphMaps(edges, components, vulns, projectName),
    [edges, components, vulns, projectName]
  );

  const tree = useMemo(
    () => buildTree(rootPurls, childrenByParent, nodeCache),
    [rootPurls, childrenByParent, nodeCache]
  );

  const [search, setSearch] = useState('');
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [expanded, setExpanded] = useState(() => new Set(rootPurls));
  const [view, setView] = useState('tree');

  const effectiveSelected = selectedPackage ?? (rootPurls.length ? nodeCache.get(rootPurls[0]) : null);
  const filteredTree = useMemo(() => filterTree(tree, search), [tree, search]);
  const matchPackages = useMemo(() => {
    const all = [...nodeCache.values()];
    if (!search.trim()) return all;
    const q = search.toLowerCase();
    return all.filter((pkg) => pkg.name.toLowerCase().includes(q));
  }, [nodeCache, search]);

  const filteredPurls = useMemo(() => {
    if (!search.trim()) return allPurls;
    const matched = matchPackages.map((pkg) => pkg.purl);
    return [...getConnected(matched, childrenByParent, parentsByChild)];
  }, [search, matchPackages, allPurls, childrenByParent, parentsByChild]);

  const packageHistory = useMemo(() =>
    vulns.filter((vuln) => {
      const name = (vuln.component_name ?? vuln.component ?? vuln.package ?? '').toLowerCase();
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

  return (
    <div className="dep-panel">
      <div className="dep-subheader cardvuln">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1em', flex: 1 }}>
          <input
            type="search"
            className="dep-search-input"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
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
              ? filteredTree.map((node) => renderTree(node, expanded, handleToggle, search, setSelectedPackage))
              : (
                <p style={{ color: 'rgba(255,255,255,0.35)' }}>
                  {search.trim() ? 'No package matches that search term.' : 'No dependency data available.'}
                </p>
              )
          ) : (
            filteredPurls.length ? (
              <D3ForceGraph
                purls={filteredPurls}
                edges={edges}
                nodeCache={nodeCache}
                onSelect={setSelectedPackage}
              />
            ) : (
              <div style={{ height: '100%', display: 'grid', placeItems: 'center', color: 'rgba(255,255,255,0.4)', padding: '2rem' }}>
                <div style={{ textAlign: 'center' }}>
                  <p style={{ margin: 0, fontSize: '1rem' }}>No dependency graph available yet.</p>
                  <p style={{ margin: '0.75rem 0 0', maxWidth: 320 }}>Upload an SBOM with dependency relationships to view the graph.</p>
                </div>
              </div>
            )
          )}
        </div>

        <aside className="cardvuln dep-detail-card">
          <h2 style={{ paddingBottom: '0.75em' }}>Package Details</h2>
          {effectiveSelected ? (
            <>
              {[
                ['Name', effectiveSelected.name],
                ['Version', effectiveSelected.version || '-'],
                ['Supplier', effectiveSelected.supplier?.name || '-'],
                ['License', effectiveSelected.licenses?.[0]?.license?.id || '-'],
                ['PURL', effectiveSelected.purl || '-'],
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
                  packageHistory.map((vuln, i) => (
                    <div key={vuln.cve_id ?? vuln.cve ?? i} className="remedy-item">
                      <span className="component-name">{vuln.cve_id ?? vuln.cve ?? 'CVE Unknown'}</span>
                      <span className={`status-badge-${['high', 'critical'].includes((vuln.severity ?? '').toLowerCase()) ? 'unfixed' : 'new'}`}>
                        {vuln.severity ?? '-'}
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
