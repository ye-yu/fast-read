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

function* iterate(arr) {
  let count = 0;
  for(let i of arr) {
    yield {
      index: count,
      element: i
    };
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
  ENTRIES.WPM.source.on('input', () => {
    $("#wpm-display").html(ENTRIES.WPM.get());
  });

  // hide stop rolling button
  BUTTONS.STOP.hide();

  // display initial word per minute
  $("#wpm-display").html(ENTRIES.WPM.get());
}

function setScreenText(text = "") {
  $("#screen").html(text);
}

function clickStartRolling() {
  if (ENTRIES.TEXT.get().trim().length == 0) return;
  let delay = ENTRIES.DELAY.getOrDefault();
  const wpm = ENTRIES.WPM.getOrDefault();
  const refreshRate = Math.round((60 * 1000) / wpm);
  let iterator = iterate(ENTRIES.TEXT.get().trim().split(/\s+/));
  displayTimer(delay);
  GLOB.screen = scheduleWordToScreen(iterator, delay * 1000 + 10);
  BUTTONS.START.hide();
  BUTTONS.STOP.show();
}

function displayTimer(delay) {
  if (delay == 0) return;
  setScreenText(delay);
  GLOB.timer = setInterval(() => {
    delay -= 1;
    setScreenText(delay);
    if (delay == 0) {
      clearInterval(GLOB.timer);
      setScreenText();
    }
  }, 1000);
}

function scheduleWordToScreen(iterator, delay) {
  return setInterval(() => {
    let nextWord = iterator.next();
    if (nextWord.done) {
      clearTimeout(GLOB.screen);
    } else {
      setScreenText(nextWord.value.element);
      clearTimeout(GLOB.screen);
      const wpm = ENTRIES.WPM.getOrDefault();
      const refreshRate = Math.round((60 * 1000) / wpm);
      GLOB.screen = scheduleWordToScreen(iterator, refreshRate);
    }
  }, delay);
}

function clickStopRolling() {
  BUTTONS.STOP.hide();
  BUTTONS.START.show();
  setScreenText();
  clearInterval(GLOB.timer);
  clearTimeout(GLOB.screen);
}

/*
Initialisation
*/
init();
