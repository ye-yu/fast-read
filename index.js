"use strict";
/*
Classes
*/
class TextInput {
  constructor(source, defValue, isTextArea) {
    this.def = defValue;
    this.source = source;
    this.isTextArea = isTextArea;
  }

  get() {
    if (this.isTextArea) {
      return this.source.html();
    }
    return this.source.val();
  }

  getOrDefault() {
    let val = this.get();
    if (val.length == 0) val = def;
    if (this.isTextArea) {
      this.source.html(val);
    } else {
      this.source.val(val);
    }
    return val;
  }
}

class IntInput extends TextInput{
  constructor(source, defValue, isTextArea) {
    super(source, defValue, isTextArea);
  }

  getOrDefault() {
    let val = this.get();
    if (val.length == 0 || Number.isNaN(val)) val = this.def;
    if (this.isTextArea) {
      this.source.html(val);
    } else {
      this.source.val(val);
    }
    return +val;
  }
}

/*
Constants
*/
const BUTTONS = {
  START: $("#start-rolling"),
  STOP: $("#stop-rolling")
}

const ENTRIES = {
  TEXT: new TextInput($("#input-text"), "", true),
  DELAY: new IntInput($("#delay"), "5", false),
  WPM: new IntInput($("#wpm"), "200", false)
}

/*
Functions
*/
function init() {
  // register event handlers
  BUTTONS.START.on('click', clickStartRolling);
  BUTTONS.STOP.on('click', clickStopRolling);

  // hide stop rolling button
  BUTTONS.STOP.hide();
}

function clickStartRolling() {
  console.log("Delay before start: ", ENTRIES.DELAY.getOrDefault());
  console.log("Words per minute: ", ENTRIES.WPM.getOrDefault());
  console.log("Text to play: ", ENTRIES.TEXT.getValue());
  BUTTONS.START.hide();
  BUTTONS.STOP.show();
}

function clickStopRolling() {
  BUTTONS.STOP.hide();
  BUTTONS.START.show();
}

/*
Initialisation
*/
init();
