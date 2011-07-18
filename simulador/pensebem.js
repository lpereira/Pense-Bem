pulseAudioBug = navigator.userAgent.indexOf('Linux') > 0;

if (typeof Float32Array !== "function")
    Float32Array = Array;

Songs = {
    Welcome: 'egage',
    GameSelected: 'CgC',
    Correct: 'gCC',
    Wrong: 'ec',
    Fail: 'egec',
    Winner: 'gggeCCC',
    HighBeep: 'C',
    LowBeep: 'c'
};

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
            if (Som.shouldClearQueue)
                Som.playQueue = [];
            Som.songFinishedCallback();
            Som.songFinishedCallback = function() {};
            PB.enableKeyboard();
        } else {
            Som.playNote(Som.playQueue[Som.currentNote]);
            Som.notePlayCallback(Som.playQueue[Som.currentNote], Som.currentNote >= Som.playQueue.length - 1);
            Som.currentNote++;
        }
    },
    playSoundQueue: function(shouldClearQueue, notePlayCallback) {
        Som.isPlayingSong = true;
        Som.shouldClearQueue = shouldClearQueue || false;
        Som.notePlayCallback = notePlayCallback || function() {};
        PB.disableKeyboard();
        Som.toneFinishedPlaying();
    },
    playSong: function(song, callback) {
        Som.songFinishedCallback = callback || function() {};
        Som.playQueue = song;
        Som.playSoundQueue(true);
    },
    encodeBase64: function(str) {
        var out, i, len;
        var c1, c2, c3;
        const Base64EncodeChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

        len = str.length;
        i = 0;
        out = '';
        while (i < len) {
            c1 = str.charCodeAt(i++) & 0xff;
            if (i == len) {
                out += Base64EncodeChars[c1 >> 2];
                out += Base64EncodeChars[(c1 & 0x3) << 4];
                out += '==';
                break;
            }
            c2 = str.charCodeAt(i++);
            if (i == len) {
                out += Base64EncodeChars[c1 >> 2];
                out += Base64EncodeChars[((c1 & 0x3) << 4) | ((c2 & 0xF0) >> 4)];
                out += Base64EncodeChars[(c2 & 0xF) << 2];
                out += '=';
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

        // 8-bit mono WAVE header template
        var header = 'RIFF<##>WAVEfmt \x10\x00\x00\x00\x01\x00\x01\x00<##><##>\x01\x00\x08\x00data<##>';

        // Helper to insert a 32-bit little endian int.
        function insertLong(value) {
            var bytes = '';
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

        audio.setAttribute('src', Som.encode8BitAudio(samples));

        if (!pulseAudioBug) {
            audio.addEventListener('ended', function() {
                Som.toneFinishedPlaying();
            }, false);
        }

        audio.autoplay = false;
        return function() {
            audio.load();
            audio.play();
            if (pulseAudioBug) {
                window.setTimeout(Som.toneFinishedPlaying, 300);
            }
        };
    },
    NoteToToneTable: null,
    playNote: function(n) {
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
            if (!PB.bugfix) {
                Som.NoteToToneTable = {
                    'c': Som.newTone(FreqD4),
                    'd': Som.newTone(FreqE4),
                    'e': Som.newTone(FreqF4Sharp),
                    'f': Som.newTone(FreqG4),
                    'g': Som.newTone(FreqA4),
                    'a': Som.newTone(FreqB4),
                    'b': Som.newTone(FreqC5Sharp),
                    'C': Som.newTone(FreqD5),
                    'D': Som.newTone(FreqE5),
                    'p': function() {
                        PB.delay(3, Som.toneFinishedPlaying);
                    }
                };
            } else {
                Som.NoteToToneTable = {
                    'c': Som.newTone(FreqC4),
                    'd': Som.newTone(FreqD4),
                    'e': Som.newTone(FreqE4),
                    'f': Som.newTone(FreqF4),
                    'g': Som.newTone(FreqG4),
                    'a': Som.newTone(FreqA4),
                    'b': Som.newTone(FreqB4),
                    'C': Som.newTone(FreqC5),
                    'D': Som.newTone(FreqD5),
                    'p': function() {
                        PB.delay(3, Som.toneFinishedPlaying);
                    }
                };
            }
        }
        var tone = Som.NoteToToneTable[n];
        if (tone)
            tone();
    }
};

//------------------------------------------------------------------------------
Aritmetica = {
    reset: function(possibleOperations) {
        Aritmetica.possibleOperations = possibleOperations || '+-/*';
        Aritmetica.showResultFlag = false;
        Aritmetica.showOperatorFlag = true;
        Aritmetica.numQuestions = 10;
        Display.clear();
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
        Display.blinkAll();
        PB.delay(ticks || 30, function() {
            Display.clear();
            PB.delay(4, Aritmetica.advanceQuestion);
        });
    },
    incorrect: function() {
        Aritmetica.tries++;
        if (Aritmetica.tries >= 3) {
            Display.clear();
            Som.playSong(Songs.Fail, Aritmetica.flashResultsAndAdvanceQuestion);
        } else {
            Display.clear();
            Som.playSong(Songs.Wrong, function() {
                PB.delay(2, function() {
                    Aritmetica.redrawScreen();
                    if (Aritmetica.showOperatorFlag) PB.prompt(7, 3);
                });
            });
        }
    },
    correct: function() {
        Display.clear();
        Som.playSong(Songs.Correct, function() {
            Aritmetica.points += PB.pointsByNumberOfTries(Aritmetica.tries);
            Aritmetica.flashResultsAndAdvanceQuestion(10);
        });
    },
    showCorrectAnswer: function() {
        Aritmetica.redrawScreen();
        if (Aritmetica.showOperatorFlag) {
            Display.showNumberAtDigit(Aritmetica.answer, 7);
        } else {
            Aritmetica.showOperator(true);
        }
    },
    showOperator: function(force) {
        if (force || Aritmetica.showOperatorFlag) {
            Display.setSpecialDigit({
                '*': 'x',
                '/': '%',
                '+': '+',
                '-': '-'
            }[Aritmetica.operation]);
        } else {
            Display.blinkSpecialDigit('#');
        }
    },
    buttonPress: function(b) {},
    OperatorFunctionTable: {
        '+': function(a, b) {
            return ~~ (a + b);
        },
        '-': function(a, b) {
            return ~~ (a - b);
        },
        '/': function(a, b) {
            return ~~ (a / b);
        },
        '*': function(a, b) {
            return ~~ (a * b);
        }
    },
    redrawScreen: function() {
        Display.clear();
        Display.showNumberAtDigit(Aritmetica.firstDigit, 2);
        Display.showNumberAtDigit(Aritmetica.secondDigit, 4);
        if (Aritmetica.showResultFlag) Display.showNumberAtDigit(Aritmetica.answer, 7);
        Aritmetica.showOperator();
        Display.setSpecialDigit2('=');
    },
    advanceQuestion: function() {
        function isDivisionByZero() {
            return Aritmetica.operation == '/' && Aritmetica.secondDigit == 0;
        }
        function isSumOrSubtractionWithZero() {
            return (Aritmetica.operation == '+' || Aritmetica.operation == '-') && Aritmetica.secondDigit == 0;
        }
        function isDivisionOrMultiplication() {
            return Aritmetica.operation == '*' || Aritmetica.operation == '/';
        }
        function isDivisionOrMultiplicationWithOne() {
            return isDivisionOrMultiplication() && Aritmetica.secondDigit == 1;
        }
        function isZeroDividedOrMultipliedBySomething() {
            return isDivisionOrMultiplication() && Aritmetica.firstDigit == 0;
        }
        function isDivisionOrSubtractionAndResultIsLessThanOne() {
            return (Aritmetica.operation == '/' || Aritmetica.operation == '-') && Aritmetica.firstDigit < Aritmetica.secondDigit;
        }
        function isForbiddenCombination() {
            return isDivisionByZero() ||
                   isSumOrSubtractionWithZero() ||
                   isDivisionOrMultiplicationWithOne() ||
                   isDivisionOrSubtractionAndResultIsLessThanOne() ||
                   (Aritmetica.showResultFlag && isZeroDividedOrMultipliedBySomething());
        }

        if (Aritmetica.currentQuestion++ >= Aritmetica.numQuestions) {
            PB.delay(10, function() {
                Display.showNumberAtDigit(Aritmetica.points, 7);
                Display.blinkAll();
                Som.playSong(Songs.Winner, function() {
                    PB.delay(30, Aritmetica.newGame);
                });
            });
            return;
        }
        Aritmetica.tries = 0;

        do {
            Aritmetica.operation = Aritmetica.possibleOperations[~~ (Math.random() * (Aritmetica.possibleOperations.length - 1))];
            Aritmetica.firstDigit = ~~ (Math.random() * 99);
            Aritmetica.secondDigit = ~~ (Math.random() * 9);
        } while (isForbiddenCombination());

        if (Aritmetica.secondDigit && isDivisionOrMultiplication())
            Aritmetica.firstDigit -= Aritmetica.firstDigit % Aritmetica.secondDigit;
        Aritmetica.answer = Aritmetica.OperatorFunctionTable[Aritmetica.operation](Aritmetica.firstDigit, Aritmetica.secondDigit);
        Aritmetica.redrawScreen();
        if (Aritmetica.showOperatorFlag)
            PB.prompt(7, 3);
    }
};

//------------------------------------------------------------------------------
Adicao = {
    reset: function() {
        Aritmetica.reset('+');
    },
    oneLoopIteration: Aritmetica.oneLoopIteration,
    buttonPress: Aritmetica.buttonPress
};

//------------------------------------------------------------------------------
Subtracao = {
    reset: function() {
        Aritmetica.reset('-');
    },
    oneLoopIteration: Aritmetica.oneLoopIteration,
    buttonPress: Aritmetica.buttonPress
};

//------------------------------------------------------------------------------
Multiplicacao = {
    reset: function() {
        Aritmetica.reset('*');
    },
    oneLoopIteration: Aritmetica.oneLoopIteration,
    buttonPress: Aritmetica.buttonPress
};

//------------------------------------------------------------------------------
Divisao = {
    reset: function() {
        Aritmetica.reset('/');
    },
    oneLoopIteration: Aritmetica.oneLoopIteration,
    buttonPress: Aritmetica.buttonPress
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
        case '+':
        case '-':
        case '*':
        case '/':
            Display.setSpecialDigit({
                '+': '+',
                '-': '-',
                '*': 'x',
                '/': '%'
            }[b]);
            Display.stopBlinking(8);
            PB.delay(2, function() {
                Aritmetica.answerQuestion(b == Aritmetica.operation);
            });
            break;
        default:
            Som.highBeep();
        }
    }
};

