import * as d3 from "d3";

const canvas = d3.select("svg#canvas");

const CANVAS_SIZE = 600;
const PATIENT_COUNT = 100;
const TICK_MAGNITUDE = 1;

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
}

class Person {
    state: "new" | "infected" | "immune";
    position: Vector;
    direction: Vector;

    constructor(position: Vector, direction: Vector) {
        this.state = "new";
        this.position = position;
        this.direction = direction;
    }

    static random() {
        return new Person(Vector.randomCoord(), Vector.randomDirection());
    }

    color() {
        switch (this.state) {
            case "new":
                return "#aaf";
            case "infected":
                return "#faa";
            case "immune":
                return "#faf";
        }
    }

    update() {
        this.position = this.position.plus(this.direction.times(TICK_MAGNITUDE));
    }
}

const people: Person[] = [];
for (let i = 0; i < PATIENT_COUNT; i++) {
    people.push(Person.random());
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
        .attr("r", 2)
        .style("fill", p => p.color());

    dots.exit().remove();

    const directions = canvas
        .selectAll("line")
        .data(people)
        .attr("x1", p => p.position.x)
        .attr("y1", p => p.position.y)
        .attr("x2", p => p.position.plus(p.direction.times(10)).x)
        .attr("y2", p => p.position.plus(p.direction.times(10)).y);

    directions.enter()
        .append("line")
        .attr("x1", p => p.position.x)
        .attr("y1", p => p.position.y)
        .attr("x2", p => p.position.plus(p.direction.times(10)).x)
        .attr("y2", p => p.position.plus(p.direction.times(10)).y)
        .attr("stroke", "red");

    directions.exit().remove();
}

updateView();

d3.timer(elapsed => {
    people.forEach(p => p.update());
    updateView();
}, 100);