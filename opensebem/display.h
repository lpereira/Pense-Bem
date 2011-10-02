#ifndef __display_h__
#define __display_h__

class Display {
    private:
        bool m_onPhase;
        int m_blinkTable;
        char m_contents[9];
        
    public:
        void clear(int begin, int end);
        void disableBlink();
        void blinkAll();
        void blinkDigit(int digit);
};

#endif /* __display_h__ */

