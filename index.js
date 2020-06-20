"use strict";
/*
Classes
*/
class TextInput {
  constructor(source, defValue) {
    this.source = source;
    this.def = defValue;
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
  constructor(source, defValue) {
    super(source, defValue);
  }

  getOrDefault(defVal = this.def) {
    let val = this.get();
    if (val.length == 0 || Number.isNaN(val)) val = defVal;
    this.source.val(val);
    return +val;
  }
}

class BooleanInput extends TextInput{
  constructor(source) {
    super(source, false);
  }

  get() {
    return this.source.is(":checked");
  }

  getOrDefault(defVal = this.def) {
    return this.get();
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
  DELAY: new IntInput($("#delay"), "0"),
  WPM: new IntInput($("#wpm"), "200"),
  BY_CHAR: new BooleanInput($("#char-by-char")),
  CTRL_MOMENTUM: new BooleanInput($("#control-momentum")),
}

const GLOB = {};

const HIGHLIGHTING = $("#highlighting");

/*
Functions
*/
function init() {
  // register event handlers
  BUTTONS.START.on('click', clickStartRolling);
  BUTTONS.STOP.on('click', clickStopRolling);
  ENTRIES.WPM.source.on('input', () => {
    $("#wpm-display").html(ENTRIES.WPM.get());
    calculateStatistics();
  });
  ENTRIES.TEXT.source.on('input', calculateStatistics);
  ENTRIES.BY_CHAR.source.on('input', calculateStatistics);

  // hide stop rolling button
  BUTTONS.STOP.hide();

  // display initial word per minute
  $("#wpm-display").html(ENTRIES.WPM.get());

  calculateStatistics();

  GLOB.pauseSymbols = [
    ".", "!", ",", "?", ";", ":", // roman symbols
    "。", "！", "，", "？", "；", "：" // full-width symbols
  ];
}

function calculateStatistics() {
  const wpm = ENTRIES.WPM.getOrDefault();
  let wordCount;
  if (!ENTRIES.BY_CHAR.get()) wordCount = ENTRIES.TEXT.get().trim().split(/\s+/).length;
  else wordCount = ENTRIES.TEXT.get().trim().split("").length;
  $("#time-completion").html(`${Math.round(wordCount / wpm * 60)}s`);
}

function setScreenText(text = "&nbsp;") {
  if (text.length == 0) return;
  $("#screen").html(text);
}

function* iterate(arr) {
  let count = 0;
  for(let i of arr) {
    yield {
      index: count++,
      element: i,
    };
  }
}

function clickStartRolling() {
  if (ENTRIES.TEXT.get().trim().length == 0) return;
  let delay = ENTRIES.DELAY.getOrDefault();
  const wpm = ENTRIES.WPM.getOrDefault();
  const refreshRate = Math.round((60 * 1000) / wpm);
  let split;
  let iterator;
  if ($("#char-by-char").is(":checked")) {
    split = ENTRIES.TEXT.get().trim().split("");
  } else {
    split = ENTRIES.TEXT.get().trim().split(/(\s+)/g);
  }
  iterator = iterate(split);
  clearHighlightingContent();
  appendToHighlighting(split);
  displayTimer(delay);
  GLOB.screen = scheduleWordToScreen(iterator, delay * 1000 + 10);
  BUTTONS.START.hide();
  BUTTONS.STOP.show();
}

function clearHighlightingContent() {
  HIGHLIGHTING.empty();
}

function appendToHighlighting(split) {
  for (let {index, element} of iterate(split)) {
    element = element.replace(/\s/g, "<br>");
    let word = `<span id="word-${index}">${element}</span>`;
    HIGHLIGHTING.append(word);
  }
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
  let addMomentum = false;
  let nextWord = iterator.next();
  while(nextWord.value.element.trim().length == 0) {
    nextWord = iterator.next();
    addMomentum = ENTRIES.CTRL_MOMENTUM.get() && nextWord.value.element.indexOf("\n") > -1;
  }

  let word = nextWord.value.element;
  addMomentum = ENTRIES.CTRL_MOMENTUM.get() && GLOB.pauseSymbols.indexOf(word[word.length-1]) > -1;
  return setInterval(() => {
    if (nextWord.done) {
      clearTimeout(GLOB.screen);
    } else {
      setScreenText(nextWord.value.element);
      clearTimeout(GLOB.screen);
      const wpm = ENTRIES.WPM.getOrDefault();
      const refreshRate = Math.round((60 * 1000) / wpm);
      GLOB.screen = scheduleWordToScreen(iterator, refreshRate + (addMomentum ? refreshRate : 0));
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
