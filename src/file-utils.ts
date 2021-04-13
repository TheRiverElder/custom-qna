import { QnaItem, QnaSet } from "./interfaces";
import download from 'downloadjs';

function readQnaSet(file: File, cb: (qnaSet: QnaSet) => void) {
    const reader = new FileReader()
    reader.onload = () => {
        const r: ArrayBuffer = reader.result as ArrayBuffer;
        cb(convertArrayBufferToQnaSet(r));
    };
    reader.readAsArrayBuffer(file);
}

function writeQnaSet(qnaSet: QnaSet, cb?: () => void) {
    const buf: ArrayBuffer = convertQnaSetToArrayBuffer(qnaSet);
    download(new Uint8Array(buf), "qna-data");
}

function convertArrayBufferToQnaSet(buf: ArrayBuffer): QnaSet {
    const d = new DataView(buf);
    const size = d.getUint32(0);
    let i = 0;
    const offset = 4;
    let pointer = offset;
    const items: Array<QnaItem> = [];
    while (i < size) {
        const quid = d.getUint32(pointer);
        pointer += 4;
        const [np1, question] = readUTF8(d, pointer);
        pointer = np1;
        const [np2, answer] = readUTF8(d, pointer);
        pointer = np2;
        const [np3, hint] = readUTF8(d, pointer);
        pointer = np3;

        items.push({ quid, question, answer, hint });

        i++;
    }
    return { items };
}

const UTF8_DECODER = new TextDecoder("UTF-8");
function readUTF8(d: DataView, pointer: number): [number, string] {
    const strLen = d.getUint16(pointer);
    pointer += 2;
    const str = UTF8_DECODER.decode(new Int8Array(d.buffer.slice(pointer, pointer + strLen)));
    pointer += strLen;
    return [pointer, str];
}


const UTF8_ENCODER = new TextEncoder();
function convertQnaSetToArrayBuffer(set: QnaSet): ArrayBuffer {
    let totalByteLength = 4;
    
    const tmp: Array<[number, Uint8Array, Uint8Array, Uint8Array]> = [];
    for (const item of set.items) {
        totalByteLength += 4;
        const questionBuffer = UTF8_ENCODER.encode(item.question);
        const answerBuffer = UTF8_ENCODER.encode(item.answer);
        const hintBuffer = UTF8_ENCODER.encode(item.hint || '');
        totalByteLength += 6 + questionBuffer.byteLength + answerBuffer.byteLength + hintBuffer.byteLength;
        tmp.push([item.quid, questionBuffer, answerBuffer, hintBuffer]);
    }

    const buf: ArrayBuffer = new ArrayBuffer(totalByteLength);
    const buf8: Uint8Array = new Uint8Array(buf);
    const d: DataView = new DataView(buf);
    d.setInt32(0, tmp.length);
    let pointer = 4;
    for (const item of tmp) {
        const [quid, questionBuffer, answerBuffer, hintBuffer] = item;
        d.setInt32(pointer, quid);
        pointer += 4;
        d.setInt16(pointer, questionBuffer.length);
        pointer += 2;
        for (let i = 0; i < questionBuffer.length; i++) {
            buf8[pointer + i] = questionBuffer[i];
        }
        pointer += questionBuffer.length;
        d.setInt16(pointer, answerBuffer.length);
        pointer += 2;
        for (let i = 0; i < answerBuffer.length; i++) {
            buf8[pointer + i] = answerBuffer[i];
        }
        pointer += answerBuffer.length;
        d.setInt16(pointer, hintBuffer.length);
        pointer += 2;
        for (let i = 0; i < hintBuffer.length; i++) {
            buf8[pointer + i] = hintBuffer[i];
        }
        pointer += hintBuffer.length;
    }
    return buf;
}

export {
    readQnaSet,
    writeQnaSet,
}