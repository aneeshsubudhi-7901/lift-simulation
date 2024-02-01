class DataStore {
  constructor() {
    this.state = {
      floors: {},
      lifts: {},
    };
  }
  setLiftState() {}
  setFloorState() {}
}

const dataStore = new DataStore();
