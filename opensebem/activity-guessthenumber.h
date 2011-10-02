#ifndef __activity_h__
#define __activity_h__

#include "activity.h"

class AGuessTheNumber : public Activity {
    private:
        void advanceQuestion();
        void showAnswer();
        
    public:
        AGuessTheNumber();
        ~AGuessTheNumber();
        
        void oneLoopIteration();
};

#endif /* __activity_h__ */
