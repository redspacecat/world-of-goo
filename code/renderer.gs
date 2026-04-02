proc renderGoo {
    erase_all;

    set_pen_size 5;
    i = 1;
    repeat length gooConnections {
        local currentDrawID = ((i - 1) // MAX_CONNECTIONS) + 1;
        if gooConnections[i] > 0 and gooConnections[i] < currentDrawID {
            if IS_GOO_ONSCREEN(currentDrawID) or IS_GOO_ONSCREEN(gooConnections[i]) {
                drawConnection currentDrawID, gooConnections[i];
            }
        }
        i++;
    }

    # Highlight attachment points when holding a gooball
    if selectedGoo > 0 {
        set_pen_color "#ffffff";
        if isValidStrandConnection {
            drawConnection strandConnection.id1, strandConnection.id2, false;
        } else {
            i = 1;
            repeat length possibleConnections {
                drawConnection possibleConnections[i].id, selectedGoo, false;
                i++;
            }
        }
    }

    set_pen_size 15;
    i = 1;
    repeat length goo {
        if IS_GOO_ONSCREEN(i) {
            if goo[i].state != GooState.Roaming {
                set_pen_color gooTypes[goo[i].type].gooColor;
                GOTO(goo[i].x, goo[i].y);
                pen_down;
                pen_up;
            }
        }
        i++;
    }

    # render roaming gooballs on top of other ones
    i = 1;
    repeat length goo {
        if IS_GOO_ONSCREEN(i) {
            if goo[i].state == GooState.Roaming {
                set_pen_color gooTypes[goo[i].type].gooColor;
                GOTO(goo[i].x, goo[i].y);
                pen_down;
                pen_up;
            }
        }
        i++;
    }
}

proc drawConnection gooID, connectID, changeColor=true {
    if $changeColor {
        set_pen_color gooTypes[goo[$gooID].type].connColor;
    }
    GOTO(goo[$gooID].x, goo[$gooID].y);
    pen_down;
    GOTO(goo[$connectID].x, goo[$connectID].y);
    pen_up;
}