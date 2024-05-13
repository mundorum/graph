import { Oid } from '/pack/oid-graph-dev.js'

Oid.customize('goid:graph', {
  cid: 'example',
  graph: function (oid) {
    oid.importGraph({
      nodes: [
        { id: 'a', label: 'A' },
        { id: 'b', label: 'B' }
      ],
      edges: [
        { source: 'a', target: 'b' }
      ]
    })
  }
})