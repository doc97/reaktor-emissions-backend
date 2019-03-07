const fs = require('fs')
const AdmZip = require('adm-zip')
const xml2js = require('xml2js')
const dataService = require('../services/data')
const logger = require('../utils/logger')

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
      fs.unlinkSync(zipfile)
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

const downloadPopulationZip = () => {
  return dataService.getPopulationData()
          .then(data => unzip('population', data))
}

const downloadEmissionZip = () => {
  return dataService.getEmissionData()
          .then(data => unzip('emissions', data))
}

const downloadAllZip = () => {
  return dataService.getAllData()
          .then(data => {
            unzip('emissions', data.emission)
            unzip('population', data.population)
          })
}

const combineData = (populationData, emissionData) => {
  combined = {}
  populationData.forEach(elem => {
    const fields = elem.field
    const countryKey = fields[0].$.key
    const countryName = fields[0]._
    const year = fields[2]._
    const value = fields[3]._
    
    if (combined[countryKey] === undefined)
      combined[countryKey] = {}
    combined[countryKey].name = countryName

    if (combined[countryKey][year] === undefined)
      combined[countryKey][year] = {}
    combined[countryKey][year].population = value !== undefined ? value : null
  })
  emissionData.forEach(elem => {
    const fields = elem.field
    const countryKey = fields[0].$.key
    const countryName = fields[0]._
    const year = fields[2]._
    const value = fields[3]._
    
    if (combined[countryKey] === undefined)
      combined[countryKey] = {}
    combined[countryKey].name = countryName

    if (combined[countryKey][year] === undefined)
      combined[countryKey][year] = {}
    combined[countryKey][year].emissions = value !== undefined ? value : null
  })

  return combined
}

const update = () => {
  return downloadAllZip().then(() => {
    const population = parseXmlToJs('population.xml')
    const emissions = parseXmlToJs('emissions.xml')
    const combined = combineData(population.record, emissions.record)
    return combined
  })
}

module.exports = { update }