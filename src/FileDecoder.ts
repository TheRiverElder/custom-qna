

const UTF8_DECODER = new TextDecoder("UTF-8");

export default class FileDecoder {
    private dv: DataView;
    private pointer: number = 0;

    constructor(dv: DataView) {
        this.dv = dv;
    }

    readInt16(): number {
        const value = this.dv.getUint16(this.pointer);
        this.pointer += 2;
        return value;
    }

    readInt32(): number {
        const value = this.dv.getUint32(this.pointer);
        this.pointer += 4;
        return value;
    }

    readUTF8(): string {
        const strLen = this.readInt16();
        const value = UTF8_DECODER.decode(this.dv.buffer.slice(this.pointer, this.pointer + strLen));
        this.pointer += strLen;
        return value;
    }

}