//------------------------------------------------------------------------------
SigaMe = {
    reset: function() {
        Display.clear();
        SigaMe.guessIndex = 0;
        SigaMe.sequence = [];
        Som.playSong(Songs.GameSelected, function() {
            PB.delay(5, SigaMe.addRandomNote);
        });
    },
    addRandomNote: function() {
        SigaMe.sequence.push(~~(Math.random() * 9));
        SigaMe.playSequence();
    },
    oneLoopIteration: function() {},
    playSequence: function() {
        var sequenceIndex = 0;
        function noteFinishedPlaying() {
            if (++sequenceIndex >= SigaMe.sequence.length)
                return;
            Display.clear();
            PB.delay(2, function() {
                Display.setDigit(7, SigaMe.sequence[sequenceIndex]);
                Som.playSong('cdefgabCDE'[SigaMe.sequence[sequenceIndex]], noteFinishedPlaying);
            });
        }
        Display.clear();
        Display.setDigit(7, SigaMe.sequence[0]);
        Som.playSong('cdefgabCDE'[SigaMe.sequence[0]], noteFinishedPlaying);
    },
    buttonPress: function(b) {
        if (b in ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9']) {
            if (b == SigaMe.sequence[SigaMe.guessIndex]) {
                Display.clear();
                PB.disableKeyboard();
                PB.delay(2, function() {
                    Som.playNote('cdefgabCDE'[b]);
                    Display.setDigit(7, b);
                    PB.delay(4, function() {
                        if (SigaMe.sequence.length == 1) {
                            SigaMe.addRandomNote();
                        } else if (SigaMe.sequence.length == 15) {
                            Som.playSong(Songs.Winner, SigaMe.reset);
                        } else if (SigaMe.guessIndex < SigaMe.sequence.length - 1) {
                            SigaMe.guessIndex++;
                        } else {
                            SigaMe.guessIndex = 0;
                            SigaMe.addRandomNote();
                        }
                        PB.enableKeyboard();
                    });
                });
            } else {
                Som.playSong(Songs.Wrong, function() {
                    PB.delay(10, function() {
                        SigaMe.playSequence();
                        SigaMe.guessIndex = 0;
                    });
                });
            }
        }
    }
};

