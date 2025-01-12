/* The root of an SVG graph
 **************************/

import { GraphNode } from './node'
import { GraphEdge } from './edge'
import { GraphLayout } from './layout'

export class Graph {
  constructor (container, label, layout, action, bus) {
    this._container = container
    this._label = label
    this._action = action
    this._bus = bus

    this.clearGraph()

    this._presentation = document.createElementNS('http://www.w3.org/2000/svg', 'g')
    this._layout = GraphLayout.create(layout)
    this._layout.attach(this)
  }

  get label () {
    return this._label
  }

  set label (newValue) {
    this._label = newValue
  }

  get width () {
    return this._container.graphWidth
  }

  set width (newValue) {
    this._container.graphWidth = newValue
  }

  get height () {
    return this._container.graphHeight
  }

  set height (newValue) {
    this._container.graphHeight = newValue
  }

  get nodes () {
    return this._nodes
  }

  get edges () {
    return this._edges
  }

  get action () {
    return this._action
  }

  set action (newValue) {
    this._action = action
  }

  addPiece (type, piece) {
    this[`_${type}s`].push(piece)
    if (piece.presentation != null) {
      this._presentation.appendChild(piece.presentation)
      if (this._action && type === 'node') {
        piece.action = this._action
        piece.bus = this._bus
      }
    }
    if (this._layout != null) { this._layout.organize() }
  }

  clearGraph () {
    if (this._nodes)
      for (let n of this._nodes)
        if (n.presentation != null)
          this._presentation.removeChild(n.presentation)
    if (this._edges)
      for (let e of this._edges)
        if (e.presentation != null)
          this._presentation.removeChild(e.presentation)
    this._nodes = []
    this._edges = []
  }

  importGraph (graphObj) {
    for (const node of graphObj.nodes) {
      const gnode = new GraphNode(node)
      if (node.graph) {
        gnode.graph = new Graph(gnode, node.label,
          this._layout.label, this._action, this._bus)
        gnode.graph.importGraph(node.graph)
      }
      this.addPiece('node', gnode)
    }
    for (const edge of graphObj.edges) {
      this.addPiece('edge', GraphEdge.create(edge, this))
    }
  }

  get presentation () {
    return this._presentation
  }

  get labelHeight () {
    return (this._label != null)
      ? GraphLayout.parameters['node-label-height'] : 0
  }
}

