const path         = require('path')
const webpack      = require('webpack')
const ExtractTextPlugin = require("extract-text-webpack-plugin")

const env        = process.env.MIX_ENV || process.env.NODE_ENV || 'dev'
const TRANSIENT  = !!process.env.TRANSIENT
const BASENAME   = process.env.BASENAME || ""
const prod       = env === 'production' || env === 'prod'
const publicPath = process.env.PUBLIC_PATH || (prod ? '/' : 'http://localhost:4001/')
const entry      = [ 'babel-polyfill','./js/index.js' ]
const hot        = 'webpack-hot-middleware/client?path=' + publicPath + '__webpack_hmr'
const cssLoaders = [ 'css-loader', 'sass-loader', 'postcss-loader' ]

const plugins = [
  new webpack.NoEmitOnErrorsPlugin()
]

if (prod) {
  plugins.push(
    new ExtractTextPlugin("css/index.bundle.css"),
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify('production'),
        BASENAME: JSON.stringify(BASENAME),
        TRANSIENT: TRANSIENT
      }
    }),
    new webpack.optimize.UglifyJsPlugin({
      compress: {
        booleans: true,
        conditionals: true,
        dead_code: true,
        drop_console: true,
        drop_debugger: true,
        if_return: true,
        join_vars: true,
        sequences: true,
        unused: true,
        warnings: false, // good for prod apps so users can't peek behind curtain
      },
      mangle: {
        except: ['exports', 'require']
      },
      output: {
        comments: false
      }
    })
  )
} else {
  plugins.push(
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify('development'),
        BASENAME: JSON.stringify(BASENAME),
        TRANSIENT: TRANSIENT
      }
    }),
    new webpack.HotModuleReplacementPlugin()
  )
}

module.exports = {
  devtool: prod ? 'eval' : 'cheap-module-eval-source-map',
  entry: prod ? entry : [hot].concat(entry),
  output: {
    // http://www.phoenixframework.org/v0.10.0/docs/static-assets
    // Won't serve from root unless specified there
    path: path.resolve(__dirname) + '/../priv/static',
    filename: 'js/index.bundle.js',
    publicPath: publicPath
  },
  plugins: plugins,
  module: {
    rules: [
      // JS
      {
        test: /\.jsx?$/,
        use: ['babel-loader'],
        exclude: path.resolve(__dirname, 'node_modules'),
      },
      // CSS
      {
        test: /\.scss$/,
        use: prod
          ? ExtractTextPlugin.extract({ use: cssLoaders, fallback: "style-loader" })
          : ['style-loader'].concat(cssLoaders)
      },
      // Inline base64 URLs for <=8k assets, direct URLs for the rest
      {
        test: /\.(gif|jpe?g|png)(\?\S*)?$/,
        use: [{
          loader: "url-loader",
          options: {
            name: '[hash].[ext]',
            limit: 8192,
          }
        }]
      },
      {
        test: /\.(gif|jpe?g|png|wav|mp3)(\?\S*)?$/,
        use: [{
          loader: 'file-loader',
          options: {
            name: 'assets/[hash].[ext]',
          },
        }],
      },
      // Fix: Failed to decode downloaded font. OTS parsing error: invalid version tag
      // https://github.com/webpack/webpack/issues/1468
      {
        test: /\.svg(\?v=[0-9]\.[0-9]\.[0-9])?$/,
        use: [{
          loader: 'url-loader',
          options: {
            name: 'assets/[hash].[ext]',
            limit: 65000,
            mimetype: 'image/svg+xml',
          }
        }]
      },
      {
        test: /\.woff(\?v=[0-9]\.[0-9]\.[0-9])?$/,
        use: [{
          loader: 'url-loader',
          options: {
            name: 'assets/[hash].[ext]',
            limit: 65000,
            mimetype: 'application/font-woff',
          }
        }]
      },
      {
        test: /\.woff2(\?v=[0-9]\.[0-9]\.[0-9])?$/,
        use: [{
          loader: 'url-loader',
          options: {
            name: 'assets/[hash].[ext]',
            limit: 65000,
            mimetype: 'application/font-woff2',
          }
        }]
      },
      {
        test: /\.[ot]tf(\?v=[0-9]\.[0-9]\.[0-9])?$/,
        use: [{
          loader: 'url-loader',
          options: {
            name: 'assets/[hash].[ext]',
            limit: 65000,
            mimetype: 'application/octet-stream',
          }
        }]
      },
      {
        test: /\.eot(\?v=[0-9]\.[0-9]\.[0-9])?$/,
        use: [{
          loader: 'url-loader',
          options: {
            name: 'assets/[hash].[ext]',
            limit: 65000,
            mimetype: 'application/vnd.ms-fontobject',
          }
        }]
      }
    ]
  }
}
