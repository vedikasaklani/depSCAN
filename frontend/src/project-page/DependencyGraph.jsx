import { useEffect, useMemo, useState, useCallback, useRef } from 'react';
import * as d3 from 'd3';
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
  const svgRef = useRef(null);
  const wrapperRef = useRef(null);

  useEffect(() => {
    fetchDependencyTree().then((data) => {
      setTree(data);
      if (data[0]) setSelectedPackage(data[0]);
    });
    fetchVulnerabilityData().then(setVulnerabilities);
  }, []);

  const filteredTree = useMemo(() => filterTree(tree, search), [tree, search]);

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

  useEffect(() => {
    if (view !== 'graph') return;
    if (!svgRef.current || !wrapperRef.current) return;

    let simulation;
    let resizeObserver;

    function drawGraph() {
      if (!svgRef.current || !wrapperRef.current) return;

      const width = wrapperRef.current.clientWidth || 800;
      const height = wrapperRef.current.clientHeight || 520;
      if (width === 0 || height === 0) {
        requestAnimationFrame(drawGraph);
        return;
      }

      const nodes = [];
      const links = [];
      const nodeById = new Map();

      function walk(item, parent = null) {
        if (!nodeById.has(item.id)) {
          const nodeDatum = {
            ...item,
            color: severityColors[item.severity] || severityColors.safe,
          };
          nodeById.set(item.id, nodeDatum);
          nodes.push(nodeDatum);
        }
        if (parent) {
          links.push({ source: parent.id, target: item.id });
        }
        (item.children || []).forEach((child) => walk(child, item));
      }

      filteredTree.forEach((item) => walk(item));

      const svg = d3.select(svgRef.current);
      svg.selectAll('*').remove();
      svg
        .attr('viewBox', `0 0 ${width} ${height}`)
        .attr('preserveAspectRatio', 'xMidYMid meet')
        .style('width', '100%')
        .style('height', '100%');

      const link = svg.append('g')
        .attr('stroke', 'rgba(255,255,255,0.24)')
        .attr('stroke-width', 2)
        .selectAll('line')
        .data(links)
        .join('line')
        .attr('stroke-linecap', 'round');

      const nodeGroups = svg.append('g')
        .selectAll('g')
        .data(nodes)
        .join('g')
        .attr('cursor', 'pointer')
        .on('click', (_, d) => handleSelectPackage(d))
        .on('mouseover', function () {
          d3.select(this).select('rect').attr('fill', 'rgba(255,255,255,0.08)');
        })
        .on('mouseout', function () {
          d3.select(this).select('rect').attr('fill', 'rgba(20,25,34,0.98)');
        });

      const NODE_WIDTH = 130;
      const NODE_HEIGHT = 28;

      nodeGroups.append('rect')
        .attr('x', -NODE_WIDTH / 2)
        .attr('y', -NODE_HEIGHT / 2)
        .attr('width', NODE_WIDTH)
        .attr('height', NODE_HEIGHT)
        .attr('rx', 16)
        .attr('fill', 'rgba(20,25,34,0.98)')
        .attr('stroke', 'rgba(255,255,255,0.12)')
        .attr('stroke-width', 1);

      nodeGroups.append('circle')
        .attr('cx', -NODE_WIDTH / 2 + 14)
        .attr('cy', 0)
        .attr('r', 6)
        .attr('fill', (d) => d.color)
        .attr('stroke', '#131b23')
        .attr('stroke-width', 1.5);

      nodeGroups.append('text')
        .text((d) => d.name)
        .attr('x', -NODE_WIDTH / 2 + 28)
        .attr('fill', '#fff')
        .attr('font-size', 11)
        .attr('font-weight', 600)
        .attr('text-anchor', 'start')
        .attr('dy', 4);

      nodeGroups.append('title')
        .text((d) => `${d.name} ${d.version}`);

      simulation = d3.forceSimulation(nodes)
        .force('link', d3.forceLink(links).id((d) => d.id).distance(120).strength(1))
        .force('charge', d3.forceManyBody().strength(-260))
        .force('center', d3.forceCenter(width / 2, height / 2))
        .force('collision', d3.forceCollide(26));

      simulation.on('tick', () => {
        link
          .attr('x1', (d) => d.source.x)
          .attr('y1', (d) => d.source.y)
          .attr('x2', (d) => d.target.x)
          .attr('y2', (d) => d.target.y);

        nodeGroups.attr('transform', (d) => `translate(${Math.max(24, Math.min(width - 24, d.x))},${Math.max(24, Math.min(height - 24, d.y))})`);
      });
    }

    drawGraph();
    resizeObserver = new ResizeObserver(() => drawGraph());
    resizeObserver.observe(wrapperRef.current);

    return () => {
      simulation?.stop();
      resizeObserver.disconnect();
    };
  }, [filteredTree, handleSelectPackage, selectedPackage, view]);

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
            <div style={{ height: '100%', minHeight: 520 }} ref={wrapperRef}>
              <svg ref={svgRef} />
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