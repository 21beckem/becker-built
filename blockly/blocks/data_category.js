TOOLBOX.contents.push({
    "kind": "category",
    "name": "Data",
    "colour": 60,
    "contents": [
        {
            "kind": "block",
            "type": "fetch_url"
        },
        {
            "kind": "block",
            "type": "json_parse"
        },
        {
            "kind": "block",
            "type": "json_stringify"
        }
    ]
});

// ---- Fetch Block ----
CUSTOM_BLOCKS.push({
    "type": "fetch_url",
    "colour": 60,
    "tooltip": "Fetches data from a URL. The \"On Return\" section will run asynchronously!",
    "helpUrl": "",
    "message0": "Fetch   . %1 Is JSON? %2 %3 .   url %4 On Return %5 %6",
    "args0": [
        {
            "type": "input_dummy",
            "name": "NAME"
        },
        {
            "type": "field_checkbox",
            "name": "isJsonOrNo",
            "checked": "FALSE"
        },
        {
            "type": "input_dummy",
            "name": "toJsonOrNo"
        },
        {
            "type": "input_value",
            "name": "url",
            "check": "String"
        },
        {
            "type": "field_variable",
            "name": "returnTxtOrJson",
            "variable": "data"
        },
        {
            "type": "input_statement",
            "name": "NAME"
        }
    ],
    "previousStatement": null,
    "nextStatement": null,
    "inputsInline": true
});
Blockly.JavaScript.forBlock['fetch_url'] = function (block) {
    const checkbox_isJsonOrNo = block.getFieldValue('isJsonOrNo');

    // TODO: change Order.ATOMIC to the correct operator precedence strength
    const value_url = Blockly.JavaScript.valueToCode(block, 'url', javascript.Order.ATOMIC);

    const variable_returntxtorjson = Blockly.JavaScript.getVariableName(block.getFieldValue('returnTxtOrJson'));
    const statement_name = Blockly.JavaScript.statementToCode(block, 'NAME');

    // TODO: Assemble javascript into the code variable.
    const code = '...';
    return code;
}


// ---- JSON Parse ----
CUSTOM_BLOCKS.push({
    "type": "json_parse",
    "message0": "parse JSON %1",
    "args0": [
        {
            "type": "input_value",
            "name": "TEXT",
            "check": "String"
        }
    ],
    "output": 'json',
    "colour": 60,
    "tooltip": "Parse a JSON string into a JavaScript object.",
    "helpUrl": ""
});
Blockly.JavaScript.forBlock['json_parse'] = function (block) {
    var textCode = Blockly.JavaScript.valueToCode(block, 'TEXT', Blockly.JavaScript.ORDER_ATOMIC) || "''";
    let code = `JSON.parse(${textCode})`;
    return [code, Blockly.JavaScript.ORDER_FUNCTION_CALL];
};


// ---- JSON Stringify ----
CUSTOM_BLOCKS.push({
    "type": "json_stringify",
    "message0": "stringify JSON %1",
    "args0": [
        {
            "type": "input_value",
            "name": "VALUE"
        }
    ],
    "output": "String",
    "colour": 60,
    "tooltip": "Convert an object/value to a JSON string.",
    "helpUrl": ""
});
Blockly.JavaScript.forBlock['json_stringify'] = function (block) {
    var valueCode = Blockly.JavaScript.valueToCode(block, 'VALUE', Blockly.JavaScript.ORDER_ATOMIC) || '{}';
    let code = `JSON.stringify(${valueCode})`;
    return [code, Blockly.JavaScript.ORDER_FUNCTION_CALL];
};