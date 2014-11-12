<!DOCTYPE html>
<html lang="en">
  <head>
    <title>Project 2 - Page Replacement</title>
    <meta charset="utf-8" />
    <link rel="stylesheet" type="text/css" href="css/main.css" />
    <script type="text/javascript" src="js/jquery.min.js" charset="utf-8"></script>
    <script type="text/javascript" src="js/parse.js" charset="utf-8"></script>
  </head>
  <body>
    <div id="header">
      <h1>Project 2 - Page Replacement</h1>
      <h2 id="author">Written by Andrew Greenman</h2>
      <div id="buttons">
        <input type="button" id="walkthrough" class="bigButton" value="Step through program" />
        <input type="button" id="runthrough" class="bigButton" value="Run to completion" />
        <input type="button" id="next_button" class="bigButton" value="Next" />
      </div>
    </div>

<?php

if(!isset($_GET["file_name"])) {
  // If the user reaches this page incorrectly.

  echo "<p id=\"header\">An error occured. <a href=\"index.php\">Please try again.</a></p>";
} else {
  if($file = file_get_contents($_GET["file_name"])) {
    echo "<div id=\"file_contents\" style=\"display:none\">$file</div>";
  } else {
    // If the passed file was invalid somehow.

    echo "<p id=\"header\">An error occured. <a href=\"index.php\">Please try again.</a></p>";
  }
}

?>

  <div id="status">
    <h3>Status Updates</h3>
    <p id="current_line"></p>
  </div>

  <div id="process_table">
    <div id="process_list">
    </div>
  </div>

  <div id="address_space">
    <table
  </div>

  </body>
</html>