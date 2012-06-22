$(function(){
	var img = null;
	var _canto = canto;
	var drop = $('#image');
	drop.bind({
		dragenter: function(){
			$(this).addClass('highlighted');
      return false;
		},
		dragover: function(){
			return false;
		
		},
		dragleave: function(){
			$(this).removeClass('highlighted');
      return false;
		}, 
		drop: function(e) {
			var dt = e.originalEvent.dataTransfer;
			window.img = new IMG(dt.files[0]);
			return false;      
		}
	});	
	
	setInfo('Drag the image file into container below');

	
});

function setInfo(str) {
	$('.props').html('<span class="info">'+str+'</span>');
}


function getVal(prop) {
 return $('.'+prop).val();
}

function getRel(sel) {
	return $('.'+sel+'.active').attr('rel');
}

function getParams() {
	var params = {};
	$('.props .right [rel]').each(function(){
		params[$(this).attr('rel')] = parseFloat($(this).data('value')) || $(this).val();
	});
	return params;
}
