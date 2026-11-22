'use client';

import { useState } from 'react';
import type { JourneyGraph, Fork } from '@ouija/types';

interface JourneyTreeProps {
  graph: JourneyGraph;
  position: string;
  forks?: Fork[];
  compact?: boolean;
  showLabels?: boolean;
}

type NodeStatus = 'done' | 'current' | 'future' | 'error';

export default function JourneyTree({
  graph,
  position,
  forks = [],
  compact = false,
  showLabels = false,
}: JourneyTreeProps) {
  const posIndex = graph.nodes.findIndex((n) => n.id === position);
  const forkNodeIds = new Set(forks.map((f) => f.at));
  const [hovered, setHovered] = useState<string | null>(null);

  function getNodeStatus(index: number): NodeStatus {
    if (forkNodeIds.has(graph.nodes[index].id)) return 'error';
    if (index < posIndex) return 'done';
    if (index === posIndex) return 'current';
    return 'future';
  }

  return (
    <div className={`journey-tree ${compact ? 'journey-tree--compact' : ''}`}>
      {graph.nodes.map((node, i) => {
        const status = getNodeStatus(i);
        const fork = forks.find((f) => f.at === node.id);
        const isLast = i === graph.nodes.length - 1;
        const lineStatus = status === 'done' ? 'done' : status === 'current' ? 'current' : 'future';

        return (
          <div
            key={node.id}
            className={`journey-tree__row journey-tree__row--${status} ${hovered === node.id ? 'is-hovered' : ''}`}
            style={{ animationDelay: `${Math.min(i, 12) * 40}ms` }}
            onMouseEnter={() => setHovered(node.id)}
            onMouseLeave={() => setHovered((h) => (h === node.id ? null : h))}
          >
            {/* Main node */}
            <div className="journey-tree__node-col">
              <div className={`journey-tree__dot journey-tree__dot--${status}`}>
                {status === 'done' && (
                  <svg className="journey-tree__check" viewBox="0 0 10 10" aria-hidden>
                    <path d="M2.2 5.2 l1.7 1.7 3.9-4" fill="none" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
                {status === 'current' && <span className="journey-tree__pulse" aria-hidden />}
                {status === 'error' && <span className="journey-tree__bang" aria-hidden>!</span>}
              </div>
              {!isLast && (
                <div className={`journey-tree__line journey-tree__line--${lineStatus}`} />
              )}
            </div>

            {/* Label */}
            {showLabels && (
              <div className="journey-tree__label">
                <span className="journey-tree__step-no">{i + 1}</span>
                <span className={`journey-tree__label-text journey-tree__label-text--${status}`}>
                  {node.instruction}
                </span>
                {node.site && (
                  <span className="journey-tree__label-site">{node.site}</span>
                )}
              </div>
            )}

            {/* Fork branch */}
            {fork && (
              <div className="journey-tree__fork">
                <div className="journey-tree__fork-connector" />
                <div className="journey-tree__fork-branch">
                  <span className="journey-tree__fork-tag">BREAKPOINT</span>
                  {fork.branch.map((forkNode, fi) => (
                    <div key={forkNode.id} className="journey-tree__fork-node">
                      <div className={`journey-tree__dot journey-tree__dot--error-branch ${fork.deadEnd && fi === fork.branch.length - 1 ? 'journey-tree__dot--dead-end' : ''}`} />
                      {showLabels && (
                        <span className="journey-tree__fork-label">{forkNode.instruction}</span>
                      )}
                    </div>
                  ))}
                  {fork.deadEnd && (
                    <div className="journey-tree__dead-end-mark">✕ dead end</div>
                  )}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
