function makeComponentCategory() {
    return {
        "kind": "category",
        "name": "Page Components",
        "contents": []
    }
}
TOOLBOX.contents.push({
    "kind": "category",
    "name": "Page Components",
    "colour": 60,
    "contents": [
        makeComponentCategory(),
        makeComponentCategory(),
        makeComponentCategory(),
        makeComponentCategory(),
        makeComponentCategory()
    ]
});

// ---- Fetch Block ----
CUSTOM_BLOCKS.push({
    "type": "fetch_url",
    "tooltip": "Fetches data from a URL. The \"On Return\" section will run asynchronously!",
    "helpUrl": "",
    "message0": "Fetch %1 url %2 On Return %3 %4",
    "args0": [
        {
            "type": "input_dummy",
            "name": "dummy1"
        },
        {
            "type": "input_value",
            "name": "url",
            "check": "String"
        },
        {
            "type": "field_variable",
            "name": "returnedData",
            "variable": "data"
        },
        {
            "type": "input_statement",
            "name": "onReturnStatement"
        }
    ],
    "previousStatement": null,
    "nextStatement": null,
    "colour": 60,
    "inputsInline": true
});
Blockly.JavaScript.forBlock['fetch_url'] = function (block, generator) {
    // TODO: change Order.ATOMIC to the correct operator precedence strength
    const value_url = generator.valueToCode(block, 'url', javascript.Order.ATOMIC);
    
    const variable_returnedData = generator.getVariableName(block.getFieldValue('returnedData'));
    
    const statement_onReturnStatement = generator.statementToCode(block, 'onReturnStatement');

    // TODO: Assemble javascript into the code variable.
    return `fetch(${value_url}).then(response=>response.text()).then(${variable_returnedData} => {\n${statement_onReturnStatement}})`;
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
Blockly.JavaScript.forBlock['json_parse'] = function (block, generator) {
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
Blockly.JavaScript.forBlock['json_stringify'] = function (block, generator) {
    var valueCode = Blockly.JavaScript.valueToCode(block, 'VALUE', Blockly.JavaScript.ORDER_ATOMIC) || '{}';
    let code = `JSON.stringify(${valueCode})`;
    return [code, Blockly.JavaScript.ORDER_FUNCTION_CALL];
};


// ---- JSON Object ----
CUSTOM_BLOCKS.push({
    "type": "JSON_object",
    "message0": "{ %1 %2 }",
    "args0": [
        {
            "type": "input_dummy"
        },
        {
            "type": "input_statement",
            "name": "MEMBERS",
            "check": "JSON_item"
        }
    ],
    "output": null,
    "colour": 60
});
Blockly.JavaScript.forBlock['JSON_object'] = function(block, generator) {
  const statementMembers = generator.statementToCode(block, 'MEMBERS');
  const code = '{\n' + statementMembers.slice(0, -2) + '\n}';
  return [code, Blockly.JavaScript.ORDER_ATOMIC];
};


// ---- JSON Object ----
CUSTOM_BLOCKS.push({
  "type": "JSON_item",
  "message0": "%1 %2 %3",
  "args0": [
    {
      "type": "field_input",
      "name": "MEMBER_NAME",
      "text": ""
    },
    {
      "type": "field_label",
      "name": "COLON",
      "text": ":"
    },
    {
      "type": "input_value",
      "name": "MEMBER_VALUE"
    }
  ],
  "previousStatement": null,
  "nextStatement": null,
  "colour": 60
});
Blockly.JavaScript.forBlock['JSON_item'] = function(block, generator) {
  const name = JSON.stringify( block.getFieldValue('MEMBER_NAME') ).slice(1, -1);
  const value = generator.valueToCode(block, 'MEMBER_VALUE', Blockly.JavaScript.ORDER_ATOMIC);
  const code = `"${name}": ${value},\n`;
  return code;
};