proc loadLevel levelNum {
    if $levelNum == 1 {
        setWorldSize 1, 1, 1;
        setPipe "0,90;0,150;100,150;100,200";

        makeSquare 0, -120;
        spawnGooBatch 10, GooType.Black, -50, 50, -50, 50;
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

proc setWorldSize width, height, resolution=4 {
    GRID_SIZE = $resolution;
    LEVEL_WIDTH = 480 * $width;
    LEVEL_HEIGHT = 360 * $height; 
    
    COLS = LEVEL_WIDTH / GRID_SIZE;
    ROWS = LEVEL_HEIGHT / GRID_SIZE;
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