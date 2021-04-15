import { QnaSet } from "../interfaces";
import { genQuid } from "./data-manager";

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
        name: randomName(),
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

function randomName(): string {
    const a = 'a'.charCodeAt(0);
    const r = String.fromCharCode(...Array(2 + Math.floor(Math.random() * 8)).fill(0).map(() => a + Math.floor(Math.random() * 26)));
    return r[0].toUpperCase() + r.slice(1);
}

export {
    createTestQnaSet,
    genQuid,
}