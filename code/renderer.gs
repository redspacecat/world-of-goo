proc renderGoo {
    erase_all;

    set_pen_size 5;
    i = 1;
    repeat length gooConnections {
        if gooConnections[i] > 0 and gooConnections[i] < ((i - 1) // maxConnections) + 1 {
            drawConnection ((i - 1) // maxConnections) + 1, gooConnections[i];
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
                local targetGoo = possibleConnections[i].id;
                drawConnection targetGoo, selectedGoo, false;
                i++;
            }
        }
    }

    set_pen_size 15;
    i = 1;
    repeat length goo {
        if goo[i].state != GooState.Roaming {
            set_pen_color gooTypes[goo[i].type].gooColor;
            goto goo[i].x, goo[i].y;
            pen_down;
            pen_up;
        }
        i++;
    }

    # render roaming gooballs on top of other ones
    i = 1;
    repeat length goo {
        if goo[i].state == GooState.Roaming {
            set_pen_color gooTypes[goo[i].type].gooColor;
            goto goo[i].x, goo[i].y;
            pen_down;
            pen_up;
        }
        i++;
    }
}

proc drawConnection gooID, connectID, changeColor=true {
    if $changeColor {
        set_pen_color gooTypes[goo[$gooID].type].connColor;
    }
    goto goo[$gooID].x, goo[$gooID].y;
    pen_down;
    goto goo[$connectID].x, goo[$connectID].y;
    pen_up;
}