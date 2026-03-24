costumes "assets/blank.svg";
%include std/math
%include std/list

list GooBall goo;
list gooConnections;
list GooTypeDef gooTypes;
list gooForcesX;
list gooForcesY;
list GooConn possibleConnections;

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
    x=0,
    y=0,
    xVel=0,
    yVel=0,
    type=GooTypes.Black
}

struct GooConn {
    id,
    distance
}

struct StrandConnection {
    id1,
    id2
}

struct Point {
    x,
    y
}

onflag {
    delete goo;
    delete gooConnections;
    SPRING_K = 0.9;   # How stiff the connections are
    DAMPING = 0.5;   # Air resistance/friction
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
    add GooTypeDef {gooColor: "#0c6011", connColor: "#20a026", maxConns: 3, minConns: 2, isDetachable: false} to gooTypes;
    add GooTypeDef {gooColor: "#dadada", connColor: "#a8a8a8", maxConns: 3, minConns: 2, isDetachable: false} to gooTypes;
}

func crossProduct(Point A, Point B) {
    return ($A.x * $B.y) - ($A.y * $B.x);
}

func sameSide(Point p1, Point p2, Point a, Point b) {
    local Point vectorAB = Point {x: $b.x - $a.x, y: $b.y - $a.y};

    local cp1 = crossProduct(vectorAB, Point {x: $p1.x - $a.x, y: $p1.y - $a.y});
    local cp2 = crossProduct(vectorAB, Point {x: $p2.x - $a.x, y: $p2.y - $a.y});
    return cp1 * cp2 >= 0;
}

func pointInTriangle(Point p, Point a, Point b, Point c) {
    if sameSide($p, $c, $a, $b)
    and sameSide($p, $a, $b, $c)
    and sameSide($p, $b, $c, $a) {
        return true;
    } else {
        return false;
    }
}

func ccw(Point A, Point B, Point C) {
    return ($C.y-$A.y) * ($B.x-$A.x) > ($B.y-$A.y) * ($C.x-$A.x);
}

func intersect(Point A, Point B, Point C, Point D) {
    # if the points are roughly the same, we can say they're not overlapping
    if DIST($A.x, $A.y, $C.x, $C.y) < 0.1 {return false;}
    if DIST($A.x, $A.y, $D.x, $D.y) < 0.1 {return false;}
    if DIST($B.x, $B.y, $C.x, $C.y) < 0.1 {return false;}
    if DIST($B.x, $B.y, $C.x, $C.y) < 0.1 {return false;}
    return ccw($A, $C, $D) != ccw($B, $C, $D) and ccw($A, $B, $C) != ccw($A, $B, $D);
}


proc deleteGooBall id {
    # Update all connections to account for the shifted/deleted ID
    i = 1;
    repeat length gooConnections {
        if gooConnections[i] == $id {
            # The deleted goo was connected here. Sever the connection. 
            gooConnections[i] = 0;
        } elif gooConnections[i] > $id {
            # Any gooball above the deleted one will shift down by 1 in the main list. 
            # We must decrement their references to keep them pointing to the right place.
            gooConnections[i]--;
        }
        i++;
    }

    # Remove the deleted goo's connection slots from the gooConnections list
    local startIndex = ($id - 1) * maxConnections + 1;
    repeat maxConnections {
        delete gooConnections[startIndex];
    }

    # Delete the actual gooball from the main list
    delete goo[$id];

    # Fix the player's selection state if necessary
    if selectedGoo == $id {
        selectedGoo = 0; # If the player was holding the deleted goo, drop it.
    } elif selectedGoo > $id {
        selectedGoo--;   # Shift the selection tracker down to match the new list order.
    }
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
            if goo[selectedGoo].x != mouse_x() or goo[selectedGoo].y != mouse_y() {
                goo[selectedGoo].x = mouse_x();
                goo[selectedGoo].y = mouse_y();
                findPossibleConnections;
            }
        }
    } else {
        if selectedGoo > 0 {
            findPossibleConnections;
            if isValidStrandConnection {
                # log "adding conn, valid";
                # log strandConnection.id1 & " " & strandConnection.id2;
                addGooConnection strandConnection.id1, strandConnection.id2, bypassLimit: true;
                deleteGooBall selectedGoo;
            } else {
                if length possibleConnections >= gooTypes[goo[selectedGoo].type].minConns {
                    i = 1;
                    repeat length possibleConnections {
                        if possibleConnections[i].id != selectedGoo {
                            addGooConnection selectedGoo, possibleConnections[i].id;
                            show gooConnections;
                        }
                        i++;
                    }
                }
            }
        }
        selectedGoo = 0;
        delete possibleConnections;
    }
}

