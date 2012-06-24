    var sp = getSpotifyApi(1);
    var models = sp.require("sp://import/scripts/api/models");
    var views = sp.require("sp://import/scripts/api/views");
    var lib =  models.library;
    var starred = lib.starredPlaylist;
    var starredLen = starred.length;
    //var tracks = lib.tracks;
    var ENurl = "http://developer.echonest.com/api/v4/";
    var ENApiKey = "TJABTYYERZIREU3EJ"; 
    var min_dance = 0.7;
	var pl = new models.Playlist();
	
exports.init = init;    
exports.reload = reload;
exports.filterPl = filterPl;
exports.addAttr = addAttr;

function init(){
        console.log("init starting...");
        initdfd = $.Deferred();
	$(document).ready(
		function(){
			console.log("document ready");
			$('body').append('<div id="player"></div>');
			console.log("added player");
			var playlist = randomPl();			
			$.when(makePlayer(playlist)).then(
				function(){
					console.log("makePlayer has returned");
					console.log(initdfd.state());
					initdfd.resolve();
					console.log(initdfd.state());
				}
			);
		}
	);
	setTimeout(function(){
        		addAttr()
        	}, 1
        );
	return initdfd.promise();
}

function randomPl(){
    clearPl();
    while(pl.length<10){
        var song = starred.get(Math.floor((Math.random()*starredLen)+1));
    	console.log(song);
        var songURI = song.uri;
        pl.add(songURI);
    }
    console.log(pl);
    return pl;
}

function makePlayer(pl){
    var makePlayerdfd = $.Deferred();
    var playlist = new views.List(pl);
    console.log(playlist);
    console.log(playlist.node);
    if ($('#player').children().length>0){
    	clearPl(); //needs to be ajaxified
    }
    $.when($('#player').append(playlist.node)).then(makePlayerdfd.resolve);
    //console.log($('#player'));
    return makePlayerdfd.promise();
}

function reload(){
    $('#player').remove();
    init();
}


function clearPl(){
    pl = new models.Playlist();
}

function addAttr(){
	console.log("starting addAttr()...");
    var $tracks = $('#player').children().children().children();
    //console.log($tracks);
    for(var i=0; i < $tracks.length; i++){
		var songURI = $($tracks[i]).attr('href');
		//console.log($($tracks[i]).attr('danceability'));
		if($($tracks[i]).attr('danceability')==undefined){
			addDanceability(songURI, $tracks[i]);
		}
    }
}

function addDanceability(songURI, $track){
	//console.log("starting addDanceability()...");
	//console.log($track);
	var url = ENurl;
	url += "song/profile?api_key=" + ENApiKey;
	url += "&track_id=" + songURI.replace('spotify', 'spotify-WW');
	url += "&format=json&bucket=audio_summary&bucket=tracks&bucket=id:spotify-WW";
	//console.log(url);
	console.log("ajax request");
	$.getJSON(url,
		function (json){
			if(checkResponse(json)){
				console.log(url);
				console.log(json);
				var danceability = json.response.songs[0].audio_summary.danceability;
				console.log(danceability);
				if(danceability == null){
					console.log("no danceability");
					$($track).attr('danceability' , 0);
				}			
				else $($track).attr('danceability', danceability); 
			}
			else{
				console.log("json problem");
				$($track).attr('danceability' , 0);
			}
		}
	).error(function(){$($track).attr('danceability' , 0)});
}


function filterPl(){
	
	for(var i=0; i<20; i++){
		var changed = false;
		var $tracks = $('#player').children().children().children();
		for(var i=0; i < $tracks.length; i++){
			var danceability = $($tracks[i]).attr('danceability');
			if (danceability < min_dance){
				 //console.log($($tracks[i]).attr('data-itemindex'));
				 var itemindex = $($tracks[i]).data('itemindex');
				 var viewindex = $($tracks[i]).data('viewindex');
				 pl.remove($tracks[i]);
				 insert_new_track(itemindex, viewindex);
				 changed = true;
			}
		}
		/*if (!changed){
			break;
		}*/
		setTimeout(function(){addAttr();},1);
	} 
    console.log('add attr');
}

