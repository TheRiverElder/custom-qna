import { QnaItem, QnaSet } from "../interfaces";
import download from 'downloadjs';
import FileEncoder from "./FileEncoder";
import FileDecoder from "./FileDecoder";
import { uid2str } from "./data-manager";

// 在浏览器环境中，从文件中读取题集
function readQnaSet(file: File, cb: (qnaSet: QnaSet) => void) {
    const reader = new FileReader()
    reader.onload = () => {
        const r: ArrayBuffer = reader.result as ArrayBuffer;
        cb(convertArrayBufferToQnaSet(r));
    };
    reader.readAsArrayBuffer(file);
}

// 在浏览器环境中写入（下载）题集
function writeQnaSet(qnaSet: QnaSet, cb?: () => void) {
    const buf: Uint8Array = convertQnaSetToArrayBuffer(qnaSet);
    download(buf, qnaSet.name + "_" + qnaSet.version + "_" + uid2str(qnaSet.qsuid) + ".bin");
}

// 将题集数据转化为题集实例
function convertArrayBufferToQnaSet(buf: ArrayBuffer): QnaSet {
    const input: FileDecoder = new FileDecoder(new DataView(buf));

    const developmentVersion = input.readInt32();
    const qsuid = input.readInt32();
    const version = input.readUTF8();
    const name = input.readUTF8();
    const description = input.readUTF8();

    const items: Array<QnaItem> = [];
    const itemLength = input.readInt32();
    for (let i = 0; i < itemLength; i++) {
        const quid = input.readInt32();
        const question = input.readUTF8();
        const answer = input.readUTF8();
        const hint = input.readUTF8();

        items.push({ quid, question, answer, hint });
    }

    return { developmentVersion, qsuid, version, name, description, items };
}

// 将题集转化为二进制文件数据
// 顺序为：developmentVersion，qsuid，version，name，description，items
function convertQnaSetToArrayBuffer(set: QnaSet): Uint8Array {
    const output: FileEncoder = new FileEncoder();
    output.writeInt32(set.developmentVersion);
    output.writeInt32(set.qsuid);
    output.writeUTF8(set.version);
    output.writeUTF8(set.name);
    output.writeUTF8(set.description);

    output.writeInt32(set.items.length);
    for (const item of set.items) {
        output.writeInt32(item.quid);
        output.writeUTF8(item.question);
        output.writeUTF8(item.answer);
        output.writeUTF8(item.hint || '');
    }

    return output.build();
}

export {
    readQnaSet,
    writeQnaSet,
    convertArrayBufferToQnaSet,
    convertQnaSetToArrayBuffer,
}