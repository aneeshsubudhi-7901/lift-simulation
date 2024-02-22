export class Controller {
  constructor(datastore, queue) {
    this.datastore = datastore;
    this.queue = queue;
  }

  checkLiftDirectionFit(currentFloor, requestedDirection, liftState) {
    if (requestedDirection === liftState.direction) {
      if (
        (requestedDirection === "up" && liftState.floor <= currentFloor) ||
        (requestedDirection === "down" && liftState.floor >= currentFloor)
      ) {
        return true;
      }
    } else {
      if (
        (requestedDirection === "up" && liftState.floor >= currentFloor) ||
        (requestedDirection === "down" && liftState.floor <= currentFloor)
      ) {
        return true;
      }
    }
    return false;
  }

  checkDuplicateRequest(e) {
    let currentFloor = Number(e.target.id.split("-")[0]);
    let requestedDirection = e.target.classList.contains("up") ? "up" : "down";
    let currentLiftsState = this.datastore.getState();
    // console.log("checkDuplicateRequest");
    if (
      this.queue.queue.find(
        (val) => val[0] == currentFloor && val[1] == requestedDirection
      )
    ) {
      return true;
    }
    for (let [key, liftState] of currentLiftsState) {
      if (
        (currentFloor === liftState.destinationFloor &&
          requestedDirection === liftState.direction) ||
        (currentFloor === liftState.floor &&
          requestedDirection === liftState.direction &&
          (liftState.transition == true || liftState.open == true))
      ) {
        return true;
      }
    }
    return false;
  }

  findBestLift(e) {
    let currentFloor = Number(e.target.id.split("-")[0]);
    let requestedDirection = e.target.classList.contains("up") ? "up" : "down";
    let currentLiftsState = this.datastore.getState();
    let chosenLift = 0;
    let leastDistance = 10000;
    let chosenLiftAtFloor = 0;
    for (let [key, liftState] of currentLiftsState) {
      if (
        !liftState.transition &&
        !liftState.open &&
        this.checkLiftDirectionFit(currentFloor, requestedDirection, liftState)
      ) {
        let currentDistance = Math.abs(currentFloor - liftState.floor);
        if (leastDistance > currentDistance) {
          leastDistance = currentDistance;
          chosenLift = key;
          chosenLiftAtFloor = liftState.floor;
        }
      }
    }

    if (chosenLift === 0) {
      return [null, currentFloor, requestedDirection];
    }
    return [
      { leastDistance, chosenLift, chosenLiftAtFloor },
      currentFloor,
      requestedDirection,
    ];
  }

  moveLift(
    { leastDistance, chosenLift, chosenLiftAtFloor },
    currentFloor,
    requestedDirection
  ) {
    this.datastore.setState(chosenLift, {
      transition: true,
      destinationFloor: currentFloor,
      direction: requestedDirection,
    });
    let chosenLiftEl = document.getElementById(`lift_${chosenLift}`);
    chosenLiftEl.style.transitionDuration = `${leastDistance * 2}s`;
    chosenLiftEl.style.transitionProperty = "transform";
    chosenLiftEl.style.transitionTimingFunction = "linear";
    let distanceToMove = leastDistance * 194;
    distanceToMove =
      currentFloor > chosenLiftAtFloor ? -1 * distanceToMove : distanceToMove;
    chosenLiftEl.style.transform = `translateY(${distanceToMove}%)`;
    // this.currentFloor = currentFloor;
    setTimeout(
      function () {
        let leftDoorEl = chosenLiftEl.children[0];
        let rightDoorEl = chosenLiftEl.children[1];
        this.datastore.setState(chosenLift, {
          transition: false,
          open: true,
          destinationFloor: null,
          floor: currentFloor,
          direction:
            this.datastore.getFloorsNum() === currentFloor
              ? "down"
              : currentFloor === 1
              ? "up"
              : requestedDirection,
        });
        leftDoorEl.classList.add("liftdoor-left");
        rightDoorEl.classList.add("liftdoor-right");
        chosenLiftEl.style.bottom = `${15 + (currentFloor - 1) * 223.5}px`;
        chosenLiftEl.style.transitionDuration = "";
        chosenLiftEl.style.transitionProperty = "";
        chosenLiftEl.style.transform = "";
        chosenLiftEl.style.transitionTimingFunction = "";
        setTimeout(
          function () {
            this.datastore.setState(chosenLift, {
              open: false,
            });
            leftDoorEl.classList.remove("liftdoor-left");
            rightDoorEl.classList.remove("liftdoor-right");

            //check queue for any pending requests
            //if any pending rquest in the queue, pick that up and moveLift
            this.checkQueueAndProcess(chosenLift);
          }.bind(this),
          5000
        );
      }.bind(this),
      leastDistance * 2000
    );
  }

  checkQueueAndProcess(chosenLift) {
    //check queue for any pending requests
    // if (!this.queue.empty()) {
    //   //pick the first request in the queue and move lift
    //   let currentFloor = this.queue.top();
    //   this.queue.pop();
    //   let chosenLiftAtFloor = this.datastore.getLiftState(chosenLift).floor;
    //   let chosenLiftData = {
    //     chosenLift,
    //     leastDistance: Math.abs(currentFloor - chosenLiftAtFloor),
    //     chosenLiftAtFloor,
    //   };
    //   this.moveLift(chosenLiftData, currentFloor);
    // }

    if (!this.queue.empty()) {
      console.log("checkQueueAndProcess : ", this.queue.queue);
      let chosenRequest = null;
      for (let i = 0; i < this.queue.queue.length; i++) {
        if (
          this.checkLiftDirectionFit(
            this.queue.queue[i][0],
            this.queue.queue[i][1],
            this.datastore.getLiftState(chosenLift)
          )
        ) {
          chosenRequest = i;
          console.log("checkQueueAndProcess : ", chosenRequest);
          break;
          // const currentRequest = this.queue.queue[i];
          // this.queue.queue.splice(i, 1);
          // let chosenLiftAtFloor = this.datastore.getLiftState(chosenLift).floor;
          // let chosenLiftData = {
          //   chosenLift,
          //   leastDistance: Math.abs(currentRequest[0] - chosenLiftAtFloor),
          //   chosenLiftAtFloor,
          // };
          // this.moveLift(chosenLiftData, currentRequest[0], currentRequest[1]);
          // return;
        }
      }
      if (chosenRequest == null) {
        return;
      }

      const [currentFloor, requestedDirection] =
        this.queue.queue[chosenRequest];
      console.log(
        `currentFloor : ${currentFloor}, requestDirection : ${requestedDirection}`
      );
      this.queue.queue.splice(chosenRequest, 1);
      let chosenLiftAtFloor = this.datastore.getLiftState(chosenLift).floor;
      let chosenLiftData = {
        chosenLift,
        leastDistance: Math.abs(currentFloor - chosenLiftAtFloor),
        chosenLiftAtFloor,
      };
      this.moveLift(chosenLiftData, currentFloor, requestedDirection);
      return;
    }
  }
  move(e) {
    let currentFloor = Number(e.target.id.split("-")[0]);
    // this.datastore.setState(1, { transition: true });
    //find the right lift that can come to current floor
    //-iterate through the list of lifts as represented by the state(which is a map)
    //-look for the lift which is closest to the current floor and is free(neither in transition or open), store that lift number in the variable
    //-right now not to think of the case where you are not able to find a lift that is free
    //-set transition to true
    //-fetch chosen lift element(so that its css rules can be changed)
    //-here add the required css rules to the chosen lift element(related to lift moving up/down transition)
    //-start a setTimeout timer(with (number of floors to travel * 2s))
    //  -time finishes, set transition to false
    //-set open to true
    //-here add the required css classes for lift doors
    //set another setTimeout timer for opening and closing of doors(5s = 2.5s for opening and 2.5s for closing)
    //  -time finishes, set open to false and remove the css classes for lift doors
    //  -set floor to currentFloor

    let currentLiftsState = this.datastore.getState();
    let chosenLift = 0;
    let leastDistance = 100;
    let chosenLiftAtFloor = 0;
    for (let [key, liftState] of currentLiftsState) {
      if (!liftState.transition && !liftState.open) {
        let currentDistance = Math.abs(currentFloor - liftState.floor);
        if (leastDistance > currentDistance) {
          leastDistance = currentDistance;
          chosenLift = key;
          chosenLiftAtFloor = liftState.floor;
        }
      }
    }

    this.datastore.setState(chosenLift, { transition: true });
    let chosenLiftEl = document.getElementById(`lift_${chosenLift}`);
    chosenLiftEl.style.transitionDuration = `${leastDistance * 2}s`;
    chosenLiftEl.style.transitionProperty = "transform";
    let distanceToMove = leastDistance * 223.5;
    // let distanceToMove = 0;
    distanceToMove =
      currentFloor > chosenLiftAtFloor ? -1 * distanceToMove : distanceToMove;
    // chosenLiftEl.style.transform = `translateY(${
    //   distanceToMove + (chosenLiftAtFloor - 1) * -223.5
    // }px)`;
    chosenLiftEl.style.transform = `translateY(${distanceToMove}px)`;
    console.log(this);
    this.currentFloor = currentFloor;
    setTimeout(
      function () {
        let leftDoorEl = chosenLiftEl.children[0];
        let rightDoorEl = chosenLiftEl.children[1];
        this.datastore.setState(chosenLift, { transition: false, open: true });
        leftDoorEl.classList.add("liftdoor-left");
        rightDoorEl.classList.add("liftdoor-right");
        chosenLiftEl.style.bottom = `${15 + (this.currentFloor - 1) * 223.5}px`;
        chosenLiftEl.style.transitionDuration = "";
        chosenLiftEl.style.transitionProperty = "";
        chosenLiftEl.style.transform = "";
        setTimeout(
          function () {
            this.datastore.setState(chosenLift, {
              open: false,
              floor: currentFloor,
            });
            leftDoorEl.classList.remove("liftdoor-left");
            rightDoorEl.classList.remove("liftdoor-right");
            console.log(chosenLiftEl.style.bottom);
          }.bind(this),
          5000
        );
      }.bind(this),
      leastDistance * 2000
    );
  }
}
