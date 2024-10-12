/* <TODO> refactor to avoid DCCContextMenu */
export class GraphPiece {
  _showContextMenu (event) {
    event.preventDefault()
    if (this._node.menu) {
      DCCContextMenu.display(
        event.clientX, event.clientY, this._node.menu)
    }
  }
}
