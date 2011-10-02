#ifndef __activity_standby_h__
#define __activity_standby_h__

#include "opensebem.h"

class AStandby : public Activity {
    public:
        AStandby();
        ~AStandby();
        
        virtual void oneLoopIteration();
};

#endif /* __activity_standby_h__ */
