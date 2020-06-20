"use strict";

const BUTTONS = {
  START: $("#start-rolling"),
  STOP: $("#stop-rolling")
}
function init() {
  // register event handlers
  BUTTONS.START.on('click', clickStartRolling);
  BUTTONS.STOP.on('click', clickStopRolling);

  // hide stop rolling button
  BUTTONS.STOP.hide();
}

function clickStartRolling() {
  console.log("Start rolling texts");
  BUTTONS.START.hide();
  BUTTONS.STOP.show();
}

function clickStopRolling() {
  console.log("Stop rolling texts");
  BUTTONS.STOP.hide();
  BUTTONS.START.show();
}


init();
