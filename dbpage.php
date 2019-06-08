<?php 

header('Access-Control-Allow-Origin: *');
$data = file_get_contents("db.json");
$data = json_decode($data,true);
$countElemPage = 20;
$countPage = 1;
$countElem = null;
$objectsCount = count($data);
$objectsSort = [];
$objects = [[],[$objectsCount],[$countElemPage]];
$numberFullPages = null;

function updateCountElem(){
	if($GLOBALS['countPage'] <= $GLOBALS['numberFullPages']  - 1){
		$GLOBALS['countElem'] = $GLOBALS['countElemPage'] * $GLOBALS['countPage'];
	} else {
		$GLOBALS['countElem'] = $GLOBALS['objectsCount'];
	}
}

function updateCountPage(){
	if(isset($_GET['page'])){
		$page = $_GET['page'];
		if($page <= $GLOBALS['numberFullPages']){
			$GLOBALS['countPage'] = $page;
		} else {
			$GLOBALS['countPage'] = 0;
		}
	}
}

function updateNumberFullPages(){
	$GLOBALS['numberFullPages'] = ceil($GLOBALS['objectsCount'] / $GLOBALS['countElemPage']);
}

if (isset($_GET["sort"]) && isset($_GET["order"])){
	$sort = $_GET["sort"];
	$sortOrder = $_GET["order"];
	updateNumberFullPages();
	updateCountPage();
	updateCountElem();

	if($sort === "price") {
		if($sortOrder === "asc") {	
			usort($data, "sort_asc");
			foreach ($data as $item):
				array_push($objectsSort, $item);
			endforeach;
		} else {
			usort($data, "sort_desc");
		
			foreach ($data as $item):
				array_push($objectsSort, $item);
			endforeach;
		}
	}
		
	if($sort === "room") {
		if($sortOrder === "asc") {
			usort($data, "sortAscRoom");
			foreach ($data as $item):
				array_push($objectsSort, $item);
			endforeach;
		} else {
			usort($data, "sortDescRoom");
			foreach ($data as $item):
				array_push($objectsSort, $item);
			endforeach;
		}
	}
}

if (isset($_GET["page"])){
	updateNumberFullPages();
	updateCountPage();
	$position = $countPage * $countElemPage - $countElemPage;
	updateCountElem();
	
	if(count($objectsSort)){
		for($i = $position; $i < $countElem; $i++){
			if($objectsSort[$i]){
				array_push($objects[0], $objectsSort[$i]);
			}
		}
	} else {
		 for($i = $position; $i < $countElem; $i++){
			if($data[$i]){
				array_push($objects[0], $data[$i]);
			}
		 }
	} 
}

function sortRoom($room){
	$sortByRoom = [
		'Студия'=> 0,
		'Однокомнатная'=> 1,
		'Двухкомнатная'=> 2,
		'Трехкомнатная'=> 3,
		'Четырехкомнатная'=> 4,
	];

	return $sortByRoom[$room];
}

function sortAscRoom($a, $b){
	return sortRoom($a["caption"]) - sortRoom($b["caption"]);
}

function sortDescRoom($a, $b){
	return sortRoom($b["caption"]) - sortRoom($a["caption"]);
}

function sort_asc($a, $b) {
	return $a["price"] - $b["price"];
}
function sort_desc($a, $b) {
	return  $b["price"] - $a["price"];
}


if($countElem <= $objectsCount){
	echo json_encode($objects);
}





