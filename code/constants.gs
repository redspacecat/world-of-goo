list GooBall goo;
list gooConnections;
list GooTypeDef gooTypes;
list GooConn possibleConnections;
list gooConnectionLengths;

enum GooTypes {
    Black=1,
    Green=2,
    White=3
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
    type=GooTypes.Black,
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
    SPRING_K = 1.2;       # Spring stiffness
    SPRING_DAMPING = 0.8; # How quickly the spring stops bouncing
    DAMPING = 0.98;       # Global air resistance
    GRAVITY = 0.4;        # A single, unified gravity constant
    REST_LENGTH = 50;
    PHYSICS_STEPS = 5;
    maxConnections = 6;

    initGooTypes;
}

proc initGooTypes {
    add GooTypeDef {gooColor: "#353535", connColor: "#6e6e6e", maxConns: 2, minConns: 1, isDetachable: false} to gooTypes;
    add GooTypeDef {gooColor: "#0c6011", connColor: "#20a026", maxConns: 3, minConns: 2, isDetachable: false} to gooTypes;
    add GooTypeDef {gooColor: "#dadada", connColor: "#a8a8a8", maxConns: 3, minConns: 2, isDetachable: false} to gooTypes;
}