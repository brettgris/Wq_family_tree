var WQ = WQ || {};

(function ($, WQ) {
	
	/***************
	START THE PARTY
	****************/
	WQ.Drag = ( function(){
		var _drag = {drag:false};
		var $s=100, $t=0;
		var _enabled = true;
		var _mouse = false;
		var _ie = false;
		
		/***************
		INIT
		****************/
		function init() {
			_drag.c = $('.drag-container');
			_drag.map = $('.map-container');
			_drag.cont = $('.character-map');
			
			if (!Modernizr.canvas) {
				_ie = true;
			} 
			
			$('.wrapper').mousewheel(function(event, delta, deltaX, deltaY) {
				if ( _enabled ){
					if ( deltaY>0 ) $(document).trigger ("zoomIn");
					if ( deltaY<0 ) $(document).trigger ("zoomOut");
				}
			});
			
			_drag.c.dblclick ( function(e) {
				var mx = Number( _drag.cont.css('left').slice(0,-2) );
				var my = Number( _drag.cont.css('top').slice(0,-2) );
				
				_drag.position = {
					x: Number( _drag.map.css('left').slice(0,-2) ),
					y: Number( _drag.map.css('top').slice(0,-2) )
				}
				
				var x = e.pageX-mx;
				var y = e.pageY-my;
				
				var xp = (x-_drag.position.x)/ _drag.map.width();
				if (xp<0) xp=0;
				if (xp>1) xp=1;
				
				var yp = (y-_drag.position.y)/ _drag.map.height();
				if (yp<0) yp=0;
				if (yp>1) yp=1;
				
				if ( _enabled ) {
					$(document).trigger ("percentChange", {x:xp, y:yp});
					$(document).trigger ("zoomIn");
				}
			});
			
			_drag.c.mousedown( function(e){
				_mouse = true;
			
				if ( _enabled ) {
					e.preventDefault();
					
					_drag.drag = true;
					_drag.start ={
						x:e.pageX,
						y:e.pageY
					}
					
					_drag.position = {
						x: Number( _drag.map.css('left').slice(0,-2) ),
						y: Number( _drag.map.css('top').slice(0,-2) )
					}
				}	
			});
			
			_drag.c.mousemove( function(e){
				if ( _enabled ) {
					if(_drag.drag) {
						var l = (e.pageX-_drag.start.x)+_drag.position.x;
						var t = (e.pageY-_drag.start.y)+_drag.position.y;
						
						var mxl = _drag.cont.width()/2;
						var mnl = _drag.cont.width()/2-_drag.map.width();
						if (l>mxl) l=mxl;
						if (l<mnl) l=mnl;
						
						var mxt = _drag.cont.height()/2;
						var mnt = _drag.cont.height()/2-_drag.map.height();
						if (t>mxt) t=mxt;
						if (t<mnt) t=mnt;
						
						$(document).trigger ("positionChange", {l: l, t: t});
					}
				}
			});
			
			$(document).mouseup( function(e){
				_mouse = false;
				_drag.drag = false;
			});
			
			
			var element = document.getElementById('drag');
			
			if (!_ie) {
				Hammer(element).on("touch drag transform", function(e) {
					if ( _enabled && !_mouse) {
						var d = {
							x: e.gesture.touches[0].pageX-$t.x,
							y: e.gesture.touches[0].pageY-$t.y
						}
						
						if ( e.type=="touch" ){
							e.preventDefault();
							
							_drag.position = {
								x: Number( _drag.map.css('left').slice(0,-2) ),
								y: Number( _drag.map.css('top').slice(0,-2) )
							}
							$s = 100;
							
							$t = {x:e.gesture.touches[0].pageX, y:e.gesture.touches[0].pageY};
						} else if ( e.type=="drag" ) {
							
							
							if (d.x>100 || d.x<-100 || d.y > 100 || d.y<-100 ) {
								
							} else {					
								var l = d.x+_drag.position.x;
								var t = d.y+_drag.position.y;
								
								var mxl = _drag.cont.width()/2;
								var mnl = _drag.cont.width()/2-_drag.map.width()
								if (l>mxl) l=mxl;
								if (l<mnl) l=mnl;
									
								var mxt = _drag.cont.height()/2;
								var mnt = _drag.cont.height()/2-_drag.map.height()
								if (t>mxt) t=mxt;
								if (t<mnt) t=mnt;
								
								$(document).trigger ("positionChange", {l: l, t: t});
							}
							
							_drag.position = {
								x: Number( _drag.map.css('left').slice(0,-2) ),
								y: Number( _drag.map.css('top').slice(0,-2) )
							}
						} else if ( e.type=="transform" ) {
							_drag.position = {
								x: Number( _drag.map.css('left').slice(0,-2) ),
								y: Number( _drag.map.css('top').slice(0,-2) )
							}
							
							$t = {x:e.gesture.touches[0].pageX, y:e.gesture.touches[0].pageY};
							
							var p = Math.round( e.gesture.scale*100 );
						
							if ( p<$s-25 ) {
								$(document).trigger ("zoomOut");
								$s-=25;
							}
							
							if ( p>$s+25 ) {
								$(document).trigger ("zoomIn");
								$s+=25;
							}
							
						}
						
						$t = {x:e.gesture.touches[0].pageX, y:e.gesture.touches[0].pageY};
					}
				});
			}
			
			
			$('.drag-container').on('touchstart', function(e){
				e.preventDefault();
			});
			
			$('.wrapper').mousedown( function(e){
				e.preventDefault();
			});
			
			$(document).on ( "animationStarted", disableZoom );
			$(document).on ( "animationFinished", enableZoom );
		}
		
		/***************
		DISABLE
		****************/
		function disableZoom(){
			_enabled = false;
		}
		
		/***************
		ENABLE
		****************/
		function enableZoom(){
			_enabled = true;
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
			WQ.Drag.init();
		});
	})();
	
})(jQuery,WQ);
