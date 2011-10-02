#ifndef __sound_h__
#define __sound_h__

typedef char* Song;
typedef char Tone;

class Sound {
    public:
        static void play(Song);
        static void play(Tone);
};

#endif /* __sound_h__ */