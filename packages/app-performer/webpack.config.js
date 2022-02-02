const path = require('path')

module.exports = {
  entry: {
    main: './src/index.tsx',
    worker: './src/worker.ts'
  },
  mode: 'development',
  devtool: 'inline-source-map',
  watch: false,
  optimization: {
    minimize: false
  },
  experiments: {
    outputModule: true
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist')
  },
  devServer: {
    static: './dist',
    compress: true,
    client: {
      progress: true,
      overlay: {
        errors: true,
        warnings: false
      }
    }
  },
  resolve: {
    alias: {
      '@va/engine': path.resolve(__dirname, '../engine/lib'),
      '@va/visuals': path.resolve(__dirname, '../visuals/lib'),
      '@va/components': path.resolve(__dirname, '../components/lib')
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
