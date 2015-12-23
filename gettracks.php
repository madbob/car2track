<?php

require('config.php');

$db = new mysqli($config['db']['host'], $config['db']['user'], $config['db']['pass'], $config['db']['name']);
if ($db->connect_errno)
	exit();

$query = "SELECT name, lat, lon FROM logs ORDER BY date ASC";
$logs = $db->query($query)->fetch_all(MYSQLI_ASSOC);
$data = [];

foreach($logs as $l) {
	$index = $l['name'];

	if (isset($data[$index]) == false) {
		$data[$index] = [];
		$data[$index][] = (object) [
			'lat' => $l['lat'],
			'lon' => $l['lon']
		];
	}
	else {
		$coords = $data[$index];
		$last = $coords[count($coords) - 1];

		if ($last->lat != $l['lat'] && $last->lon != $l['lon'])
			$data[$index][] = (object) [
				'lat' => $l['lat'],
				'lon' => $l['lon']
			];
	}
}

echo json_encode($data);
