#include "opensebem.h"

void setup()
{
    OpenSebem::switchToActivity(new AStandby);
    OpenSebem::reset();
}

void loop()
{
    OpenSebem::oneLoopIteration();
    delay(100);
}
