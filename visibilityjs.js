/*!
 * Visibility State Controller JS v0.2.1
 * Elements Visibility State
 * by Christian Kaisermann
 */

 /* global jQuery */
 /* global Zepto */
 (function(window, undefined)
 {
 	'use strict';

 	/* -- Visibility State Controller Class -- */
 	
 	var VSController = function()
 	{
 		var self = this;
 		function init()
 		{
 			self._clientTop = document.documentElement.clientTop;
 			self._clientLeft = document.documentElement.clientLeft;
 			self._win = new Rectangle( getPosHorizontalScroll(), getPosVerticalScroll(), window.innerWidth, window.innerHeight);

 			self.bindEvents();
 		}

 		self.bindEvents = function()
 		{
 			window.addEventListener("resize", resizeHandler);
 			window.addEventListener("scroll", scrollHandler);
 		}

 		self.unbindEvents = function() 
 		{
 			window.removeEventListener("resize", resizeHandler);
 			window.removeEventListener("scroll", scrollHandler);
 		}

 		function resizeHandler() { self._win.width = window.innerWidth; self._win.height = window.innerHeight; }
 		function scrollHandler() { self._win.left = getPosHorizontalScroll(); self._win.top = getPosVerticalScroll(); }

 		function getPosHorizontalScroll() { return window.pageXOffset || document.documentElement.scrollLeft || document.body.scrollLeft; }
 		function getPosVerticalScroll() { return window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop; }

 		init();
 	};

 	VSController.prototype.getState = function(element)
 	{
 		var _eType = element.constructor.name || null;

 		var 
 		states = [],
 		elements = [];

 		if(!!window.jQuery  && element instanceof jQuery)
 			elements = jQuery.makeArray(element);
 		else if(_eType==="NodeList")
 			elements = Array.prototype.slice.call(element, 0);
 		else if(Array.isArray(element))
 			elements = element;
 		else if(element.nodeType)
 			elements.push(element);
 		else
 			return null;

 		for(var i = 0; i < elements.length; i++)
 		{
 			var _e = elements[i],
 			_frame = this.getOffsetRect(_e),
 			_intersection = _frame.intersectionWith(this._win);

 			var state = new VisibilityState();

 			if(_intersection)
 			{
 				var 
 				_intersectionArea = _intersection.getArea(),
 				_minWidth = Math.min(_frame.width, this._win.width),
 				_minHeight = Math.min(_frame.height, this._win.height);

 				state.visibilityRate = {
 					both: _intersectionArea / _frame.getArea(),
 					horizontal: _intersection.width / _frame.width,
 					vertical: _intersection.height / _frame.height
 				};

 				state.occupiedViewport = {
 					both: _intersectionArea / this._win.getArea(),
 					horizontal: _intersection.width / this._win.width,
 					vertical: _intersection.height / this._win.height
 				};

 				state.maxVisibility =
 				{
 					both: _intersectionArea / (_minWidth * _minHeight),
 					horizontal: _intersection.width / _minWidth,
 					vertical: _intersection.height / _minHeight	
 				};

 			}
 			if(elements.length===1)
 				return state;
 			states.push(state);
 		}
 		return states;
 	};

 	VSController.prototype.getOffsetRect = function(element) 
 	{
 		var box = element.getBoundingClientRect();
 		var top = box.top + this._win.top - this._clientTop;
 		var left = box.left + this._win.left - this._clientLeft;

 		return new Rectangle(left, top, box.width, box.height);
 	};

 	VSController.prototype.destroy = function() { this.unbindEvents(); }

 	/* -- Visibility State Controller Class -- */

 	/* -- Visibility State Class -- */

 	function VisibilityState ()
 	{
 		this.visibilityRate = {both:0,horizontal:0,vertical:0};
 		this.occupiedViewport = {both:0,horizontal:0,vertical:0};
 		this.maxVisibility = {both:0,horizontal:0,vertical:0};
 	}
 	/* -- Visibility State Class -- */

 	/* -- Rectangle Class -- */

 	function Rectangle(x, y, w, h)
 	{
 		this.left = Math.round(x);
 		this.top = Math.round(y);
 		this.width = Math.round(w);
 		this.height = Math.round(h);
 		this.right = this.left + this.width;
 		this.bottom = this.top + this.height;
 	}

 	Rectangle.prototype.getArea = function() { return this.width * this.height; };
 	Rectangle.prototype.intersectionWith = function(rect)
 	{
 		var 
 		top = Math.max(this.top, rect.top),
 		left = Math.max(this.left, rect.left),
 		right = Math.min(this.right, rect.right),
 		bottom = Math.min(this.bottom, rect.bottom);

 		var
 		width = right - left,
 		height = bottom - top;

 		return (width >= 0 && height >= 0) ? new Rectangle(left, top, width, height) : null;
 	};
 	/* -- Rectangle Class -- */

 	window.VSController = VSController;
 })(window);
