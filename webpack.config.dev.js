const path = require('path')

module.exports = {
  entry: [
    './src/assembly.js'
  ],
  experiments: {
    outputModule: true,
  },
  output: {
    filename: 'oid-graph-dev.js',
    path: path.resolve(__dirname, 'pack'),
    library: {
      type: 'module'
    }
  },
  // externals: '/pack/oidlib.js',
  mode: 'development'
}