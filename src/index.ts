import * as d3 from "d3";

const canvas = d3.select("svg#canvas");

const CANVAS_SIZE = 300;
const PATIENT_COUNT = 100;
const TICK_MAGNITUDE = 1;
const COLLISION_DISTANCE = 4;
const INFECTION_TIME = CANVAS_SIZE / 1;

const chooseCoord = d3.randomUniform(CANVAS_SIZE);
const chooseAngle = d3.randomUniform(2 * Math.PI);
class Vector {
    x: number;
    y: number;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    static randomCoord() {
        return new Vector(chooseCoord(), chooseCoord());
    }

    static randomDirection() {
        const angle = chooseAngle();
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

enum State {
    New,
    Infected,
    Immune,
}

function stateColour(state: State) {
    switch (state) {
        case State.New:
            return "#82aaff";
        case State.Infected:
            return "#ff8a82";
        case State.Immune:
            return "#b082ff";
    }
}

class Person {
    state: State = State.New;
    position: Vector;
    direction: Vector;

    private timeInState = 0;

    constructor(position: Vector, direction: Vector) {
        this.position = position;
        this.direction = direction;
    }

    static random() {
        return new Person(Vector.randomCoord(), Vector.randomDirection());
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

    update() {
        this.updateState();
        this.updatePosition();
    }

    private updatePosition() {
        const move = this.direction.times(TICK_MAGNITUDE);
        this.position = this.position.plus(move);

        // Bounce off the sides. I'm sure this sort of thing would
        // horrify a game developer but we're not moving far each
        // tick so we don't need to try hard.
        if (this.position.x < 0 || this.position.x > CANVAS_SIZE) {
            this.direction = this.direction.reverseX();
        }

        if (this.position.y < 0 || this.position.y > CANVAS_SIZE) {
            this.direction = this.direction.reverseY();
        }
    }

    private setState(state: State) {
        this.timeInState = 0;
        this.state = state;
    }

    private updateState() {
        this.timeInState++;
        if (this.state === State.Infected && this.timeInState >= INFECTION_TIME) {
            this.setState(State.Immune);
        }
    }
}

function collide(person1: Person, person2: Person) {
    if (person1.state === State.Infected || person2.state === State.Infected) {
        // Infecting does nothing to the infected so let's just do both
        person1.infect();
        person2.infect();
    }

    person1.bounceOff(person2);
    person2.bounceOff(person1);
}

const people: Person[] = [];
for (let i = 0; i < PATIENT_COUNT; i++) {
    people.push(Person.random());
}

people[0].infect();

function updatePeople() {
    people.forEach(p => p.update());

    for (let i = 0; i < people.length; i++) {
        for (let j = i + 1; j < people.length; j++) {
            if (people[i].distanceTo(people[j]) < COLLISION_DISTANCE) {
                collide(people[i], people[j]);
            }
        }
    }
}

function updateView() {
    const dots = canvas
        .selectAll("circle")
        .data(people)
        .attr("cx", p => p.position.x)
        .attr("cy", p => p.position.y)
        .style("fill", p => p.color());

    dots.enter()
        .append("circle")
        .attr("cx", p => p.position.x)
        .attr("cy", p => p.position.y)
        .attr("r", 3)
        .style("fill", p => p.color());

    dots.exit().remove();
}

updateView();

d3.timer(() => {
    updatePeople();
    updateView();
}, 100);