var app = require('./app');
var https = require('https');
var util = {};

// This is utilty method for getting channel info from slack server.
util.getUserCountInChannel = function (token,channelId) {
 var extServerOptions = {
  hostname: 'slack.com',
  path: '/api/channels.info?token='+token+'&channel='+channelId,
  method: 'GET'
 };
 console.log(extServerOptions);
 var req = https.request(extServerOptions, (res) => {
  res.on('data', (d) => {
   process.stdout.write(d);
   return JSON.parse(d);
  });
 });
 req.end();
 req.on('error', (e) => {
  console.error(e);
  return JSON.parse(d);
 });
}

util.sortArrayBasedOnObjectProperty = function(items,prop){
  var sortedArray = items.sort(function(a,b){
    if (a.prop > b.prop) {
     return 1;
   }
   if (a.prop < b.prop) {
     return -1;
   }
   // a must be equal to b
   return 0;
 });
 return sortedArray;
}



 module.exports=util;
