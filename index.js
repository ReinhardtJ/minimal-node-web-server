const chalk = require('chalk')

function buildExpressApp() {
  let express = require('express')
  let bodyParser = require('body-parser')
  let logger = require('morgan')
  let compression = require('compression')
  let path = require('path')
  let app = express()

  app.use(compression())
  app.use(bodyParser.json())
  app.use(bodyParser.urlencoded({ extended: false }))
  app.use(logger('dev'))
  app.use('/', express.static(path.join(__dirname, 'public')))

  return app
}

function checkHttps(app) {
  let sslify = require('express-sslify')
  let enforcer = require('./enforceHttps')

  let enforceHttps = process.env.ENFORCE_HTTPS || false

  let redirectToHttps = enforcer.shouldRedirect(enforceHttps, process.env.NODE_ENV, process.env.ENVIRONMENTS)

  if(redirectToHttps) {
    console.log(chalk.red('HTTP -> HTTPS enabled.'))
    enforcer.enforce(app, sslify.HTTPS, process.env.ENFORCE_HTTPS)
  }
}

console.log(`Current Environment: ${chalk.blue(process.env.NODE_ENV)}.`)

let http = require('http')
let app = buildExpressApp()
checkHttps(app)

let server = http.createServer(app)

let port = process.env.PORT || 3000

server.listen(port, function () {
  console.log(chalk`Server listening on port {bold.blue ${port}} inside the container`)
  console.log(chalk`{bgYellow.black Attenion:} To access server, use {bold http://localhost:EXTERNAL_PORT}`)
  console.log(chalk`EXTERNAL_PORT is specified with {bold 'docker run -p EXTERNAL_PORT:${port}'}. See {bold 'package.json->imagePort'} for the default port.`)
})
