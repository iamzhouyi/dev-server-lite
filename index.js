const finalhandler = require('finalhandler')
const http = require('http')
const serveStatic = require('serve-static')
const httpProxy = require('http-proxy')
const HttpProxyRules = require('http-proxy-rules')

// For rules see https://github.com/donasaur/http-proxy-rules
const proxyRules = new HttpProxyRules({
    rules: {
      '/api': 'http://127.0.0.1/api',
    },
});

// For options see https://github.com/nodejitsu/node-http-proxy
const proxyOptions = {
    changeOrigin: true,
    ws: true,
}

const port = 3000

const proxy = httpProxy.createProxy(proxyOptions);

// Serve static resource
const serve = serveStatic('./', {'index': ['index.html', 'index.htm']})

// Create server
const server = http.createServer(function onRequest (req, res) {
    var target = proxyRules.match(req);
    if (target) {
        return proxy.web(req, res, {
            target: target
        });
    }
    serve(req, res, finalhandler(req, res))
})

server.listen(port)