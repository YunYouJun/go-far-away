const path = require('path')
const PrerenderSPAPlugin = require('prerender-spa-plugin')

module.exports = {
  configureWebpack: {
    plugins: []
  }
}

if (process.env.NODE_ENV === 'production') {
  module.exports.configureWebpack.plugins = (
    module.exports.configureWebpack.plugins || []
  ).concat([
    new PrerenderSPAPlugin({
      // Required - The path to the webpack-outputted app to prerender.
      staticDir: path.join(__dirname, 'dist'),
      // Required - Routes to render.
      routes: ['/', '/go', '/unit']
    })
  ])
}
