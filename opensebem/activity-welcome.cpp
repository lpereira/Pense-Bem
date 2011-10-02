#include "activity-welcome.h"

AWelcome::AWelcome()
{
    Display::clear();
    Sound::playSong(SongWelcome);
    Display::blinkSpecialDigit('*');
}

void AWelcome::oneLoopIteration()
{
}

void AWelcome::buttonPress(Button button)
{
    switch (button) {
    case SumQuiz:
        OpenSebem::switchToActivity(new ASumQuiz);
        break;
    case SubtractionQuiz:
        OpenSebem::switchToActivity(new ASubtractionQuiz);
        break;
    case MultiplicationQuiz:
        OpenSebem::switchToActivity(new AMultiplicationQuiz);
        break;
    case DivisionQuiz:
        OpenSebem::switchToActivity(new ADivisionQuiz);
        break;
    case MathQuiz:
        OpenSebem::switchToActivity(new AMathQuiz);
        break;
    case ArithmeticQuiz:
        OpenSebem::switchToActivity(new AArithmeticQuiz);
        break;
    case FollowMe:
        OpenSebem::switchToActivity(new AFollowMe);
        break;
    case ToneMemory:
        OpenSebem::switchToActivity(new AToneMemory);
        break;
    case MiddleNumber:
        OpenSebem::switchToActivity(new AMiddleNumber);
        break;
    case GuessTheNumber:
        OpenSebem::switchToActivity(new AGuessTheNumber);
        break;
    case Book:
        OpenSebem::switchToActivity(new ABook);
        break;
    default:
        Sound::lowBeep();
    }
}