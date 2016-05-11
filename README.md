# jquery-cropper

Simple Image Cropper that works on Desktop and Mobile.

This plugin widget depends on jQuery, jQueryUI, and FabricJS and is partly a learning experiment using these libraries.

see https://learn.jquery.com/plugins/stateful-plugins-with-widget-factory/

[![Build Status](https://travis-ci.org/chrisstoy/jquery-cropper.svg?branch=master)](https://travis-ci.org/chrisstoy/jquery-cropper)

##  Create a cropper widget
 
 At a minimum, you must define an element that has a `<canvas>` as a child.  For example:

`
<div class="crop-wrapper">
	<canvas></canvas>
</div>
`

Then, in your Javascript, attach the cropper widget to the outer `<div>` element. Example:

 `$('.crop-wrapper').cropper({ imgUrl: 'some image url here' });`

You can then access the current cropData as from the cropper() element

 `var cropData = $('.crop-wrapper').cropper('cropData');`

To get the original size of the image, get the 'imageSize':

 `var originalImageSize = $('.crop-wrapper').cropper('imageSize');`
