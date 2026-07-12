const canvas = document.getElementById('cellsCanvas');
const ctx = canvas.getContext('2d');

let state = []
let tickSpeed = 30;
let playInterval = setInterval(tick, 1000 / tickSpeed);

let cells = [];
let rules = [];

function load_preset(id) {
    if (!presets || !presets[id]) {
        throw new Error("invalid preset!");
    }

    const preset = presets[id];

    if (!preset.cells || !preset.rules) {
        throw new Error("malformed preset!");
    }

    cells = preset.cells;
    rules = preset.rules;

    const cell_list = document.getElementById("cells");
    const rule_list = document.getElementById("rules");

    cell_list.innerHTML = "";
    rule_list.innerHTML = "";

    for (const cell of cells) {
        const li = document.createElement("li");
        li.textContent = `${cell.name}: ${cell.color}`;
        cell_list.appendChild(li);
    }

    for (const rule of rules) {
        const li = document.createElement("li");
        li.textContent = format_rule(rule, cells);
        rule_list.appendChild(li);
    }
}

function populatePresetMenu() {
    const select = document.getElementById("presetSelect");
    if (!select || !presets) return;
    select.innerHTML = Object.keys(presets)
        .map(key => `<option value="${key}">${presets[key].name || key}</option>`)
        .join("");
}

function applySelectedPreset() {
    const select = document.getElementById("presetSelect");
    if (!select) return;
    load_preset(select.value);
    reset(128, 128);
}

document.addEventListener("DOMContentLoaded", function () {
    var speedRange = document.getElementById("speedRange");
    var speedValue = document.getElementById("speedValue");
    if (speedRange && speedValue) {
        speedRange.addEventListener("input", function () {
            setTickSpeed(Number(this.value));
            speedValue.textContent = tickSpeed;
        });
    };
    populatePresetMenu();
    const firstKey = presets ? Object.keys(presets)[0] : null;
    if (firstKey) load_preset(firstKey);
    reset(128, 128);
    fill_with_noise(0.25);
});

function reset(width = null, height = null) {
    if(width == null) width = canvas.width
    if(height == null) height = canvas.height

    canvas.width = width;
    canvas.height = height;
    canvas.style.width = "500px";
    canvas.style.height = "500px";

    state = Array.from({ length: height }, () => Array(width).fill(0));

    update()
}

function update() {
    for (let y = 0; y < state.length; y++) {
        for (let x = 0; x < state[y].length; x++) {
            ctx.fillStyle = cells[state[y][x]].color;
            ctx.fillRect(x, y, 1, 1);
        }
    }
}

function fill_with_noise(chance = 0.5) {
    reset()

    for (let y = 0; y < state.length; y++) {
        for (let x = 0; x < state[y].length; x++) {
            if(Math.random() < chance) {
                new_type = randint(1, cells.length - 1)
                state[y][x] = new_type;
            }
        }
    }

    update()
}

function randint(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function play() {
    if (playInterval) return;
    playInterval = setInterval(tick, 1000 / tickSpeed);
}

function pause() {
    if (!playInterval) return;
    clearInterval(playInterval);
    playInterval = null;
}

function setTickSpeed(value) {
    tickSpeed = value;
    if (playInterval) {
        clearInterval(playInterval);
        playInterval = setInterval(tick, 1000 / tickSpeed);
    }
}

function tick() {
    const newState = state.map(row => row.slice());

    for (let y = 0; y < state.length; y++) {
        for (let x = 0; x < state[y].length; x++) {
            let applied = false;
            for (const rule of rules) {
                applied = interpret_rule(rule, x, y, newState)
                if(applied) break;
            }
            if (!applied) {
                newState[y][x] = state[y][x];
            }
        }
    }

    state = newState;
    update();
}