interface QnaSet {
    items: Array<QnaItem>;
}

interface QnaItem {
    quid: number;
    question: string;
    answer: string;
    hint?: string;
}

export type {
    QnaSet,
    QnaItem,
}