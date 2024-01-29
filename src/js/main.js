"use strict";

let simulateBtnEl = document.querySelector(".simulate-btn");
let floorsInputEl = document.querySelector("#floors");
let liftsInputEl = document.querySelector("#lifts");
let invalidFloorsEl = document.querySelector(".invalid-floors");
let invalidLiftsEl = document.querySelector(".invalid-lifts");
let isConfigView = true;

simulateBtnEl.addEventListener("click", function () {
  let floorsValue = floorsInputEl.value;
  let liftsValue = liftsInputEl.value;
  console.log(floorsValue, liftsValue);
  if (Number(floorsValue) < 1 || Number(liftsValue) < 1) {
    return;
  }
  toggleConfigView();
});

floorsInputEl.addEventListener("input", function (e) {
  const el = e.target;
  console.log(Number(el.value));
  if (Number(el.value) < 1) {
    console.log(invalidFloorsEl.classList);
    invalidFloorsEl.classList.remove("hide-invalid-message");
  } else {
    invalidFloorsEl.classList.add("hide-invalid-message");
  }
});

liftsInputEl.addEventListener("input", function (e) {
  const el = e.target;
  console.log(Number(el.value));
  if (Number(el.value) < 1) {
    console.log(invalidLiftsEl.classList);
    invalidLiftsEl.classList.remove("hide-invalid-message");
  } else {
    invalidLiftsEl.classList.add("hide-invalid-message");
  }
});

const toggleConfigView = function () {
  if (isConfigView) {
    let configuratorEl = document.querySelector(".config-container");
    configuratorEl.style.display = "none";

    //getting values from the input fields for simulation
    let floors = floorsInputEl.value;
    let lifts = liftsInputEl.value;

    simulationViewInit(floors, lifts);
  }
  isConfigView = !isConfigView;
};

const simulationViewInit = function (floors, lifts) {
  //basically, i need to create a html template of a floor component here; which will contain other small components here like up button, down button, floor(literal floor), floor heading. we are ignoring lift for a while now (it will require me to now about css animations and other features of DOM)
  let simulationContainerEl = document.querySelector(".simulation-container");
};