//------------------------------------------------------------------------------
MemoriaTons = {
    reset: function() {
        Display.clear();
        Som.playSong(Songs.GameSelected, function() {
            MemoriaTons.pressedEnter = false;
            MemoriaTons.fakePrompt();
        });
    },
    fakePrompt: function() {
        Display.blinkDigit(7, '-');
    },
    oneLoopIteration: function() {},
    buttonPress: function(b) {
        if (b == 'ENTER') {
            MemoriaTons.pressedEnter = true;
            Som.playSoundQueue(false, function(noteCode, lastNote) {
                Display.showNumberAtDigit({
                    'p': 0, 'c': 1, 'd': 2,
                    'e': 3, 'f': 4, 'g': 5,
                    'a': 6, 'b': 7, 'C': 8,
                    'D': 9
                }[noteCode], 7);
                PB.delay(2, lastNote ? MemoriaTons.fakePrompt : Display.clear);
            });
            return;
        }
        var note = {
            '0': 'p', '1': 'c', '2': 'd',
            '3': 'e', '4': 'f', '5': 'g',
            '6': 'a', '7': 'b', '8': 'C',
            '9': 'D'
        }[b];
        if (note) {
            Display.clear();
            if (MemoriaTons.pressedEnter) {
                MemoriaTons.pressedEnter = false;
                Som.playQueue = [];
            }
            Som.playQueue.push(note);
            Som.playNote(note);
            Display.showNumberAtDigit(b, 7);
        } else
            Som.lowBeep();
    }
};

