var ejs = require('ejs');
var fs = require('fs');
var path = require('path');
var pdf = require('html-pdf');
var AWS = require('aws-sdk');
var tso = require('timesolver/timeSolver.min');

// THIS IS FOR DEBUGGING, ONLY ON NODE_ENV=development
exports.getReportHTML = function (req, res) {
  var html = getHTML(req);
  res.send(html);
};

// THIS RENDERS THE PDF ON THE BROWSER'S SCREEN
exports.getReportPDF = function (req, res) {
  var html = getHTML(req);
  pdf.create(html, { format: 'Letter' }).toBuffer(function(err, buffer){
    if (err) { sendPDFErr(err, res) }
    res.setHeader('Content-type', 'application/pdf');
    res.send(Buffer.from(buffer, 'base64'));
  });
};

// THIS RETURNS A JSON OBJECT WITH AWS S3 FILE KEY AND PUBLIC URL (IF BUCKET ISN'T PUBLIC WILL DENY ACCESS TO FILE ANYWAYS)
exports.getReportFromS3 = function (req, res) {
  var html = getHTML(req);
  pdf.create(html, { format: 'Letter' }).toBuffer(function(err, buffer){
    if (err) { sendPDFErr(err, res) }
    sendToS3(Buffer.from(buffer, 'base64'), 'report.pdf', res);
  });
};

function getHTML(req) {
  var data = req.data || getExampleData();
  var template = fs.readFileSync(path.join(__dirname, "../templates/report.ejs"), 'utf-8');
  var html = ejs.render(template, data);
  return html;
}
function sendPDFErr(err, res) {
  res.status(500);
  res.json({ error: err.message || 'Unknown error creating PDF file'});
}
function sendToS3(b64Buffer, fileName, res) {
  // add dates to file and build URL
  fileName = buildFileName(fileName);
  url = buildS3URL(fileName);

  var s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    Bucket: process.env.AWS_S3_BUCKET,
  });
  s3.putObject({
    Bucket: process.env.AWS_S3_BUCKET,
    Key: fileName,
    Body: b64Buffer
  }, (err, data) => {
    if (err) {
      console.log(err);
      res.status(500);
      res.json({ error: err.message });
    }
    console.log(data);
    res.status(201);
    res.json({ status: 201, fileKey: fileName, ETag: data.ETag, filePublicURL: url });
  });
}

function buildFileName(nameStr) {
  var d = new Date();
  nameStr = nameStr.toLowerCase().split('.pdf')[0];
  return `${nameStr}-${tso.getString(d, "YYYY-MM-DD")}-${d.getTime()}.pdf`;
}
function buildS3URL(fileName) {
  return `https://${process.env.AWS_S3_BUCKET}.s3-${process.env.AWS_S3_REGION}.amazonaws.com/${fileName}`;
}

function getExampleData() {
  return {
    title: "EXAMPLE REPORT",
    date: "2012-01-01",
    body: `
    Conceived as a server-side language by Brendan Eich (then employed by the Netscape Corporation), JavaScript soon came to Netscape Navigator 2.0 in September 1995. JavaScript enjoyed immediate success and Internet Explorer 3.0 introduced JavaScript support under the name JScript in August 1996.

    In November 1996, Netscape began working with ECMA International to make JavaScript an industry standard. Since then, the standardized JavaScript is called ECMAScript and specified under ECMA-262, whose latest (nine, ES2018) edition is available in June 2018.
    
    Recently, JavaScript's popularity has expanded even further through the successful Node.js platform—the most popular cross-platform JavaScript runtime environment outside the browser. Node.js allows developers to use JavaScript as a scripting language to automate things on a PC and build fully functional HTTP and Web Sockets servers.
    `,
    footer: "text footer"
  };
}