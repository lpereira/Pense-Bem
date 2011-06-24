Dummy = {
	reset: function() {},
	oneLoopIteration: function() {},
	buttonPress: function() {},
	buttonRelease: function() {},
};
AdvinheONumero = Dummy;
SigaMe = Dummy;
NumeroDoMeio = Dummy;
Operacao = Dummy;

MemoriaSons = {
	reset: function() {
		PB.setDisplay("");
		MemoriaSons.playQueue = [];
	},
	oneLoopIteration: function() {},
	playAndClearQueue: function() {
		for (var noteIndex in MemoriaSons.playQueue) {
			MemoriaSons.playNote(MemoriaSons.playQueue[noteIndex]);
		}
		MemoriaSons.reset();
	},
	playNote: function(n) {
		PB.setDisplay(n);
	},
	buttonPress: function(b) {
		if (b == 'ENTER') {
			MemoriaSons.playAndClearQueue();
			return;
		}
		const buttonToNoteTable = {
			"0": "p", "1": "c", "2": "d", "3": "e",
			"4": "f", "5": "g", "6": "a", "7": "b",
			"8": "C", "9": "D"
		};
		var note = buttonToNoteTable[b];
		if (note === undefined) {
			PB.beep();
			return;
		}
		MemoriaSons.playQueue.push(note);
		MemoriaSons.playNote(note);
	},
	buttonRelease: function(b) {}
};

Aritmetica = {
	reset: function() {
		Aritmetica.possibleOperations = "+-/*";
		Aritmetica.points = 0;
		Aritmetica.advanceQuestion();
	},
	oneLoopIteration: function() {
		var answer = parseInt(prompt("Answer:"));
		if (answer != Aritmetica.answer) {
			Aritmetica.tries++;
			if (Aritmetica.tries >= 3) {
				Aritmetica.showCorrectAnswer();
				Aritmetica.advanceQuestion();
			}
		} else {
			Aritmetica.points += PB.pointsByNumberOfTries(Aritmetica.tries);
			Aritmetica.advanceQuestion();
		}
	},
	showCorrectAnswer: function() {
		PB.setDisplay(Aritmetica.answer);
	},
	buttonPress: function(b) {},
	buttonRelease: function(b) {},
	advanceQuestion: function() {
		Aritmetica.tries = 0;
		Aritmetica.operation = Aritmetica.possibleOperations[Math.round(Math.random() * (Aritmetica.possibleOperations.length - 1))];
		Aritmetica.firstDigit = Math.round(Math.random() * 99);
		Aritmetica.secondDigit = Math.round(Math.random() * 99);
		if ((Aritmetica.operation == "/" || Aritmetica.operation == "-") && Aritmetica.secondDigit > Aritmetica.firstDigit) {
			var temp = Aritmetica.firstDigit;
			Aritmetica.firstDigit = Aritmetica.secondDigit;
			Aritmetica.secondDigit = temp;
			if (Aritmetica.secondDigit == 0) {
				Aritmetica.secondDigit = 1;
			}
		}
		const operatorFunctionTable = {
			"+": function(a, b) { return a + b; },
			"-": function(a, b) { return a - b; },
			"/": function(a, b) { return a / b; },
			"*": function(a, b) { return a * b; }
		};
		Aritmetica.answer = operatorFunctionTable[Aritmetica.operation](Aritmetica.firstDigit, Aritmetica.secondDigit);
		PB.setDisplay(Aritmetica.firstDigit + " " + Aritmetica.operation + " " + Aritmetica.secondDigit);
	}
};

Adicao = {
	reset: function() {
		Aritmetica.possibleOperations = "+";
		Aritmetica.advanceQuestion();
	},
	oneLoopIteration: Aritmetica.oneLoopIteration,
	buttonPress: Aritmetica.buttonPress,
	buttonRelease: Aritmetica.buttonRelease
};

Subtracao = {
	reset: function() {
		Aritmetica.possibleOperations = "-";
		Aritmetica.advanceQuestion();
	},
	oneLoopIteration: Aritmetica.oneLoopIteration,
	buttonPress: Aritmetica.buttonPress,
	buttonRelease: Aritmetica.buttonRelease
};

Multiplicacao = {
	reset: function() {
		Aritmetica.possibleOperations = "*";
		Aritmetica.advanceQuestion();
	},
	oneLoopIteration: Aritmetica.oneLoopIteration,
	buttonPress: Aritmetica.buttonPress,
	buttonRelease: Aritmetica.buttonRelease
};

