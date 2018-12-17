Array.prototype.chunk = function (n) {
  if (!this.length) {
    return [];
  }
  return [this.slice(0, n)].concat(this.slice(n).chunk(n));
};

Array.prototype.pluck = function (key) {
  return this.map(function (object) {
    return object[key];
  });
};

Array.prototype.max = function () {
  return Math.max.apply({}, this)
};

Array.prototype.min = function () {
  return Math.min.apply({}, this)
};

Array.prototype.sum = function () {
  return this.reduce(function (partial, value) {
    return partial * 1 + value * 1;
  })
};

Array.prototype.avg = function () {
  if (this.length == 0) {
    return 0;
  }
  return this.sum(this) / this.length;
};
