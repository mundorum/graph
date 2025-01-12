import { Bus, Oid, html, OidUI } from "/lib/foundation/oidlib-dev.js";
class GraphPiece {
  _showContextMenu(event) {
    event.preventDefault();
    if (this._node.menu) {
      DCCContextMenu.display(
        event.clientX,
        event.clientY,
        this._node.menu
      );
    }
  }
}
class GraphNode extends GraphPiece {
  constructor(node) {
    super();
    this._node = {};
    Object.assign(this._node, node);
    if (node.width == null)
      this._node.width = node.label && node.label.length * 10 + 20 > GraphNode.standardDimensions.width ? node.label.length * 10 + 20 : GraphNode.standardDimensions.width;
    this._nodeClicked = this._nodeClicked.bind(this);
    this._nodeUnselect = this._nodeUnselect.bind(this);
    this._showContextMenu = this._showContextMenu.bind(this);
    this._bus = Bus.i;
    this._presentation = document.createElementNS("http://www.w3.org/2000/svg", "g");
    this._rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    this._rect.setAttribute("rx", 10);
    this._setDimensions(this._rect);
    this._rect.classList.add("node");
    if (node.format != null)
      this._rect.classList.add(`node-${node.format}`);
    this._presentation.appendChild(this._rect);
    if (node.label != null) {
      this._contentSpace = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "foreignObject"
      );
      this._setDimensions(this._contentSpace);
      this._label = document.createElement("div");
      this._label.style = `width:${this._node.width}px;height:${this._node.height}px`;
      const tf = node.format != null ? ` node-primary-${node.format}` : "";
      this._label.innerHTML = `<div class="node-title node-primary${tf}">${node.label}</div>`;
      this._contentSpace.appendChild(this._label);
      this._presentation.appendChild(this._contentSpace);
    }
    this._cover = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    this._cover.setAttribute("rx", 10);
    this._setDimensions(this._cover);
    this._cover.classList.add("node-cover");
    this._presentation.appendChild(this._cover);
    this._presentation.addEventListener("contextmenu", this._showContextMenu);
    this._setPosition();
  }
  get id() {
    return this._node.id;
  }
  get x() {
    return this._node.x;
  }
  set x(newValue) {
    this._node.x = newValue;
    this._setPosition();
  }
  get y() {
    return this._node.y;
  }
  set y(newValue) {
    this._node.y = newValue;
    this._setPosition();
  }
  get width() {
    return this._node.width;
  }
  set width(newValue) {
    this._graphAttr("width", newValue);
  }
  get height() {
    return this._node.height;
  }
  set height(newValue) {
    this._graphAttr("height", newValue);
  }
  get action() {
    return this._action;
  }
  set action(newValue) {
    this._action = newValue;
    this._presentation.style.cursor = "pointer";
    this._presentation.addEventListener("click", this._nodeClicked);
  }
  get bus() {
    return this._bus;
  }
  set bus(newValue) {
    this._bus = newValue;
  }
  get graph() {
    return this._graph;
  }
  set graph(newValue) {
    if (this._graph != null)
      this._presentation.removeChild(this._graph.presentation);
    else {
      this._label.classList.remove("dcc-node-label-theme");
      this._label.classList.add("dcc-node-label-group-theme");
    }
    this._graph = newValue;
    this._presentation.appendChild(this._graph.presentation);
  }
  get graphWidth() {
    return this._node.width;
  }
  set graphWidth(newValue) {
    this._graphAttr("width", newValue);
  }
  get graphHeight() {
    return this._node.height;
  }
  set graphHeight(newValue) {
    this._graphAttr("height", newValue);
  }
  get presentation() {
    return this._presentation;
  }
  _graphAttr(attr, value) {
    this._node[attr] = value;
    this._rect.setAttribute(attr, value);
    this._cover.setAttribute(attr, value);
    if (this._contentSpace != null) {
      this._contentSpace.setAttribute(attr, value);
      this._label.style = "width:" + this._node.width + "px;height:" + (this._graph ? GraphLayoutDG.parameters["node-label-height"] : this._node.height) + "px";
    }
  }
  _setPosition() {
    this._presentation.setAttribute(
      "transform",
      "translate(" + (this.x != null ? this.x : GraphNode.standardDimensions.x) + " " + (this.y != null ? this.y : GraphNode.standardDimensions.y) + ")"
    );
  }
  _setDimensions(element) {
    element.setAttribute(
      "width",
      this.width != null ? this.width : GraphNode.standardDimensions.width
    );
    element.setAttribute(
      "height",
      this.height != null ? this.height : GraphNode.standardDimensions.height
    );
  }
  addPiece(type, piece) {
    if (this._graph != null) {
      this._graph.addPiece(type, piece);
    }
  }
  // <TODO> redesign the events schema
  _nodeClicked(event) {
    event.stopPropagation();
    DCCContextMenu.close();
    this._bus.publish("graph/select/clear");
    this._cover.classList.remove("dcc-node-cover-theme");
    this._cover.classList.add("dcc-node-selected-theme");
    this._bus.subscribe("graph/select/clear", this._nodeUnselect);
    this._bus.publish(this._action, this.id, true);
  }
  // <TODO> redesign the events schema
  _nodeUnselect() {
    this._bus.unsubscribe("graph/select/clear", this._nodeUnselect);
    this._cover.classList.remove("dcc-node-selected-theme");
    this._cover.classList.add("dcc-node-cover-theme");
  }
  _nodeContext(event) {
  }
}
GraphNode.standardDimensions = {
  x: 0,
  y: 0,
  width: 100,
  height: 50
};
class GraphEdge extends GraphPiece {
  static create(edge, graph) {
    let edgeObj = null;
    const lyt = graph._layout.label != null ? graph._layout.label : "dg";
    switch (lyt) {
      case "dg":
        edgeObj = new GraphEdge(edge, graph);
        break;
      case "vh":
        edgeObj = new GraphEdgeVH(edge, graph);
    }
    return edgeObj;
  }
  constructor(edge, graph) {
    super();
    this._edge = {};
    if (graph != null && edge.source && edge.target) {
      const sourceIndex = graph.nodes.findIndex((node) => node.id === edge.source);
      if (sourceIndex > -1) {
        let targetIndex = -1;
        switch (edge.target) {
          case "#previous":
            if (sourceIndex > 0) {
              targetIndex = sourceIndex - 1;
            }
            break;
          case "#next":
            if (sourceIndex < graph.nodes.length - 1) {
              targetIndex = sourceIndex + 1;
            }
            break;
          default: {
            let tg = edge.target;
            do {
              targetIndex = graph.nodes.findIndex((node) => node.id === tg);
              if (targetIndex === -1 && tg.includes("."))
                tg = tg.substring(0, tg.lastIndexOf("."));
              else
                tg = null;
            } while (tg != null);
            break;
          }
        }
        if (targetIndex > -1) {
          edge.source = graph.nodes[sourceIndex];
          edge.target = graph.nodes[targetIndex];
          Object.assign(this._edge, edge);
          this._presentation = document.createElementNS(
            "http://www.w3.org/2000/svg",
            "g"
          );
          this._line = document.createElementNS(
            "http://www.w3.org/2000/svg",
            "polyline"
          );
          this._line.setAttribute("fill", "none");
          this._line.classList.add("edge");
          this._presentation.appendChild(this._line);
          if (edge.label != null) {
            this._labelText = document.createTextNode(edge.label);
            this._label = document.createElementNS(
              "http://www.w3.org/2000/svg",
              "text"
            );
            this._label.appendChild(this._labelText);
            this._presentation.appendChild(this._label);
          }
          this.update();
        }
      }
    }
  }
  get source() {
    return this._edge.source;
  }
  get target() {
    return this._edge.target;
  }
  get presentation() {
    return this._presentation;
  }
  update() {
    if (this._edge.source != null && this._edge.target != null) {
      const source = this._edge.source;
      const target = this._edge.target;
      const x1 = source.x + source.width / 2;
      const y1 = source.y + source.height;
      const x2 = target.x + target.width / 2;
      const y2 = target.y;
      if (y2 > y1) {
        this._line.setAttribute("points", `${x1},${y1} ${x2},${y2}`);
        if (this._label != null) {
          this._label.setAttribute("x", (x1 + x2) / 2);
          this._label.setAttribute("y", (y1 + y2) / 2);
          this._labelText.nodeValue = this._edge.label;
        }
      }
    }
  }
}
class GraphEdgeVH extends GraphEdge {
  update() {
    if (this._edge.source != null && this._edge.target != null) {
      const source = this._edge.source;
      const target = this._edge.target;
      const x1 = source.x + (target.x - source.x) / 2;
      const y1 = source.y + source.height;
      const x2 = target.x;
      const y2 = target.y + target.height / 2;
      this._line.setAttribute("points", `${x1},${y1} ${x1},${y2} ${x2},${y2}`);
      if (this._label != null) {
        this._label.setAttribute("x", (x1 + x2) / 2);
        this._label.setAttribute("y", (y1 + y2) / 2);
        this._labelText.nodeValue = this._edge.label;
      }
    }
  }
}
class GraphLayout {
  static create(layout) {
    let layoutObj = null;
    const lyt = layout != null ? layout : "dg";
    switch (lyt) {
      case "dg":
        layoutObj = new GraphLayoutDG$1();
        break;
      case "vh":
        layoutObj = new GraphLayoutVH();
    }
    return layoutObj;
  }
  attach(graph) {
    this._graph = graph;
  }
}
GraphLayout.parameters = {
  subgraphs: "vertical",
  "node-width": 75,
  "node-height": 42,
  "node-label-height": 30,
  "node-horizontal-spacing": 10,
  "node-vertical-spacing": 30,
  "horizontal-margin": 10,
  "vertical-margin": 10
};
let GraphLayoutDG$1 = class GraphLayoutDG2 extends GraphLayout {
  get label() {
    return "dg";
  }
  organize() {
    const param = {
      subgraphs: GraphLayoutDG2.parameters.subgraphs,
      width: GraphLayoutDG2.parameters["node-width"],
      height: GraphLayoutDG2.parameters["node-height"],
      hmargin: GraphLayoutDG2.parameters["horizontal-margin"],
      vmargin: GraphLayoutDG2.parameters["vertical-margin"],
      hspace: GraphLayoutDG2.parameters["node-horizontal-spacing"],
      vspace: GraphLayoutDG2.parameters["node-vertical-spacing"]
    };
    for (const node of this._graph.nodes)
      node.level = -1;
    let next = this._graph.nodes[0];
    let shiftX = 0;
    let shiftY = this._graph.labelHeight;
    let maxX = 0;
    let maxY = 0;
    do {
      const dim = this._visit(next, 0, shiftX, shiftY, param);
      if (param.subgraphs === "horizontal") {
        shiftX += dim.horizontal;
        maxX = shiftX;
        shiftY = 0;
        maxY = maxY < dim.vertical ? dim.vertical : maxY;
      } else {
        shiftX = 0;
        maxX = maxX < dim.horizontal ? dim.horizontal : maxX;
        shiftY += dim.vertical;
        maxY = shiftY;
      }
      next = this._graph.nodes.find((node) => node.level === -1);
    } while (next != null);
    const container = this._graph._container;
    this._graph.width = (container == null ? void 0 : container.label) && container.width && container.width > maxX + param.hmargin ? container.width : maxX + param.hmargin;
    this._graph.height = maxY + param.vmargin;
    for (const edge of this._graph.edges)
      edge.update();
  }
  _visit(node, level, shiftX, shiftY, param) {
    node.level = level;
    if (node.width == null) node.width = param.width;
    if (node.height == null) node.height = param.height;
    const children = this._graph.edges.filter((edge) => edge.source === node);
    let horizontal = node.width + param.hspace;
    const vertical = node.height + param.vspace;
    let cHorizontal = 0;
    let cVertical = 0;
    if (children.length > 0) {
      for (const ch of children) {
        if (ch.target !== ch.source && ch.target.level === -1) {
          const dim = this._visit(
            ch.target,
            level + 1,
            shiftX + cHorizontal,
            shiftY + vertical,
            param
          );
          cHorizontal += dim.horizontal;
          cVertical = cVertical < dim.vertical ? dim.vertical : cVertical;
        }
      }
    }
    node.x = param.hmargin + shiftX;
    if (horizontal < cHorizontal) {
      node.x += (cHorizontal - horizontal) / 2;
      horizontal = cHorizontal;
    }
    node.y = param.vmargin + shiftY;
    return { horizontal, vertical: vertical + cVertical };
  }
};
GraphLayoutDG$1.parameters = GraphLayout.parameters;
class GraphLayoutVH extends GraphLayout {
  get label() {
    return "vh";
  }
  organize() {
    const param = {
      width: GraphLayoutVH.parameters["node-width"],
      height: GraphLayoutVH.parameters["node-height"],
      hmargin: GraphLayoutVH.parameters["horizontal-margin"],
      vmargin: GraphLayoutVH.parameters["vertical-margin"],
      hspace: GraphLayoutVH.parameters["node-horizontal-spacing"],
      vspace: GraphLayoutVH.parameters["node-vertical-spacing"]
    };
    for (const node of this._graph.nodes)
      node.level = -1;
    let next = this._graph.nodes[0];
    let shiftX = param.hmargin;
    let shiftY = this._graph.labelHeight;
    let maxX = 0;
    let maxY = 0;
    do {
      const dim = this._visit(next, 0, shiftX, shiftY, param);
      shiftX = param.hmargin;
      maxX = maxX < dim.horizontal ? dim.horizontal : maxX;
      shiftY += dim.vertical;
      maxY = shiftY;
      next = this._graph.nodes.find((node) => node.level === -1);
    } while (next != null);
    const container = this._graph._container;
    this._graph.width = (container == null ? void 0 : container.label) && container.width && container.width > maxX + param.hmargin ? container.width : maxX + param.hmargin;
    this._graph.height = maxY + param.vmargin;
    for (const edge of this._graph.edges)
      edge.update();
  }
  _visit(node, level, shiftX, shiftY, param) {
    node.level = level;
    if (node.width == null) node.width = param.width;
    if (node.height == null) node.height = param.height;
    node.x = shiftX;
    node.y = shiftY;
    const children = this._graph.edges.filter((edge) => edge.source === node);
    let cVertical = node.height + param.vspace;
    if (children.length > 0) {
      for (const ch of children) {
        if (ch.target !== ch.source && ch.target.level === -1) {
          const dim = this._visit(
            ch.target,
            level + 1,
            shiftX + param.hspace,
            shiftY + cVertical,
            param
          );
          cVertical += dim.vertical;
        }
      }
    }
    return {
      horizontal: shiftX + node.width + param.hspace,
      vertical: cVertical
    };
  }
}
GraphLayoutVH.parameters = Object.assign(
  Object.assign({}, GraphLayout.parameters),
  {
    "node-horizontal-spacing": 20,
    "node-vertical-spacing": 10
  }
);
class Graph {
  constructor(container, label, layout, action2, bus) {
    this._container = container;
    this._label = label;
    this._action = action2;
    this._bus = bus;
    this.clearGraph();
    this._presentation = document.createElementNS("http://www.w3.org/2000/svg", "g");
    this._layout = GraphLayout.create(layout);
    this._layout.attach(this);
  }
  get label() {
    return this._label;
  }
  set label(newValue) {
    this._label = newValue;
  }
  get width() {
    return this._container.graphWidth;
  }
  set width(newValue) {
    this._container.graphWidth = newValue;
  }
  get height() {
    return this._container.graphHeight;
  }
  set height(newValue) {
    this._container.graphHeight = newValue;
  }
  get nodes() {
    return this._nodes;
  }
  get edges() {
    return this._edges;
  }
  get action() {
    return this._action;
  }
  set action(newValue) {
    this._action = action;
  }
  addPiece(type, piece) {
    this[`_${type}s`].push(piece);
    if (piece.presentation != null) {
      this._presentation.appendChild(piece.presentation);
      if (this._action && type === "node") {
        piece.action = this._action;
        piece.bus = this._bus;
      }
    }
    if (this._layout != null) {
      this._layout.organize();
    }
  }
  clearGraph() {
    if (this._nodes) {
      for (let n of this._nodes)
        if (n.presentation != null)
          this._presentation.removeChild(n.presentation);
    }
    if (this._edges) {
      for (let e of this._edges)
        if (e.presentation != null)
          this._presentation.removeChild(e.presentation);
    }
    this._nodes = [];
    this._edges = [];
  }
  importGraph(graphObj) {
    for (const node of graphObj.nodes) {
      const gnode = new GraphNode(node);
      if (node.graph) {
        gnode.graph = new Graph(
          gnode,
          node.label,
          this._layout.label,
          this._action,
          this._bus
        );
        gnode.graph.importGraph(node.graph);
      }
      this.addPiece("node", gnode);
    }
    for (const edge of graphObj.edges) {
      this.addPiece("edge", GraphEdge.create(edge, this));
    }
  }
  get presentation() {
    return this._presentation;
  }
  get labelHeight() {
    return this._label != null ? GraphLayout.parameters["node-label-height"] : 0;
  }
}
class GraphOid extends OidUI {
  async connectedCallback() {
    await super.connectedCallback();
    this._graph = new Graph(
      this,
      this.label,
      this.layout,
      this.action,
      this._bus
    );
    if (this._graphObj) {
      this._graph.importGraph(this._graphObj);
      this._graphObj = void 0;
    } else
      this._callCustom("graph");
    this._presentation.appendChild(this._graph.presentation);
  }
  /* Non-observed Properties
      ***********************/
  get graph() {
    return this._graph;
  }
  get graphWidth() {
    return this._presentation.getAttribute("width");
  }
  set graphWidth(newValue) {
    this._presentation.setAttribute("width", newValue);
  }
  get graphHeight() {
    return this._presentation.getAttribute("height");
  }
  set graphHeight(newValue) {
    this._presentation.setAttribute("height", newValue);
  }
  /*****/
  addPiece(type, piece) {
    this._graph.addPiece(type, piece);
  }
  importGraph(graphObj) {
    if (this._graph != null) {
      this._graph.importGraph(graphObj);
    } else {
      this._graphObj = graphObj;
    }
  }
  /*
   * Event Handlers
    ****************/
  handleAddNode(topic, message) {
    this._graph.addPiece("node", new GraphNode(message));
  }
  handleAddEdge(topic, message) {
    this._graph.addPiece("edge", GraphEdge.create(message, this._graph));
  }
  handleClearGraph() {
    this._graph.clearGraph();
  }
}
Oid.component({
  id: "goid:graph",
  element: "graph-oid",
  properties: {
    label: { default: "Graph" },
    width: { default: 300 },
    height: { default: 200 },
    layout: {},
    action: {}
  },
  receive: {
    "node/add": "handleAddNode",
    "edge/add": "handleAddEdge",
    "graph/clear": "handleClearGraph"
  },
  implementation: GraphOid,
  stylesheets: "stylesheets:oid-graph.css",
  template: html`
  <div id="graph-wrapper">
    <svg id="oid-prs" width="{{this.width}}" height="{{this.height}}" xmlns="http://www.w3.org/2000/svg">
    </svg>
  </div>`
});
export {
  Graph,
  GraphEdge,
  GraphLayout,
  GraphNode,
  GraphOid,
  GraphPiece
};
//# sourceMappingURL=oid-graph-dev.js.map
