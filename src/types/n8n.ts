export interface N8nNode {
  id: string
  name: string
  type: string
  position: [number, number]
}

export interface N8nWorkflow {
  name: string
  nodes: N8nNode[]
  connections: Record<string, { main: Array<Array<{ node: string; type: string; index: number }>> }>
}

export interface DiagramNode {
  id: string
  name: string
  shortType: string
  color: string
  x: number
  y: number
}

export interface DiagramEdge {
  from: string
  to: string
}

export interface DiagramData {
  name: string
  nodes: DiagramNode[]
  edges: DiagramEdge[]
}
