proc addGoo x, y, type {
    add GooBall {x: $x, y: $y, type: $type} to goo;
    repeat maxConnections {
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
                    goo[i].yVel *= -0.4;
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