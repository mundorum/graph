import { Oid } from '/lib/foundation/oidlib-dev.js'
export { GraphOid } from '/lib/graph/oid-graph-dev.js'

Oid.customize('goid:graph', {
  cid: 'example',
  graph: (oid) => {
    oid.importGraph({
      nodes: [
        { id: 'a', label: 'A' },
        { id: 'a1', label: 'A.1', format: 'light' },
        { id: 'a2', label: 'A.2' },
        { id: 'a11', label: 'A.1.1', format: 'light' },
        { id: 'b', label: 'B' },
        { id: 'b1', label: 'B.1' },
      ],
      edges: [
        { source: 'a', target: 'a1' },
        { source: 'a', target: 'a2' },
        { source: 'a1', target: 'a11' },
        { source: 'b', target: 'b1' },
      ]
    })
  }
})