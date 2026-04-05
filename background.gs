costumes "assets/images/levels/background/*.svg", "assets/images/giant-square.svg", "assets/images/blank.svg";

onflag {
    show;
    set_ghost_effect 100;
}

on "start_game" {
    hide;
    set_ghost_effect 0;
}

on "display_background" {
    switch_costume "giant-square";
    goto -SCROLL_X, -SCROLL_Y;
    switch_costume "blank";
    switch_costume "bg-" & LEVEL_NUM;
    stamp;
}