#ifndef __opensebem_h__
#define __opensebem_h__

#include "keyboard.h"
#include "sound.h"
#include "display.h"
#include "activity.h"
#include "activity-standby.h"
#include "activity-guessthenumber.h"
#include "activity-middlenumber.h"

class OpenSebem {
    private:
        static Activity *m_activity;
        
        static int m_tries;
    public:
        OpenSebem() {
            OpenSebem::m_activity = 0;
            OpenSebem::m_tries = 0;
            
            OpenSebem::switchToActivity(new AStandby);
            OpenSebem::reset();
            /* FIXME: call OpenSebem::oneLoopIteration() every 100ms */
        }
        ~OpenSebem() {
            delete m_activity;
        }
        
        static void switchToActivity(Activity*, bool keepScreenContents);
        
        static Keyboard *keyboard() { return m_keyboard; }
        static Sound *sound() { return m_sound; }
        static Display *display() { return m_display; }
        
        static prompt(int initialDigit, int maxDigitSize, char promptCharacter);
        
        static buttonPress(Button);
        
        static int pointsByNumberOfTries();
};

#endif /* __opensebem_h__ */
