window.ro3 = {
	version: 'beta'
};

(function($) {
	ro3.slider = function(elem, opts) {
		var _this = this;
		
		// options
		this.opts = $.extend({
			transitions: [ 'blocks1', 'blocks2' ],
			navigation: true,
			rows: 6,
			cols: 6,
			blockSpeed: 1000
		}, opts);

		this.element = $(elem);
		this.animating = true;
		this.images = []; 
		this.currIndex = 0;
		this.prevIndex = 0;

		this.wrapper = $('<div id="ro3-slider"></div>');
		this.surface = $('<div id="surface"></div>');
		this.imageContainer = $('<div id="images"></div>');
		this.transContainer = $('<div id="transitions"></div>');

		this.surface.append(this.imageContainer, this.transContainer);
		this.wrapper.append(this.surface);
		this.element.append(this.wrapper);

		// find & remove images
		this.element.find('img').each(function(index, img) {
			_this.images.push( $(img).clone());
			$(img).remove();
		});

		// preload images
		var loaded = 0;

		for (var i = 0; i < this.images.length; i++) {
			var image = new Image();
			
			image.onload = function() {
				loaded ++;

				_this.width = (_this.width && (_this.width >= this.width)) ? _this.width : this.width;
				_this.height = (_this.height && (_this.height >= this.height)) ? _this.height : this.height;

				if (loaded >= _this.images.length) {
					_this.doneLoading();
					_this.setupImages();
				}
			}
			image.src = _this.images[i].attr('src');
		}
	};
	
	ro3.slider.prototype = {
		constructor: ro3.slider,
		
		doneLoading: function() {
			var _this = this,
				boxStyle = {
					width: this.width + 'px',
					height: this.height + 'px'
				};

			this.wrapper.css(boxStyle);
			this.surface.css(boxStyle);
			this.transContainer.css(boxStyle);
			this.imageContainer.css(boxStyle).css('opacity', 1).append(this.images)
			
			for (var i = 0; i < this.images.length; i++) {
				this.images[i]
					.width(this.width)
					.height(this.height);
			}

			this.configure();
		},

		configure: function() {
			var imgWidth = Math.floor(this.imageContainer.width()),
				imgHeight = Math.floor(this.imageContainer.height());

			this.opts.randDelayArray = $.randomDelayArray(this.opts.rows, this.opts.cols, this.opts.blockSpeed);
			this.opts.diagDelayArray = $.diagonalDelayArray(this.opts.rows, this.opts.cols, this.opts.blockSpeed);
					
			this.opts.colWidth = Math.floor(imgWidth / this.opts.cols);
			this.opts.rowHeight = Math.floor(imgHeight / this.opts.rows);
					
			this.opts.colExtra = imgWidth - (this.opts.colWidth * this.opts.cols);
			this.opts.rowExtra = imgHeight - (this.opts.rowHeight * this.opts.rows);

			// transition handling
			if (this.opts.transitions === 'all') {
				this.opts.transitions = [];
				for (var fx in ro3.transitions)
					this.opts.transitions.push(fx);
			}
			else if (!$.isArray(this.opts.transitions)) {
				this.opts.transitions = $.makeArray(this.opts.transitions);
			}

			//nav handling
			if (this.opts.navigation) {
				this.setupNav();
			}

			this.animating = false;
		},

		setupNav: function() {
			var _this = this;

			this.navPrev = $('<a id="nav-prev" href="#"><</a>')
				.css('line-height', this.height + 'px')
				.click(function(e) {
					e.preventDefault();
					_this.prev();
				});

			this.navNext = $('<a id="nav-next" href="#">></a>')
				.css('line-height', this.height + 'px')
				.click(function(e) {
					e.preventDefault();
					_this.next();
				});

			this.pagination = $('<ul id="pagination"></ul>');

			for (var i = 0; i < this.images.length; i++) {
				var li = $('<li data-index="' + i + '"></li>')
					.click(function(e) {
						e.preventDefault();
						_this.updateIndex($(e.target).data('index'));
					});
				this.pagination.append(li);
			}

			this.surface.append(this.navPrev, this.navNext, this.pagination);
			this.pagination.css('left', (this.width / 2) - (this.pagination.outerWidth() / 2) + 'px');
		},

		setupImages: function() {
			this.imageContainer.find('img.active').removeClass('active');
			this.imageContainer.find('img').eq(this.currIndex).addClass('active');

			this.pagination.find('li.active').removeClass('active');
			this.pagination.find('li').eq(this.currIndex).addClass('active');
		},
		
		updateIndex: function(destIndex) {
			if (!this.animating) {		
				this.prevIndex = this.currIndex;
				this.currIndex = destIndex;
				
				if (this.currIndex > this.images.length - 1) {
					this.currIndex = 0;
				}
				
				if (this.currIndex < 0) {
					this.currIndex = this.images.length - 1;
				}
					
				this.transition();
			}
		},
		
		next: function() {
			this.updateIndex(this.currIndex + 1);
		},
		
		prev: function() {
			this.updateIndex(this.currIndex - 1);
		},
		
		transition: function() {
			this.animating = true;

			var index = Math.floor(Math.random() * this.opts.transitions.length),
				trans = this.opts.transitions[index];
			
			t = new ro3.transitions[trans](this, this.opts);
			
			t.run();
		}
	};
})(window.jQuery);(function($) {
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
	
})(window.jQuery);(function($) {
	ro3.transitions.blocks1 = function(ro3slider, opts) {
		return new ro3.grid_builder(ro3slider, $.extend({
			diagonal: false,
			tileRendered: function(elem, pos, left, top, delay) {
				$(elem)
					.css({
						'background-image': 'url("' + this.slider.images[this.slider.currIndex].attr('src') + '")',
						'background-position': '-' + left + 'px -' + top + 'px',
						'background-size': this.slider.width + 'px ' + this.slider.height + 'px'
					})
					.css3({
						'transition-duration': '350ms',
						'transition-timing-function': 'ease-in',
						'transition-property': 'all',
						'transition-delay': delay + 'ms',
						'transform': 'scale(0.8)'
					});
				
				if (this.maxDelay === undefined) {
					this.maxDelay = 0;
				}

				if (delay > this.maxDelay) {
					this.maxDelay = delay;
					this.maxDelayTile = elem;
				}
			},
			
			run: function() {
				var _this = this,
					blocks = this.slider.transContainer.find('div.tile');
				
				this.maxDelayTile.transitionEnd(function() {
					_this.complete();
				});
				
				setTimeout(function() {
					for (var i = 0; i < blocks.length; i ++) {
						$(blocks[i])
							.css('opacity', 1)
							.css3({'transform': 'scale(1)'});
					}
				}, 50);	
			}

		}, opts));
	};

})(window.jQuery);(function($) {
	ro3.transitions.blocks2 = function(ro3slider, opts) {
		return new ro3.grid_builder(ro3slider, $.extend({
			diagonal: true,
			tileRendered: function(elem, pos, left, top, delay) {
				$(elem)
					.css({
						'background-image': 'url("' + this.slider.images[this.slider.currIndex].attr('src') + '")',
						'background-position': '-' + left + 'px -' + top + 'px',
						'background-size': this.slider.width + 'px ' + this.slider.height + 'px'
					})
					.css3({
						'transition-duration': '350ms',
						'transition-timing-function': 'ease-in',
						'transition-property': 'all',
						'transition-delay': delay + 'ms',
						'transform': 'scale(0.8)'
					});
				
				if (pos === (this.opts.rows * this.opts.cols) - 1) {
					this.maxDelayTile = elem;
				}
			},
			
			run: function() {
				var _this = this,
					blocks = this.slider.transContainer.find('div.tile');
				
				this.maxDelayTile.transitionEnd(function() {
					_this.complete();
				});
				
				setTimeout(function() {
					for (var i = 0; i < blocks.length; i++) {
						$(blocks[i])
							.css('opacity', 1)
							.css3({'transform': 'scale(1)'});
					}
				}, 50);	
			}
			
		}, opts));
	};

})(window.jQuery);