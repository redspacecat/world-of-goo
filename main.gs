costumes "assets/blank.svg";
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
    forever {
        handleSelection;
        gooPhysics;
        renderGoo;
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