var express = require('express'),
    app = express();

app.use("/lib", express.static("lib"));
app.use("/tests", express.static("tests"));

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/index.html');
});

app.listen(8000);
console.log("Running server at port 8000!");