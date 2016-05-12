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

		// get the part of the image we are cropping
		var cropData = cropperElem.cropper('imageCrop');
		$('.crop-data').text(JSON.stringify(cropData, null, 3));

		$('.result').css('background-position', (-cropData.left) + "px " + (-cropData.top) + "px");
		$('.result').css('width', cropData.width + "px");
		$('.result').css('height', cropData.height + "px");
	}


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

			// set the initial crop size and location
			var crop = {
				"left": 560,
				"top": 50,
				"width": 160,
				"height": 155
			};
			cropperElem.cropper('imageCrop', crop);

			updateCroppedImage();
		});
});
