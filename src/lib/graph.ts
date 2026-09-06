import { getCollection } from 'astro:content';

export type GraphNodeType = 'note' | 'tool';

export interface GraphNode {
  id: string;
  type: GraphNodeType;
  title: string;
  label: string;
  href: string;
  external?: boolean;
  tags: string[];
}

export interface GraphEdge {
  source: string;
  target: string;
}

export interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

function normalizeRelated(ref: string): string | null {
  const trimmed = ref.trim();
  if (!trimmed) return null;
  if (trimmed.startsWith('note:') || trimmed.startsWith('tool:')) {
    return trimmed;
  }
  // Bare ids: prefer note: if ambiguous resolution happens later
  return trimmed;
}

function resolveId(
  ref: string,
  noteIds: Set<string>,
  toolIds: Set<string>
): string | null {
  if (ref.startsWith('note:')) {
    const id = `note:${ref.slice(5)}`;
    return noteIds.has(id) ? id : null;
  }
  if (ref.startsWith('tool:')) {
    const id = `tool:${ref.slice(5)}`;
    return toolIds.has(id) ? id : null;
  }
  const asNote = `note:${ref}`;
  const asTool = `tool:${ref}`;
  if (noteIds.has(asNote)) return asNote;
  if (toolIds.has(asTool)) return asTool;
  return null;
}

function shortLabel(title: string, max = 8): string {
  const t = title.trim();
  if (t.length <= max) return t;
  return t.slice(0, max) + '…';
}

/** Build force-graph JSON from content collections (build time). */
export async function buildGraphData(): Promise<GraphData> {
  const posts = await getCollection('posts', ({ data }) => !data.draft);
  const tools = await getCollection('tools');

  const nodes: GraphNode[] = [];
  const noteIds = new Set<string>();
  const toolIds = new Set<string>();

  for (const post of posts) {
    const id = `note:${post.id}`;
    noteIds.add(id);
    nodes.push({
      id,
      type: 'note',
      title: post.data.title,
      label: shortLabel(post.data.title),
      href: `/posts/${post.id}/`,
      tags: post.data.tags,
    });
  }

  for (const tool of tools) {
    const id = `tool:${tool.id}`;
    toolIds.add(id);
    nodes.push({
      id,
      type: 'tool',
      title: tool.data.title,
      label: shortLabel(tool.data.title, 10),
      href: tool.data.url,
      external: true,
      tags: tool.data.tags,
    });
  }

  const edgeKeys = new Set<string>();
  const edges: GraphEdge[] = [];

  const addEdge = (a: string, b: string) => {
    if (a === b) return;
    const key = a < b ? `${a}|${b}` : `${b}|${a}`;
    if (edgeKeys.has(key)) return;
    edgeKeys.add(key);
    edges.push({ source: a, target: b });
  };

  for (const post of posts) {
    const from = `note:${post.id}`;
    for (const raw of post.data.related) {
      const norm = normalizeRelated(raw);
      if (!norm) continue;
      const to = resolveId(norm, noteIds, toolIds);
      if (to) addEdge(from, to);
    }
  }

  for (const tool of tools) {
    const from = `tool:${tool.id}`;
    for (const raw of tool.data.related) {
      const norm = normalizeRelated(raw);
      if (!norm) continue;
      const to = resolveId(norm, noteIds, toolIds);
      if (to) addEdge(from, to);
    }
  }

  // Soft-link same-tag nodes lightly if still isolated (optional connectivity)
  // Skip — keep edges intentional from related frontmatter only.

  return { nodes, edges };
}
