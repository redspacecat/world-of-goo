costumes "assets/images/blank.svg";

sounds
"assets/audio/goo/_generic/*",
"assets/audio/goo/common/*",
"assets/audio/goo/ivy/*",
"assets/audio/pipe/*";

struct Sound {
    name,
    pitchMin=0,
    pitchMax=0,
    range=1
}

list Sound SOUND_DATA;

proc addSound name, range=1, pitchMin=0, pitchMax=0 {
    add Sound {name: $name, range: $range, pitchMin: $pitchMin, pitchMax: $pitchMax} to SOUND_DATA;
}

proc initSounds {
    addSound "attach", 3;
    addSound "glee", 11;
    addSound "mumble", 7;
    addSound "batsqueak", 5;
    addSound "chirp", 2;
    
    addSound "suck_begin", 1;
    addSound "suck_end", 1;
    addSound "suck_loop", 1;
}

on "init_constants" {
    if 1 == 1 {
        delete_this_clone;
    }
    initSounds;
}

on "start_game" {
    forever {
        handleSounds;
    }
}

proc handleSounds {
    until length SOUND_QUEUE == 0 {
        sound_name = SOUND_QUEUE[1];
        delete SOUND_QUEUE[1];
        clone;
    }
}

onclone {
    playSound;
}

proc playSound {
    local idx = sound_name in SOUND_DATA.name;
    local name = sound_name;
    if idx > 0 {
        if SOUND_DATA[idx].pitchMin and SOUND_DATA[idx].pitchMax {
            set_pitch_effect random(SOUND_DATA[idx].pitchMin, SOUND_DATA[idx].pitchMax);
        }
        if SOUND_DATA[idx].range > 1 {
            name &= random(1, SOUND_DATA[idx].range);
        }
    } else {
        set_pitch_effect random(-30, 30);
    }
    play_sound_until_done name;
    delete_this_clone;
}