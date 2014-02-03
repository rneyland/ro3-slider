(function($) {
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