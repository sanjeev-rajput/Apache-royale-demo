/**
 * Generated by Apache Royale Compiler from views/actionitemviews/games/mousegame/Controller.as
 * views.actionitemviews.games.mousegame.Controller
 *
 * @fileoverview
 *
 * @suppress {missingRequire|checkTypes|accessControls}
 */

goog.provide('views.actionitemviews.games.mousegame.Controller');
/* Royale Dependency List: org.apache.royale.events.Event,org.apache.royale.events.MouseEvent,org.apache.royale.html5.AudioElement,org.apache.royale.jewel.Image,org.apache.royale.jewel.Label,org.apache.royale.utils.Timer,views.actionitemviews.games.mousegame.MouseGame,org.apache.royale.utils.Language,XML*/

goog.require('views.actionitemviews.games.iGame');



/**
 * @constructor
 * @implements {views.actionitemviews.games.iGame}
 * @param {views.actionitemviews.games.mousegame.MouseGame} ui
 */
views.actionitemviews.games.mousegame.Controller = function(ui) {
  
  this.views_actionitemviews_games_mousegame_Controller_stars = [];
  this.views_actionitemviews_games_mousegame_Controller_redBombs = [];
  this.views_actionitemviews_games_mousegame_Controller_intervalIds = new Array();
  this.views_actionitemviews_games_mousegame_Controller_gameStage = ui;
  this.views_actionitemviews_games_mousegame_Controller_init();
};


/**
 * @private
 * @type {views.actionitemviews.games.mousegame.MouseGame}
 */
views.actionitemviews.games.mousegame.Controller.prototype.views_actionitemviews_games_mousegame_Controller_gameStage = null;


/**
 * @private
 * @type {org.apache.royale.jewel.Image}
 */
views.actionitemviews.games.mousegame.Controller.prototype.views_actionitemviews_games_mousegame_Controller_basket = null;


/**
 * @private
 * @type {number}
 */
views.actionitemviews.games.mousegame.Controller.prototype.views_actionitemviews_games_mousegame_Controller_score = 0;


/**
 * @private
 * @type {Array}
 */
views.actionitemviews.games.mousegame.Controller.prototype.views_actionitemviews_games_mousegame_Controller_stars = null;


/**
 * @private
 * @type {Array}
 */
views.actionitemviews.games.mousegame.Controller.prototype.views_actionitemviews_games_mousegame_Controller_redBombs = null;


/**
 * @private
 * @type {org.apache.royale.utils.Timer}
 */
views.actionitemviews.games.mousegame.Controller.prototype.views_actionitemviews_games_mousegame_Controller_gameTimer = null;


/**
 * @private
 * @type {boolean}
 */
views.actionitemviews.games.mousegame.Controller.prototype.views_actionitemviews_games_mousegame_Controller_isGameOver = false;


/**
 * @private
 * @type {org.apache.royale.html5.AudioElement}
 */
views.actionitemviews.games.mousegame.Controller.prototype.views_actionitemviews_games_mousegame_Controller_catchSound = null;


/**
 * @private
 * @type {org.apache.royale.html5.AudioElement}
 */
views.actionitemviews.games.mousegame.Controller.prototype.views_actionitemviews_games_mousegame_Controller_failSound = null;


/**
 * @private
 * @type {Array}
 */
views.actionitemviews.games.mousegame.Controller.prototype.views_actionitemviews_games_mousegame_Controller_intervalIds = null;


/**
 * @private
 */
views.actionitemviews.games.mousegame.Controller.prototype.views_actionitemviews_games_mousegame_Controller_init = function() {
  this.views_actionitemviews_games_mousegame_Controller_createBasket();
  this.views_actionitemviews_games_mousegame_Controller_setupMouseTracking();
  this.views_actionitemviews_games_mousegame_Controller_initSound();
  this.views_actionitemviews_games_mousegame_Controller_setupGameTimer();
  this.views_actionitemviews_games_mousegame_Controller_intervalIds.push(setInterval(org.apache.royale.utils.Language.closure(this.views_actionitemviews_games_mousegame_Controller_spawnStar, this, 'views_actionitemviews_games_mousegame_Controller_spawnStar'), 2000));
  this.views_actionitemviews_games_mousegame_Controller_intervalIds.push(setInterval(org.apache.royale.utils.Language.closure(this.views_actionitemviews_games_mousegame_Controller_spawnRedBomb, this, 'views_actionitemviews_games_mousegame_Controller_spawnRedBomb'), 5000));
  this.views_actionitemviews_games_mousegame_Controller_gameStage.warningArea.y = this.views_actionitemviews_games_mousegame_Controller_gameStage.height / 2;
  this.views_actionitemviews_games_mousegame_Controller_gameStage.resetBtn.addEventListener(org.apache.royale.events.MouseEvent.CLICK, org.apache.royale.utils.Language.closure(this.resetGame, this, 'resetGame'));
};


