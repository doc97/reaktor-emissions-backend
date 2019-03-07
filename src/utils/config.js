if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}

let PORT = process.env.PORT

if (process.env.NODE_ENV === 'test') {
  PORT = process.env.TEST_PORT
}

module.exports = {
  PORT
}