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

Som = {
		current_note:0,
    playAndClearQueue: function(){
				if (Som.current_note > Som.playQueue.length){
					Som.current_note=0;
					Som.playQueue = [];
				} else {
          Som.playNote(Som.playQueue[Som.current_note]);
					window.setTimeout("Som.playAndClearQueue()", 500);
					Som.current_note++;
				}
		},
    playNote: function(n) {
        Som.playNote(n);
        PB.setDisplay(n);
    },

    SampleRate: 44100,
    TickInterval: 10,
    encodeBase64: function(str) {
        var out, i, len;
        var c1, c2, c3;
        const base64EncodeChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

        len = str.length;
        i = 0;
        out = "";
        while(i < len) {
            c1 = str.charCodeAt(i++) & 0xff;
            if(i == len) {
                out += base64EncodeChars.charAt(c1 >> 2);
                out += base64EncodeChars.charAt((c1 & 0x3) << 4);
                out += "==";
                break;
            }
            c2 = str.charCodeAt(i++);
            if(i == len) {
                out += base64EncodeChars.charAt(c1 >> 2);
                out += base64EncodeChars.charAt(((c1 & 0x3)<< 4) | ((c2 & 0xF0) >> 4));
                out += base64EncodeChars.charAt((c2 & 0xF) << 2);
                out += "=";
                break;
            }
            c3 = str.charCodeAt(i++);
            out += base64EncodeChars.charAt(c1 >> 2);
            out += base64EncodeChars.charAt(((c1 & 0x3)<< 4) | ((c2 & 0xF0) >> 4));
            out += base64EncodeChars.charAt(((c2 & 0xF) << 2) | ((c3 & 0xC0) >>6));
            out += base64EncodeChars.charAt(c3 & 0x3F);
        }
        return out;
    },
    encode8BitAudio: function(data) {
		var n = data.length;
		var integer = 0, i;

		// 8-bit mono WAVE header template
		var header = "RIFF<##>WAVEfmt \x10\x00\x00\x00\x01\x00\x01\x00<##><##>\x01\x00\x08\x00data<##>";

		// Helper to insert a 32-bit little endian int.
		function insertLong(value) {
			var bytes = "";
			for (i = 0; i < 4; ++i) {
				bytes += String.fromCharCode(value % 256);
				value = Math.floor(value / 256);
			}
			header = header.replace('<##>', bytes);
		}

		insertLong(36 + n); // chunk size
		insertLong(Som.SampleRate); // sample rate
		insertLong(Som.SampleRate); // byte rate
		insertLong(n); // subchunk2 size

		// Output sound data
		for (var i = 0; i < n; ++i) {
			header += String.fromCharCode(data[i] * 255);
		}

		return 'data:audio/wav;base64,' + Som.encodeBase64(header);
    },
    newTone: function (f) {
        var audio = new Audio();
        const numberOfSamples = Math.ceil(Som.SampleRate * Som.TickInterval / 100);
        const dt = 1 / Som.SampleRate;
        var samples = [];
        for (var i = 0; i < numberOfSamples; ++i) {
	        const x = f * (i * dt);
	        const y = x - Math.floor(x);
	        samples.push(!!(y >= 0.5));
        }

        audio.setAttribute("src", Som.encode8BitAudio(samples));

        audio.load();
        audio.autoplay = false;
        return function() {audio.play();};
    },
    playNote: function (n) {
        const noteToToneTable = {
            "c": Som.newTone(261.63),
            "d": Som.newTone(293.66),
            "e": Som.newTone(329.63),
            "f": Som.newTone(349.23),
            "g": Som.newTone(392.00),
            "a": Som.newTone(440.00),
            "b": Som.newTone(493.88),
            "C": Som.newTone(523.25),
            "D": Som.newTone(587.33),
            "p": function() {}
        };
        var tone = noteToToneTable[n];
        if (tone === undefined) {
            return;
        }
        tone();
    }
};

MemoriaSons = {
    reset: function() {
        PB.setDisplay("");
        Som.playQueue = [];
    },
    oneLoopIteration: function() {},
    buttonPress: function(b) {
        if (b == 'ENTER') {
            Som.playAndClearQueue();
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
        Som.playQueue.push(note);
        Som.playNote(note);
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
        PB.setDisplay("      " + Aritmetica.answer);
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
        PB.debug(Aritmetica.firstDigit + " " + Aritmetica.operation + " " + Aritmetica.secondDigit);
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
            PB.debug("Selected book: " + book);
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
        PB.debug("The correct answer was: " + Livro.getCorrectAnswer());
    },
    advanceQuestion: function() {
        if (Livro.question >= 0) {
            Livro.points += PB.pointsByNumberOfTries(Livro.tries);
        }
        Livro.tries = 0;
        Livro.question++;
        PB.setDisplay("      " + Livro.question);
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
        PB.setDisplay("  *    ");
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
    setSegment: function(i, seg, state){
        var s = document.getElementById("d" + i + "_" + seg);
        s.setAttribute('visibility', state ? 'hidden' : 'visible');
    },
    setDigit: function(i, c){
	    const fontTable = {
			"0": [1, 1, 1, 1, 1, 1, 0],
			"1": [1, 1, 0, 0, 0, 0, 0],
			"2": [1, 0, 1, 1, 0, 1, 1],
			"3": [1, 1, 1, 0, 0, 1, 1],
			"4": [1, 1, 0, 0, 1, 0, 1],
			"5": [0, 1, 1, 0, 1, 1, 1],
			"6": [0, 1, 1, 1, 1, 1, 1],
			"7": [1, 1, 0, 0, 0, 1, 0],
			"8": [1, 1, 1, 1, 1, 1, 1],
			"9": [1, 1, 1, 1, 0, 1, 1],
			"-": [0, 0, 0, 0, 0, 0, 1],
			"_": [0, 0, 1, 0, 0, 0, 0],
			" ": [0, 0, 0, 0, 0, 0, 0],
			"a": [1, 1, 0, 1, 1, 1, 1],
			"b": [0, 1, 1, 1, 1, 0, 0],
			"c": [0, 0, 1, 1, 1, 1, 0],
			"d": [0, 0, 0, 0, 0, 0, 0],
			"e": [0, 0, 0, 0, 0, 0, 0],
			"f": [0, 0, 0, 0, 0, 0, 0],
			"*": [1, 1, 1, 1, 1, 1, 1]
		};
		var state = fontTable[c];
		if (state === undefined) {
			state = fontTable[' '];
		}
		for (var segment = 1; segment < 8; segment++) {
			PB.setSegment(i, "abcdefg"[segment - 1], state[segment - 1]);
		}
    },
    setDisplay: function(c) {
		for (var i = 1; i <= 7; ++i) {
			PB.setDigit(i, c[i - 1]);
		}
    },
    debug: function(t) {
        document.getElementById("debug").textContent = t;
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
