/* Graph Oid
  **********/

import { html, Oid, OidUI }  from '/lib/foundation/oidlib-dev.js'
import { GraphNode } from './node.js'
import { GraphEdge } from './edge.js'
import { Graph } from './graph.js'

export class GraphOid extends OidUI {
  async connectedCallback () {
    await super.connectedCallback()

    this._graph = new Graph(this, this.label,
      this.layout, this.action, this._bus)

    // applies a pending import graph
    if (this._graphObj) {
      this._graph.importGraph(this._graphObj)
      this._graphObj = undefined
    } else
      this._callCustom('graph')

    this._presentation.appendChild(this._graph.presentation)
  }

  /* Non-observed Properties
      ***********************/

  get graph () {
    return this._graph
  }

  get graphWidth () {
    return this._presentation.getAttribute('width')
  }

  set graphWidth (newValue) {
    this._presentation.setAttribute('width', newValue)
  }

  get graphHeight () {
    return this._presentation.getAttribute('height')
  }

  set graphHeight (newValue) {
    this._presentation.setAttribute('height', newValue)
  }

  /*****/

  addPiece (type, piece) {
    this._graph.addPiece(type, piece)
  }

  importGraph (graphObj) {
    if (this._graph != null) {
      this._graph.importGraph(graphObj)
    } else {
      this._graphObj = graphObj
    }
  }

  /*
   * Event Handlers
    ****************/

  handleAddNode (topic, message) {
    this._graph.addPiece('node', new GraphNode(message))
  }

  handleAddEdge (topic, message) {
    this._graph.addPiece('edge', GraphEdge.create(message, this._graph))
  }

  handleClearGraph () {
    this._graph.clearGraph()
  }
}

Oid.component({
  id: 'goid:graph',
  element: 'graph-oid',
  properties: {
    label: {default: 'Graph'},
    width: {default: 300},
    height: {default: 200},
    layout: {},
    action: {}
  },
  receive: {
    'node/add': 'handleAddNode',
    'edge/add': 'handleAddEdge',
    'graph/clear': 'handleClearGraph'
  },
  implementation: GraphOid,
  stylesheets: 'stylesheets:oid-graph.css',
  template: html`
  <div id="graph-wrapper">
    <svg id="oid-prs" width="{{this.width}}" height="{{this.height}}" xmlns="http://www.w3.org/2000/svg">
    </svg>
  </div>`
})