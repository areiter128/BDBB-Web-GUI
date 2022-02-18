"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var MCUWebSerial = /** @class */ (function () {
    function MCUWebSerial() {
        var _this = this;
        this.encoder = new TextEncoder();
        this.decoder = new TextDecoder();
        this.connectButtonElem = document.getElementById('connect-to-serial');
        this.messageButtons = document.querySelectorAll('.message-button');
        this.logMessageContainer = document.getElementById('commentField');
        this.readButton = document.getElementById('read-data');
        this.setirefButton = document.getElementById('setIrefBtn');
        this.incButton = document.getElementById('incIrefBtn');
        this.startButton = document.getElementById('startBtn');
        this.stopButton = document.getElementById('stopBtn');
        this.hvDisp = document.getElementById('hvField');
        this.lvDisp = document.getElementById('lvField');
        this.tempDisp = document.getElementById('tempField');
        this.ctDisp = document.getElementById('ctField');
        this.c1Disp = document.getElementById('c1Field');
        this.c2Disp = document.getElementById('c2Field');
        this.irefInput = document.getElementById('irefField');
        this.offsetInput = document.getElementById('offsetField');
        this.iref16Input = document.getElementById('iref16Field');
        this.deltaIrefInput = document.getElementById('deltaIrefField');
        this.scale = 3.3 / 4096;
        this.BUCK_ISNS_FEEDBACK_GAIN = 0.01;
        this.connectButtonElem.onclick = function () { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.init()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); };
        this.readButton.onclick = function () {
            _this.write('A');
            _this.getData();
        };
        this.irefInput.addEventListener('input', function () {
            var irefValue = parseInt(_this.irefInput.value, 10) * _this.BUCK_ISNS_FEEDBACK_GAIN / _this.scale + parseInt(_this.offsetInput.value);
            _this.iref16Input.value = String(irefValue.toFixed(0));
        });
        this.offsetInput.addEventListener('input', function () {
            var irefValue = parseInt(_this.irefInput.value, 10) * _this.BUCK_ISNS_FEEDBACK_GAIN / _this.scale + parseInt(_this.offsetInput.value);
            _this.iref16Input.value = String(irefValue.toFixed(0));
        });
        this.startButton.onclick = function () {
            _this.write('G');
            _this.verifyResponse('G');
        };
        this.stopButton.onclick = function () {
            _this.write('x');
            _this.verifyResponse('x');
        };
        this.setirefButton.onclick = function () {
            if (_this.iref16Input.value == '') {
                var irefValue = parseInt(_this.irefInput.value, 10) * _this.BUCK_ISNS_FEEDBACK_GAIN / _this.scale + parseInt(_this.offsetInput.value);
                _this.iref16Input.value = String(irefValue.toFixed(0));
            }
            _this.writeE(_this.encodeData('e', parseInt(_this.iref16Input.value, 10)));
            _this.verifyResponse('e', parseInt(_this.iref16Input.value, 10));
        };
        this.incButton.onclick = function () {
            var irefNewValue = parseInt(_this.irefInput.value) + parseInt(_this.deltaIrefInput.value);
            _this.irefInput.value = String(irefNewValue);
            var irefValue = parseInt(_this.irefInput.value, 10) * _this.BUCK_ISNS_FEEDBACK_GAIN / _this.scale + parseInt(_this.offsetInput.value);
            _this.iref16Input.value = String(irefValue.toFixed(0));
            _this.writeE(_this.encodeData('e', parseInt(irefValue.toFixed(0))));
            _this.verifyResponse('e', parseInt(irefValue.toFixed(0)));
        };
    }
    MCUWebSerial.prototype.init = function () {
        return __awaiter(this, void 0, void 0, function () {
            var now, port_1, signals, msg, err_1, msg, msg;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        now = new Date();
                        if (!('serial' in navigator)) return [3 /*break*/, 7];
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 5, , 6]);
                        return [4 /*yield*/, navigator.serial.requestPort()];
                    case 2:
                        port_1 = _a.sent();
                        return [4 /*yield*/, port_1.open({ baudRate: 9600 })];
                    case 3:
                        _a.sent(); // `baudRate` was `baudrate` in previous versions.
                        this.writer = port_1.writable.getWriter();
                        this.reader = port_1.readable.getReader();
                        return [4 /*yield*/, port_1.getSignals()];
                    case 4:
                        signals = _a.sent();
                        console.log(signals);
                        this.systemStat = 1;
                        // enable control buttons
                        this.messageButtons.forEach(function (button) {
                            button.removeAttribute('disabled');
                        });
                        msg = now.getHours() + ":" + now.getMinutes() + "  Connected.\n";
                        this.logMessageContainer.value += msg;
                        port_1.addEventListener('disconnect', function () {
                            // Remove `e.target` from the list of available ports.
                            var now = new Date();
                            var msg = now.getHours() + ":" + now.getMinutes() + "  Serial port disconnected.\n";
                            _this.logMessageContainer.value += msg;
                            // disable control buttons
                            _this.messageButtons.forEach(function (button) {
                                button.setAttribute('disabled', '');
                            });
                            _this.connectButtonElem.innerText = "Connect";
                            _this.connectButtonElem.onclick = function () { return __awaiter(_this, void 0, void 0, function () {
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0: return [4 /*yield*/, this.init()];
                                        case 1:
                                            _a.sent();
                                            return [2 /*return*/];
                                    }
                                });
                            }); };
                            console.log('Serial port disconnected.');
                        });
                        //change connect button function
                        this.connectButtonElem.innerText = "Disconnect";
                        this.connectButtonElem.setAttribute('class', 'redBtn');
                        this.connectButtonElem.onclick = function () { return __awaiter(_this, void 0, void 0, function () {
                            var now, msg;
                            var _this = this;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        this.reader.releaseLock();
                                        try {
                                            this.reader.cancel();
                                        }
                                        catch (err) {
                                            console.error('No reader to cancel');
                                        }
                                        this.writer.releaseLock();
                                        return [4 /*yield*/, port_1.close()];
                                    case 1:
                                        _a.sent();
                                        this.connectButtonElem.innerText = "Connect";
                                        this.connectButtonElem.removeAttribute('class');
                                        this.connectButtonElem.onclick = function () { return __awaiter(_this, void 0, void 0, function () {
                                            return __generator(this, function (_a) {
                                                switch (_a.label) {
                                                    case 0: return [4 /*yield*/, this.init()];
                                                    case 1:
                                                        _a.sent();
                                                        return [2 /*return*/];
                                                }
                                            });
                                        }); };
                                        // disable control buttons
                                        this.messageButtons.forEach(function (button) {
                                            button.setAttribute('disabled', '');
                                        });
                                        now = new Date();
                                        msg = now.getHours() + ":" + now.getMinutes() + "  User interrupt. Disconnected.\n";
                                        this.logMessageContainer.value += msg;
                                        this.logMessageContainer.scrollTop = this.logMessageContainer.scrollHeight;
                                        return [2 /*return*/];
                                }
                            });
                        }); };
                        return [3 /*break*/, 6];
                    case 5:
                        err_1 = _a.sent();
                        this.systemStat = 2;
                        msg = now.getHours() + ":" + now.getMinutes() + "  An error occured while trying to open the serial port.\n";
                        this.logMessageContainer.value += msg;
                        this.logMessageContainer.scrollTop = this.logMessageContainer.scrollHeight;
                        return [3 /*break*/, 6];
                    case 6: return [3 /*break*/, 8];
                    case 7:
                        msg = now.getHours() + ":" + now.getMinutes() + "  Web serial is not supported in this broswer. Please use Microsoft Edge or Chrome with experimental feature enabled.\n";
                        this.logMessageContainer.value += msg;
                        this.logMessageContainer.scrollTop = this.logMessageContainer.scrollHeight;
                        console.error('Web serial doesn\'t seem to be enabled in your browser. Try enabling it by visiting:');
                        console.error('chrome://flags/#enable-experimental-web-platform-features');
                        console.error('opera://flags/#enable-experimental-web-platform-features');
                        console.error('edge://flags/#enable-experimental-web-platform-features');
                        this.systemStat = 0;
                        _a.label = 8;
                    case 8: return [2 /*return*/];
                }
            });
        });
    };
    /**
   * Takes a string of data, encodes it and then writes it using the `writer` attached to the serial port.
   * @param data - A string of data that will be sent to the Serial port.
   * @returns An empty promise after the message has been written.
   */
    MCUWebSerial.prototype.write = function (data) {
        return __awaiter(this, void 0, void 0, function () {
            var dataArrayBuffer;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        dataArrayBuffer = this.encoder.encode(data);
                        return [4 /*yield*/, this.writer.write(dataArrayBuffer)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
   * Takes already encoded and then writes it using the `writer` attached to the serial port.
   * @param edata - already encoded data that will be sent to the Serial port.
   * @returns An empty promise after the message has been written.
   */
    MCUWebSerial.prototype.writeE = function (data) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.writer.write(data)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * Gets data from the `reader`, decodes it and returns it inside a promise.
     * @returns A promise containing either the message from the `reader` or an error.
     */
    MCUWebSerial.prototype.read = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a, value, done, err_2, errorMessage;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.reader.read()];
                    case 1:
                        _a = _b.sent(), value = _a.value, done = _a.done;
                        // console.log(readerData.value);
                        if (done) {
                            this.reader.releaseLock();
                        }
                        return [2 /*return*/, value];
                    case 2:
                        err_2 = _b.sent();
                        errorMessage = "error reading data: " + err_2;
                        console.error(errorMessage);
                        return [2 /*return*/, errorMessage];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    MCUWebSerial.prototype.sleep = function (ms) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (resolve) { return setTimeout(resolve, ms); })];
            });
        });
    };
    MCUWebSerial.prototype.encodeData = function (s1, n1) {
        var data = new Uint8Array(4);
        data[0] = s1.charCodeAt(0);
        data[1] = n1 & 0xFF;
        data[2] = n1 >> 8;
        var checksum = data[0] + data[1] + data[2];
        data[3] = checksum % 256;
        return data;
    };
    MCUWebSerial.prototype.decodeInt = function (str) {
        var num = parseInt(str[0], 10);
        if (str.length == 2) {
            num += (parseInt(str[1], 10) << 8);
        }
        return num;
    };
    MCUWebSerial.prototype.decodeIntSigned = function (str) {
        var bitwidth = 8 * str.length;
        var val = this.decodeInt(str);
        var isnegative = val & (1 << (bitwidth - 1));
        var boundary = (1 << bitwidth);
        var minval = -boundary;
        var mask = boundary - 1;
        return isnegative ? minval + (val & mask) : val;
    };
    MCUWebSerial.prototype.getData = function () {
        return __awaiter(this, void 0, void 0, function () {
            var now, returnData, i1, i2, i3, i4, i7, i8, i1n, i2n, i3n, i4n, i7n, displayData, msg;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        now = new Date();
                        // const listElement = document.createElement('li');
                        return [4 /*yield*/, this.sleep(300)];
                    case 1:
                        // const listElement = document.createElement('li');
                        _a.sent();
                        return [4 /*yield*/, this.read()];
                    case 2:
                        returnData = _a.sent();
                        i1 = this.decodeInt(returnData.slice(0, 2));
                        i2 = this.decodeInt(returnData.slice(2, 4));
                        i3 = this.decodeInt(returnData.slice(4, 6));
                        i4 = this.decodeInt(returnData.slice(6, 8));
                        i7 = this.decodeInt(returnData.slice(12, 14));
                        i8 = this.decodeInt(returnData.slice(14, 15));
                        i1n = i1 * this.scale * (100 + 5.362) / 5.36;
                        this.lvDisp.value = i1n.toFixed(2) + " V";
                        i2n = i2 * this.scale * (100 + 5.362) / 5.36;
                        this.hvDisp.value = i2n.toFixed(2) + " V";
                        i3n = -(i3 - 1938) * this.scale / 0.01;
                        i4n = -(i4 - 1942) * this.scale / 0.01;
                        this.c1Disp.value = i3n.toFixed(1) + " A";
                        this.c2Disp.value = i4n.toFixed(1) + " A";
                        this.ctDisp.value = (i4n + i3n).toFixed(1) + " A";
                        i7n = i7 * 0.2315 - 273;
                        this.tempDisp.value = i7n.toFixed(1) + " \u00B0C";
                        displayData = "Data received. System state:" + i8 + ".";
                        msg = now.getHours() + ":" + now.getMinutes() + "  " + displayData + "\n";
                        this.logMessageContainer.value += msg;
                        this.logMessageContainer.scrollTop = this.logMessageContainer.scrollHeight;
                        return [2 /*return*/];
                }
            });
        });
    };
    MCUWebSerial.prototype.verifyResponse = function (cmd, n1) {
        return __awaiter(this, void 0, void 0, function () {
            var now, returnData, i1, msg, msg, i1, msg, msg, msg;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        now = new Date();
                        return [4 /*yield*/, this.sleep(150)];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.read()];
                    case 2:
                        returnData = _a.sent();
                        if (cmd.charCodeAt(0) == this.decodeInt(returnData.slice(0, 1))) {
                            if (cmd == 'G') {
                                i1 = this.decodeInt(returnData.slice(1, 3));
                                msg = now.getHours() + ":" + now.getMinutes() + "  Starting boost. Iset_adc = " + i1 + ".\n";
                                this.logMessageContainer.value += msg;
                                this.logMessageContainer.scrollTop = this.logMessageContainer.scrollHeight;
                            }
                            else if (cmd == 'x') {
                                msg = now.getHours() + ":" + now.getMinutes() + "  Shutting down.\n";
                                this.logMessageContainer.value += msg;
                                this.logMessageContainer.scrollTop = this.logMessageContainer.scrollHeight;
                            }
                            else if (cmd == 'e') {
                                i1 = this.decodeInt(returnData.slice(1, 3));
                                if (i1 === n1) {
                                    msg = now.getHours() + ":" + now.getMinutes() + "  Command sent. Iset_adc = " + i1 + ".\n";
                                    this.logMessageContainer.value += msg;
                                    this.logMessageContainer.scrollTop = this.logMessageContainer.scrollHeight;
                                }
                                else {
                                    msg = now.getHours() + ":" + now.getMinutes() + "  Error. Verification failed. TX = " + n1 + ", RX = " + i1 + "\n";
                                    this.logMessageContainer.value += msg;
                                    this.logMessageContainer.scrollTop = this.logMessageContainer.scrollHeight;
                                }
                            }
                        }
                        else {
                            msg = now.getHours() + ":" + now.getMinutes() + "  Error. Verification failed.\n";
                            this.logMessageContainer.value += msg;
                            this.logMessageContainer.scrollTop = this.logMessageContainer.scrollHeight;
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    return MCUWebSerial;
}());
new MCUWebSerial();
