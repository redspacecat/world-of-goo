costumes "assets/images/ui/*";
%define C(compare) (costume_name()[1] == compare)

on "title_screen" {
    if 1 == 1 {
        delete_this_clone;
    }
    show;
    make -78, -28, "level1";
    make 78, -28, "level2";
    make -78, -97, "level3";
    make 78, -97, "level4";
    goto 0, 0;
    switch_costume "title";
    goto_back;
}

on "init" {
    if not C("w") {
        delete_this_clone;
    }
}

on "start_game" {
    hide;
    if 1 == 1 {
        delete_this_clone;
    }
    make -217, -160, "home";
}

proc make x, y, c {
    goto $x, $y;
    switch_costume $c;
    clone;
}

onclone {
    show;
    if C("l") {
        forever {
            if touching_mouse_pointer() {
                change_size (105 - size()) / 3;
            } else {
                change_size (100 - size()) / 3;
            }
        }
    } elif C("w") {
        broadcast "init";
    } elif C("h") {
        set_size 4.5;
    }
}

onclick {
    if C("l") {
        LEVEL_NUM = costume_name()[6];
        make 0, 0, "wait";
    } elif C("h") {
        broadcast_and_wait "stop_game";
        broadcast "title_screen";
    }
}