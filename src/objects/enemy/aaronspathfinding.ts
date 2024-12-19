// "use strict";

// /*
// class for pathfinding algorithm
// uses goal-based pathfinding
// steps:
// 1. create heatmap: for each tile, create the minimum distance from tile to goal
// 2. create vector field: for each tile, create vectors pointing to the path of minimum distance
// 3. use vector field to make enemies travel towards player
// */

// class PathfindingAlgorithm {
//     // create an array for all the surrounding nodes of a node (straight & diagonal)
//     static NEIGHBOURS = [
//         new Vector2(1, 0),
//         new Vector2(1, 1),
//         new Vector2(0, 1),
//         new Vector2(-1, 1),
//         new Vector2(-1, 0),
//         new Vector2(-1, -1),
//         new Vector2(0, -1),
//         new Vector2(1, -1)
//     ];
//     constructor(target, maxDistance, arena) {
//         this.target = target;
//         this.roundedTarget = new Vector2(Math.floor(this.target.getX()), Math.floor(this.target.getY())); // set target (x & y must be integer values)
//         this.maxDistance = maxDistance; // find a distance value to stop generating the heatmap at
//         this.arena = arena; // get the arena to determine which node is a wall
//         this.heatmap = {}; // create a dictionary to store all distance values
//     }

//     // function to generate heatmap (a object with coordinates corresponding to their distance from end node)
//     generateHeatMap() {
//         /*
//         to generate heatmap:
//         - start at ending node (this will be the investigated node)
//         - for each neighbour node (nodes around node being investigated), calculate distance from that node to ending node using euclidian distances
//             - if the node happens to have a wall, set node to very large distance (65535 is used)
//             - if the node has already been checked, only set node distance if the calculated node distance is less than that of previous calculated
//         - change node being investigated
//         - repeat until whole map is covered or until no more nodes can be checked without exceeding distance limit
//         */
//         this.heatmap = {}; // clear heatmap

//         // create variables to determine which node should be investigated
//         let currentX = this.roundedTarget.getX();
//         let currentY = this.roundedTarget.getY();

//         // create distance variable & set to 0
//         let distance = 0;

//         // create array of nodes to be checked
//         let unvisitedNodes = [];
//         this.heatmap[this.roundedTarget.toString()] = distance; // add ending node to array of unvisited nodes and to heatmap
//         arrayPush(unvisitedNodes, this.roundedTarget);

//         // repeat while there is still nodes to check
//         while (unvisitedNodes.length != 0) {
//             for (let node of PathfindingAlgorithm.NEIGHBOURS) { // iterate through each neighbour node
//                 let point = new Vector2(currentX + node.getX(), currentY + node.getY()); // get coordinates of neighbour node
//                 let pointString = point.toString(); // get string representation of node to put in object
//                 if (!this.arena.isWall(point)) { // check if tile is a wall
//                     let distanceFromPoint = (node.getX() != 0 && node.getY() != 0) ? distance + Math.SQRT2: distance + 1; // calculate distance from ending node by adding to current distance (sqrt2 if diagonal, 1 if straight (euclidian distances))
//                     if (distanceFromPoint <= this.maxDistance) { // check if distance in within distance limit
//                         if (arrayIncludes(Object.keys(this.heatmap), point.toString())) { // check if the node's distance has already been calculated once by checking if the tile exists on the heatmap
//                             if (this.heatmap[pointString] > distanceFromPoint) { // check if the distance just calculated is less than the distance calculated prior
//                                 this.heatmap[pointString] = distanceFromPoint; // add tile to heatmap with the distance that corresponds
//                                 arrayPush(unvisitedNodes, point); // add tile to nodes whose neighbour nodes need to be checked
//                             }
//                         } else { // otherwise, node is new and we can add the distance to the heatmap without worrying about the previous distance
//                             this.heatmap[pointString] = distanceFromPoint; // add tile to heatmap with the distance that corresponds
//                             arrayPush(unvisitedNodes, point); // add tile to nodes whose neighbour nodes need to be checked
//                         }
//                     }
//                 } else { // otherwise, tile is a wall
//                     this.heatmap[pointString] = 65535; // add tile to heatmap with extremely large distance so that the algorithm pathfinds out of the wall
//                     // we don't need to add this tile to the list of unvisited nodes since it is a wall
//                 }
//             }
//             arrayDelete(unvisitedNodes, 0); // delete the old node
//             // check if the list of unvisited nodes is empty
//             if (unvisitedNodes.length != 0) {
//                 // if not,
//                 let newNode = unvisitedNodes[0]; // change to a new node that needs to be checked
//                 distance = this.heatmap[newNode]; // get the new distance
//                 currentX = newNode.getX(); // get new coordinates of node
//                 currentY = newNode.getY();
//             }
//         }
//     }

//     // function to get a unit vector in the direction of closest path
//     getVector(node) {
//         // generate a heatmap if it does not exist yet
//         if (this.heatmap == undefined || this.heatmap == []) { // check if the heatmap exists
//             this.generateHeatMap(); // generate new heatmap if it does not
//         }
//         let neighbourVectors = []; // create a array to store neighbouring vectors
//         for (let i = 0; i < PathfindingAlgorithm.NEIGHBOURS.length; i++) { // iterate through neighbouring nodes
//             let relativeNode = PathfindingAlgorithm.NEIGHBOURS[i]; // get coordinates of vector relative to node
//             let coords = node.add(relativeNode); // get absolute coordinates of node
//             let coordsString = coords.toString(); // get string representation of coords to put in heatmap
//             if (arrayIncludes(Object.keys(this.heatmap), coordsString)) { // check if the coordinates have been generated by heatmap
//                 let distance = this.heatmap[coordsString]; // get the corresponding distance associated with the coordinate with heatmap
//                 let vector = Vector2.fromPolarForm(Math.E ** (-1 * distance), i * 0.25 * Math.PI); // get a vector in the direction of the vector & run it through a decreasing function (y = e^-x) to make it so the vector gets shorter the further it is from the endnode
//                 arrayPush(neighbourVectors, vector); // add vector to array containing neighbouring vectors
//             }
//         }
//         // create new zero vector to add all vectors together
//         let vector = Vector2.ZERO_VECTOR;
//         for (let v of neighbourVectors) { // iterate through all neighbouring vectors
//             vector = vector.add(v); // add together
//         }
//         return vector.unit(); // return the resultant vector (and make it a unit vector)
//     }

 
//     // method to switch targets
//     setTarget(target) {
//         // check if the target is different from the previous target so that we don't have to generate another heatmap if the target is the same
//         if (!this.roundedTarget.equals(target)) {
//             this.target = target;
//             this.roundedTarget = new Vector2(Math.floor(this.target.getX()), Math.floor(this.target.getY())); 
//             this.generateHeatMap(); // generate new heatmap
//         }
//     }

//     // method to set the max distance the heatmap will generate
//     setMaxDistance(maxDistance) {
//         this.maxDistance = maxDistance; // set max distance
//     }

//     // method to get the target of the algorithm
//     getTarget() {
//         return this.target; // return the target of the algorithm
//     }

//     // method to get the max distance the heatmap will generate
//     getMaxDistance() {
//         return this.maxDistance; // return max distance
//     }
// }