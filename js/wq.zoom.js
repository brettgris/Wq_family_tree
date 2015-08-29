var WQ = WQ || {};

(function ($, WQ) {
	
	/***************
	START THE PARTY
	****************/
	WQ.Zoom = ( function(){
		var _z = {current:5,max:7};
		var _zooms = [.3,.4,.5,.6,.7,.8,.9,1];
		var _enabled = false;
		
		/***************
		INIT
		****************/
		function init() {
			_z.max = _zooms.length-1;
		
			$('.zoomin').click ( zoomIn );
			$('.zoomout').click ( zoomOut );
			
			//$('.zoomlevel').text( "Zoom Level: "+(_z.current+1) );
			
			$(document).trigger ("zoomChanged", {zoom: _zooms[ _z.current ]});
			
			$(document).on ("zoomOut", zoomOut);
			$(document).on ("zoomIn", zoomIn);
			
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
		ZOOM IN
		****************/
		function zoomIn() {
			if ( _enabled ){
				_z.current++;
				
				if (_z.current>_z.max) _z.current = _z.max;
				else $(document).trigger ("zoomChanged", {zoom:_zooms[ _z.current ]});
			}
		}
		
		/***************
		ZOOM OUT
		****************/
		function zoomOut() {
			if ( _enabled ){
				_z.current--;
				
				if (_z.current<0) _z.current = 0;
				else $(document).trigger ("zoomChanged", {zoom:_zooms[ _z.current ]});

			}
		}
		
		function zoomTo( num ){
			_z.current = num;
			if ( _z.current < 0) _z.current = 0;
			if (_z.current>_z.max) _z.current = _z.max;
			
			$(document).trigger ("zoomChanged", {zoom:_zooms[ _z.current ]});	
			
		}
						
		/***************
		PUBLIC
		****************/
		return {
			init:init,
			setZoom:zoomTo,
			getZoom: function () {
				return _z.current
			} 	
		}
		
	})();
	
	Construct = (function(){
		$(document).ready(function(){
			WQ.Zoom.init();
		});
	})();
	
})(jQuery,WQ);
