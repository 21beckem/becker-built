// title case function
String.prototype.toProperCase = function () {
    return this.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
};
const PAGE_COMPONENTS = JSON.parse(localStorage.getItem('pageComponents')) || {};

// make list of all attributes that can be set or got on a component
const ALL_COMP_ATTR = [
    ['Background Color', 'style.backgroundColor'],
    ['Font Size', 'style.fontSize'],
    ['Width', 'style.width'],
    ['Height', 'style.height'],
    ['Text Color', 'style.color'],
    ['Text', 'innerText'],
    ['Visible', 'style.display']
];


function convertGrapesComponentsToBlockly(big_page_comps) {
    let cats = [];
    let list = [];
    function nestedCategories(component) {
        let thisC = {
            kind: 'category',
            id: component.attributes.id,
            name: component['custom-name'] || component.type.toProperCase(),
        }
        if (thisC.name && thisC.id) {
            list.push( [thisC.name, thisC.id] );
        }

        let myCats = [];
        if (component.components) {
            component.components.forEach(comp => {
                if (comp.type != 'contentEditable' && comp.type != 'textnode') {
                    myCats.push( nestedCategories(comp) );
                }
            });
            // add a block for each of the attributes that could be changed
            ALL_COMP_ATTR.forEach(attr => {
                myCats.push({
                    kind: 'block',
                    type: 'component_get_prop',
                    fields: {
                        compId: thisC.id,
                        property: attr[1]
                    }
                },
                {
                    kind: 'block',
                    type: 'component_set_prop',
                    fields: {
                        compId: thisC.id,
                        property: attr[1]
                    }
                }
            );
            });
            thisC.contents = myCats;
        }
        return thisC;
    }
    big_page_comps.forEach(component => {
        cats.push( nestedCategories(component) );
    });
    console.log('cats', cats);
    cats.unshift({
        "kind": "category",
        "name": "Tools",
        "colour": 60,
        "contents": []
    });
    return [ cats, list ];
}
const [ GrapeToolbox, GrapeDropdown ] = convertGrapesComponentsToBlockly(PAGE_COMPONENTS);

// add all page components to the toolbar
TOOLBOX.contents.push({
    "kind": "category",
    "name": "Page Components",
    "colour": 60,
    "contents": GrapeToolbox
});

// ---- Set Block ----
CUSTOM_BLOCKS.push({
    "type": "component_set_prop",
    "tooltip": "",
    "colour": 255,
    "previousStatement": null,
    "nextStatement": null,
    "message0": "Set %1 . %2 to %3",
    "args0": [
        {
            "type": "field_dropdown",
            "name": "compId",
            "options": GrapeDropdown
        },
        {
            "type": "field_dropdown",
            "name": "property",
            "options": ALL_COMP_ATTR
        },
        {
            "type": "input_value",
            "name": "setValue",
        }
    ]
});
Blockly.JavaScript.forBlock['component_set_prop'] = function (block, generator) {
    const dropdown_compid = block.getFieldValue('compId');
    const dropdown_property = block.getFieldValue('property');
    let value_setvalue = generator.valueToCode(block, 'setValue', javascript.Order.ATOMIC);

    value_setvalue = (dropdown_property == 'style.display') ? (
        (value_setvalue == 'false' || value_setvalue == '0' || value_setvalue == 0) ? '"none"' : '"unset"'
    ) : value_setvalue;
    return `document.getElementById('${dropdown_compid}').${dropdown_property} = ${value_setvalue};`;
}


// ---- Get Block ----
CUSTOM_BLOCKS.push({
    "type": "component_get_prop",
    "tooltip": "",
    "message0": "Get %1 . %2 %3",
    "output": null,
    "colour": 285,
    "args0": [
        {
            "type": "field_dropdown",
            "name": "compId",
            "options": GrapeDropdown
        },
        {
            "type": "field_dropdown",
            "name": "property",
            "options": ALL_COMP_ATTR
        },
        {
            "type": "input_dummy",
            "name": "setValue"
        }
    ]
});
Blockly.JavaScript.forBlock['component_get_prop'] = function (block, generator) {
    const dropdown_compid = block.getFieldValue('compId');
    const dropdown_property = block.getFieldValue('property');

    let code = `document.getElementById('${dropdown_compid}').${dropdown_property}`;
    if (dropdown_property == 'style.display') {
        code = `(document.getElementById('${dropdown_compid}').${dropdown_property}!='none')`;
    }
    return [code, javascript.Order.NONE];
}


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