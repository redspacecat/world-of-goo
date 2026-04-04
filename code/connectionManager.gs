proc handleSelection {
    if mouse_down() {
        if selectedGoo == 0 {
            i = 1;
            repeat length goo {
                if DIST(goo[i].x, goo[i].y, MOUSE_X, MOUSE_Y) < 12 {
                    if goo[i].state == GooState.Attached {
                        if gooTypes[goo[i].type].isDetachable {
                            selectedGoo = i;
                            # local Point selectedOldPos = Point {x: MOUSE_X, y: MOUSE_Y};
                            local Point selectedOldPos = Point {x: goo[selectedGoo].x, y: goo[selectedGoo].y};
                            local Point oldMousePos = Point {x: MOUSE_X, y: MOUSE_Y};
                            stop_this_script;
                        }
                    } else {
                        local Point selectedOldPos = Point {x: goo[selectedGoo].x, y: goo[selectedGoo].y};
                        local Point oldMousePos = Point {x: MOUSE_X, y: MOUSE_Y};
                        selectedGoo = i;
                        stop_this_script;
                    }
                }
                i++;
            }
        } else {
            if selectedOldPos.x != MOUSE_X or selectedOldPos.y != MOUSE_Y {
                if goo[selectedGoo].state == GooState.Attached {
                    if DIST(goo[selectedGoo].x, goo[selectedGoo].y, MOUSE_X, MOUSE_Y) > 10 {
                        removeAllGooConnections selectedGoo;
                        goo[selectedGoo].state = GooState.Free;
                    }
                } else {
                    goo[selectedGoo].state = GooState.Free;
                    local dx = MOUSE_X - goo[selectedGoo].x;
                    local dy = MOUSE_Y - goo[selectedGoo].y;
                    local dist = sqrt(dx * dx + dy * dy);

                    local preMoveX = goo[selectedGoo].x;
                    local preMoveY = goo[selectedGoo].y;

                    # Move a fraction of the distance for easing/zipping
                    local moveDist = dist / 3;

                    if dist > 0 {
                        local steps = ceil(moveDist);
                        local stepX = (dx / dist) * (moveDist / steps);
                        local stepY = (dy / dist) * (moveDist / steps);
                        
                        local s = 1;
                        repeat steps {
                            local nextX = goo[selectedGoo].x + stepX;
                            local nextY = goo[selectedGoo].y + stepY;
                            
                            if not TOUCHING_GROUND(nextX, nextY) {
                                goo[selectedGoo].x = nextX;
                                goo[selectedGoo].y = nextY;
                            } else {
                                s = steps; # Wall hit
                            }
                            s++;
                        }
                    }

                    # Calculate velocity based on actual movement
                    goo[selectedGoo].xVel = goo[selectedGoo].x - preMoveX;
                    goo[selectedGoo].yVel = goo[selectedGoo].y - preMoveY;

                    selectedOldPos.x = goo[selectedGoo].x;
                    selectedOldPos.y = goo[selectedGoo].y;
                    findPossibleConnections;

                    oldMousePos.x = MOUSE_X;
                    oldMousePos.y = MOUSE_Y;
                    selectedOldPos.x = goo[selectedGoo].x;
                    selectedOldPos.y = goo[selectedGoo].y;
                    findPossibleConnections;
                    local Point oldMousePos = Point {x: MOUSE_X, y: MOUSE_Y};
                }
            }
        }
    } else {
        if selectedGoo > 0 {
            findPossibleConnections;
            if isValidStrandConnection {
                addGooConnection strandConnection.id1, strandConnection.id2, bypassLimit: true;
                deleteGoo selectedGoo;
            } else {
                if length possibleConnections >= gooTypes[goo[selectedGoo].type].minConns {
                    i = 1;
                    repeat length possibleConnections {
                        if possibleConnections[i].id != selectedGoo {
                            addGooConnection selectedGoo, possibleConnections[i].id;
                            goo[selectedGoo].xVel = 0;
                            goo[selectedGoo].yVel = 0;
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
        if i != selectedGoo and goo[i].state == GooState.Attached {
            local connDistance = DIST(goo[selectedGoo].x, goo[selectedGoo].y, goo[i].x, goo[i].y);
            if connDistance < REST_LENGTH + 10 {
                # Detecting if the target connection line crosses through any of the connections
                local j = 1;
                local intersects = false;
                repeat length gooConnections {
                    if gooConnections[j] > 0 {
                        if not intersects {
                            local currentID = ((j - 1) // MAX_CONNECTIONS) + 1;
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

    i = length possibleConnections;

    until i < 1 {
        # If the gooball is full, remove it from possibilities
        if getGooConnectionCount(possibleConnections[i].id) >= MAX_CONNECTIONS {
            delete possibleConnections[i];
        }
        i--; 
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
        if abs (REST_LENGTH - DIST(goo[p0.id].x, goo[p0.id].y, goo[p1.id].x, goo[p1.id].y)) < REST_LENGTH / 2 {
            if not doesConnectionExist(p0.id, p1.id) {
                isValidStrandConnection = true;
                StrandConnection strandConnection = StrandConnection {id1: p0.id, id2: p1.id};
            }
        }
    }
}

func doesConnectionExist(source, target) {
    local i = ($source - 1) * MAX_CONNECTIONS + 1;
    repeat MAX_CONNECTIONS {
        if gooConnections[i] == $target {
            return true;
        }
        i++;
    }
    local i = ($target - 1) * MAX_CONNECTIONS + 1;
    repeat MAX_CONNECTIONS {
        if gooConnections[i] == $source {
            return true;
        }
        i++;
    }
    return false;
}

func getGooConnectionCount(id) {
    local count = 0;
    local i = ($id - 1) * MAX_CONNECTIONS + 1;
    repeat MAX_CONNECTIONS {
        if gooConnections[i] > 0 {
            count++;
        }
        i++;
    }
    return count;
}

proc addGooConnection goo1, goo2, bypassLimit=false, connectOther=false, {
    local i = ($goo1 - 1) * MAX_CONNECTIONS + 1;
    if $bypassLimit {
        local amount = MAX_CONNECTIONS;
    } else {
        local amount = gooTypes[goo[$goo1].type].maxConns;
    }
    repeat amount {
        if gooConnections[i] == $goo2 {
            stop_this_script;
        } elif gooConnections[i] == 0 {
            gooConnections[i] = $goo2;

            gooConnectionLengths[i] = DIST(goo[$goo1].x, goo[$goo1].y, goo[$goo2].x, goo[$goo2].y);

            # set the goo state
            goo[$goo1].state = GooState.Attached;
            goo[$goo2].state = GooState.Attached;

            # connect the other direction
            if not $connectOther {
                addGooConnection $goo2, $goo1, connectOther: true, bypassLimit: true;
            }
            stop_this_script;
        }
        i++;
    }
}

proc removeGooConnection goo1, goo2, removeOther=false, {
    local i = ($goo1 - 1) * MAX_CONNECTIONS + 1;
    repeat MAX_CONNECTIONS {
        if gooConnections[i] == $goo2 {
            gooConnections[i] = 0;
            gooConnectionLengths[i] = 0;

            # remove the other direction
            if not $removeOther {
                removeGooConnection $goo2, $goo1, removeOther: true;
            }

            # set the goo state
            if getGooConnectionCount($goo1) == 0 {
                goo[$goo1].state = GooState.Free;
            }
            if getGooConnectionCount($goo2) == 0 {
                goo[$goo2].state = GooState.Free;
            }

            stop_this_script;
        }
        i++;
    }
}

proc removeAllGooConnections goo, {
    local i = ($goo - 1) * MAX_CONNECTIONS + 1;
    repeat MAX_CONNECTIONS {
        if gooConnections[i] > 0 {
            removeGooConnection $goo, gooConnections[i];
        }
        i++;
    }
}