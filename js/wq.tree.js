var WQ = WQ || {};

(function ($, WQ) {
	
	/***************
	START THE PARTY
	****************/
	WQ.Tree = ( function(){
		var $grid = {}, $data, _cast = [], _connection = [], _related = [], _map, _photos, $troph, $winners;
		var _current = 1;
		var DELAY = .5;
		var SPEED = .75;
		var STARTDELAY = 1;
		var CHARSPEED = .5;
		var _z = 4;
		
		/***************
		INIT
		****************/
		function init() {
			_map = $('.map-container');
			
			$('.active-episode').each( function(){
				if ( $(this).attr("current")=="true" ) _current = Number( $(this).find('a').attr('episode') );
			});
		
			
			$(document).on ( "changeEpisode", changeEpisode );
			$(document).on ( "updateCast", updateCast );
			
			$('.link-layer').hide();
			
			//updateCast();
		}
		
		/***************
		JSON FEED
		****************/
		function loadData ( $path ) {
			$.ajax ({
				type:'GET',
				url: $path,
				dataType:'xml',
				success: dataLoaded, 
				error: loadError
			});	
		}
		
		function updateCast(e, data){
			$winners = data.w;
			
			loadData( "data/data.xml");
		}
		
		/***************
		DATA LOADED
		****************/
		function dataLoaded(data) {
			$data = $(data);
			
			$('.data').show();

			var cast = $data.find('characters').find('cast');
			cast.each (function( i ) {
				var d = $('.data');
				
				var t;
				
				try {
					t = $(this).appendTo( d );
				} catch(e){
					t = $(this);
				}
				
				_cast.push( t );
				_related[ t.attr('id') ]=i;
			})
			
			try {
				updateXMLWithWinners();
			} catch(e){
			}
						
			var connections = $data.find('connections').find('connection');
			connections.each ( function() {
				var t = $(this);
				var n = t.find('number').text();
				
				_connection[n] = t;
			});
			
			$('.data').hide();
			
			buildGrid();	
		}
		
		function updateXMLWithWinners(){
			
		
			for ( var a=0;a<_cast.length;a++ ) {
				var t = _cast[a];
				
				for ( var i=0; i<$winners.length; i++ ) {
					if( $winners[i].id == t.attr('id') ) {
						var match = false;
						t.find('episode').each( function(){
							var e = $(this);
							
							if ( $winners[i].e == e.attr('id') ) {
								match = true;
								
								var icons = e.find('icons');
								
								if ( icons.length<1) {
									icons = $("<icons></icons>").appendTo( e );
								}
								
								var icon = $("<icon><title>"+$winners[i].name+"</title><trophy>"+$winners[i].path+"</trophy></icon>").appendTo( icons );
							}
						});
						
						
						
						if (!match) {
							var e= $( '<episode id="'+$winners[i].e+'"></episode>').appendTo( t );
							var icons = $("<icons></icons>").appendTo( e );
							var icon = $("<icon><title>"+$winners[i].name+"</title><trophy>"+$winners[i].path+"</trophy></icon>").appendTo( icons );
						}
						
					}
				}
			}
		}
		

		/***************
		ERROR LOAD
		****************/
		function loadError(jqXHR, textStatus, errorThrown) {
			//console.log ( "DATA loaderror" , errorThrown );	
		}
		
		/***************
		BUILD THE GRID
		****************/
		function buildGrid(){
			$grid.mc = $('.map-container');
			$grid.ll = $('.link-layer');
			$grid.r = Number( $grid.mc.attr("row") );
			$grid.c = Number( $grid.mc.attr("column") );
			
			$grid.items = [ ];
			for ( var i=0;i<$grid.r;i++){
				$grid.items[i] = [ ];
				for ( var a=0;a<$grid.c;a++){
					$grid.items[i].push ( '' );
				}
			}
			
			for (var i=0;i<_cast.length;i++) {
				var p=undefined, r = undefined, c=undefined, icons = {};
				
				_cast[i].find('episode').each( function () {
					var t = $(this);
					var n = Number( t.attr('id') );
					
					if ( n<=_current ){
						if (  t.find( 'row' ).text()!="" ) r = Number (  t.find( 'row' ).text() );
						if (  t.find( 'column' ).text()!="" ) c = Number (  t.find( 'column' ).text() );
						if (  t.find( 'photo' ).text()!="" ) p = t.find( 'photo' ).text();
						
						if ( n == _current) icons = t.find('icons').find('icon');
						
					}
				});
				
				if ( r!=undefined && c!=undefined ){
					$grid.items[r-1][c-1] = {};
					$grid.items[r-1][c-1].content = '<img class="cast-image" src="'+p+'" />';
					$grid.items[r-1][c-1].content += '<p>'+_cast[i].find('name').text()+'</p>';
									
					$grid.items[r-1][c-1].id = _cast[i].attr('id');
					$grid.items[r-1][c-1].type = "cast";
					$grid.items[r-1][c-1].icons = icons;
				}
			}
			
			for (var i=0;i<_connection.length;i++) {
				if ( _connection[i] != undefined ) {
					var p=undefined, r = undefined, c=undefined, type = undefined;
					
					_connection[i].find('episode').each( function() {
						var t= $(this);
						var n = Number( t.attr('id') );
					
						if ( n<=_current ){
							if (  t.find( 'row' ).text()!="" ) r = Number (  t.find( 'row' ).text() );
							if (  t.find( 'column' ).text()!="" ) c = Number (  t.find( 'column' ).text() );
							if (  t.find( 'img' ).text()!="" ) p = t.find( 'img' ).text();
							
							if ( n == _current ) type = t.attr('type')
						}
					});
					
					if ( r!=undefined && c!=undefined && type!="none" ){
						$grid.items[r-1][c-1] = {};
						$grid.items[r-1][c-1].content = '<img class="connection-image" src="'+p+'" />';
						$grid.items[r-1][c-1].id = 'connection'+_connection[i].find( 'number' ).text();
					}
				}
			}	
			
			for ( var i=0;i<$grid.r;i++){
				for ( var a=0;a<$grid.c;a++){
					if( $grid.items[i][a] != '' ) buildItem( i, a,  $grid.items[i][a].id,  $grid.items[i][a].content, $grid.items[i][a].type, $grid.items[i][a].icons );
				}			
				
			}
			
			$(document).trigger ( "castUpdated" );
		}
		
		/***************
		BUILD GRID ITEM
		****************/
		function buildItem(r,c,id,content,type, icons) {
			var iw = (1/$grid.c)*100;
			var ih = (1/$grid.r)*100;
			var it = (1/$grid.r)*(100*r);
			var il = (1/$grid.c)*(100*c);
			
			var s= '<div class="square" id="'+id+'" r="'+r+'" c="'+c+'" style="width:'+iw+'%; height:'+ih+'%; left:'+il+'%; top:'+it+'%;">'
			s+= content;
			
			if ( type =="cast") { 
				
				var v = 0;
				if ( icons.length != undefined ) {
					icons.each( function(i) {
						s+= '<div class="trophy trophy'+i+'" id="trophy'+i+'-'+id+'" >'
						s+= '<div class="ribbon"><div class="ribbonText"><span>'+$(this).find('title').text()+'</span></div><div class="ribbonTail"><img src="img/icons/ribbonTail.png" /></div></div>';
						
						s+=	'<div class="icon"><img src="'+$(this).find('trophy').text()+'_tiny.png" /></div>';
						s+= '</div>';
						v++;
					});
					
				}

			}
			
			s+='</div>';
			$grid.mc.append( s );
			
			if ( type =="cast") {
				var s = '<div class="link-container" id="lc-'+id+'" width="'+iw+'" height="'+ih+'" left="'+il+'" top="'+it+'" >';
				
				var v = 0;
				if ( icons.length != undefined ) {
					icons.each( function(i) {
						s += '<a href="javascript:void(0);" class="trophylink trophy'+i+'" name="trophy'+i+'-'+id+'">&nbsp;</a>';
						v++;
					});
				}			
				
				s+= '<a href="javascript:void(0);" class="link-item" id="l-'+id+'">&nbsp;</a>';
				s+= '</div>';
					
				$grid.ll.append( s );
			}
		}
		
		/***************
		CHANGE EPISODE
		****************/
		function changeEpisode(e, data) {
			var current = data.current;
			var end = data.end;
			
			if (current<end) episodeForward(current,end);
			else episodeBackwards(current, end);
			
			_episode = end;
			_current = end;
		}
		
		/***************
		EPISODE FORWARD 
		****************/
		function episodeForward(current,end) {
			var changes = [];
			
			_z = WQ.Zoom.getZoom();
			WQ.Zoom.setZoom( 1 );
			
			var tl = new TimelineLite();
						
			tl.call( animationStarted );
			
			var ms = WQ.Map.size();
			
			var d = STARTDELAY;
			_photos = [];
			
			$('.highlight').remove();
			
			for ( var i=current+1; i<=end; i++ ){
				changes[i] = [];
				
				for (var a=0;a<_cast.length;a++) {
					var r, c;
					
					_cast[a].find('episode').each( function(){
						var t = $(this);
						var id = Number( t.attr('id') );
						
						//CENTER TO WHERE
						if ( t.find('row').length > 0 ) r = Number( t.find('row').text() );
						if ( t.find('column').length > 0 ) c = Number( t.find('column').text() );
						
						var div = $('#'+_cast[a].attr('id') );
						div.find( '.trophy' ).remove();
								
						var lc = $('#lc-'+_cast[a].attr('id') );
						lc.find('.trophylink').remove();
						
						if ( id == i ) {
							var p = t.attr('type');
							if ( t.find('icons icon').length>0 ) {
								
								updateIcons( _cast[a], end );
							}
								
							if ( p!=undefined ) {
								
								var xp = (c-1)/ms.c;
								var l = ((ms.vw/2)-(ms.w*xp))-ms.cw/2;
								
								var yp = (r-1)/ms.r;
								var tp = ((ms.vh/2)-(ms.h*yp))-ms.rh/2;
								
								if (p=="photo") {
									tl.to( _map, SPEED, {
										css:{
											'top': tp+'px',
											'left': l+'px'	
										}, delay:d,
										ease:Power3.easeInOut
									});
								
									_photos.push ( {obj:_cast[a], photo: t.find('photo').text(), connection:t.find('connection').text(), episode: id, c: current, related:t.find('related').text(), type:p, size:ms, h:t.find('highlight').text() } );
									tl.call( swapImage );
								} else if (p=="connection") {
									tl.to( _map, SPEED, {
										css:{
											'top': tp+'px',
											'left': l+'px'	
										}, delay:d,
										ease:Power3.easeInOut
									});
								
									_photos.push ( {obj:_cast[a], connection:t.find('connection').text(), episode: id, end:i, related:t.find('related').text(), type:p, size:ms, h:t.find('highlight').text() } );
									tl.call( updateConnections );
								} else if (p=="new"){
									tl.to( _map, SPEED, {
										css:{
											'top': tp+'px',
											'left': l+'px'	
										}, delay:d,
										ease:Power3.easeInOut
									});
									
									_photos.push ( {obj:_cast[a], photo: t.find('photo').text(), connection:t.find('connection').text(), episode: id, related:t.find('related').text(), type:p, size:ms, h:t.find('highlight').text() } );
									tl.call( swapImage );
									
								} else if (p=="move") {
									var nr = Number( t.find('row').text() );
									var nc = Number( t.find('column').text() );
									var nxp = (nc-1)/ms.c;
									var nyp = (nr-1)/ms.r;
									var nl = ((ms.vw/2)-(ms.w*nxp))-ms.cw/2;
									var ntp = ((ms.vh/2)-(ms.h*nyp))-ms.rh/2;
									
									tl.to( _map, SPEED, {
										css:{
											'top': ntp+'px',
											'left': nl+'px'	
										}, delay:d,
										ease:Power3.easeInOut
									});
									
									var obj = $('#'+_cast[a].attr('id') );
									
									_photos.push ( {connection:t.find('connection').text(), episode: id, related:t.find('related').text(), h:t.find('highlight').text() });
									
									var lk = $('#l-'+_cast[a].attr('id'));
									
									
									lk.parent().css({
										'top':(nyp*100)+'%',
										'left':(nxp*100)+'%'
									});
									
									
									lk.parent().attr( 'left', nxp*100 );
									lk.parent().attr( 'top', nyp*100 );
									
									
									tl.to( obj, CHARSPEED, {
										css: {
											'top':(nyp*100)+'%',
											'left':(nxp*100)+'%'	
										},delay:d,
										ease:Power3.easeInOut
									});
									
									
									tl.call( updateConnections );
									
								}
								
								
								d = DELAY;
							} 
						}
						
						if ( id == current ) {
							if ( t.find('icons icon').length>0 ) {
								updateIcons( _cast[a], end );
							}
						}
					});
				}
					
			}
			
			tl.to( _map, SPEED, {delay: d} );
			
			tl.call ( resetZoom );
			
			tl.call( animationFinished );
			
			tl.play();
		}
		
		/***************
		EPISODE BACKWARDS 
		****************/
		function episodeBackwards(current, end) {
			var changes = [];
			
			_z = WQ.Zoom.getZoom();
			WQ.Zoom.setZoom( 1 );
			
			var tl = new TimelineLite();
			tl.call( animationStarted );
			
			var ms = WQ.Map.size();
			
			var d = STARTDELAY;
			_photos = [];
			
			$('.highlight').remove();
			
			for ( var i=current; i>end; i-- ){
				changes[i] = [];

				for (var a=_cast.length-1;a>=0;a--) {
					var r = Number( _cast[a].find('episode').eq(0).find('row').text() );
					var c = Number( _cast[a].find('episode').eq(0).find('column').text() );
					
					var photo;
					
					_cast[a].find('episode').each( function(){
						var t = $(this);
						var id = Number( t.attr('id') );
						
						if ( id == i ) {
							var p = t.attr('type');
							
							if ( t.find('icons icon').length>0 ) {
								updateIcons( _cast[a], end );
							}
							
							if ( p!=undefined ) {
								var xp = (c-1)/ms.c;
								var l = ((ms.vw/2)-(ms.w*xp))-ms.cw/2;
								
								var yp = (r-1)/ms.r;
								var tp = ((ms.vh/2)-(ms.h*yp))-ms.rh/2;
								
								if (p=="photo") {
									tl.to( _map, SPEED, {
										css:{
											'top': tp+'px',
											'left': l+'px'	
										}, delay:d,
										ease:Power3.easeInOut
									});
								
									_photos.push ( {obj:_cast[a], photo: photo, connection:t.find('connection').text(), episode: id, end:i, related:t.find('related').text(), type:p, size:ms } );
									tl.call( swapImageBackwards );
								} else if (p=="connection") {
									tl.to( _map, SPEED, {
										css:{
											'top': tp+'px',
											'left': l+'px'	
										}, delay:d,
										ease:Power3.easeInOut
									});
								
									_photos.push ( {obj:_cast[a], photo: photo, connection:t.find('connection').text(), episode: id, end:i, related:t.find('related').text(), type:p, size:ms } );
									tl.call( updateConnectionsBackwards );
								}else if (p=="new"){
									tl.to( _map, SPEED, {
										css:{
											'top': tp+'px',
											'left': l+'px'	
										}, delay:d,
										ease:Power3.easeInOut
									});
									
									_photos.push ( {obj:_cast[a], photo: photo, connection:t.find('connection').text(), episode: id, end:i, related:t.find('related').text(), type:p, size:ms } );
									tl.call( swapImageBackwards );
								} else if ( p=="move" ){
									var nr = r;
									var nc = c;
									
									var nxp = (nc-1)/ms.c;
									var nyp = (nr-1)/ms.r;
									var nl = ((ms.vw/2)-(ms.w*nxp))-ms.cw/2;
									var ntp = ((ms.vh/2)-(ms.h*nyp))-ms.rh/2;
									
									tl.to( _map, SPEED, {
										css:{
											'top': ntp+'px',
											'left': nl+'px'	
										}, delay:d,
										ease:Power3.easeInOut
									});
									
									var obj = $('#'+_cast[a].attr('id') );
									
									_photos.push ( {connection:t.find('connection').text(), episode: id, end:i, related:t.find('related').text() });
									
									var lk = $('#l-'+_cast[a].attr('id'));
									lk.parent().css({
										'top':(nyp*100)+'%',
										'left':(nxp*100)+'%'
									});
									
									lk.parent().attr( 'left', nxp*100 );
									lk.parent().attr( 'top', nyp*100 );
									
									tl.call( updateConnectionsBackwards );
									
									tl.to( obj, CHARSPEED, {
										css: {
											'top':(nyp*100)+'%',
											'left':(nxp*100)+'%'	
										},delay:d,
										ease:Power3.easeInOut
									});
									
									
								}
								
								d = DELAY;
							} 
						}
						
						if ( id == end ) {
							if ( t.find('icons icon').length>0 ) {
								updateIcons( _cast[a], end );
							}
						}
						
						var ur = Number( t.find('row').text() );
						var uc = Number( t.find('column').text() );
						
						if ( ur != '' ) r = ur;
						if ( uc != '' ) c = uc;
						
						if ( t.find('photo').text()!="" ) photo = t.find('photo').text();
					});
				}
			}
			
			tl.to( _map, SPEED, {delay: d} );
			
			tl.call ( resetZoom );
			
			tl.call( animationFinished );
			tl.play();
		}
		
		/***************
		SWAP IMAGES
		****************/
		function swapImage(){
			//ADD CONNECTIONS
			var c = _photos[0].connection;
			if ( c!='' ) {
				var a = c.split(" ");
				for ( var i=0;i<a.length;i++){
					var connection = _connection[Number( a[i] )];
					connection.find( 'episode' ).each( function() {
						var t = $(this);
						
						if ( Number(t.attr('id'))==_photos[0].episode ){
							if ( $('#connection'+Number( a[i] ) ).length<1 ){
								 var row = Number(t.find('row').text());
								 var col = Number(t.find('column').text());
								 var id = 'connection'+Number( a[i] );
								 var content = '<img class="connection-image" src="'+t.find( 'img' ).text()+'" />';
							 
								 buildItem( row-1 ,col-1 ,id,content,"connection")
							 } else {
							 	if ( t.attr('type')=="none" ) $('#connection'+Number( a[i] ) ).remove();		 	
							 	else {
							 		$('#connection'+Number( a[i] ) ).find('.connection-image').attr('src', t.find( 'img' ).text() );
							 	}
							 }
							 
							 var h = t.find('highlight').text();
							 if( h!="" &&  h!=undefined) $('#connection'+Number( a[i] ) ).append( $('<div class="highlight"><img src="'+h+'" /></div>') );
							 if ( t.find('highlight').attr('type')=="none" ) {
							 	var hg = $('#connection'+Number( a[i] ) ).find('.highlight');
							 	
							 	hg.eq( hg.length-1 ).remove();
							 }
							 
						}
					})
					
					
				}
			}
		
			if ( _photos[0].type == "new" )	{
				 var r, c, icons = {};
				 
				 _photos[0].obj.find('episode').each( function(){
					 var t = $(this);
					 var id = Number(t.attr('id'));
					 
					 if (id <=_photos[0].episode ){
					 	if ( t.find('row').text()!="" ) r = t.find('row').text();
					 	if ( t.find('column').text()!="" ) c = t.find('column').text();
					 	
					 	if( id == _photos[0].episode ) icons = t.find('icons icon');
					 }
					 
				 })
				 
				 var id =  _photos[0].obj.attr('id');
				 var content = '<img class="cast-image" src="'+_photos[0].photo+'" />';
				 content += '<p>'+_photos[0].obj.find('name').text()+'</p>';
				 
				 buildItem( r-1 , c-1 ,id,content, "cast", icons);
				 
				 if( _photos[0].h!="" &&  _photos[0].h!=undefined) $( '#'+_photos[0].obj.attr('id') ).append( $('<div class="highlight"><img src="'+_photos[0].h+'" /></div>') );
			} else if ( _photos[0].type=="photo"){
				//SWAP MY IMAGE
				var img = $('#'+_photos[0].obj.attr('id') ).find('.cast-image');
				img.attr('src', _photos[0].photo );
				
				if( _photos[0].h!="" &&  _photos[0].h!=undefined) {
					if ( $( '#'+_photos[0].obj.attr('id') ).find('highlight').length>0 ) $( '#'+_photos[0].obj.attr('id') ).find('highlight').remove();
					
					$( '#'+_photos[0].obj.attr('id') ).append( $('<div class="highlight"><img src="'+_photos[0].h+'" /></div>') );
				}
			}
			
			//SWAP RELATED
			var r = _photos[0].related;
			if ( r!='' ) {
				var a = r.split(" ");
				for ( var i=0;i<a.length;i++){
					var d = _cast[ _related[ a[i] ] ];
					
					d.find( 'episode' ).each( function() {
						var t = $(this);
						
						if ( Number(t.attr('id'))==_photos[0].episode ){
							$('#'+a[i] ).find('.cast-image').attr('src', t.find( 'photo' ).text() );
						
							 var h = t.find('highlight').text();
							 
							 if( h!="" &&  h!=undefined) $('#'+a[i] ).append( $('<div class="highlight"><img src="'+h+'" /></div>') );					 
						}
					})
				}
			}
			
			_photos.shift();			
		}
		
		/***************
		SWAP IMAGES
		****************/
		function swapImageBackwards(){
			var c = _photos[0].connection;
			if ( c!='' ) {
				var a = c.split(" ");
				for ( var i=0;i<a.length;i++){
					var connection = _connection[Number( a[i] )];
					
					var test = true ;
					connection.find( 'episode' ).each( function() {
						var t = $(this);
						var id = Number(t.attr('id'));
						var type = t.attr( 'type' );
						
						if ( t.find('row').text() != "" ) row = Number( t.find('row').text() );
						if ( t.find('column').text() != "" ) col = Number( t.find('column').text() );
						if ( t.find('img').text() != "" ) photo = t.find('img').text();
						
						if ( type == 'none' ) {
							var id = 'connection'+Number( a[i] );
							var content = '<img class="connection-image" src="'+photo+'" />';
							
							buildItem( row-1 ,col-1 ,id,content,"connection");
						}
						
						if ( id<=_photos[0].end-1 ){
							$('#connection'+Number( a[i] ) ).find('img').attr('src', t.find( 'img' ).text() );
							test = false;
						} else {
							if ( test) {
								$('#connection'+Number( a[i] ) ).remove();
								test = true;
							}	
						}
					})
					
					
				}
			}
			
			if ( _photos[0].type == "new" )	{
				 $('#'+_photos[0].obj.attr('id') ).remove();
			} else if ( _photos[0].type=="photo"){
				//SWAP MY IMAGE
				var img = $('#'+_photos[0].obj.attr('id') ).find('.cast-image');
				img.attr('src', _photos[0].photo );
			}
			
			
			//SWAP RELATED
			var r = _photos[0].related;
			if ( r!='' ) {
				var a = r.split(" ");
				for ( var i=0;i<a.length;i++){
					var d = _cast[ _related[ a[i] ] ];
					
					d.find( 'episode' ).each( function() {
						var t = $(this);
						
						if ( Number(t.attr('id'))<=_photos[0].end-1 ){
							$('#'+a[i] ).find('.cast-image').attr('src', t.find( 'photo' ).text() );							 						 
						}
					})
				}
			}
			
			
			_photos.shift()			
		}
		
		/***************
		Update ICONS
		****************/
		function updateIcons(cast,end){
			var div = $('#'+cast.attr('id') );
			div.find( '.trophy' ).remove();
			
			var lc = $('#lc-'+cast.attr('id') );
			lc.find('.trophylink').remove();
			
			
			cast.find('episode').each( function() {
				var t = $(this);
				var id = Number( t.attr('id') );
				
				if ( id == end ) {
					var icons = t.find( 'icons icon').each( function (i) {
						var s =  '<div class="trophy trophy'+i+'" id="trophy'+i+'-'+cast.attr('id')+'" >'
						s+= '<div class="ribbon"><div class="ribbonText"><span>'+$(this).find('title').text()+'</span></div><div class="ribbonTail"><img src="img/icons/ribbonTail.png" /></div></div>';
						s+=	'<div class="icon"><img src="'+$(this).find('trophy').text()+'_tiny.png" /></div>';
						s+= '</div>';
						
						div.append( s );
						
						s = '<a href="javascript:void(0);" class="trophylink trophy'+i+'" name="trophy'+i+'-'+cast.attr('id')+'">&nbsp;</a>';
						lc.append( s );
					});
				}
			});
		}
		
		/***************
		RESET ZOOM
		****************/
		function resetZoom() {
			WQ.Zoom.setZoom( _z );
		}
		
		/***************
		UPDATE CONNECTIONS
		****************/
		function updateConnections(){
			//ADD CONNECTIONS
			var c = _photos[0].connection;
			if ( c!='' ) {
				var a = c.split(" ");
				for ( var i=0;i<a.length;i++){
					var connection = _connection[Number( a[i] )];
					
					connection.find( 'episode' ).each( function() {
						var t = $(this);
						if ( Number(t.attr('id'))==_photos[0].episode ){
						
							if ( $('#connection'+Number( a[i] ) ).length<1 ){
								var row = Number(t.find('row').text());
								var col = Number(t.find('column').text());
								var id = 'connection'+Number( a[i] );
								var content = '<img class="connection-image" src="'+t.find( 'img' ).text()+'" />';
							 
								buildItem( row-1 ,col-1 ,id,content,"connection")
							 } else {
							 	if ( t.attr('type')=="none" ) $('#connection'+Number( a[i] ) ).remove();		 	
							 	else {
							 		$('#connection'+Number( a[i] ) ).find('.connection-image').attr('src', t.find( 'img' ).text() );
							 	}
							 }
							 
							 var h = t.find('highlight').text();
							 if( h!="" &&  h!=undefined) $('#connection'+Number( a[i] ) ).append( $('<div class="highlight"><img src="'+h+'" /></div>') );
							 if ( t.find('highlight').attr('type')=="none" ) {
							 	var hg = $('#connection'+Number( a[i] ) ).find('.highlight');
							 	
							 	hg.eq( hg.length-1 ).remove();
							 }
							
						}
					})
				}
			}
			
			//SWAP RELATED
			var r = _photos[0].related;
			if ( r!='' ) {
				var a = r.split(" ");
				for ( var i=0;i<a.length;i++){
					var d = _cast[ _related[ a[i] ] ];
					
					d.find( 'episode' ).each( function() {
						var t = $(this);
						
						if ( Number(t.attr('id'))==_photos[0].episode ){
							$('#'+a[i] ).find('.cast-image').attr('src', t.find( 'photo' ).text() );
						
							var h = t.find('highlight').text();
							if( h!="" &&  h!=undefined) $('#connection'+Number( a[i] ) ).append( $('<div class="highlight"><img src="'+h+'" /></div>') );
						}
					})
				}
			}
			
			_photos.shift();
		}
		
		/***************
		UPDATE CONNECTIONS BACKWARDS
		****************/
		function updateConnectionsBackwards(){
			var c = _photos[0].connection;
			if ( c!='' ) {
				var a = c.split(" ");
				for ( var i=0;i<a.length;i++){
					var connection = _connection[Number( a[i] )];
					
					var test = true ;
					
					var row = undefined, col = undefined, photo=undefined;
					
					connection.find( 'episode' ).each( function() {
						var t = $(this);
						var id = Number(t.attr('id'));
						var type = t.attr( 'type' );
						
						if ( t.find('row').text() != "" ) row = Number( t.find('row').text() );
						if ( t.find('column').text() != "" ) col = Number( t.find('column').text() );
						if ( t.find('img').text() != "" ) photo = t.find('img').text();
						
						if ( type == 'none' ) {
							var id = 'connection'+Number( a[i] );
							var content = '<img class="connection-image" src="'+photo+'" />';
							
							buildItem( row-1 ,col-1 ,id,content,"connection");
						}
						
						if ( id<=_photos[0].end-1 ){
							$('#connection'+Number( a[i] ) ).find('img').attr('src', t.find( 'img' ).text() );
							test = false;
						} else {
							if ( test) {
								$('#connection'+Number( a[i] ) ).remove();
								test = true;
							} 
						}
					})
				}

			}
			
			//SWAP RELATED
			var r = _photos[0].related;
			if ( r!='' ) {
				var a = r.split(" ");
				for ( var i=0;i<a.length;i++){
					var d = _cast[ _related[ a[i] ] ];
					
					d.find( 'episode' ).each( function() {
						var t = $(this);
						
						if ( Number(t.attr('id'))<=_photos[0].end-1 ){
							$('#'+a[i] ).find('.cast-image').attr('src', t.find( 'photo' ).text() );							 						 
						}
					})
				}
			}
			
			_photos.shift();
		}
		
		/***************
		ANIMATION STARTED
		****************/
		function animationStarted(){
			$('.link-layer').hide();
		
			$(document).trigger( "animationStarted" );
		}
		
		/***************
		ANIMATION FINISHED
		****************/
		function animationFinished(){
			$(document).trigger ( "castUpdated" );
			
			$('.link-layer').show();
		
			$(document).trigger( "animationFinished" );
		}
							
		/***************
		PUBLIC
		****************/
		return {
			init:init,
			findCast: function( id ){
				return {
					cast: _cast[_related[id]],
					episode: _current
				}
			} 	
		}
		
	})();
	
	Construct = (function(){
		$(document).ready(function(){
			WQ.Tree.init();
		});
	})();
	
})(jQuery,WQ);
