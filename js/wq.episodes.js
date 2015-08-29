var WQ = WQ || {};

(function ($, WQ) {
	
	/***************
	START THE PARTY
	****************/
	WQ.Episodes = ( function(){
		var _current = 1;
		var _slider, _episodes, _width, _start, _fakeSlider;
		var _enabled = false;
	
		/***************
		INIT
		****************/
		function init() {
			$('.episodes li a').click( changeEpisode );
			
			_width = $('.episodes li').width();
			
			var grid = [];
			//_episodes = $('.episodes li').each( function (i) {
			_episodes = $('.active-episode').each( function (i) {
				if ( $(this).attr("current")=="true" ) _current = Number( $(this).find('a').attr('episode') );
				
				$(this).attr( 'episode', i+1 );
				grid.push ( _width );
			});
			
			$('.slider-container').width( (_width* _episodes.length)+8 );
			
			_slider = $('.episode-slider');
			_fakeSlider = $('.fake-slider');
			
			_start = Number ( _slider.css('left').slice(0,-2) );
			
			_slider.css( 'left', (_width*(_current-1))+'px' );
			
			_slider.draggable({
				containment: '.slider-container',
				//grid: grid,
		    	stop: function() {
		            if (_enabled ) {
			            var p = Number(_slider.css('left').slice(0,-2))-_slider.width()/2;
			            
			            _episodes.each ( function (i){
							if ( p>=_width*(i-1) && p<_width*i ) {
								console.log( i );
								
				          		_slider.css( 'left', (_width*i)+'px' );
				          		_fakeSlider.css( 'left', (_width*i)+'px' );
				          		
				          		if ( i+1 != _current ) {
					          		$(document).trigger( "changeEpisode", {current:_current, end:i+1} );
							  		_current = i+1;	
				          		}
				          	}
				            
			            });
		            } else {
			            _slider.css( 'left', (_width*(_current-1))+'px' );
			            _fakeSlider.css( 'left', (_width*(_current-1))+'px' );
		            }
		        }
			});
			
			$(document).on ( "animationStarted", disableZoom );
			$(document).on ( "animationFinished", enableZoom );
		}
		
		/***************
		DISABLE
		****************/
		function disableZoom(){
			_enabled = false;
			
			_slider.hide();
			_fakeSlider.show();
		}
		
		/***************
		ENABLE
		****************/
		function enableZoom(){
			_enabled = true;
			
			_slider.show();
			_fakeSlider.hide();
		}
		
		/***************
		Change Episode
		****************/
		function changeEpisode() {
			if ( _enabled ) {
				var t = $(this);
				var n = Number ( t.attr( 'episode') );
				if ( _current != n ){
					$(document).trigger( "changeEpisode", {current:_current, end:n} );
					_current = n;
					
					var id = Number ( t.parent().attr('episode')-1 );
					
					_fakeSlider.css( 'left', (_width*id)+'px' );
					_slider.css( 'left', (_width*id)+'px' );
					//TweenLite.to( _slider, .25, {left:((_width*id))+'px'});
					
				}
			}		
		}		
						
		/***************
		PUBLIC
		****************/
		return {
			init:init 	
		}
		
	})();
	
	Construct = (function(){
		$(document).ready(function(){
			WQ.Episodes.init();
		});
	})();
	
})(jQuery,WQ);
