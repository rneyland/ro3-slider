(function($) {
	$.fn.css3 = function(props) {
		var css = {};
		var prefixes = ['webkit', 'moz', 'ms', 'o'];
		
		for (var prop in props) {
			for (var i = 0; i < prefixes.length; i++) {
				css['-' + prefixes[i] + '-' + prop] = props[prop];
			}

			css[prop] = props[prop];
		}

		this.css(css);

		return this;
	};

	$.fn.transitionEnd = function(callback) {
		var _this = this;
		var events = ['webkitTransitionEnd', 'transitionend', 'oTransitionEnd'];
	
		for (var i = 0; i < events.length; i++) {
			this.bind(events[i], function(event) {
				for (var j = 0; j < events.length; j++) {
					$(this).unbind(events[j]);
				}	

				if (callback) {
					callback.call(this, event);
				}
			});
		}
		
		return this;
	};
	
	$.diagonalDelayArray = function(rows, cols, speed) {
		var normArr = [],
			diagArr = [],
			delayFactor = Math.ceil(speed / (cols + (rows - 2))),
			index = 0;

		for(var i = 0; i < rows; i++) {
			normArr[i] = [];
			for(var j = 0; j < cols; j++) {
				normArr[i][j] = index;
				index++;
			}
		}
	
		for (var k = 0; k < (cols + (rows - 1)); k++) {
			for (var l = 0; l < rows; l++) {
				if ((k - l) >= 0 && (k - l) < cols) {
					diagArr[normArr[l][k - l]] = (k * delayFactor);
				}
			}
		}

		return diagArr;
	};
	
	$.randomDelayArray = function(rows, cols, speed) {
		randArr = [];
		for (var i = 0; i < (rows * cols); i++) {
			randArr[i] = Math.floor(Math.random() * speed);
		}

		return randArr;
	};
	
	ro3.transition = function(ro3slider, opts) {
		this.slider = ro3slider;
		this.opts = opts;
		
	};
	
	ro3.transition.prototype = {
		constructor: ro3.transition,
		completed: false,
		
		run: function() {
			var _this = this;
			
			if (this.opts.setup !== undefined) {
				this.opts.setup.call(this);
			}

			this.slider.transContainer.css('overflow', 'visible');

			setTimeout(function() {
				if (_this.opts.run !== undefined) {
					_this.opts.run.call(_this);
				}
			}, 50);
		},
		
		complete: function() {
			if (this.completed) {
				return;
			}
			
			this.completed = true;
			this.slider.transContainer.css('overflow', 'hidden');
			this.slider.setupImages();
			this.slider.transContainer.children().remove();
			this.slider.animating = false;
		}
	};

	ro3.transitions = {};	
		
	ro3.grid_builder = function(ro3slider, opts) {
		return new ro3.transition(ro3slider, $.extend({
			setup: function() {
				var delayArray = (this.opts.diagonal) ? this.opts.diagDelayArray : this.opts.randDelayArray,		
					fragment = document.createDocumentFragment(),
					pos = 0;
				
				for (var i = 0; i < this.opts.cols; i++) {
					var tileWidth = ((i == this.opts.cols - 1) ? (this.opts.colWidth + this.opts.colExtra) : this.opts.colWidth),
						tileLeft = i * this.opts.colWidth;
						
					for (var j = 0; j < this.opts.rows; j++) {
						var tileHeight = ((j == this.opts.cols - 1) ? (this.opts.rowHeight + this.opts.rowExtra) : this.opts.rowHeight),
							tileTop = j * this.opts.rowHeight;
							
						var tile = $('<div class="tile" id="tile-' + i + '-' + j + '"></div>').css({
								width: tileWidth,
								height: tileHeight,
								left: tileLeft,
								top: tileTop
							});
						
						this.opts.tileRendered.call(this, tile, pos, tileLeft, tileTop, delayArray[pos]); 
						
						fragment.appendChild(tile.get(0));
						pos ++;
					}
				}
				
				this.slider.transContainer.get(0).appendChild(fragment);
			},
			
			run: function() {},
			
			tileRendered: function(elem, pos, left, top, delay) {}

		}, opts));
	};
	
})(window.jQuery);