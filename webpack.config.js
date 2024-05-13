const path = require('path')

module.exports = {
  entry: [
    './src/assembly.js'
  ],
  output: {
    filename: 'oid-graph.js',
    path: path.resolve(__dirname, 'pack'),
    globalObject: 'self',
    library: {
      name: 'oidgraph',
      type: 'umd'
    }
  },
  // externals: '/pack/oidlib.js',
  mode: 'production'
}