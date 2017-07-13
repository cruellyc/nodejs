$(document).ready(function() {
$('#query').click(function(){
  $.ajax({
			dataType: "json",
			url: "http://127.0.0.1:8888/query?id="+$('#zpid').val(),
			timeout: 5000,
			xhrFields: {withCredentials:true},
			crossDomain: true,
			success: function(j){alert(j.data);},
			error: function(){
				alert('error');
			}
		});

 });
  $('#cli').click(function(){
  $.ajax({
			dataType: "json",
			url: "http://127.0.0.1:8888/login/check?text="+$('#mess').val()+"&id="+$('#zpid').val(),
			timeout: 5000,
			xhrFields: {withCredentials:true},
			crossDomain: true,
			success: function(j){alert(j.data);},
			error: function(){
				alert('error');
			}
		});

 });
});