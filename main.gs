costumes "assets/hitbox.svg";
%include std/math
%include std/list

%include code/math
%include code/constants
%include code/renderer
%include code/gooManager
%include code/connectionManager

onflag {
    delete goo;
    delete gooConnections;
    delete gooConnectionLengths;
    initConstants;

    TICK = 0;

    set_ghost_effect 100;

    # addGoo -25, 0, GooTypes.Black;
    # addGoo 25, 0, GooTypes.Black;
    # addGoo -25, 50, GooTypes.Black;
    # addGoo 25, 50, GooTypes.Black;
    # addGooConnection 1, 2, true;
    # addGooConnection 1, 3, true;
    # addGooConnection 1, 4, true;
    # addGooConnection 2, 4, true;
    # addGooConnection 2, 3, true;
    # addGooConnection 3, 4, true;
    addGoo -25, 0, GooTypes.Black;
    addGoo 25, 0, GooTypes.Black;
    addGoo 0, 50, GooTypes.Black;
    addGooConnection 1, 2, true;
    addGooConnection 2, 3, true;
    addGooConnection 3, 1, true;

    selectedGoo = 0;
    selectedCreationGoo = GooTypes.Black;
    pen_up;

    scanLevel;
    forever {
        handleSelection;
        updateGooAI;
        gooPhysics;
        renderGoo;
        TICK++;
    }
}

onkey "space" {
    addGoo mouse_x(), mouse_y(), selectedCreationGoo;
}

onkey "1" {
    selectedCreationGoo = GooTypes.Black;
}
onkey "2" {
    selectedCreationGoo = GooTypes.Green;
}
onkey "3" {
    selectedCreationGoo = GooTypes.White;
}