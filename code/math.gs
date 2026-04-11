func crossProduct(Point A, Point B) {
    return ($A.x * $B.y) - ($A.y * $B.x);
}

func sameSide(Point p1, Point p2, Point a, Point b) {
    local Point vectorAB = Point {x: $b.x - $a.x, y: $b.y - $a.y};

    local cp1 = crossProduct(vectorAB, Point {x: $p1.x - $a.x, y: $p1.y - $a.y});
    local cp2 = crossProduct(vectorAB, Point {x: $p2.x - $a.x, y: $p2.y - $a.y});
    return cp1 * cp2 >= 0;
}

func pointInTriangle(Point p, Point a, Point b, Point c) {
    if sameSide($p, $c, $a, $b)
    and sameSide($p, $a, $b, $c)
    and sameSide($p, $b, $c, $a) {
        return true;
    } else {
        return false;
    }
}

func ccw(Point A, Point B, Point C) {
    return ($C.y-$A.y) * ($B.x-$A.x) > ($B.y-$A.y) * ($C.x-$A.x);
}

func intersect(Point A, Point B, Point C, Point D) {
    # If the points are roughly the same, we can say they're not overlapping
    if DIST($A.x, $A.y, $C.x, $C.y) < 0.1 {return false;}
    if DIST($A.x, $A.y, $D.x, $D.y) < 0.1 {return false;}
    if DIST($B.x, $B.y, $C.x, $C.y) < 0.1 {return false;}
    if DIST($B.x, $B.y, $C.x, $C.y) < 0.1 {return false;}
    return ccw($A, $C, $D) != ccw($B, $C, $D) and ccw($A, $B, $C) != ccw($A, $B, $D);
}