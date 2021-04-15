// import Dexie from "dexie";
import { QnaSet, QnaSetInfo, UserProgress, UserProgressInfo } from "../interfaces";


let count = 1;
function genQuid() {
    return count++;
}

function createEmptyQnaSet(): QnaSet {
    const qsuid = genQuid();
    return {
        developmentVersion: 1,
        qsuid,
        version: "1.0.0",
        name: "未命名题集-" + qsuid,
        description: "创建于 " + new Date().toLocaleString(),
        items: [],
    };
}

function createProgress(qsuid: number): UserProgress {
    return {
        upuid: genQuid(),
        developmentVersion: 1,
        qsuid: qsuid,
        finished: [],
        hasWork: false,
        work: [],
        date: 0,
    };
}

// const database = new Dexie('custom-qna');
// const databaseVersion = 1;

// function setupDatabase() {
//     database.version(databaseVersion).stores({
//         qnaSets: "++qsuid,version,name,description",
//         userProgresses: "++upuid,qsuid,"
//     });
// }

function uid2str(uid: number) {
    return uid.toString(16).padStart(8, '0');
}

const KEY_INFO = "custom-qns-info";

const QNA_SET_MAP: Map<number, QnaSet> = new Map();
const USER_PROGRESS_MAP: Map<number, UserProgress> = new Map();

function getLoadedQnaSets() {
    return Array.from(QNA_SET_MAP.values());
}

function getLoadedUserProgresses() {
    return Array.from(USER_PROGRESS_MAP.values());
}

function addQnaSet(qs: QnaSet) {
    QNA_SET_MAP.set(qs.qsuid, qs);
}

function addUserProgress(up: UserProgress) {
    USER_PROGRESS_MAP.set(up.upuid, up);
}

function getQnaSet(qsuid: number) {
    let result = QNA_SET_MAP.get(qsuid) || null;
    if (!result) {
        result = loadQnaSet(qsuid);
        if (result) {
            QNA_SET_MAP.set(qsuid, result);
        }
    }
    return result;
}

function getUserProgress(upuid: number) {
    let result = USER_PROGRESS_MAP.get(upuid) || null;
    if (!result) {
        result = loadUserProgress(upuid);
        if (result) {
            USER_PROGRESS_MAP.set(upuid, result);
        }
    }
    return result;
}

function removeQnaSet(qsuid: number) {
    QNA_SET_MAP.delete(qsuid);
    localStorage.removeItem("qs" + uid2str(qsuid));
}

function removeUserProgress(upuid: number) {
    USER_PROGRESS_MAP.delete(upuid);
    localStorage.removeItem("up" + uid2str(upuid));
}

function saveAll() {
    Array.from(QNA_SET_MAP.values()).forEach(saveQnaSet);
    Array.from(USER_PROGRESS_MAP.values()).forEach(saveUserProgress);
}

function saveInfo(info: Info) {
    localStorage.setItem(KEY_INFO, JSON.stringify(info));
}

interface Info {
    uidCounter: number,
    sets: Array<QnaSetInfo>,
    progresses: Array<UserProgressInfo>,
}

function loadInfo(): Info {
    const json = localStorage.getItem(KEY_INFO);
    if (json) return JSON.parse(json);
    
    const info = {
        uidCounter: 0,
        sets: [],
        progresses: [],
    };
    return info;
}

function saveQnaSet(qnaSet: QnaSet) {
    localStorage.setItem("qs" + uid2str(qnaSet.qsuid), JSON.stringify(qnaSet));
}

function loadQnaSet(qsuid: number): QnaSet | null {
    const json = localStorage.getItem("qs" + uid2str(qsuid));
    return json ? JSON.parse(json) : null;
}

function saveUserProgress(userProgress: UserProgress) {
    localStorage.setItem("up" + uid2str(userProgress.upuid), JSON.stringify(userProgress));
}

function loadUserProgress(upuid: number): UserProgress | null {
    const json = localStorage.getItem("up" + uid2str(upuid));
    return json ? JSON.parse(json) : null;
}

function extractQnaSetInfo(qnaSet: QnaSet): QnaSetInfo {
    return {
        itemCount: qnaSet.items.length,
        name: qnaSet.name,
        qsuid: qnaSet.qsuid,
        description: qnaSet.description,
        version: qnaSet.version,
    };
}

function extractUserProgressInfo(userProgress: UserProgress): UserProgressInfo {
    return {
        upuid: userProgress.upuid,
        qsuid: userProgress.qsuid,
        finishedCount: userProgress.finished.length,
        hasWork: userProgress.hasWork,
        work: userProgress.work,
        date: userProgress.date,
        lastModified: Date.now(),
    };
}

export {
    createEmptyQnaSet,
    createProgress,
    genQuid,
    saveQnaSet,
    loadQnaSet,
    saveUserProgress,
    loadUserProgress,
    extractQnaSetInfo,
    extractUserProgressInfo,

    getLoadedQnaSets,
    getLoadedUserProgresses,
    addQnaSet,
    addUserProgress,
    getQnaSet,
    getUserProgress,
    removeQnaSet,
    removeUserProgress,

    uid2str,

    saveAll,
    saveInfo,
    loadInfo,
}