proc moveCamera {
    if mouse_down() {
        edgeScrollLocked = true;

        if selectedGoo == 0 {
            if not wasCamDragging {
                Point lastCamPos = Point {x: mouse_x(), y: mouse_y()};
                Vel camVel = Vel {x: 0, y: 0};
                wasCamDragging = true;
            } else {
                local Point currentPos = Point {x: mouse_x(), y: mouse_y()};
                
                local dx = lastCamPos.x - currentPos.x;
                local dy = lastCamPos.y - currentPos.y;
                
                SCROLL_X += dx;
                SCROLL_Y += dy;
                
                camVel.x = dx;
                camVel.y = dy;
                
                lastCamPos.x = currentPos.x;
                lastCamPos.y = currentPos.y;
            }
        }
    } else {
        wasCamDragging = false;
        
        SCROLL_X += camVel.x;
        SCROLL_Y += camVel.y;
        
        camVel.x *= 0.85;
        camVel.y *= 0.85;
        
        if abs(camVel.x) < 0.1 { camVel.x = 0; }
        if abs(camVel.y) < 0.1 { camVel.y = 0; }

        if abs(mouse_x()) < 190 and abs(mouse_y()) < 130 {
            edgeScrollLocked = false;
        }
    }

    if not wasCamDragging and (not edgeScrollLocked or selectedGoo > 0) {
        if mouse_x() > 200 { SCROLL_X += 5; }
        if mouse_x() < -200 { SCROLL_X -= 5; }
        if mouse_y() > 140 { SCROLL_Y += 5; }
        if mouse_y() < -140 { SCROLL_Y -= 5; }

        if mouse_x() > 220 { SCROLL_X += 5; }
        if mouse_x() < -220 { SCROLL_X -= 5; }
        if mouse_y() > 160 { SCROLL_Y += 5; }
        if mouse_y() < -160 { SCROLL_Y -= 5; }
    }

    if SCROLL_X < 0 { SCROLL_X = 0; camVel.x = 0; }
    if SCROLL_X > CAM_WIDTH - 480 { SCROLL_X = CAM_WIDTH - 480; camVel.x = 0; }
    if SCROLL_Y < 0 { SCROLL_Y = 0; camVel.y = 0; }
    if SCROLL_Y > CAM_HEIGHT - 360 { SCROLL_Y = CAM_HEIGHT - 360; camVel.y = 0; }
}