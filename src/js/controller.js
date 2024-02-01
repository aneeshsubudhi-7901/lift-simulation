export class Controller {
  constructor() {}
  static up(e) {
    let currentFloor = e.target.id.split("-")[0];
    console.log(currentFloor);
  }
  static down(e) {
    let currentFloor = e.target.id.split("-")[0];
    console.log(currentFloor);
  }
}
