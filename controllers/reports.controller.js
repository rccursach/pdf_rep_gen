var ejs = require('ejs');
var fs = require('fs');
var path = require('path');
var pdf = require('html-pdf');

exports.getReport = function (req, res) {
  var data = req.data || getExampleData();
  var template = fs.readFileSync(path.join(__dirname, "../templates/report.ejs"), 'utf-8');

  var html = ejs.render(template, data);
  // res.json(data);
  res.send(html)
};

exports.getReportPDF = function (req, res) {
  var data = req.data || getExampleData();
  var template = fs.readFileSync(path.join(__dirname, "../templates/report.ejs"), 'utf-8');

  var html = ejs.render(template, data);
  pdf.create(html, { format: 'Letter' }).toBuffer(function(err, buffer){
    if (err) {
      res.send("error")
    }
    res.setHeader('Content-type', 'application/pdf');
    res.send(Buffer.from(buffer, 'base64'));
    // buffer can be encodead as binary and stream the blob to an S3 Bucket
  });
};

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