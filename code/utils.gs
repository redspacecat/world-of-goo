proc queueSound name {
    if GAME_STARTED {
        add "start" to SOUND_QUEUE;
        add $name to SOUND_QUEUE;
    }
}

proc stopSound name {
    if GAME_STARTED {
        add "stop" to SOUND_QUEUE;
        add $name to SOUND_QUEUE;
    }
}