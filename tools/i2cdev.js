/**
 * This module extends the i2c library with some extra functionality available
 * in the i2cdev library. Eventually the hope is to extend this from a more
 * node "native" i2c module.
 */

var util = require('util');
var i2c = require('i2c');

function I2cDev(address, options) {
    i2c.call(this, address, options);
}

util.inherits(I2cDev, i2c);

I2cDev.prototype.bitMask = function(bit, bitLength) {
    return ((1 << bitLength) - 1) << (1 + bit - bitLength);
};

I2cDev.prototype.readBits = function(func, bit, bitLength, callback) {
    var mask = this.bitMask(bit, bitLength);
    
    if (callback) {
    	this.readBytes(func, 1, function(err, buf) {
		    var bits = (buf[0] & mask) >> (1 + bit - bitLength);
		    callback(err, bits);
    	});
    } else {
	    var buf = this.readBytes(func, 1);
	    return (buf[0] & mask) >> (1 + bit - bitLength);
    }
};

I2cDev.prototype.readBit = function(func, bit, bitLength, callback) {
    return this.readBits(func, bit, 1, callback);
};

I2cDev.prototype.writeBits = function(func, bit, bitLength, value, callback) {
    var oldValue = this.readBytes(func, 1);
    var mask = this.bitMask(bit, bitLength);
    var newValue = oldValue ^ ((oldValue ^ (value << bit)) & mask);
    this.writeBytes(func, [newValue], callback);
};

I2cDev.prototype.writeBit = function(func, bit, value, callback) {
    this.writeBits(func, bit, 1, value, callback);
};

/* TODO
static int8_t readBitW(bool useSPI, uint8_t devAddr, uint8_t regAddr, uint8_t bitNum, uint16_t *data, uint16_t timeout=I2Cdev::readTimeout);
static int8_t readBitsW(bool useSPI, uint8_t devAddr, uint8_t regAddr, uint8_t bitStart, uint8_t length, uint16_t *data, uint16_t timeout=I2Cdev::readTimeout);
static int8_t readWord(bool useSPI, uint8_t devAddr, uint8_t regAddr, uint16_t *data, uint16_t timeout=I2Cdev::readTimeout);
static int8_t readWords(bool useSPI, uint8_t devAddr, uint8_t regAddr, uint8_t length, uint16_t *data, uint16_t timeout=I2Cdev::readTimeout);

static bool writeBitW(bool useSPI, uint8_t devAddr, uint8_t regAddr, uint8_t bitNum, uint16_t data);
static bool writeBitsW(bool useSPI, uint8_t devAddr, uint8_t regAddr, uint8_t bitStart, uint8_t length, uint16_t data);
static bool writeWord(bool useSPI, uint8_t devAddr, uint8_t regAddr, uint16_t data);
static bool writeWords(bool useSPI, uint8_t devAddr, uint8_t regAddr, uint8_t length, uint16_t *data);
*/

module.exports = I2cDev;