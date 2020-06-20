"use strict";

const START_ROLLING = $("#start-rolling");
const STOP_ROLLING = $("#stop-rolling");
function init() {
  // register event handlers
  START_ROLLING.on('click', clickStartRolling);
  STOP_ROLLING.on('click', clickStopRolling);

  // hide stop rolling button
  STOP_ROLLING.hide();
}

function clickStartRolling() {
  console.log("Start rolling texts");
  START_ROLLING.hide();
  STOP_ROLLING.show();
}

function clickStopRolling() {
  console.log("Stop rolling texts");
  STOP_ROLLING.hide();
  START_ROLLING.show();
}


init();
