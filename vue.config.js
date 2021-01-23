module.exports = {
  publicPath: "/go-far-away/",
  devServer: {
    overlay: {
      warnings: true,
      errors: true,
    },
  },
  transpileDependencies: ["vuetify"],
  pwa: {
    workboxOptions: {
      skipWaiting: true,
      clientsClaim: true,
    },
  },
};