//------------------------------------------------------------------------------
AdivinheONumero = {
    isMiddleNumber: false,
    maxTries: 10,
    reset: function(isMiddleNumber) {
        Display.clear();
        AdivinheONumero.points = 0;
        AdivinheONumero.isMiddleNumber = isMiddleNumber || false;
        AdivinheONumero.maxTries = isMiddleNumber ? 3 : 10;
        Som.playSong(Songs.GameSelected, AdivinheONumero.advanceQuestion);
    },
    advanceQuestion: function() {
        Display.clear();

        if (AdivinheONumero.isMiddleNumber) {
            AdivinheONumero.firstDigit = Math.round(Math.random() * 50);
            AdivinheONumero.secondDigit = AdivinheONumero.firstDigit + Math.round(Math.random() * 47) + 2;
            AdivinheONumero.answer = Math.round((AdivinheONumero.firstDigit + AdivinheONumero.secondDigit) / 2);
        } else {
            AdivinheONumero.firstDigit = 0;
            AdivinheONumero.secondDigit = 99;
            AdivinheONumero.answer = AdivinheONumero.firstDigit + Math.round(Math.random() * (AdivinheONumero.secondDigit - AdivinheONumero.firstDigit));
        }

        AdivinheONumero.tries = 0;
        Display.showNumberAtDigit(AdivinheONumero.firstDigit, 2);
        Display.showNumberAtDigit(AdivinheONumero.secondDigit, 6);
        PB.prompt(4, 2, '*');
    },
    showAnswer: function(s) {
        Display.clear();
        Som.playSong(s, function() {
            Display.setSpecialDigit('~');
            Display.setSpecialDigit2('-');
            Display.showNumberAtDigit(AdivinheONumero.firstDigit, 2);
            Display.showNumberAtDigit(AdivinheONumero.secondDigit, 6);
            Display.showNumberAtDigit(AdivinheONumero.answer, 4);
            PB.delay(20, function() {
                Display.clear();
                PB.delay(3, AdivinheONumero.advanceQuestion);
            });
        });
    },
    oneLoopIteration: function() {
        if (!Prompt.done) return;
        var guess = Prompt.getInput();
        if (guess != AdivinheONumero.answer) {
            if (!AdivinheONumero.isMiddleNumber) {
                if (guess < AdivinheONumero.answer) AdivinheONumero.firstDigit = guess;
                else AdivinheONumero.secondDigit = guess;

                Display.showNumberAtDigit(AdivinheONumero.firstDigit, 2);
                Display.showNumberAtDigit(AdivinheONumero.secondDigit, 6);
            }

            AdivinheONumero.tries++;
            if (AdivinheONumero.tries < AdivinheONumero.maxTries) {
                Som.playSong(Songs.Wrong, function() {
                    PB.prompt(4, 2, '*');
                });
                return;
            }
            AdivinheONumero.showAnswer(Songs.Fail);
        } else {
            AdivinheONumero.showAnswer(Songs.Correct);
            AdivinheONumero.points += PB.pointsByNumberOfTries(AdivinheONumero.tries);
        }
    },
    buttonPress: function() {}
};

