var
  fs = require('fs'),
  endOfLine = require('os').EOL,
  //logger = new console.Console(fs.createWriteStream(__dirname + '/what-happened.log', {flags: 'a'}));
  logger = console;

module.exports.log = function(data) {
  logger.log(data);
  logger.log(endOfLine);
}
