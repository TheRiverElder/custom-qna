

const UTF8_ENCODER = new TextEncoder();

export default class FileEncoder {
    private data: Array<Uint8Array> = [];
    private totalByteLength: number = 0;

    writeInt16(value: number) {
        const buf: ArrayBuffer = new ArrayBuffer(2);
        const d: DataView = new DataView(buf);
        d.setInt16(0, value);
        this.data.push(new Uint8Array(buf));
        this.totalByteLength += 2;
        return this;
    }

    writeInt32(value: number) {
        const buf: ArrayBuffer = new ArrayBuffer(4);
        const d: DataView = new DataView(buf);
        d.setInt32(0, value);
        this.data.push(new Uint8Array(buf));
        this.totalByteLength += 4;
        return this;
    }

    writeUTF8(value: string) {
        const buf: ArrayBuffer = UTF8_ENCODER.encode(value);
        this.writeInt16(buf.byteLength);
        this.data.push(new Uint8Array(buf));
        this.totalByteLength += buf.byteLength;
        return this;
    }

    build(): Uint8Array {
        const buf: ArrayBuffer = new ArrayBuffer(this.totalByteLength);
        const buf8: Uint8Array = new Uint8Array(buf);
        let pointer = 0;
        for (const d of this.data) {
            for (let i = 0; i < d.byteLength; i++) {
                buf8[pointer + i] = d[i];
            }
            pointer += d.byteLength;
        }
        return buf8;
    }
}