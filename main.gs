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
    hide;
    broadcast "title_screen";
}

on "init" {
    broadcast_and_wait "init_constants";
    broadcast_and_wait "init_game";
    broadcast "start_game";
}

on "init_constants" {
    initConstants;
}

on "init_game" {
    delete goo;
    delete gooConnections;
    delete gooConnectionLengths;
    delete SOUND_QUEUE;

    TICK = 0;
    SCROLL_X = 0;
    SCROLL_Y = 0;
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
    erase_all;

    scanLevel;
    switch_costume "renderbox";
    clear_graphic_effects;
    hide;
}

on "start_game" {
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

on "stop_game" {
    stop_other_scripts;
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