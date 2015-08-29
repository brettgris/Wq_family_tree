var WQ = WQ || {};

(function ($, WQ) {
	
	/***************
	START THE PARTY
	****************/
	WQ.Cast = ( function(){
		var $cast = {}, $videoPlayer, _trophy, $largePhoto = false, $additionalInfo = false, $trophies = false, $videos = false, _ie = false, $video= false, _options, $v=0, $vc = {}, $vsource, $p;
		
		/***************
		INIT
		****************/
		function init() {
			$cast.w = $('.large-cast');
			
			if (!Modernizr.canvas) {
				_ie = true;
			} 
			
			//Content within the .large-cast div
			$cast.content = $cast.w.children('.cast-box');
			
			$cast.close = $cast.w.find('.close-button'); 
			$cast.link = $('.link-layer');
			$cast.video = $('.cast-video').hide();
			$cast.tooltip = $('.tooltip');
			
			$cast.close.click( closeCast );
			
			//Grab CSS settings and set the content resize values
			$SMALL_WIDTH = $cast.content.width() - $cast.w.find('.large-cast-photo').width() + 55; //Right padding amount (55)
			$FULL_WIDTH = $cast.content.width();
			
			$SMALL_HEIGHT = $cast.content.height() - $cast.w.find('.cast-trophies').height() - Number(String($cast.w.find('.cast-trophies').css('margin-bottom')).replace('px',''));
			$FULL_HEIGHT = $cast.content.height();
			
			$(document).on ( "castUpdated", addLinks );
			
			$('.video-close').click( closeVideo );
			
			$(document).on("voteOpened", clearCastWindow);
			$(document).on("changeEpisode", clearCastWindow);
			
			$(window).resize( function() {
				adjustSize($largePhoto, $additionalInfo, $trophies);
			});	
			
			$(window).on('orientationchange', function() {
				adjustSize($largePhoto, $additionalInfo, $trophies);
			})
			
			$vc.video = false;
			$vc.volume = 1;
			$vc.per = 0;
			$vc.seek = false;
			
			$vc.open = false;
			
		}
		
		/***************
		ADD LINKS
		****************/
		function addLinks(){
			$('.link-item').each ( function () {
				var t = $(this);
				
				if ( t.attr("link") != "true" ) {
					t.click( openCast );
					t.attr( "link", "true" );
				}
				
			})
			
			$('.trophylink').hover( showTrophy, hideTrophy );
		}
		
		/***************
		When Vote is opened clear the cast
		****************/
		function clearCastWindow(){
			closeVideo();
			closeCast();
			
		}
		
		/***************
		OPEN CAST
		****************/
		function openCast() {
			var t = $(this);
			
			$largePhoto = false;
			$additionalInfo = false;
			$trophies = false;
			$videos = false;
			
			$cast.link.hide();
			
			var item = WQ.Tree.findCast( t.attr('id').slice(2) );
			
			$('.cast-trophies ul').html("");
			
			var arr = [];
			item.cast.find('episode').each( function() {
				arr.push ( $(this) );
			})
			
			var photo = false;
			
			for ( var i=arr.length-1;i>=0;i-- ){
				var t = arr[i];
				
				if ( Number( arr[i].attr('id') )<=item.episode ) {
				
					//console.log( i );
					
					//Google Analystics
					if ( _gaq) _gaq.push(['_trackEvent', 'Character', 'Open Character', item.cast.find('name').text()]);
				
				
					if ( item.cast.find('name').text() != "" ) $cast.w.find('.cast-name').text ( item.cast.find('name').text() );
					if ( t.find('description').text() != "" ) $cast.w.find('.cast-desc').html ( t.find('description').text() );
					
					
					if ( t.find('photo').text() != "" && !photo ) {
						$cast.w.find('.cast-round img').attr( 'src', t.find('photo').text() );
						photo = true;
					}
				
				
				
					//If no trophies are specified, shrink the height of the cast box
					if ( t.find('icons icon').length > 0) {
					
						var num = 0;
						
						t.find('icons icon').each( function() {
							var icon = $(this);
							
							if ( icon.attr('type') != "nonpoll" ){
							
								var s= '<li><img src="'+icon.find('trophy').text()+'_small.png" width="40" height="40"/>';
								s+= '<div class="trophy-desc">';
								s+= '<div class="trophy-name">'+icon.find('title').text()+'</div>';
								s+= '<div class="trophy-week">Week '+(i+1)+'</div>';
		                        s+= '</div></li>';
		                        
		                        $('.cast-trophies ul').append( s );
		                    	
		                    	num++;    
		                    }
						});
					
						if ( num > 0 ) $trophies = true;
					}
				
				
				
				
					//If no large photo is specified, shrink the width of the cast box
					if ( t.find('largephoto').text() != "" ) {
						$cast.w.find('.large-cast-photo img').attr( 'src', t.find('largephoto').text() );
						$largePhoto = true;
					}
				
					var liv = 0;
				
					//ADD VIDEOS	
					if ( t.find('videos').find('video').length>0 ) {
						//BUILD CAST LINKS
						var ul = $('.cast-links').find('ul').html("");
						
						t.find('videos').find('video').each( function (i) {
							var hv = Math.floor( liv/2 );
							var lv = liv%2;
							
							var li = '<a href="javascript:void(0);" class="video-link" path="'+$(this).find('path').text()+'" >' 
							li += '<li class="cast-link-item" style="top:'+(hv*35)+'px;left:'+(lv*210)+'px;"><img src="img/videoIcon.png" width="15" height="15"/>';
							li += '<div class="link-desc">'+$(this).find('title').text()+'</div></li></a>';
							
							liv++;
							
							ul.append( li );
						})
						
						$additionalInfo = true;
					} 
				
					//ADD TOOLTIP	
					var bullet = t.find('background').find('bullet');
					if ( bullet.length>0 ) {
						
						
						var hv = Math.floor( liv/2 );
						var lv = liv%2;
						
						var ul = $('.cast-links').find('ul');
						
						if ( !$additionalInfo ) ul.html("");
						var li ='<a href="javascript:void(0);" class="tooltop-link" ><li class="cast-link-item" style="top:'+(hv*35)+'px;left:'+(lv*210)+'px;">' 
							li += '<div class="tooltipwrapper"><div class="tooltip"><div class="tooltip-top"></div><div class="tooltip-body"><ul></ul></div><div class="tooltip-bottom"></div></div></div><img src="img/historyIcon.png" width="15" height="15"/>';
							li += '<div class="link-desc">Historical Background</div>';
							li += '</li></a>';
						
						ul.append ( li );
						
						liv++;
						
						var ttul = $('.tooltip-body ul').html("");
						bullet.each( function(i) {
							
							var ttli = '<li>'+$(this).text()+'</li>';
							ttul.append( ttli );
						})
						
						$additionalInfo = true;
					}
				}
			}
			
			$cast.w.show();
			
			adjustSize($largePhoto, $additionalInfo, $trophies);
			
			$('.tooltop-link').hover( showTooltip, hideTooltip );
			
			$('.video-link').click( playVideo );
			$cast.video.hide();
			
						
		}
		
		/***************
		TOOLTIP
		****************/
		function showTooltip(e){
			var t = $('.tooltip');
			var h = t.height()+5;
			
			t.css( {
				'margin-top':(20)+'px'
			});
			
			t.show();
		}
		
		function hideTooltip(){
			$('.tooltip').hide();
		}
		
		/***************
		TOOLTIP
		****************/
		function showTrophy(e){
			var n = $(this).attr('name');
			var t = $('#'+n).css('z-index',10);
			
			var r = t.find('.ribbon').width(200).show();
			var s = r.find('span').show();
			
			var p = t.width()/2;
			var h = t.height()*.75;
			r.height( h );
			
			var w =  s.width()+(p*1.75);
			
			var tail = r.find('.ribbonTail');
			tail.css( 'left', 0+'px' );
			
			if( s.height()>r.height() ) r.height( s.height() );
			
			var pt =  (r.height()-s.height() )/2 ;
			
			r.width( 1 ).css( {
				'margin-top': (-1*(r.height()/2))+'px'
			});
			
			r.find('.ribbonText').css({
				'padding-top': (pt)+'px',
				'padding-left':t.width()/2+'px'
			});
			
			var tw = Math.floor( (8*h)/32 );
			
			var nw = w+(5+tw);
			
			TweenLite.to(r, .2, {
				'width': (w+(5-tw) )+'px' 
			});
				
			TweenLite.to(tail, .2, {
				'left': (w-tw)+'px' 
			});		
			
		}
		
		function hideTrophy(){
			var n = $(this).attr('name');
			
			var t = $('#'+n).css('z-index',5);
			var r = t.find('.ribbon').hide();
		}
		
		/***************
		Play Character Video 
		****************/
		function playVideo(){
			var t = $(this);
			var p = t.attr('path');
			
			var w, h, mt;
			if ( $cast.content.width() > 720 ) {
				w=720;
				h=405;
				mt=45;
			} else {
				w=560;
				h=315;
				mt=47;
			}
			
			$v++;
			var s = '<div class="videoContainer" style="width:'+w+'px;margin:auto;margin-top:'+mt+'px;">'
			s+= '<video id="castVideo'+$v+'" controls preload="auto" autoplay width="'+w+'" height="'+h+'">';
			s+= '<source src="'+p+'.mp4" type="video/mp4" />';
			s+= '<source src="'+p+'.webm" type="video/webm" />';
			s+= '<source src="'+p+'.ogv" type="video/ogg" />';
			s+= '</video></div>';
			
			if ( swfobject.hasFlashPlayerVersion("9.0.0") ){
				if ( $vc.video ){
					$('.videoTime').text( "0:00 / 0:00" );
					$('.scrubHandle').css( 'left', '0px' );
					$('.scrubBackdrop').css( 'width', '0px' );
					setTimeout(loadVideo, 500);
					$p = p+".mp4";
				} else {
					var flashvars = {path: p+".mp4"};
					var params = {wmode:"opaque", allowscriptaccess:"always" };
					var attributes = {id:"videoPlayerSWF",  name:"videoPlayerSWF"};
			
					var random = Math.floor(Math.random()*100000);
			
					swfobject.embedSWF("videoplayer.swf?r="+random, "videoPlayer", "100%", "100%", "9.0.0", false, flashvars, params, attributes);
				
					setTimeout ( setUpControls, 500 );
					$vc.video = true;
					
					
				}
			} else {
				$("#videoPlayer").html(s);
			}
			
			$cast.video.show();
			
			
		}
		
		function loadVideo(){
			$vsource.loadSource( $p );
			$vsource.playVideo();
			$vc.open = true;
		}
		
		function setUpControls(){
			$('.video-controls').show();
		
			$vsource = document.getElementById("videoPlayerSWF");
			
			$('.videoPlayPause').click( function(){
				if ( $vc.open ) {
					( $vc.playing ) ? $vsource.pauseVideo() : $vsource.playVideo();	
				}			
			});
			
			
			$('.videoVolume').hover( function(){
				if ( $vc.open ) {
					$('.videoVolumeDragContainer').show();
					$('.videoVolumeHandle').show();
					updateHandle();
					$(this).height(131);
				}
			}, function(){
				if ( $vc.open ) {
					$('.videoVolumeDragContainer').hide();
					$(this).height(34);
				}
			});
			
			$('.videoVolumeBtn').css('background-position', '0px 0px');
			
			$('.videoVolumeBtn').click( function(){
				if ( $vc.open ) {
					if ( $(this).css('background-position') != '0px 0px' ) {
						$vc.volume = $vc.old;
					} else {
						$vc.old = $vc.volume;
						$vc.volume = 0;
					}
					updateHandle();
					updateVolume();
				}
			});
			
			
			$('.videoVolumeHandle').draggable({
				containment: '.videoVolumeDragContainer',
				drag: function() {
		            updateVolume();
		        }
		        
			});
			
			var w = $cast.content.width()-50-125;
			
			$('.videoScrub').width( w );
			
			$('.scrubHandle').draggable({
				containment: '.scrubDragContainer',
				start: function(){
					$vc.seek = true;
				},
		    	drag: function() {
		            updateScrub();
				},
		       	stop: function(){
		       		$vsource.pauseVideo();
		       		$vc.seek = false;
			    	var max = $('.videoScrub').width()-13;
					var curr = Number ( $('.scrubHandle').css( 'left' ).slice(0,-2) );
					var per = curr/max;
					
					$vsource.seekVideo( per*100 );
					$vsource.playVideo();
		       }
		        
			});
			
			$vc.open = true;
			$vsource.playVideo();
			
		}
		
		
		function playing(){
			if( $vc.open ) {
				$vc.playing = true;
				$('.videoPlayPause').css('background-position', '0px -34px');
			}
			
		}
		
		function paused(){
			if( $vc.open ) {
				$vc.playing = false;
				$('.videoPlayPause').css('background-position', '0px 0px');
			}
		}
		
		function updateHandle(){
			if( $vc.open ) {
				var p = 56*(1-$vc.volume);
				
				$('.videoVolumeHandle').css( {
					'top': p+'px',
					'left':'0px'
				});
			}
			
		}
		
		function updateVolume(){
			if( $vc.open ) {
				var max = 56;
				var h = Number( $('.videoVolumeHandle').css( 'top').slice(0,-2) );
				var per = 1-(h/max);
				
				if (per>1) per = 1;
				if (per<.1) per = 0;
				
				$vsource.changeVolume( per );
				
				$vc.volume = per;
				
				var bh = 61*per;
				
				if ( per < .1 )$('.videoVolumeBtn').css('background-position', "0px -34px" );
				else $('.videoVolumeBtn').css('background-position', "0px 0px" );
				
				$('.volumeBackdrop').height( bh );
			}
		}
		
		function updateVideo(p,t){
			if( $vc.open ) {
				t = Math.ceil( t );
				p = Math.ceil( p );
				
				$vc.per = p/t;
				
				var ts = t%60;
				if (ts<10) ts= "0"+ts;
				
				t = Math.floor( t/60 )+":"+ts;
								
				var s = p%60;
				if (s<10) s= "0"+s;
								
				p = Math.floor( p/60 )+":"+s
				
				$('.videoTime').text( p+" / "+t );
				
				updateScrub();
			}		
		}
		
		function updateScrub(){
			if( $vc.open ) {
				var max = $('.videoScrub').width()-13;
				var cur = $vc.per*max;
				
				if ( !$vc.seek ) {
					$('.scrubHandle').css( 'left', cur+'px' );
				}
				
				$('.scrubBackdrop').css( 'width', $('.scrubHandle').css('left') );
			}
		}
		
		
		/***************
		Close Video
		****************/
		function closeVideo(){
			if ( swfobject.hasFlashPlayerVersion("9.0.0") ) {
				if ( $vsource && $vc.open ) $vsource.clearVideo();
				$vc.open = false;
			}else $(".video-wrapper").html('<div class="video-player" id="videoPlayer"></div>');
			
			$cast.video.hide();
		}
		
		/***************
		SIZING ADJUSTMENTS
		****************/		
		function adjustSize($largePhoto, $additionalInfo, $trophies) {
			$cast.content.css('height', 'auto');
			
			var small = true;
			
			if(!$largePhoto) {
				$cast.w.find('.large-cast-photo').hide();
			} else {
				if( $(window).width()>1000) {
					$cast.w.find('.large-cast-photo').show();
					small = false;
				}
				else $cast.w.find('.large-cast-photo').hide();
			}
			
			if( !$additionalInfo ) {
				$cast.w.find('.cast-links').hide();
			} else {
				$cast.w.find('.cast-links').show();
			}
			
			if( !$trophies ) {
				$('.cast-trophies ul').hide();
				$('.notrophies').show();
			} else {
				$('.cast-trophies ul').show();
				$('.notrophies').hide();
			}
			
			$cast.w.find('.cast-trophies').show();

			
			var h = $('.cast-details').height()+40;
			if (h<370) h = 370;
			
			if ( small ) {
				$cast.content.css ({
					'width': '600px',
					'margin-left': '-300px',
					'height': h+'px',
					'margin-top':(-1*h/2)+'px'
				})
			} else {
				$cast.content.css ({
					'width': '853px',
					'margin-left': '-427px',
					'height':'472px',
					'margin-top':'-239px'
				});
			}	
			
			
			if ( !swfobject.hasFlashPlayerVersion("9.0.0") ){
				if ( $vc.open ){
					if ( $cast.content.width() > 720 ) {
						if ( $('video').length > 0) {
							$('.videoContainer').css({
								'width':'720px',
								'margin-top':'45px'
							});
							$('video').width( 720 );
							$('video').height( 405 );
						}
					} else {
						if ( $('video').length> 0) {
							$('.videoContainer').css({
								'width':'560px',
								'margin-top':'47px'
							});
							
							$('video').width( 560 );
							$('video').height( 315 );
						}
					}
				}
			} else {
				var w = $cast.content.width()-50-125;
				$('.videoScrub').width( w );
				updateScrub();
			}	
			
		}
		
		
		/***************
		CLOSE CAST
		****************/
		function closeCast () {
			$cast.w.hide();
			$cast.link.show();
		}
						
		/***************
		PUBLIC
		****************/
		return {
			init:init,
			playing: playing,
			paused: paused,
			update: updateVideo
		}
		
	})();
	
	Construct = (function(){
		$(document).ready(function(){
			WQ.Cast.init();
		});
	})();
	
})(jQuery,WQ);

function videoPlaying(){
	WQ.Cast.playing();
	WQ.Vote.playing();
}

function videoPaused(){
	WQ.Cast.paused();
	WQ.Vote.paused();
}

function videoUpdate(p,t){
	WQ.Cast.update( p, t );
	WQ.Vote.update( p, t );
}
