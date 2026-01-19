import { WBSNode, IWBSLayoutStrategy } from '../interfaces/WBS';

/**
 * Strategy for hierarchical WBS layout
 * Organizes nodes in a tree structure
 */
export class WBSLayoutStrategy implements IWBSLayoutStrategy {
  private readonly NODE_WIDTH = 160;
  private readonly NODE_HEIGHT = 80;
  private readonly HORIZONTAL_GAP = 40;
  private readonly VERTICAL_GAP = 60;

  public calculateLayout(nodes: WBSNode[]): WBSNode[] {
    const rootNodes = nodes.filter(node => !node.parentId);
    if (rootNodes.length === 0) return nodes;

    const updatedNodes = nodes.map(n => ({ ...n }));
    let currentX = 50;

    rootNodes.forEach(root => {
      const subtreeWidth = this.calculateSubtreeWidth(root, updatedNodes);
      this.positionNode(root, currentX + subtreeWidth / 2 - this.NODE_WIDTH / 2, 50, updatedNodes);
      currentX += subtreeWidth + this.HORIZONTAL_GAP;
    });

    return updatedNodes;
  }

  /**
   * Calculates the total width required for a subtree
   */
  private calculateSubtreeWidth(node: WBSNode, allNodes: WBSNode[]): number {
    if (!node.isExpanded) return this.NODE_WIDTH;

    const children = allNodes.filter(n => n.parentId === node.id);
    if (children.length === 0) return this.NODE_WIDTH;

    let totalWidth = 0;
    children.forEach(child => {
      totalWidth += this.calculateSubtreeWidth(child, allNodes);
    });

    totalWidth += (children.length - 1) * this.HORIZONTAL_GAP;
    return Math.max(this.NODE_WIDTH, totalWidth);
  }

  /**
   * Recursively positions nodes in the tree
   */
  private positionNode(node: WBSNode, x: number, y: number, allNodes: WBSNode[]): void {
    const targetNode = allNodes.find(n => n.id === node.id);
    if (targetNode) {
      targetNode.x = x;
      targetNode.y = y;
      targetNode.width = this.NODE_WIDTH;
      targetNode.height = this.NODE_HEIGHT;
    }

    if (!node.isExpanded) return;

    const children = allNodes.filter(n => n.parentId === node.id);
    if (children.length === 0) return;

    const subtreeWidth = this.calculateSubtreeWidth(node, allNodes);
    let childX = x - subtreeWidth / 2 + this.NODE_WIDTH / 2;
    const childY = y + this.NODE_HEIGHT + this.VERTICAL_GAP;

    children.forEach(child => {
      const childSubtreeWidth = this.calculateSubtreeWidth(child, allNodes);
      this.positionNode(child, childX + childSubtreeWidth / 2 - this.NODE_WIDTH / 2, childY, allNodes);
      childX += childSubtreeWidth + this.HORIZONTAL_GAP;
    });
  }
}


