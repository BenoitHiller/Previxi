$(function() {
  console.log("Hello, world");
  $('#horizSlider').slider({
    change: function(event, ui) {
      console.log("Value is now: " + ui.value);
    }
  }).width(500);
  //$.getJSON('bixidata.json', function(bixiData) {
  //});
});