costumes "assets/blank.svg";
%include std/math

list GooBall goo;
list gooConnections;
list GooTypeDef gooTypes;
list gooForcesX;
list gooForcesY;
list possibleConnections;

enum GooTypes {
    Black=1,
    Green=2,
    White=3
}

# conn = connection
struct GooTypeDef {
    maxConns,
    minConns,
    gooColor,
    connColor,
    isDetachable
}

struct GooBall {
    x,
    y,
    xVel,
    yVel,
    type
}

onflag {
    delete goo;
    delete gooConnections;
    SPRING_K = 0.9;   # How stiff the connections are
    DAMPING = 0.6;   # Air resistance/friction
    REST_LENGTH = 50; # The target distance between connected goos

    initGooTypes;

    maxConnections = 6;

    lastGooTime = 0;
    selectedGoo = 0;
    selectedCreationGoo = GooTypes.Black;
    pen_up;
    forever {
        handleSelection;
        gooPhysics;
        renderGoo;
    }
}

onkey "space" {
    add GooBall {x: mouse_x(), y: mouse_y(), xVel: 0, yVel: 0, type: selectedCreationGoo} to goo;
    repeat maxConnections {
        add 0 to gooConnections;
    }
    lastGooTime = 0;
}

onkey "1" {
    selectedCreationGoo = GooTypes.Black;
}
onkey "2" {
    selectedCreationGoo = GooTypes.Green;
}
onkey "3" {
    selectedCreationGoo = GooTypes.White;
}

proc initGooTypes {
    add GooTypeDef {gooColor: "#353535", connColor: "#6e6e6e", maxConns: 2, minConns: 1, isDetachable: false} to gooTypes;
    add GooTypeDef {gooColor: "#0b7d13", connColor: "#0b430e", maxConns: 3, minConns: 1, isDetachable: false} to gooTypes;
    add GooTypeDef {gooColor: "#dadada", connColor: "#a8a8a8", maxConns: 3, minConns: 2, isDetachable: false} to gooTypes;
}

proc handleSelection {
    if mouse_down() {
        if selectedGoo == 0 {
            i = 1;
            repeat length goo {
                if DIST(goo[i].x, goo[i].y, mouse_x(), mouse_y()) < 12 {
                    selectedGoo = i;
                    show selectedGoo;
                }
                i++;
            }
        } else {
            goo[selectedGoo].x = mouse_x();
            goo[selectedGoo].y = mouse_y();
            findPossibleConnections;
        }
    } else {
        if selectedGoo > 0 {
            findPossibleConnections;
            if length possibleConnections >= gooTypes[goo[selectedGoo].type].minConns {
                i = 1;
                repeat length possibleConnections {
                    if possibleConnections[i] != selectedGoo {
                        addGooConnection selectedGoo, possibleConnections[i];
                        show gooConnections;
                    }
                    i++;
                }
            }
        }
        selectedGoo = 0;
        delete possibleConnections;
    }
}

proc findPossibleConnections {
    delete possibleConnections;
    show possibleConnections;
    i = 1;
    repeat length goo {
        if i != selectedGoo {
            if DIST(goo[selectedGoo].x, goo[selectedGoo].y, goo[i].x, goo[i].y) < REST_LENGTH + 10 {
                if length possibleConnections < gooTypes[goo[selectedGoo].type].maxConns {
                    add i to possibleConnections;
                }
            }
        }
        i++;
    }
}

