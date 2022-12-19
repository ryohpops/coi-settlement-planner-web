import {
  applyEdgeChanges, applyNodeChanges, Edge,
  EdgeChange,
  Node,
  NodeChange, OnEdgesChange, OnNodesChange
} from 'reactflow';
import create from 'zustand';

const initialNodes: Node[] = [
  {
    id: '1',
    type: 'input',
    data: { label: 'Input' },
    position: { x: 250, y: 25 },
  },

  {
    id: '2',
    data: { label: 'Default' },
    position: { x: 100, y: 125 },
  },
  {
    id: '3',
    type: 'output',
    data: { label: 'Output' },
    position: { x: 250, y: 250 },
  },
]
const initialEdges: Edge[] = [
  { id: 'e1-2', source: '1', target: '2' },
  { id: 'e2-3', source: '2', target: '3' },
]

type RFState = {
  nodes: Node[];
  edges: Edge[];
  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
};

const useStore = create<RFState>()((set, get) => ({
  nodes: initialNodes,
  edges: initialEdges,
  onNodesChange: (changes: NodeChange[]) => {
    set({
      nodes: applyNodeChanges(changes, get().nodes),
    });
  },
  onEdgesChange: (changes: EdgeChange[]) => {
    set({
      edges: applyEdgeChanges(changes, get().edges),
    });
  }
}));

export default useStore;
