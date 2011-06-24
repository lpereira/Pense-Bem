DummyMode = {
	reset: function() {},
	oneLoopIteration: function() {},
	buttonPress: function() {},
	buttonRelease: function() {},
};
AdvinheONumeroMode = DummyMode;
SigaMeMode = DummyMode;
NumeroDoMeioMode = DummyMode;
OperacaoMode = DummyMode;

MemoriaSonsMode = {
	reset: function() {
		PB.setDisplay("");
		MemoriaSonsMode.playQueue = [];
	},
	oneLoopIteration: function() {},
	playAndClearQueue: function() {
		for (var noteIndex in MemoriaSonsMode.playQueue) {
			MemoriaSonsMode.playNote(MemoriaSonsMode.playQueue[noteIndex]);
		}
		MemoriaSonsMode.reset();
	},
	playNote: function(n) {
		PB.setDisplay(n);
	},
	buttonPress: function(b) {
		if (b == 'ENTER') {
			MemoriaSonsMode.playAndClearQueue();
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
		MemoriaSonsMode.playQueue.push(note);
		MemoriaSonsMode.playNote(note);
	},
	buttonRelease: function(b) {}
};

AritmeticaMode = {
	reset: function() {
		AritmeticaMode.possibleOperations = "+-/*";
	},
	oneLoopIteration: function() {},
	buttonPress: function(b) {},
	buttonRelease: function(b) {}
};

AdicaoMode = {
	reset: function() {
		AritmeticaMode.reset();
		AritmeticaMode.possibleOperations = "+";
	},
	oneLoopIteration: AritmeticaMode.oneLoopIteration,
	buttonPress: AritmeticaMode.buttonPress,
	buttonRelease: AritmeticaMode.buttonRelease
};

SubtracaoMode = {
	reset: function() {
		AritmeticaMode.reset();
		AritmeticaMode.possibleOperations = "-";
	},
	oneLoopIteration: AritmeticaMode.oneLoopIteration,
	buttonPress: AritmeticaMode.buttonPress,
	buttonRelease: AritmeticaMode.buttonRelease
};

MultiplicacaoMode = {
	reset: function() {
		AritmeticaMode.reset();
		AritmeticaMode.possibleOperations = "*";
	},
	oneLoopIteration: AritmeticaMode.oneLoopIteration,
	buttonPress: AritmeticaMode.buttonPress,
	buttonRelease: AritmeticaMode.buttonRelease
};

DivisaoMode = {
	reset: function() {
		AritmeticaMode.reset();
		AritmeticaMode.possibleOperations = "/";
	},
	oneLoopIteration: AritmeticaMode.oneLoopIteration,
	buttonPress: AritmeticaMode.buttonPress,
	buttonRelease: AritmeticaMode.buttonRelease
};

LivroMode = {
	StateChoosingBook: 0,
	StateQuestioning: 1,
	reset: function() {
		LivroMode.state = LivroMode.StateChoosingBook;
	},
	oneLoopIteration: function() {
		switch (LivroMode.state) {
		case LivroMode.StateChoosingBook:
			var book = prompt("Book number?", "_");
			book = parseInt(book.substring(0, 2));
			PB.setDisplay("Selected book: " + book);
			if (book > 0 && book < 999) {
				LivroMode.book = book;
				LivroMode.question = 0;
				LivroMode.tries = 0;
				LivroMode.points = 0;
				LivroMode.state = LivroMode.StateQuestioning;

				LivroMode.advanceQuestion();
			}
			break;
		case LivroMode.StateQuestioning:
		}
	},
	showCorrectAnswer: function() {
		PB.setDisplay("The correct answer was: " + LivroMode.getCorrectAnswer());
	},
	advanceQuestion: function() {
		if (LivroMode.question >= 0) {
			switch (LivroMode.tries) {
			case 0: LivroMode.points += 10; break;
			case 1: LivroMode.points += 6; break;
			case 2: LivroMode.points += 4; break;
			}
		}
		LivroMode.tries = 0;
		LivroMode.question++;
		PB.setDisplay("Question: " + LivroMode.question);
	},
	getCorrectAnswer: function() {
		const answerPattern = "CDDBAADCBDAADCBB";
		return answerPattern[(LivroMode.book + LivroMode.question) & 15];		
	},
	buttonPress: function(b) {
		switch (LivroMode.state) {
		case LivroMode.StateChoosingBook:
			break;
		case LivroMode.StateQuestioning:
			switch (b) {
			case "A":
			case "B":
			case "C":
			case "D":
				if (LivroMode.getCorrectAnswer(b) == b) {
					LivroMode.advanceQuestion();
					return;
				}
				LivroMode.tries++;
				if (LivroMode.tries >= 3) {
					LivroMode.showCorrectAnswer();
					LivroMode.advanceQuestion();
				} else {
					PB.setDisplay((3 - LivroMode.tries) + " more tries");
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

WelcomeMode = {
	reset: function() {
		PB.setDisplay("*");
	},
	oneLoopIteration: function() {},
	buttonPress: function(b) {
		const buttonToModeTable = {
			"ADVINHE-O-NÚMERO": AdvinheONumeroMode,
			"ADIÇÃO": AdicaoMode,
			"MULTIPLICAÇÃO": MultiplicacaoMode,
			"DIVISÃO": DivisaoMode,
			"ARITMETICA": AritmeticaMode,
			"OPERAÇÃO": OperacaoMode,
			"SIGA-ME": SigaMeMode,
			"MEMÓRIA-SONS": MemoriaSonsMode,
			"NÚMERO-DO-MEIO": NumeroDoMeioMode,
			"SUBTRAÇÃO": SubtracaoMode,
			"LIVRO": LivroMode,
		};
		var newMode = buttonToModeTable[b];
		if (newMode === undefined) {
			PB.beep();
			return;
		}
		PB.setMode(newMode);
	},
	buttonRelease: function(b) {}
};

StandbyMode = {
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
		PB.setMode(StandbyMode);
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
		case 'LIGA': PB.setMode(WelcomeMode); return;
		case 'DESL': PB.setMode(StandbyMode); return;
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
	}
};