import { QnaSet } from "./interfaces";

let count = 1;
function genQuid() {
    return count++;
}

const MEANINGFUL = [
    {
        quid: genQuid(),
        question: '翻译：我的父亲做菜真的很好吃。',
        answer: 'Mein Vater kocht sehr gut.',
    },
    {
        quid: genQuid(),
        question: '翻译：Bis später.',
        answer: '待会儿见。',
        hint: 'See you later.',
    },
];

function createTestQnaSet(size: number = 2): QnaSet {
    const qsuid = genQuid();
    return {
        developmentVersion: 1,
        qsuid,
        version: "1.0.0",
        name: "未命名题集-" + qsuid,
        description: "创建于 " + new Date().toLocaleString(),
        items: size <= 2 
            ? MEANINGFUL.slice(0, size) 
            : MEANINGFUL.concat(...Array(size).fill(0).map((v, i) => ({
                quid: genQuid(),
                question: '翻译：' + (i + 2),
                answer: (i + 2) + 'th answer.',
                hint: (i % 2) ? ((i + 2) + 'th hint.') : '',
            }))),
    };
}

export {
    createTestQnaSet,
    genQuid,
}