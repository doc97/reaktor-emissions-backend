const emissionRouter = require('express').Router()
const updateService = require('../services/update')

emissionRouter.get('/', (request, response) => {
  updateService.update().then((result) => {
    response.json(JSON.stringify(result))
  })
})

module.exports = emissionRouter