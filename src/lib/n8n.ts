import type { N8nWorkflow, DiagramData, DiagramNode, DiagramEdge } from '@/types/n8n'

const NODE_COLORS: Record<string, string> = {
  webhook: '#22c55e',
  httpRequest: '#3b82f6',
  openAi: '#a855f7',
  anthropic: '#f97316',
  telegram: '#38bdf8',
  google: '#facc15',
  set: '#64748b',
  if: '#f59e0b',
  splitInBatches: '#6366f1',
  function: '#ec4899',
  code: '#ec4899',
  default: '#6b7280',
}

function getNodeColor(type: string): string {
  const key = Object.keys(NODE_COLORS).find((k) => type.toLowerCase().includes(k.toLowerCase()))
  return key ? NODE_COLORS[key] : NODE_COLORS.default
}

function getShortType(type: string): string {
  const part = type.split('.').pop() ?? type
  if (part.includes('Http')) return 'HTTP'
  if (part.includes('Webhook')) return 'Webhook'
  if (part.includes('Telegram')) return 'Telegram'
  if (part.includes('openAi') || part.includes('OpenAi')) return 'OpenAI'
  if (part.includes('anthropic') || part.includes('Anthropic')) return 'Claude'
  if (part.includes('Google')) return 'Google'
  if (part.includes('If')) return 'IF'
  if (part.includes('Code') || part.includes('Function')) return 'Code'
  if (part.includes('Set')) return 'Set'
  return part.replace(/([A-Z])/g, ' $1').trim().slice(0, 8)
}

export function parseWorkflow(workflow: N8nWorkflow): DiagramData {
  if (!workflow.nodes?.length) return { name: workflow.name, nodes: [], edges: [] }

  const positions = workflow.nodes.map((n) => n.position)
  const minX = Math.min(...positions.map((p) => p[0]))
  const minY = Math.min(...positions.map((p) => p[1]))
  const maxX = Math.max(...positions.map((p) => p[0]))
  const maxY = Math.max(...positions.map((p) => p[1]))
  const rangeX = maxX - minX || 1
  const rangeY = maxY - minY || 1

  const VIEW_W = 760
  const VIEW_H = 340
  const PADDING = 60

  const nodes: DiagramNode[] = workflow.nodes.map((n) => ({
    id: n.name,
    name: n.name.length > 14 ? n.name.slice(0, 12) + '…' : n.name,
    shortType: getShortType(n.type),
    color: getNodeColor(n.type),
    x: PADDING + ((n.position[0] - minX) / rangeX) * (VIEW_W - PADDING * 2),
    y: PADDING + ((n.position[1] - minY) / rangeY) * (VIEW_H - PADDING * 2),
  }))

  const edges: DiagramEdge[] = []
  for (const [fromName, outputs] of Object.entries(workflow.connections ?? {})) {
    for (const outputGroup of outputs.main ?? []) {
      for (const conn of outputGroup ?? []) {
        edges.push({ from: fromName, to: conn.node })
      }
    }
  }

  return { name: workflow.name, nodes, edges }
}
