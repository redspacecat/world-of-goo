costumes "assets/blank.svg";
%include std/math

list gooX;
list gooY;
list gooXVel;
list gooYVel;
list gooConnections;

onflag {
    delete gooX;
    delete gooY;
    delete gooXVel;
    delete gooYVel;
    delete gooConnections;
    SPRING_K = 0.55;   # How stiff the connections are
    DAMPING = 0.88;   # Air resistance/friction
    REST_LENGTH = 50; # The target distance between connected goos

    lastGooTime = 0;
    selectedGoo = 0;
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
    repeat 3 {
        add 0 to gooConnections;
    }
    lastGooTime = 0;
}

proc handleSelection {
    if mouse_down() {
        if selectedGoo == 0 {
            i = 1;
            repeat length gooX {
                if DIST(gooX[i], gooY[i], mouse_x(), mouse_y()) < 20 {
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
        if selectedGoo > 0 {
            i = 1;
            repeat length gooX {
                if i != selectedGoo {
                    if DIST(gooX[selectedGoo], gooY[selectedGoo], gooX[i], gooY[i]) < 50 {
                        # gooConnections[selectedGoo*3] = i;
                        addGooConnection selectedGoo, i;
                        show gooConnections;
                    }
                }
                i++;
            }
        }
        selectedGoo = 0;
    }
}

proc addGooConnection selectedID, connectID, connectOther=false {
    local i = ($selectedID - 1) * 3 + 1;
    repeat 3 {
        if gooConnections[i] == $connectID {
            stop_this_script;
        } elif gooConnections[i] == 0 {
            gooConnections[i] = $connectID;
            # connect the other direction
            if $connectOther == false {
                addGooConnection $connectID, $selectedID, true;
            }
            stop_this_script;
        }
        i++;
    }
}

proc gooPhysics {
    # Calculate spring forces
    i = 1;
    repeat length gooConnections {
        local connectID = gooConnections[i];
        if connectID > 0 {
            local gooID = ((i - 1) // 3) + 1;

            local dx = gooX[connectID] - gooX[gooID];
            local dy = gooY[connectID] - gooY[gooID];
            local dist = DIST(gooX[gooID], gooY[gooID], gooX[connectID], gooY[connectID]);

            if dist > 0 {
                # Calculate how far the spring is stretched or squished
                local diff = dist - REST_LENGTH;
                local force = diff * SPRING_K;

                # Normalize the direction and apply the force to the velocity
                gooXVel[gooID] += (dx / dist) * force * 0.7;  # Reduce force application to prevent oscillation
                gooYVel[gooID] += (dy / dist) * force * 0.7;
                
                # Clamp velocity to prevent wild oscillation on connection
                local vel_mag = DIST(0, 0, gooXVel[gooID], gooYVel[gooID]);
                if vel_mag > 3 {
                    gooXVel[gooID] = (gooXVel[gooID] / vel_mag) * 3;
                    gooYVel[gooID] = (gooYVel[gooID] / vel_mag) * 3;
                }
            }
        }
        i++;
    }

    # Zero out velocities for gooballs on the ground to prevent sliding
    i = 1;
    repeat length gooX {
        if gooY[i] <= -150 {
            gooXVel[i] = 0;
            gooYVel[i] = 0;
        }
        i++;
    }

    # Apply gravity, damping, and movement
    i = 1;
    repeat length gooX {
        # Don't apply physics to the goo we are dragging!
        if i != selectedGoo {
            # Gravity
            gooYVel[i] -= 1;

            # Damping
            gooXVel[i] *= DAMPING;
            gooYVel[i] *= DAMPING;
            
            if abs(gooXVel[i]) < 0.1 {
                gooXVel[i] *= 0.8;
            }
            if abs(gooYVel[i]) < 0.1 {
                gooYVel[i] *= 0.8;
            }

            # Move the goo
            gooX[i] += gooXVel[i];
            gooY[i] += gooYVel[i];

            # Floor collision - completely stop all movement
            if gooY[i] <= -150 {
                gooY[i] = -150;
                gooYVel[i] = 0;  # Stop vertical movement completely
                gooXVel[i] = 0;  # Completely stop horizontal movement on ground
            }
        } else {
            # If we are holding it, kill its velocity so it doesn't fly away when released
            gooXVel[i] = 0;
            gooYVel[i] = 0;
        }
        i++;
    }
}

proc renderGoo {
    erase_all;

    set_pen_color "#6e6e6e";
    set_pen_size 5;
    i = 1;
    repeat length gooConnections {
        if gooConnections[i] > 0 {
            drawConnection ((i - 1) // 3) + 1, gooConnections[i];
        }
        i++;
    }

    set_pen_color "#000000";
    set_pen_size 15;

    i = 1;
    repeat length gooX {
        goto gooX[i], gooY[i];
        pen_down;
        pen_up;
        i++;
    }
}

proc drawConnection gooID, connectID {
    goto gooX[$gooID], gooY[$gooID];
    pen_down;
    goto gooX[$connectID], gooY[$connectID];
    pen_up;
}