const path = require('path')

module.exports = {
  entry: './src/index.ts',
  devtool: 'inline-source-map',
  stats: 'verbose',
  mode: 'development',
  optimization: {
    minimize: false
  },
  experiments: {
    outputModule: true
  },
  output: {
    filename: 'index.js',
    path: path.resolve(__dirname, 'lib'),
    library: {
      type: 'module'
    }
  },
  resolve: {
    alias: {
      '@va/engine': path.resolve(__dirname, '../engine/lib')
    }
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/
      },
      {
        test: /\.(glsl|vs|fs)$/,
        use: 'ts-shader-loader'
      },
      {
        test: /\.png/,
        type: 'asset/inline'
      }
    ]
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js', '.glsl']
  }
}
