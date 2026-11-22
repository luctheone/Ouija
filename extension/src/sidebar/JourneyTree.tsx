interface GraphNode {
  id: string;
  site: string;
  instruction: string;
}

interface Fork {
  at: string;
  branch: GraphNode[];
  deadEnd: boolean;
}

interface JourneyGraph {
  nodes: GraphNode[];
  edges: { from: string; to: string }[];
}

interface Props {
  graph: JourneyGraph;
  position: string;
  forks?: Fork[];
}

export default function JourneyTree({ graph, position, forks = [] }: Props) {
  const posIndex = graph.nodes.findIndex((n) => n.id === position);
  const forkNodeIds = new Set(forks.map((f) => f.at));

  return (
    <div className="ouija-tree">
      {graph.nodes.map((node, i) => {
        const status = forkNodeIds.has(node.id)
          ? 'error'
          : i < posIndex
          ? 'done'
          : i === posIndex
          ? 'current'
          : 'future';
        const fork = forks.find((f) => f.at === node.id);
        const isLast = i === graph.nodes.length - 1;

        return (
          <div key={node.id} className="ouija-tree__row">
            <div className="ouija-tree__col">
              <div className={`ouija-tree__dot ouija-tree__dot--${status}`} />
              {!isLast && <div className={`ouija-tree__line ouija-tree__line--${status === 'done' ? 'done' : 'future'}`} />}
            </div>
            <div className="ouija-tree__content">
              <span className={`ouija-tree__label ouija-tree__label--${status}`}>
                {node.instruction}
              </span>
              <span className="ouija-tree__site">{node.site}</span>
              {fork && (
                <div className="ouija-tree__fork">
                  {fork.branch.map((fn) => (
                    <div key={fn.id} className="ouija-tree__fork-node">
                      <div className="ouija-tree__dot ouija-tree__dot--fork" />
                      <span className="ouija-tree__fork-label">{fn.instruction}</span>
                    </div>
                  ))}
                  {fork.deadEnd && <span className="ouija-tree__dead">✕ dead end</span>}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
