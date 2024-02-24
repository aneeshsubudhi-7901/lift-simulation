export class Queue {
  constructor() {
    this.queue = [];
    this.size = 0;
  }
  push(floor) {
    this.queue.push(floor);
    this.size++;
  }
  pop() {
    if (!this.empty()) {
      this.queue.shift();
      this.size--;
    }
  }
  top() {
    if (!this.empty()) {
      return this.queue[0];
    }
    return null;
  }
  empty() {
    return this.size === 0;
  }
}
