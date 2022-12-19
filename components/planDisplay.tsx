import ReactFlow from "reactflow";
import "reactflow/dist/style.css";
import useStore from "./store";

const PlanDisplay = () => {
  const store = useStore();
  return (
    <ReactFlow
      nodes={store.nodes}
      edges={store.edges}
      onNodesChange={store.onNodesChange}
      onEdgesChange={store.onEdgesChange}
      fitView
    />
  )
}

export default PlanDisplay;
