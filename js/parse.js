var file_contents;
var file_by_line;
var num_processes;
var current_line = 0;
var page_references = [];
var process_faults = [];

$(function() {
  $("#page_fault_status").hide();
  $("#clear_status").hide();

  file_contents = $("#file_contents").text();
  num_processes = getNumProcesses(file_contents);
  for(var i = 0; i <= num_processes; i++) {
    process_faults[i] = 0;
    page_references[i] = 0;
  }

  createProcessTable(num_processes);

  $("#walkthrough").click(function() {
    processLine(file_by_line[current_line]);
    current_line++;
  });

  $("#runthrough").click(function() {
    runToCompletion(file_by_line);
  })

  $("#clear_button").click(function() {
    clearData();
  });
});

function getNumProcesses(contents) {
  // Counts the number of processes in the file.

  file_by_line = contents.split('\n'); // Split file into lines.

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
    $("#process_table").append("<div id=\"process_pcb_" + i + "\" class=\"pcb\"><h4>Process " + i + "</h4>" +
      "<div id=\"process" + i + "blah><p id=\"page_faults_" + i + "\">Page Faults: <span id=\"num_page_faults_" +
      i + "\">0</span></p><p id=\"page_references_" + i + "\">Page References: <span id=\"num_page_references_" +
      i + "\">0</span></p></div></div>");
  }
  $(".pcb").hide();
}

function processClicked(index) {
  // Reset all process tables to original state.
  $(".pcb").hide();
  $(".smallButton").css('background', '#FFFFFF');

  // Show the proper process table.
  $("#process_pcb_" + index).show();
  $("#process" + index).css('background', '#94FF9B');
}

function convertToNumber(binary) {
  return parseInt(binary, 2);
}

function processLine(line) {
  $("#clear_status").hide();
  $("#page_fault_status").hide();
  $("#current_line").text("Current line: " + line);
  $("#current_line").show();

  var line_contents = line.split(':'); // Splits the line by the colon.
  var process_number = line_contents[0][1]; // Gets the id of the process out of the line.
  var page_reference = line_contents[1]; // Gets the page reference out of the line.
  page_reference = convertToNumber(page_reference); // Converts to an int value.

  processClicked(process_number); // Show the correct process.

  page_references[process_number]++; // Add a page reference to the correct process.
  $("#num_page_references_" + process_number).text(page_references[process_number]); // Display the number of page references.

  if(checkForPageFault(process_number, page_reference)) {
    $("#page_fault_status").show();
    process_faults[process_number]++;
    $("#num_page_faults_" + process_number).text(process_faults[process_number]); // Display the number of page faults.
  }
}

function runToCompletion(file) {
  clearData(); // Clear all data before running this.

  for(var i = 0; i < file.length; i++) {
    processLine(file[i]);
    console.log();
  }
}

function checkForPageFault(pid, page) {
  if(page == 0) {
    return true;
  } else {
    return false;
  }
}

function clearData() {
  $.each(process_faults, function(index) {
    process_faults[index] = 0;
    $("#num_page_faults_" + index).text(process_faults[index]); // Display the number of page faults.
  });


  $.each(page_references, function(index) {
    page_references[index] = 0;
  $("#num_page_references_" + index).text(page_references[index]); // Display the number of page references.
  });

  current_line = 0;

  $("#current_line").hide();
  $("#page_fault_status").hide();
  $("#clear_status").show();
}