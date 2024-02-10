"use strict";

import { Controller } from "./controller.js";
import { DataStore } from "./datastore.js";
// import {DataStore} fr

let simulateBtnEl = document.querySelector(".simulate-btn");
let floorsInputEl = document.querySelector("#floors");
let liftsInputEl = document.querySelector("#lifts");
let invalidFloorsEl = document.querySelector(".invalid-floors");
let invalidLiftsEl = document.querySelector(".invalid-lifts");
let isConfigView = true;

let configureBtnEl = document.querySelector("#configure");
let resetBtnEl = document.querySelector("#reset");

//controller
let controller = null;
let datastore = null;

//global values for lifts and floors
// let floorsValue = 0;
// let liftsValue = 0;

simulateBtnEl.addEventListener("click", function () {
  let floorsValue = floorsInputEl.value;
  let liftsValue = liftsInputEl.value;
  console.log(floorsValue, liftsValue);
  if (Number(floorsValue) < 1 || Number(liftsValue) < 1) {
    return;
  }
  toggleView();
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

configureBtnEl.addEventListener("click", function (e) {
  toggleView();
});

resetBtnEl.addEventListener("click", function (e) {
  simulationViewClear();
  let floorsValue = floorsInputEl.value;
  let liftsValue = liftsInputEl.value;
  simulationViewInit(floorsValue, liftsValue);
});

const toggleView = function () {
  if (isConfigView) {
    let configuratorEl = document.querySelector(".config-container");
    configuratorEl.style.display = "none";

    //getting values from the input fields for simulation
    let floors = floorsInputEl.value;
    let lifts = liftsInputEl.value;

    simulationViewInit(floors, lifts);
    // controllerInit(floors, lifts);
  } else {
    // let simulatorEl = document.querySelector(".simulation-container");
    // // simulatorEl.style.display = "none";
    // let child = simulatorEl.lastElementChild;
    // while (child) {
    //   simulatorEl.removeChild(child);
    //   child = simulatorEl.lastElementChild;
    // }

    simulationViewClear();

    let configureBtnEl = document.querySelector("#configure");
    configureBtnEl.classList.add("hide-settings");
    let resetBtnEl = document.querySelector("#reset");
    resetBtnEl.classList.add("hide-settings");

    let configuratorEl = document.querySelector(".config-container");
    configuratorEl.style.display = "";
  }
  isConfigView = !isConfigView;
};

const simulationViewInit = function (floors, lifts) {
  //basically, i need to create a html template of a floor component here; which will contain other small components here like up button, down button, floor(literal floor), floor heading. we are ignoring lift for a while now (it will require me to now about css animations and other features of DOM)

  let configureBtnEl = document.querySelector("#configure");
  configureBtnEl.classList.remove("hide-settings");
  let resetBtnEl = document.querySelector("#reset");
  resetBtnEl.classList.remove("hide-settings");

  renderFloors(floors);
  renderLifts(lifts);
  datastoreInit(floors, lifts);
  controllerInit();
};

const simulationViewClear = function () {
  let simulatorEl = document.querySelector(".simulation-container");
  // simulatorEl.style.display = "none";
  let child = simulatorEl.lastElementChild;
  while (child) {
    simulatorEl.removeChild(child);
    child = simulatorEl.lastElementChild;
  }
};

const controllerInit = function () {
  if (controller) {
    controller = null;
  }
  controller = new Controller(datastore);
};

const datastoreInit = function (floors, lifts) {
  if (datastore) {
    datastore = null;
  }
  datastore = new DataStore(floors, lifts);
};

const renderFloors = function (floors) {
  let simulationContainerEl = document.querySelector(".simulation-container");
  for (let i = floors; i >= 1; i--) {
    let floorComponentDiv = document.createElement("div");
    floorComponentDiv.classList.add("floor-component");

    let floorHeadingEl = document.createElement("h3");
    floorHeadingEl.innerText = `LEVEL ${i}`;

    let liftButtonGrpEl = document.createElement("div");
    liftButtonGrpEl.classList.add("lift-button-group");
    if (i >= 1) {
      let upButton = document.createElement("button");
      upButton.classList.add("lift-button", "up");
      upButton.id = `${i}-up`;
      upButton.innerHTML = "&#8593;";

      //adding click event listener
      upButton.addEventListener("click", function (e) {
        console.log(datastore.getState().get(1).transition);
        controller.move(e);
        console.log(datastore.getState().get(1).transition);
      });

      liftButtonGrpEl.appendChild(upButton);
    }
    if (i <= floors) {
      let downButton = document.createElement("button");
      downButton.classList.add("lift-button", "down");
      downButton.id = `${i}-down`;
      downButton.innerHTML = "&#8595;";

      //adding click event listener
      downButton.addEventListener("click", function (e) {
        controller.move(e);
      });

      liftButtonGrpEl.appendChild(downButton);
    }

    let floorEl = document.createElement("div");
    floorEl.classList.add("floor");

    //appending all internal components in floorComponentdiv
    floorComponentDiv.appendChild(floorHeadingEl);
    floorComponentDiv.appendChild(liftButtonGrpEl);
    floorComponentDiv.appendChild(floorEl);
    simulationContainerEl.appendChild(floorComponentDiv);
  }
};

const renderLifts = function (lifts) {
  let simulationContainerEl = document.querySelector(".simulation-container");
  let simContainerChildrenList = simulationContainerEl.childNodes;
  let simContainerChildrenListLen = simContainerChildrenList.length;
  let firstFloorEl = simContainerChildrenList[simContainerChildrenListLen - 1];
  let leftOffset = 100;
  let liftSpacing = 100;
  let distanceFromLeft = 0;
  let bottomOffset = 15;
  let liftWidth = 30;
  for (let i = 0; i < lifts; i++) {
    let liftEl = document.createElement("div");
    liftEl.classList.add("lift");
    liftEl.id = `lift_${i + 1}`;
    // liftEl.classList.add("move-lift-up");
    liftEl.style.left = `${leftOffset + distanceFromLeft + liftSpacing}px`;
    distanceFromLeft = distanceFromLeft + liftWidth + liftSpacing;
    liftEl.style.bottom = `${bottomOffset}px`;
    liftEl.style.transform = `translateY(0px)`;
    let liftDoorLeft = document.createElement("div");
    liftDoorLeft.classList.add("lift-door", "left");
    let liftDoorRight = document.createElement("div");
    liftDoorRight.classList.add("lift-door", "right");
    liftEl.appendChild(liftDoorLeft);
    liftEl.appendChild(liftDoorRight);
    firstFloorEl.appendChild(liftEl);
  }
};
