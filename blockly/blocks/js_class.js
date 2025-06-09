/* Add Class category to the toolbox */
TOOLBOX.contents.push({
  "kind": "category",
  "name": "Class",
  "colour": 330,
  "contents": [
    { "kind": "block", "type": "new_js_class" },
    { "kind": "block", "type": "js_call_method" },
    { "kind": "block", "type": "js_call_method_return" },
    { "kind": "block", "type": "js_this" }
  ]
});



CUSTOM_BLOCKS.push({
  "type": "new_js_class",
  "message0": "Class %1 %2 Constructor %3",
  "args0": [
    { "type": "field_input",    "name": "class_name", "text": "myClass" },
    { "type": "input_dummy",    "name": "dummy" },
    { "type": "input_statement","name": "constructor" }
  ],
  "mutator": "new_js_class_mutator",
  "output": null,
  "colour": 330,
  "tooltip": "Create a class object",
  "helpUrl": "helpURL"
});

Blockly.Blocks['new_js_class'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("Class")
        .appendField(new Blockly.FieldTextInput("myClass"), "class_name");
    this.appendStatementInput("constructor")
        .appendField("Constructor");
    this.setColour(330);
    this.setMutator(new Blockly.Mutator(['new_js_class_method']));
    // Initialize arrays for dynamic methods:
    this.methodCount_ = 0;
    this.methodNames_ = [];
    this.methodHasReturn_ = [];
  },
  mutationToDom: function() {
    // Save the number of methods and their names/return flags.
    if (!this.methodCount_) {
      return null;
    }
    var container = document.createElement('mutation');
    container.setAttribute('methodcount', this.methodCount_);
    for (var i = 0; i < this.methodCount_; i++) {
      var methodElement = document.createElement('method');
      methodElement.setAttribute('name', this.methodNames_[i]);
      methodElement.setAttribute('hasReturn', this.methodHasReturn_[i]);
      container.appendChild(methodElement);
    }
    return container;
  },
  domToMutation: function(xmlElement) {
    // Restore method info from XML.
    this.methodCount_ = parseInt(xmlElement.getAttribute('methodcount'), 10) || 0;
    this.methodNames_ = [];
    this.methodHasReturn_ = [];
    for (var i = 0; i < this.methodCount_; i++) {
      var methodElem = xmlElement.childNodes[i];
      this.methodNames_.push(methodElem.getAttribute('name'));
      this.methodHasReturn_.push(methodElem.getAttribute('hasReturn') === 'true');
    }
    this.updateShape_();
  },
  decompose: function(workspace) {
    // Build the mutator’s container block.
    var containerBlock = workspace.newBlock('class_methods_container');
    containerBlock.initSvg();
    var connection = containerBlock.getInput('STACK').connection;
    // For each method, create a mutator block and connect it.
    for (var i = 0; i < this.methodCount_; i++) {
      var methodBlock = workspace.newBlock('new_js_class_method');
      methodBlock.initSvg();
      // Set the method’s name and return-type flag on the mutator block.
      methodBlock.setFieldValue(this.methodNames_[i], 'NAME');
      methodBlock.setFieldValue(this.methodHasReturn_[i] ? 'yes' : 'no', 'TYPE');
      // Chain them in order:
      connection.connect(methodBlock.previousConnection);
      connection = methodBlock.nextConnection;
    }
    return containerBlock;
  },
  compose: function(containerBlock) {
    // Rebuild this block’s methods from the mutator dialog.
    this.methodNames_ = [];
    this.methodHasReturn_ = [];
    var methodBlock = containerBlock.getInputTargetBlock('STACK');
    while (methodBlock) {
      this.methodNames_.push(methodBlock.getFieldValue('NAME'));
      this.methodHasReturn_.push(methodBlock.getFieldValue('TYPE') === 'yes');
      methodBlock = methodBlock.nextConnection &&
                    methodBlock.nextConnection.targetBlock();
    }
    this.methodCount_ = this.methodNames_.length;
    this.updateShape_();
  },
  updateShape_: function() {
    // Rebuild the block’s inputs to match the current methods.
    // First remove any existing method inputs:
    var i = 0;
    while (this.getInput('METHOD_LABEL' + i)) {
      this.removeInput('METHOD_LABEL' + i);
      this.removeInput('METHOD_BODY'  + i);
      this.removeInput('METHOD_RETURN'+ i);
      i++;
    }
    // Then add inputs for each method in order:
    for (i = 0; i < this.methodCount_; i++) {
      // Label and name field:
      this.appendDummyInput('METHOD_LABEL' + i)
          .appendField('Function')
          .appendField(new Blockly.FieldTextInput(this.methodNames_[i]), 'METHODNAME' + i);
      // Body statements:
      this.appendStatementInput('METHOD_BODY' + i)
          .appendField(' ');  // placeholder; real code goes inside
      // Optional return value:
      if (this.methodHasReturn_[i]) {
        this.appendValueInput('METHOD_RETURN' + i)
            .setCheck(null)
            .appendField('Return');
      }
    }
  }
};
Blockly.Extensions.registerMutator('new_js_class_mutator', {
  // Provide the mutator's behavior
  mutationToDom: function() {
    const container = Blockly.utils.xml.createElement('mutation');
    container.setAttribute('method_count', this.methodCount || 0);
    return container;
  },
  domToMutation: function(xmlElement) {
    this.methodCount = parseInt(xmlElement.getAttribute('method_count')) || 0;
    this.updateShape_();
  },
  decompose: function(workspace) {
    const containerBlock = workspace.newBlock('class_method_params_container');
    containerBlock.initSvg();
    let connection = containerBlock.getInput('STACK').connection;
    for (let i = 0; i < this.methodCount; i++) {
      const methodBlock = workspace.newBlock('new_js_class_method');
      methodBlock.initSvg();
      connection.connect(methodBlock.previousConnection);
      connection = methodBlock.nextConnection;
    }
    return containerBlock;
  },
  compose: function(containerBlock) {
    let methodBlock = containerBlock.getInputTargetBlock('STACK');
    let count = 0;
    const methodNames = [];
    while (methodBlock) {
      methodNames.push(methodBlock.getFieldValue('NAME'));
      count++;
      methodBlock = methodBlock.getNextBlock();
    }
    this.methodCount = count;
    this.methodNames = methodNames;
    this.updateShape_();
  },
  updateShape_: function() {
    // Remove old method inputs
    while (this.getInput('METHOD' + this.methodCount)) {
      this.removeInput('METHOD' + this.methodCount);
      this.methodCount--;
    }
    // Add new inputs
    for (let i = 0; i < this.methodCount; i++) {
      if (!this.getInput('METHOD' + i)) {
        this.appendDummyInput('METHOD' + i)
            .appendField('method')
            .appendField(new Blockly.FieldTextInput(this.methodNames?.[i] || 'methodName'), 'METHOD_NAME' + i);
      }
    }
  }
}, null, ['new_js_class_method']);

