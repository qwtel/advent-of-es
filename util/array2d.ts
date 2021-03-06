export type Point = [number, number];
export type Bounds = [[number, number], [number, number]];

export class Array2D<X> {
    _bounds: Bounds;
    _array: X[][];

    static of<X>(arr2D: X[][], bounds: Bounds = [[0, 0], [arr2D[0].length, arr2D.length]]): Array2D<X> {
        const a = new Array2D<X>(bounds);
        for (const p of a.coords()) {
            const [ix, iy] = a._coordToIndex(p);
            a.set(p, arr2D[iy][ix]);
        }
        return a;
    }

    constructor(bounds: Bounds = [[0, 0], [1, 1]]) {
        const [[minX, minY], [maxX, maxY]] = this._bounds = bounds;
        const [diffX, diffY] = [maxX - minX, maxY - minY];
        this._array = new Array(diffY).fill(0).map(() => new Array(diffX).fill(0));
    }

    _coordToIndex([x, y]: Point): [number, number] {
        const [[minX, minY]] = this.bounds;
        return [x - minX, y - minY];
    }

    _indexToCoord(i: number, j: number): Point {
        const [[minX, minY]] = this.bounds;
        return [i + minX, j + minY];
    }

    clone(): Array2D<X> {
        const a = new Array2D<X>();
        const { array, bounds } = this; 
        a._array = array;
        a._bounds = bounds;
        return a;
    }

    *[Symbol.iterator](): IterableIterator<X> {
        for (const row of this._array)
            for (const cell of row)
                yield cell;
    }

    forEach(f: (x: X, p?: Point, self?: Array2D<X>) => {}): void {
        this._array.forEach((row, iy) =>
            row.forEach((x, ix) =>
                f(x, this._indexToCoord(ix, iy), this)));
    }

    map<Y>(f: (x: X, p?: Point, self?: Array2D<X>) => Y): Array2D<Y> {
        const a = new Array2D<Y>();
        a._array = this._array.map((row, iy) =>
            row.map((c, ix) => f(c, this._indexToCoord(ix, iy), this)));
        a._bounds = this.bounds;
        return a;
    }

    set(point: Point, value: X): Array2D<X> {
        const [ix, iy] = this._coordToIndex(point);
        this._array[iy][ix] = value;
        return this;
    }

    get(point: Point): X {
        const [ix, iy] = this._coordToIndex(point);
        if (this.isOutside(point)) return undefined;
        return this._array[iy][ix];
    }

    get dims(): [number, number] {
        return [this._array.length, this._array[0].length];
    }

    get size(): number {
        return this._array.length * this._array[0].length;
    }

    get sizeX(): number {
        return this._array[0].length;
    }

    get sizeY(): number {
        return this._array.length;
    }

    get array(): X[][] {
        return this._array.map(row => [...row]);
    }

    get bounds(): Bounds {
        return this._bounds.map(([x, y]) => [x, y]) as Bounds;
    }

    transpose(): Array2D<X> {
        const a = new Array2D<X>();
        a._array = this._array[0].map((_, i) => this._array.map(r => r[i]));
        a._bounds = this.bounds;
        return a;
    }

    // TODO: this is probably not doing what you'd expect
    *rows(): IterableIterator<Array<X>> {
        for (const row of this.clone()._array) yield row;
    }

    // TODO: this is probably not doing what you'd expect
    *columns(): IterableIterator<Array<X>> {
        for (const col of this.transpose()._array) yield col;
    }

    *coords(): IterableIterator<Point> {
        const [[minX, minY], [maxX, maxY]] = this._bounds;
        for (let x = minX; x < maxX; x++)
            for (let y = minY; y < maxY; y++)
                yield [x, y];
    }

    *values(): IterableIterator<X> {
        for (const p of this.coords()) yield this.get(p);
    }

    *entries(): IterableIterator<[Point, X]> {
        for (const p of this.coords()) yield [p, this.get(p)];
    }

    // delivers all the edge coordinates in clockwise fashion
    // including min, excluding max
    *edgeCoords(): IterableIterator<Point> {
        const [[minX, minY], [maxX, maxY]] = this._bounds;
        for (let x = minX; x < maxX; x++) yield [x, minY];
        for (let y = minY + 1; y < maxY; y++) yield [maxX - 1, y];
        for (let x = maxX - 2; x >= minX; x--) yield [x, maxY - 1];
        for (let y = maxY - 2; y >= minY + 1; y--) yield [minX, y];
    }

    *edgeValues(): IterableIterator<X> {
        for (const p of this.edgeCoords()) yield this.get(p);
    }

    *edgeEntries(): IterableIterator<[Point, X]> {
        for (const p of this.edgeCoords()) yield [p, this.get(p)];
    }

    isInside([x, y]: Point): boolean {
        const [[minX, minY], [maxX, maxY]] = this._bounds;
        return x >= minX && x < maxX && y >= minY && y < maxY;
    }

    isOutside([x, y]: Point): boolean {
        const [[minX, minY], [maxX, maxY]] = this._bounds;
        return x < minX || x >= maxX || y < minY || y >= maxY;
    }

    toString(): string {
        let s = ''
        for (const r of this.rows()) s += r.join('') + '\n';
        return s;
    }
}