var grab = function(items, callback) {
	if (items && items.length > 0) {
		var item = items[0];
	
		if (item instanceof HTMLImageElement || item instanceof HTMLVideoElement) {
	
			callback(item);
	
		} else if (item instanceof File) {
	
			var imageType = /^image\//;
			var videoType = /^video\//;
	
			if (imageType.test(item.type)) {
				var img = document.createElement('img');
				img.addEventListener('load', function() {
					window.URL.revokeObjectURL(this.src);
	
					callback(this);
				}, false);
				img.src = window.URL.createObjectURL(item);
			} else if (videoType.test(item.type)) {
				var video = document.createElement('video');
				video.src = window.URL.createObjectURL(item);
				callback(video);
			} else {
				callback();
			}
		} else {
			if (item.length && item.lastIndexOf && (item.lastIndexOf('.mp4') == item.length - 4 || item.lastIndexOf('.mov') == item.length - 4)) {
				var video = document.createElement('video');
				video.onload = function() {
					callback(this);
				};
				video.src = item;
			} else {
				var img = document.createElement('img');
				img.onload = function() {
					callback(this);
				};
				img.src = item;
			}
		}
	} else {
		callback();
	}
}

function download(url, callback) {
	var oReq = new XMLHttpRequest();

	oReq.onload = function(e) {
		var arrayBuffer = oReq.response; // not responseText

		if (arrayBuffer) {
			callback(arrayBuffer);
		} else {
			callback();
		}
	};

	oReq.onerror = function() {
		callback();
	};

	oReq.open('GET', url, true);
	oReq.responseType = 'arraybuffer';
	oReq.send();
}