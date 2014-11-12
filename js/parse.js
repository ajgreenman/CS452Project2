var file_contents;
var num_processes;

$(function() {
  file_contents = $("#file_contents").text();
  num_processes = getNumProcesses(file_contents);
  createProcessTable(num_processes);
});

function getNumProcesses(contents) {
  // Counts the number of processes in the file.

  var file_by_line = contents.split('\n'); // Split file into lines.

  var count = 0; // Initialize to 0.
  var process_count = [0]; // Initialize array to 0.

  // Loop through each line.
  $.each(file_by_line, function(index, value) {
    var line_contents = value.split(':'); // Splits the line by the colon.
    var process_number = line_contents[0][1]; // Gets the id of the process out of the line.

    if(!process_count[process_number]) {
      process_count[process_number] = 0; // If the process hasn't been recorded, add an entry to the array.
    }
    process_count[process_number] += 1; // Increment the process count.
  });

  $.each(process_count, function(index, value) {
    if(process_count[index] > 0) {
      // A process exists in the file if its count is greater than 0.

      count++;
    }
  });

  return count;
}

function createProcessTable(count) {
  // Creates all the necessary html for the process table.
  for(var i = 1; i <= count; i++) {
    $("#process_list").append("<input type=\"button\" name=\"process" + i +
     "\" id=\"process" + i + "\" value=\"Process " + i + "\" class=\"smallButton\" onclick=\"processClicked(" + i + ")\" />");
    $("#process_table").append("<div id=\"process_pcb_" + i + "\" class=\"pcb\"><h4>Process" + i + "</h4>" +
      "<div id=\"process" + i + "blah></div></div>");
  }
  $(".pcb").hide();
}

function processClicked(index) {
  // Reset all process tables to original state.
  $(".pcb").hide();
  $(".smallButton").css('background', '#BACDFF');

  // Show the proper process table.
  $("#process_pcb_" + index).show();
  $("#process" + index).css('background', '#A9BCEE');
}

function convertToNumber(binary) {
  return binary.toString(10);
}

function processLine(line) {
  $.each(line, function(index, value) {
    var line_contents = value.split(':'); // Splits the line by the colon.
    var process_number = line_contents[0][1]; // Gets the id of the process out of the line.
    var page_reference = trim(line_contents[1]); // Gets the page reference out of the line.
    page_reference = convertToNumber(page_reference); // Converts to an int value.

  });
}