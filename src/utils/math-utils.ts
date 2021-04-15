// 从给定列表中随机选取指定数量不重复的元素，结构列表的长度是指定长度与原始列表长度两者中较小的一个。
// 注：不修改原始列表
function randomItems<T>(arr: Array<T>, count: number): Array<T> {
    const items = arr.slice();
    const size = Math.min(count, items.length);
    for (let i = 0; i < size; i++) {
        const j = Math.floor(Math.random() * items.length);
        if (i === j) continue;
        const tmp = items[i];
        items[i] = items[j];
        items[j] = tmp;
    }
    return items.slice(0, size);
}

export {
    randomItems,
}