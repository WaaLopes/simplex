const buildRestricionLine = (restrictionIndex, decisionVars) => {
	let line = "";
	for (let dIndex = 0; dIndex < decisionVars; dIndex++) {
		line += `
			<input
				type="number"
				id="r${restrictionIndex}d${dIndex}"
			>X${dIndex + 1}${dIndex === decisionVars - 1 ? "" : " + "}
		`;
	}
	return line;
};

const toggleStep = toggledStep => {
	const steps = document.querySelectorAll(".step");
	steps.forEach(step => {
		step.classList.remove("-on");
		step.classList.add("-off");
	});

	steps[toggledStep - 1].classList.add("-on");
	steps[toggledStep - 1].classList.remove("-off");
}

const turnStep2 = () => {
	const decisionVars = +document.getElementById("decisionVars").value;
	const restrictions = +document.getElementById("restrictions").value;

	const simplexObjective = document.getElementById("simplexObjective").value;
	const simplexObjectiveText = simplexObjective === "max" ? "<=" : ">=";

	const step2Restrictions = document.querySelector(".step2-restrictions");
	for (let rIndex = 0; rIndex < restrictions; rIndex++) {
		const restrictionLine = `
			<div class="restrictionLine">
				${buildRestricionLine(rIndex, decisionVars)}
				${simplexObjectiveText}
				<input type="number" id="r${rIndex}Result">
			</div>
		`;
		step2Restrictions.innerHTML += restrictionLine;
	}

	let nonNullRestricition = "";
	for (let dIndex = 0; dIndex < decisionVars; dIndex++) {
		nonNullRestricition += `X${dIndex} ${dIndex === decisionVars - -1 ? "" : ", "}`;
	}
	step2Restrictions.innerHTML += `${nonNullRestricition} >= 0`;

	toggleStep(2);
};

const getLastLine = (matrix) => {
	const variables = document.querySelectorAll(".objectiveFunction");
	const lastLine = [];
	for (let i = 0; i < matrix[0].length; i++) {
		lastLine.push(variables[i] ? -variables[i].value : 0);
	}
	return lastLine;
}

const createSimplexMatrix = () => {
	const matrix = [];
	const restrictionLines = document.querySelectorAll(".restrictionLine");
	restrictionLines.forEach((restrictionLine, restrictionIndex) => {
		const temp = [];

		const restrictionFields = restrictionLine.querySelectorAll("input");
		for (let rIndex = 0; rIndex < restrictionFields.length - 1; rIndex++) {
			temp.push(restrictionFields[rIndex].value);
		}

		for (let rlIndex = 0; rlIndex < restrictionLines.length; rlIndex++) {
			temp.push(restrictionIndex === rlIndex ? 1 : 0);
		}

		temp.push(restrictionFields[restrictionFields.length - 1].value);
		matrix.push(temp);
	});

	matrix.push(getLastLine(matrix));
	return matrix;
};

const Simplex = {
	matrix: [
		[2, 1, 1, 0, 0, 18],
		[2, 3, 0, 1, 0, 42],
		[3, 1, 0, 0, 1, 24],
		[-3, -2, 0, 0, 0, 0]
	],
	simplexObjective: "max",
	simplexContainer: document.querySelector(".solvedSimplex"),

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
		const lastLine = [...this.matrix];
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
			smallest =
				[...this.matrix[smallest]].pop() / this.matrix[smallest][baseEntry] <
					[...this.matrix[lineIndex]].pop() / this.matrix[lineIndex][baseEntry]
					? smallest
					: lineIndex;
		}
		return smallest;
	},

	renderMatrix() {
		this.simplexContainer.innerHTML += `<table cellspacing="0" cellpadding="0">`;

		this.matrix.forEach(line => {
			this.simplexContainer.innerHTML += "<tr>";
			line.forEach(value => {
				this.simplexContainer.innerHTML += `<td>${value}</td>`;
			});
			this.simplexContainer.innerHTML += "</tr>";
		});

		this.simplexContainer.innerHTML += "</table>";
	},

	solve() {
		this.simplexContainer.innerHTML = "";
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
			debugger;

			for (let lineIndex = 0; lineIndex < this.matrix.length; lineIndex++) {
				const line = this.matrix[lineIndex];
				if (lineIndex !== baseLeft) {
					const temp = this.matrix[lineIndex][baseEntry];
					for (let colIndex = 0; colIndex < line.length; colIndex++) {
						this.matrix[lineIndex][colIndex] =
							this.matrix[lineIndex][colIndex] -
							(temp * this.matrix[baseLeft][colIndex]);
					}
				}
			}
			this.renderMatrix();
		}
	},

	create(matrix, simplexObjective) {
		this.matrix = matrix;
		this.simplexObjective = simplexObjective;

		return this;
	}
};

const solveSimplex = () => {
	const matrix = createSimplexMatrix();
	const simplex = Simplex.create(
		matrix,
		document.getElementById("simplexObjective").value
	);
	simplex.solve();
};

document.querySelectorAll(".nextStep").forEach(nextButton => {
	nextButton.addEventListener("click", ({ target }) => {
		if (target.dataset.next === "step2") {
			turnStep2();
			return;
		}
		if (target.dataset.next === "solve") {
			solveSimplex();
			return;
		}
	});
});

Simplex.solve();