function insert_new_track(itemindex, viewindex){
	/*var tempPlaylist = new models.Playlist();
	var newSong = starred.get(Math.floor((Math.random()*starredLen)+1));
    var newSongURI = newSong.uri;
	var newSong = starred.get(Math.floor((Math.random()*starredLen)+1));
	console.log(newSong);
    var newSongURI = newSong.uri;
    console.log(newSongURI);
    tempPlaylist.add(newSongURI);
    console.log(tempPlaylist);
    console.log(tempPlaylist.get(0));
	//setTimeout(function(){
		var plist = new views.List(tempPlaylist);
    	console.log(plist);
    	console.log(plist.node);
    //}, 1);*/
    
    var song = starred.get(Math.floor((Math.random()*starredLen)+1));
    var songURI = song.uri;
    /*var title = song.name;
    var artist = song.artists[0];
    var artistURI = artist.uri;
    var duration = song.duration;
    var album = song.album;
    var albumTitle = album.name;
    var albumURI = album.uri;  
    var translateY = viewindex*20;
    
    var outerhtml = '<a href="' + songURI +'"';
    outerhtml += ' class="sp-item sp-track sp-track-availability-0 sp-track-starred" ';
    outerhtml += 'title="' + title + ' by ' + artist + '"';
    outerhtml += 'data-itemindex="' + itemindex + '"';
    outerhtml += 'data-viewindex="' + viewindex + '"';
    outerhtml += 'style="-webkit-transform: translateY(' + translateY + 'px); " danceability="0"></a>';
      
    innerhtml = '<span class="sp-track-field-star">' + 
    			'<span class="sp-icon-star {0}"></span>' + 
    		'</span>';
    innerhtml += '<span class="sp-track-field-share"><span class="sp-icon-share"></span></span>';
    innerhtml += '<span class="sp-track-field-name">' + title + '</span>';
    innerhtml += '<span class="sp-track-field-artist">' + 
    			'<a href="'+ artistURI +'">' + artist + '</a>' + 
    		'</span>';
    innerhtml += '<span class="sp-track-field-duration">2:10</span>';
    innerhtml += '<span class="sp-track-field-album">' + 
    			'<a href="'+ albumURI +'" title="'+albumTitle+' by '+ artist+'">'+albumTitle+'</a>' +
    		'</span>';
    		
	//console.log(html);
	$($('#player').children().children()[0]).append(outerhtml);
	$track = $($('#player').children().children().children().last());
	$track.append(innerhtml);*/
	pl.add(songURI);
	console.log('added track');
	/*setTimeout(function(){
		console.log(songURI);
		//console.log($('#player').children().children().children());
		var $track = $('#player').children().children().children('a[href="'+songURI+'"]');
		console.log($track);
		addDanceability(songURI, $track);
	},1);*/
}

/*function getMatchingSong(){
	song = starred.get(Math.floor((Math.random()*starredLen)+1));
	var danceability;
	for(var i=0; i<50; i++){
		$.getJSON(url,
			function (json){
				if(checkResponse(json)){
					console.log(url);
					console.log(json);
					danceability = json.response.songs[0].audio_summary.danceability;
					console.log(danceability);
					if(danceability == null){
						console.log("no danceability");
						danceability = 0;
					}			
					else {
						if(danceability > min_dance){
							return song;
						}
					}; 
				}
				else{
					console.log("json problem");
					danceability = 0;
				}
			}
		).error(function(){danceability = 0;});
	}
	return song;
}*/

function checkResponse(data) {
	if (data.response) {
		if (data.response.status.code != 0) {
			$('#error').text("Whoops... Unexpected error from server. " + data.response.status.message);
			console.log(JSON.stringify(data.response));
		} else {
			return true;
		}
	} else {
		error("Unexpected response from server");
	}
	return false;
}  
