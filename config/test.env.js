'use strict'
const merge = require('webpack-merge')
const prodEnv = require('./prod.env')

module.exports = merge(prodEnv, {
    NODE_ENV: '"testing"',
    API_HOST: 'location.protocol + "//" + location.hostname + (location.port ? ":" + location.port : "") + "/api"'
})
