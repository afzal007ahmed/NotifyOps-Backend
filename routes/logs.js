const { logsController } = require('../controllers/logs');

const logsRouter = require('express').Router() ;

logsRouter.get("/:id" , logsController.getAllLogs ) ;

module.exports = { logsRouter } ;