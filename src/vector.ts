export class Vector {
    x: number;
    y: number;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    static unitInDirection(angle: number) {
        return new Vector(
            Math.cos(angle),
            Math.sin(angle));
    }

    plus(other: Vector) {
        return new Vector(this.x + other.x, this.y + other.y);
    }

    times(factor: number) {
        return new Vector(this.x * factor, this.y * factor);
    }

    minus(other: Vector) {
        return new Vector(this.x - other.x, this.y - other.y);
    }

    normalize() {
        if (this.x === 0 && this.y === 0) {
            return this;
        } else {
            return this.times(1 / this.magnitude());
        }
    }

    magnitude() {
        return Math.sqrt((this.x * this.x) + (this.y * this.y));
    }

    reverseX() {
        return new Vector(this.x * -1, this.y);
    }

    reverseY() {
        return new Vector(this.x, this.y * -1);
    }
}