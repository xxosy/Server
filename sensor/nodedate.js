#!/usr/bin/env node
var exec = require('child_process').exec;
exec("date", function (error, stdout, stderr) {
   console.log(stdout);
});