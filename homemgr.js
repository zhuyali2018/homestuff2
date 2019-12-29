var http = require('http');
var url = require('url');
var fs = require('fs');
var path = require('path')
var formidable = require('formidable');

//a file checker to make sure no overwriting of an existing file
function getGoodFn(pathfn) {
  var fn = pathfn;
  var ext = path.extname(fn);
  var base = path.basename(fn, ext);
  var rout = path.dirname(fn);

  var i = 1;
  for (; ;) {
    try {
      if (fs.existsSync(fn)) {
        if (i > 100) //try 100 times
          return "badname_" + i;
        fn = rout + "\\" + base + "_" + i + ext;
      } else {
        return fn;
      }
    } catch (err) {
      console.error(err);
    }
    i++;
  }
}

// response with a file uploading form
function response8(req, res, pid, iid) {
  console.log("In function response");
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.write("path: " + req.url);

  res.write('<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><title>Add an item</title></head>');
  res.write('<body> <font size="10"><form action="fileupload" method="post" enctype="multipart/form-data">');
  res.write('<table style="width:100%">');
  res.write('<tr>');
  const string = '<th align="right">Parent ID:</th><th align="left"> <input type="text" placeholder="Parent ID" name="parentID" xxxxxxxxxx style="height: 40px;"><br></th>';
  res.write(string.replace('xxxxxxxxxx', 'value="' + pid + '"'));
  res.write('</tr><tr>');
  const stritem = '<th align="right">Item ID:</th><th align="left"><input type="text" placeholder="My ID" name="itemID" value="yyyyyyyyyy" style="height: 40px;"><br></th>';
  res.write(stritem.replace('yyyyyyyyyy', '' + iid));
  res.write('</tr><tr>');
  res.write('<th align="right">Name:</th><th align="left"><input type="text" placeholder="name" name="name" size="40" style="height: 40px;"><br></th>');
  res.write('</tr><tr>');
  res.write('<th align="right">Description:</th><th align="left"><input type="text" placeholder="Description" name="description" size="60" style="height: 40px;"><br></th>');
  res.write('</tr><tr>');
  res.write('<th align="right"><input type="text" placeholder="Name your file" name="imagename" style="height: 30px;" ><br></th>');
  res.write('<th align="left"><input type="file" name="filetoupload"><br></th>');
  res.write('</tr><tr><br><br>');
  res.write('<th align="right"><input type="submit" style="height: 30px;"></th><th> </th>');
  res.write('</tr></table></form></font></body></html>');

  res.end();

}

const inffile = "homestuff.inf";
const inxfile = "homestuff.inx";
function add_record(line) {
  if (!fs.existsSync(inffile)) {
    fs.appendFile(inffile, "<RecordID=1>\n", (err) => {
      if (err) console.log(err);
      console.log("Successfully created file:" + inffile);
    });
  }
  if (!fs.existsSync(inxfile)) {
    fs.appendFile(inxfile, "\n", (err) => {
      if (err) console.log(err);
      console.log("Successfully created file:" + inxfile);
    });
  }

  console.log("added: " + line);
  fs.appendFile(inffile, line, (err) => {
    if (err) console.log(err);
    console.log("Successfully added to File.");
  });
}
function requestHandler(req, res) {
  console.log("debug 1:" + req.url)
  var now = new Date();
  var datestamp = "(" + now.getFullYear() + "-" + now.getMonth() + "-" + now.getDate() + ")";
  if (req.url == '/fileupload') {
    console.log("debug 2");
    //var q = url.parse(req.url, true).query;
    var form = new formidable.IncomingForm();
    form.parse(req, function (err, fields, files) {
      var parentID = fields.parentID;
      var itemID = fields.itemID;
      var itemName = fields.name;
      var desp = fields.description + "  " + datestamp;
      var imgname = fields.imagename;
      var orgname = files.filetoupload.name;
      var ext = path.extname(orgname);
      if (imgname == "") {
        imgname = orgname;
      } else {
        imgname = imgname + ext;
      }
      var oldpath = files.filetoupload.path;
      var newpath = './images/' + imgname;
      var newpath1 = getGoodFn(newpath);
      var newfn=path.basename(newpath1);      //filename only
      console.log("debug 4: " + imgname);
      console.log("oldpath: " + oldpath);
      console.log("newpath: " + newpath1);
      console.log("orgname: " + orgname);
      add_record(itemID + "^" + parentID + "^" + itemName + "^" + "::images/" + newfn + "^" + desp + "^nodetail\n");
      fs.rename(oldpath, newpath1, function (err) {
        if (err) throw err;
      });
      response8(req, res, parentID, parseInt(itemID) + 1);   //keep the parent ID and increase item ID by one
    });
  } else {
    console.log("debug 3")
    response8(req, res, 0, 9);
  }
}

var server = http.createServer(requestHandler).listen(8080);
console.log("InfoMgr ver 3.21");