CUSTOM_BLOCKS.push({
  "type": "new_js_class_method",
  "message0": "%1 %2",
  "args0": [
    { "type": "field_dropdown", "name": "TYPE", "options": [
        ["Function","no"], ["Function (returns)","yes"]
      ] },
    { "type": "field_input", "name": "NAME", "text": "myMethod" }
  ],
  "previousStatement": null,
  "nextStatement": null,
  "colour": 330,
  "tooltip": "Add a class method",
  "helpUrl": "helpURL"
});
CUSTOM_BLOCKS.push({
  "type": "class_method_params_container",
  "message0": "Parameters %1",
  "args0": [
    { "type": "input_statement", "name": "STACK" }
  ],
  "colour": 330,
  "tooltip": "Add parameters",
  "helpUrl": "helpURL"
});
CUSTOM_BLOCKS.push({
  "type": "class_method_param_item",
  "message0": "%1",
  "args0": [
    { "type": "field_input", "name": "PARAM", "text": "arg" }
  ],
  "previousStatement": null,
  "nextStatement": null,
  "colour": 330,
  "tooltip": "Parameter",
  "helpUrl": "helpURL"
});


Blockly.Blocks['new_js_class_method'] = {};
Blockly.Blocks['new_js_class_method'].init = function() {
  this.appendDummyInput()
      .appendField(new Blockly.FieldDropdown([
          ["Function","no"], ["Function (returns)","yes"]
      ]), "TYPE")
      .appendField(new Blockly.FieldTextInput("myMethod"), "NAME");
  this.setPreviousStatement(true);
  this.setNextStatement(true);
  this.setColour(330);
  this.setMutator(new Blockly.Mutator(['class_method_param_item']));
  // Initialize parameter list:
  this.paramCount_ = 0;
  this.paramNames_ = [];
};
Blockly.Blocks['new_js_class_method'].mutationToDom = function() {
  if (!this.paramCount_) {
    return null;
  }
  var container = document.createElement('mutation');
  container.setAttribute('paramcount', this.paramCount_);
  for (var i = 0; i < this.paramCount_; i++) {
    var arg = document.createElement('arg');
    arg.setAttribute('name', this.paramNames_[i]);
    container.appendChild(arg);
  }
  return container;
};
Blockly.Blocks['new_js_class_method'].domToMutation = function(xmlElement) {
  this.paramCount_ = parseInt(xmlElement.getAttribute('paramcount'), 10) || 0;
  this.paramNames_ = [];
  for (var i = 0; i < this.paramCount_; i++) {
    var arg = xmlElement.childNodes[i];
    this.paramNames_.push(arg.getAttribute('name'));
  }
  this.updateParams_();
};
Blockly.Blocks['new_js_class_method'].decompose = function(workspace) {
  var containerBlock = workspace.newBlock('class_method_params_container');
  containerBlock.initSvg();
  var connection = containerBlock.getInput('STACK').connection;
  for (var i = 0; i < this.paramCount_; i++) {
    var paramBlock = workspace.newBlock('class_method_param_item');
    paramBlock.initSvg();
    paramBlock.setFieldValue(this.paramNames_[i], 'PARAM');
    connection.connect(paramBlock.previousConnection);
    connection = paramBlock.nextConnection;
  }
  return containerBlock;
};
Blockly.Blocks['new_js_class_method'].compose = function(containerBlock) {
  this.paramNames_ = [];
  var paramBlock = containerBlock.getInputTargetBlock('STACK');
  while (paramBlock) {
    this.paramNames_.push(paramBlock.getFieldValue('PARAM'));
    paramBlock = paramBlock.nextConnection &&
                 paramBlock.nextConnection.targetBlock();
  }
  this.paramCount_ = this.paramNames_.length;
  this.updateParams_();
};
Blockly.Blocks['new_js_class_method'].updateParams_ = function() {
  // Remove existing inputs:
  var i = 0;
  while (this.getInput('ARG' + i)) {
    this.removeInput('ARG' + i);
    i++;
  }
  // Add an input for each parameter name:
  for (i = 0; i < this.paramCount_; i++) {
    this.appendValueInput('ARG' + i)
        .setCheck(null)
        .appendField(this.paramNames_[i]);
  }
};


