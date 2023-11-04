import { CheckCircleTwoTone, WarningTwoTone } from "@ant-design/icons"
import { Spin } from "antd"
import dagre from "dagre"
import ReactFlow, { Edge, MiniMap, Node, NodeTypes, Panel, ReactFlowProvider, useUpdateNodeInternals } from "reactflow"
import "reactflow/dist/style.css"
import { useFarmConfigStore } from "../domain/farmConfigStore"
import { ItemStatus, RecipeStatus } from "../domain/farmConfigSolver"
import BuildingList from "./buildingList"
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
  const answer = useFarmConfigStore((state) => state.solution)
  const isSolverRunning = useFarmConfigStore((state) => state.isSolverRunning)
  const feasible = useFarmConfigStore((state) => state.feasible)
  const updateNode = useUpdateNodeInternals()

  const graph = new dagre.graphlib.Graph()
  graph.setGraph({ rankdir: "LR" })
  graph.setDefaultEdgeLabel(() => ({}))

  const itemNodes: Node[] = []
  answer?.itemStatus.forEach((itemResult, itemName) => {
    graph.setNode(
      itemName,
      { width: ItemResultNodeWidth, height: ItemResultNodeHeight }
    )
    itemNodes.push(createItemNode(itemResult))
  })

  const recipeNodes: Node[] = []
  const edges: Edge[] = []
  answer?.recipeStatus.forEach((recipeResult, recipeName) => {
    graph.setNode(
      recipeName,
      { width: RecipeResultNodeWidth, height: RecipeResultNodeHeight }
    )
    recipeNodes.push(createRecipeNode(recipeResult))
    recipeResult.recipeSpec.products.forEach((amount, name) => {
      graph.setEdge(recipeName, name)
      edges.push({
        id: `${recipeName} - ${name}`,
        source: recipeName, target: name
      })
    })
    recipeResult.recipeSpec.ingredients.forEach((amount, name) => {
      graph.setEdge(name, recipeName)
      edges.push({
        id: `${name} - ${recipeName}`,
        source: name, target: recipeName
      })
    })
  })

  dagre.layout(graph)

  const nodes = [...itemNodes, ...recipeNodes]
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
      <Panel position="bottom-left">
        <BuildingList nodes={recipeNodes} />
      </Panel>
      <Panel position="bottom-right">
        {status}
      </Panel>
    </ReactFlow>
  )
}

function createItemNode(itemResult: ItemStatus): Node<ItemStatus> {
  return {
    id: itemResult.itemSpec.name, type: "itemResult",
    position: { x: 0, y: 0 }, data: itemResult
  }
}

function createRecipeNode(recipeResult: RecipeStatus): Node<RecipeStatus> {
  return {
    id: recipeResult.recipeSpec.name, type: "recipeResult",
    position: { x: 0, y: 0 }, data: recipeResult
  }
}
