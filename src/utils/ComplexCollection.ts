
type KeyGetter<T, K> = (e: T) => K;

export type {
    KeyGetter,
}

export default class ComplexCollection<T, K> {

    private list: Array<T> = [];
    private map: Map<K, T> = new Map();
    private keyGetter: KeyGetter<T, K>;

    constructor(keyGetter: KeyGetter<T, K>) {
        this.keyGetter = keyGetter;
    }

    public put(elem: T): void {
        const key: K = this.keyGetter(elem);
        if (!this.map.has(key)) {
            this.list.push(elem);
        } else {
            const index = this.list.findIndex(e => this.keyGetter(e) === key);
            this.list.splice(index, 1, elem);
        }
        this.map.set(key, elem);
    }

    public remove(key: K): T | boolean {
        if (this.map.has(key)) {
            const index = this.list.findIndex(e => this.keyGetter(e) === key);
            this.list.splice(index, 1);
        }
        return this.map.delete(key);
    }

    public has(key: K): boolean {
        return this.map.has(key);
    }

    public get(key: K): T | null {
        return this.map.get(key) || null;
    }

    public size(): number {
        return this.list.length;
    }

    public toArray(): Array<T> {
        return this.list.slice();
    }

}