/**
 * @private
 */
views.actionitemviews.games.mousegame.Controller.prototype.views_actionitemviews_games_mousegame_Controller_initSound = function() {
  this.views_actionitemviews_games_mousegame_Controller_catchSound = new org.apache.royale.html5.AudioElement();
  this.views_actionitemviews_games_mousegame_Controller_catchSound.src = "audio/catch.mp3";
  this.views_actionitemviews_games_mousegame_Controller_failSound = new org.apache.royale.html5.AudioElement();
  this.views_actionitemviews_games_mousegame_Controller_failSound.src = "audio/drop.mp3";
  this.views_actionitemviews_games_mousegame_Controller_catchSound.volume = this.views_actionitemviews_games_mousegame_Controller_failSound.volume = 0.5;
};


/**
 * @private
 */
views.actionitemviews.games.mousegame.Controller.prototype.views_actionitemviews_games_mousegame_Controller_createBasket = function() {
  this.views_actionitemviews_games_mousegame_Controller_basket = new org.apache.royale.jewel.Image();
  this.views_actionitemviews_games_mousegame_Controller_basket.src = "img/basket.png";
  this.views_actionitemviews_games_mousegame_Controller_basket.width = 100;
  this.views_actionitemviews_games_mousegame_Controller_basket.height = 50;
  this.views_actionitemviews_games_mousegame_Controller_basket.element.style.position = "absolute";
  this.views_actionitemviews_games_mousegame_Controller_basket.element.style.bottom = "10px";
  this.views_actionitemviews_games_mousegame_Controller_basket.element.style.transition = "left 0.1s linear";
  this.views_actionitemviews_games_mousegame_Controller_gameStage.addElement(this.views_actionitemviews_games_mousegame_Controller_basket);
  this.views_actionitemviews_games_mousegame_Controller_basket.element.style.top = (this.views_actionitemviews_games_mousegame_Controller_gameStage.height / 2 - this.views_actionitemviews_games_mousegame_Controller_basket.height / 2) + "px";
};


/**
 * @private
 */
views.actionitemviews.games.mousegame.Controller.prototype.views_actionitemviews_games_mousegame_Controller_setupMouseTracking = function() {
  var self = this;
  this.views_actionitemviews_games_mousegame_Controller_gameStage.element.addEventListener("mousemove", function(e) {
    if (self.views_actionitemviews_games_mousegame_Controller_isGameOver)
      return;
    var /** @type {number} */ mouseX = (e["clientX"] - self.views_actionitemviews_games_mousegame_Controller_gameStage.element.getBoundingClientRect().left) >> 0;
    self.views_actionitemviews_games_mousegame_Controller_basket.element.style.left = (mouseX - self.views_actionitemviews_games_mousegame_Controller_basket.width / 2) + "px";
  });
};


/**
 * @private
 */
views.actionitemviews.games.mousegame.Controller.prototype.views_actionitemviews_games_mousegame_Controller_setupGameTimer = function() {
  this.views_actionitemviews_games_mousegame_Controller_gameTimer = new org.apache.royale.utils.Timer(30);
  this.views_actionitemviews_games_mousegame_Controller_gameTimer.addEventListener("timer", org.apache.royale.utils.Language.closure(this.views_actionitemviews_games_mousegame_Controller_onGameTick, this, 'views_actionitemviews_games_mousegame_Controller_onGameTick'));
  this.views_actionitemviews_games_mousegame_Controller_gameTimer.start();
};


/**
 * @private
 */
