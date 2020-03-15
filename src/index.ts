import * as d3 from "d3";
import { Vector } from "./vector";
import { Person, collide } from "./person";

const canvas = d3.select("svg#canvas");

const CANVAS_EXTENT = new Vector(300, 300);
const PATIENT_COUNT = 100;
const COLLISION_DISTANCE = 4;
// Infection lasts as long as walking width of field
const INFECTION_TIME = CANVAS_EXTENT.x;

const chooseX = d3.randomUniform(CANVAS_EXTENT.x);
const chooseY = d3.randomUniform(CANVAS_EXTENT.y);
const chooseAngle = d3.randomUniform(2 * Math.PI);

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
}

updateView();

d3.timer(() => {
    updatePeople();
    updateView();
}, 100);