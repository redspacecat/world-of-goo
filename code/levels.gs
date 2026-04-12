proc loadLevel levelNum {
    if $levelNum == 1 {
        setCollisionSize 1, 1, 1;
        setWorldSize 1, 1;
        setPipe "0,90;0,150;100,150;100,200";

        makeSquare 0, -120;
        spawnGooBatch 10, GooType.Black, -50, 50, -50, 50;
    } elif $levelNum == 2 {
        setCollisionSize 2, 1, 2;
        setWorldSize 2, 1;
        setPipe "520,90;520,150;960,150";

        makeSquare -20, -25;
        spawnGooBatch 30, GooType.Black, -180, 0, 10, 100;
    } elif $levelNum == 3 {
        setCollisionSize 1, 2, 2;
        setWorldSize 1, 2;
        setPipe "0,420;0,470;50,470;50,500;20,500;20,600";

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
        addGoo -88, 0, GooType.Green;
        addGooConnection 6, 4, true;
        addGooConnection 6, 1, true;
        addGooConnection 7, 4, true;
        addGooConnection 7, 6, true;
        addGoo -10, -100, GooType.Green;
        addGooConnection 8, 6, true;
        addGooConnection 8, 2, true;
        addGooConnection 8, 1, true;

        spawnGooBatch 10, GooType.Green, 0, 0, 0, 0;
    } elif $levelNum == 4 {
        setCollisionSize 1, 3, 2;
        setWorldSize 1, 2.5;
        setPipe "0,650;0,1000";

        makeTriangle 0, -120;
        spawnGooBatch 150, GooType.Black, -200, 200, -50, 400;
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
    addGoo $x - (REST_LENGTH / 2), $y, $type1;
    addGoo $x + (REST_LENGTH / 2), $y, $type2;
    addGoo $x - (REST_LENGTH / 2), $y + REST_LENGTH, $type3;
    addGoo $x + (REST_LENGTH / 2), $y + REST_LENGTH, $type4;
    addGooConnection 1, 2, true;
    addGooConnection 1, 3, true;
    addGooConnection 1, 4, true;
    addGooConnection 2, 4, true;
    addGooConnection 2, 3, true;
    addGooConnection 3, 4, true;
}

proc spawnGooBatch amount, type, minX, maxX, minY, maxY {
    repeat $amount {
        addGoo random($minX, $maxX), random ($minY, $maxY), $type;
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