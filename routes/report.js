var express = require('express');
var router = express.Router();

var reportController = require('../controllers/reports.controller')
var apikey = require('../middlewares/apikey')

if (process.env.NODE_ENV === 'development') {
  router.route('/html').get(reportController.getReportHTML);    // FOR DEBUGGING THE TEMPLATE
}
router.route('/pdf').post(apikey, reportController.getReportPDF);       // Renders the PDF on the browser's screen
router.route('/s3').post(apikey, reportController.getReportFromS3);     // Returns JSON Obj with AWS S3 file key and URL for PDF report

module.exports = router;