proc addGooConnection selectedID, connectID, connectOther=false {
    local i = ($selectedID - 1) * maxConnections + 1;
    repeat gooTypes[goo[$selectedID].type].maxConns {
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
    # Initialize force accumulators
    delete gooForcesX;
    delete gooForcesY;
    i = 1;
    repeat length goo {
        add 0 to gooForcesX;
        add 0 to gooForcesY;
        i++;
    }

    # Calculate and accumulate spring forces
    i = 1;
    repeat length gooConnections {
        local connectID = gooConnections[i];
        if connectID > 0 {
            local gooID = ((i - 1) // maxConnections) + 1;

            local dx = goo[connectID].x - goo[gooID].x;
            local dy = goo[connectID].y - goo[gooID].y;
            local dist = DIST(goo[gooID].x, goo[gooID].y, goo[connectID].x, goo[connectID].y);

            if dist > 0 {
                # Calculate how far the spring is stretched or squished
                local diff = dist - REST_LENGTH;
                local force = diff * SPRING_K;

                # Normalize the direction and accumulate forces
                local fx = (dx / dist) * force * 0.5;
                local fy = (dy / dist) * force * 0.5;
                
                gooForcesX[gooID] += fx;
                gooForcesY[gooID] += fy;
                
                gooForcesX[connectID] -= fx;
                gooForcesY[connectID] -= fy;
            }
        }
        i++;
    }

    # Apply accumulated forces to velocities
    i = 1;
    repeat length goo {
        goo[i].xVel += gooForcesX[i];
        goo[i].yVel += gooForcesY[i];
        
        # Clamp velocity to prevent wild oscillation
        local vel_mag = DIST(0, 0, goo[i].xVel, goo[i].yVel);
        if vel_mag > 4 {
            goo[i].xVel = (goo[i].xVel / vel_mag) * 4;
            goo[i].yVel = (goo[i].yVel / vel_mag) * 4;
        }
        i++;
    }

    # Zero out velocities for gooballs on the ground to prevent sliding
    i = 1;
    repeat length goo {
        if goo[i].y <= -150 {
            goo[i].xVel *= 0.7;
            goo[i].yVel = 0;
        }
        i++;
    }

    # Apply gravity, damping, and movement
    i = 1;
    repeat length goo {
        # Don't apply physics to the goo we are dragging!
        if i != selectedGoo {
            # Count connections for this goo
            local connCount = 0;
            local connIndex = (i - 1) * maxConnections + 1;
            local j = 0;
            repeat maxConnections {
                if gooConnections[connIndex + j] > 0 {
                    connCount++;
                }
                j++;
            }

            # Gravity - stronger for loosely connected goos
            if connCount < 2 {
                goo[i].yVel -= 3;  # Fast fall for loose goos
            } else {
                goo[i].yVel -= 0.5;  # Light gravity for connected goos
            }

            # Extra gravity for falling goos to accelerate collapses
            if goo[i].yVel < -0.5 {
                goo[i].yVel -= 1;
            } elif goo[i].yVel < -0.6 {
                goo[i].yVel -= 1.5;
            } elif goo[i].yVel < -0.85 {
                goo[i].yVel -= 2.5;
            }

            # Damping
            goo[i].xVel *= DAMPING;
            goo[i].yVel *= DAMPING;
            
            if abs(goo[i].xVel) < 0.1 {
                goo[i].xVel *= 0.7;
            }
            if abs(goo[i].yVel) < 0.1 {
                goo[i].yVel *= 0.7;
            }

            # Move the goo
            goo[i].x += goo[i].xVel;
            goo[i].y += goo[i].yVel;

            # Floor collision - completely stop all movement
            if goo[i].y <= -150 {
                goo[i].y = -150;
                goo[i].yVel = 0;  # Stop vertical movement completely
                goo[i].xVel = 0;  # Completely stop horizontal movement on ground
            }
        } else {
            # If we are holding it, kill its velocity so it doesn't fly away when released
            goo[i].xVel = 0;
            goo[i].yVel = 0;
        }
        i++;
    }
}

proc renderGoo {
    erase_all;

    set_pen_size 5;
    i = 1;
    repeat length gooConnections {
        if gooConnections[i] > 0 {
            drawConnection ((i - 1) // maxConnections) + 1, gooConnections[i];
        }
        i++;
    }

    # Highlight attachment points when holding a gooball
    if selectedGoo > 0 {
        set_pen_color "#ffffff";
        i = 1;
        repeat length possibleConnections {
            local targetGoo = possibleConnections[i];
            drawConnection targetGoo, selectedGoo, false;
            i++;
        }
    }

    set_pen_size 15;
    i = 1;
    repeat length goo {
        set_pen_color gooTypes[goo[i].type].gooColor;
        goto goo[i].x, goo[i].y;
        pen_down;
        pen_up;
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