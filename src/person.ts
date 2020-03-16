import { Vector } from "./vector";

const TICK_MAGNITUDE = 1;

export enum State {
    New = "new",
    Infected = "infected",
    Immune = "immune",
}

export function stateColour(state: State) {
    switch (state) {
        case State.New:
            return "#82aaff";
        case State.Infected:
            return "#ff8a82";
        case State.Immune:
            return "#b082ff";
    }
}

export class Person {
    state: State = State.New;
    position: Vector;
    direction: Vector;

    private timeInState = 0;

    constructor(position: Vector, direction: Vector) {
        this.position = position;
        this.direction = direction;
    }

    infect() {
        if (this.state === State.New) {
            this.setState(State.Infected);
        }
    }

    color() {
        return stateColour(this.state);
    }

    bounceOff(other: Person) {
        this.direction = this.direction.minus(other.direction).normalize();
    }

    distanceTo(other: Person) {
        return this.position.minus(other.position).magnitude();
    }

    update(infectionTime: number, canvasExtent: Vector) {
        this.updateState(infectionTime);
        this.updatePosition(canvasExtent);
    }

    private updatePosition(canvasExtent: Vector) {
        const move = this.direction.times(TICK_MAGNITUDE);
        this.position = this.position.plus(move);

        // Bounce off the sides. I'm sure this sort of thing would
        // horrify a game developer but we're not moving far each
        // tick so we don't need to try hard.
        if (this.position.x < 0 || this.position.x > canvasExtent.x) {
            this.direction = this.direction.reverseX();
        }

        if (this.position.y < 0 || this.position.y > canvasExtent.y) {
            this.direction = this.direction.reverseY();
        }
    }

    private setState(state: State) {
        this.timeInState = 0;
        this.state = state;
    }

    private updateState(infectionTime: number) {
        this.timeInState++;
        if (this.state === State.Infected && this.timeInState >= infectionTime) {
            this.setState(State.Immune);
        }
    }
}

export function collide(person1: Person, person2: Person) {
    if (person1.state === State.Infected || person2.state === State.Infected) {
        // Infecting does nothing to the infected so let's just do both
        person1.infect();
        person2.infect();
    }

    person1.bounceOff(person2);
    person2.bounceOff(person1);
}