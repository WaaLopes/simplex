const simplex = {
  matrix: [
    [2, 1, 1, 0, 0, 18],
    [2, 3, 0, 1, 0, 42],
    [3, 1, 0, 0, 1, 24],
    [-3, -2, 0, 0, 0, 0]
  ],
  simplexObjective: "max",

  shouldIterate() {
    const lastLineMin = Math.min(...[...this.matrix].pop());
    if (this.simplexObjective === "max" && lastLineMin < 0) {
      return true;
    }
    const lastLineMax = Math.max(...[...this.matrix].pop());
    if (this.simplexObjective === "min" && lastLineMax > 0) {
      return true;
    }
    return false;
  },

  getBaseEntry() {
    const lastLine = [...this.matrix].pop();
    if (this.simplexObjective === "max") {
      const smaller = lastLine.reduce((smaller, actual) =>
        smaller ? (actual !== 0 && actual < smaller ? actual : smaller) : actual
      );
      return lastLine.indexOf(smaller);
    }

    const biggest = lastLine.reduce((biggest, actual) =>
      biggest ? (actual !== 0 && actual > biggest ? actual : biggest) : actual
    );
    return lastLine.indexOf(biggest);
  },

  getBaseLeft(baseEntry) {
    let smallest = 0;
    for (let lineIndex = 1; lineIndex < this.matrix.length - 1; lineIndex++) {
      this.matrix[lineIndex].push();
      smallest =
        [...this.matrix[smallest]].pop() / this.matrix[smallest][baseEntry] <
        [...this.matrix[lineIndex]].pop() / this.matrix[lineIndex][baseEntry]
          ? smallest
          : lineIndex;
    }
    return smallest;
  },

  solveSimplex() {
    while (this.shouldIterate()) {
      const baseEntry = this.getBaseEntry();
      const baseLeft = this.getBaseLeft(baseEntry);
      const pivot = this.matrix[baseLeft][baseEntry];

      for (
        let colIndex = 0;
        colIndex < this.matrix[baseLeft].length;
        colIndex++
      ) {
        this.matrix[baseLeft][colIndex] =
          this.matrix[baseLeft][colIndex] / pivot;
      }

      for (let lineIndex = 0; lineIndex < this.matrix.length; lineIndex++) {
        const line = this.matrix[lineIndex];
        if (lineIndex !== baseLeft) {
          const previousLinePivotCol = this.matrix[lineIndex][baseEntry];
          for (let colIndex = 0; colIndex < line.length; colIndex++) {
            this.matrix[lineIndex][colIndex] =
              this.matrix[lineIndex][colIndex] -
              previousLinePivotCol * this.matrix[baseLeft][colIndex];
          }
        }
      }
      console.log(this.matrix);
    }
  }
};

simplex.solveSimplex();
