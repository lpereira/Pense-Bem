#include "activity-standby.h"

AStandby::AStandby()
{
    Display::reset();
    Keyboard::disable();
}

void AStandby::oneLoopIteration()
{
}

void AStandby::buttonPress(Button)
{
}
