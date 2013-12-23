/*
	Kaleidoscope
	Copyright (C) 2013 Matthias Graf
	matthias.graf <a> eclasca.de
	
	This program is free software: you can redistribute it and/or modify
	it under the terms of the GNU Affero General Public License as published by
	the Free Software Foundation, either version 3 of the License, or
	(at your option) any later version.

	This program is distributed in the hope that it will be useful,
	but WITHOUT ANY WARRANTY; without even the implied warranty of
	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
	GNU Affero General Public License for more details.

	You should have received a copy of the GNU Affero General Public License
	along with this program. If not, see <http://www.gnu.org/licenses/>.
*/

Kaleidoscope = function () {

var self = this

self.thumbnailClick = function (newImgPath) {
	d3.select('#theImage').attr('xlink:href', newImgPath)
	loadCanvasImage(newImgPath, function() {
		updateCanvasAndSVGsize()
		setCutRelWandH()
		updateOnResizeOrImageSwitch()
	})
}

self.viewKalendoscopeImage = function () {
	window.location.href = canvas.toDataURL()
}

self.switchShape = function (tilingArrayIndex) {
	console.assert(tilingArrayIndex >= 0 && tilingArrayIndex < tilings.length)
	currentTiling = tilings[tilingArrayIndex]
	setCutRelWandH()
	updateOnResizeOrImageSwitch()
}

self.addImage = function () {
	var url = prompt("Image URL:", "")
	if (url !== null && url !== undefined) {
		userDefinedImages.push(url)
		addImageToImagesUL(d3.select('#imagesUl'), url, url)
		thumbnailClick(url)
	}
}










function TriangularTiling() {
	var self = this
	var rotations = 3
	var angle = Math.PI/rotations
	// avoids visible borders
	var offset = 1
	var scale = 0.25
	
	self.getRatio = function () { return 1/(Math.sqrt(3)/2) }
	
	self.path = function() {
		var seitenlaenge = imgInSvgWidth*theCutRel.w
		var hoehe = Math.sqrt(3)/2*seitenlaenge
		return "M0,0 L"+seitenlaenge+",0 L"+seitenlaenge/2+","+hoehe+" Z"
	}
	
	self.draw = function() {
		var a = getCutWidthForCanvas(scale)
		var hoehe = Math.sqrt(3)/2*a
		context.save()
		for (var j=0; j<rotations; j++) { // rotate
			context.rotate(2*angle)
			for (var i=0; i<2; i++) { // mirror
				for (var k=0; k<4; k++) { // copy
					context.save()
					context.scale(1, Math.pow(-1, i))
					switch (k) {
					case 1: context.translate(-(a*3/2), -hoehe); break
					case 2: context.translate(-(a*3/2), hoehe); break
					case 3: context.translate(0, -hoehe*2); break
					case 4: context.translate(0, hoehe*2); break
					case 5: context.translate(a*3/2, -hoehe); break
					case 6: context.translate(a*3/2, hoehe); break
					}
					context.beginPath()
					context.moveTo(-offset, -offset)
					context.lineTo(a+offset, -offset)
					context.lineTo(a/2, hoehe+offset)
					context.closePath()
					context.clip()
					drawImageToCanvas(scale)
					context.restore()
				}
			}
		}
		context.restore()
	}
}

function TetrakisSquareTiling() {
	var self = this
	var rotations = 4
	var angle = Math.PI/rotations
	var offset = 1
	var scale = 0.25
	
	self.getRatio = function () { return 1 }
	
	self.path = function() {
		var a = imgInSvgWidth*theCutRel.w
		return "M0,0 L"+a+",0 L"+a+","+a+" Z"
	}
	
	self.draw = function() {
		var a = getCutWidthForCanvas(scale)
		context.save()
		for (var j=0; j<rotations; j++) {
			context.rotate(2*angle)
			for (var i=0; i<2;i++) {
				for (var k=0; k<=1; k++) {
					context.save()
					context.scale(1, Math.pow(-1, i))
					switch (k) {
					case 1: context.translate(-a*2+offset, 0); break
					case 2: context.translate(0, -a*2+offset); break
					case 3: context.translate(-2*a+offset, -2*a+offset); break
					case 4: context.translate(-2*a+offset, -2*a+offset); break
					}
					context.beginPath()
					context.moveTo(-offset*2,-offset)
					context.lineTo(a+offset,-offset)
					context.lineTo(a+offset,a+offset*2)
					context.closePath()
					context.clip()
					
					drawImageToCanvas(scale)
					context.restore()
				}
			}
		}
		context.restore()
	}
}

function SquareTiling() {
	var self = this
	var copies = 2 // 1 or 2
	
	var rotations = 2
	var angle = Math.PI/rotations
	var offset = 1
	// further shrink because of area balance towards other tilings
	// (which are not canvas-area maximising)
	var scale = 0.25*0.8
	
	self.getRatio = function () { return 1 }
	
	self.path = function() {
		var a = imgInSvgWidth*theCutRel.w
		return "M0,0 L"+a+",0 L"+a+","+a+" L"+0+","+a+" Z"
	}
	
	self.draw = function() {
		var a = getCutWidthForCanvas(scale)
		context.save()
		for (var j=0; j<rotations; j++) {
			context.rotate(2*angle)
			for (var i=0; i<2;i++) {
				for (var k=0; k<=2*copies; k++) {
					context.save()
					context.scale(1, Math.pow(-1, i))
					switch (k) {
					case 1: context.translate(-a*2+offset, 0); break
					case 2: context.translate(0, -a*2+offset); break
					case 3: context.translate(-2*a+offset, -2*a+offset); break
					case 4: context.translate(-2*a+offset, -2*a+offset); break
					}
					context.beginPath()
					context.moveTo(0,0)
					context.rect(-offset/2, -offset/2, a+offset, a+offset)
					context.closePath()
					context.clip()
					drawImageToCanvas(scale)
					context.restore()
				}
			}
		}
		context.restore()
	}
}

function KisrhombilleTiling(copies) {
	var self = this
	
	// avoids visible borders
	var rotations = 6
	var angle = Math.PI/rotations
	var offset = 1
	
	var scale = 1
	switch (copies) {
	case 0: scale = 1.43*0.3; break
	case 1: scale = 0.83*0.3; break
	case 2: scale = 0.83*0.3; break
	case 3: scale = 0.71*0.3; break
	case 4: scale = 0.63*0.3; break
	case 5: scale = 0.55*0.3; break
	case 6: scale = 0.55*0.3; break
	default: console.assert(false, "KisrhombilleTiling(copies) illegal argument")
	}
	
	self.getRatio = function () { return Math.sqrt(3) }
	
	self.path = function() {
		var hoehe = imgInSvgWidth*theCutRel.w
		var hypotenuse = hoehe/(Math.sqrt(3)/2)
		return "M0,0 L"+hoehe+",0 L"+hoehe+","+hypotenuse/2+" Z"
	}
	
	self.draw = function() {
		var hoehe = getCutWidthForCanvas(scale)
		var hypotenuse = hoehe/(Math.sqrt(3)/2)
		context.save()
		for (var j=0; j<rotations; j++) { // rotate
			context.rotate(2*angle)
			for (var i=0; i<2; i++) { // mirror
				for (var k=0; k<=copies; k++) { // copy
					context.save()
					context.scale(1, Math.pow(-1, i))
					switch (k) { // case 0: just central hexagon
					case 1: context.translate(-hoehe*2+offset, 0); break // star
					case 2: context.translate(-hoehe+offset/2, -hypotenuse*3/2+offset); break // hexagon
					case 3: context.translate(-hoehe+offset, hypotenuse*3/2-offset); break // bigger hexagon
					case 4: context.translate(hoehe-offset, -hypotenuse*3/2+offset); break // interesting
					case 5: context.translate(hoehe-offset, +hypotenuse*3/2-offset); break // interesting spikier
					case 6: context.translate(hoehe*2-offset, 0); break // 6 hexagons around center one
					}
					context.beginPath()
					context.moveTo(0, 0)
					context.lineTo(hoehe+offset, -offset/2)
					context.lineTo(hoehe+offset, hypotenuse/2+offset)
					context.closePath()
					context.clip()
					
					drawImageToCanvas(scale)
					context.restore()
				}
			}
		}
		context.restore()
	}
}

function PieTiling(numberOfPies) {
	var self = this
	var pieAngle = Math.PI/numberOfPies
	var offset = 0.004
	var rotations = Math.PI/pieAngle
	var scale = 0.5
	
	self.getRatio = function () { return 1/Math.sin(pieAngle) }
	
	self.path = function() {
		var outerRadius = imgInSvgWidth*theCutRel.w
		var pieStartAngle = Math.PI/2 // 90°
		var arcObj = {
			innerRadius: 0,
			outerRadius: outerRadius,
			startAngle: pieStartAngle,
			endAngle: pieStartAngle+pieAngle
		}
		return (d3.svg.arc())(arcObj)
	}
	
	self.draw = function() {
		var outerRadius = getCutWidthForCanvas(scale)
		context.save()
		for (var j=0; j<rotations; j++) {
			context.rotate(2*pieAngle)
			for (var i=0; i<2;i++) {
				context.save()
				context.scale(1,Math.pow(-1, i))
				context.beginPath()
				context.moveTo(0, 0)
				context.arc(0, 0, outerRadius, -offset, pieAngle+offset)
				context.closePath()
				context.clip()
				drawImageToCanvas(scale)
				context.restore()
			}
		}
		context.restore()
	}
}

function TestTiling() {
	var self = this
	var scale = 0.5
	
	self.getRatio = function () { return testTilingRatio }
	self.path = function() {
		var a = imgInSvgWidth*theCutRel.w
		return "M0,0 L"+a+",0 L"+a+","+a/testTilingRatio+" Z"
	}
	
	self.draw = function() {
		var a = getCutWidthForCanvas(scale)
		context.save()
		context.beginPath()
		context.moveTo(0, 0)
		context.lineTo(a, 0)
		context.lineTo(a, a/testTilingRatio)
		context.closePath()
		context.clip()
		
		drawImageToCanvas(scale)
		context.restore()
	}
}






















function correctForShapeToImageRatio() {
	var scale = 1
	// this has been well thought through, so dont mess with it!
	if (currentTiling.getRatio() < imageObj.width/imageObj.height) {
		console.assert(theCutRel.w < theCutRel.h)
		if (currentTiling.getRatio() >= 1) {
			scale = theCutRel.h/theCutRel.w
		} else {
			scale = imageObj.width/imageObj.height
		}
	} else {
		// this does not always seem to hold (page startup issue?)
		// console.assert(theCutRel.w >= theCutRel.h)
		if (currentTiling.getRatio() >= 1) {
			// nada
		} else {
			scale = (theCutRel.w*imageObj.width)/(theCutRel.h*imageObj.height)
		}
	}
	return scale
}

function getCutWidthForCanvas(scale) {
	return canvas.width*theCutRel.w/shapeScaleInSrcImg*scale*correctForShapeToImageRatio()
}

function drawImageToCanvas(scale) {
	// go a bit beyond the shape path mask
	var offset = 0.4
	console.assert(canvas.width === canvas.height)
	// this has been well thought through, so dont mess with it!
	var totalScaling = canvas.width/imageObj.width/shapeScaleInSrcImg*scale*correctForShapeToImageRatio()
	
	var shapeW = imageObj.width * theCutRel.w
	var shapeH = imageObj.height * theCutRel.h
	
	// this image is masked by the shape!
	// http://www.whatwg.org/specs/web-apps/current-work/multipage/the-canvas-element.html#dom-context-2d-drawimage
	// sometimes this throughs a NS_ERROR_NOT_AVAILABLE in firefox. dont know why
//	try {
		context.drawImage(imageObj,
			/* x src */ imageObj.width * theCutRel.x,
			/* y src */ imageObj.height * theCutRel.y,
			/* w src */ shapeW,
			/* h src */ shapeH,
			/* --->  */
			/* x dst */ -offset,
			/* y dst */ -offset,
			/* w dst */ shapeW * totalScaling + offset,
			/* h dst */ shapeH * totalScaling + offset
		)
//	} catch(err) {
//		console.log(err)
//	}

}

function writeImagesToHTML() {
	var imagesUl = d3.select('#imagesUl')
	for (var i=0; i<images.length; i++) {
		addImageToImagesUL(imagesUl,
			imgDir+"/"+images[i],
			imgDir+"/"+images[i].replace(".jpg", "_xy420.jpg"))
	}
	imagesUl
		.append("li")
		.attr("onclick", "addImage()")
		.attr("title", "Add Image")
		.append("span")
		.attr("class", "symbol").text("p")
}

function addImageToImagesUL(imagesUl, url, thumbnailUrl) {
	imagesUl
		.append("li")
		.attr("onclick", "thumbnailClick('"+url+"')")
		.attr("class", "imgSel")
		.append("span") // fakeContent is the spacer
		.attr("class", "fakeContent")
		.text("p")
		.attr("style", "background: transparent url('"+thumbnailUrl+"') no-repeat center; background-size: 70%")
}

function loadCanvasImage(imgPath, callback) {
	imageObj.onload = function() {
		if (callback !== undefined)
			callback()

	}
	imageObj.src = imgPath
}

function constrainTheCutAndUpdateSVGpathTranslation() {
	theCutRel.w = Math.max(0.01, theCutRel.w)
	theCutRel.h = Math.max(0.01, theCutRel.h)
	theCutRel.w = Math.min(1, theCutRel.w)
	theCutRel.h = Math.min(1, theCutRel.h)
	
	theCutRel.x = Math.max(0, theCutRel.x)
	theCutRel.y = Math.max(0, theCutRel.y)
	theCutRel.x = Math.min(1-theCutRel.w, theCutRel.x)
	theCutRel.y = Math.min(1-theCutRel.h, theCutRel.y)
	
	var tr = "translate(" + (theCutRel.x*imgInSvgWidth)
			+ "," + (theCutRel.y*imgInSvgHeight) + ")"
	
	d3.select('#theClipPath').attr("transform", tr)
	d3.select('#refGroup').attr("transform", tr)
}

function updateOnResizeOrImageSwitch() {
	constrainTheCutAndUpdateSVGpathTranslation()
	d3.select("#arcPath").attr('d', currentTiling.path)
	d3.select("#theClipPathPath").attr('d', currentTiling.path)
	clearCanvas()
	drawCurrent()
}

function clearCanvas() {
	context.clearRect(-canvas.width/2, -canvas.height/2, canvas.width, canvas.height)
}

function setCutRelWandH() {
//	console.log("img ratio: "+imgInSvgWidth/imgInSvgHeight)
	if (imgInSvgWidth/imgInSvgHeight < currentTiling.getRatio()) {
		theCutRel.w = shapeScaleInSrcImg
		theCutRel.h = shapeScaleInSrcImg/currentTiling.getRatio()*imgInSvgWidth/imgInSvgHeight
	} else {
		theCutRel.h = shapeScaleInSrcImg
		theCutRel.w = shapeScaleInSrcImg*currentTiling.getRatio()*imgInSvgHeight/imgInSvgWidth
	}
}

function updateCanvasAndSVGsize() {
	var winW = document.body.clientWidth
	var winH = window.innerHeight
	
	console.assert(winW > 0 && winH > 0)
	var canvasSize = Math.round((winW < winH ? winW : winH) * 0.85)
	canvas.setAttribute("height", canvasSize+"px")
	canvas.setAttribute("width", canvasSize+"px")
	console.assert(canvasSize === canvas.width && canvasSize === canvas.height)
	// center (0,0) in canvas !
	context.translate(canvasSize/2, canvasSize/2)
	
	var svgdiv = document.getElementById('svgdiv')
	console.assert(imageObj.width > 0 && imageObj.height > 0)
	var imageRatio = imageObj.width/imageObj.height
	var maxR = 0.5
	var s = 0.8
	
	d3.select("#title").attr("style", "font-size: "+canvasSize*0.6+"% !important;")
	d3.selectAll(".symbol").style({"font-size": canvasSize*0.9+"%"})
	d3.selectAll(".fakeContent").style({"font-size": canvasSize*0.9+"%"})
	
	if (winW < winH) {
		imgInSvgHeight = Math.round((winH - canvasSize)/2 * s)
		imgInSvgWidth = Math.round(imgInSvgHeight * imageRatio)
		
		if (imgInSvgWidth > winW * maxR) {
			imgInSvgWidth = Math.min(Math.round(winW * maxR), imgInSvgWidth)
			imgInSvgHeight = Math.round(imgInSvgWidth / imageRatio)
		}
	} else {
		imgInSvgWidth = Math.round((winW - canvasSize)/2 * s)
		imgInSvgHeight = Math.round(imgInSvgWidth / imageRatio)
		
		if (imgInSvgHeight > winH * maxR) {
			imgInSvgHeight = Math.min(Math.round(winH * maxR), imgInSvgHeight)
			imgInSvgWidth = Math.round(imgInSvgHeight * imageRatio)
		}
	}
	
	svgdiv.setAttribute("style", "width: "+imgInSvgWidth+"px; height: "+imgInSvgHeight+"px;")
	document.getElementById("slider1").setAttribute("style", "width: "+(imgInSvgWidth-2)+"px")
	// shape slider internal one
	shapeScaleSlider.setWidth(imgInSvgWidth)
}

function dragMove(dx, dy) {
	if (!draggedOnce) {
		d3.select("#startupHelp").attr("style", "opacity: 0;")
		draggedOnce = true
	}

	theCutRel.x += dx/imgInSvgWidth
	theCutRel.y += dy/imgInSvgHeight

	constrainTheCutAndUpdateSVGpathTranslation()

	clearCanvas()
	drawCurrent()
}

function runAfterImageFinishedLoading() {
	var svg = d3.select('#svgdiv')
		.append('svg')
		.attr('width', "100%")
		.attr('height', "100%")
		.attr('id', 'imageSVG')

	var defsTag = svg.append('defs')

	svg.append('g')
		.attr('opacity', .4)
		.append('svg:image')
		.attr('id', 'theImage')
		.attr('x', 0)
		.attr('y', 0)
		.attr('width', "100%")
		.attr('height', "100%")
		.attr('xlink:href', imageObj.src)

	shapeScaleSlider = d3.slider()
		.min(0.1)
		.max(1)
		.step(0.01)
		.value(shapeScaleInSrcImg)
		.on("slide", function(evt, value) {
			shapeScaleInSrcImg = value
			setCutRelWandH()
			updateOnResizeOrImageSwitch()
		})
	d3.select('#slider1').call(shapeScaleSlider)

	writeImagesToHTML()
	updateCanvasAndSVGsize()
	setCutRelWandH()
	theCutRel.x = (1-theCutRel.w)/2
	theCutRel.y = (1-theCutRel.h)/2

	var pathTag = defsTag.append('path')
		.attr('id', 'arcPath')
		.attr('class', 'geom')
		.attr('d', currentTiling.path)

	var clipTag = defsTag.append('clipPath')
		.attr('id', 'theClipPath')

	clipTag.append('path')
		.attr('id', 'theClipPathPath')
		.attr('class', 'geom')
		.attr('d', currentTiling.path)

	svg.append('g')
		.attr('id', 'refGroup')
		.append('svg:use')
		.attr('xlink:href', '#arcPath')
		.attr('class', 'geom')


	var drag = d3.behavior.drag()
		.on("drag", function() {
			dragMove(d3.event.dx, d3.event.dy)
		})

	var elementsToHideCursorOnDuringDrag = "#kaleidoCanvas, #canvasFrame, #startupHelp, #svgdiv, #title"
	
	var dragForCanvas = d3.behavior.drag()
		.on("drag", function (d) {
			var canvasToImageScaleFactor = canvas.width/Math.max(imgInSvgWidth, imgInSvgHeight)
			dragMove(
				d3.event.dx/canvasToImageScaleFactor/2,
				d3.event.dy/canvasToImageScaleFactor/2
			)
		})
		.on("dragstart", function() {
			d3.selectAll(elementsToHideCursorOnDuringDrag).attr("class", "hideCursor")
		})
		.on("dragend", function() {
			d3.selectAll(elementsToHideCursorOnDuringDrag).attr("class", "") // remove
		})

	d3.select('#kaleidoCanvas').call(dragForCanvas)

	svg.append('svg:use')
		.attr('xlink:href', '#theImage')
		.attr('id', 'svgUseShape')
		.attr('opacity', 1)
		.attr('clip-path', 'url(#theClipPath)')
		.call(drag)

	constrainTheCutAndUpdateSVGpathTranslation()
//	console.log(theCutRel)
	clearCanvas()
	drawCurrent()

	d3.select("#startupHelp").attr("style", "opacity: 1;")

	if (false) {
		var slider2 = d3.slider()
			.min(0.1)
			.max(2)
			.step(0.1)
			.value(testTilingRatio)
			.on("slide", function(evt, value) {
				testTilingRatio = value
				setCutRelWandH()
				updateOnResizeOrImageSwitch()
			})
		d3.select('#slider2').call(slider2)
	}
	
}

function drawCurrent() {
	try {
		currentTiling.draw()
	} catch(err) {
		if (err.name === "NS_ERROR_NOT_AVAILABLE") {
			console.log(err)
			// I suspect that the svg has to be loaded beforehand. strange.
			// retry after some time
			window.setTimeout(function () {
				console.log("redrawing ...")
				updateCanvasAndSVGsize()
				setCutRelWandH()
				updateOnResizeOrImageSwitch()
			}, 300)
		} else {
			throw err
		}
	}
}













// MAIN

var imgInSvgWidth
var imgInSvgHeight
// the position and size (bounding box) of the shape inside the image, in relative units (% - [0,1])
var theCutRel = {}
// maximum relative width and height of the shape inside the image
var shapeScaleInSrcImg = 0.4
var canvas = document.getElementById('kaleidoCanvas')
var context = canvas.getContext('2d')
var imageObj = new Image()
var userDefinedImages = []
var testTilingRatio = 0.5
var shapeScaleSlider
var draggedOnce = false
var imgDir = "data"

var images = [
	// http://commons.wikimedia.org/wiki/File:D%C3%B4me_du_Go%C3%BBter_depuis_la_gare_des_glaciers.jpg
	"Mont_Blanc_depuis_la_gare_des_glaciers_1x1.jpg",
	// http://en.wikipedia.org/wiki/File:Apophysis-100303-104.jpg
	"Apophysis-100303-104_1x1.jpg",
	// http://commons.wikimedia.org/wiki/File:New_York_City_at_night_HDR.jpg
	"New_York_City_at_night_HDR_1x1.jpg",
	// my own
	"25156_1x1.jpg",
	"01812-031_1x1.jpg",
	// https://github.com/nstahl/kaleidoscope
	"ice_1x1.jpg"]
var defaultImage = 0

// http://en.wikipedia.org/wiki/List_of_uniform_tilings
// http://en.wikipedia.org/wiki/Uniform_tiling#Uniform_tilings_of_the_Euclidean_plane
// tilings define a shape (also called "cut") and how it is repeatedly drawn to create the kaleidoscope
var tilings = [
	/*0*/ new TriangularTiling(),
	/*1*/ new TetrakisSquareTiling(),
	/*2*/ new SquareTiling(),
	/*3*/ new KisrhombilleTiling(1),
	/*4*/ new PieTiling(8),
	/*5*/ new TestTiling()]

var currentTiling = tilings[3]

window.onresize = function(event) {
	updateCanvasAndSVGsize()
	updateOnResizeOrImageSwitch()
}

loadCanvasImage(imgDir+"/"+images[defaultImage], runAfterImageFinishedLoading)

}()
