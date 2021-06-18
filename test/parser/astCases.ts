const cases = [
    { // 0
        input: '1 ** 2 ** 3',
        expected: {
            "type": "ProgramNode",
            "statements": [
                {
                    "type": "PowNode",
                    "left": {
                        "type": "IntNode",
                        "value": 1
                    },
                    "right": {
                        "type": "PowNode",
                        "left": {
                            "type": "IntNode",
                            "value": 2
                        },
                        "right": {
                            "type": "IntNode",
                            "value": 3
                        }
                    }
                }
            ]
        }
    },
    { // 1
        input: '0 * - 1 ** 2 ** 3',
        expected: {
            "type": "ProgramNode",
            "statements": [
                {
                    "type": "MultiplyNode",
                    "left": {
                        "type": "IntNode",
                        "value": 0
                    },
                    "right": {
                        "type": "NegNode",
                        "operand": {
                            "type": "PowNode",
                            "left": {
                                "type": "IntNode",
                                "value": 1
                            },
                            "right": {
                                "type": "PowNode",
                                "left": {
                                    "type": "IntNode",
                                    "value": 2
                                },
                                "right": {
                                    "type": "IntNode",
                                    "value": 3
                                }
                            }
                        }
                    }
                }
            ]
        }
    },
    { // 2
        input: 'a.b[1](1,2)',
        expected: {
            "type": "ProgramNode",
            "statements": [
                {
                    "type": "CallNode",
                    "callee": {
                        "type": "SubscriptionNode",
                        "object": {
                            "type": "AttrRefNode",
                            "object": {
                                "type": "IdentifierNode",
                                "name": "a"
                            },
                            "attr": {
                                "type": "IdentifierNode",
                                "name": "b"
                            }
                        },
                        "args": {
                            "type": "ArgsNode",
                            "args": [
                                {
                                    "type": "IntNode",
                                    "value": 1
                                }
                            ]
                        }
                    },
                    "args": {
                        "type": "ArgsNode",
                        "args": [
                            {
                                "type": "IntNode",
                                "value": 1
                            },
                            {
                                "type": "IntNode",
                                "value": 2
                            }
                        ]
                    }
                }
            ]
        }
    },
    { // 3
        input: 'a = 1 + 2 * 3',
        expected: {
            "type": "ProgramNode",
            "statements": [
                {
                    "type": "AssignNode",
                    "left": {
                        "type": "IdentifierNode",
                        "name": "a"
                    },
                    "right": {
                        "type": "AddNode",
                        "left": {
                            "type": "IntNode",
                            "value": 1
                        },
                        "right": {
                            "type": "MultiplyNode",
                            "left": {
                                "type": "IntNode",
                                "value": 2
                            },
                            "right": {
                                "type": "IntNode",
                                "value": 3
                            }
                        }
                    }
                }
            ]
        }
    },
    { // 4
        input: 'a.b[2] = 5',
        expected: {
            "type": "ProgramNode",
            "statements": [
                {
                    "type": "AssignNode",
                    "left": {
                        "type": "SubscriptionNode",
                        "object": {
                            "type": "AttrRefNode",
                            "object": {
                                "type": "IdentifierNode",
                                "name": "a"
                            },
                            "attr": {
                                "type": "IdentifierNode",
                                "name": "b"
                            }
                        },
                        "args": {
                            "type": "ArgsNode",
                            "args": [
                                {
                                    "type": "IntNode",
                                    "value": 2
                                }
                            ]
                        }
                    },
                    "right": {
                        "type": "IntNode",
                        "value": 5
                    }
                }
            ]
        }
    },
    { // 5
        input: '#1234\n   \t    \n  #123',
        expected: { "type": "ProgramNode", "statements": [] }
    }
];

export { cases };