views.actionitemviews.games.mousegame.Controller.prototype.views_actionitemviews_games_mousegame_Controller_spawnStar = function() {
  if (this.views_actionitemviews_games_mousegame_Controller_isGameOver)
    return;
  var /** @type {boolean} */ isBomb = Math.random() < 0.2;
  var /** @type {org.apache.royale.jewel.Image} */ star = new org.apache.royale.jewel.Image();
  star.width = 30;
  star.height = 30;
  star.src = isBomb ? "img/bomb.png" : "img/star.png";
  star.element.style.position = "absolute";
  star.element.style.left = (Math.random() * (this.views_actionitemviews_games_mousegame_Controller_gameStage.width - star.width)) + "px";
  star.element.style.top = "0px";
  this.views_actionitemviews_games_mousegame_Controller_gameStage.addElement(star);
  this.views_actionitemviews_games_mousegame_Controller_stars.push({"image":star, "isBomb":isBomb});
};


/**
 * @private
 */
views.actionitemviews.games.mousegame.Controller.prototype.views_actionitemviews_games_mousegame_Controller_spawnRedBomb = function() {
  if (this.views_actionitemviews_games_mousegame_Controller_isGameOver)
    return;
  var /** @type {org.apache.royale.jewel.Image} */ redBomb = new org.apache.royale.jewel.Image();
  redBomb.src = "img/nuke.png";
  redBomb.width = 30;
  redBomb.height = 30;
  redBomb.element.style.position = "absolute";
  redBomb.element.style.left = (Math.random() * (this.views_actionitemviews_games_mousegame_Controller_gameStage.width - redBomb.width)) + "px";
  redBomb.element.style.bottom = "0px";
  this.views_actionitemviews_games_mousegame_Controller_gameStage.addElement(redBomb);
  this.views_actionitemviews_games_mousegame_Controller_redBombs.push(redBomb);
};


/**
 * @private
 * @param {org.apache.royale.events.Event} event
 */
views.actionitemviews.games.mousegame.Controller.prototype.views_actionitemviews_games_mousegame_Controller_onGameTick = function(event) {
  for (var /** @type {number} */ i = (this.views_actionitemviews_games_mousegame_Controller_stars.length - 1) >> 0; i >= 0; i--) {
    var /** @type {Object} */ obj = this.views_actionitemviews_games_mousegame_Controller_stars[i];
    var /** @type {org.apache.royale.jewel.Image} */ star = obj["image"];
    var /** @type {boolean} */ isBomb = !!(obj["isBomb"]);
    var /** @type {number} */ currentTop = (parseInt(star.element.style.top, 0) || 0) >> 0;
    currentTop += 5;
    star.element.style.top = currentTop + "px";
    var /** @type {number} */ starX = (parseInt(star.element.style.left, 0) || 0) >> 0;
    var /** @type {number} */ starY = currentTop;
    var /** @type {number} */ basketX = (parseInt(this.views_actionitemviews_games_mousegame_Controller_basket.element.style.left, 0) || 0) >> 0;
    var /** @type {number} */ basketY = (parseInt(this.views_actionitemviews_games_mousegame_Controller_basket.element.style.top, 0) || 0) >> 0;
    if (starY + star.height >= basketY && starX + star.width > basketX && starX < basketX + this.views_actionitemviews_games_mousegame_Controller_basket.width) {
      this.views_actionitemviews_games_mousegame_Controller_handleCatch(obj);
      continue;
    }
    if (starY > this.views_actionitemviews_games_mousegame_Controller_gameStage.height) {
      this.views_actionitemviews_games_mousegame_Controller_gameStage.removeElement(star);
      this.views_actionitemviews_games_mousegame_Controller_stars.splice(i, 1);
    }
  }
  for (var /** @type {number} */ j = (this.views_actionitemviews_games_mousegame_Controller_redBombs.length - 1) >> 0; j >= 0; j--) {
    var /** @type {org.apache.royale.jewel.Image} */ red = /* implicit cast */ org.apache.royale.utils.Language.as(this.views_actionitemviews_games_mousegame_Controller_redBombs[j], org.apache.royale.jewel.Image, true);
    var /** @type {number} */ currentBottom = (parseInt(red.element.style.bottom, 0) || 0) >> 0;
    currentBottom += 5;
    red.element.style.bottom = currentBottom + "px";
    var /** @type {number} */ redX = (parseInt(red.element.style.left, 0) || 0) >> 0;
    var /** @type {number} */ redY = (this.views_actionitemviews_games_mousegame_Controller_gameStage.height - currentBottom) >> 0;
    var /** @type {number} */ basketXX = (parseInt(this.views_actionitemviews_games_mousegame_Controller_basket.element.style.left, 0) || 0) >> 0;
    var /** @type {number} */ basketYY = (parseInt(this.views_actionitemviews_games_mousegame_Controller_basket.element.style.top, 0) || 0) >> 0;
    if (redY <= basketYY + this.views_actionitemviews_games_mousegame_Controller_basket.height && redY + red.height >= basketYY && redX + red.width >= basketXX && redX <= basketXX + this.views_actionitemviews_games_mousegame_Controller_basket.width) {
      this.views_actionitemviews_games_mousegame_Controller_gameOver();
      return;
    }
    if (redY < -red.height) {
      this.views_actionitemviews_games_mousegame_Controller_gameStage.removeElement(red);
      this.views_actionitemviews_games_mousegame_Controller_redBombs.splice(j, 1);
    }
  }
};


