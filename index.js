"use strict";
/*
Classes
*/
class TextInput {
  constructor(source, defValue, isTextArea) {
    if (isTextArea){
      this.getValue = () => source.html();
    } else {
      this.getValue = () => source.val();
    }
    this.def = defValue;
  }
  getOrDefault() {
    const val = this.getValue();
    if (val.length == 0) return def;
    return val;
  }
}

class IntInput extends TextInput{
  constructor(source, defValue, isTextArea) {
    super(source, defValue, isTextArea);
  }

  getOrDefault() {
    const val = this.getValue();
    if (val.length == 0 || Number.isNaN(val)) return +this.def;
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
