const express = require('express')
const path = require('path')
const cors = require('cors')
const app = express()
const middleware = require('./utils/middleware')
const emissionsRouter = require('./controllers/emissions')

app.use(express.static('build'))
app.use(cors())
app.use(middleware.requestLogger)

app.use('/api/emissions', emissionsRouter)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../build/index.html'))
})

app.use(middleware.unknownEndpoint)
app.use(middleware.errorHandler)

module.exports = app