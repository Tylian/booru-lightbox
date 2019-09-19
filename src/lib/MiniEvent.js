export default class MiniEvent {
  constructor() {
    this._events = {};
  }
  on(type, func) {
    this._events = this._events || {};
    this._events[type] = this._events[type] || [];
    this._events[type].push(func);
  }
  off(type, func) {
    this._events = this._events || {};
    if (type in this._events === false) return;
    this._events[type].splice(this._events[type].indexOf(func), 1);
  }
  emit(type, ...args) {
    this._events = this._events || {};
    if (type in this._events === false) return;
    for (var i = 0; i < this._events[type].length; i++) {
      this._events[type][i](...args);
    }
  }
}