proc findPossibleConnections {
    delete possibleConnections;
    # show possibleConnections;
    i = 1;
    repeat length goo {
        if i != selectedGoo {
            local connDistance = DIST(goo[selectedGoo].x, goo[selectedGoo].y, goo[i].x, goo[i].y);
            if connDistance < REST_LENGTH + 10 {
                # Detecting if the target connection line crosses through any of the connections
                local j = 1;
                local intersects = false;
                repeat length gooConnections {
                    if gooConnections[j] > 0 {
                        if not intersects {
                            local currentID = ((j - 1) // maxConnections) + 1;
                            local Point A = Point {x: goo[selectedGoo].x, y: goo[selectedGoo].y};
                            local Point B = Point {x: goo[i].x, y: goo[i].y};
                            local Point C = Point {x: goo[currentID].x, y: goo[currentID].y};
                            local Point D = Point {x: goo[gooConnections[j]].x, y: goo[gooConnections[j]].y};
                            if intersect(A, B, C, D) {
                                intersects = true;
                            }
                        }
                    }
                    j++;
                }

                if not intersects {
                    add GooConn {id: i, distance: connDistance} to possibleConnections;
                }
            }
        }
        i++;
    }

    INSERTION_SORT_BY_FIELD(GooConn, possibleConnections, .distance);

    if length possibleConnections >= 3 {
        # get three closest points and detect if we're inside the triangle that makes
        local Point A = Point {x: goo[possibleConnections[1].id].x, y: goo[possibleConnections[1].id].y};
        local Point B = Point {x: goo[possibleConnections[2].id].x, y: goo[possibleConnections[2].id].y};
        local Point C = Point {x: goo[possibleConnections[3].id].x, y: goo[possibleConnections[3].id].y};
        if pointInTriangle(Point {x: goo[selectedGoo].x, y: goo[selectedGoo].y}, A, B, C) {
            delete possibleConnections;
        }
    }

    until length possibleConnections <= gooTypes[goo[selectedGoo].type].maxConns {
        delete possibleConnections["last"];
    }

    if length possibleConnections < gooTypes[goo[selectedGoo].type].minConns {
        delete possibleConnections;
    }

    # i = 1;
    # repeat length possibleConnections {
    #     add  to connectionLengths
    #     i++;
    # }

    checkForStrandConnection;
}

proc checkForStrandConnection {
    isValidStrandConnection = false;
    if length possibleConnections != 2 {
        stop_this_script;
    }

    local GooConn p0 = possibleConnections[1];
    local GooConn p1 = possibleConnections[2];

    if p0.distance < REST_LENGTH * 0.8 and p1.distance < REST_LENGTH * 0.8 {
        # log DIST(goo[p0.id].x, goo[p0.id].y, goo[p1.id].x, goo[p1.id].y);
        if abs (REST_LENGTH - DIST(goo[p0.id].x, goo[p0.id].y, goo[p1.id].x, goo[p1.id].y)) < 25 {
            if not doesConnectionExist(p0.id, p1.id) {
                isValidStrandConnection = true;
                StrandConnection strandConnection = StrandConnection {id1: p0.id, id2: p1.id};
            }
        }
    }
}

func doesConnectionExist(source, target) {
    local i = ($source - 1) * maxConnections + 1;
    repeat maxConnections {
        if gooConnections[i] == $target {
            return true;
        }
        i++;
    }
    local i = ($target - 1) * maxConnections + 1;
    repeat maxConnections {
        if gooConnections[i] == $source {
            return true;
        }
        i++;
    }
    return false;
}

proc addGooConnection selectedID, connectID, connectOther=false, bypassLimit=false {
    local i = ($selectedID - 1) * maxConnections + 1;
    repeat gooTypes[goo[$selectedID].type].maxConns + (maxConnections * $bypassLimit) {
        if gooConnections[i] == $connectID {
            stop_this_script;
        } elif gooConnections[i] == 0 {
            gooConnections[i] = $connectID;
            # connect the other direction
            if not $connectOther {
                addGooConnection $connectID, $selectedID, connectOther: true, bypassLimit: true;
            }
            stop_this_script;
        }
        i++;
    }
}

proc gooPhysics {
    repeat 1 {
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
                local force = (dist - REST_LENGTH) * SPRING_K;

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
        if vel_mag > 12 {
            goo[i].xVel = (goo[i].xVel / vel_mag) * 12;
            goo[i].yVel = (goo[i].yVel / vel_mag) * 12;
        }
        i++;
    }

    # Zero out velocities for gooballs on the ground to prevent sliding
    i = 1;
    repeat length goo {
        if goo[i].y <= -150 {
            goo[i].xVel *= 0.7;
            goo[i].yVel *= 0.7;
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
                goo[i].yVel -= 2;
            } elif goo[i].yVel < -0.7 {
                goo[i].yVel -= 2.5;
            } elif goo[i].yVel < -0.8 {
                goo[i].yVel -= 3.5;
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

            # Floor collision
            if goo[i].y <= -150 {
                goo[i].y = -150;
                if goo[i].yVel < -1 { # Only bounce if falling with speed
                    goo[i].yVel *= -0.5;
                    goo[i].xVel *= 0.8;
                } else {
                    goo[i].yVel = 0;
                    goo[i].xVel *= 0.7;
                }            
            }
        } else {
            # If we are holding it, kill its velocity so it doesn't fly away when released
            goo[i].xVel = 0;
            goo[i].yVel = 0;
        }
        i++;
    }
    }
}

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