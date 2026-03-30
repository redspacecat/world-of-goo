costumes "assets/hitbox.svg", "assets/renderbox.svg";

%define MOUSE_X mouse_x() + SCROLL_X
%define MOUSE_Y mouse_y() + SCROLL_Y
%define GOTO(xPos, yPos) goto xPos - SCROLL_X, yPos - SCROLL_Y
%define TOUCHING_GROUND(gridX, gridY) worldGrid[(gridY - 1) * COLS + gridX] == 1
%define TOUCHING_GROUND_XY(xPos, yPos) worldGrid[((floor((yPos + WORLD_OFFSET_Y) / GRID_SIZE) + 1) - 1) * COLS + (floor((xPos + WORLD_OFFSET_X) / GRID_SIZE) + 1)] == 1
%define IS_GOO_ONSCREEN(id) abs(goo[id].x - SCROLL_X) < 240 + 20 and abs(goo[id].y - SCROLL_Y) < 180 + 20

%include std/math
%include std/list

%include code/math
%include code/constants
%include code/renderer
%include code/camera
%include code/gooManager
%include code/connectionManager

onflag {
    delete goo;
    delete gooConnections;
    delete gooConnectionLengths;
    initConstants;

    TICK = 0;
    SCROLL_X = 0;
    SCROLL_Y = 0;

    # addGoo -25, 0, GooType.Black;
    # addGoo 25, 0, GooType.Black;
    # addGoo -25, 50, GooType.Black;
    # addGoo 25, 50, GooType.Black;
    # addGooConnection 1, 2, true;
    # addGooConnection 1, 3, true;
    # addGooConnection 1, 4, true;
    # addGooConnection 2, 4, true;
    # addGooConnection 2, 3, true;
    # addGooConnection 3, 4, true;
    addGoo -25, 0, GooType.Black;
    addGoo 25, 0, GooType.Black;
    addGoo 0, 50, GooType.Black;
    addGooConnection 1, 2, true;
    addGooConnection 2, 3, true;
    addGooConnection 3, 1, true;

    selectedGoo = 0;
    selectedCreationGoo = GooType.Black;
    pen_up;

    scanLevel;
    switch_costume "renderbox";
    clear_graphic_effects;
    hide;

    forever {
        moveCamera;
        handleSelection;
        updateGooAI;
        gooPhysics;
        renderGoo;
        broadcast_and_wait "display_world";
        TICK++;
    }
}

onkey "space" {
    addGoo MOUSE_X, MOUSE_Y, selectedCreationGoo;
}

onkey "1" {
    selectedCreationGoo = GooType.Black;
}
onkey "2" {
    selectedCreationGoo = GooType.Green;
}
onkey "3" {
    selectedCreationGoo = GooType.White;
}