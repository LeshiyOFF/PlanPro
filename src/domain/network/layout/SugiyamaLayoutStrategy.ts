import { NetworkNode, NetworkConnection, NetworkLayoutStrategy } from '../interfaces/NetworkDiagram';

/**
 * Professional hierarchical layout strategy for Network Diagram (Sugiyama-style)
 * Organizes nodes into layers based on dependencies to minimize crossing and maximize clarity
 */
export class SugiyamaLayoutStrategy implements NetworkLayoutStrategy {
  private readonly NODE_WIDTH = 180;
  private readonly NODE_HEIGHT = 80;
  private readonly HORIZONTAL_GAP = 60;
  private readonly VERTICAL_GAP = 40;

  public calculateLayout(nodes: NetworkNode[], connections: NetworkConnection[]): NetworkNode[] {
    if (nodes.length === 0) return [];

    // 1. Assign layers (ranks) based on longest path from start
    const nodeLayers = this.assignLayers(nodes, connections);
    
    // 2. Group nodes by layer for vertical positioning
    const layerGroups = new Map<number, string[]>();
    nodeLayers.forEach((layer, nodeId) => {
      if (!layerGroups.has(layer)) layerGroups.set(layer, []);
      layerGroups.get(layer)!.push(nodeId);
    });

    // 3. Position nodes based on their layer and index within layer
    return nodes.map(node => {
      // If node is pinned, we respect its current position (unless it's 0,0)
      if (node.isPinned && (node.x !== 0 || node.y !== 0)) {
        return node;
      }

      const layer = nodeLayers.get(node.id) || 0;
      const nodesInLayer = layerGroups.get(layer) || [];
      const indexInLayer = nodesInLayer.indexOf(node.id);

      return {
        ...node,
        x: 50 + layer * (this.NODE_WIDTH + this.HORIZONTAL_GAP),
        y: 50 + indexInLayer * (this.NODE_HEIGHT + this.VERTICAL_GAP),
        width: this.NODE_WIDTH,
        height: this.NODE_HEIGHT
      };
    });
  }

  /**
   * Assigns each node to a layer based on its longest path from start
   */
  private assignLayers(nodes: NetworkNode[], connections: NetworkConnection[]): Map<string, number> {
    const nodeLayers = new Map<string, number>();
    
    // Initialize nodes with no predecessors to layer 0
    nodes.forEach(node => {
      const hasPredecessor = connections.some(c => c.toId === node.id);
      if (!hasPredecessor) {
        nodeLayers.set(node.id, 0);
      }
    });

    // Iteratively assign layers to other nodes
    let changed = true;
    let iterations = 0;
    const maxIterations = nodes.length * 2; // Prevent infinite loops in case of cycles

    while (changed && iterations < maxIterations) {
      changed = false;
      iterations++;
      connections.forEach(conn => {
        const fromLayer = nodeLayers.get(conn.fromId);
        if (fromLayer !== undefined) {
          const currentToLayer = nodeLayers.get(conn.toId);
          const nextLayer = fromLayer + 1;
          if (currentToLayer === undefined || nextLayer > currentToLayer) {
            nodeLayers.set(conn.toId, nextLayer);
            changed = true;
          }
        }
      });
    }

    // Assign any remaining unassigned nodes to layer 0 or next available
    nodes.forEach(node => {
      if (!nodeLayers.has(node.id)) {
        nodeLayers.set(node.id, 0);
      }
    });

    return nodeLayers;
  }
}

