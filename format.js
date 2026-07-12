function format_comparison(comp) {
    switch(comp["mode"]) {
        case "equal": {
            return "exactly " + comp["amount"]
        }
        case "less": {
            return comp["amount"] + " or less"
        }
        case "greater": {
            return comp["amount"] + " or more"
        }
        case "between": {
            return "between " + comp["low"] + " and " + comp["high"]
        }
        // more, if needed
        default: {
            throw new Error("malformed comparison!");
        }
    }
}

function format_condition(cond, cells) {
    switch (cond && cond["type"]) {
        case "and": {
            let res = "";
            const left = format_condition(cond["arg1"], cells);
            const right = format_condition(cond["arg2"], cells);
            if(cond["arg1"]["type"] == "or") res += "(" + left + ")";
            else res += left;
            res += " and "
            if(cond["arg2"]["type"] == "or") res += "(" + right + ")";
            else res += right;
            return res
        }
        case "or": {
            let res = "";
            const left = format_condition(cond["arg1"], cells);
            const right = format_condition(cond["arg2"], cells);
            if (cond["arg1"]["type"] == "and") res += "(" + left + ")";
            else res += left;
            res += " or ";
            if (cond["arg2"]["type"] == "and") res += "(" + right + ")";
            else res += right;
            return res;
        }
        case "isType": {
            let res = "";
            res += cond["not"] ? "is not " : "is ";
            const idx = cond && typeof cond["cell"] !== "undefined" ? cond["cell"] : null;
            res += (cells && cells[idx] ? cells[idx]["name"] : ("#" + idx));
            return res;
        }
        case "hasNeighbors": {
            let res = "";
            res += cond["not"] ? "does not have " : "has ";
            res += format_comparison(cond["comparison"]) + " ";
            const neighborhoodLabels = ["???", "cardinal", "diagonal", "adjacent"];
            res += neighborhoodLabels[cond["neighborhood"]];

            if (Array.isArray(cond["cells"])) {
                for (let i = 0; i < cond["cells"].length; i++) {
                    const cref = cond["cells"][i];
                    const cellIndex = (cref && typeof cref.cell !== "undefined") ? cref.cell : cref;
                    if (i > 0) res += "or ";
                    res += (cells && cells[cellIndex] ? cells[cellIndex]["name"] : ("#" + cellIndex)) + " ";
                }
            } else {
                res += "unknown ";
            }

            res += " neighbors";
            return res;
        }
        case "always": {
            return "exists"
        }
        default: {
            return "???";
        }
    }
}

function format_result(res, cells, chance) {
    let form
    switch(res["type"]) {
        case "become": {
            form = "become " + cells[res["cell"]]["name"];
            break
        }
        default: {
            form = "???"
        }
    }

    if(chance) return "might " + form + " with " + chance + "% chance";
    else return "will " + form;
}

function format_rule(rule, cells) {
    return "If a cell "
         + format_condition(rule["condition"], cells)
         + ", it "
         + format_result(rule["result"], cells, rule["chance"])
         + ".";
}