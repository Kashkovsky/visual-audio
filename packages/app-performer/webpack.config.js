const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')

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
    // compress: true,
    // hot: false,
    // liveReload: true,
    open: true,
    client: {
      progress: true,
      overlay: {
        errors: true,
        warnings: false
      }
    },
    headers: {
      'Cross-Origin-Embedder-Policy': 'require-corp',
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Resource-Policy': 'cross-origin'
    }
  },
  resolve: {
    alias: {
      '@va/engine': path.resolve(__dirname, '../engine/lib'),
      '@va/components': path.resolve(__dirname, '../components/lib')
    },
    fallback: { crypto: require.resolve('crypto-browserify') }
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
        test: /\.(gltf|glb|png|bin|jpeg)$/,
        type: 'asset/resource'
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      title: 'VA Performer',
      template: 'index.html'
    })
  ],
  resolve: {
    extensions: ['.tsx', '.ts', '.js', '.glsl']
  }
}
