#include "opensebem.h"

OpenSebem::~OpenSebem()
{
}

void OpenSebem::switchToActivity(Activity *activity, bool keepScreenContents=false)
{
    if (!keepScreenContents)
        Display::clear();
    OpenSebem::resetToDefaultState();
    delete OpenSebem::m_activity;
    OpenSebem::m_activity = activity;
    OpenSebem::reset();
}

void OpenSebem::prompt(int initialDigit=7, int maxDigitSize=3, char promptCharacter='-')
{
    OpenSebem::m_previousActivity = OpenSebem::m_activity;
    OpenSebem::m_activity = 0; /* Prevents delete m_activity to freeing up current activity */
    OpenSebem::switchToActivity(new APrompt, true);
}

void OpenSebem::buttonPress(Button button)
{
    switch (button) {
    case PowerOn:
        OpenSebem::switchToActivity(new AWelcome);
        break;
    case PowerOff:
        OpenSebem::switchToActivity(new AStandby);
        break;
    default:
        if (Keyboard::enabled() && OpenSebem::m_activity)
            OpenSebem::m_activity->buttonPress(button);
        else
            Sound::lowBeep();
    }
}

void OpenSebem::oneLoopIteration()
{
    /* FIXME: Will we need a delayTable like the simulator? */
    if (OpenSebem::m_activity)
        OpenSebem::m_activity->oneLoopIteration();
}

void OpenSebem::reset()
{
    OpenSebem::resetToDefaultState();
    if (OpenSebem::m_activity)
        OpenSebem::m_activity->reset();
}

void OpenSebem::resetToDefaultState()
{
    /* FIXME: DelayTable? */
    Keyboard::enable();
    Display::disableBlink();
}
