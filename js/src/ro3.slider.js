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
})(window.jQuery);