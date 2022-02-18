class MCUWebSerial {
    reader: ReadableStreamDefaultReader;
    writer: WritableStreamDefaultWriter;
    encoder = new TextEncoder();
    decoder = new TextDecoder();
    systemStat: number;

    connectButtonElem = <HTMLButtonElement>document.getElementById('connect-to-serial');
    messageButtons = document.querySelectorAll<HTMLButtonElement>('.message-button');
    logMessageContainer =  <HTMLInputElement>document.getElementById('commentField');
    readButton = <HTMLButtonElement>document.getElementById('read-data');
    setirefButton = <HTMLButtonElement>document.getElementById('setIrefBtn');
    incButton = <HTMLButtonElement>document.getElementById('incIrefBtn');
    startButton = <HTMLButtonElement>document.getElementById('startBtn');
    stopButton = <HTMLButtonElement>document.getElementById('stopBtn');

    hvDisp = <HTMLInputElement>document.getElementById('hvField');
    lvDisp = <HTMLInputElement>document.getElementById('lvField');
    tempDisp = <HTMLInputElement>document.getElementById('tempField');
    ctDisp = <HTMLInputElement>document.getElementById('ctField');
    c1Disp = <HTMLInputElement>document.getElementById('c1Field');
    c2Disp = <HTMLInputElement>document.getElementById('c2Field');

    irefInput = <HTMLInputElement>document.getElementById('irefField');
    offsetInput = <HTMLInputElement>document.getElementById('offsetField');
    iref16Input = <HTMLInputElement>document.getElementById('iref16Field');
    deltaIrefInput = <HTMLInputElement>document.getElementById('deltaIrefField');

    scale = 3.3/4096;
    BUCK_ISNS_FEEDBACK_GAIN = 0.01;

    constructor() {
        
        this.connectButtonElem.onclick = async () => {
            await this.init();
        };
    
        this.readButton.onclick = () => {
            this.write('A');
            this.getData();
        };
        
        this.irefInput.addEventListener('input', () => {
            let irefValue = parseInt(this.irefInput.value,10)*this.BUCK_ISNS_FEEDBACK_GAIN/this.scale + parseInt(this.offsetInput.value);
            this.iref16Input.value = String(irefValue.toFixed(0));
        });

        this.offsetInput.addEventListener('input', () => {
            let irefValue = parseInt(this.irefInput.value,10)*this.BUCK_ISNS_FEEDBACK_GAIN/this.scale + parseInt(this.offsetInput.value);
            this.iref16Input.value = String(irefValue.toFixed(0));
        });       

        this.startButton.onclick = () => {
            this.write('G');
            this.verifyResponse('G');
        };

        this.stopButton.onclick = () => {
            this.write('x');
            this.verifyResponse('x');
        };

        this.setirefButton.onclick = () => {
            if (this.iref16Input.value == '') {
                const irefValue = parseInt(this.irefInput.value,10)*this.BUCK_ISNS_FEEDBACK_GAIN/this.scale + parseInt(this.offsetInput.value);
                this.iref16Input.value = String(irefValue.toFixed(0));
            }
            this.writeE(this.encodeData('e',parseInt(this.iref16Input.value,10)));
            this.verifyResponse('e',parseInt(this.iref16Input.value,10));
        };
    
        this.incButton.onclick = () => {
            const irefNewValue = parseInt(this.irefInput.value) + parseInt(this.deltaIrefInput.value);
            this.irefInput.value = String(irefNewValue);
            const irefValue = parseInt(this.irefInput.value,10)*this.BUCK_ISNS_FEEDBACK_GAIN/this.scale + parseInt(this.offsetInput.value);
            this.iref16Input.value = String(irefValue.toFixed(0));
            this.writeE(this.encodeData('e',parseInt(irefValue.toFixed(0))));
            this.verifyResponse('e',parseInt(irefValue.toFixed(0)));                    
        };

    }

    async init() {
        const now = new Date();
        if ('serial' in navigator) {
            try {
                const port = await (navigator as any).serial.requestPort();
                await port.open({ baudRate: 9600 }); // `baudRate` was `baudrate` in previous versions.
        
                this.writer = port.writable.getWriter();
                this.reader = port.readable.getReader();
                
                const signals = await port.getSignals();
                console.log(signals);
                this.systemStat = 1;
                // enable control buttons
                this.messageButtons.forEach((button: HTMLButtonElement) => {
                    button.removeAttribute('disabled');
                });
                const msg = `${now.getHours()}:${now.getMinutes()}  Connected.\n`;
                this.logMessageContainer.value += msg;                
        
                port.addEventListener('disconnect', () => {
                    // Remove `e.target` from the list of available ports.
                    const now = new Date();
                    const msg = `${now.getHours()}:${now.getMinutes()}  Serial port disconnected.\n`;
                    this.logMessageContainer.value += msg;
                    // disable control buttons
                    this.messageButtons.forEach((button: HTMLButtonElement) => {
                        button.setAttribute('disabled','');
                    });
                    this.connectButtonElem.innerText = "Connect";
                    this.connectButtonElem.onclick = async () => {
                        await this.init();
                    };
                    console.log('Serial port disconnected.')
                });    
                
                //change connect button function
                this.connectButtonElem.innerText = "Disconnect";
                this.connectButtonElem.setAttribute('class','redBtn');
                this.connectButtonElem.onclick = async () => {
                    this.reader.releaseLock();
                    try {
                        this.reader.cancel();
                    } catch(err) {
                        console.error('No reader to cancel');
                    }
                    this.writer.releaseLock();
                    await port.close();
                    this.connectButtonElem.innerText = "Connect";
                    this.connectButtonElem.removeAttribute('class');
                    this.connectButtonElem.onclick = async () => {
                        await this.init();
                    };
                    // disable control buttons
                    this.messageButtons.forEach((button: HTMLButtonElement) => {
                        button.setAttribute('disabled','');
                    });                    
                    const now = new Date();
                    const msg = `${now.getHours()}:${now.getMinutes()}  User interrupt. Disconnected.\n`;
                    this.logMessageContainer.value += msg;
                    this.logMessageContainer.scrollTop = this.logMessageContainer.scrollHeight;
                }
            } catch(err) {
                this.systemStat = 2;
                const msg = `${now.getHours()}:${now.getMinutes()}  An error occured while trying to open the serial port.\n`;
                this.logMessageContainer.value += msg;
                this.logMessageContainer.scrollTop = this.logMessageContainer.scrollHeight;
            }
        } else {
            const msg = `${now.getHours()}:${now.getMinutes()}  Web serial is not supported in this broswer. Please use Microsoft Edge or Chrome with experimental feature enabled.\n`;
            this.logMessageContainer.value += msg;
            this.logMessageContainer.scrollTop = this.logMessageContainer.scrollHeight;
            console.error('Web serial doesn\'t seem to be enabled in your browser. Try enabling it by visiting:')
            console.error('chrome://flags/#enable-experimental-web-platform-features');
            console.error('opera://flags/#enable-experimental-web-platform-features');
            console.error('edge://flags/#enable-experimental-web-platform-features');
            this.systemStat = 0;         
        }
    }
      /**
     * Takes a string of data, encodes it and then writes it using the `writer` attached to the serial port.
     * @param data - A string of data that will be sent to the Serial port.
     * @returns An empty promise after the message has been written.
     */
    async write(data: string): Promise<void> {
        const dataArrayBuffer = this.encoder.encode(data);
        return await this.writer.write(dataArrayBuffer);
    }

      /**
     * Takes already encoded and then writes it using the `writer` attached to the serial port.
     * @param edata - already encoded data that will be sent to the Serial port.
     * @returns An empty promise after the message has been written.
     */
    async writeE(data: Uint8Array): Promise<void> {
        return await this.writer.write(data);
    }    

    /**
     * Gets data from the `reader`, decodes it and returns it inside a promise.
     * @returns A promise containing either the message from the `reader` or an error.
     */
    async read(): Promise<string> {
        try {
            const {value, done} = await this.reader.read();
            // console.log(readerData.value);
            if (done) {
                this.reader.releaseLock();
            }
            return value;
        } catch (err) {
            const errorMessage = `error reading data: ${err}`;
            console.error(errorMessage);
            return errorMessage;
        }
    }

    async sleep(ms:number) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    encodeData(s1:string,n1:number) {
        const data = new Uint8Array(4);
        data[0] = s1.charCodeAt(0);
        data[1] = n1 & 0xFF;
        data[2] = n1 >> 8;
        const checksum = data[0]+data[1]+data[2];
        data[3] = checksum%256;
        return data;
    }    

    decodeInt(str:String):number {
        let num = parseInt(str[0], 10);
        if (str.length == 2) {
          num += (parseInt(str[1], 10) << 8);
        }
        return num;
    }
    
    decodeIntSigned(str:String):number {
        const bitwidth = 8*str.length;
        const val = this.decodeInt(str);
        let isnegative = val & (1 << (bitwidth - 1));
        let boundary = (1 << bitwidth);
        let minval = -boundary;
        let mask = boundary - 1;
        return isnegative ? minval + (val & mask) : val;
    }
    
    async getData() {
        const now = new Date();
        // const listElement = document.createElement('li');
        await this.sleep(300);
        const returnData = await this.read();

        const i1 = this.decodeInt(returnData.slice(0,2));
        const i2 = this.decodeInt(returnData.slice(2,4));
        const i3 = this.decodeInt(returnData.slice(4,6));
        const i4 = this.decodeInt(returnData.slice(6,8));

        // const i5 = this.decodeInt(returnData.slice(8,10));
        // const i6 = this.decodeInt(returnData.slice(10,12));
        const i7 = this.decodeInt(returnData.slice(12,14));
        const i8 = this.decodeInt(returnData.slice(14,15));

        const i1n = i1*this.scale*(100+5.362)/5.36;
        this.lvDisp.value = `${i1n.toFixed(2)} V`;

        const i2n = i2*this.scale*(100+5.362)/5.36;
        this.hvDisp.value = `${i2n.toFixed(2)} V`;

        const i3n = -(i3-1938)*this.scale/0.01;
        const i4n = -(i4-1942)*this.scale/0.01;
        this.c1Disp.value = `${i3n.toFixed(1)} A`;
        this.c2Disp.value = `${i4n.toFixed(1)} A`;
        this.ctDisp.value = `${(i4n+i3n).toFixed(1)} A`;

        const i7n = i7*0.2315 -273;
        this.tempDisp.value = `${i7n.toFixed(1)} °C`;

        const displayData = `Data received. System state:${i8}.`;
        const msg = `${now.getHours()}:${now.getMinutes()}  ` + displayData + `\n`;
        this.logMessageContainer.value += msg;
        this.logMessageContainer.scrollTop = this.logMessageContainer.scrollHeight;
        // console.log(listElement)
    }
    
    async verifyResponse(cmd:string,n1?:number) {
        const now = new Date();
        await this.sleep(150);
        const returnData = await this.read();
        if (cmd.charCodeAt(0) == this.decodeInt(returnData.slice(0,1))) {
            if (cmd == 'G') {
                const i1 = this.decodeInt(returnData.slice(1,3));
                const msg = `${now.getHours()}:${now.getMinutes()}  Starting boost. Iset_adc = ${i1}.\n`;
                this.logMessageContainer.value += msg;  
                this.logMessageContainer.scrollTop = this.logMessageContainer.scrollHeight; 
            } else if (cmd == 'x') {
                const msg = `${now.getHours()}:${now.getMinutes()}  Shutting down.\n`;
                this.logMessageContainer.value += msg;  
                this.logMessageContainer.scrollTop = this.logMessageContainer.scrollHeight;
            } else if (cmd == 'e') {
                const i1 = this.decodeInt(returnData.slice(1,3));
                if (i1 === n1) {
                    const msg = `${now.getHours()}:${now.getMinutes()}  Command sent. Iset_adc = ${i1}.\n`;
                    this.logMessageContainer.value += msg;  
                    this.logMessageContainer.scrollTop = this.logMessageContainer.scrollHeight;
                } else {
                    const msg = `${now.getHours()}:${now.getMinutes()}  Error. Verification failed. TX = ${n1}, RX = ${i1}\n`;
                    this.logMessageContainer.value += msg;
                    this.logMessageContainer.scrollTop = this.logMessageContainer.scrollHeight;
                }
            }
                     
        } else {
            const msg = `${now.getHours()}:${now.getMinutes()}  Error. Verification failed.\n`;
            this.logMessageContainer.value += msg;
            this.logMessageContainer.scrollTop = this.logMessageContainer.scrollHeight;
        }
    }
}

new MCUWebSerial();