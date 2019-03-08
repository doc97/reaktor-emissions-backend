const config = require('./utils/config')
const app = require('./app')
const http = require('http')
const Store = require('data-store')
const updateService = require('./services/update')
const logger = require('./utils/logger')

const server = http.createServer(app)

const store = new Store('reaktor-emission-stats')

// Update data store every time the server is restarted
updateService.update().then(result => {
  store.set(result)
  logger.info('Updated!')
})

server.listen(config.PORT, () => {
  logger.info(`Server running on port ${config.PORT}`)
})