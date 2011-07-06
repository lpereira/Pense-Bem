pulseAudioBug = navigator.userAgent.indexOf("Linux") > 0;

Songs = {
    Welcome: "egage",
    GameSelected: "CgC",
    Correct: "gCC",
    Wrong: "ec",
    Fail: "egec",
    Winner: "gggeCCC",
    HighBeep: "C",
    LowBeep: "c"
}

Som = {
    SampleRate: 8192,
    TickInterval: 20,
    currentNote: 0,
    isPlayingSong: false,
    lowBeep: function() {
        Som.playNote(Songs.LowBeep);
    },
    highBeep: function() {
        Som.playNote(Songs.HighBeep);
    },
    songFinishedCallback: function() {},
    toneFinishedPlaying: function() {
        if (!Som.isPlayingSong) return;

        if (Som.currentNote >= Som.playQueue.length) {
            Som.currentNote = 0;
            Som.isPlayingSong = false;
            Som.playQueue = [];
            Som.songFinishedCallback();
            PB.enableKeyboard();
        } else {
            Som.playNote(Som.playQueue[Som.currentNote]);
            Som.currentNote++;
        }
    },
    playAndClearQueue: function() {
        Som.isPlayingSong = true;
        PB.disableKeyboard();
        Som.toneFinishedPlaying();
    },
    playSong: function(song, callback) {
        Som.songFinishedCallback = callback || function() {};
        Som.playQueue = [];
        for (var note in song) {
            Som.playQueue.push(song[note]);
        }
        Som.playAndClearQueue();
    },
    encodeBase64: function(str) {
        var out, i, len;
        var c1, c2, c3;
        const Base64EncodeChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

        len = str.length;
        i = 0;
        out = "";
        while (i < len) {
            c1 = str.charCodeAt(i++) & 0xff;
            if (i == len) {
                out += Base64EncodeChars[c1 >> 2];
                out += Base64EncodeChars[(c1 & 0x3) << 4];
                out += "==";
                break;
            }
            c2 = str.charCodeAt(i++);
            if (i == len) {
                out += Base64EncodeChars[c1 >> 2];
                out += Base64EncodeChars[((c1 & 0x3) << 4) | ((c2 & 0xF0) >> 4)];
                out += Base64EncodeChars[(c2 & 0xF) << 2];
                out += "=";
                break;
            }
            c3 = str.charCodeAt(i++);
            out += Base64EncodeChars[c1 >> 2];
            out += Base64EncodeChars[((c1 & 0x3) << 4) | ((c2 & 0xF0) >> 4)];
            out += Base64EncodeChars[((c2 & 0xF) << 2) | ((c3 & 0xC0) >> 6)];
            out += Base64EncodeChars[c3 & 0x3F];
        }
        return out;
    },
    encode8BitAudio: function(data) {
        var n = data.length;
        var integer = 0,
            i;

        // 8-bit mono WAVE header template
        var header = "RIFF<##>WAVEfmt \x10\x00\x00\x00\x01\x00\x01\x00<##><##>\x01\x00\x08\x00data<##>";

        // Helper to insert a 32-bit little endian int.
        function insertLong(value) {
            var bytes = "";
            for (var i = 0; i < 4; ++i) {
                bytes += String.fromCharCode(value & 255);
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
    newTone: function(f) {
        var audio = new Audio();
        const numberOfSamples = Math.ceil(Som.SampleRate * Som.TickInterval / 100);
        const dt = 1 / Som.SampleRate;
        var samples = new Float32Array(numberOfSamples);
        for (var i = 0; i < numberOfSamples; ++i) {
            const x = f * (i * dt);
            const y = x - Math.floor(x);
            const envelope = Math.min(1, 5 * (1 - i / numberOfSamples));
            //square wave
            samples[i] = envelope * !!(y >= 0.5);
            //sawtooth wave
            //samples.push(envelope * y);
            //sine wawe
            //samples.push(envelope * (Math.sin(2*3.1415*x)/2.0 + 0.5));
        }

        audio.setAttribute("src", Som.encode8BitAudio(samples));

        if (!pulseAudioBug) {
            audio.addEventListener("ended", function() {
                Som.toneFinishedPlaying();
            }, false);
        }

        audio.autoplay = false;
        return function() {
            audio.load();
            audio.play();
            if (pulseAudioBug) {
                window.setTimeout("Som.toneFinishedPlaying()", 300);
            }
        };
    },
    NoteToToneTable: null,
    playNote: function(n) {

        console.log("NOTE: " + n);

        //real note frequency values:
        const FreqC4 = 261.63;
        const FreqD4 = 293.66;
        const FreqE4 = 329.63;
        const FreqF4 = 349.23;
        const FreqF4Sharp = 369.994;
        const FreqG4 = 392.00;
        const FreqA4 = 440.00;
        const FreqB4 = 493.88;
        const FreqC5 = 523.25;
        const FreqC5Sharp = 554.365;
        const FreqD5 = 587.33;
        const FreqE5 = 659.255;

        if (!Som.NoteToToneTable) {
            if (PB.bugfix == false) {
                Som.NoteToToneTable = {
                    "c": Som.newTone(FreqD4),
                    "d": Som.newTone(FreqE4),
                    "e": Som.newTone(FreqF4Sharp),
                    "f": Som.newTone(FreqG4),
                    "g": Som.newTone(FreqA4),
                    "a": Som.newTone(FreqB4),
                    "b": Som.newTone(FreqC5Sharp),
                    "C": Som.newTone(FreqD5),
                    "D": Som.newTone(FreqE5),
                    "p": function() {
                        PB.delay(3, Som.toneFinishedPlaying);
                    }
                }
            } else {
                Som.NoteToToneTable = {
                    "c": Som.newTone(FreqC4),
                    "d": Som.newTone(FreqD4),
                    "e": Som.newTone(FreqE4),
                    "f": Som.newTone(FreqF4),
                    "g": Som.newTone(FreqG4),
                    "a": Som.newTone(FreqA4),
                    "b": Som.newTone(FreqB4),
                    "C": Som.newTone(FreqC5),
                    "D": Som.newTone(FreqD5),
                    "p": function() {
                        PB.delay(3, Som.toneFinishedPlaying);
                    }
                }
            }
        }
        var tone = Som.NoteToToneTable[n];
        if (tone === undefined) {
            return;
        }
        tone();
    }
};

//------------------------------------------------------------------------------
Aritmetica = {
    reset: function(possibleOperations) {
        Aritmetica.possibleOperations = possibleOperations || "+-/*";
        Aritmetica.showResultFlag = false;
        Aritmetica.showOperatorFlag = true;
        Aritmetica.numQuestions = 10;
        PB.clearDisplay();
        Som.playSong(Songs.GameSelected, Aritmetica.newGame);
    },
    newGame: function() {
        Aritmetica.points = 0;
        Aritmetica.currentQuestion = 0;
        Aritmetica.advanceQuestion();
    },
    oneLoopIteration: function() {
        if (Prompt.done) {
            Aritmetica.answerQuestion(parseInt(Prompt.getInput(), 10) == Aritmetica.answer);
        }
    },
    answerQuestion: function(correct) {
        if (correct) {
            Aritmetica.correct();
        } else {
            Aritmetica.incorrect();
        }
    },
    flashResultsAndAdvanceQuestion: function(ticks) {
        Aritmetica.showCorrectAnswer();
        PB.blinkAll();
        PB.delay(ticks || 30, function() {
            PB.clearDisplay();
            PB.delay(4, Aritmetica.advanceQuestion);
        });
    },
    incorrect: function() {
        Aritmetica.tries++;
        if (Aritmetica.tries >= 3) {
            PB.clearDisplay();
            Som.playSong(Songs.Fail, Aritmetica.flashResultsAndAdvanceQuestion);
        } else {
            PB.clearDisplay();
            Som.playSong(Songs.Wrong, function() {
                PB.delay(2, function() {
                    Aritmetica.redrawScreen();
                    if (Aritmetica.showOperatorFlag) PB.prompt(7, 3);
                });
            });
        }
    },
    correct: function() {
        PB.clearDisplay();
        Som.playSong(Songs.Correct, function() {
            Aritmetica.points += PB.pointsByNumberOfTries(Aritmetica.tries);
            Aritmetica.flashResultsAndAdvanceQuestion(10);
        });
    },
    showCorrectAnswer: function() {
        Aritmetica.redrawScreen();
        if (Aritmetica.showOperatorFlag) {
            PB.showNumberAtDigit(Aritmetica.answer, 7);
        } else {
            Aritmetica.showOperator(true);
        }
    },
    showOperator: function(force) {
        if (force || Aritmetica.showOperatorFlag) {
            PB.setSpecialDigit({
                "*": "x",
                "/": "%",
                "+": "+",
                "-": "-"
            }[Aritmetica.operation]);
        } else {
            PB.blinkSpecialDigit("#");
        }
    },
    buttonPress: function(b) {},
    buttonRelease: function(b) {},
    OperatorFunctionTable: {
        "+": function(a, b) {
            return ~~ (a + b);
        },
        "-": function(a, b) {
            return ~~ (a - b);
        },
        "/": function(a, b) {
            return ~~ (a / b);
        },
        "*": function(a, b) {
            return ~~ (a * b);
        }
    },
    redrawScreen: function() {
        PB.clearDisplay();
        PB.showNumberAtDigit(Aritmetica.firstDigit, 2);
        PB.showNumberAtDigit(Aritmetica.secondDigit, 4);
        if (Aritmetica.showResultFlag) PB.showNumberAtDigit(Aritmetica.answer, 7);
        Aritmetica.showOperator();
        PB.setSpecialDigit2("=");
    },
    advanceQuestion: function() {
        if (++Aritmetica.currentQuestion >= Aritmetica.numQuestions) {
            PB.delay(10, function() {
                PB.showNumberAtDigit(Aritmetica.points, 7);
                PB.blinkAll();
                Som.playSong(Songs.Winner, function() {
                    PB.delay(30, Aritmetica.newGame);
                });
            });
            return;
        }
        Aritmetica.tries = 0;

        var forbiddenCombination = true;
        while (forbiddenCombination) {
            Aritmetica.operation = Aritmetica.possibleOperations[~~ (Math.random() * (Aritmetica.possibleOperations.length - 1))];
            Aritmetica.firstDigit = ~~ (Math.random() * 99);
            Aritmetica.secondDigit = ~~ (Math.random() * 9);
            forbiddenCombination = ((Aritmetica.operation == "/") && (Aritmetica.secondDigit == 0)) ||
                                    ((Aritmetica.operation in ["-", "+"]) && (Aritmetica.secondDigit == 0)) ||
                                    ((Aritmetica.operation in ["/", "*"]) && (Aritmetica.secondDigit == 1));
        }

        if (Aritmetica.secondDigit) Aritmetica.firstDigit -= Aritmetica.firstDigit % Aritmetica.secondDigit;
        Aritmetica.answer = Aritmetica.OperatorFunctionTable[Aritmetica.operation](Aritmetica.firstDigit, Aritmetica.secondDigit);
        Aritmetica.redrawScreen();
        if (Aritmetica.showOperatorFlag) PB.prompt(7, 3);
    }
};

//------------------------------------------------------------------------------
Adicao = {
    reset: function() {
        Aritmetica.reset("+");
    },
    oneLoopIteration: Aritmetica.oneLoopIteration,
    buttonPress: Aritmetica.buttonPress,
    buttonRelease: Aritmetica.buttonRelease
};

//------------------------------------------------------------------------------
Subtracao = {
    reset: function() {
        Aritmetica.reset("-");
    },
    oneLoopIteration: Aritmetica.oneLoopIteration,
    buttonPress: Aritmetica.buttonPress,
    buttonRelease: Aritmetica.buttonRelease
};

//------------------------------------------------------------------------------
Multiplicacao = {
    reset: function() {
        Aritmetica.reset("*");
    },
    oneLoopIteration: Aritmetica.oneLoopIteration,
    buttonPress: Aritmetica.buttonPress,
    buttonRelease: Aritmetica.buttonRelease
};

//------------------------------------------------------------------------------
Divisao = {
    reset: function() {
        Aritmetica.reset("/");
    },
    oneLoopIteration: Aritmetica.oneLoopIteration,
    buttonPress: Aritmetica.buttonPress,
    buttonRelease: Aritmetica.buttonRelease
};

//------------------------------------------------------------------------------
Operacao = {
    reset: function() {
        Aritmetica.reset();
        Aritmetica.showOperatorFlag = false;
        Aritmetica.showResultFlag = true;
    },
    oneLoopIteration: function() {},
    buttonPress: function(b) {
        switch (b) {
        case "+":
        case "-":
        case "*":
        case "/":
            PB.setSpecialDigit({
                "+": "+",
                "-": "-",
                "*": "x",
                "/": "%"
            }[b]);
            PB.stopBlinking(8);
            PB.delay(2, function() {
                Aritmetica.answerQuestion(b == Aritmetica.operation);
            });
            break;
        default:
            Som.highBeep();
        }
    },
    buttonRelease: function() {}
};

//------------------------------------------------------------------------------
SigaMe = {
    reset: function() {
        PB.clearDisplay();
        SigaMe.guessIndex = 0;
        SigaMe.sequence = [];
        Som.playSong(Songs.GameSelected, function() {
            SigaMe.addRandomNote();
        });
    },
    addRandomNote: function() {
        SigaMe.sequence.push(Math.round(Math.random() * 9));
        SigaMe.playSequence();
    },
    oneLoopIteration: function() {},
    playSequence: function() {
        for (var i = 0; i < SigaMe.sequence.length; i++) {
            Som.playNote("cdefgabCDE" [SigaMe.sequence[i]]);
            PB.clearDisplay();
            PB.setDigit(7, SigaMe.sequence[i]);
        }
    },
    buttonPress: function(b) {
        if (b in ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"]) {
            if (SigaMe.guessIndex < SigaMe.sequence.length) {
                if (b == SigaMe.sequence[SigaMe.guessIndex]) {
                    if (SigaMe.sequence.length == 15) {
                        Som.playSong(Songs.Winner, function() {
                            SigaMe.reset();
                        });
                        return;
                    }
                    Som.playNote(b);
                    PB.setDigit(7, b);
                    SigaMe.guessIndex++;
                } else {
                    Som.playSong(Songs.Wrong, function() {
                        PB.delay(1, function() {
                            SigaMe.playSequence();
                            SigaMe.guessIndex = 0;
                        });
                    });
                }
            } else {
                SigaMe.addRandomNote();
                SigaMe.guessIndex = 0;
            }
        }
    },
    buttonRelease: function() {}
};

//------------------------------------------------------------------------------
MemoriaTons = {
    reset: function() {
        PB.clearDisplay();
        Som.playSong(Songs.GameSelected);
    },
    oneLoopIteration: function() {},
    buttonPress: function(b) {
        if (b == 'ENTER') {
            Som.playAndClearQueue();
            return;
        }
        const buttonToNoteTable = {
            "0": "p",
            "1": "c",
            "2": "d",
            "3": "e",
            "4": "f",
            "5": "g",
            "6": "a",
            "7": "b",
            "8": "C",
            "9": "D"
        };
        var note = buttonToNoteTable[b];
        if (note === undefined) {
            Som.lowBeep();
            return;
        }
        Som.playQueue.push(note);
        Som.playNote(note);
    },
    buttonRelease: function(b) {}
};

//------------------------------------------------------------------------------
AdivinheONumero = {
    middleNumber: false,
    maxTries: 10,
    reset: function(middleNumber) {
        PB.clearDisplay();
        AdivinheONumero.points = 0;
        AdivinheONumero.middleNumber = middleNumber || false;
        Som.playSong(Songs.GameSelected, AdivinheONumero.advanceQuestion);
    },
    advanceQuestion: function() {
        PB.clearDisplay();

        if (AdivinheONumero.middleNumber) {
            AdivinheONumero.firstDigit = Math.round(Math.random() * 50);
            AdivinheONumero.secondDigit = AdivinheONumero.firstDigit + Math.round(Math.random() * 47) + 2;
            AdivinheONumero.answer = Math.round((AdivinheONumero.firstDigit + AdivinheONumero.secondDigit) / 2);
        } else {
            AdivinheONumero.firstDigit = 0;
            AdivinheONumero.secondDigit = 99;
            AdivinheONumero.answer = AdivinheONumero.firstDigit + Math.round(Math.random() * (AdivinheONumero.secondDigit - AdivinheONumero.firstDigit));
        }

        AdivinheONumero.tries = 0;
        PB.showNumberAtDigit(AdivinheONumero.firstDigit, 2);
        PB.showNumberAtDigit(AdivinheONumero.secondDigit, 6);
        console.log(AdivinheONumero.firstDigit + " - " + AdivinheONumero.answer + " - " + AdivinheONumero.secondDigit);

        PB.prompt(4, 2);
    },
    showAnswer: function(s) {
        PB.clearDisplay();
        Som.playSong(s, function() {
            PB.setSpecialDigit("~");
            PB.setSpecialDigit2("-");
            PB.showNumberAtDigit(AdivinheONumero.firstDigit, 2);
            PB.showNumberAtDigit(AdivinheONumero.secondDigit, 6);
            PB.showNumberAtDigit(AdivinheONumero.answer, 4);
            PB.delay(20, function() {
                PB.clearDisplay();
                PB.delay(3, AdivinheONumero.advanceQuestion);
            });
        });
    },
    oneLoopIteration: function() {
        if (!Prompt.done) return;
        var guess = Prompt.getInput();
        if (guess != AdivinheONumero.answer) {
            if (!AdivinheONumero.middleNumber) {
                if (guess < AdivinheONumero.answer) AdivinheONumero.firstDigit = guess;
                else AdivinheONumero.secondDigit = guess;

                PB.showNumberAtDigit(AdivinheONumero.firstDigit, 2);
                PB.showNumberAtDigit(AdivinheONumero.secondDigit, 6);
                console.log(AdivinheONumero.firstDigit + " - " + AdivinheONumero.answer + " - " + AdivinheONumero.secondDigit);
            }

            AdivinheONumero.tries++;
            if (AdivinheONumero.tries < AdivinheONumero.maxTries) {
                Som.playSong(Songs.Wrong, function() {
                    PB.prompt(4, 2);
                });
                return;
            }
            AdivinheONumero.showAnswer(Songs.Fail);
        } else {
            AdivinheONumero.showAnswer(Songs.Correct);
            AdivinheONumero.points += PB.pointsByNumberOfTries(AdivinheONumero.tries);
        }
    },
    buttonPress: function() {},
    buttonRelease: function() {}
};

//------------------------------------------------------------------------------
NumeroDoMeio = {
    reset: function() {
        AdivinheONumero.maxTries = 3;
        AdivinheONumero.reset(true);
    },
    oneLoopIteration: AdivinheONumero.oneLoopIteration,
    buttonPress: AdivinheONumero.buttonPress,
    buttonRelease: AdivinheONumero.buttonRelease
};

//------------------------------------------------------------------------------
Livro = {
    StateChoosingBook: 0,
    StateQuestioning: 1,
    reset: function() {
        Som.playSong(Songs.GameSelected);
        Livro.state = Livro.StateChoosingBook;
    },
    oneLoopIteration: function() {
        switch (Livro.state) {
        case Livro.StateChoosingBook:
            if (!Prompt.done) {
                PB.clearDisplay(); //TODO: PB.blinkDisplay("      -");
                PB.prompt();
            } else {
                var book = parseInt(Prompt.getInput());
                console.log("Selected book: " + book);
                if (book > 0 && book < 999) {
                    Livro.book = book;
                    Livro.question = 0;
                    Livro.tries = 0;
                    Livro.points = 0;
                    Livro.state = Livro.StateQuestioning;

                    Livro.advanceQuestion();
                }
            }
            break;
        case Livro.StateQuestioning:
            PB.showNumberAtDigit(Livro.question, 3);
            for (var i = 4; i <= 7; i++)
            PB.blinkDigit(i, "_");
        }
    },
    showCorrectAnswer: function() {
        console.log("The correct answer was: " + Livro.getCorrectAnswer());
    },
    advanceQuestion: function() {
        if (Livro.question >= 0) {
            Livro.points += PB.pointsByNumberOfTries(Livro.tries);
        }
        Livro.tries = 0;
        Livro.question++;
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
                Som.lowBeep();
            }
            break;
        }
    },
    buttonRelease: function(b) {}
}

//------------------------------------------------------------------------------
Welcome = {
    reset: function() {
        PB.clearDisplay();
        Som.playSong(Songs.Welcome, function() {
            PB.blinkSpecialDigit("*");
        });
    },
    oneLoopIteration: function() {},
    buttonPress: function(b) {
        const newActivity = PB.buttonToTable[b];
        if (newActivity === undefined) {
            Som.lowBeep();
            return;
        }
        PB.setActivity(newActivity);
    },
    buttonRelease: function(b) {}
};

//------------------------------------------------------------------------------
Standby = {
    reset: function() {
        PB.clearDisplay();
        PB.disableKeyboard();
    },
    oneLoopIteration: function() {},
    buttonPress: function(b) {},
    buttonRelease: function(b) {}
};

//------------------------------------------------------------------------------
Prompt = {
    maxDigitSize: 3,
    initialDigit: 7,
    done: false,
    reset: function() {
        Prompt.done = false;
        Prompt.input = "   ";
        PB.clearDisplay(Prompt.initialDigit - Prompt.maxDigitSize + 1, Prompt.initialDigit);
        if (Prompt.initialDigit == 4 && Prompt.maxDigitSize == 2) {
            PB.setSpecialDigit(" ");
            PB.setSpecialDigit2(" ");
        }
        PB.blinkDigit(Prompt.initialDigit, "-");
    },
    getInput: function() {
        const value = Prompt.input;
        Prompt.reset();
        return value;
    },
    oneLoopIteration: function() {},
    redrawPrompt: function() {
        PB.showNumberAtDigit(Prompt.input, Prompt.initialDigit);
    },
    buttonPress: function(b) {
        if (b == "ENTER") {
            Prompt.done = true;
            PB.activity = PB.previousActivity;
            return;
        }
        if (b in ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"]) {
            Som.lowBeep();
            PB.disableBlink();
            if (Prompt.initialDigit == 4 && Prompt.maxDigitSize == 2) {
                PB.setSpecialDigit("~");
                PB.setSpecialDigit2("-");
            }
            switch (Prompt.maxDigitSize) {
            case 1:
                Prompt.input = b;
                break;
            case 2:
                Prompt.input = Prompt.input[1] + b;
                break;
            default:
                Prompt.input = Prompt.input[1] + Prompt.input[2] + b;
                break;
            }
            Prompt.redrawPrompt();
        } else {
            //blink and HighBeep
            Som.highBeep();
        }
    },
    buttonRelease: function(b) {}
};

//------------------------------------------------------------------------------
PB = {
    bugfix: false,
    /* we are simulating all the bugs from the original machine */
    activity: null,
    ticks: 0,
    delayTable: {},
    keyboardEnabled: true,
    displayOnPhase: true,
    init: function() {
        PB.setActivity(Standby);
        PB.reset();
        setInterval(PB.oneLoopIteration, 100);
    },
    resetDefaultVariables: function() {
        PB.delayTable = {};
        PB.enableKeyboard();
        PB.ticks = 0;
        PB.disableBlink();
    },
    reset: function() {
        PB.resetDefaultVariables();
        if (PB.activity) PB.activity.reset();
    },
    delay: function(ticks, callback) {
        PB.delayTable[PB.ticks + ticks] = callback;
    },
    oneLoopIteration: function() {
        ++PB.ticks;

        for (var delay in PB.delayTable) {
            if (PB.ticks >= delay) {
                PB.delayTable[delay]();
                delete PB.delayTable[delay];
            }
        }

        if (PB.activity) PB.activity.oneLoopIteration();
    },
    setActivity: function(m) {
        PB.activity = m;
        PB.reset();
    },
    prompt: function(initialDigit, maxDigitSize) {
        Prompt.initialDigit = initialDigit || 7;
        Prompt.maxDigitSize = maxDigitSize || 3;
        PB.previousActivity = PB.activity;
        PB.setActivity(Prompt);
    },
    getActivity: function() {
        for (var i in PB.buttonToTable) {
            if (PB.activity == PB.buttonToTable[i]) return i;
        }
        if (PB.activity == Welcome) return "Welcome";
        if (PB.activity == Standby) return "Standby";
        if (PB.activity == Prompt) return "Prompt)";

        return "Invalid Activity";
    },
    buttonPress: function(b) {
        switch (b) {
        case 'LIGA':
            PB.setActivity(Welcome);
            return;
        case 'DESL':
            PB.setActivity(Standby);
            return;
        default:
            if (PB.keyboardEnabled && PB.activity) {
                console.log("atividade atual: " + PB.getActivity() + " | botao: " + b);
                if ((PB.activity != Welcome) && (b in PB.buttonToTable)) {
                    Som.highBeep();
                    return;
                }
                console.log("repassando o buttonpress para a atividade atual");
                PB.activity.buttonPress(b);
            }
        }
    },
    enableKeyboard: function() {
        PB.keyboardEnabled = true;
    },
    disableKeyboard: function() {
        PB.keyboardEnabled = false;
    },
    buttonRelease: function(b) {
        if (b == 'LIGA' || b == 'DESL') {
            return;
        }
        if (PB.keyboardEnabled && PB.activity) {
            PB.activity.buttonRelease(b);
        }
    },
    buttonToTable: {
        "ADIVINHE-O-NÚMERO": AdivinheONumero,
        "ADIÇÃO": Adicao,
        "MULTIPLICAÇÃO": Multiplicacao,
        "DIVISÃO": Divisao,
        "ARITMÉTICA": Aritmetica,
        "OPERAÇÃO": Operacao,
        "SIGA-ME": SigaMe,
        "MEMÓRIA-TONS": MemoriaTons,
        "NÚMERO-DO-MEIO": NumeroDoMeio,
        "SUBTRAÇÃO": Subtracao,
        "LIVRO": Livro
    },
    SpecialFontTable: {
        ' ': 0,
        '#': 49279,
        '%': 49216,
        '+': 16420,
        '*': 16447,
        '-': 16384,
        'x': 27,
        '~': 128
    },
    FontTable: {
        ' ': 0,
        '*': 64,
        '-': 64,
        '0': 63,
        '1': 3,
        '2': 109,
        '3': 103,
        '4': 83,
        '5': 118,
        '6': 126,
        '7': 35,
        '8': 127,
        '9': 119,
        '_': 4
    },
    setSegmentById: function(id, state) {
        var s = document.getElementById(id);
        s.setAttribute('visibility', state ? 'hidden' : 'visible');
    },
    setSegment: function(i, seg, state) {
        PB.setSegmentById("d" + i + "_" + seg, state);
    },
    clearDisplay: function(begin, end) {
        begin = begin || 1;
        end = end || 7;
        for (var i = begin; i <= end; ++i)
            PB.setDigit(i, ' ');
        var range = end - begin;
        if (range >= 3) PB.setSpecialDigit(' ');
        if (range >= 5) PB.setSpecialDigit2(' ');
        PB.disableBlink();
    },
    blinkTable: 0,
    blinkTimer: null,
    blinkTimerCallback: function() {
        if (!PB.blinkTable) return;
        if (PB.ticks % 10 < 3) {
            if (!PB.displayOnPhase) {
                for (var d = 0; d < 7; d++)
                    if (PB.blinkTable & (1 << d))
                        PB.setDigit(d + 1, " ", true);
                if (PB.blinkTable & 1 << 7) PB.setSpecialDigit(" ", true);
                if (PB.blinkTable & 1 << 8) PB.setSpecialDigit2(" ", true);
                PB.displayOnPhase = true;
            }
        } else {
            if (PB.displayOnPhase) {
                for (var d = 0; d < 7; d++)
                    if (PB.blinkTable & (1 << d))
                        PB.setDigit(d + 1, PB.displayContents[d], true);
                if (PB.blinkTable & 1 << 7) PB.setSpecialDigit(PB.displayContents[7], true);
                if (PB.blinkTable & 1 << 8) PB.setSpecialDigit2(PB.displayContents[8], true);
                PB.displayOnPhase = false;
            }
        }
    },
    enableBlinkTimerIfNeeded: function() {
        if (!PB.blinkTable) {
            if (PB.blinkTimer)
                PB.blinkTimer = clearInterval(PB.blinkTimer);
            return;
        }
        if (!PB.blinkTimer)
            PB.blinkTimer = setInterval(PB.blinkTimerCallback, 100);
    },
    disableBlink: function() {
        PB.blinkTable = 0;
        PB.enableBlinkTimerIfNeeded();
    },
    blinkAll: function() {
        PB.blinkTable = -1;
        PB.enableBlinkTimerIfNeeded();
    },
    blinkDigit: function(which, c) {
        if (c) PB.setDigit(which, c);
        PB.blinkTable |= 1 << (which - 1);
        PB.enableBlinkTimerIfNeeded();
    },
    blinkSpecialDigit: function(c) {
        if (c) PB.setSpecialDigit(c);
        PB.blinkTable |= 1 << 7;
        PB.enableBlinkTimerIfNeeded();
    },
    blinkSpecialDigit2: function(c) {
        if (c) PB.setSpecialDigit2(c);
        PB.blinkTable |= 1 << 8;
        PB.enableBlinkTimerIfNeeded();
    },
    stopBlinking: function(which) {
        PB.blinkTable &= ~ (1 << (which - 1));
        PB.enableBlinkTimerIfNeeded();
    },
    setDisplay: function(c) {
        for (var i = 1; i <= 7; ++i) {
            PB.setDigit(i, c[i - 1]);
        }
    },
    displayContents: ["?", "?", "?", "?", "?", "?", "?", "?", "?"],
    setDigit: function(i, c, tmp) {
        if (tmp === undefined) {
            PB.displayContents[i - 1] = c;
        }
        var state = PB.FontTable[c] || PB.FontTable[' '];
        for (var segment = 0; segment < 7; segment++)
            PB.setSegment(i, "abcdefg"[segment], state & (1 << segment));
    },
    showNumberAtDigit: function(n, d) {
        if (typeof (n) == "string") {
            if (n.length == 1) {
                PB.setDigit(d, n[0]);
            } else if (n.length == 2) {
                PB.setDigit(d, n[1]);
                PB.setDigit(d - 1, n[0]);
            } else {
                PB.setDigit(d, n[2]);
                PB.setDigit(d - 1, n[1]);
                PB.setDigit(d - 2, n[0]);
            }
        } else {
            PB.setDigit(d, n % 10);
            if (n < 100) {
                if (n = ~~(n / 10) % 10)
                    PB.setDigit(d - 1, n);
            } else {
                PB.setDigit(d - 1, ~~ (n / 10) % 10);
                PB.setDigit(d - 2, ~~ (n / 100) % 10);
            }
        }
    },
    setSpecialDigit: function(c, tmp) {
        if (tmp === undefined) {
            PB.displayContents[7] = c;
        }
        if (c in PB.FontTable)
            PB.setDigit(3, c);
        var state = PB.SpecialFontTable[c] || PB.SpecialFontTable[' '];
        for (var segment = 0; segment < 8; segment++) {
            PB.setSegment(8, "abcdefgh"[segment], state & (1 << segment));
            PB.setSegment(3, "abcdefgh"[segment], (state >> 8) & (1 << segment));
        }
    },
    setSpecialDigit2: function(c, tmp) {
        if (tmp === undefined) {
            PB.displayContents[8] = c;
        }

        if (c == "=") {
            PB.setSegmentById("igual", true);
            PB.setSegmentById("igual2", true);
            return;
        }

        if (c == "-") {
            PB.setSegmentById("igual", true);
            PB.setSegmentById("igual2", false);
            return;
        }

        PB.setSegmentById("igual", false);
        PB.setSegmentById("igual2", false);
    },
    pointsByNumberOfTries: function(t) {
        switch (t) {
        case 0:
            return 10;
        case 1:
            return 6;
        case 2:
            return 4;
        }
        return 0;
    }
};

document.onkeydown = function(event) {
    const EnterKey = 13
    const PauseKey = 19
    const EscKey = 27
    const PKey = 80
    const ZeroKey = 48;
    const NineKey = 57;

    if (event.which >= ZeroKey && event.which <= NineKey) {
        PB.buttonPress(event.which - ZeroKey);
    }

    switch (event.which) {
    case EnterKey:
        PB.buttonPress("ENTER");
        break;
    case PKey:
        /* fallthrough */
    case PauseKey:
        PB.buttonPress("PAUSE");
        break;
    case EscKey:
        PB.buttonPress("DESL");
        break;
    }
}

//If we want to fix bugs found on the original machine
// then uncomment the following line:
//PB.bugfix = true;
