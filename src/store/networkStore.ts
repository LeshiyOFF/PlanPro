import { create } from 'zustand';
import { NetworkNode, NetworkConnection } from '../domain/network/interfaces/NetworkDiagram';

interface NetworkStore {
  nodes: NetworkNode[];
  connections: NetworkConnection[];
  initialized: boolean;
  
  setNodes: (nodes: NetworkNode[]) => void;
  setConnections: (connections: NetworkConnection[]) => void;
  updateNode: (nodeId: string, updates: Partial<NetworkNode>) => void;
  addNode: (node: NetworkNode) => void;
  setInitialized: (initialized: boolean) => void;
  reset: () => void;
}

export const useNetworkStore = create<NetworkStore>((set) => ({
  nodes: [],
  connections: [],
  initialized: false,

  setNodes: (nodes) => set({ nodes }),
  setConnections: (connections) => set({ connections }),
  
  updateNode: (nodeId, updates) => set((state) => ({
    nodes: state.nodes.map(node => node.id === nodeId ? { ...node, ...updates } : node)
  })),

  addNode: (node) => set((state) => ({
    nodes: [...state.nodes, node]
  })),

  setInitialized: (initialized) => set({ initialized }),

  reset: () => set({ nodes: [], connections: [], initialized: false })
}));

