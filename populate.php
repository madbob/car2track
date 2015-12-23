<?php

require('config.php');

$url = sprintf('https://www.car2go.com/api/v2.0/vehicles?loc=%s&format=json', $config['car2go']['city']);
$s = curl_init($url);
curl_setopt($s, CURLOPT_RETURNTRANSFER, true);
$data = curl_exec($s);
$status = curl_getinfo($s, CURLINFO_HTTP_CODE);
curl_close($s);

if ($status != 200)
	exit();

$db = new mysqli($config['db']['host'], $config['db']['user'], $config['db']['pass'], $config['db']['name']);
if ($db->connect_errno)
	exit();

$expiry = date('Y-m-d G:i:s', time() - (60 * 60 * 24));
$query = sprintf("DELETE FROM logs WHERE date < '$expiry'");
$db->query($query);

$data = json_decode($data);
$now = date('Y-m-d G:i:s');

foreach($data->placemarks as $point) {
	preg_match('/^\[(?P<lon>[0-9\.]*),(?P<lat>[0-9\.]*),0\]$/', $point->coordinates, $match);
	$query = sprintf("INSERT INTO logs (name, lat, lon, date) VALUES ('%s', %s, %s, '%s')", $point->name, $match['lat'], $match['lon'], $now);
	$db->query($query);
}

$db->close();
