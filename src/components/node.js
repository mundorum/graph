/* A node in an SVG graph
 ************************/

import { Bus } from '/lib/oidlib-dev.js'
import { GraphPiece } from './piece'

export class GraphNode extends GraphPiece {
  constructor (node) {
    super()
    this._node = {}
    Object.assign(this._node, node)

    if (node.width == null)
      this._node.width =
        (node.label && node.label.length * 10 + 20 > GraphNode.standardDimensions.width)
          ? node.label.length * 10 + 20 : GraphNode.standardDimensions.width

    this._nodeClicked = this._nodeClicked.bind(this)
    this._nodeUnselect = this._nodeUnselect.bind(this)
    this._showContextMenu = this._showContextMenu.bind(this)  // <TODO> handle context menu

    this._bus = Bus.i

    this._presentation =
         document.createElementNS('http://www.w3.org/2000/svg', 'g')
    this._rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
    this._rect.setAttribute('rx', 10)  // <TODO> make customizable
    this._setDimensions(this._rect)
    this._rect.classList.add('node')
    if (node.format != null)
      this._rect.classList.add(`node-${node.format}`)
    this._presentation.appendChild(this._rect)

    if (node.label != null) {
      this._contentSpace = document.createElementNS(
        'http://www.w3.org/2000/svg', 'foreignObject')
      this._setDimensions(this._contentSpace)
      this._label = document.createElement('div')
      this._label.style = `width:${this._node.width}px;height:${this._node.height}px`
      const tf = (node.format != null) ? ` node-primary-${node.format}` : ''
      this._label.innerHTML = `<div class="node-title node-primary${tf}">${node.label}</div>`
      this._contentSpace.appendChild(this._label)
      this._presentation.appendChild(this._contentSpace)
    }

    this._cover = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
    this._cover.setAttribute('rx', 10)  // <TODO> make customizable
    this._setDimensions(this._cover)
    this._cover.classList.add('node-cover')
    this._presentation.appendChild(this._cover)

    this._presentation.addEventListener('contextmenu', this._showContextMenu)

    this._setPosition()
  }

  get id () {
    return this._node.id
  }

  get x () {
    return this._node.x
  }

  set x (newValue) {
    this._node.x = newValue
    this._setPosition()
  }

  get y () {
    return this._node.y
  }

  set y (newValue) {
    this._node.y = newValue
    this._setPosition()
  }

  get width () {
    return this._node.width
  }

  set width (newValue) {
    this._graphAttr('width', newValue)
  }

  get height () {
    return this._node.height
  }

  set height (newValue) {
    this._graphAttr('height', newValue)
  }

  get action () {
    return this._action
  }

  set action (newValue) {
    this._action = newValue
    this._presentation.style.cursor = 'pointer'
    this._presentation.addEventListener('click', this._nodeClicked)
  }

  get bus () {
    return this._bus
  }

  set bus (newValue) {
    this._bus = newValue
  }

  get graph () {
    return this._graph
  }

  set graph (newValue) {
    if (this._graph != null)
      this._presentation.removeChild(this._graph.presentation)
     else {
      this._label.classList.remove('dcc-node-label-theme')
      this._label.classList.add('dcc-node-label-group-theme')
    }
    this._graph = newValue
    this._presentation.appendChild(this._graph.presentation)
  }

  get graphWidth () {
    return this._node.width
  }

  set graphWidth (newValue) {
    this._graphAttr('width', newValue)
  }

  get graphHeight () {
    return this._node.height
  }

  set graphHeight (newValue) {
    this._graphAttr('height', newValue)
  }

  get presentation () {
    return this._presentation
  }

  _graphAttr (attr, value) {
    this._node[attr] = value
    this._rect.setAttribute(attr, value)
    this._cover.setAttribute(attr, value)
    if (this._contentSpace != null) {
      this._contentSpace.setAttribute(attr, value)
      this._label.style = 'width:' + this._node.width +
            'px;height:' + ((this._graph)
        ? GraphLayoutDG.parameters['node-label-height']
        : this._node.height) + 'px'
    }
  }

  _setPosition () {
    this._presentation.setAttribute('transform',
      'translate(' +
         ((this.x != null) ? this.x : GraphNode.standardDimensions.x) + ' ' +
         ((this.y != null) ? this.y : GraphNode.standardDimensions.y) + ')')
  }

  _setDimensions (element) {
    element.setAttribute('width',
      (this.width != null) ? this.width : GraphNode.standardDimensions.width)
    element.setAttribute('height',
      (this.height != null) ? this.height : GraphNode.standardDimensions.height)
  }

  addPiece (type, piece) {
    if (this._graph != null) { this._graph.addPiece(type, piece) }
  }

  // <TODO> redesign the events schema
  _nodeClicked (event) {
    event.stopPropagation()
    DCCContextMenu.close()  // <TODO> handle context menu
    this._bus.publish('graph/select/clear')
    this._cover.classList.remove('dcc-node-cover-theme')
    this._cover.classList.add('dcc-node-selected-theme')
    this._bus.subscribe('graph/select/clear', this._nodeUnselect)
    this._bus.publish(this._action, this.id, true)
  }

  // <TODO> redesign the events schema
  _nodeUnselect () {
    this._bus.unsubscribe('graph/select/clear', this._nodeUnselect)
    this._cover.classList.remove('dcc-node-selected-theme')
    this._cover.classList.add('dcc-node-cover-theme')
  }

  _nodeContext (event) {

  }
}

GraphNode.standardDimensions = {
  x: 0,
  y: 0,
  width: 100,
  height: 50
}