//------------------------------------------------------------------------------
NumeroDoMeio = {
    reset: function() {
        AdivinheONumero.maxTries = 3;
        AdivinheONumero.reset(true);
    },
    oneLoopIteration: AdivinheONumero.oneLoopIteration,
    buttonPress: AdivinheONumero.buttonPress
};

//------------------------------------------------------------------------------
Livro = {
    StateChoosingBook: 0,
    StateQuestioning: 1,
    reset: function() {
        Som.playSong(Songs.GameSelected, function() {
            Livro.state = Livro.StateChoosingBook;
            PB.prompt();
        });
    },
    oneLoopIteration: function() {
        switch (Livro.state) {
        case Livro.StateChoosingBook:
            if (!Prompt.done) return;
            const bookCode = Prompt.getInput();
            const bookNumber = parseInt(bookCode.substring(0, 2));
            const sectionNumber = parseInt(bookCode.substring(2));

            if (sectionNumber < 1 || sectionNumber > 6 || bookCode < 1) {
                Display.clear();
                Som.playSong(Songs.Wrong, PB.prompt);
                return;
            }

            Livro.bookNumber = bookNumber;
            Livro.sectionNumber = sectionNumber;
            Livro.isReviewMode = sectionNumber == 6;
            if (!Livro.isReviewMode) {
                Livro.maxQuestion = sectionNumber * 30;
                Livro.currentQuestion = Livro.maxQuestion - 30;
            } else {
                Livro.maxQuestion = 150;
                Livro.chooseRandomQuestion();
            }
            Livro.answeredQuestions = 0;
            Livro.points = 0;

            Livro.state = Livro.StateQuestioning;

            Display.clear();
            Som.playSong(Songs.Correct, Livro.advanceQuestion);
            break;
        case Livro.StateQuestioning:
        }
    },
    chooseRandomQuestion: function() {
        Livro.currentQuestion = ~~(Math.random() * (Livro.maxQuestion - 1)) + 1;
    },
    highlightAnswer: function(answer, blink) {
        Display.clear();
        Display.showNumberAtDigit(Livro.currentQuestion, 3);
        const digit = {'A': 4, 'B': 5, 'C': 6, 'D': 7}[answer];
        if (blink)
            Display.blinkDigit(digit, '_');
        else
            Display.setDigit(digit, '_');
    },
    showCorrectAnswer: function(blink) {
        Livro.highlightAnswer(Livro.getCorrectAnswer(), blink);
    },
    displayQuestionPrompt: function() {
        Display.clear();
        PB.delay(3, function() {
            Display.showNumberAtDigit(Livro.currentQuestion, 3);
            for (var i = 4; i <= 7; i++)
                Display.setDigit(i, '_');
        });
        PB.enableKeyboard();
    },
    advanceQuestion: function() {
        if (Livro.question >= 0) {
            Livro.points += PB.pointsByNumberOfTries(Livro.tries);
        }
        Livro.tries = 0;
        if (Livro.isReviewMode) {
            Livro.chooseRandomQuestion();
        } else {
            ++Livro.currentQuestion;
        }

        if (Livro.answeredQuestions >= 30) {
            Display.clear();
            Display.showNumberAtDigit(Livro.points, 7);
            Display.blinkAll();
            PB.disableKeyboard();
            Som.playSong(Songs.Winner, function() {
                PB.delay(30, function() {
                    Livro.state = Livro.StateChoosingBook;
                    PB.enableKeyboard();
                    PB.prompt();
                });
            });
            return;
        }
        Livro.displayQuestionPrompt();
    },
    getCorrectAnswer: function() {
        return 'CDDBAADCBDAADCBB'[(Livro.bookNumber + Livro.currentQuestion) & 15];
    },
    buttonPress: function(b) {
        switch (Livro.state) {
        case Livro.StateChoosingBook:
            break;
        case Livro.StateQuestioning:
            switch (b) {
            case 'A':
            case 'B':
            case 'C':
            case 'D':
                PB.disableKeyboard();

                if (Livro.getCorrectAnswer(b) == b) {
                    ++Livro.answeredQuestions;
                    Livro.showCorrectAnswer(true);
                    Som.playSong(Songs.Correct, function() {
                        PB.delay(10, Livro.advanceQuestion);
                    });
                    return;
                }
                ++Livro.tries;
                if (Livro.tries >= 3) {
                    ++Livro.answeredQuestions;
                    Livro.showCorrectAnswer(true);
                    Som.playSong(Songs.Fail, function() {
                        PB.delay(20, Livro.advanceQuestion);
                    });
                } else {
                    Display.clear();
                    PB.delay(3, function() {
                        Livro.highlightAnswer(b, false);
                        Som.playSong(Songs.Wrong, function() {
                            PB.delay(10, Livro.displayQuestionPrompt);
                        });
                    });
                }
                break;
            default:
                Som.lowBeep();
            }
            break;
        }
    }
};

