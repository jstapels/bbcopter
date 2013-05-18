var color = require('cli-color');
var logFilePath = "./logs.txt";
var fs = require('fs');
var ErrorType = {
	CRITICAL : 1,
	ERROR : 2,
	WARNING : 3,
	ALERT : 4,
	DEBUG : 5,
	INFO : 6
};

var Log = {};
Log.init = function() {
	fs.writeFileSync(logFilePath, "");
}

Log.critical = function(msg) {
	var message = "CRITICAL: " + getCurrentTime() + " - " + msg;
	sendToConsole("magentaBright", message);
	writeToFile(message);
}

Log.error = function(msg) {
	var message = "ERROR: " + getCurrentTime() + " - " + msg;
	sendToConsole("redBright", message);
	writeToFile(message);
}

Log.debug = function(msg) {
	var message = "DEBUG: " + getCurrentTime() + " - " + msg;
	if (global.config.debug) {
		sendToConsole("yellowBright", message);
	}
	writeToFile(message);
}

Log.info = function(msg) {
	var message = "INFO: " + getCurrentTime() + " - " + msg;
	sendToConsole("blueBright", message);
	writeToFile(message);
}
function getCurrentTime() {
	var date = new Date();
	return date.getHours().toString() + ":" + date.getMinutes().toString() + ":" + date.getSeconds().toString() + "." + date.getMilliseconds();
}

function sendToConsole(theColor, msg) {
	console.log(color[theColor](msg));
}

function writeToFile(msg) {
	fs.appendFileSync(logFilePath, msg + "\n");
}

module.exports = Log; 