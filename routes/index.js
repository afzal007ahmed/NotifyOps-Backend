const { v1Routes } = require('./v1');

const allRoutes = require('express').Router() ;


allRoutes.use('/v1' , v1Routes)

module.exports = { allRoutes } ;