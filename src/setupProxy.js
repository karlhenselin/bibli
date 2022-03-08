const { createProxyMiddleware } = require('http-proxy-middleware');

function onProxyRes(proxyRes, req, res) {
  res.header('Access-Control-Allow-Origin', '*');
  console.log(req.originalUrl);
}

module.exports = function (app) {
  app.use(
    '/api',
    createProxyMiddleware({
      cookieDomainRewrite: "localhost",
      target: 'https://www.biblegateway.com',
      secure: false,
      changeOrigin: true,
      onProxyRes,
      pathRewrite: {
        "^/api": "/"
      },
      cookieDomainRewrite: 'www.biblegateway.com'
    })
  );
  app.listen(3000);
};