var express = require('express');
var router = express.Router();

var reportController = require('../controllers/reports.controller')
var apikey = require('../middlewares/apikey')

router.route('/report').get(reportController.getReport); // this one is for debugging the template!
// router.route('/report').get(apikey.has_api_key, reportController.getReport);
router.route('/report').post(apikey.has_api_key, reportController.getReport);

module.exports = router;