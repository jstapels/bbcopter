
function FourthOrderFilter() {
	this.fourthOrder = [{},{},{},{}];
	this.fourthOrder[XAXIS].inputTm1 = 0.0;
	this.fourthOrder[XAXIS].inputTm2 = 0.0;
	this.fourthOrder[XAXIS].inputTm3 = 0.0;
	this.fourthOrder[XAXIS].inputTm4 = 0.0;

	this.fourthOrder[XAXIS].outputTm1 = 0.0;
	this.fourthOrder[XAXIS].outputTm2 = 0.0;
	this.fourthOrder[XAXIS].outputTm3 = 0.0;
	this.fourthOrder[XAXIS].outputTm4 = 0.0;

	//////////
	this.fourthOrder[YAXIS].inputTm1 = 0.0;
	this.fourthOrder[YAXIS].inputTm2 = 0.0;
	this.fourthOrder[YAXIS].inputTm3 = 0.0;
	this.fourthOrder[YAXIS].inputTm4 = 0.0;

	this.fourthOrder[YAXIS].outputTm1 = 0.0;
	this.fourthOrder[YAXIS].outputTm2 = 0.0;
	this.fourthOrder[YAXIS].outputTm3 = 0.0;
	this.fourthOrder[YAXIS].outputTm4 = 0.0;

	//////////
	this.fourthOrder[ZAXIS].inputTm1 = -9.8065;
	this.fourthOrder[ZAXIS].inputTm2 = -9.8065;
	this.fourthOrder[ZAXIS].inputTm3 = -9.8065;
	this.fourthOrder[ZAXIS].inputTm4 = -9.8065;

	this.fourthOrder[ZAXIS].outputTm1 = -9.8065;
	this.fourthOrder[ZAXIS].outputTm2 = -9.8065;
	this.fourthOrder[ZAXIS].outputTm3 = -9.8065;
	this.fourthOrder[ZAXIS].outputTm4 = -9.8065;
}

//public function
FourthOrderFilter.prototype.computeFourthOrder = function(currentInput, fourthOrderData) {
	// cheby2(4,60,12.5/50)
	var _b0 = 0.001893594048567;
	var _b1 = -0.002220262954039;
	var _b2 = 0.003389066536478;
	var _b3 = -0.002220262954039;
	var _b4 = 0.001893594048567;

	var _a1 = -3.362256889209355;
	var _a2 = 4.282608240117919;
	var _a3 = -2.444765517272841;
	var _a4 = 0.527149895089809;

	var output;

	output = _b0 * currentInput + _b1 * fourthOrderData.inputTm1 + _b2 * fourthOrderData.inputTm2 + _b3 * fourthOrderData.inputTm3 + _b4 * fourthOrderData.inputTm4 - _a1 * fourthOrderData.outputTm1 - _a2 * fourthOrderData.outputTm2 - _a3 * fourthOrderData.outputTm3 - _a4 * fourthOrderData.outputTm4;

	fourthOrderData.inputTm4 = fourthOrderData.inputTm3;
	fourthOrderData.inputTm3 = fourthOrderData.inputTm2;
	fourthOrderData.inputTm2 = fourthOrderData.inputTm1;
	fourthOrderData.inputTm1 = currentInput;

	fourthOrderData.outputTm4 = fourthOrderData.outputTm3;
	fourthOrderData.outputTm3 = fourthOrderData.outputTm2;
	fourthOrderData.outputTm2 = fourthOrderData.outputTm1;
	fourthOrderData.outputTm1 = output;

	return output;
}

module.exports = FourthOrderFilter; 