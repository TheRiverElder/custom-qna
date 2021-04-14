interface QnaSet {
    // 问题与回答集合
    items: Array<QnaItem>;
    // 该题集名称
    name: string;
    // 该题集的QSUID用于识别该题集的唯一表示，哪怕名称、版本改变，该QSUID也不会变
    qsuid: number;
    // 该题集的描述，以及需要传达给使用者的信息
    description: string;
    // 题集的版本 推荐格式：aa.bb.cc
    version: string;
    // 开发环境版本，这将决定该题集文件将被如何读取成实例
    developmentVersion: number;
}

interface UserProgress {
    // 对应题集的快照，用于在还未载入题集时显示题集信息，推荐格式：题集名称+题集版本
    snapshot: string;
    // 对应题集的QSUID
    qsuid: number;
    // 这是已经熟记的习题的QUID
    finished: Array<number>;
    // 开发环境版本，这将决定该用户进度文件将被如何读取成实例
    developmentVersion: number;
    // 是否有确定的习题
    hasWork: boolean;
    // 今日练习题
    work?: Array<number>;
    // 上述练习题的有效日期
    date?: number;
}

interface QnaItem {
    // 该问题的QUID，在自身所在该的题集中是唯一的
    quid: number;
    // 问题描述
    question: string;
    // 该问题的参考答案
    answer: string;
    // 该问题的提示
    hint?: string;
}

export type {
    QnaSet,
    QnaItem,
    UserProgress,
}