//------------------------------------------------------------------------------
Welcome = {
    ButtonToActivityTable: {
        'ADIVINHE-O-NÚMERO': AdivinheONumero,
        'ADIÇÃO': Adicao,
        'MULTIPLICAÇÃO': Multiplicacao,
        'DIVISÃO': Divisao,
        'ARITMÉTICA': Aritmetica,
        'OPERAÇÃO': Operacao,
        'SIGA-ME': SigaMe,
        'MEMÓRIA-TONS': MemoriaTons,
        'NÚMERO-DO-MEIO': NumeroDoMeio,
        'SUBTRAÇÃO': Subtracao,
        'LIVRO': Livro
    },
    reset: function() {
        Display.clear();
        Som.playSong(Songs.Welcome, function() {
            Display.blinkSpecialDigit('*');
        });
    },
    oneLoopIteration: function() {},
    buttonPress: function(b) {
        const newActivity = Welcome.ButtonToActivityTable[b];
        if (newActivity)
            PB.setActivity(newActivity);
        else
            Som.lowBeep();
    }
};

//------------------------------------------------------------------------------
Standby = {
    reset: function() {
        Display.clear();
        PB.disableKeyboard();
    },
    oneLoopIteration: function() {},
    buttonPress: function(b) {}
};

//------------------------------------------------------------------------------
Prompt = {
    maxDigitSize: 3,
    initialDigit: 7,
    done: false,
    promptCharacter: '-',
    reset: function() {
        Prompt.done = false;
        Prompt.input = '   ';
        Display.clear(Prompt.initialDigit - Prompt.maxDigitSize + 1, Prompt.initialDigit);
        if (Prompt.initialDigit == 4 && Prompt.maxDigitSize == 2) {
            Display.setSpecialDigit(' ');
            Display.setSpecialDigit2(' ');
            Display.blinkSpecialDigit(Prompt.promptCharacter);
        } else
            Display.blinkDigit(Prompt.initialDigit, Prompt.promptCharacter);
    },
    getInput: function() {
        const value = Prompt.input;
        Prompt.reset();
        return value;
    },
    isEmpty: function() {
        return Prompt.input == '   ';
    },
    oneLoopIteration: function() {},
    redrawPrompt: function() {
        Display.showNumberAtDigit(Prompt.input, Prompt.initialDigit);
    },
    buttonPress: function(b) {
        if (b == 'ENTER') {
            if (Prompt.isEmpty()) {
                Som.highBeep();
                return;
            }
            Prompt.done = true;
            PB.activity = PB.previousActivity;
            return;
        }
        if (b in ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9']) {
            Som.lowBeep();
            Display.disableBlink();
            if (Prompt.initialDigit == 4 && Prompt.maxDigitSize == 2) {
                Display.setSpecialDigit('~');
                Display.setSpecialDigit2('-');
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
    }
};

//------------------------------------------------------------------------------
Display = {
    onPhase: true,
    blinkTable: 0,
    blinkTimer: null,
    contents: ['?', '?', '?', '?', '?', '?', '?', '?', '?'],
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
        Display.setSegmentById('d' + i + '_' + seg, state);
    },
    clear: function(begin, end) {
        begin = begin || 1;
        end = end || 7;
        for (var i = begin; i <= end; ++i)
            Display.setDigit(i, ' ');
        const range = end - begin;
        if (range >= 3) Display.setSpecialDigit(' ');
        if (range >= 5) Display.setSpecialDigit2(' ');
        Display.disableBlink();
    },
    restoreFromStoredContents: function() {
        if (!Display.onPhase) return;
        for (var d = 0; d < 7; d++)
            if (Display.blinkTable & (1 << d))
                Display.setDigit(d + 1, Display.contents[d], true);
        if (Display.blinkTable & 1 << 7) Display.setSpecialDigit(Display.contents[7], true);
        if (Display.blinkTable & 1 << 8) Display.setSpecialDigit2(Display.contents[8], true);
        Display.onPhase = false;
    },
    hideBlinkingSegments: function() {
        if (Display.onPhase) return;
        for (var d = 0; d < 7; d++)
            if (Display.blinkTable & (1 << d))
                Display.setDigit(d + 1, ' ', true);
        if (Display.blinkTable & 1 << 7) Display.setSpecialDigit(' ', true);
        if (Display.blinkTable & 1 << 8) Display.setSpecialDigit2(' ', true);
        Display.onPhase = true;
    },
    blinkTimerCallback: function() {
        if (PB.ticks % 10 < 3) {
            Display.hideBlinkingSegments();
        } else {
            Display.restoreFromStoredContents();
        }
    },
    enableBlinkTimerIfNeeded: function() {
        if (!Display.blinkTable) {
            if (Display.blinkTimer) {
                Display.blinkTimer = clearInterval(Display.blinkTimer);
                Display.restoreFromStoredContents();
            }
        } else if (!Display.blinkTimer)
            Display.blinkTimer = setInterval(Display.blinkTimerCallback, 100);
    },
    disableBlink: function() {
        Display.blinkTable = 0;
        Display.enableBlinkTimerIfNeeded();
    },
    blinkAll: function() {
        Display.blinkTable = -1;
        Display.enableBlinkTimerIfNeeded();
    },
    blinkDigit: function(which, c) {
        if (c) Display.setDigit(which, c);
        Display.blinkTable |= 1 << (which - 1);
        Display.enableBlinkTimerIfNeeded();
    },
    blinkSpecialDigit: function(c) {
        if (c) Display.setSpecialDigit(c);
        Display.blinkTable |= 1 << 7;
        Display.enableBlinkTimerIfNeeded();
    },
    blinkSpecialDigit2: function(c) {
        if (c) Display.setSpecialDigit2(c);
        Display.blinkTable |= 1 << 8;
        Display.enableBlinkTimerIfNeeded();
    },
    stopBlinking: function(which) {
        Display.blinkTable &= ~ (1 << (which - 1));
        Display.enableBlinkTimerIfNeeded();
    },
    setDisplay: function(c) {
        for (var i = 1; i <= 7; ++i) {
            Display.setDigit(i, c[i - 1]);
        }
    },
    setDigit: function(i, c, tmp) {
        if (tmp === undefined) {
            Display.contents[i - 1] = c;
        }
        var state = Display.FontTable[c] || Display.FontTable[' '];
        for (var segment = 0; segment < 7; segment++)
            Display.setSegment(i, 'abcdefg'[segment], state & (1 << segment));
    },
    showNumberAtDigit: function(n, d) {
        if (typeof (n) == 'string') {
            if (n.length == 1) {
                Display.setDigit(d, n[0]);
            } else if (n.length == 2) {
                Display.setDigit(d, n[1]);
                Display.setDigit(d - 1, n[0]);
            } else {
                Display.setDigit(d, n[2]);
                Display.setDigit(d - 1, n[1]);
                Display.setDigit(d - 2, n[0]);
            }
        } else {
            Display.setDigit(d, n % 10);
            if (n < 100) {
                if (n = ~~(n / 10) % 10)
                    Display.setDigit(d - 1, n);
            } else {
                Display.setDigit(d - 1, ~~ (n / 10) % 10);
                Display.setDigit(d - 2, ~~ (n / 100) % 10);
            }
        }
    },
    setSpecialDigit: function(c, tmp) {
        if (tmp === undefined) {
            Display.contents[7] = c;
        }
        if (c in Display.FontTable)
            Display.setDigit(3, c);
        var state = Display.SpecialFontTable[c] || Display.SpecialFontTable[' '];
        for (var segment = 0; segment < 8; segment++) {
            Display.setSegment(8, 'abcdefgh'[segment], state & (1 << segment));
            Display.setSegment(3, 'abcdefgh'[segment], (state >> 8) & (1 << segment));
        }
    },
    setSpecialDigit2: function(c, tmp) {
        if (tmp === undefined) {
            Display.contents[8] = c;
        }

        Display.setSegmentById('igual', {'=': true, '-': true}[c] || false);
        Display.setSegmentById('igual2', {'=': true, '-': false}[c] || false);
    }
};

//------------------------------------------------------------------------------
PB = {
    bugfix: false,
    /* we are simulating all the bugs from the original machine */
    activity: null,
    ticks: 0,
    delayTable: {},
    keyboardEnabled: true,
    init: function() {
        PB.setActivity(Standby);
        PB.reset();
        setInterval(PB.oneLoopIteration, 100);
        PB.turnOnReminderTimer = setTimeout(PB.showReminder, 3000);
    },
    showReminder: function() {
        document.getElementById('ligue-me-tip').setAttribute('display', 'true');
        PB.turnOnReminderTimer = clearTimeout(PB.turnOnReminderTimer);
    },
    resetDefaultVariables: function() {
        PB.delayTable = {};
        PB.enableKeyboard();
        PB.ticks = 0;
        Display.disableBlink();
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
    setActivity: function(m, keepScreenContents) {
        if (PB.turnOnReminderTimer)
            PB.turnOnReminderTimer = clearTimeout(PB.turnOnReminderTimer);
        document.getElementById('ligue-me-tip').setAttribute('display', 'none');
        if (!keepScreenContents)
            Display.clear();
        PB.resetDefaultVariables();
        PB.activity = m;
        PB.reset();
    },
    prompt: function(initialDigit, maxDigitSize, promptCharacter) {
        Prompt.initialDigit = initialDigit || 7;
        Prompt.maxDigitSize = maxDigitSize || 3;
        Prompt.promptCharacter = promptCharacter || '-';
        PB.previousActivity = PB.activity;
        PB.setActivity(Prompt, true);
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
                if ((PB.activity != Welcome) && (b in Welcome.ButtonToActivityTable)) {
                    Som.highBeep();
                    return;
                }
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
    const keyCode = {
        13: 'ENTER',
        19: 'PAUSE',
        80: 'PAUSE',
        27: 'DESL',
        48: '0',
        49: '1',
        50: '2',
        51: '3',
        52: '4',
        53: '5',
        54: '6',
        55: '7',
        56: '8',
        57: '9'
    }[event.which];
    if (keyCode) PB.buttonPress(keyCode);
};

//If we want to fix bugs found on the original machine
// then uncomment the following line:
//PB.bugfix = true;
window['PB_buttonPress'] = PB.buttonPress;
window['PB_init'] = PB.init;
