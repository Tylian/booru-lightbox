const CopyPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const ZipPlugin = require('zip-webpack-plugin');
const path = require('path');
const webpack = require('webpack');

const { processManifest } = require('./utils/manifest');

module.exports = ({ production, platform }, argv) => {
  const copyPluginPatterns = [
    { from: 'src/assets', to: 'assets' },
    { from: 'src/manifest.json', transform: content => processManifest(content, platform) },
  ];

  if(platform == "chrome") {
    copyPluginPatterns.push({ from: 'node_modules/webextension-polyfill/dist/browser-polyfill.min.js' });
  }

  const config = {
    mode: production ? "production" : "development",
    entry: {
      'danbooru': { import: './src/danbooru.ts', dependOn: 'BooruLightbox' },
      'gelbooru': { import: './src/gelbooru.ts', dependOn: 'BooruLightbox' },
      'ouroboros': { import: './src/ouroboros.ts', dependOn: 'BooruLightbox' },
      'BooruLightbox': './src/lib/BooruLightbox.ts'
    },
    output: {
      filename: '[name].js',
      path: path.resolve(__dirname, 'dist', platform)
    },
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          loader: 'ts-loader',
        },
        {
          test: /\.s[ac]ss$/i,
          use: [MiniCssExtractPlugin.loader, 'css-loader', 'sass-loader']
        }
      ],
    },
    resolve: {
      extensions: ['.tsx', '.ts', '.js'],
    },
    plugins: [
      new CleanWebpackPlugin(),
      new MiniCssExtractPlugin({ filename: '[name].css' }),
      new CopyPlugin({ patterns: copyPluginPatterns })
    ]
  };

  if(production) {
    // config.plugins.push(new ZipPlugin())
  } else {
    config.devtool = 'inline-source-map';
  }

  return config;
}