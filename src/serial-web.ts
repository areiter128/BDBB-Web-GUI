class MCUWebSerial {
    reader: ReadableStreamDefaultReader;
    writer: WritableStreamDefaultWriter;
    encoder = new TextEncoder();
    systemStat: number;

    async init() {
        if ('serial' in navigator) {
            try {
                const port = await (navigator as any).serial.requestPort();
                await port.open({ baudRate: 9600 }); // `baudRate` was `baudrate` in previous versions.
        
                this.writer = port.writable.getWriter();
                this.reader = port.readable.getReader();
                
                const signals = await port.getSignals();
                console.log(signals);
                this.systemStat = 1;
        
                port.addEventListener('disconnect', () => {
                // Remove `e.target` from the list of available ports.
                console.log('Serial port disconnected.')
                });        
            } catch(err) {
                this.systemStat = 2;
                console.error('There was an error opening the serial port:', err);
            }
        } else {
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
}