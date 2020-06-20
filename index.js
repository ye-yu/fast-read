"use strict";
/*
Classes
*/
class TextInput {
  constructor(source, defValue, isTextArea) {
    this.source = source;
    this.def = defValue;
    this.isTextArea = isTextArea;
  }

  get() {
    return this.source.val();
  }

  getOrDefault(defVal = this.def) {
    let val = this.get();
    if (val.length == 0) val = defVal;
    this.source.val(val);
    return val;
  }
}

class IntInput extends TextInput{
  constructor(source, defValue, isTextArea) {
    super(source, defValue, isTextArea);
  }

  getOrDefault(defVal = this.def) {
    let val = this.get();
    if (val.length == 0 || Number.isNaN(val)) val = defVal;
    this.source.val(val);
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
  TEXT: new TextInput($("#input-text"), ""),
  DELAY: new IntInput($("#delay"), "5"),
  WPM: new IntInput($("#wpm"), "200")
}

const GLOB = {}

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

function setScreenText(text = "") {
  $("#screen").html(text);
}

function clickStartRolling() {
  if (ENTRIES.TEXT.get().length == 0) return;
  console.log("Delay before start: ", ENTRIES.DELAY.getOrDefault());
  console.log("Words per minute: ", ENTRIES.WPM.getOrDefault());
  console.log("Text to play: ", ENTRIES.TEXT.get());

  let delay = ENTRIES.DELAY.getOrDefault();
  setScreenText(delay);
  GLOB.timer = setInterval(() => {
    delay -= 1;
    setScreenText(delay);
    if (delay == 0) {
      clearInterval(GLOB.timer);
      setScreenText();
    }
  }, 1000);
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
