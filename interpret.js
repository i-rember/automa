function interpret_comparison(comparison, x) {
    switch(comparison["mode"]) {
        case "equal": {
            return x == comparison["amount"]
        }
        case "less": {
            return x <= comparison["amount"]
        }
        case "greater": {
            return x >= comparison["amount"]
        }
        case "between": {
            return x >= comparison["low"] && x <= comparison["high"]
        }
        // more, if needed
        default: {
            throw new Error("malformed comparison!");
        }
    }
}

function interpret_condition(condition, x, y) {
    let result;

    switch(condition["type"]) {
        case "and": {
            result = interpret_condition(condition["arg1"], x, y)
                && interpret_condition(condition["arg2"], x, y);
            break;
        }
        case "or": {
            result = interpret_condition(condition["arg1"], x, y)
                || interpret_condition(condition["arg2"], x, y);
            break;
        }
        case "isType": {
            result = state[y][x] == condition["cell"];
            break;
        }
        case "hasNeighbors": {
            let neighborhood = condition["neighborhood"]
            let neighbors = 0

            const cardinal = [
                [0, -1], // N
                [1, 0],  // E
                [0, 1],  // S
                [-1, 0]  // W
            ];
            const diagonal = [
                [-1, -1], // NW
                [1, -1],  // NE
                [1, 1],   // SE
                [-1, 1]   // SW
            ];
            let choices = []
            if(neighborhood & 1) {
                for(const off of cardinal) {
                    choices.push(off)
                }
            }
            if(neighborhood & 2) {
                for(const off of diagonal) {
                    choices.push(off)
                }
            }

            for (const off of choices) {
                const nx = x + off[0], ny = y + off[1];
                if (ny >= 0 && ny < state.length && nx >= 0 && nx < state[0].length) {
                    const neighborCell = state[ny][nx];
                    const cellsRef = condition["cells"];

                    if (Array.isArray(cellsRef) && cellsRef.length > 0) {
                        // negation encoded as ["not", {cell: N}] or ["not", N]
                        if (cellsRef[0] === "not") {
                            const ref = cellsRef[1];
                            const idx = (ref && typeof ref.cell !== 'undefined') ? ref.cell : ref;
                            if (neighborCell != idx) {
                                neighbors++;
                            }
                        } else {
                            for (const cref of cellsRef) {
                                const idx = (cref && typeof cref.cell !== 'undefined') ? cref.cell : cref;
                                if (neighborCell == idx) {
                                    neighbors++;
                                    break;
                                }
                            }
                        }
                    }
                }
            }

            result = interpret_comparison(condition["comparison"], neighbors)
            break;
        }
        case "always": {
            result = true
            break;
        }
        // more, if needed
        default: {
            throw new Error("malformed condition!");
        }
    }

    if(condition["not"]) {
        return !result;
    }

    return result;
}

function interpret_rule(rule, x, y, newState) {
    if(rule["chance"] && Math.random() >= rule["chance"] / 100) return false;

    if(!interpret_condition(rule["condition"], x, y)) return false;

    switch(rule["result"]["type"]) {
        case "become": {
            newState[y][x] = rule["result"]["cell"];
            return true;
        }
        // more, if needed
        default: {
            throw new Error("malformed result!");
        }
    }
}