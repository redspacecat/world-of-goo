costumes
"assets/giant-square.svg",
"assets/level-1.svg",
"assets/pipeCap_closed.png",
"assets/pipeCap.png";

onflag {
    show;
    set_ghost_effect 100;
}

on "start_game" {
    hide;
    set_ghost_effect 0;
}

on "display_world" {
    switch_costume "giant-square";
    goto -SCROLL_X, -SCROLL_Y;
    switch_costume "level-" & LEVEL_NUM;
    stamp;

    if GAME_STARTED {
        displayPipe;
    }
}

proc displayPipe {
    i = 2;
    set_pen_color "#0a0a0a";
    set_pen_size 15;
    goto PIPE[2], PIPE[3];
    pen_down;
    repeat (length(PIPE) - 1) / 2 {
        goto PIPE[i], PIPE[i + 1];
        i += 2;
    }
    pen_up;

    goto PIPE[2], PIPE[3];

    if PIPE_OPEN {
        switch_costume "pipeCap";
    } else {
        switch_costume "pipeCap_closed";
    }

    set_size 40;
    point_in_direction PIPE[1] + 90;
    stamp;

    point_in_direction 90;
    set_size 100;
}