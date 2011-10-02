#ifndef __activity_h__
#define __activity_h__

#include "keyboard.h"

class Activity {
    public:
        virtual void oneLoopIteration() = 0;
        virtual void buttonPress(Button);
};

#endif /* __activity_h__ */