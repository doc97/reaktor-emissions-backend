const express = require('express')
const cors = require('cors')
const app = express()
const middleware = require('./utils/middleware')
const emissionsRouter = require('./controllers/emissions')

app.use(express.static('build'))
app.use(cors())
app.use(middleware.requestLogger)

app.use('/api/emissions', emissionsRouter)

app.use(middleware.unknownEndpoint)
app.use(middleware.errorHandler)

module.exports = app