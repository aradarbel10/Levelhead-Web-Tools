// global parameters
const node_size = {w: 20, h: 20};
const ship_radius = 7;

const ship_color = "#ff0000";
const biome_colors = {
    "maarla": "#1da35e",
    "kistoon": "#e3871e",
    "aqua": "#291978",
    "asteroids": "#660494",
}

const jskey_to_dir = {
    "s": "down",
    "w": "up",
    "a": "left",
    "d": "right",
}

// data modelling map and spaceship
let graph = {
    "123": {
        level_code: "1234567",
        pos: {x: 50, y: 50},
        biome: "maarla",
        connected_to: {
            "right": {
                dest_id: "456",
                locked: false,
            },
            "down": {
                dest_id: "789",
                locked: false,
            }
        },
    },
    "456": {
        level_code: "abcdefg",
        pos: {x: 150, y: 150},
        biome: "aqua",
        connected_to: {
            "up": {
                dest_id: "123",
                locked: false,
            },
            "left": {
                dest_id: "789",
                locked: false,
            }
        },
    },
    "789": {
        level_code: "tuvwxyz",
        pos: {x: 50, y: 150},
        biome: "kistoon",
        connected_to: {
            "up": {
                dest_id: "123",
                locked: false,
            },
            "right": {
                dest_id: "456",
                locked: false,
            }
        },
    }
};

let ship = {
    current_id: "123",
    target_id: "123",
    traveling: false,
    travel_progress: 0,
    pos: {x: 50, y: 50},
};


// update logic
function jumpTo(dest) {
    ship.current_id = dest;
    ship.target_id = dest;
    ship.pos = graph[ship.target_id].pos;
}

const animation_sample = 80;
function travelTo(dest) {
    ship.traveling = true;
    ship.target_id = dest;
    ship.travel_progress = 0;

    let animation = setInterval(() => {
        let t = ease(ship.travel_progress / animation_sample);
        let start = graph[ship.current_id].pos;
        let end = graph[ship.target_id].pos;
        
        ship.pos = lerp(start, end, t);

        ship.travel_progress += 1;

        loadCanvas();
        if (ship.travel_progress >= animation_sample) {
            ship.traveling = false;
            ship.current_id = ship.target_id;
            ship.travel_progress = 0;
            
            console.log("ending anination", ship.travel_progress);

            clearInterval(animation);
        }
    }, 10);
}

const ease_coeff = 2.3;
function ease(ratio) {
    return 1.0 / (1.0 + Math.exp(-ease_coeff * (4.0 * ratio - 2.0)));
}

function lerp(start, end, t) {
    return {x: start.x * (1.0 - t) + end.x * t,
            y: start.y * (1.0 - t) + end.y * t}
}

// rendering
function drawShip(ctx) {
    ctx.fillStyle = ship_color;
    ctx.beginPath();
    ctx.arc(ship.pos.x, ship.pos.y, ship_radius, 0, 2 * Math.PI);
    ctx.fill();
}

function drawNode(ctx, node) {
    ctx.fillStyle = biome_colors[node.biome];
    ctx.fillRect(node.pos.x - node_size.w / 2, node.pos.y - node_size.h / 2,
                node_size.w, node_size.h);
}

function drawMap(ctx) {
    for (const [id, node] of Object.entries(graph)) {
        drawNode(ctx, node);

        for (const [_, neighbor] of Object.entries(node.connected_to)) {
            const next_pos = graph[neighbor.dest_id].pos;   
            
            ctx.strokeStyle = neighbor.locked ? 'black' : 'white';

            ctx.beginPath();
            ctx.moveTo(node.pos.x, node.pos.y);
            ctx.lineTo(next_pos.x, next_pos.y);
            ctx.closePath();
            ctx.stroke();
        }
    }

    drawShip(ctx);
}


function loadCanvas() {
    const canvas = document.getElementById("campaignCanvas");
    const ctx = canvas.getContext('2d');

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawMap(ctx);
}

document.addEventListener('keydown', event => {
    if (ship.traveling) {
        return;
    }

    let dir = jskey_to_dir[event.key];
    if (dir) {
        curr = ship.current_id;
        next = graph[curr].connected_to[dir];

        console.log("moving from", curr, "to", next);
        if (next && !next.locked) {
            travelTo(next.dest_id);
        }
    }
});