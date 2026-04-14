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
    addSound "discovery", 4;
    
    addSound "anticipation", 1;
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

on "stop_game" {
    stop_other_scripts;
}

proc handleSounds {
    until length SOUND_QUEUE == 0 {
        soundAction = SOUND_QUEUE[1];
        delete SOUND_QUEUE[1];
        soundName = SOUND_QUEUE[1];
        delete SOUND_QUEUE[1];
        if soundAction == "start" {
            clone;
        } elif soundAction == "stop" {
            soundToStop = soundName;
            broadcast "stop_sound";
        }
    }
}

onclone {
    playSound;
}

on "stop_sound" {
    if soundName == "sounds"."soundToStop" {
        delete_this_clone;
    }
}

proc playSound {
    local idx = soundName in SOUND_DATA.name;
    local name = soundName;
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