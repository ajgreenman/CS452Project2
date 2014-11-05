<!DOCTYPE html>
<html lang="en">
  <head>
    <title>Project 2 - Page Replacement</title>
    <meta charset="utf-8" />
    <link rel="stylesheet" type="text/css" href="css/main.css" />
    <script type="text/javascript" src="js/jquery.min.js" charset="utf-8"></script>
    <script type="text/javascript" src="js/validate.js" charset="utf-8"></script>
  </head>
  <body>
    <div id="header">
      <h1>Project 2 - Page Replacement</h2>
      <h2 id="author">Written by Andrew Greenman</h3>
    </div>
    <div id="container">
      <p id="fnf_error" class="error"><strong>The file was not found.</strong></p>
      <p id="empty_error" class="error"><strong>Please enter a file name.</strong></p>
      <form id="input_file_form" name="input_file" action="index.php" method="POST">
        <input type="hidden" name="MAX_FILE_SIZE" value="1000" />
        <p>
          <label for="file_name"><strong>Input file:</strong></label>
          <input type="text" name="file_name" id="file_name" size="25" />
        </p>
        <input type="submit" value="Submit" />
      </form>
    </div>

<?php

if($_SERVER["REQUEST_METHOD"] == "POST") {
  $errors = array();

  // Check that the user entered a file name.
  if(!empty($_POST["file_name"])) {
    $fn = trim($_POST["file_name"]);
  } else {
    $errors[] = "Please enter the file name.";
  }

  if(!empty($errors)) {
    foreach ($errors as $msg) {
      echo "<p class=\"error\">$msg</p>";
    }
  } else {

  }
}

?>

  </body>
</html>

<?php

?>