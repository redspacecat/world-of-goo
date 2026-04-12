proc moveCamera {
    if mouse_x() > 200 { SCROLL_X += 5; }
    if mouse_x() < -200 { SCROLL_X -= 5; }
    if mouse_y() > 140 { SCROLL_Y += 5; }
    if mouse_y() < -140 { SCROLL_Y -= 5; }

    if mouse_x() > 220 { SCROLL_X += 5; }
    if mouse_x() < -220 { SCROLL_X -= 5; }
    if mouse_y() > 160 { SCROLL_Y += 5; }
    if mouse_y() < -160 { SCROLL_Y -= 5; }

    if SCROLL_X < 0 { 
        SCROLL_X = 0; 
    }
    if SCROLL_X > CAM_WIDTH - 480 { 
        SCROLL_X = CAM_WIDTH - 480; 
    }

    if SCROLL_Y < 0 { 
        SCROLL_Y = 0; 
    }
    if SCROLL_Y > CAM_HEIGHT - 360 { 
        SCROLL_Y = CAM_HEIGHT - 360; 
    }
}