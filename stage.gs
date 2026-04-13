costumes "assets/images/sky_blue.png";
%include code/globals
sounds "assets/audio/music/*.mp3";

on "start_game" {
    stop_other_scripts;
    stop_all_sounds;
    forever {
        if LEVEL_NUM == 1 or LEVEL_NUM == 3 {
            play_sound_until_done "Another Mysterious Pipe Appeared";
        } elif LEVEL_NUM == 2 {
            play_sound_until_done "Brave Adventurers";
        } else {
            play_sound_until_done "Years of Work";
        }
    }
}

on "stop_game" {
    stop_other_scripts;
    stop_all_sounds;
}

on "title_screen" {
    forever {
        play_sound_until_done "The Goo Filled Hills";
    }
}