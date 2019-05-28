const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const { preprocess, createEnv, readConfigFile } = require('svelte-ts-preprocess');

const mode = process.env.NODE_ENV || 'development';
const isDev = mode === 'development';

const template = path.resolve(__dirname, 'src/index.html');
const entry = path.resolve(__dirname, 'src/index.ts');
const outDir = path.resolve(__dirname, 'dist');

const targets = [
  '>1%',
  'last 2 versions',
  'Firefox ESR',
  'not ie < 11'
];

const babelLoader = {
  loader: 'babel-loader',
  options: {
    presets: [
      ['@babel/preset-env', { targets }]
    ]
  }
};

const cssLoader = [
  isDev ? 'style-loader' : MiniCssExtractPlugin.loader,
  {
    loader: 'css-loader',
    options: {
      importLoaders: 1
    }
  }
]

const env = createEnv();
const compilerOptions = readConfigFile(env);

const opts = {
  env,
  compilerOptions: {
    ...compilerOptions,
    allowNonTsExtensions: true
  }
};

module.exports = {
  mode,
  entry,
  output: {
    path: outDir,
    filename: 'bundle.[hash:8].js',
    chunkFilename: '[name].[chunkhash:8].js',
    publicPath: '/'
  },
  resolve: {
    extensions: ['.ts', '.mjs', '.js', '.json', '.css', '.svelte', '.scss'],
    mainFields: ['svelte', 'browser', 'module', 'main']
  },
  module: {
    rules: [
      {
        oneOf: [
          {
            test: /\.svelte$/,
            use: [
              babelLoader,
              {
                loader: 'svelte-loader',
                options: {
                  emitCss: true,
                  preprocess: preprocess(opts)
                }
              }
            ]
          },
          {
            test: /\.m?js$/,
            exclude: /node_modules\/(?!svelte)/,
            use: babelLoader
          },
          {
            test: /\.ts$/,
            use: [
              babelLoader,
              {
                loader: 'awesome-typescript-loader',
                options: {
                  logInfoToStdOut: true,
                  logLevel: 'info'
                }
              }
            ]
          },
          {
            test: /\.scss$/,
            use: [...cssLoader,
              {
                loader: 'sass-loader',
                options: {
                  includePaths: ['./node_modules']
                }
              }
            ]
          },
          {
            test: /\.css$/,
            use: cssLoader
          }
        ]
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template,
      inject: true,
      minify: isDev ? undefined : {
        removeComments: true,
        collapseWhitespace: true,
        removeRedundantAttributes: true,
        useShortDoctype: true,
        removeEmptyAttributes: true,
        removeStyleLinkTypeAttributes: true,
        keepClosingSlash: true,
        minifyJS: true,
        minifyCSS: true,
        minifyURLs: true,
      }
    }),
    !isDev && new MiniCssExtractPlugin({
      filename: '[name].[hash:8].css'
    })
  ].filter(Boolean)
};

if (isDev) {
  module.exports.devtool = '#source-map';

  module.exports.devServer = {
    port: 8080,
    host: "localhost",
    historyApiFallback: true,
    headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
        "Access-Control-Allow-Headers": "X-Requested-With, content-type, Authorization"
    },
    watchOptions: {aggregateTimeout: 300, poll: 1000},
    contentBase: outDir
  };
}
