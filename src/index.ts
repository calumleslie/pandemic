import * as d3 from "d3";
import { Vector } from "./vector";
import { Person, collide, State, stateColour } from "./person";
import { stat } from "fs";

const canvas = d3.select("svg#canvas");
const graph = d3.select("canvas#graph");
const graphContext: CanvasRenderingContext2D = (graph.node() as any).getContext("2d");

const graphNodesBase = document.createElement("graphNodes");
const graphNodes = d3.select(graphNodesBase);

const CANVAS_EXTENT = new Vector(300, 300);
const PATIENT_COUNT = 100;
const COLLISION_DISTANCE = 4;
const BAR_WIDTH = 2;
const GRAPH_HEIGHT = 100;
const OBSERVATION_INTERVAL = 10;
// Infection lasts as long as walking width of field
const INFECTION_TIME = CANVAS_EXTENT.x;

const chooseX = d3.randomUniform(CANVAS_EXTENT.x);
const chooseY = d3.randomUniform(CANVAS_EXTENT.y);
const chooseAngle = d3.randomUniform(2 * Math.PI);

class Observation {
    states: { [key: string]: number };

    constructor(states: { [key: string]: number }) {
        this.states = states;
    }

    count(state: State) {
        const value = this.states[state];
        return value ? value : 0;
    }

    static take(people: Person[]) {
        const states: { [key: string]: number } = {};
        for (let person of people) {
            if (states[person.state]) {
                states[person.state] = states[person.state] + 1;
            } else {
                states[person.state] = 1;
            }
        }
        return new Observation(states);
    }
}


function randomPerson() {
    return new Person(
        new Vector(chooseX(), chooseY()),
        Vector.unitInDirection(chooseAngle()));
}

const people: Person[] = [];
for (let i = 0; i < PATIENT_COUNT; i++) {
    people.push(randomPerson());
}

people[0].infect();

const observations: Observation[] = [];

function updatePeople() {
    people.forEach(p => p.update(INFECTION_TIME, CANVAS_EXTENT));

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

    observations.forEach((observation, i) => {
        const total = observation.count(State.Immune)
            + observation.count(State.Infected)
            + observation.count(State.New);

        const normalize = (value: number) => value ? (value * GRAPH_HEIGHT) / total : 0;

        const left = BAR_WIDTH * i;
        const newHeight = normalize(observation.count(State.New));
        const infectedHeight = normalize(observation.count(State.Infected));
        const immuneHeight = normalize(observation.count(State.Immune));

        graphContext.fillStyle = stateColour(State.New);
        graphContext.fillRect(left, 0, BAR_WIDTH, newHeight);

        graphContext.fillStyle = stateColour(State.Immune);
        graphContext.fillRect(left, newHeight, BAR_WIDTH, immuneHeight);

        graphContext.fillStyle = stateColour(State.Infected);
        graphContext.fillRect(left, newHeight + immuneHeight, BAR_WIDTH, infectedHeight);
    });
}

updateView();

let tick = 0;
d3.timer(() => {
    tick++;
    updatePeople();
    if (tick % OBSERVATION_INTERVAL === 0) {
        observations.push(Observation.take(people));
    }
    updateView();
}, 100);