proc addGoo x, y, type {
    add GooBall {x: $x, y: $y, type: $type, state: GooState.Free} to goo;
    repeat MAX_CONNECTIONS {
        add 0 to gooConnections;
        add 0 to gooConnectionLengths;
    }
}

proc deleteGoo id {
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

    # Update roaming goo references
    i = 1;
    repeat length goo {
        if goo[i].sourceNode == $id {
            goo[i].sourceNode = 0;   # Node gone
            if goo[i].state == GooState.Roaming {
                goo[i].state = GooState.Free;   # Fall off strand
            }
        } elif goo[i].sourceNode > $id {
            goo[i].sourceNode--;
        }
        
        if goo[i].targetNode == $id {
            goo[i].targetNode = 0;
            if goo[i].state == GooState.Roaming {
                goo[i].state = GooState.Free;
            }
        } elif goo[i].targetNode > $id {
            goo[i].targetNode--;
        }
        i++;
    }

    # Remove the deleted goo's connection slots from the gooConnections list
    local startIndex = ($id - 1) * MAX_CONNECTIONS + 1;
    repeat MAX_CONNECTIONS {
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

proc updateGooAI {
    local i = 1;
    repeat length goo {
        # Only process AI for gooballs NOT being held
        if i != selectedGoo {
            if goo[i].state == GooState.Free {
                # Rolling, only when on gorund
                if TOUCHING_GROUND(goo[i].x, goo[i].y - 2) {
                    goo[i].roamTimer--;
                    if goo[i].roamTimer <= 0 {
                        goo[i].moveDir = (random(0, 1) * 2) - 1;
                        goo[i].roamTimer = random(30*5, 30*10);
                    }
                    # Apply rolling speed 
                    local targetSpeed = goo[i].moveDir * 1.5;
                    goo[i].xVel += (targetSpeed - goo[i].xVel) * 0.35;
                }

                # Climbing detection
                if TICK % 15 == 0 {
                    local j = 1;
                    repeat length goo {
                        if i != j and goo[j].state == GooState.Attached {
                            if DIST(goo[i].x, goo[i].y, goo[j].x, goo[j].y) < 12 {
                                # Find a neighbor to climb toward
                                local neighbor = getRoamingNeighbor(j, 0);
                                if neighbor > 0 {
                                    goo[i].state = GooState.Roaming;
                                    goo[i].sourceNode = j;
                                    goo[i].targetNode = neighbor;
                                    goo[i].climbDist = 0;
                                    goo[i].xVel = 0;
                                    goo[i].yVel = 0;
                                }
                            }
                        }
                        j++;
                    }
                }
            } elif goo[i].state == GooState.Roaming {
                # Climbing logic
                local sID = goo[i].sourceNode;
                local tID = goo[i].targetNode;

                # If close to the pipe and it's open, detach to be sucked
                if PIPE_OPEN and DIST(goo[i].x, goo[i].y, PIPE[2], PIPE[3]) < 30 {
                    goo[i].state = GooState.Free;
                    goo[i].sourceNode = 0;
                    goo[i].targetNode = 0;
                    # Give them an initial velocity towards the pipe
                    local dx = PIPE[2] - goo[i].x;
                    local dy = PIPE[3] - goo[i].y;
                    local distToPipe = DIST(goo[i].x, goo[i].y, PIPE[2], PIPE[3]);
                    if distToPipe > 0.1 {
                        goo[i].xVel = (dx / distToPipe) * 5;
                        goo[i].yVel = (dy / distToPipe) * 5;
                    }
                } elif sID == 0 or tID == 0 or goo[sID].state != GooState.Attached or goo[tID].state != GooState.Attached {
                    # Fallback if nodes are destroyed or detached
                    goo[i].state = GooState.Free;
                } else {
                    local totalDist = DIST(goo[sID].x, goo[sID].y, goo[tID].x, goo[tID].y);
                    
                    # Move along the strand
                    goo[i].climbDist += 1.2;

                    # If reached target, pick a new one
                    if goo[i].climbDist >= totalDist {
                        local nextNode = getRoamingNeighbor(tID, sID);
                        if nextNode > 0 {
                            goo[i].sourceNode = tID;
                            goo[i].targetNode = nextNode;
                            goo[i].climbDist = 0;

                            sID = goo[i].sourceNode;
                            tID = goo[i].targetNode;
                            dx = goo[tID].x - goo[sID].x;
                            dy = goo[tID].y - goo[sID].y;
                        } else {
                            # If there are NO other connections, the Goo should turn around
                            local temp = goo[i].sourceNode;
                            goo[i].sourceNode = goo[i].targetNode;
                            goo[i].targetNode = temp;
                            goo[i].climbDist = 0;
                        }
                    }

                    # Update position based on current strand line
                    local t = 0;
                    if totalDist > 0 { t = goo[i].climbDist / totalDist; }
                    if t > 1 { t = 1; }
                    
                    goo[i].x = goo[sID].x + (goo[tID].x - goo[sID].x) * t;
                    goo[i].y = goo[sID].y + (goo[tID].y - goo[sID].y) * t;
                }
            }
        }
        i++;
    }
}

func getRoamingNeighbor(node, exclude) {
    local start = ($node - 1) * MAX_CONNECTIONS + 1;
    delete possibleNeighbors;
    
    local c = 0;
    repeat MAX_CONNECTIONS {
        local n = gooConnections[start + c];
        if n > 0 and n != $exclude {
            add n to possibleNeighbors;
        }
        c++;
    }
    
    if length possibleNeighbors > 0 {
        if PIPE_OPEN {
            if random(0.0, 1.0) < 0.65 {
                # Choose the neighbor closest to the target
                local closest = 0;
                local minDist = 999999;
                local idx = 1;
                repeat length possibleNeighbors {
                    local n = possibleNeighbors[idx];
                    local dist = DIST(goo[n].x, goo[n].y, PIPE[2], PIPE[3]);
                    if dist < minDist {
                        minDist = dist;
                        closest = n;
                    }
                    idx++;
                }
                return closest;
            } else {
                # Choose randomly for exploration
                return possibleNeighbors["random"];
            }
        } else {
            return possibleNeighbors["random"];
        }
    }
    
    # If no other choice, go back where we came from (dead end)
    return $exclude;
}

proc gooPhysics {
    i = 1;
    repeat length gooConnectionLengths {
        if gooConnectionLengths[i] > 0 {
            if gooConnectionLengths[i] < REST_LENGTH {
                local targetLength = REST_LENGTH * REST_LENGTH_MIN_NORMALIZE_RATIO;
                if gooConnectionLengths[i] < targetLength {
                    gooConnectionLengths[i] += (targetLength - gooConnectionLengths[i]) * REST_LENGTH_NORMALIZE_SPEED;
                }
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
            local id1 = ((i - 1) // MAX_CONNECTIONS) + 1;
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
            if i != selectedGoo and goo[i].state != GooState.Roaming {
                # Apply spring forces and gravity
                # (Notice gravity is also divided by steps)
                goo[i].xVel += goo[i].forceX / PHYSICS_STEPS;
                goo[i].yVel += (goo[i].forceY - GRAVITY) / PHYSICS_STEPS;

                # --- X MOVEMENT & COLLISION ---
                goo[i].x += goo[i].xVel / PHYSICS_STEPS;
                if TOUCHING_GROUND(goo[i].x, goo[i].y) {
                    local stepped = false;
                    local stepUp = 1;
                    
                    # Try to step up over the slope (GRID_SIZE is 4, so we check up to 5 pixels)
                    repeat GRID_SIZE + 1 {
                        if not stepped {
                            if not TOUCHING_GROUND(goo[i].x, goo[i].y + stepUp) {
                                goo[i].y += stepUp;
                                stepped = true;
                            }
                        }
                        stepUp++;
                    }

                    if not stepped {
                        # If we couldn't step up, it's a true wall. Do the normal bounce.
                        goo[i].x -= goo[i].xVel / PHYSICS_STEPS;
                        goo[i].xVel *= -0.4;
                        goo[i].yVel *= 0.8;

                        # Turn around if we hit a wall
                        if goo[i].state == GooState.Free {
                            goo[i].moveDir = 1 - goo[i].moveDir;
                        }
                    }
                }

                # --- Y MOVEMENT & COLLISION ---
                goo[i].y += goo[i].yVel / PHYSICS_STEPS;
                
                if TOUCHING_GROUND(goo[i].x, goo[i].y) {
                    goo[i].y -= goo[i].yVel / PHYSICS_STEPS;
                    goo[i].yVel *= -0.4;
                    if goo[i].state == GooState.Free {
                        goo[i].xVel *= 0.85;
                    } else {
                        goo[i].xVel *= 0.5;
                    }
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

nowarp proc scanLevel {
    switch_costume "hitbox";
    set_ghost_effect 100;
    show;

    fillWorld;

    local chunkCols = 480 / GRID_SIZE;
    local chunkRows = 360 / GRID_SIZE;
    local chunksX = LEVEL_WIDTH / 480;
    local chunksY = LEVEL_HEIGHT / 360;

    local cy = 0;
    repeat chunksY {
        local cx = 0;
        repeat chunksX {
            # Move the camera in 480/360 increments
            # Chunk 0,0 is at Scroll 0,0 (the origin)
            SCROLL_X = cx * 480;
            SCROLL_Y = cy * 360;
            
            # Update the 'world' sprite position so it's under the scanner
            broadcast_and_wait "display_world";

            scanOneScreen cx, cy, chunkRows, chunkCols;
            cx++;
        }
        cy++;
    }

    # Reset camera to origin
    SCROLL_X = 0;
    SCROLL_Y = 0;
    broadcast_and_wait "display_world";
}

proc fillWorld {
    delete worldGrid;
    repeat COLS * ROWS {
        add 0 to worldGrid;
    }
}

proc scanOneScreen cx, cy, chunkRows, chunkCols {
    local row = 1;
    repeat $chunkRows {
        local col = 1;
        repeat $chunkCols {
            # Standard Scratch screen-space coordinates
            local screenX = (col * GRID_SIZE) - 240 - (GRID_SIZE / 2);
            local screenY = (row * GRID_SIZE) - 180 - (GRID_SIZE / 2);
            
            goto screenX, screenY;
            if touching("world") {
                # Map the local screen scan to the global worldGrid index
                local absoluteCol = ($cx * $chunkCols) + col;
                local absoluteRow = ($cy * $chunkRows) + row;
                worldGrid[(absoluteRow - 1) * COLS + absoluteCol] = 1;
            }
            col++;
        }
        row++;
    }
}

proc handlePipe {
    local pipeX = PIPE[2];
    local pipeY = PIPE[3];
    
    local openRadius = 30;
    local suckRadius = 30;
    local collectRadius = 10;
    local suckForce = 1.5;

    # Check if the pipe should open
    local wasOpen = pipeOpenPrev;
    PIPE_OPEN = false;
    local i = 1;
    repeat length goo {
        if goo[i].state == GooState.Attached {
            if DIST(goo[i].x, goo[i].y, pipeX, pipeY) < openRadius {
                PIPE_OPEN = true;
            }
        }
        i++;
    }

    if PIPE_OPEN and not wasOpen {
        queueSound "suck_begin";
    }
    if not PIPE_OPEN and wasOpen {
        queueSound "suck_end";
    }
    pipeOpenPrev = PIPE_OPEN;

    if PIPE_OPEN {
        pipeLoopTimer--;
        if pipeLoopTimer <= 0 {
            queueSound "suck_loop";
            pipeLoopTimer = 50;  # Play every 4 seconds at 30fps
        }
    } else {
        pipeLoopTimer = 0;
    }

    # Apply suction and collect
    if PIPE_OPEN {
        i = length goo;
        until i < 1 {
            local dist = DIST(goo[i].x, goo[i].y, pipeX, pipeY);
            
            if dist < collectRadius and goo[i].state != GooState.Attached {
                # Gooball reached the center, suck it up
                deleteGoo i;
                queueSound "pipeHit";
                COLLECTED_GOO++;
            } elif dist < suckRadius {
                # Calculate vector towards the pipe
                local dx = pipeX - goo[i].x;
                local dy = pipeY - goo[i].y;
                
                # Apply force (stronger when closer)
                local pullForce = suckForce * (1 - (dist / suckRadius));
                goo[i].xVel += (dx / dist) * pullForce;
                goo[i].yVel += (dy / dist) * pullForce;
                
                # Add damping when being sucked to prevent jiggling at the entrance
                goo[i].xVel *= 0.85;
                goo[i].yVel *= 0.85;
            }
            i--;
        }
    }
}