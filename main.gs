costumes "assets/images/hitbox.svg", "assets/images/renderbox.svg";

%define MOUSE_X mouse_x() + SCROLL_X
%define MOUSE_Y mouse_y() + SCROLL_Y
%define GOTO(xPos, yPos) goto xPos - SCROLL_X, yPos - SCROLL_Y
%define TOUCHING_GROUND_GRID(gridX, gridY) worldGrid[(gridY - 1) * COLS + gridX] == 1
%define TOUCHING_GROUND(xPos, yPos) worldGrid[((floor((yPos + WORLD_OFFSET_Y) / GRID_SIZE) + 1) - 1) * COLS + (floor((xPos + WORLD_OFFSET_X) / GRID_SIZE) + 1)] == 1
%define IS_GOO_ONSCREEN(id) abs(goo[id].x - SCROLL_X) < 240 + 20 and abs(goo[id].y - SCROLL_Y) < 180 + 20

%include std/math
%include std/list
%include std/string

%include code/math
%include code/constants
%include code/renderer
%include code/camera
%include code/gooManager
%include code/connectionManager
%include code/levels
%include code/utils

onflag {
    delete goo;
    delete gooConnections;
    delete gooConnectionLengths;
    initConstants;

    TICK = 0;
    SCROLL_X = 0;
    SCROLL_Y = 0;
    LEVEL_NUM = 4;
    PIPE_OPEN = false;
    COLLECTED_GOO = 0;
    GAME_STARTED = false;
    
    wasMouseDown = false;
    pipeOpenPrev = false;
    dragDistance = 0;
    pipeLoopTimer = 0;

    loadLevel(LEVEL_NUM);

    selectedGoo = 0;
    selectedCreationGoo = GooType.Black;
    pen_up;

    scanLevel;
    switch_costume "renderbox";
    clear_graphic_effects;
    hide;

    broadcast "start_game";
    GAME_STARTED = true;

    forever {
        moveCamera;
        handleSelection;
        updateGooAI;
        handlePipe;
        gooPhysics;

        erase_all;
        broadcast "display_background";
        broadcast "display_world";
        broadcast "display_goo";
        TICK++;
    }
}

on "display_goo" {
    renderGoo;
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