import { CheckCircleTwoTone, WarningTwoTone } from "@ant-design/icons"
import { Spin } from "antd"
import dagre from "dagre"
import ReactFlow, { Edge, MiniMap, Node, NodeTypes, Panel, ReactFlowProvider, useUpdateNodeInternals } from "reactflow"
import "reactflow/dist/style.css"
import { useProblemStore } from "../domain/problemStore"
import { ItemResult, RecipeResult } from "../domain/solver"
import ItemResultNode, { ItemResultNodeHeight, ItemResultNodeWidth } from "./itemResultNode"
import RecipeResultNode, { RecipeResultNodeHeight, RecipeResultNodeWidth } from "./recipeResultNode"

const nodeTypes: NodeTypes = {
  itemResult: ItemResultNode,
  recipeResult: RecipeResultNode
}

export default function PlanDisplay() {
  return (
    <ReactFlowProvider>
      <PlanDisplayInternal />
    </ReactFlowProvider>
  )
}

function PlanDisplayInternal() {
  const answer = useProblemStore((state) => state.answer)
  const isSolverRunning = useProblemStore((state) => state.isSolverRunning)
  const feasible = useProblemStore((state) => state.feasible)
  const updateNode = useUpdateNodeInternals()

  const graph = new dagre.graphlib.Graph()
  graph.setGraph({ rankdir: "LR" })
  graph.setDefaultEdgeLabel(() => ({}))

  const nodes: Node[] = []
  const edges: Edge[] = []
  answer?.itemResults.forEach((itemResult, itemName) => {
    graph.setNode(
      itemName,
      { width: ItemResultNodeWidth, height: ItemResultNodeHeight }
    )
    nodes.push(createItemNode(itemResult))
  })
  answer?.recipeResults.forEach((recipeResult, recipeName) => {
    graph.setNode(
      recipeName,
      { width: RecipeResultNodeWidth, height: RecipeResultNodeHeight }
    )
    nodes.push(createRecipeNode(recipeResult))
    recipeResult.recipe.products.forEach((amount, name) => {
      graph.setEdge(recipeName, name)
      edges.push({
        id: `${recipeName} - ${name}`,
        source: recipeName, target: name
      })
    })
    recipeResult.recipe.ingredients.forEach((amount, name) => {
      graph.setEdge(name, recipeName)
      edges.push({
        id: `${name} - ${recipeName}`,
        source: name, target: recipeName
      })
    })
  })

  dagre.layout(graph)

  nodes.forEach((node) => {
    const graphNode = graph.node(node.id)
    node.position.x = graphNode.x - graphNode.width / 2
    node.position.y = graphNode.y - graphNode.height / 2
    updateNode(node.id)
  })

  let status: JSX.Element
  if (isSolverRunning) {
    status = <Spin />
  } else {
    if (feasible) {
      status = <CheckCircleTwoTone />
    } else {
      status = <WarningTwoTone />
    }
  }

  return (
    <ReactFlow nodes={nodes} edges={edges} nodeTypes={nodeTypes} fitView>
      <MiniMap pannable zoomable position="top-right" />
      <Panel position="bottom-right">
        {status}
      </Panel>
    </ReactFlow>
  )
}

function createItemNode(itemResult: ItemResult): Node<ItemResult> {
  return {
    id: itemResult.item.name, type: "itemResult",
    position: { x: 0, y: 0 }, data: itemResult
  }
}

function createRecipeNode(recipeResult: RecipeResult): Node<RecipeResult> {
  return {
    id: recipeResult.recipe.name, type: "recipeResult",
    position: { x: 0, y: 0 }, data: recipeResult
  }
}