CUSTOM_BLOCKS.push({
  "type": "js_new_class_instance",
  "message0": "set %1 = new %2()",
  "args0": [
    { "type": "field_variable", "name": "VAR",      "variable": "item" },
    { "type": "field_input",    "name": "class_name", "text": "myClass" }
  ],
  "previousStatement": null,
  "nextStatement": null,
  "colour": 330,
  "tooltip": "Instantiate a class",
  "helpUrl": "helpURL"
});

CUSTOM_BLOCKS.push({
  "type": "js_call_method",
  "message0": "%1 . %2()",
  "args0": [
    { "type": "input_value",  "name": "OBJECT" },
    { "type": "field_input",  "name": "METHOD", "text": "myMethod" }
  ],
  "previousStatement": null,
  "nextStatement": null,
  "colour": 330,
  "tooltip": "Call a method (no return)",
  "helpUrl": "helpURL"
});
CUSTOM_BLOCKS.push({
  "type": "js_call_method_return",
  "message0": "%1 . %2()",
  "args0": [
    { "type": "input_value",  "name": "OBJECT" },
    { "type": "field_input",  "name": "METHOD", "text": "myMethod" }
  ],
  "output": null,
  "colour": 330,
  "tooltip": "Call a method (returns value)",
  "helpUrl": "helpURL"
});

CUSTOM_BLOCKS.push({
  "type": "js_this",
  "message0": "this",
  "output": null,
  "colour": 330,
  "tooltip": "Reference to this object",
  "helpUrl": "helpURL"
});
