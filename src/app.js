const express = require('express')
const app = express()
const middleware = require('./utils/middleware')
const emissionsRouter = require('./controllers/emissions')

app.use(express.static('build'))
app.use(middleware.requestLogger)

app.use('/api/emissions', emissionsRouter)

app.use(middleware.unknownEndpoint)
app.use(middleware.errorHandler)

module.exports = app