proc renderGoo {
    # Draw goo connections
    switch_costume "renderbox";
    set_pen_size 7;
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
                switch_costume "renderbox";
                GOTO(goo[i].x, goo[i].y);
                if goo[i].state == GooState.Free {
                    set_size 95;
                    point_in_direction goo[i].rotation;
                    if DIST(MOUSE_X, MOUSE_Y, goo[i].x, goo[i].y) < 20 {
                        switch_costume "goo-" & goo[i].type & "-eyes";
                    } else {
                        switch_costume "goo-" & goo[i].type;
                    }
                } else {
                    point_in_direction 90;
                    set_size 95 + (sin(TICK * 3) * 15);
                    switch_costume "goo-" & goo[i].type;
                }
                stamp;
            }
        }
        i++;
    }

    # Render roaming gooballs on top of other ones
    i = 1;
    repeat length goo {
        if IS_GOO_ONSCREEN(i) {
            if goo[i].state == GooState.Roaming {
                switch_costume "renderbox";
                GOTO(goo[i].x, goo[i].y);
                set_size 95;
                point_in_direction 90;
                if DIST(MOUSE_X, MOUSE_Y, goo[i].x, goo[i].y) < 20 {
                    switch_costume "goo-" & goo[i].type & "-eyes";
                } else {
                    switch_costume "goo-" & goo[i].type;
                }
                stamp;
                # pen_down;
                # pen_up;
            }
        }
        i++;
    }
}

proc drawConnection gooID, connectID, changeColor=true {
    local x1 = goo[$gooID].x;
    local y1 = goo[$gooID].y;
    local x2 = goo[$connectID].x;
    local y2 = goo[$connectID].y;
    
    local segments = 10;
    local baseSize = 10;
    local minSize = 4;
    
    if $changeColor {
        set_pen_color gooTypes[goo[$gooID].type].connColor;
    } else {
        set_pen_color "#ffffff";
        baseSize = 6;
        minSize = 4;
    }

    GOTO(x1, y1);
    
    local i = 0;
    repeat segments {
        local progress = i / segments;
        
        local distFromCenter = abs(2 * progress - 1);
        local taper = 1 - (distFromCenter * distFromCenter);
        
        set_pen_size (baseSize - (baseSize - minSize) * taper);
        
        if $changeColor {
            if goo[$gooID].type == GooType.Green {
                if distFromCenter > 0.5 {
                    set_pen_brightness 40;
                } elif distFromCenter > 0.15 {
                    set_pen_brightness 50;
                } else {
                    set_pen_brightness 40;
                }
            } elif goo[$gooID].type == GooType.White {
                set_pen_brightness 100;
            } else {
                set_pen_brightness taper * 20;
            }
        } else {
            set_pen_brightness 100;
        }
        
        pen_down;
        local nextProgress = (i + 1) / segments;
        GOTO(x1 + (x2 - x1) * nextProgress, y1 + (y2 - y1) * nextProgress);
        i += 1;
    }
    
    pen_up;
    set_pen_brightness 0;
}