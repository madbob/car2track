var map = L.map('map').setView([45.0652, 7.6647], 13);

L.tileLayer( "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
	{
		attribution: "Map data &copy; <a href=\"http://openstreetmap.org\">OpenStreetMap</a> contributors, <a href=\"http://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>"
	}
).addTo(map);

var loadcount = 0;
var tracks = Array();
var list;
var max_distance = 0;

/*
	From:
	http://stackoverflow.com/questions/1484506/random-color-generator-in-javascript
*/
function getRandomColor() {
	var letters = '0123456789ABCDEF'.split('');
	var color = '#';

	for (var i = 0; i < 6; i++ )
		color += letters[Math.floor(Math.random() * 16)];

	return color;
}

function handleTracks() {
	list = $('#list');

	$.getJSON('gettracks.php', function(data) {
		for (var name in data) {
			if (data.hasOwnProperty(name)) {
				if (data[name].length > 1) {
					var coords = '';
					var index;

					for (var i = 0; i < data[name].length && i < 99; i++) {
						index = i + 1;
						coords = coords + 'lat' + index + '=' + data[name][i].lat + ';lon' + index + '=' + data[name][i].lon + ';';
					}

					loadcount++;

					$.get('https://route.madbob.org/router.cgi?transport=motorcar;' + coords + 'type=shortest', function(generated) {
						var uuid = generated.substr(0, generated.indexOf("\n"));
						var track = new L.GPX('https://route.madbob.org/results.cgi?uuid=' + uuid + ';type=shortest;format=gpx-track', {
							async: true,
							marker_options: {
								startIconUrl: null,
								endIconUrl: null,
								shadowUrl: null
							},
							polyline_options: {
								color: getRandomColor()
							}
						});
						track.addTo(map);

						tracks.push(track);

						track.on('mouseover', function(e) {
							for (var i = 0; i < tracks.length; i++)
								tracks[i].setStyle({opacity: 0});

							e.target.setStyle({opacity: 1});
						});

						track.on('mouseout', function(e) {
							for (var i = 0; i < tracks.length; i++)
								tracks[i].setStyle({opacity: 0.5});
						});

						track.on('loaded', function(e) {
							var d = e.target.get_distance();
							var l = Math.round(d, -2);
							p = $('<p data-target="' + e.target._leaflet_id + '" data-length="' + l + '"></p>');
							list.append(p);

							if (d > max_distance) {
								max_distance = d;

								list.find('p').each(function() {
									l = $(this).attr('data-length');
									$(this).css('width', (l * 100 / max_distance) + '%');
								});
							}
							else {
								p.css('width', (l * 100 / max_distance) + '%');
							}
						});

						loadcount--;

						if (loadcount <= 0)
							$('#loading').remove();
					});
				}
			}
		}
	});

	$('#list').on('mouseenter', 'p', function() {
		var id = $(this).attr('data-target');
		var t;

		for (var i = 0; i < tracks.length; i++) {
			t = tracks[i];

			if (t._leaflet_id == id)
				t.setStyle({opacity: 1});
			else
				map.removeLayer(t);
		}
	});

	$('#list').on('mouseleave', 'p', function() {
		var id = $(this).attr('data-target');
		var t;

		for (var i = 0; i < tracks.length; i++) {
			t = tracks[i];

			if (t._leaflet_id == id)
				t.setStyle({opacity: 0.5});
			else
				map.addLayer(tracks[i]);
		}
	});
}

$(document).ready(function() {
	handleTracks();

	// updateInfo();
	// tick();
});
