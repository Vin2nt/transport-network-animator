export class Rotation {
    private static DIRS: { [id: string]: number } = {'sw': -135, 'w': -90, 'nw': -45, 'n': 0, 'ne': 45, 'e': 90, 'se': 135, 's': 180};

    constructor(private _degrees: number) {

    }

    static from(direction: string): Rotation {
        return new Rotation(Rotation.DIRS[direction])
    }

    get degrees(): number {
        return this._degrees;
    }

    get radians(): number {
        return this.degrees / 180 * Math.PI;
    }

    add(that: Rotation): Rotation {
        let sum = this.degrees + that.degrees;
        if (sum <= -180)
            sum += 360;
        if (sum > 180)
            sum -= 360;
        return new Rotation(sum);
    }

    delta(that: Rotation): Rotation {
        let a = this.degrees;
        let b = that.degrees;
        let dist = b-a;
        if (Math.abs(dist) > 180) {
            if (a < 0)
                a += 360;
            if (b < 0)
                b += 360;
            dist = b-a;
        }
        return new Rotation(dist);
    }
}