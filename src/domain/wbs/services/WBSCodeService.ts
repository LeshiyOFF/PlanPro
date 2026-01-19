import { WBSNode } from '../interfaces/WBS';

/**
 * Service for calculating hierarchical WBS codes
 * Following SOLID: Single Responsibility Principle
 */
export class WBSCodeService {
  /**
   * Calculates and assigns WBS codes to nodes based on their parent-child relationships
   */
  public static calculateCodes(nodes: WBSNode[]): WBSNode[] {
    const rootNodes = nodes.filter(node => !node.parentId);
    const updatedNodes = [...nodes];
    
    rootNodes.forEach((root, index) => {
      const code = (index + 1).toString();
      this.assignCodeRecursively(root, code, updatedNodes);
    });

    return updatedNodes;
  }

  /**
   * Recursively assigns codes to child nodes
   */
  private static assignCodeRecursively(node: WBSNode, code: string, allNodes: WBSNode[]): void {
    node.wbsCode = code;
    
    const children = allNodes.filter(n => n.parentId === node.id);
    children.forEach((child, index) => {
      const childCode = `${code}.${index + 1}`;
      this.assignCodeRecursively(child, childCode, allNodes);
    });
  }
}

