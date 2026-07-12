const presets = {}

presets["life"] = {
    "name": "Life",
    "cells": [
        {
            "name": "Dead",
            "color": "#000000"
        },
        {
            "name": "Alive",
            "color": "#ffffff"
        }
    ],
    "rules": [
        {
            "condition": {
                "type": "and",
                "arg1": {
                    "type": "isType",
                    "cell": 0
                },
                "arg2": {
                    "type": "hasNeighbors",
                    "neighborhood": 3,
                    "cells": [
                        {
                            "cell": 1
                        }
                    ],
                    "comparison": {
                        "mode": "equal",
                        "amount": 3
                    }
                }
            },
            "result": {
                "type": "become",
                "cell": 1
            }
        },
        {
            "condition": {
                "type": "and",
                "arg1": {
                    "type": "isType",
                    "cell": 1
                },
                "arg2": {
                    "type": "hasNeighbors",
                    "not": true,
                    "neighborhood": 3,
                    "cells": [1],
                    "comparison": {
                        "mode": "between",
                        "low": 2,
                        "high": 3
                    }
                }
            },
            "result": {
                "type": "become",
                "cell": 0
            }
        }
    ]
}

// add more!!