const fs = require('fs')
const AdmZip = require('adm-zip')
const xml2js = require('xml2js')
const dataService = require('../services/data')
const logger = require('../utils/logger')

const cleanup = (targetname) => {
  fs.unlinkSync(`${targetname}.xml`)
  fs.unlinkSync(`${targetname}.zip`)
}

const unzip = (targetname, data) => {
  try {
    const zipfile = `${targetname}.zip`
    const xmlfile = `${targetname}.xml`

    fs.writeFileSync(zipfile, data, { encoding: null })
    const zip = new AdmZip(zipfile)
    const entries = zip.getEntries()

    // Extract the one file
    if (entries.length > 0) {
      const filename = entries[0].entryName
      zip.extractEntryTo(filename, '.')
      fs.renameSync(filename, xmlfile)
    } else {
      logger.error('ERROR: ZIP file was empty!')
    }
  } catch (err) {
    logger.error(err)
  }
}

const parseXmlToJs = (filepath) => {
  const xmldata = fs.readFileSync(filepath, { encoding: 'utf-8' })
  let jsondata
  const parser = xml2js.Parser({
    explicitArray: false
  })
  parser.parseString(xmldata, (jsonErr, result) => {
    if (!jsonErr) {
      jsondata = result
    } else {
      logger.error('ERR: ', jsonErr)
    }
  })

  if (jsondata)
    return jsondata.Root.data
  return null
}

const downloadAllZip = () => {
  return dataService.getAllData()
          .then(data => {
            unzip('emissions', data.emission)
            unzip('population', data.population)
          })
}

const parseFieldData = (elem) => {
  const fields = elem.field
  const countryKey = fields[0].$.key
  const countryName = fields[0]._
  const year = fields[2]._
  const value = fields[3]._

  return { countryKey, countryName, year, value }
}

const setBasicData = (container, key, name) => {
  if (container[key] === undefined)
    container[key] = {}
  container[key].key = key
  container[key].name = name
}

const setYearlyData = (country, year, propertyName, value) => {
  if (country.yearlyData === undefined)
    country.yearlyData = {}
  if (country.yearlyData[year] === undefined)
    country.yearlyData[year] = {}
  country.yearlyData[year][propertyName] = value !== undefined ? value : null
}

const combineData = (populationData, emissionData) => {
  combined = {}
  populationData.forEach(elem => {
    const data = parseFieldData(elem)
    setBasicData(combined, data.countryKey, data.countryName)
    setYearlyData(combined[data.countryKey], data.year, 'population', data.value)
  })
  emissionData.forEach(elem => {
    const data = parseFieldData(elem)
    setBasicData(combined, data.countryKey, data.countryName)
    setYearlyData(combined[data.countryKey], data.year, 'emissions', data.value)
  })

  return combined
}

const update = () => {
  return downloadAllZip().then(() => {
    const population = parseXmlToJs('population.xml')
    const emissions = parseXmlToJs('emissions.xml')
    const combined = combineData(population.record, emissions.record)
    cleanup('population')
    cleanup('emissions')
    return combined
  })
}

module.exports = { update }