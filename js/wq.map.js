var WQ = WQ || {};

(function ($, WQ) {
	
	/***************
	START THE PARTY
	****************/
	WQ.Map = ( function(){
		var _map = {}, _first = true, _ie = false;
		
		/***************
		INIT
		****************/
		function init() {
			_map.view = $('.character-map');
			_map.map = $('.map-container');
			_map.vote = $('.vote');
			_map.cast = $('.large-cast');
			_map.intro = $('.intro')
			_map.rows = Number( _map.map.attr ("row") );
			_map.columns = Number( _map.map.attr ("column") );
			_map.size = {
				w: 5130,
				h: 6600,
				vw: 956,
				vh: 613
			}
			
			if (!Modernizr.canvas) {
				_ie = true;
			} 
			
			_map.z = 1;
			
			_map.position = {x:.64,y:.84};
						
			$(document).on( "zoomChanged", positionMap );
			$(document).on( "castUpdated", positionMap );
			$(document).on( "positionChange", updatePosition );
			$(document).on( "percentChange", updatePercent );
			
			$(window).resize( handleResize );
			setTimeout(loaded, 250);
			
			$(document).on( "animationFinished", animationFinished );
			
			$('.intro-box .close-button').click( closeIntro )
		}
		
		/***************
		CLOSE CAST
		****************/
		function closeIntro () {
			$('.intro').hide();
			$('.link-layer').show();
			
			$(document).trigger( "animationFinished" );
		}
		
		function animationFinished(){
			var w = _map.z*(_map.size.w);
			var h = _map.z*(_map.size.h);
			
			var l = (_map.size.vw/2)-(w*_map.position.x);
			var t = (_map.size.vh/2)-(h*_map.position.y);
			
			_map.links = $('.link-container');
			updateLinks(w,h,l,t);
		}
		
		function loaded(){
			$('.wrapper').show();
			handleResize();
		}
		
		function handleResize(){
			var lp = Number(_map.view.css('left').slice(0,-2));
			var tp = Number(_map.view.css('top').slice(0,-2));
			var bp = Number(_map.view.css('bottom').slice(0,-2));
			var rp = Number(_map.view.css('right').slice(0,-2));
		
			_map.size.vw = $(window).width()-(lp+rp);
			_map.size.vh = $(window).height()-(tp+bp);
			
			_map.view.width( _map.size.vw ).height( _map.size.vh );
			
			if ($(window).width() < 968) {
				$('.voteButton').css('bottom','87px');
			} else {
				$('.voteButton').css('bottom','67px');
			}
			
			_map.vote.width( _map.size.vw ).height( _map.size.vh ).css ( {
				'top':(tp+2)+'px',
				'left':(lp+2)+'px'
			});
			
			_map.cast.width( _map.size.vw ).height( _map.size.vh ).css ( {
				'top':(tp+2)+'px',
				'left':(lp+2)+'px'
			});
			
			_map.intro.width( _map.size.vw ).height( _map.size.vh ).css ( {
				'top':(tp+2)+'px',
				'left':(lp+2)+'px'
			});
			
			
		}
		
		/***************
		CENTER THE MAP
		****************/
		function positionMap(e, data){
			if ( _first ) handleResize();
			
			if ( data ) _map.z = data.zoom;
			
			var w = _map.z*(_map.size.w);
			var h = _map.z*(_map.size.h);
			
			var l = (_map.size.vw/2)-(w*_map.position.x);
			var t = (_map.size.vh/2)-(h*_map.position.y);
			
			if ( _first ){
				_map.map.css ({
					'width': w+'px',
					'height':h+'px',
					'left': l+'px',
					'top': t+'px'
				});
				
				var sw = (w/_map.columns);
				var fs = 6+Math.floor(7*_map.z);
				
				//if (!_ie) {
					$('.square p').css( {
						'width': (1.75*sw)+'px',
						'left': ((1.75*sw)-sw)/-2+'px',		
						'font-size': fs+'px',
						'line-height': fs+'px'
					});
				//}
				
				_first = false;
			} else {
				TweenLite.to(_map.map, .25, {
					css:{
						'width': w+'px',
						'height':h+'px',
						'left': l+'px',
						'top': t+'px'},
					ease:Power4.easeInOut 
				});
				
				var sw = (w/_map.columns);
				var fs = 6+Math.floor(7*_map.z);
				
				//if (!_ie) {
					TweenLite.to('.square p', .25, { 
						css:{
							'width': (1.75*sw)+'px',
							'left': ((1.75*sw)-sw)/-2+'px',		
							'font-size': fs+'px',
							'line-height': fs+'px'},
						ease:Power4.easeInOut 
					});

				//}
			}
			
			$('.ribbon').css( "font-size", fs+'px' ).hide();
			
			_map.links = $('.link-container');
			updateLinks(w,h,l,t);
		}
		
		/***************
		Update Percent based on position on Drag
		****************/
		function updatePosition(e,data){
			var l = data.l;
			var t = data.t;
			
			var w = _map.z*(_map.size.w);
			var h = _map.z*(_map.size.h);
			
			_map.position.x = (_map.size.vw/2-l)/w;
			_map.position.y = (_map.size.vh/2-t)/h;
			
			_map.map.css ({
				'left': l+'px',
				'top': t+'px'
			});
			
			updateLinks(w,h,l,t);
		}
		
		/***************
		Update Links
		****************/
		function updateLinks(w,h,l,t){
			_map.links.each( function() {
				var lk = $(this);
				
				var lw = Number( lk.attr( "width" ) )/100;
				var lh = Number( lk.attr( "height" ) )/100;
				
				lw = w*lw;
				lh = h*lh;
				
				var lt = Number( lk.attr( "top" ) )/100;
				var ll = Number( lk.attr( "left" ) )/100;
				
				ll = l+(ll*w);
				lt = t+(lt*h);
				
				lk.css ({
					'width':lw+'px',
					'height': lh+'px',
					'left':ll+'px',
					'top':lt+'px'
				});
			});
		}
		
		/***************
		Update Percent based on position on Drag
		****************/
		function updatePercent(e,data){
			_map.position.x = data.x;
			_map.position.y = data.y;
		}
						
		/***************
		PUBLIC
		****************/
		return {
			init:init,
			size: function (){
				return {
					w: _map.z*(_map.size.w),
					h: _map.z*(_map.size.h),
					vw: _map.size.vw,
					vh: _map.size.vh,
					x: _map.position.x,
					y: _map.position.y,
					r: _map.rows,
					c: _map.columns,
					cw: (_map.z*(_map.size.w)) / _map.columns,
					rh: (_map.z*(_map.size.h)) / _map.rows,
					l: _map.map.css('left'),
					t: _map.map.css('top')
				}
			}, 
			position: function(obj) {
				if ( obj.r ) {
					var s =  (obj.r-1)/_map.rows;
					var n =  (obj.r)/_map.rows;
					_map.position.y = s+(n-s)/2;

				}
				
				if ( obj.c ) {
					var s = (obj.c-1)/_map.columns;
					var n =  (obj.c)/_map.columns;
					_map.position.x = s+(n-s)/2;
				}
				
				$(document).on( "percentChange", updatePercent );
			} 	
		}
		
	})();
	
	Construct = (function(){
		$(document).ready(function(){
			WQ.Map.init();
			urlParams();
		});
	})();
	
})(jQuery,WQ);

/***************
URL LINK
***************/
function urlParams(){
	var parts = location.search.substring(1).split('&');
		
	var r,c;	
	for (var i = 0; i < parts.length; i++) {
		var nv = parts[i].split('=');
		if ( nv[0]=="zoom" ) {
				WQ.Zoom.setZoom( Number( nv[1] ) );
			}
		if ( nv[0]=="row") {
			r = Number(nv[1]);
		}
		
		if ( nv[0]=="column") {
			c = Number(nv[1]);
		}
	}
	
	if ( r || c ) WQ.Map.position( {r:r, c:c } );
}
		
