/**
 * Simple Image Cropper that works on Desktop and Mobile
 * This plugin widget depends on jQuery, jQueryUI, and FabricJS.
 * see https://learn.jquery.com/plugins/stateful-plugins-with-widget-factory/
 */
(function ($) {
	'use strict';

	/**
	 * Create a cropper widget
	 * 
	 * At a minimum, you must define an element that has a <canvas> as a child.  For example:
	 *
	 *  <div class="crop-wrapper">
	 *		<canvas></canvas>
	 *	</div>
	 *
	 * Then, in your Javascript, attach the cropper widget to the outer <div> element. Example:
	 *
	 * $('.crop-wrapper').cropper({ imgUrl: 'some image url here' });
	 *
	 * You can then access the current cropData as from the cropper() element
	 *
	 * var cropData = $('.crop-wrapper').cropper('cropData');
	 *
	 * To get the original size of the image, get the 'imageSize':
	 *
	 * var originalImageSize = $('.crop-wrapper').cropper('imageSize');
	 *
	 */
	$.widget('cstoy.cropper', {

		// default _model for the widget
		_model: {
			cropData: { u: 0, v: 0, width: 1.0, height: 1.0 },
			imageUrl: null,								// the URL of the image to 
			handleSize: 10,
			handleColor: 'white',
			lineColor: 'blue',
			gridColor: 'white',
			gridWidth: 1,
			lineWidth: 1,
			minCropSizeUV: .1,
			gridHideDelay: 500,							// how long after showing grid before it is hidden (in ms)
			cropBorderColor: 'rgba(255,255,255,0.5)',	// 50% opaque white
			cropAreaColor: 'rgba(0,0,0,0)'				// 100% transparent
		},

		_rawImage: null,	// the HTML Image object that we loaded

		// gets or sets the crop information
		cropData: function (value) {
			if (value === undefined) {
				return this._model.cropData;
			} else {
				this._model.cropData = value;
				this._update();
				return this._model.cropData;
			}
		},

		// returns the original size of the image being cropped
		imageSize: function(value) {
			if (value === undefined) {
				return {
					width: this._rawImage.width,
					height: this._rawImage.height
				};
			} else {
				throw 'Error: imageSize is read-only';
			}
		},

		// Handle when an option has changed.  Only option that can change is the cropData
		_setOption: function (key, value) {
			this._model[key] = value;
			this._updateHandlePosition();
		},

		// create a handle
		_createHandle: function (config) {
			var handle = new fabric.Circle({
				left: config.x,
				top: config.y,
				fill: this._model.handleColor,
				radius: this._model.handleSize,
				strokeWidth: this._model.lineWidth,
				stroke: this._model.lineColor
			});

			handle.handleId = config.id;
			handle.originX = "center";
			handle.originY = "center";
			handle.hasRotatingPoint = false;
			handle.hasControls = false;
			handle.lockScalingX = true;
			handle.lockScalingY = true;
			handle.lockUniScaling = true;
			handle.lockRotation = true;
			this._model.canvas.add(handle);
			return handle;
		},

		// create a rectangle
		_createOverlayRect: function (config) {
			var r = new fabric.Rect({
				left: config.left,
				top: config.top,
				width: config.width,
				height: config.height,
				fill: config.fill,
				strokeWidth: this._model.lineWidth,
				stroke: this._model.lineColor

			});
			r.handleId = config.id;
			r.hasRotatingPoint = false;
			r.hasControls = false;
			r.lockScalingX = true;
			r.lockScalingY = true;
			r.lockUniScaling = true;
			r.lockRotation = true;
			this._model.canvas.add(r);
			return r;
		},

		// create a line
		_createLine: function (coords) {
			var nl = new fabric.Line(coords, {
				stroke: this._model.gridColor,
				strokeWidth: this._model.gridWidth,
				selectable: false
			});
			this._model.canvas.add(nl);
			return nl;
		},

		// clip function will cut out a transparent rectangle to highlight the areas
		// of the image that are going to be cliped.
		_doAreaClip: function (ctx) {
			var imageX = this._model.image.left;
			var imageY = this._model.image.top;

			var clipWidth = this._model.handles.tr.left - this._model.handles.tl.left;
			var clipHeight = this._model.image.height;

			// draw rects that will highlight the areas that will be cropped
			ctx.beginPath();
			ctx.rect(this._model.handles.tl.left, imageY, clipWidth, this._model.handles.tl.top - imageY);
			ctx.rect(this._model.handles.tl.left, this._model.handles.bl.top, clipWidth, this._model.image.height - (this._model.handles.bl.top - imageY));
			ctx.rect(imageX, imageY, this._model.handles.tl.left - imageX, clipHeight);
			ctx.rect(this._model.handles.tr.left, imageY, this._model.image.width - (this._model.handles.tr.left - imageX), clipHeight);
			ctx.fill();
		},

		// converts the passed x,y into UV space for the image
		_toUV: function (pos) {
			return {
				u: (pos.left - this._model.image.left) / this._model.image.getWidth(),
				v: (pos.top - this._model.image.top) / this._model.image.getHeight()
			};
		},

		// converts the passed u,v into Image space (returns left,top)
		_fromUV: function (pos) {
			return {
				left: (pos.u * this._model.image.getWidth()) + this._model.image.left,
				top: (pos.v * this._model.image.getHeight()) + this._model.image.top
			};
		},

		// move a handle to the new point, in UV space
		_updateHandlePosition: function (handle) {

			// convert the handle position to UV space
			// this will also bound the position to be within the image
			var uv = this._toUV(handle);
			var newPos = {
				u: Math.min(Math.max(uv.u, 0), 1.0),
				v: Math.min(Math.max(uv.v, 0), 1.0)
			};

			// update the bounding points
			var uv1 = { u: this._model.cropData.u, v: this._model.cropData.v };
			var uv2 = { u: this._model.cropData.u + this._model.cropData.width, v: this._model.cropData.v + this._model.cropData.height };
			switch (handle.handleId) {
				case 'tl':
					uv1.u = newPos.u;
					uv1.v = newPos.v;
					break;

				case 'tr':
					uv2.u = newPos.u;
					uv1.v = newPos.v;
					break;

				case 'bl':
					uv1.u = newPos.u;
					uv2.v = newPos.v;
					break;

				case 'br':
					uv2.u = newPos.u;
					uv2.v = newPos.v;
					break;

				case 'rect':
					uv1.u = newPos.u;
					uv1.v = newPos.v;
					uv2.u = uv1.u + this._model.cropData.width;
					uv2.v = uv1.v + this._model.cropData.height;
					break;
			}

			// verify that the new bounding points are legal. If not, then don't use it.
			if (uv2.u - uv1.u < this._model.minCropSizeUV || uv2.u > 1.0) {
				uv1.u = this._model.cropData.u;
				uv2.u = this._model.cropData.u + this._model.cropData.width;
			}

			if (uv2.v - uv1.v < this._model.minCropSizeUV || uv2.v > 1.0) {
				uv1.v = this._model.cropData.v;
				uv2.v = this._model.cropData.v + this._model.cropData.height;
			}

			// new rect is safe, so save it
			this._model.cropData.u = uv1.u;
			this._model.cropData.v = uv1.v;
			this._model.cropData.width = uv2.u - uv1.u;
			this._model.cropData.height = uv2.v - uv1.v;

			this._update();
		},

		// Updates the handles, borders, and grid lines to match current cropData
		_update: function () {

			this._trigger('changed', null, this._model.cropData);	// send event with new crop data

			var uv2 = {
				u: this._model.cropData.u + this._model.cropData.width,
				v: this._model.cropData.v + this._model.cropData.height
			};

			// update all of the handle positions to match the new cropData
			this._model.handles.tl.set(this._fromUV({ u: this._model.cropData.u, v: this._model.cropData.v })).setCoords();
			this._model.handles.tr.set(this._fromUV({ u: uv2.u, v: this._model.cropData.v })).setCoords();
			this._model.handles.bl.set(this._fromUV({ u: this._model.cropData.u, v: uv2.v })).setCoords();
			this._model.handles.br.set(this._fromUV({ u: uv2.u, v: uv2.v })).setCoords();

			var pos = {
				left: this._model.handles.tl.left,
				top: this._model.handles.tl.top,
				width: this._model.handles.br.left - this._model.handles.tl.left,
				height: this._model.handles.br.top - this._model.handles.tl.top
			};
			this._model.handles.area.set(pos).setCoords();

			this._updateGridLines();
			this._showGridLines(true, this._model.gridHideDelay);

			this._model.canvas.renderAll();
		},

		// create the grid lines shown when moving handles
		_updateGridLines: function () {
			var x1 = this._model.handles.tl.left + ((this._model.handles.br.left - this._model.handles.tl.left) / 3);
			var x2 = this._model.handles.tl.left + ((this._model.handles.br.left - this._model.handles.tl.left) * 2 / 3);
			var y1 = this._model.handles.tl.top + ((this._model.handles.br.top - this._model.handles.tl.top) / 3);
			var y2 = this._model.handles.tl.top + ((this._model.handles.br.top - this._model.handles.tl.top) * 2 / 3);

			this._model.handles.h1.set({ 'x1': this._model.handles.tl.left, 'y1': y1, 'x2': this._model.handles.br.left, 'y2': y1 });
			this._model.handles.h2.set({ 'x1': this._model.handles.tl.left, 'y1': y2, 'x2': this._model.handles.br.left, 'y2': y2 });
			this._model.handles.v1.set({ 'x1': x1, 'y1': this._model.handles.tl.top, 'x2': x1, 'y2': this._model.handles.br.top });
			this._model.handles.v2.set({ 'x1': x2, 'y1': this._model.handles.tl.top, 'x2': x2, 'y2': this._model.handles.br.top });
		},

		// show or hide the gridlines. If showing, and timeout > 0, then sets a timer for when to autohide the grid
		_showGridLines: function (isVisible, timeout) {
			this._model.handles.h1.setVisible(isVisible);
			this._model.handles.h2.setVisible(isVisible);
			this._model.handles.v1.setVisible(isVisible);
			this._model.handles.v2.setVisible(isVisible);

			if (this.hideGridlinesTimer) {
				// cancel any existing timer
				window.clearTimeout(this.hideGridlinesTimer);
				this.hideGridlinesTimer = null;
			}
			if (isVisible && timeout > 0) {
				// if we are showing the gridlines, and the timeout > 0, then set a timer
				// to auto-hide lines
				var self = this;
				this.hideGridlinesTimer = setTimeout(function () {
					self._showGridLines(false);
					self.hideGridlinesTimer = null;
					self._model.canvas.renderAll();
				}, timeout);
			}
		},

		// Finish initializing after the image to crop has loaded
		_onImageLoad: function () {

			this._model.image = new fabric.Image(this._rawImage);

			var canvasWidth = this.element.width();
			var canvasHeight = this.element.height();

			var innerCanvasWidth = canvasWidth - this._model.handleSize * 2;
			var innerCanvasHeight = canvasHeight - this._model.handleSize * 4;

			// initialize the canvas object
			var celem = this.element.find('canvas')[0];	// grab the first canvas in the host element
			this._model.canvas = new fabric.Canvas(celem);
			this._model.canvas.setDimensions({ width: canvasWidth, height: canvasHeight });
			this._model.canvas.clear();

			// rescale the image so that is fills the canvas, maintaining aspect
			var aspect = Math.min(innerCanvasWidth / this._model.image.getWidth(), innerCanvasHeight / this._model.image.getHeight());
			var newWidth = aspect * this._model.image.getWidth();
			var newHeight = aspect * this._model.image.getHeight();
			this._model.image.setWidth(newWidth);
			this._model.image.setHeight(newHeight);

			// prevent image from being manipulated
			this._model.image.hasControls = false;
			this._model.image.hasBorders = false;
			this._model.image.lockMovementX = true;
			this._model.image.lockMovementY = true;
			this._model.image.lockScalingX = true;
			this._model.image.lockScalingY = true;
			this._model.image.lockUniScaling = true;
			this._model.image.lockRotation = true;

			this._model.canvas.add(this._model.image);
			this._model.image.center();


			// create the handles
			this._model.handles = {
				tl: this._createHandle({ x: this._model.image.left, y: this._model.image.top, id: 'tl' }),
				bl: this._createHandle({ x: this._model.image.left, y: this._model.image.top + this._model.image.height, id: 'bl' }),
				tr: this._createHandle({ x: this._model.image.left + this._model.image.width, y: this._model.image.top, id: 'tr' }),
				br: this._createHandle({ x: this._model.image.left + this._model.image.width, y: this._model.image.top + this._model.image.height, id: 'br' }),
				area: this._createOverlayRect({ fill: this._model.cropAreaColor, id: 'rect' }),
				h1: this._createLine([0, 0, 0, 0]),
				h2: this._createLine([0, 0, 0, 0]),
				v1: this._createLine([0, 0, 0, 0]),
				v2: this._createLine([0, 0, 0, 0])
			};

			this._showGridLines(false);
			this._updateGridLines();

			var self = this; // need this for callbacks define here

			// create a rect to hide the parts of the image that will be clipped
			this._model.overlay = this._createOverlayRect({ fill: this._model.cropBorderColor });
			this._model.overlay.lockMovementX = true;
			this._model.overlay.lockMovementY = true;
			this._model.overlay.clipTo = function (ctx) {
				// update the clip rectangle
				self._doAreaClip(ctx);
			}

			// make sure everything is layered correctly
			this._model.canvas.sendToBack(this._model.image);
			this._model.canvas.bringToFront(this._model.overlay);
			this._model.canvas.bringToFront(this._model.handles.area);
			this._model.canvas.bringToFront(this._model.handles.h1);
			this._model.canvas.bringToFront(this._model.handles.h2);
			this._model.canvas.bringToFront(this._model.handles.v1);
			this._model.canvas.bringToFront(this._model.handles.v2);
			this._model.canvas.bringToFront(this._model.handles.tl);
			this._model.canvas.bringToFront(this._model.handles.tr);
			this._model.canvas.bringToFront(this._model.handles.bl);
			this._model.canvas.bringToFront(this._model.handles.br);

			this._model.canvas.setActiveObject(this._model.handles.area);

			// handle a handle being handled
			this._model.canvas.on('object:moving', function (evt) {
				var handle = evt.target;
				if (handle.handleId) {
					// only update if it is a handle that is moving
					self._updateHandlePosition(handle);
				}
			});

			this._trigger('ready', null, null);	// send event with new crop data

		},

		// Construct new instance of the cropper plugin
		_create: function () {

			// merge options with our model
			this._model = $.extend(this._model, this.options);

			this._rawImage = new Image();
			this._rawImage.crossOrigin = "Anonymous";
			this._rawImage.src = this._model.imageUrl;
			var self = this;
			this._rawImage.onload = function () {
				self._onImageLoad();
			}
		},

		// Handle any cleanup, like freeing the Fabric instance or anything like that
		_destroy: function () {
			this._model.canvas.dispose();
			this._model.canvas = null;
			delete this._rawImage;
		}



		// end of widget definition
	});

})(jQuery);