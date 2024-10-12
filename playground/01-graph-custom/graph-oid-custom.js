import { Oid } from '/pack/oid-graph-dev.js'

Oid.customize('goid:graph', {
  cid: 'example',
  graph: (oid) => {
    oid.importGraph({
      nodes: [
        { id: 'a', label: 'A' },
        { id: 'b', label: 'B' },
        { id: 'c', label: 'C' },
        { id: 'd', label: 'D' }
      ],
      edges: [
        { source: 'a', target: 'b' },
        { source: 'a', target: 'c' },
        { source: 'b', target: 'd' }
      ]
    })
  }
})