Divisao = {
	reset: function() {
		Aritmetica.possibleOperations = "/";
		Aritmetica.advanceQuestion();
	},
	oneLoopIteration: Aritmetica.oneLoopIteration,
	buttonPress: Aritmetica.buttonPress,
	buttonRelease: Aritmetica.buttonRelease
};

Livro = {
	StateChoosingBook: 0,
	StateQuestioning: 1,
	reset: function() {
		Livro.state = Livro.StateChoosingBook;
	},
	oneLoopIteration: function() {
		switch (Livro.state) {
		case Livro.StateChoosingBook:
			var book = prompt("Book number?", "_");
			book = parseInt(book.substring(0, 2));
			PB.setDisplay("Selected book: " + book);
			if (book > 0 && book < 999) {
				Livro.book = book;
				Livro.question = 0;
				Livro.tries = 0;
				Livro.points = 0;
				Livro.state = Livro.StateQuestioning;

				Livro.advanceQuestion();
			}
			break;
		case Livro.StateQuestioning:
		}
	},
	showCorrectAnswer: function() {
		PB.setDisplay("The correct answer was: " + Livro.getCorrectAnswer());
	},
	advanceQuestion: function() {
		if (Livro.question >= 0) {
			Livro.points += PB.pointsByNumberOfTries(Livro.tries);
		}
		Livro.tries = 0;
		Livro.question++;
		PB.setDisplay("Question: " + Livro.question);
	},
	getCorrectAnswer: function() {
		const answerPattern = "CDDBAADCBDAADCBB";
		return answerPattern[(Livro.book + Livro.question) & 15];
	},
	buttonPress: function(b) {
		switch (Livro.state) {
		case Livro.StateChoosingBook:
			break;
		case Livro.StateQuestioning:
			switch (b) {
			case "A":
			case "B":
			case "C":
			case "D":
				if (Livro.getCorrectAnswer(b) == b) {
					Livro.advanceQuestion();
					return;
				}
				Livro.tries++;
				if (Livro.tries >= 3) {
					Livro.showCorrectAnswer();
					Livro.advanceQuestion();
				} else {
					PB.setDisplay((3 - Livro.tries) + " more tries");
				}
				break;
			default:
				PB.beep();
			}
			break;
		}
	},
	buttonRelease: function(b) {		
	}
}

Welcome = {
	reset: function() {
		PB.setDisplay("*");
	},
	oneLoopIteration: function() {},
	buttonPress: function(b) {
		const buttonToTable = {
			"ADVINHE-O-NÚMERO": AdvinheONumero,
			"ADIÇÃO": Adicao,
			"MULTIPLICAÇÃO": Multiplicacao,
			"DIVISÃO": Divisao,
			"ARITMÉTICA": Aritmetica,
			"OPERAÇÃO": Operacao,
			"SIGA-ME": SigaMe,
			"MEMÓRIA-SONS": MemoriaSons,
			"NÚMERO-DO-MEIO": NumeroDoMeio,
			"SUBTRAÇÃO": Subtracao,
			"LIVRO": Livro,
		};
		var newMode = buttonToTable[b];
		if (newMode === undefined) {
			PB.beep();
			return;
		}
		PB.setMode(newMode);
	},
	buttonRelease: function(b) {}
};

Standby = {
	reset: function() {
		PB.setDisplay("");
	},
	oneLoopIteration: function() {},
	buttonPress: function(b) {},
	buttonRelease: function(b) {}
};

PB = {
	mode: null,
	init: function() {
		PB.setMode(Standby);
		PB.reset();
		setInterval('PB.oneLoopIteration()', 100);
	},
	reset: function() {
		if (PB.mode) {
			PB.mode.reset();
		}
	},
	oneLoopIteration: function() {
		if (PB.mode) {
			PB.mode.oneLoopIteration();
		}
	},
	setMode: function(m) {
		PB.mode = m;
		PB.reset();
	},
	buttonPress: function(b) {
		switch (b) {
		case 'LIGA': PB.setMode(Welcome); return;
		case 'DESL': PB.setMode(Standby); return;
		default:
			if (PB.mode) {
				PB.mode.buttonPress(b);
			}
		}
	},
	buttonRelease: function(b) {
		if (b == 'LIGA' || b == 'DESL') {
			return;
		}
		if (PB.mode) {
			PB.mode.buttonRelease(b);
		}
	},
	beep: function() {
		PB.setDisplay("Ação inválida");
	},
	setDisplay: function(c) {
		document.getElementById("debug").textContent = c;
	},
	pointsByNumberOfTries: function(t) {
		switch (t) {
		case 0: return 10;
		case 1: return 6;
		case 2: return 4;
		}
		return 0;
	}
};