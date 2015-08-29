var WQ = WQ || {};
(function($, WQ) {
/***************
	START THE PARTY
	****************/
	WQ.Vote = (function() {
		var $vote = {}, $videoPlayer, $videos = false, _ie = false, $video= false, _options, $v=0, $vc = {}, $vsource, $p, $winners, $polls;
/***************
		INIT
		****************/
		var $pollXMLData;
		//We store the first highlited button here
		var currentPoll = "powerPlayer";
		var lastViewedPoll;
		//This selects the default tab to show when the polls are opened
		var currentTab = "pastWinners";

		function init() {
			loadData("data/polls.xml");
			$vote.w = $('.vote');
			$vote.content = $vote.w.children('.vote-box');
			$vote.close = $vote.w.find('.close-button');
			$vote.video = $('.vote-video').hide();
			$vote.link = $('.link-layer');
			$('.voteButton').click(openVote);
			//$('.voteButton').click(activatePoll(currentPoll));
			//console.log("27");
			$vote.close.click(closeVote);
			activatePastWinners();
			
			$(document).on("changeEpisode", closeVote);
			
			$('.video-close').click( closeVideo );
			
			$('.castvotelink').click( openVote );
			
			$(window).resize( adjustSize );
			$(window).on('orientationchange', adjustSize);
						
			$vc.video = false;
			$vc.volume = 1;
			$vc.per = 0;
			$vc.seek = false;
			
			$vc.open = false;
		}
		
		/***************
		DATA LOADED
		****************/
		function adjustSize() {
			var w = $(window).width();
			
			if ( w<950 ) {
				if ( w<800 ) {
					$('.vote-box').css({'width': '576px','margin-left':'-288px'});
					$('.vote-boxSmall').css({'width':'50px'});
					$('.vote-boxLarge').css({'left':'80px','width': '480px'	});
					$('.vote-tabs').css({'width': '545px'});
					$('.vote-boxSmall h1').hide();
					$('.poll-button span, .poll-button-active span').hide();
				} else {
					$('.vote-box').css({'width': '710px','margin-left':'-355px'	});
					$('.vote-boxSmall').css({'width':'185px'});
					$('.vote-boxLarge').css({'left':'215px','width': '480px'});
					$('.vote-tabs').css({'width': '680px'});
					$('.vote-boxSmall h1').show();
					$('.poll-button span, .poll-button-active span').show();
				}
				
				$('.poll-desc, .poll-answers, .poll-noPastWInners').css({'margin-left':'20px'});
			} else {
				$('.vote-box').css({'width': '853px','margin-left':'-427px'});
				$('.vote-boxSmall').css({'width':'250px'});
				$('.vote-boxLarge').css({'left':'280px','width': '558px'});
				$('.vote-tabs').css({'width': '823px'});
				$('.poll-desc, .poll-answers, .poll-noPastWInners').css({'margin-left':'95px'});
				$('.poll-button span, .poll-button-active span').show();
			}
			
			if ( swfobject.hasFlashPlayerVersion("9.0.0") ){
				var w = $vote.content.width()-50-125
				$('.voteScrub').width( w );
				updateScrub();
			} else {
				if ( $vc.open ) {
					if ( w<950 ) {
						if ( w<800 ) {
							if ( $('video').length > 0) {
								$('.videoContainer').css({
									'width':'560px',
									'margin-top':'85px'
								});
								$('video').width( 560 );
								$('video').height( 315 );
							}
						} else {
							if ( $('video').length > 0) {
								$('.videoContainer').css({
									'width':'704px',
									'margin-top':'50px'
								});
								$('video').width( 704 );
								$('video').height( 396 );
							}
						}

					} else {
						if ( $('video').length > 0) {
							$('.videoContainer').css({
								'width':'752px',
								'margin-top':'45px'
							});
							$('video').width( 752 );
							$('video').height( 423 );
						}
					}
				}
			}		
		}
		
		
		/***************
		JSON FEED
		****************/
		function loadData($path) {
			$.ajax({
				type: 'GET',
				url: $path,
				dataType: 'xml',
				success: dataLoaded,
				error: loadError
			});
		}
		/***************
		DATA LOADED
		****************/
		function dataLoaded(data) {
			$pollXMLData = $(data);
			buildPolls();
			adjustSize();
		}
		/***************
		POPULATE CONTENT
		****************/
		function buildPolls() {
			var l = $pollXMLData.find('episode').length-1;
			
			var s = [];
			
			$polls = [];
			
			$pollXMLData.find('episode').each( function(){
				var t = $(this);
				if( t.attr('id')!=String(l+1) ){
					t.find('poll').each( function(){
						var p = $(this);
						
						var e = Number( p.attr('episode') );
						var n = Number( p.attr('number') ); 
						
						if ($polls[e]==undefined) $polls[e] = [];
						$polls[e][n] = p;
						
						if (p.attr('available').toLowerCase()=="true") s.push ( {e: e, n: n } );
					});
				}
			})
			
			$.ajax({
				type: 'GET',
				url: "data/winners.xml",
				dataType: 'xml',
				success: function(data){
					updateWinners( data );
				},
				error: loadError
			});
			
			/*$.ajax({
				url: "Scripts/PollResults.php",
				type: "POST",
				data: {
					polls: s
				},
				success: function(result) {
					var results = $.parseJSON(result);
					updateWinners( results );
				},
				error: function(jqXHR, textStatus, errorThrown) {
					//console.log( textStatus );
					//Handle Error
				},
				complete: function(data) {
					//console.log( "complete" );
					//Next steps
				}
			});*/
			
			//BUILD CURRENT POLLS
			$pollXMLData.find('episode').eq(l).find('poll').each(function() {
				var $pollHTML = String();
				var $pollResultsHTML = String();
				var $winnersHTML;
				//Grab poll data
				var $avail = $(this).attr('available').toLowerCase();
				var $ep = $(this).attr('episode');
				var $num = $(this).attr('number');
				
				var $desc = $(this).find('description').text();
				var $p_name = $(this).find('displayName').text();
				var $d_name = $(this).find('dataName').text();
				//Build the first section of HTML
				$pollHTML = '<div id="' + $d_name + 'Poll" class="vote-boxLarge">' + 
										'<div class="poll-title"><img src="img/icons/' + $d_name + '_large.png" width="85" height="85"/>' + $p_name + '</div>' + 
										'<div class="poll-desc">' + $desc + '</div>';
										
				//------------- ANSWERS --------------- //
				//Build answer nodes and results nodes
				var answers = Array();
				$(this).find('answer').each(function() {
					answers.push($(this));
				})
				//Start the Answers DIV
				$pollHTML += '<div id="' + $d_name + 'Answers" class="poll-answers">'+
										'<input type="hidden" class="pollData" episode="' + $ep + '" poll="' + $num + '" available="' + $avail + '">' ;
										
				for (var i = 0; i < answers.length; i++) {
					var $ans = i + 1;
					var $img = answers[i].find('image').text();
					var $name = answers[i].find('name').text();
					var $video = answers[i].find('video').text();
					$pollHTML += '<div class="poll-answerItem">' + 
											'<div class="poll-voteButton"><img src="img/polls/' + $img + '.jpg" width="95" height="125" answer="' + $ans + '"/></div>' + 
											'<div class="poll-voteButtonOverlay" answer="' + $ans + '"></div>' + 
											'<div class="poll-characterName">' + $name + '</div>' + 
											'<div class="poll-vidButton" path="' + $video + '"><img src="img/watchVideoButton.png" width="90" height="20" /></div>' + 
											'</div>';
					//We'll create these values now and add them later;					
					$pollResultsHTML += '<div class="poll-resultsItem">' +
														 '<img src="img/polls/' + $img + '.jpg" width="60" height="80" answer="1"/>' +
														 '<div class="result-characterName">' + $name + '</div>' + 
														 '<div id="' + $d_name + 'Answer'+$ans+'Total" class="poll-bar"></div>' +
														 '</div>';
				}
				
				//Close the poll answers DIV
				$pollHTML += '</div>';
				//------------- POLL RESULTS --------------- //
				//Add the results div and with the individual results
				$pollHTML += '<div id="' + $d_name + 'Results" class="poll-results">';
				$pollHTML += $pollResultsHTML;
				$pollHTML += '</div>';
				//Close the main DIV
				$pollHTML += '</div>';
				//Add the poll to the HTML
				$('#pollPlaceholder').after($pollHTML);
				/***************
				ROLL OVERS
				***************/
				$(".poll-voteButtonOverlay").mouseover(function(){
					$(this).css("opacity","1");
 				 });
 				$(".poll-voteButtonOverlay").mouseout(function(){
					$(this).css("opacity","0");
				});
				//------------- POLL WINNERS --------------- //
				//Create the next DIV, which contains the winners for each poll
				$winnersHTML = '<div id="' + $d_name + 'Winners" class="vote-boxLarge">' + 
											'<div class="poll-title">' +
											'<img src="img/icons/' + $d_name + '_large.png" width="85" height="85" />' + $p_name +
											'</div>' + 
											'<div class="poll-desc">' + $desc + '</div>' +
											'<div class="poll-noPastWInners">No characters have won this poll.</div>' +
											'</div>';
				//Add it after the poll we created
				$('#pollPlaceholder').after($winnersHTML);
				//Finally, create the nav button for the poll
				var $buttonPollsHTML = '<div id="' + $d_name + 'Button" class="poll-button" available="' + $avail + '">' + 
														'<img src="img/icons/' + $d_name + '_small.png" width="40" height="40" /><span>' + $p_name + 
														'</span></div>';
				var $buttonWinnersHTML = '<div id="' + $d_name + 'Button" class="poll-button">' + 
															'<img src="img/icons/' + $d_name + '_small.png" width="40" height="40" /><span>' + $p_name + 
															'</span></div>';
				$($buttonPollsHTML).appendTo('#availablePollsList');
				$($buttonWinnersHTML).appendTo('#pastWinnersList');
				if ($avail == "false") {
					var $b_off = "#" + $d_name + "Button";
					$($b_off).css('display', 'none');
				}
				//Hide the results
				$('.poll-results').hide();
			})
			
			//Poll Buttons in the poll column
			$('.poll-button').click(function() {
					var $p = String($(this).attr('id')).replace('PollButton', '');
					if (currentTab != $p) {
						activatePoll($p);
					}
			})
			//Vote buttons
			$('.poll-answerItem > .poll-voteButtonOverlay').click(function() { handleVote($(this)); });
			//Highlight the top button and show the poll
			highlightFirstButton();
			
			//Play video
			$('.poll-vidButton').click( playVideo );
		}
		
		function updateWinners( results ){
			$winners = [];
			
			var polls = $(results).find("poll");;
			
			$.each ( polls, function() {
				var t = $(this);
				
				var obj = {};
				obj.e = Number( t.attr( 'episode' ) );
				obj.n = Number( t.attr( 'number' ) );
			
				
					
					
				
				
				//obj.n = Number( value.poll );
				
				//obj.a = [ Number( value.answer1 ), Number( value.answer2 ), Number( value.answer3 ), Number( value.answer4 ), Number( value.answer5 ), Number( value.answer6 ) ];
				
				//obj.t = 0;
				//obj.w = 0;
				
				
				//for ( var i=0; i<obj.a.length; i++ ) {
					//if( obj.a[i] > obj.a[obj.w] ) obj.w = i;
				//}
				
				
								
				
				obj.ans = t.find("answer");
				obj.id = obj.ans.find('id').text();
				obj.path = "img/icons/"+t.find('dataName').text();
				
				

				
				obj.name =  t.find('displayName').text();
				
				$winners.push ( obj );
				
				
				var cat = t.find('dataName').text();
				
				var p = $('#'+cat+'Winners');
				
				p.find( '.poll-noPastWInners' ).remove();
				if ( p.find( '.poll-winners').length<1 ) $('<div class="poll-winners"></div>').appendTo( p );
				
				var w = p.find( '.poll-winners');
				
				var s = '<div class="poll-winnerItem"><img src="'+obj.ans.find('path').text()+'" width="95" height="125" class="poll-winnerImg"><div class="poll-characterName">'+obj.ans.find('name').text()+'<br />Week '+obj.e+'</div>';
				
				w.append( s );
			});
			
			$(document).trigger ( "updateCast", {w:$winners} );
		}
		
		/***************
		Play Character Video 
		****************/
		function playVideo(){
			var t = $(this);
			var p = t.attr('path');
			
			var w, h, mt;
			if ( $vote.content.width() > 720 ) {
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
					$('.voteScrubHandle').css( 'left', '0px' );
					$('.voteScrubBackdrop').css( 'width', '0px' );
					setTimeout(loadVideo, 500);
					$p = p+".mp4";
				} else {
					var flashvars = {path: p+".mp4"};
					var params = {wmode:"opaque", allowscriptaccess:"always" };
					var attributes = {id:"voteVideoPlayerSWF",  name:"voteVideoPlayerSWF"};
			
					var random = Math.floor(Math.random()*100000);
			
					swfobject.embedSWF("videoplayer.swf?r="+random, "voteVideoPlayer", "100%", "100%", "9.0.0", false, flashvars, params, attributes);
					
					setTimeout ( setUpControls, 500 );
					$vc.video = true;
				}
			} else {
				$("#voteVideoPlayer").html(s);
			}
			
			$vote.video.show();
			$vc.open = true;
			adjustSize();
			
			
		}
		
		function loadVideo(){
			$vsource.loadSource( $p );
			$vsource.playVideo()
			$vc.open = true;
		}
		
		function setUpControls(){
			$('.video-controls').show();
		
			$vsource = document.getElementById("voteVideoPlayerSWF");
			
			
			$('.videoPlayPause').click( function(){
				if ( $vc.open ) {
					( $vc.playing ) ? $vsource.pauseVideo() : $vsource.playVideo();
				}				
			});
			
			
			$('.videoVolume').hover( function(){
				if ( $vc.open ) {
					$('.voteVolumeDragContainer').show();
					$('.voteVolumeHandle').show();
					updateHandle();
					$(this).height(131);
				}
			}, function(){
				if ( $vc.open ) {
					$('.voteVolumeDragContainer').hide();
					$(this).height(34);
				}
			});
			
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
			
			
			$('.voteVolumeHandle').draggable({
				containment: '.voteVolumeDragContainer',
				drag: function() {
		            updateVolume();
		        }
		        
			});
			
			
			var w = $vote.content.width()-50-125;
			
			$('.voteScrub').width( w );
			
			$('.voteScrubHandle').draggable({
				containment: '.voteScrubDragContainer',
				start: function(){
					$vc.seek = true;
				},
		    	drag: function() {
		            updateScrub();
				},
		       	stop: function(){
		       		$vsource.pauseVideo();
		       		$vc.seek = false;
			    	var max = $('.voteScrub').width()-13;
					var curr = Number ( $('.voteScrubHandle').css( 'left' ).slice(0,-2) );
					var per = curr/max;
					
					$vsource.seekVideo( per*100 );
					$vsource.playVideo();
		       }
		        
			});
			
			$vsource.playVideo();
			$vc.open = true;
		}
		
		function playing(){
			if( $vc.open ) {
				$vc.playing = true;
				$('.videoPlayPause').css('background-position', '0 -34px');
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
				
				$('.voteVolumeHandle').css( {
					'top': p+'px',
					'left':'0px'
				});
			}
		}
		
		function updateVolume(){
			if( $vc.open ) {
				var max = 56;
				var h = Number( $('.voteVolumeHandle').css( 'top').slice(0,-2) );
				var per = 1-(h/max);
				
				if (per>1) per = 1;
				if (per<.1) per = 0;
				
				$vsource.changeVolume( per );
				
				$vc.volume = per;
				
				var bh = 61*per;
				
				if ( per < .1 )$('.videoVolumeBtn').css('background-position', "0 -34px" );
				else $('.videoVolumeBtn').css('background-position', "0px 0px" );
				
				$('.voteVolumeBackdrop').height( bh );
			}
			
		}
		
		function updateVideo(p,t){
			if( $vc.open ){
				t = Math.ceil( t );
				p = Math.ceil( p );
				
				$vc.per = p/t;
				
				var ts = t%60;
				if (ts<10) ts= "0"+ts;
				
				t = Math.floor( t/60 )+":"+ts%60;
				
				var s = p%60;
				if (s<10) s= "0"+s;
				
				p = Math.floor( p/60 )+":"+s
				
				$('.videoTime').text( p+" / "+t );
				
				updateScrub();
			}		
		}
		
		function updateScrub(){
			if( $vc.open ){
				var max = $('.voteScrub').width()-13;
				var cur = $vc.per*max;
				
				if ( !$vc.seek ) {
					$('.voteScrubHandle').css( 'left', cur+'px' );
				}
				
				$('.voteScrubBackdrop').css( 'width', $('.voteScrubHandle').css('left') );
			}
		}
		
		/***************
		Close Video
		****************/
		function closeVideo(){
			if ( swfobject.hasFlashPlayerVersion("9.0.0") ) {
				if ( $vsource && $vc.open ) $vsource.clearVideo();
				$vc.open = false;
			}	else $(".vote-video-wrapper").html('<div class="video-player" id="voteVideoPlayer"></div>');
			
			$vote.video.hide();
		}
		
		/***************
		POLLS LOGIC
		****************/
		//starting up
		
		activateCurrentPolls();
		stripInnactive();
				
		//Tabs
		$("#currentPollsButton").click(function() {
			if (currentTab != "currentPolls") {
				activateCurrentPolls();
			}
		});
		$("#pastWinnersButton").click(function() {
			if (currentTab != "pastWinners") {
				activatePastWinners();
			}
		});
		
		function toggleButton($b) {
			//Reset all the buttons
			$($b).parent('div').children(".poll-button-active").attr("class", "poll-button");
			//Highlight the clicked button
			$($b).attr("class", "poll-button-active");
		}
		
		//Determines which button is at the top of the list and highlights it
		function highlightFirstButton() {
			var pollName = String();
			var buttonName = String();
			$('#availablePollsList').children('.poll-button').each(function() {
				if($(this).attr("available")=="true") {
					buttonName = "#"+String($(this).attr('id'));
					//Fire the button to show the first poll
					$(this).trigger('click');
					//Fire the button to show the matching winners list
					$('#pastWinnersList').children(buttonName).trigger('click');
					//Stops the search once we've highlighted the top button
					return false;
					}
			})
		}
		
		function activateCurrentPolls() {
			currentTab = "currentPolls";
			$("#availablePollsList").css("visibility", "visible");
			$("#pastWinnersList").css("visibility", "hidden");
			$("#currentPollsButton").attr("class", "active-tab");
			$("#pastWinnersButton").attr("class", "link-tab");
			activatePoll(currentPoll);
		}

		function activatePastWinners() {
			currentTab = "pastWinners";
			$("#availablePollsList").css("visibility", "hidden");
			$("#pastWinnersList").css("visibility", "visible");
			$("#currentPollsButton").attr("class", "link-tab");
			$("#pastWinnersButton").attr("class", "active-tab");
			activatePoll(currentPoll);
		}

		function activatePoll($p) {
			//Store the button ID
			$b = String('#'+$p);
			$p = String($p).replace('Button', '');
			currentPoll = String($p);
			var $id_poll = String("#" + $p + "Poll");
			var $id_winners = String("#" + $p + "Winners");
			$(".vote-boxLarge").css("visibility", "hidden");
			if (currentTab == "currentPolls") {
				//If we're switching back, make sure the poll that matches the winner content is available.  If not, default back to the first poll.
				var available = $($id_poll).children('.poll-answers').children('.pollData').attr('available');
				if((available=="true")||(available=="True")) {
					//Store this poll as the last viewed
					lastViewedPoll = $id_poll;
					//Show the poll the user selected.
					$($id_poll).css("visibility", "visible");
				} else {
					//The poll is not available.  Show the last viewed poll that is available.
					$(lastViewedPoll).css("visibility", "visible");					
					//Switch the button to this poll, since the current button won't be visible
					$b = String(lastViewedPoll).replace('Poll','')+'Button';
					//console.log('Defaulting to old setting: '+$b);
				}
			} else {
				//$b = String(lastViewedPoll).replace('Poll','');
				//$b += 'Button';
				$($id_winners).css("visibility", "visible");
			}
			//console.log('Setting buttons to '+$b);
			//Activate the appropriate buttons
			toggleButton($('#availablePollsList').children($b));
			toggleButton($('#pastWinnersList').children($b));
		}

		function stripInnactive() {
			$('#availablePollsList > .poll-button').each(function() {
				var $n = String($(this).attr('id')).replace('PollButton', '');
				var $b = String($(this).attr('id'));
				if (currentPoll != $n) {
					$($b).remove();
				}
			})
		}
		//Poll Logic		
		function handleVote($t) {
			//Set the containing object here
			var parent = $($t).closest('div');
			//Poll Name
			var $n = String($($t).closest('.poll-answers').attr('id')).replace('Answers', '');
			//Store the episode and poll numbers
			var episode = $(parent).parents('.poll-answers').children('.pollData').attr('episode');
			var poll = $(parent).parents('.poll-answers').children('.pollData').attr('poll');
			//Store the user's answer
			var answer = $($t).attr('answer');		
			dataLoading();
			/*$.ajax({
				url: "Scripts/PollData.php",
				type: "POST",
				data: {
					episode: episode,
					poll: poll,
					answer: answer
				},
				success: function(result) {
					var results = $.parseJSON(result);
					populateValues(results);
					
				},
				error: function(jqXHR, textStatus, errorThrown) {
					//Handle Error
				},
				complete: function(data) {
					//Next steps
				}
			});
			*/
			dataLoaded();
			
			function populateValues($r) {
				//139 being the width of the bar
				var $a1 = '#' + $n + 'Answer1Total';
				var $a2 = '#' + $n + 'Answer2Total';
				var $a3 = '#' + $n + 'Answer3Total';
				var $a4 = '#' + $n + 'Answer4Total';
								
				$($a1).css("width", ((($r.answer1Totals / $r.totalVotes) * 100) * 1.39));				
				$($a2).css("width", ((($r.answer2Totals / $r.totalVotes) * 100) * 1.39));				
				$($a3).css("width", ((($r.answer3Totals / $r.totalVotes) * 100) * 1.39));
				$($a4).css("width", ((($r.answer4Totals / $r.totalVotes) * 100) * 1.39));
			}

			function dataLoading() {
				//Handle loading icons, timeouts, etc. here
			}
	
			function dataLoaded() {
				//Handle view here after data has loaded			
				var $answers = '#' + $n + 'Answers';
				var $results = '#' + $n + 'Results';
				$($answers).hide();
				$($results).show();
			}
		
		}

		/***************
		ERROR LOAD
		****************/
		function loadError(jqXHR, textStatus, errorThrown) {
			//console.log("DATA loaderror", textStatus);
		}
		/***************
		OPEN VOTE		
		****************/
		function openVote() {
			$(document).trigger("voteOpened");
			$(document).trigger("animationStarted");
			
			activatePoll(currentPoll);
			toggleButton($('#availablePollsList').children('#'+currentPoll+'Button'));
			toggleButton($('#pastWinnersList').children('#'+currentPoll+'Button'));
			
			$vote.link.hide();
			$vote.w.show();
		}
		/***************
		CLOSE VOTE
		****************/
		function closeVote() {
			$(document).trigger("animationFinished");
			$vote.w.hide();
			$vote.link.show();
		}
		/***************
		PUBLIC
		****************/
		return {
			init: init,
			playing: playing,
			paused: paused,
			update: updateVideo
		}
	})();
	Construct = (function() {
		$(document).ready(function() {
			WQ.Vote.init();
		});
	})();
})(jQuery, WQ);