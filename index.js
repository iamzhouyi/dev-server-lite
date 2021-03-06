#!/usr/bin/env node

var finalhandler = require('finalhandler');
var http = require('http');
var serveStatic = require('serve-static');
var httpProxy = require('http-proxy')
var HttpProxyRules = require('http-proxy-rules')
var fs = require('fs');
var path = require('path');

var { root, config, port } = getCmdLineArgv()
var configFilePath = config //path.resolve(process.cwd(), 'proxy-rules.json')

var defaultProxyOptions = { changeOrigin: true, ws: false}
var defaultRules = {}

let userProxyOptions = {}, userRules = {}

if (fs.existsSync(configFilePath)){
    var config = JSON.parse(fs.readFileSync(configFilePath, 'utf8'));
    userProxyOptions = config.proxyOptions || {}
    userRules = config.rules || {}
}

// For rules see https://github.com/donasaur/http-proxy-rules
var proxyRules = new HttpProxyRules({
    rules: Object.assign({}, defaultRules, userRules)
});

// For options see https://github.com/nodejitsu/node-http-proxy
var proxyOptions = Object.assign({}, defaultProxyOptions, userProxyOptions)

console.log('proxy-rules.json', configFilePath)
console.log('proxyRules', proxyRules)
console.log('proxyOptions', proxyOptions)

var proxy = httpProxy.createProxy(proxyOptions);
proxy.on('error', function(err, req, res) {
    res.writeHead(500);
    res.end('something wrong from target server:  ' + err.toString());
});

// Serve static resource
var serve = serveStatic(root, {'index': ['index.html', 'index.htm']})

// Create server
var server = http.createServer(function onRequest (req, res) {
    var target = proxyRules.match(req);
    if (target) {
        return proxy.web(req, res, {
            target: target
        });
    }
    serve(req, res, finalhandler(req, res))
})

server.listen(port)
console.log('dev-server started port=' + port + ', root=' + root)

function getCmdLineArgv() {
    var args = {
        root: './',
        config: './proxy-rules.json',
        port: 3000,
    }
    var argvs = process.argv
    for (let i = 0; i< argvs.length ; i++) {
        if(argvs[i] === '--root'){
            args.root = argvs[i+1]
        }else if(argvs[i] === '--config'){
            args.config = argvs[i+1]
        }else if(argvs[i] === '--port'){
            args.port = argvs[i+1]
        }
    }
    return args;
}