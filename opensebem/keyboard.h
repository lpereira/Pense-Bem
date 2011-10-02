#ifndef __keyboard_h__
#define __keyboard_h__

enum {
    A = 0,
    B,
    C,
    D,
    PowerOn,
    PowerOff,
    Book,
    Enter,
    Number0,
    Number1,
    Number2,
    Number3,
    Number4,
    Number5,
    Number6,
    Number7,
    Number8,
    Number9,
    SumQuiz,
    SubtractionQuiz,
    MultiplicationQuiz,
    DivisionQuiz,
    MathQuiz,
    ArithmeticQuiz,
    FollowMe,
    ToneMemory,
    MiddleNumber,
    GuessTheNumber
} Button;

class Keyboard {
    public:
        static void enable();
        static void disable();
};

#endif /* __keyboard_h__ */