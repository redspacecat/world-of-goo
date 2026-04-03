list GooBall goo;
list gooConnections;
list GooTypeDef gooTypes;
list GooConn possibleConnections;
list gooConnectionLengths;
list worldGrid;

# temp lists
list possibleNeighbors;
list pipeDataTemp;

enum GooType {
    Black=1,
    Green=2,
    White=3
}

enum GooState {
    Free=1,
    Roaming=2,
    Attached=3
}

# conn = connection
struct GooTypeDef {
    maxConns,
    minConns,
    gooColor,
    connColor,
    isDetachable
}

struct GooBall {
    x=0,
    y=0,
    xVel=0,
    yVel=0,
    forceX=0,
    forceY=0,
    type=GooType.Black,
    state=GooState.Free,
    sourceNode=0,    # The node it's coming from
    targetNode=0,    # The node it's going to
    climbDist=0,     # Pixels traveled along the current strand
    roamTimer=0,      # Timer for random movements
    moveDir=1
}

struct GooConn {
    id,
    distance
}

struct StrandConnection {
    id1,
    id2
}

struct Point {
    x,
    y
}

proc initConstants {
    SPRING_K = 1.25;       # Spring stiffness
    SPRING_DAMPING = 0.8; # How quickly the spring stops bouncing
    DAMPING = 0.98;       # Global air resistance
    GRAVITY = 0.4;        # A single, unified gravity constant
    REST_LENGTH = 60;
    PHYSICS_STEPS = 3;
    MAX_CONNECTIONS = 6;

    GRID_SIZE = 4;
    
    # The math offsets to shift (0,0) to the bottom left of the world
    WORLD_OFFSET_X = 240;
    WORLD_OFFSET_Y = 180;

    initGooType;
}

proc addGooType GooTypeDef def {
    add $def to gooTypes;
}

proc initGooType {
    delete gooTypes;
    addGooType GooTypeDef {gooColor: "#353535", connColor: "#6e6e6e", maxConns: 2, minConns: 1, isDetachable: false};
    addGooType GooTypeDef {gooColor: "#0c6011", connColor: "#20a026", maxConns: 3, minConns: 2, isDetachable: true};
    addGooType GooTypeDef {gooColor: "#dadada", connColor: "#a8a8a8", maxConns: 4, minConns: 2, isDetachable: false};
}