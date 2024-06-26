"use strict";

import { Controller } from "./controller.js";
import { DataStore } from "./datastore.js";
import { Queue } from "./queue.js";

let simulateBtnEl = document.querySelector(".simulate-btn");
let floorsInputEl = document.querySelector("#floors");
let liftsInputEl = document.querySelector("#lifts");
let invalidFloorsEl = document.querySelector(".invalid-floors");
let invalidLiftsEl = document.querySelector(".invalid-lifts");
let isConfigView = true;

let configureBtnEl = document.querySelector("#configure");
let resetBtnEl = document.querySelector("#reset");

let controller = null;
let datastore = null;
let queue = null;

//global values for lifts and floors
// let floorsValue = 0;
// let liftsValue = 0;

simulateBtnEl.addEventListener("click", function () {
  let floorsValue = floorsInputEl.value;
  let liftsValue = liftsInputEl.value;
  console.log(floorsValue, liftsValue);
  if (Number(floorsValue) < 2) {
    invalidFloorsEl.classList.remove("hide-invalid-message");
  }

  if (Number(liftsValue) < 1) {
    invalidLiftsEl.classList.remove("hide-invalid-message");
  }
  if (Number(floorsValue) < 2 || Number(liftsValue) < 1) {
    return;
  }
  toggleView();
});

floorsInputEl.addEventListener("input", function (e) {
  const el = e.target;
  console.log(Number(el.value));
  if (Number(el.value) < 2) {
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
  queueInit();
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
  controller = new Controller(datastore, queue);
};

const datastoreInit = function (floors, lifts) {
  if (datastore) {
    datastore = null;
  }
  datastore = new DataStore(floors, lifts);
};

const queueInit = function () {
  if (queue) {
    queue = null;
  }
  queue = new Queue();
};

const controllerAction = function (e) {
  if (controller.checkDuplicateRequest(e)) {
    console.log("DUPLICATE REQUEST");
    return;
  }
  let result = controller.findBestLift(e);
  // let [chosenLiftData, currentFloor] = result;
  let [chosenLiftData, currentFloor, requestedDirection] = result;
  console.log(requestedDirection);
  if (chosenLiftData) {
    controller.moveLift(chosenLiftData, currentFloor, requestedDirection);
  } else {
    console.log("DIDN'T FIND LIFT. ADDED TO QUEUE");
    // queue.push(currentFloor);
    console.log(requestedDirection);
    queue.push([currentFloor, requestedDirection]);
  }
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

    //up button
    let upButton = document.createElement("button");
    upButton.classList.add("lift-button", "up");
    if (i == floors) {
      upButton.classList.add("disable-btn");
    }
    upButton.id = `${i}-up`;
    upButton.innerHTML = "&#8593;";
    upButton.addEventListener("click", controllerAction);
    liftButtonGrpEl.appendChild(upButton);

    //down button
    let downButton = document.createElement("button");
    downButton.classList.add("lift-button", "down");
    if (i == 1) {
      downButton.classList.add("disable-btn");
    }
    downButton.id = `${i}-down`;
    downButton.innerHTML = "&#8595;";
    downButton.addEventListener("click", controllerAction);
    liftButtonGrpEl.appendChild(downButton);

    //checking if there is only one floor, then remove disable-btn on both up and down button
    if (floors == 1) {
      upButton.classList.remove("disable-btn");
      downButton.classList.remove("disable-btn");
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
  let leftOffset = 50;
  let liftSpacing = 100;
  let distanceFromLeft = 0;
  let bottomOffset = 15;
  let liftWidth = 30;
  for (let i = 0; i < lifts; i++) {
    let liftEl = document.createElement("div");
    liftEl.classList.add("lift");
    liftEl.id = `lift_${i + 1}`;
    liftEl.style.left = `${leftOffset + distanceFromLeft + liftSpacing}px`;
    distanceFromLeft = distanceFromLeft + liftWidth + liftSpacing;
    liftEl.style.bottom = `${bottomOffset}px`;
    liftEl.style.transform = `translateY(0%)`;
    let liftDoorLeft = document.createElement("div");
    liftDoorLeft.classList.add("lift-door", "left");
    let liftDoorRight = document.createElement("div");
    liftDoorRight.classList.add("lift-door", "right");
    liftEl.appendChild(liftDoorLeft);
    liftEl.appendChild(liftDoorRight);
    firstFloorEl.appendChild(liftEl);
  }
};
