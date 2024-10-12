/* Auto-organize a graph in a layout
 ***********************************/
export class GraphLayout {
  static create (layout) {
    let layoutObj = null
    const lyt = (layout != null) ? layout : 'dg'
    switch (lyt) {
      case 'dg': layoutObj = new GraphLayoutDG(); break
      case 'vh': layoutObj = new GraphLayoutVH()
    }
    return layoutObj
  }

  attach (graph) {
    this._graph = graph
  }
}

GraphLayout.parameters = {
  subgraphs: 'vertical',
  'node-width': 75,
  'node-height': 42,
  'node-label-height': 30,
  'node-horizontal-spacing': 10,
  'node-vertical-spacing': 30,
  'horizontal-margin': 10,
  'vertical-margin': 10
}

/* Directed Graph Auto-organizer
 *******************************/
class GraphLayoutDG extends GraphLayout {
  get label () {
    return 'dg'
  }

  organize () {
    const param = {
      subgraphs: GraphLayoutDG.parameters.subgraphs,
      width: GraphLayoutDG.parameters['node-width'],
      height: GraphLayoutDG.parameters['node-height'],
      hmargin: GraphLayoutDG.parameters['horizontal-margin'],
      vmargin: GraphLayoutDG.parameters['vertical-margin'],
      hspace: GraphLayoutDG.parameters['node-horizontal-spacing'],
      vspace: GraphLayoutDG.parameters['node-vertical-spacing']
    }
    for (const node of this._graph.nodes)
      node.level = -1
    let next = this._graph.nodes[0]
    let shiftX = 0
    let shiftY = this._graph.labelHeight
    let maxX = 0
    let maxY = 0
    do {
      const dim = this._visit(next, 0, shiftX, shiftY, param)
      if (param.subgraphs === 'horizontal') {
        shiftX += dim.horizontal
        maxX = shiftX
        shiftY = 0
        maxY = (maxY < dim.vertical) ? dim.vertical : maxY
      } else {
        shiftX = 0
        maxX = (maxX < dim.horizontal) ? dim.horizontal : maxX
        shiftY += dim.vertical
        maxY = shiftY
      }
      next = this._graph.nodes.find(node => node.level === -1)
    } while (next != null)

    const container = this._graph._container
    this._graph.width = (container?.label && container.width &&
                         container.width > maxX + param.hmargin)
      ? container.width : maxX + param.hmargin
    this._graph.height = maxY + param.vmargin

    for (const edge of this._graph.edges)
      edge.update()
  }

  _visit (node, level, shiftX, shiftY, param) {
    node.level = level
    if (node.width == null) node.width = param.width
    if (node.height == null) node.height = param.height
    const children =
         this._graph.edges.filter(edge => edge.source === node)
    let horizontal = node.width + param.hspace
    const vertical = node.height + param.vspace
    let cHorizontal = 0
    let cVertical = 0
    if (children.length > 0) {
      for (const ch of children) {
        if (ch.target !== ch.source && ch.target.level === -1) {
          const dim = this._visit(
            ch.target, level + 1,
            shiftX + cHorizontal, shiftY + vertical, param)
          cHorizontal += dim.horizontal
          cVertical =
                  (cVertical < dim.vertical) ? dim.vertical : cVertical
        }
      }
    }
    node.x = param.hmargin + shiftX
    if (horizontal < cHorizontal) {
      node.x += (cHorizontal - horizontal) / 2
      horizontal = cHorizontal
    }
    node.y = param.vmargin + shiftY
    return { horizontal: horizontal, vertical: vertical + cVertical }
  }
}

GraphLayoutDG.parameters = GraphLayout.parameters

/* Vertical Hierarchy Auto-organizer
 ***********************************/
class GraphLayoutVH extends GraphLayout {
  get label () {
    return 'vh'
  }

  organize () {
    const param = {
      width: GraphLayoutVH.parameters['node-width'],
      height: GraphLayoutVH.parameters['node-height'],
      hmargin: GraphLayoutVH.parameters['horizontal-margin'],
      vmargin: GraphLayoutVH.parameters['vertical-margin'],
      hspace: GraphLayoutVH.parameters['node-horizontal-spacing'],
      vspace: GraphLayoutVH.parameters['node-vertical-spacing']
    }
    for (const node of this._graph.nodes)
      node.level = -1
    let next = this._graph.nodes[0]
    let shiftX = param.hmargin
    let shiftY = this._graph.labelHeight
    let maxX = 0
    let maxY = 0
    do {
      const dim = this._visit(next, 0, shiftX, shiftY, param)
      shiftX = param.hmargin
      maxX = (maxX < dim.horizontal) ? dim.horizontal : maxX
      shiftY += dim.vertical
      maxY = shiftY
      next = this._graph.nodes.find(node => node.level === -1)
    } while (next != null)

    const container = this._graph._container
    this._graph.width = (container?.label && container.width &&
                         container.width > maxX + param.hmargin)
      ? container.width : maxX + param.hmargin
    this._graph.height = maxY + param.vmargin

    for (const edge of this._graph.edges)
      edge.update()
  }

  _visit (node, level, shiftX, shiftY, param) {
    node.level = level
    if (node.width == null) node.width = param.width
    if (node.height == null) node.height = param.height
    node.x = shiftX
    node.y = shiftY
    const children =
         this._graph.edges.filter(edge => edge.source === node)
    let cVertical = node.height + param.vspace
    if (children.length > 0) {
      for (const ch of children) {
        if (ch.target !== ch.source && ch.target.level === -1) {
          const dim = this._visit(
            ch.target, level + 1,
            shiftX + param.hspace, shiftY + cVertical, param)
          cVertical += dim.vertical
        }
      }
    }
    return { horizontal: shiftX + node.width + param.hspace,
             vertical: cVertical }
  }
}

GraphLayoutVH.parameters = Object.assign(
  Object.assign({}, GraphLayout.parameters),
  {
   'node-horizontal-spacing': 20,
   'node-vertical-spacing': 10
  }
)