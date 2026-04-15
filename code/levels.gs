proc loadLevel levelNum {
    if $levelNum == 1 {
        setCollisionSize 1, 1, 1;
        setWorldSize 1, 1;
        setPipe "0,90;0,150;100,150;100,200";
        TARGET_GOO = 5;

        makeSquare 0, -120;
        spawnGooBatch 15, GooType.Black, GooState.Free, -50, 50, -50, 50;
    } elif $levelNum == 2 {
        setCollisionSize 2, 1, 2;
        setWorldSize 2, 1;
        setPipe "520,90;520,150;960,150";
        TARGET_GOO = 5;

        makeSquare -20, -25;
        spawnGooBatch 30, GooType.Black, GooState.Free, -180, 0, 10, 100;
        spawnGooBatch 5, GooType.Black, GooState.Sleeping, 550, 630, 0, 0;
    } elif $levelNum == 3 {
        setCollisionSize 1, 2, 2;
        setWorldSize 1, 2;
        setPipe "0,420;0,470;50,470;50,500;20,500;20,600";
        TARGET_GOO = 8;

        STRUCTURE_GRAB_WAIT = 1;

        addGoo -10, -60, GooType.Green;
        addGoo 50, -60, GooType.Green;
        addGoo 20, 0, GooType.Green;
        addGooConnection 1, 2, true;
        addGooConnection 2, 3, true;
        addGooConnection 3, 1, true;
        addGoo -40, 0, GooType.Green;
        addGoo 71, 0, GooType.Green;
        addGooConnection 4, 3, true;
        addGooConnection 4, 1, true;
        addGooConnection 5, 3, true;
        addGooConnection 5, 2, true;
        addGoo -69, -60, GooType.Green;
        addGoo -87, 0, GooType.Green;
        addGooConnection 6, 4, true;
        addGooConnection 6, 1, true;
        addGooConnection 7, 4, true;
        addGooConnection 7, 6, true;
        addGoo -10, -100, GooType.Green;
        addGooConnection 8, 6, true;
        addGooConnection 8, 2, true;
        addGooConnection 8, 1, true;

        spawnGooBatch 10, GooType.Green, GooState.Free, -50, 50, -50, 50;
    } elif $levelNum == 4 {
        setCollisionSize 1, 2, 2;
        setWorldSize 1, 2;
        setStartPos 0, 45;
        setPipe "0,500;0,600";
        TARGET_GOO = 10;

        REST_LENGTH = 70;
        STRUCTURE_GRAB_WAIT = 1;

        addGoo -70, 186, GooType.White;
        addGoo 70, 186, GooType.White;
        addGoo -40, 140, GooType.White;
        addGoo 40, 140, GooType.White;
        addGooConnection 1, 3;
        addGooConnection 2, 4;
        addGooConnection 3, 4;

        spawnGooBatch 30, GooType.White, GooState.Sleeping, -100, 100, -80, -50;
        spawnGooBatch 5, GooType.White, GooState.Free, -120, -70, 195, 200;
        spawnGooBatch 5, GooType.White, GooState.Free, 120, 70, 195, 200;
    } elif $levelNum == 5 {
        setCollisionSize 1, 3, 2;
        setWorldSize 1, 2.5;
        setPipe "0,600;0,1000";
        TARGET_GOO = 15;

        makeTriangle 0, -120;
        spawnGooBatch 170, GooType.Black, GooState.Free, -200, 200, -50, 400;
    }
}

proc makeTriangle x, y, type1=GooType.Black, type2=GooType.Black, type3=GooType.Black {
    addGoo $x - (REST_LENGTH / 2), $y, $type1;
    addGoo $x + (REST_LENGTH / 2), $y, $type2;
    addGoo $x, $y + REST_LENGTH, $type3;
    addGooConnection 1, 2, true;
    addGooConnection 2, 3, true;
    addGooConnection 3, 1, true;
}

proc makeSquare x, y, type1=GooType.Black, type2=GooType.Black, type3=GooType.Black, type4=GooType.Black {
    addGoo $x - (REST_LENGTH / 2 * 0.8), $y, $type1;
    addGoo $x + (REST_LENGTH / 2 * 0.8), $y, $type2;
    addGoo $x - (REST_LENGTH / 2 * 0.8), $y + REST_LENGTH * 0.8, $type3;
    addGoo $x + (REST_LENGTH / 2 * 0.8), $y + REST_LENGTH * 0.8, $type4;
    addGooConnection 1, 2, true;
    addGooConnection 1, 3, true;
    addGooConnection 1, 4, true;
    addGooConnection 2, 4, true;
    addGooConnection 2, 3, true;
    addGooConnection 3, 4, true;
}

proc spawnGooBatch amount, type, state, minX, maxX, minY, maxY {
    repeat $amount {
        addGoo random($minX, $maxX), random ($minY, $maxY), $type, $state;
    }
}

proc setCollisionSize width, height, resolution=4 {
    GRID_SIZE = $resolution;
    LEVEL_WIDTH = 480 * $width;
    LEVEL_HEIGHT = 360 * $height; 
    
    COLS = LEVEL_WIDTH / GRID_SIZE;
    ROWS = LEVEL_HEIGHT / GRID_SIZE;
}

proc setWorldSize width, height {
    CAM_WIDTH = 480 * $width;
    CAM_HEIGHT = 360 * $height; 
}

proc setPipe pipeStr {
    split $pipeStr, ";";
    COPY(split, pipeDataTemp);

    i = 1;
    delete PIPE;
    repeat length pipeDataTemp {
        split pipeDataTemp[i], ",";
        add split[1] to PIPE;
        add split[2] to PIPE;
        i++;
    }

    if PIPE[1] == PIPE[3] {
        if PIPE[2] < PIPE[4] {
            local pipeDir = 0;
        } else {
            local pipeDir = 180;
        }
    } else {
        if PIPE[1] < PIPE[3] {
            local pipeDir = 270;
        } else {
            local pipeDir = 90;
        }
    }

    insert pipeDir at PIPE[1];
}

proc setStartPos x, y {
    SCROLL_X = $x;
    SCROLL_Y = $y;
}