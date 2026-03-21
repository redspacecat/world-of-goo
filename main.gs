costumes "assets/blank.svg";
%include std/math

list gooX;
list gooY;
list gooXVel;
list gooYVel;

onflag {
    delete gooX;
    delete gooY;
    lastGooTime = 0;
    selectedGoo = 0;
    set_pen_color "#000000";
    set_pen_size 10;
    pen_up;
    forever {
        handleSelection;
        gooPhysics;
        renderGoo;
    }
}

onkey "space" {
    add mouse_x() to gooX;
    add mouse_y() to gooY;
    add 0 to gooXVel;
    add 0 to gooYVel;
    lastGooTime = 0;
}

proc handleSelection {
    if mouse_down() {
        if selectedGoo == 0 {
            i = 1;
            repeat length gooX {
                if DIST(gooX[i], gooY[i], mouse_x(), mouse_y()) < 10 {
                    selectedGoo = i;
                    show selectedGoo;
                }
                i++;
            }
        } else {
            gooX[selectedGoo] = mouse_x();
            gooY[selectedGoo] = mouse_y();

        }
    } else {
        selectedGoo = 0;
    }
}

proc gooPhysics {
    # i = 1;
    # repeat length gooX {
    #     gooYVel[i] -= 1;
    #     gooY[i] += gooYVel[i];
    #     if gooY[i] < -150 {
    #         gooY[i] = -150;
    #         gooYVel[i] = 0;
    #     }
    #     i++;
    # }
}

proc renderGoo {
    erase_all;
    i = 1;
    repeat length gooX {
        goto gooX[i], gooY[i];
        pen_down;
        pen_up;
        i++;
    }
}