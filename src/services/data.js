const axios = require('axios')

const format = 'downloadformat=xml'
const baseUrl = 'http://api.worldbank.org/v2/en/indicator'
const emissionUrl = `${baseUrl}/EN.ATM.CO2E.KT?${format}`
const populationUrl = `${baseUrl}/SP.POP.TOTL?${format}`

// We're downloading zip files
const config = {
  responseType: 'arraybuffer'
}

const getPopulationData = () => {
  const request = axios.get(populationUrl, config)
  return request.then(res => res.data)
}

const getEmissionData = () => {
  const request = axios.get(emissionUrl, config)
  return request.then(res => res.data)
}

const getAllData = () => {
  const request = axios.all([
    axios.get(emissionUrl, config),
    axios.get(populationUrl, config),
  ])
  return request.then(axios.spread((emissionData, populationData) => {
    return {
      emission: emissionData.data, 
      population: populationData.data
    }
  }))
}

module.exports = { getEmissionData, getPopulationData, getAllData }