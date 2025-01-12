/* An edge in an SVG graph
 *************************/

import { GraphPiece } from './piece'

export class GraphEdge extends GraphPiece {
  static create (edge, graph) {
    let edgeObj = null
    const lyt = (graph._layout.label != null) ? graph._layout.label : 'dg'
    switch (lyt) {
      case 'dg': edgeObj = new GraphEdge(edge, graph); break
      case 'vh': edgeObj = new GraphEdgeVH(edge, graph)
    }
    return edgeObj    
  }

  constructor (edge, graph) {
    super()
    this._edge = {}
    if (graph != null && edge.source && edge.target) {
      const sourceIndex = graph.nodes.findIndex(node => node.id === edge.source)

      if (sourceIndex > -1) {
        let targetIndex = -1
        switch (edge.target) {
          case '#previous':
            if (sourceIndex > 0) { targetIndex = sourceIndex - 1 }
            break
          case '#next':
            if (sourceIndex < graph.nodes.length - 1) { targetIndex = sourceIndex + 1 }
            break
          default: {
            let tg = edge.target
            // search in the current level and upper levels
            do {
              targetIndex =
                        graph.nodes.findIndex(node => node.id === tg)
              if (targetIndex === -1 && tg.includes('.'))
                tg = tg.substring(0, tg.lastIndexOf('.'))
              else
                tg = null
            } while (tg != null)
            break
          }
        }

        if (targetIndex > -1) {
          edge.source = graph.nodes[sourceIndex]
          edge.target = graph.nodes[targetIndex]
          Object.assign(this._edge, edge)

          this._presentation = document.createElementNS(
            'http://www.w3.org/2000/svg', 'g')
          this._line = document.createElementNS(
            'http://www.w3.org/2000/svg', 'polyline')
          this._line.setAttribute('fill', 'none')
          this._line.classList.add('edge')
          this._presentation.appendChild(this._line)

          if (edge.label != null) {
            this._labelText = document.createTextNode(edge.label)
            this._label = document.createElementNS(
              'http://www.w3.org/2000/svg', 'text')
            this._label.appendChild(this._labelText)
            this._presentation.appendChild(this._label)
          }

          this.update()
        }
      }
    }
  }

  get source () {
    return this._edge.source
  }

  get target () {
    return this._edge.target
  }

  get presentation () {
    return this._presentation
  }

  update () {
    if (this._edge.source != null && this._edge.target != null) {
      const source = this._edge.source
      const target = this._edge.target
      const x1 = source.x + source.width / 2
      const y1 = source.y + source.height
      const x2 = target.x + target.width / 2
      const y2 = target.y
      // <TODO> provisory
      if (y2 > y1) {
        this._line.setAttribute('points', `${x1},${y1} ${x2},${y2}`)
        if (this._label != null) {
          this._label.setAttribute('x', (x1 + x2) / 2)
          this._label.setAttribute('y', (y1 + y2) / 2)
          this._labelText.nodeValue = this._edge.label
        }
      }
    }
  }
}

class GraphEdgeVH extends GraphEdge {
  update () {
    if (this._edge.source != null && this._edge.target != null) {
      const source = this._edge.source
      const target = this._edge.target
      const x1 = source.x + (target.x - source.x) / 2
      const y1 = source.y + source.height
      const x2 = target.x
      const y2 = target.y + target.height / 2
      this._line.setAttribute('points', `${x1},${y1} ${x1},${y2} ${x2},${y2}`)
      if (this._label != null) {
        this._label.setAttribute('x', (x1 + x2) / 2)
        this._label.setAttribute('y', (y1 + y2) / 2)
        this._labelText.nodeValue = this._edge.label
      }
    }
  } 
}

