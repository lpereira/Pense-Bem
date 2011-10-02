

ABook::ABook()
{
    Sound::play(SongGameSelected);
    m_state = ChoosingBook;
    OpenSebem::prompt();
}

void ABook::oneLoopIteration()
{
    switch (m_state) {
    case ChoosingBook:
        APrompt *prompt = static_cast<APrompt*>(OpenSebem::activity());
        if (!prompt->done())
            return;
        char *bookCode = prompt->getInput();
        int bookNumber = (bookCode[0] - '0') * 10 + bookCode[1] - '0';
        int sectionNumber = bookCode[2] - '0';
        
        if (sectionNumber < 1 || sectionNumber > 6 || bookCode < 1) {
            Display::clear();
            Sound::play(SongWrong);
            return;
        }
        
        m_bookNumber = bookNumber;
        m_sectionNumber = sectionNumber;
        m_isReviewMode = sectionNumber == 6;
        if (!m_isReviewMode) {
            m_maxQuestion = m_sectionNumber * 30;
            m_currentQuestion = m_maxQuestion - 30;
        } else {
            m_maxQuestion = 150;
            chooseRandomQuestion();
        }
        
        m_answeredQuestions = 0;
        OpenSebem::setPoints(0);
        
        m_state = Questioning;
        
        Display::clear();
        Sound::play(SongCorrect);
        advanceQuestion();
        break;
    case Questioning:
        /* Do nothing here */
    }
}

void ABook::chooseRandomQuestion()
{
    m_currentQuestion = rand() % (m_maxQuestion - 1) + 1;
}

void ABook::highlightAnswer(int answer, bool blink)
{
    Display::clear();
    Display::showNumberAtDigit(m_currentQuestion, 3);
    if (blink)
        Display::blinkDigit(answer + 4, '_');
    else
        Display::setDigit(answer + 4, '_');
}

void ABook::showCorrectAnswer(bool blink)
{
    highlightAnswer(getCorrectAnswer(), blink);
}

void ABook::displayQuestionPrompt()
{
    Display::clear();
    delay(300);
    Display::showNumberAtDigit(m_currentQuestion, 3);
    for (int i = 0; i < 4; i++)
        Display::setDigit(i, '_');
    Keyboard::enable();
}

void ABook::advanceQuestion()
{
    if (m_question > 0)
        OpenSebem::increasePointsByNumberOfTries();
    
    OpenSebem::resetTries();
    if (m_isReviewMode)
        chooseRandomQuestion();
    else
        ++m_currentQuestion;
    
    if (m_answeredQuestions >= 30) {
        Display::clear();
        Display::showNumberAtDigit(OpenSebem::points(), 7);
        Display::blinkAll();
        Keyboard::disable();
        Sound::play(SongWinner);
        delay(3000);
        m_state = ChoosingBook;
        Keyboard::enable();
        OpenSebem::prompt();
        return;
    }
    
    displayQuestionPrompt();
}

int ABook::getCorrectAnswer()
{
    static const char *pattern = "CDDBAADCBDAADCBB";
    return pattern[(m_bookNumber + m_currentQuestion) & 15] - 'A';
}

void ABook::buttonPress(Button button)
{
    if (m_state == ChoosingBook)
        return;
    switch (button) {
    case A:
    case B:
    case C:
    case D:
        Keyboard::disable();
        
        if (getCorrectAnswer(b) == b) {
            ++m_answeredQuestions;
            showCorrectAnswer(true);
            Sound::play(SongCorrect);
            delay(100);
            advanceQuestion();
            return;
        }
        
        OpenSebem::increaseTryCount();
        if (OpenSebem::tryCount() >= 3) {
            ++m_answeredQuestions;
            showCorrectAnswer(true);
            Sound::play(SongFail);
            delay(200);
            advanceQuestion();
            return;
        }
        
        Display::clear();
        delay(30);
        highlightAnswer(b, false);
        Sound::play(SongWrong);
        delay(100);
        displayQuestionPrompt();
        break;
    default:
        Sound::lowBeep();
    }
}

