/**
 * Created by cstoy on 5/11/2016.
 */

$(document).ready(function () {
	'use strict';

	var cropperElem = $('.cropper-wrapper');

/*	var fanvas = new fabric.StaticCanvas('cropped-image');
	fanvas.setDimensions({ width: 300, height: 300});
	fanvas.clear();
	var resultImage = null;
	fabric.Image.fromURL('./test-image.jpg', function(img) {
		resultImage = img;
		fanvas.add(img.set({ left: 0, top: 0 }).scale(0.25));
	});*/

	function updateCroppedImage() {
		var cropData = cropperElem.cropper('cropData');
		console.log("Crop Data: " + JSON.stringify(cropData));

		var origImage = cropperElem.cropper('imageSize');


		//$('.result').css('background-position', cropData.)


	};


	$(cropperElem).cropper({
			imageUrl: './test-image.jpg'
		})
		.bind('cropperchanged', function (event, data) {
			// handle when cropData has changed
			updateCroppedImage();
		})
		.bind('cropperready', function (event, data) {
			// handle when cropper is ready to crop
			var imgUrl = cropperElem.cropper('option', 'imageUrl');
			$('.result').css('background-image', 'url(' + imgUrl + ')');

			updateCroppedImage();
		});
});
