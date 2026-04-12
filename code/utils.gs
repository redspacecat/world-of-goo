proc queueSound name {
    if GAME_STARTED {
        add $name to SOUND_QUEUE;
    }
}