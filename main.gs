costumes "assets/blank.svg";
%include std/math
%include std/list

list GooBall goo;
list gooConnections;
list GooTypeDef gooTypes;
list GooConn possibleConnections;
list gooConnectionLengths;

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
    forceX=0,
    forceY=0,
    type=GooTypes.Black,
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
    delete gooConnectionLengths;
    SPRING_K = 1.2;       # Spring stiffness
    SPRING_DAMPING = 0.8; # How quickly the spring stops bouncing
    DAMPING = 0.98;       # Global air resistance
    GRAVITY = 0.4;        # A single, unified gravity constant
    REST_LENGTH = 50;
    PHYSICS_STEPS = 5;

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
    add GooBall {x: mouse_x(), y: mouse_y(), type: selectedCreationGoo} to goo;
    repeat maxConnections {
        add 0 to gooConnections;
        add 0 to gooConnectionLengths;
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
        delete gooConnectionLengths[startIndex];
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
                }
                i++;
            }
        } else {
            if goo[selectedGoo].x != mouse_x() or goo[selectedGoo].y != mouse_y() {
                goo[selectedGoo].x = mouse_x();
                goo[selectedGoo].y = mouse_y();
                goo[selectedGoo].xVel = 0;
                goo[selectedGoo].yVel = 0;
                findPossibleConnections;
            }
        }
    } else {
        if selectedGoo > 0 {
            findPossibleConnections;
            if isValidStrandConnection {
                addGooConnection strandConnection.id1, strandConnection.id2, bypassLimit: true;
                deleteGooBall selectedGoo;
            } else {
                if length possibleConnections >= gooTypes[goo[selectedGoo].type].minConns {
                    i = 1;
                    repeat length possibleConnections {
                        if possibleConnections[i].id != selectedGoo {
                            addGooConnection selectedGoo, possibleConnections[i].id;
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

proc addGooConnection goo1, goo2, connectOther=false, bypassLimit=false {
    local i = ($goo1 - 1) * maxConnections + 1;
    if $bypassLimit {
        local amount = maxConnections;
    } else {
        local amount = gooTypes[goo[$goo1].type].maxConns;
    }
    repeat amount {
        if gooConnections[i] == $goo2 {
            stop_this_script;
        } elif gooConnections[i] == 0 {
            gooConnections[i] = $goo2;

            gooConnectionLengths[i] = DIST(goo[$goo1].x, goo[$goo1].y, goo[$goo2].x, goo[$goo2].y);

            # connect the other direction
            if not $connectOther {
                addGooConnection $goo2, $goo1, connectOther: true, bypassLimit: true;
            }
            stop_this_script;
        }
        i++;
    }
}

proc gooPhysics {
    i = 1;
    repeat length gooConnectionLengths {
        if gooConnectionLengths[i] > 0 {
            if abs(REST_LENGTH - gooConnectionLengths[i]) > 0.01 {
                gooConnectionLengths[i] += (REST_LENGTH - gooConnectionLengths[i]) / 10;
            }
        }
        i++;
    }

    repeat PHYSICS_STEPS {
        # Reset forces
        i = 1;
        repeat length goo {
            goo[i].forceX = 0;
            goo[i].forceY = 0;
            i++;
        }

        # Calculate Spring Forces (Newtonian)
        i = 1;
        repeat length gooConnections {
            local id1 = ((i - 1) // maxConnections) + 1;
            local id2 = gooConnections[i];

            if id2 > 0 and id2 < id1 {
                local dx = goo[id2].x - goo[id1].x;
                local dy = goo[id2].y - goo[id1].y;
                local dist = sqrt(dx * dx + dy * dy);
                if dist < 0.1 { dist = 0.1; }

                local currentRestLength = gooConnectionLengths[i];
                local springForce = (dist - currentRestLength) * SPRING_K;

                # Damping for the SPRING (stops the jitter/oscillation)
                local relVelX = goo[id2].xVel - goo[id1].xVel;
                local relVelY = goo[id2].yVel - goo[id1].yVel;
                local relVel = (relVelX * dx / dist) + (relVelY * dy / dist);
                local dampForce = relVel * SPRING_DAMPING;

                local totalForce = springForce + dampForce;

                local fx = totalForce * dx / dist;
                local fy = totalForce * dy / dist;

                goo[id1].forceX += fx;
                goo[id1].forceY += fy;
                goo[id2].forceX -= fx;
                goo[id2].forceY -= fy;
            }
            i++;
        }

        # Apply Forces and Movement
        i = 1;
        repeat length goo {
            if i != selectedGoo {
                # Apply spring forces and gravity
                # (Notice gravity is also divided by steps)
                goo[i].xVel += goo[i].forceX / PHYSICS_STEPS;
                goo[i].yVel += (goo[i].forceY - GRAVITY) / PHYSICS_STEPS;

                # MOVE the goo
                goo[i].x += goo[i].xVel / PHYSICS_STEPS;
                goo[i].y += goo[i].yVel / PHYSICS_STEPS;

                # Ground Collision
                if goo[i].y < -150 {
                    goo[i].y = -150;
                    goo[i].yVel *= -0.3;
                    goo[i].xVel *= 0.5;
                }
            }
            i++;
        }
    }

    # Global Air Resistance (Apply ONLY ONCE per frame)
    i = 1;
    repeat length goo {
        goo[i].xVel *= DAMPING;
        goo[i].yVel *= DAMPING;
        i++;
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