/**
 * @private
 * @param {Object} obj
 */
views.actionitemviews.games.mousegame.Controller.prototype.views_actionitemviews_games_mousegame_Controller_handleCatch = function(obj) {
  var /** @type {org.apache.royale.jewel.Image} */ star = obj["image"];
  var /** @type {boolean} */ isBomb = !!(obj["isBomb"]);
  var /** @type {number} */ starX = (parseInt(star.element.style.left, 0) || 0) >> 0;
  var /** @type {number} */ starY = (parseInt(star.element.style.top, 0) || 0) >> 0;
  if (isBomb) {
    this.views_actionitemviews_games_mousegame_Controller_score -= 15;
    this.views_actionitemviews_games_mousegame_Controller_failSound.play();
    this.views_actionitemviews_games_mousegame_Controller_showPointsAnimation("-10", starX, starY, "red");
  } else {
    this.views_actionitemviews_games_mousegame_Controller_score += 10;
    this.views_actionitemviews_games_mousegame_Controller_catchSound.play();
    this.views_actionitemviews_games_mousegame_Controller_showPointsAnimation("-10", starX, starY, "green");
  }
  this.views_actionitemviews_games_mousegame_Controller_gameStage.removeElement(star);
  this.views_actionitemviews_games_mousegame_Controller_stars.splice(this.views_actionitemviews_games_mousegame_Controller_stars.indexOf(obj), 1);
  this.views_actionitemviews_games_mousegame_Controller_gameStage.scoreLabel.text = "Score: " + this.views_actionitemviews_games_mousegame_Controller_score;
  if (this.views_actionitemviews_games_mousegame_Controller_score <= -30) {
    this.views_actionitemviews_games_mousegame_Controller_gameOver();
  }
};


/**
 * @private
 * @param {string} pointsText
 * @param {number} x
 * @param {number} y
 * @param {string} color
 */
views.actionitemviews.games.mousegame.Controller.prototype.views_actionitemviews_games_mousegame_Controller_showPointsAnimation = function(pointsText, x, y, color) {
  var self = this;
  var /** @type {org.apache.royale.jewel.Label} */ pointsLabel = new org.apache.royale.jewel.Label();
  pointsLabel.text = pointsText;
  pointsLabel.element.style.position = "absolute";
  pointsLabel.element.style.left = x + "px";
  pointsLabel.element.style.top = y + "px";
  pointsLabel.element.style.color = color;
  pointsLabel.element.style.fontWeight = "bold";
  pointsLabel.element.style.transition = "top 1s ease-out, opacity 1s ease-out";
  this.views_actionitemviews_games_mousegame_Controller_gameStage.addElement(pointsLabel);
  setTimeout(function() {
    pointsLabel.element.style.top = (y - 50) + "px";
    pointsLabel.element.style.opacity = "0";
  }, 10);
  setTimeout(function() {
    self.views_actionitemviews_games_mousegame_Controller_gameStage.removeElement(pointsLabel);
  }, 200);
};


/**
 * @private
 */
