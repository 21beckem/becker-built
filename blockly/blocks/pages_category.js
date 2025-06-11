TOOLBOX.contents.push({
    "kind": "category",
    "name": "Pages",
    "colour": "black",
    "contents": [
        {
            "kind": "block",
            "type": "page_select"
        },
        {
            "kind": "block",
            "type": "get_page_start_value"
        },
        {
            "kind": "block",
            "type": "open_page"
        },
        {
            "kind": "block",
            "type": "open_page_with_start_value"
        }
    ]
});



// ---- Page Select ----
CUSTOM_BLOCKS.push({
    "type": "page_select",
    "tooltip": "",
    "colour": "#575757",
    "message0": "Page %1 %2",
    "args0": [
        {
            "type": "field_dropdown",
            "name": "page_select",
            "options": [
                [
                    "pageName",
                    "maybe_the_page_id.html"
                ]
            ]
        },
        {
            "type": "input_dummy",
            "name": "0"
        }
    ],
    "output": "page"
});
Blockly.JavaScript.forBlock['page_select'] = function (block, generator) {
    const dropdown_page_select = block.getFieldValue('page_select');
    
    return [dropdown_page_select, javascript.Order.NONE];
}



// ---- Open Page ----
CUSTOM_BLOCKS.push({
    "type": "open_page",
    "tooltip": "",
    "message0": "Open page %1",
    "args0": [
        {
            "type": "input_value",
            "name": "new_page",
            "check": "page"
        }
    ],
    "previousStatement": null
});
Blockly.JavaScript.forBlock['open_page'] = function (block, generator) {
    const value_new_page = generator.valueToCode(block, 'new_page', javascript.Order.ATOMIC);

    const code = `window.location.href = "${value_new_page.slice(1, -1)}";`;
    return code;
}


// ---- Open Page With Start Value ----
CUSTOM_BLOCKS.push({
    "type": "open_page_with_start_value",
    "tooltip": "",
    "helpUrl": "",
    "message0": "Open page %1 With start value %2",
    "args0": [
        {
            "type": "input_value",
            "name": "new_page",
            "check": "page"
        },
        {
            "type": "input_value",
            "name": "start_value"
        }
    ],
    "previousStatement": null
});
Blockly.JavaScript.forBlock['open_page_with_start_value'] = function (block, generator) {
    const value_new_page = generator.valueToCode(block, 'new_page', javascript.Order.ATOMIC);
    const value_start_value = generator.valueToCode(block, 'start_value', javascript.Order.ATOMIC);

    const code = `window.location.href = "${value_new_page.slice(1, -1)}?startValue=${encodeURIComponent( value_start_value.slice(1, -1) )}";`;
    return code;
}



// ---- Get Page Start Value ----
CUSTOM_BLOCKS.push({
    "type": "get_page_start_value",
    "tooltip": "",
    "colour": "#575757",
    "message0": "Page Start Value %1",
    "args0": [
        {
            "type": "input_dummy",
            "name": "0"
        }
    ],
    "output": null
});
Blockly.JavaScript.forBlock['get_page_start_value'] = function (block, generator) {  
    const code = `PageLoad.getPageStartValue()`;
    return [code, javascript.Order.NONE];
}