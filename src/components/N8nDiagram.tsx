'use client'

import { useEffect, useRef } from 'react'
import type { DiagramData } from '@/types/n8n'

const NODE_W = 90
const NODE_H = 36

function edgePath(x1: number, y1: number, x2: number, y2: number): string {
  const cx = (x1 + x2) / 2
  return `M ${x1},${y1} C ${cx},${y1} ${cx},${y2} ${x2},${y2}`
}

interface Props {
  diagram: DiagramData
}

export default function N8nDiagram({ diagram }: Props) {
  const svgRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    const paths = svgRef.current?.querySelectorAll<SVGPathElement>('.edge-path')
    paths?.forEach((path) => {
      const len = path.getTotalLength()
      path.style.setProperty('--path-length', String(len))
      path.style.strokeDasharray = String(len)
      path.style.strokeDashoffset = String(len)
    })
  }, [diagram])

  const nodeMap = Object.fromEntries(diagram.nodes.map((n) => [n.id, n]))

  return (
    <div className="rounded-[24px] border border-white/10 bg-[#0b0b0b] p-6 overflow-hidden">
      <div className="mb-4">
        <p className="text-xs text-white/40 uppercase tracking-widest mb-1">Workflow</p>
        <h4 className="text-lg font-semibold">{diagram.name}</h4>
      </div>
      <svg
        ref={svgRef}
        viewBox="0 0 800 300"
        className="w-full h-auto"
        style={{ maxHeight: 220 }}
      >
        {/* Edges */}
        {diagram.edges.map((edge, i) => {
          const from = nodeMap[edge.from]
          const to = nodeMap[edge.to]
          if (!from || !to) return null
          const x1 = from.x + NODE_W / 2
          const y1 = from.y + NODE_H / 2
          const x2 = to.x - NODE_W / 2
          const y2 = to.y + NODE_H / 2
          return (
            <path
              key={`${edge.from}-${edge.to}-${i}`}
              className="edge-path"
              d={edgePath(x1, y1, x2, y2)}
              stroke="rgba(249,115,22,0.4)"
              strokeWidth="1.5"
              fill="none"
              style={{
                animation: `drawEdge 0.7s ease-out ${i * 120}ms forwards`,
              }}
            />
          )
        })}

        {/* Nodes */}
        {diagram.nodes.map((node) => (
          <g key={node.id} transform={`translate(${node.x - NODE_W / 2}, ${node.y - NODE_H / 2})`}>
            <rect
              width={NODE_W}
              height={NODE_H}
              rx={8}
              fill={node.color + '22'}
              stroke={node.color + '66'}
              strokeWidth="1"
            />
            <text
              x={NODE_W / 2}
              y={NODE_H / 2 - 4}
              textAnchor="middle"
              fill="rgba(255,255,255,0.9)"
              fontSize="8"
              fontFamily="inherit"
              fontWeight="600"
            >
              {node.shortType}
            </text>
            <text
              x={NODE_W / 2}
              y={NODE_H / 2 + 7}
              textAnchor="middle"
              fill="rgba(255,255,255,0.45)"
              fontSize="6.5"
              fontFamily="inherit"
            >
              {node.name}
            </text>
          </g>
        ))}
      </svg>
    </div>
  )
}
