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
	$episode = $_POST['episode'];
	$poll = $_POST['poll'];
	$answer = $_POST['answer'];
	
	//Convert the strings to integers
	settype($episode, "integer");
	settype($poll, "integer");
	settype($answer, "integer");
	
	//Determine which answer the user selected
	$answerColumn;
	
	//The database has six answer columns and accepts a value between 1 and 6
	switch ($answer) {
		case 1:
		$answerColumn = 'answer1';
		break;
		case 2:
		$answerColumn = 'answer2';
		break;
		case 3:
		$answerColumn = 'answer3';
		break;
		case 4:
		$answerColumn = 'answer4';
		break;
		case 5:
		$answerColumn = 'answer5';
		break;
		case 6:
		$answerColumn = 'answer6';
		break;
	}
		  	  
	//Attempt to pull data from existing table row
	$result = mysql_query("SELECT * FROM polls WHERE episode_nbr='+$episode+' AND poll_nbr='+$poll+'");
		
	if(mysql_num_rows($result)==0)
	{
		//If a poll for this episode has not been created, create it now and add an initial value of one
		$newValue = 1;
		
		$write = mysql_query("INSERT INTO polls (`episode_nbr`, `poll_nbr`, $answerColumn) VALUES ($episode,$poll,$newValue)");
		
		//Pull the data from the row we just created
		$result = mysql_query("SELECT * FROM polls WHERE episode_nbr='+$episode+' AND poll_nbr='+$poll+'");
		
	} else {
		
		//Get the current value stored in the column and add 1 to it
		while ($row = mysql_fetch_array($result)) 
		{
			$newValue = ($row[$answerColumn]) + 1;
		} 
		
		//Store the new value in the appropriate column
		$write = mysql_query("UPDATE polls SET $answerColumn=$newValue WHERE episode_nbr='+$episode+' AND poll_nbr='+$poll+'");
		
	}
	
	//Determine the totals for each column
	$answer1Totals;
	$answer2Totals;
	$answer3Totals;
	$answer4Totals;
	$answer5Totals;
	$answer6Totals;
	$totalVotes;
	
	
	//Rerun the query.
	$result = mysql_query("SELECT * FROM polls WHERE episode_nbr='+$episode+' AND poll_nbr='+$poll+'");
	
	//Assign values and replace NULL values with 0
	while ($row = mysql_fetch_array($result)) 
	{
		$answer1Totals = getAnswerValues('answer1', $answer1Totals, $row);
		$answer2Totals = getAnswerValues('answer2', $answer2Totals, $row);
		$answer3Totals = getAnswerValues('answer3', $answer3Totals, $row);
		$answer4Totals = getAnswerValues('answer4', $answer4Totals, $row);
		$answer5Totals = getAnswerValues('answer5', $answer5Totals, $row);
		$answer6Totals = getAnswerValues('answer6', $answer6Totals, $row);
		
		$totalVotes = $answer1Totals+$answer2Totals+$answer3Totals+$answer4Totals+$answer5Totals+$answer6Totals;
	}
	
	function getAnswerValues($a, $v, $r)
	{
		$v = $r[$a];
		
		if ($v == NULL)
		{
			$v = 0	;
		}
		
		return $v;
	}
	
	$data = array('answer1Totals' => $answer1Totals,
				  'answer2Totals' => $answer2Totals,
				  'answer3Totals' => $answer3Totals,
				  'answer4Totals' => $answer4Totals,
				  'answer5Totals' => $answer5Totals,
				  'answer6Totals' => $answer6Totals,
				  'totalVotes' => $totalVotes);
	
	echo json_encode( $data, JSON_FORCE_OBJECT );
	
?>