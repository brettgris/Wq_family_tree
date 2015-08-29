<?php

	$db_host = "localhost";
	//$db_user = "root";
	//$db_pass = "root";
    $db_user = "whitequeen_user";
    $db_pass = "0xDdoFBURNUg";
    $db_name = "white_queen";
		
	$con = mysql_connect($db_host,$db_user,$db_pass);
	mysql_select_db($db_name, $con);
	
	// Create connection
	$con=mysqli_connect($db_host,$db_user,$db_pass,$db_name);
  
	//Capture URL variables from ajax request
	$polls = $_POST['polls'];

	$len = count( $polls );
	
	//Determine the totals for each column
	$answer1Totals;
	$answer2Totals;
	$answer3Totals;
	$answer4Totals;
	$answer5Totals;
	$answer6Totals;
	$totalVotes;
	
	function getAnswerValues($a, $v, $r) {
		$v = $r[$a];
		if ($v == NULL)	$v = 0;
		return $v;
	}
	
	$data = array();
	
	for ($i = 0; $i < $len ; $i++) {
    	$episode = $polls[$i]['e'];
    	$number = $polls[$i]['n'];
    	
    	settype($episode, "integer");
    	settype($number, "integer");
    
    	$result = mysql_query("SELECT * FROM polls WHERE episode_nbr='+$episode+' AND poll_nbr='+$number+'");
    	
    	//Assign values and replace NULL values with 0
		while ($row = mysql_fetch_array($result)) {
			$answer1Totals = getAnswerValues('answer1', $answer1Totals, $row);
			$answer2Totals = getAnswerValues('answer2', $answer2Totals, $row);
			$answer3Totals = getAnswerValues('answer3', $answer3Totals, $row);
			$answer4Totals = getAnswerValues('answer4', $answer4Totals, $row);
			$answer5Totals = getAnswerValues('answer5', $answer5Totals, $row);
			$answer6Totals = getAnswerValues('answer6', $answer6Totals, $row);
			
			$poll = $number;
			$episode = $episode;
		}
		
		$data[] = array('answer1' => $answer1Totals,
				  'answer2' => $answer2Totals,
				  'answer3' => $answer3Totals,
				  'answer4' => $answer4Totals,
				  'answer5' => $answer5Totals,
				  'answer6' => $answer6Totals,
				  'poll' => $poll, 
				  'episode' => $episode);
	}
	
	echo json_encode( $data, JSON_FORCE_OBJECT );
	
?>