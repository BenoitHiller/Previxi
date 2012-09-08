var convertMinutes = function(minutes) {
  var hours = minutes % 24;
  var relative_minutes = minutes / 24;
  return String(hours) + ":" + String(minutes); 
}

$(function() {
  console.log("Hello, world");
  $('#horizSlider').slider({
    change: function(event, ui) {
      console.log("Value is now: " + ui.value);
      $("#time").text(convertMinutes(ui.value));
    }
  }).width(470);
  //$.getJSON('bixidata.json', function(bixiData) {
  //});
  $("#dp").datepicker();

});