views.actionitemviews.games.mousegame.Controller.prototype.views_actionitemviews_games_mousegame_Controller_gameOver = function() {
  this.views_actionitemviews_games_mousegame_Controller_isGameOver = true;
  this.views_actionitemviews_games_mousegame_Controller_gameTimer.stop();
  this.views_actionitemviews_games_mousegame_Controller_gameStage.gmOvr.visible = true;
  this.views_actionitemviews_games_mousegame_Controller_gameStage.resetBtn.visible = true;
};


/**
 */
views.actionitemviews.games.mousegame.Controller.prototype.resetGame = function() {
  this.views_actionitemviews_games_mousegame_Controller_score = 0;
  this.views_actionitemviews_games_mousegame_Controller_isGameOver = false;
  this.views_actionitemviews_games_mousegame_Controller_gameStage.scoreLabel.text = "Score: 0";
  this.views_actionitemviews_games_mousegame_Controller_gameStage.gmOvr.visible = false;
  this.views_actionitemviews_games_mousegame_Controller_gameStage.resetBtn.visible = false;
  var foreachiter0_target = this.views_actionitemviews_games_mousegame_Controller_stars;
  for (var foreachiter0 in foreachiter0_target) 
  {
  var obj = foreachiter0_target[foreachiter0];
  {
    this.views_actionitemviews_games_mousegame_Controller_gameStage.removeElement(obj["image"]);
  }}
  
  this.views_actionitemviews_games_mousegame_Controller_stars = [];
  var foreachiter1_target = this.views_actionitemviews_games_mousegame_Controller_redBombs;
  for (var foreachiter1 in foreachiter1_target) 
  {
  var red = foreachiter1_target[foreachiter1];
  {
    this.views_actionitemviews_games_mousegame_Controller_gameStage.removeElement(red);
  }}
  
  this.views_actionitemviews_games_mousegame_Controller_redBombs = [];
  this.views_actionitemviews_games_mousegame_Controller_basket.element.style.left = (this.views_actionitemviews_games_mousegame_Controller_gameStage.width / 2 - this.views_actionitemviews_games_mousegame_Controller_basket.width / 2) + "px";
  this.views_actionitemviews_games_mousegame_Controller_gameTimer.start();
};


/**
 */
views.actionitemviews.games.mousegame.Controller.prototype.disposeGame = function() {
  if (this.views_actionitemviews_games_mousegame_Controller_gameTimer) {
    this.views_actionitemviews_games_mousegame_Controller_gameTimer.stop();
    this.views_actionitemviews_games_mousegame_Controller_gameTimer.removeAllListeners();
    this.views_actionitemviews_games_mousegame_Controller_gameTimer = null;
  }
  var foreachiter2_target = this.views_actionitemviews_games_mousegame_Controller_intervalIds;
  for (var foreachiter2 in foreachiter2_target) 
  {
  var i = foreachiter2_target[foreachiter2];
  {
    clearInterval(i);
  }}
  
};


/**
 * Metadata
 *
 * @type {Object.<string, Array.<Object>>}
 */
views.actionitemviews.games.mousegame.Controller.prototype.ROYALE_CLASS_INFO = { names: [{ name: 'Controller', qName: 'views.actionitemviews.games.mousegame.Controller', kind: 'class' }], interfaces: [views.actionitemviews.games.iGame] };



/**
 * Reflection
 *
 * @return {Object.<string, Function>}
 */
views.actionitemviews.games.mousegame.Controller.prototype.ROYALE_REFLECTION_INFO = function () {
  return {
    methods: function () {
      return {
        'Controller': { type: '', declaredBy: 'views.actionitemviews.games.mousegame.Controller', parameters: function () { return [ 'views.actionitemviews.games.mousegame.MouseGame', false ]; }},
        'resetGame': { type: 'void', declaredBy: 'views.actionitemviews.games.mousegame.Controller'},
        'disposeGame': { type: 'void', declaredBy: 'views.actionitemviews.games.mousegame.Controller'}
      };
    }
  };
};
/**
 * @const
 * @type {number}
 */
views.actionitemviews.games.mousegame.Controller.prototype.ROYALE_COMPILE_FLAGS = 9;

//# sourceMappingURL=./Controller.js.map
