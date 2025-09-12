export interface Node {
  id: string;
  label: string;
  position: { x: number; y: number };
}

export interface Edge {
  id: string;
  source: string; // Node ID
  target: string; // Node ID
}

export interface DiagramProperties {
  id: string;
  nodes?: Node[];
  edges?: Edge[];
}

export class Diagram {
  public id: string;
  public nodes: Node[];
  public edges: Edge[];

  constructor(props: DiagramProperties) {
    this.id = props.id;
    this.nodes = props.nodes || [];
    this.edges = props.edges || [];
  }

  /**
   * Adds a node to the diagram.
   * @param node The node to add.
   */
  public addNode(node: Node): void {
    if (!this.nodes.find(n => n.id === node.id)) {
      this.nodes.push(node);
    }
  }

  /**
   * Adds an edge to the diagram.
   * @param edge The edge to add.
   */
  public addEdge(edge: Edge): void {
    if (!this.edges.find(e => e.id === edge.id)) {
      this.edges.push(edge);
    }
  }

  /**
   * Placeholder for an auto-layout algorithm.
   */
  public autoLayout(): void {
    console.log(`Applying auto-layout to diagram ${this.id}`);
    // In a real app, this would contain complex graph layout logic (e.g., force-directed).
    this.nodes.forEach((node, index) => {
      node.position = { x: index * 150, y: 100 };
    });
  }
}
