proc moveCamera {
    if mouse_x() > 200 { SCROLL_X += 5; }
    if mouse_x() < -200 { SCROLL_X -= 5; }
    if mouse_y() > 140 { SCROLL_Y += 5; }
    if mouse_y() < -140 { SCROLL_Y -= 5; }

    if mouse_x() > 220 { SCROLL_X += 5; }
    if mouse_x() < -220 { SCROLL_X -= 5; }
    if mouse_y() > 160 { SCROLL_Y += 5; }
    if mouse_y() < -160 { SCROLL_Y -= 5; }
}