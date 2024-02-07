export class DataStore {
  constructor(floors, lifts) {
    this.floors = floors;
    this.lifts = lifts;
    this.state = new Map();
    for (let i = 1; i <= lifts; i++) {
      this.state.set(i, {
        floor: 1,
        transition: false,
        open: false,
      });
    }
  }
  setState(lift, newState) {
    let toBeState = this.getLiftState(lift);
    for (let key in newState) {
      toBeState[key] = newState[key];
    }
    this.state.set(lift, toBeState);
  }
  getLiftState(lift) {
    return this.state.get(lift);
  }
  getState() {
    return this.state;
  }
}
