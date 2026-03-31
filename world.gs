costumes "assets/cool-world.svg", "assets/giant-square.svg";

on "display_world" {
    switch_costume "giant-square";
    goto -SCROLL_X, -SCROLL_Y;
    switch_costume "cool-world";
}