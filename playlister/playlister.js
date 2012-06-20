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
        		playlister.addAttr()
        	}, 1
        );
	return initdfd.promise();
}

function randomPl(){
    var pl = new models.Playlist();
    while(pl.length<100){
        var song = starred.get(Math.floor((Math.random()*starredLen)+1));
        var songURI = song.uri;
        pl.add(songURI);
    }
    return pl;
}

function makePlayer(pl){
    makePlayerdfd = $.Deferred();
    var playlist = new views.List(pl);
    //console.log(playlist);
    if ($('#player').children().length>0){
    	clearPl(); //needs to be ajaxified
    }
    $.when($('#player').append(playlist.node)).then(makePlayerdfd.resolve);;
    //console.log('hi');
    return makePlayerdfd.promise();
}

function reload(){
    $('#player').remove();
    init();
}


function clearPl(){
    var playerHTML = document.getElementById('player');
    console.log(playerHTML.firstChild.firstChild.childNodes.length);
    while (playerHTML.hasChildNodes()) {
        var track = playerHTML.firstChild;
        playerHTML.removeChild(track);
    }
}

function addAttr(){
	console.log("starting addAttr()...");
    var $tracks = $('#player').children().children().children();
    //console.log($tracks);
    for(var i=0; i < $tracks.length; i++){
		var songURI = $($tracks[i]).attr('href');
		//console.log($tracks[i]);
		addDanceability(songURI, $tracks[i]);
    }
}

function filterPl(){
	var $tracks = $('#player').children().children().children();
	for(var i=0; i < $tracks.length; i++){
		var danceability = $($tracks[i]).attr('danceability');
		if (danceability < min_dance){
			 $($tracks[i]).remove();
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
