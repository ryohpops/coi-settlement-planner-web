import dagre from "dagre"
import ReactFlow, { Edge, Node, NodeTypes, Position } from "reactflow"
import "reactflow/dist/style.css"
import { useProblemStore } from "../domain/problemStore"
import { ItemResult } from "../domain/solver"
import ItemResultNode, { ItemResultNodeHeight, ItemResultNodeWidth } from "./itemResultNode"

const nodeTypes: NodeTypes = {
  itemResult: ItemResultNode
}

export default function PlanDisplay() {
  const answer = useProblemStore((state) => state.answer)

  const graph = new dagre.graphlib.Graph()
  graph.setGraph({ rankdir: "LR" })
  graph.setDefaultEdgeLabel(() => ({}))

  const nodes: Node[] = []
  const edges: Edge[] = []
  answer.itemResults.forEach((itemResult, itemName) => {
    graph.setNode(itemName, { width: ItemResultNodeWidth, height: ItemResultNodeHeight })
    nodes.push(createItemNode(itemResult))
  })
  answer.recipeResults.forEach((recipeResult, recipeName) => {
    const recipeNodeName = recipeName + " Recipe"
    graph.setNode(recipeNodeName, { width: ItemResultNodeWidth, height: ItemResultNodeHeight })
    nodes.push(createNode(recipeNodeName))
    recipeResult.recipe.products.forEach((amount, name) => {
      graph.setEdge(name, recipeNodeName)
      edges.push({ id: `${name} - ${recipeNodeName}`, source: name, target: recipeNodeName })
    })
    recipeResult.recipe.ingredients.forEach((amount, name) => {
      graph.setEdge(recipeNodeName, name)
      edges.push({ id: `${recipeNodeName} - ${name}`, source: recipeNodeName, target: name })
    })
  })

  dagre.layout(graph)

  nodes.forEach((node) => {
    const graphNode = graph.node(node.id)
    node.position.x = graphNode.x - graphNode.width / 2
    node.position.y = graphNode.y - graphNode.height / 2
  })

  return (
    <ReactFlow nodes={nodes} edges={edges} nodeTypes={nodeTypes} fitView />
  )
}

function createNode(name: string): Node {
  return {
    id: name, position: { x: 0, y: 0 }, data: { label: name },
    sourcePosition: Position.Right, targetPosition: Position.Left
  }
}

function createItemNode(itemResult: ItemResult): Node<ItemResult> {
  return {
    id: itemResult.item.name, type: "itemResult", position: { x: 0, y: 0 }, data: itemResult,
    sourcePosition: Position.Right, targetPosition: Position.Left
  }
}
