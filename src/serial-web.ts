class MCUWebSerial {
    reader: ReadableStreamDefaultReader;
    writer: WritableStreamDefaultWriter;
    encoder = new TextEncoder();
    systemStat: number;

    connectButtonElem = <HTMLButtonElement>document.getElementById('connect-to-serial')!;
    messageButtons = document.querySelectorAll<HTMLButtonElement>('.message-button')!;
    logMessageContainer =  <HTMLInputElement>document.getElementById('commentField')!;
    readButton = <HTMLButtonElement>document.getElementById('read-data')!;

    scale = 3.3/4096;

    constructor() {
        
        this.connectButtonElem.onclick = async () => {
            await this.init();
        };
    
        this.readButton.onclick = () => {
            this.write('A');
            this.getSerialMessage();
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
        
                port.addEventListener('disconnect', () => {
                // Remove `e.target` from the list of available ports.
                console.log('Serial port disconnected.')
                });        
            } catch(err) {
                this.systemStat = 2;
                const msg = `${now.getHours()}:${now.getMinutes()}     An error occured while trying to open the serial port.\n`;
                this.logMessageContainer.value += msg;
            }
        } else {
            const msg = `${now.getHours()}:${now.getMinutes()}     Web serial is not supported in this broswer. Please use Microsoft Edge or Chrome with experimental feature enabled.\n`;
            this.logMessageContainer.value += msg;
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
     * Gets data from the `reader`, decodes it and returns it inside a promise.
     * @returns A promise containing either the message from the `reader` or an error.
     */
    async read(): Promise<string> {
        try {
        const readerData = await this.reader.read();
        // console.log(readerData.value);
        return readerData.value;
        } catch (err) {
        const errorMessage = `error reading data: ${err}`;
        console.error(errorMessage);
        return errorMessage;
        }
    }

    async sleep(ms:number) {
        return new Promise(resolve => setTimeout(resolve, ms));
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
    
    async getSerialMessage() {
        const now = new Date();
        // const listElement = document.createElement('li');
        await this.sleep(300);
        const returnData = await this.read();

        const i1 = this.decodeInt(returnData.slice(0,2));
        const i2 = this.decodeInt(returnData.slice(2,4));
        const i3 = this.decodeInt(returnData.slice(4,6));
        const i4 = this.decodeInt(returnData.slice(6,8));

        const i5 = this.decodeIntSigned(returnData.slice(8,10));
        const i6 = this.decodeInt(returnData.slice(10,12));
        const i7 = this.decodeInt(returnData.slice(12,14));
        const i8 = this.decodeInt(returnData.slice(14,15));

        const i1n = i1*this.scale*41/2;
        const i2n = i2*this.scale/0.1;
        const i3n = i3*this.scale*17/2;
        const i4n = i4*this.scale*41/2;

        const displayData = `Vcfly:${i1}=${i1n.toFixed(2)}V, Iout:${i2}=${i2n.toFixed(2)}A, Vout:${i3}=${i3n.toFixed(2)}V, Vin:${i4}=${i4n.toFixed(2)}V, DeltaD:${i5}, d1:${i6}, d2:${i7}, state:${i8}`;
        const msg = `${now.getHours()}:${now.getMinutes()}     ` + displayData + `\n`;
        this.logMessageContainer.value += msg;
        // console.log(listElement)
    }    
}

new MCUWebSerial();