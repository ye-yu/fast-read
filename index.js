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
  PAUSE: $("#pause-rolling"),
  CONTINUE: $("#continue-rolling"),
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
  BUTTONS.PAUSE.on('click', clickPauseRolling);
  BUTTONS.CONTINUE.on('click', clickContinueRolling);
  ENTRIES.WPM.source.on('input', () => {
    $("#wpm-display").html(ENTRIES.WPM.get());
    calculateStatistics();
  });
  ENTRIES.TEXT.source.on('input', calculateStatistics);
  ENTRIES.BY_CHAR.source.on('input', () => {
    calculateStatistics();
    adjustScreenTextXFromByChar();
  });

  // hide stop rolling button
  clickStopRolling();

  // display initial word per minute
  $("#wpm-display").html(ENTRIES.WPM.get());

  calculateStatistics();

  GLOB.pauseSymbols = [
    ".", "!", ",", "?", ";", ":", // roman symbols
    "。", "！", "，", "？", "；", "：", // full-width symbols
    "、" // japanese comma
  ];

  // adjust screen width
  const screenWidth = $("svg#screen-svg").width();
  adjustScreenTextX(screenWidth/2, 50);
}

function adjustScreenTextX(center, offset = 0) {
  center -= offset;
  const fontHalfWidth = 15;
  $("svg#screen-svg text#left").attr("x", center - fontHalfWidth);
  $("svg#screen-svg text#center").attr("x", center);
  $("svg#screen-svg text#right").attr("x", center + fontHalfWidth);
}

function adjustScreenTextXFromByChar() {
  const whiteText = "#F7F3E3";
  const secondaryText = "#D52941";
  const screenWidth = $("svg#screen-svg").width();
  if (!ENTRIES.BY_CHAR.get()) {
    adjustScreenTextX(screenWidth/2, 50);
    $("svg#screen-svg text#center").attr("fill", secondaryText);
  } else {
    adjustScreenTextX(screenWidth/2);
    $("svg#screen-svg text#center").attr("fill", whiteText);
  }
}


function calculateStatistics() {
  const wpm = ENTRIES.WPM.getOrDefault();
  let wordCount;
  if (!ENTRIES.BY_CHAR.get()) wordCount = ENTRIES.TEXT.get().trim().split(/\s+/).length;
  else wordCount = ENTRIES.TEXT.get().trim().split("").length;
  $("#time-completion").html(`${Math.round(wordCount / wpm * 60)}s`);
}

function separateComponents(text = "") {
  if (text.length < 2) {
    return ["", text, ""];
  }

  if (text.length == 2) {
    const valid = "aeuioy".split("");
    if (valid.indexOf(text[0]) > -1)
      return ["", text[0], text[1]];
    return [text[0], text[1], ""];
  }
  const middle = findVowelNonHead(text);

  return [
    text.substring(0, middle),
    text[middle],
    text.substring(middle + 1)
  ];
}

function findVowelNonHead(text = "") {
  const valid = "aeuioy".split("");
  for(let v of iterate(text.split(""))) {
    if (v.index == 0 || v.index == text.length - 1) continue;
    if (valid.indexOf(v.element) > -1) return v.index;
  }
  if (valid.indexOf(text[0]) > -1) return 0;
  return Math.floor(text.length / 2);
}

function setScreenText(text = " ") {
  if (text.length == 0) return;
  text = separateComponents(text);
  $("svg#screen-svg text#left").empty(); // to clear out span tags
  $("svg#screen-svg text#left").html(text[0]);
  $("svg#screen-svg text#center").empty(); // to clear out span tags
  $("svg#screen-svg text#center").html(text[1]);
  $("svg#screen-svg text#right").empty(); // to clear out span tags
  $("svg#screen-svg text#right").html(text[2]);
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
  GLOB.iterator = iterator;
  GLOB.screen = scheduleWordToScreen(iterator, delay * 1000 + 10);
  BUTTONS.START.hide();
  BUTTONS.PAUSE.fadeIn(200);
  BUTTONS.STOP.fadeIn(200);
  ENTRIES.TEXT.source.hide();
  HIGHLIGHTING.fadeIn(500);
}

function clearHighlightingContent() {
  HIGHLIGHTING.empty();
}

function appendToHighlighting(split) {
  for (let {index, element} of iterate(split)) {
    element = element.replace(/\n/g, "<br>");
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
  GLOB.current = nextWord;
  return setInterval(() => {
    if (nextWord.done) {
      clearTimeout(GLOB.screen);
    } else {
      setScreenText(nextWord.value.element);
      highlightText(nextWord.value.index);
      clearTimeout(GLOB.screen);
      const wpm = ENTRIES.WPM.getOrDefault();
      const refreshRate = Math.round((60 * 1000) / wpm);
      GLOB.screen = scheduleWordToScreen(iterator, refreshRate + (addMomentum ? refreshRate : 0));
    }
  }, delay);
}

function highlightText(index) {
  $(".highlight").attr("class", "");
  $(`#word-${index}`).addClass("highlight color-accent");
  $(`#word-${index}`).attr("style", "margin-top:-40px;padding-top:40px;");
  let position = $(window).scrollTop();
  document.getElementById(`word-${index}`).scrollIntoView(true);
  $(window).scrollTop(position);
}

function clickStopRolling() {
  ENTRIES.TEXT.source.fadeIn(500);
  HIGHLIGHTING.hide();
  BUTTONS.PAUSE.hide();
  BUTTONS.CONTINUE.hide();
  BUTTONS.STOP.hide();
  BUTTONS.START.fadeIn(200);
  setScreenText();
  clearInterval(GLOB.timer);
  clearTimeout(GLOB.screen);
}

function clickPauseRolling() {
  BUTTONS.PAUSE.hide();
  BUTTONS.CONTINUE.show();
  clearTimeout(GLOB.screen);
}

function clickContinueRolling() {
  BUTTONS.PAUSE.show();
  BUTTONS.CONTINUE.hide();
  setScreenText(GLOB.current.value.element);
  highlightText(GLOB.current.value.index);
  const wpm = ENTRIES.WPM.getOrDefault();
  const refreshRate = Math.round((60 * 1000) / wpm);
  GLOB.screen = scheduleWordToScreen(GLOB.iterator, refreshRate);
}

/*
Initialisation
*/
init();
