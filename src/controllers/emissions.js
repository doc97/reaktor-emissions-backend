const emissionRouter = require('express').Router()
const Store = require('data-store')
const store = new Store('reaktor-emission-stats')
const logger = require('../utils/logger')
const updateService = require('../services/update')

const getCountry = (request, response) => {
  if (store.hasOwn(request.params.key))
    return store.get(request.params.key)

  response.status(400).send('Invalid country code!')
  return null
}

const getCountryProperty = (request, response, property) => {
  const country = getCountry(request, response)
  if (!country)
    return null

  if (country.hasOwnProperty(property))
    return country[property]

  response.status(400).send('Invalid property!')
  return null
}

emissionRouter.get('/', (request, response) => {
  response.json(JSON.parse(store.json()))
})

emissionRouter.get('/:key', (request, response) => {
  const country = getCountry(request, response)
  if (!country)
    return
  response.json(country)
})

emissionRouter.get('/:key/name', (request, response) => {
  const name = getCountryProperty(request, response, 'name')
  if (!name)
    return
  response.json({ name })
})

emissionRouter.get('/:key/:year', (request, response) => {
  const year = getCountryProperty(request, response, request.params.year)
  if (!year)
    return
  response.json(year)
})

emissionRouter.post('/update', (request, response) => {
  updateService.update().then(result => {
    store.set(result)
    response.json(JSON.parse(store.json()))
    logger.info('Updated!')
  })
})

module.exports = emissionRouter