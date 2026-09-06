type NodeType = 'note' | 'tool';

interface GraphNode {
  id: string;
  type: NodeType;
  title: string;
  label: string;
  href: string;
  external?: boolean;
  tags: string[];
}

interface GraphEdge {
  source: string;
  target: string;
}

interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

interface SimNode extends GraphNode {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
}

interface SimEdge {
  source: SimNode;
  target: SimNode;
}

const NOTE_COLOR = '#7dd3c0';
const TOOL_COLOR = '#a78bfa';
const EDGE_COLOR = 'rgba(148, 163, 184, 0.35)';
const LABEL_COLOR = 'rgba(226, 232, 240, 0.92)';
const BG_DOT = 'rgba(148, 163, 184, 0.08)';

function initGraph(canvas: HTMLCanvasElement, data: GraphData) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const tooltip = document.getElementById('graph-tooltip');
  const wrap = canvas.parentElement;

  let width = 0;
  let height = 0;
  let dpr = 1;
  let scale = 1;
  let offsetX = 0;
  let offsetY = 0;

  const nodes: SimNode[] = data.nodes.map((n, i) => {
    const angle = (i / Math.max(data.nodes.length, 1)) * Math.PI * 2;
    const radius = 80 + (i % 5) * 18;
    return {
      ...n,
      x: Math.cos(angle) * radius,
      y: Math.sin(angle) * radius,
      vx: 0,
      vy: 0,
      r: n.type === 'note' ? 14 : 11,
    };
  });

  const byId = new Map(nodes.map((n) => [n.id, n]));
  const edges: SimEdge[] = [];
  for (const e of data.edges) {
    const s = byId.get(e.source);
    const t = byId.get(e.target);
    if (s && t) edges.push({ source: s, target: t });
  }

  let dragging: SimNode | null = null;
  let hover: SimNode | null = null;
  let panStart: { x: number; y: number; ox: number; oy: number } | null = null;
  let moved = false;
  let lastPinchDist = 0;

  function resize() {
    const rect = (wrap ?? canvas).getBoundingClientRect();
    width = Math.max(rect.width, 320);
    height = Math.max(rect.height, 320);
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function screenToWorld(sx: number, sy: number) {
    return {
      x: (sx - width / 2 - offsetX) / scale,
      y: (sy - height / 2 - offsetY) / scale,
    };
  }

  function findNode(sx: number, sy: number): SimNode | null {
    const { x, y } = screenToWorld(sx, sy);
    let best: SimNode | null = null;
    let bestD = Infinity;
    for (const n of nodes) {
      const dx = n.x - x;
      const dy = n.y - y;
      const hit = n.r + 6 / scale;
      const d = dx * dx + dy * dy;
      if (d <= hit * hit && d < bestD) {
        best = n;
        bestD = d;
      }
    }
    return best;
  }

  function showTooltip(n: SimNode | null, clientX: number, clientY: number) {
    if (!tooltip) return;
    if (!n) {
      tooltip.hidden = true;
      return;
    }
    const kind = n.type === 'note' ? '笔记' : '工具';
    tooltip.innerHTML = `<strong>${escapeHtml(n.title)}</strong><span>${kind}${n.tags?.length ? ' · ' + n.tags.slice(0, 2).join(' / ') : ''}</span>`;
    tooltip.hidden = false;
    const pad = 12;
    let left = clientX + pad;
    let top = clientY + pad;
    const tw = tooltip.offsetWidth;
    const th = tooltip.offsetHeight;
    if (left + tw > window.innerWidth - 8) left = clientX - tw - pad;
    if (top + th > window.innerHeight - 8) top = clientY - th - pad;
    tooltip.style.left = `${left}px`;
    tooltip.style.top = `${top}px`;
  }

  function escapeHtml(s: string) {
    return s
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function tick() {
    const n = nodes.length;
    const repulsion = 2200;
    const attraction = 0.012;
    const damping = 0.86;
    const centerPull = 0.008;

    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        const a = nodes[i];
        const b = nodes[j];
        let dx = b.x - a.x;
        let dy = b.y - a.y;
        let dist2 = dx * dx + dy * dy;
        if (dist2 < 1) {
          dx = (Math.random() - 0.5) * 0.5;
          dy = (Math.random() - 0.5) * 0.5;
          dist2 = dx * dx + dy * dy;
        }
        const dist = Math.sqrt(dist2);
        const force = repulsion / dist2;
        const fx = (dx / dist) * force;
        const fy = (dy / dist) * force;
        if (a !== dragging) {
          a.vx -= fx;
          a.vy -= fy;
        }
        if (b !== dragging) {
          b.vx += fx;
          b.vy += fy;
        }
      }
    }

    for (const e of edges) {
      const a = e.source;
      const b = e.target;
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const dist = Math.sqrt(dx * dx + dy * dy) || 1;
      const ideal = 110;
      const f = (dist - ideal) * attraction;
      const fx = (dx / dist) * f;
      const fy = (dy / dist) * f;
      if (a !== dragging) {
        a.vx += fx;
        a.vy += fy;
      }
      if (b !== dragging) {
        b.vx -= fx;
        b.vy -= fy;
      }
    }

    for (const node of nodes) {
      if (node === dragging) continue;
      node.vx -= node.x * centerPull;
      node.vy -= node.y * centerPull;
      node.vx *= damping;
      node.vy *= damping;
      node.x += node.vx;
      node.y += node.vy;
    }
  }

  function draw() {
    ctx!.clearRect(0, 0, width, height);

    // subtle dots
    ctx!.fillStyle = BG_DOT;
    const step = 28;
    for (let x = step / 2; x < width; x += step) {
      for (let y = step / 2; y < height; y += step) {
        ctx!.beginPath();
        ctx!.arc(x, y, 0.8, 0, Math.PI * 2);
        ctx!.fill();
      }
    }

    ctx!.save();
    ctx!.translate(width / 2 + offsetX, height / 2 + offsetY);
    ctx!.scale(scale, scale);

    // edges
    ctx!.strokeStyle = EDGE_COLOR;
    ctx!.lineWidth = 1.25 / scale;
    for (const e of edges) {
      ctx!.beginPath();
      ctx!.moveTo(e.source.x, e.source.y);
      ctx!.lineTo(e.target.x, e.target.y);
      ctx!.stroke();
    }

    // nodes
    for (const node of nodes) {
      const isHover = node === hover;
      const isDrag = node === dragging;
      const r = node.r * (isHover || isDrag ? 1.18 : 1);

      ctx!.beginPath();
      ctx!.arc(node.x, node.y, r + 4 / scale, 0, Math.PI * 2);
      ctx!.fillStyle =
        node.type === 'note'
          ? 'rgba(125, 211, 192, 0.15)'
          : 'rgba(167, 139, 250, 0.15)';
      ctx!.fill();

      ctx!.beginPath();
      ctx!.arc(node.x, node.y, r, 0, Math.PI * 2);
      ctx!.fillStyle = node.type === 'note' ? NOTE_COLOR : TOOL_COLOR;
      ctx!.fill();

      if (node.type === 'tool') {
        // hollow ring feel for tools
        ctx!.beginPath();
        ctx!.arc(node.x, node.y, r * 0.45, 0, Math.PI * 2);
        ctx!.fillStyle = 'rgba(15, 23, 42, 0.55)';
        ctx!.fill();
      }

      // label
      ctx!.fillStyle = LABEL_COLOR;
      ctx!.font = `${11 / scale}px system-ui, "PingFang SC", "Noto Sans SC", sans-serif`;
      ctx!.textAlign = 'center';
      ctx!.textBaseline = 'top';
      ctx!.fillText(node.label, node.x, node.y + r + 4 / scale);
    }

    ctx!.restore();
  }

  function loop() {
    tick();
    draw();
    requestAnimationFrame(loop);
  }

  function getLocal(e: PointerEvent | Touch) {
    const rect = canvas.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top, clientX: e.clientX, clientY: e.clientY };
  }

  canvas.addEventListener('pointerdown', (e) => {
    canvas.setPointerCapture(e.pointerId);
    moved = false;
    const { x, y } = getLocal(e);
    const node = findNode(x, y);
    if (node) {
      dragging = node;
      node.vx = 0;
      node.vy = 0;
    } else {
      panStart = { x: e.clientX, y: e.clientY, ox: offsetX, oy: offsetY };
    }
  });

  canvas.addEventListener('pointermove', (e) => {
    const local = getLocal(e);
    if (dragging) {
      moved = true;
      const w = screenToWorld(local.x, local.y);
      dragging.x = w.x;
      dragging.y = w.y;
      dragging.vx = 0;
      dragging.vy = 0;
      showTooltip(dragging, local.clientX, local.clientY);
      return;
    }
    if (panStart) {
      moved = true;
      offsetX = panStart.ox + (e.clientX - panStart.x);
      offsetY = panStart.oy + (e.clientY - panStart.y);
      return;
    }
    hover = findNode(local.x, local.y);
    canvas.style.cursor = hover ? 'pointer' : 'grab';
    showTooltip(hover, local.clientX, local.clientY);
  });

  function endPointer(e: PointerEvent) {
    const local = getLocal(e);
    const was = dragging;
    dragging = null;
    panStart = null;
    if (was && !moved) {
      if (was.external) {
        window.open(was.href, '_blank', 'noopener,noreferrer');
      } else {
        window.location.href = was.href;
      }
    }
    hover = findNode(local.x, local.y);
    showTooltip(hover, local.clientX, local.clientY);
  }

  canvas.addEventListener('pointerup', endPointer);
  canvas.addEventListener('pointercancel', () => {
    dragging = null;
    panStart = null;
  });

  canvas.addEventListener(
    'wheel',
    (e) => {
      e.preventDefault();
      const factor = e.deltaY > 0 ? 0.92 : 1.08;
      const next = Math.min(2.5, Math.max(0.45, scale * factor));
      scale = next;
    },
    { passive: false }
  );

  // pinch zoom
  canvas.addEventListener(
    'touchstart',
    (e) => {
      if (e.touches.length === 2) {
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        lastPinchDist = Math.hypot(dx, dy);
      }
    },
    { passive: true }
  );

  canvas.addEventListener(
    'touchmove',
    (e) => {
      if (e.touches.length === 2) {
        e.preventDefault();
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        const dist = Math.hypot(dx, dy);
        if (lastPinchDist > 0) {
          scale = Math.min(2.5, Math.max(0.45, scale * (dist / lastPinchDist)));
        }
        lastPinchDist = dist;
        dragging = null;
        panStart = null;
      }
    },
    { passive: false }
  );

  canvas.addEventListener('touchend', () => {
    lastPinchDist = 0;
  });

  window.addEventListener('resize', resize);
  resize();
  // Fit initial scale slightly smaller on narrow screens
  if (width < 560) scale = 0.85;
  requestAnimationFrame(loop);
}

function boot() {
  const el = document.getElementById('wiki-graph-data');
  const canvas = document.getElementById('wiki-graph') as HTMLCanvasElement | null;
  if (!el || !canvas) return;
  try {
    const data = JSON.parse(el.textContent || '{}') as GraphData;
    if (!data.nodes?.length) return;
    initGraph(canvas, data);
  } catch (err) {
    console.error('Wiki graph failed to init', err);
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}
