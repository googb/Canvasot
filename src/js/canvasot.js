// import '@babel/polyfill'; webpack自动会引入

import html2canvas from 'html2canvas';

('use strict');

class Canvasot {
	constructor(el) {
		this.el = el;
		// 截图框
		this.oRelDiv = document.createElement('div');
		// 移动位置参数
		this.params = {
			left: 0,
			top: 0,
			width: 0,
			height: 0,
			oldDifX: 0,
			oldDifY: 0,
			currentX: 0,
			currentY: 0,
			flag: false,
			kind: 'drag',
		};
		// 截图框位置和初始大小
		this.capture = Canvasot.initCapture;
	}

	static get initCapture() {
		return (() => {
			return { x: 0, y: 0, width: 100, height: 100 };
		})();
	}

	// 获取指定元素DOM
	ID(id) {
		return document.getElementById(id);
	}

	getCss(o, key) {
		return o.currentStyle
			? o.currentStyle[key]
			: document.defaultView.getComputedStyle(o, false)[key];
	}

	handleCaptrue(callback) {
		this.comfirnCb = callback || null;
		const self = this;
		const { clientHeight: elHeight, clientWidth: elWidth } = this.el;
		let clickFlag = false;
		// 可调整截图框
		this.oRelDiv.innerHTML = '';
		this.oRelDiv.style.position = 'absolute';
		this.oRelDiv.style.width = elWidth + 'px'; // 换成获取容器的宽度
		this.oRelDiv.style.height = elHeight + 'px'; // 换成获取容器的高度
		// this.oRelDiv.style.top = this.el.offsetTop + 'px';
		this.oRelDiv.style.overflow = 'hidden';
		this.oRelDiv.style.zIndex = '9999999';
		this.oRelDiv.id = 'cropContainer';
		this.elOverflow = self.getCss(this.el.parentElement, 'overflow');
		this.el.parentElement.style.overflow = 'hidden';
		this.oRelDiv.style.top = this.el.offsetTop + 'px';
		this.oRelDiv.style.left = this.el.offsetLeft + 'px';
		this.el.parentElement.insertBefore(this.oRelDiv, this.el);

		//初始化坐标与剪裁高宽
		var cropW = Canvasot.initCapture.width; //截图框默认宽度
		var cropH = Canvasot.initCapture.height; //截图框默认高度
		var posX = elWidth / 2 - cropW / 2; // 截图框左上角x坐标
		var posY = elHeight / 2 - cropH / 2; // 截图框左上角y坐标

		this.oRelDiv.innerHTML =
			'<div id="zxxCropBox" style="height:' +
			cropH +
			'px; width:' +
			cropW +
			'px; position:absolute; left:' +
			posX +
			'px' +
			'px; border:1px solid white;box-shadow:rgba(59, 59, 59, 0.7) 0px 0px 0px 2018px;">' +
			'<div id="zxxDragBg" style="height:100%; background:transparent; opacity:0.3; filter:alpha(opacity=30); cursor:move"></div>' +
			'<div id="dragLeftTop" style="border-radius:50%;position:absolute; width:4px; height:4px; border:1px solid #000; background:white; overflow:hidden; left:-3px; top:-3px; cursor:nw-resize;"></div>' +
			'<div id="dragLeftBot" style="border-radius:50%;position:absolute; width:4px; height:4px; border:1px solid #000; background:white; overflow:hidden; left:-3px; bottom:-3px; cursor:sw-resize;"></div>' +
			'<div id="dragRightTop" style="border-radius:50%;position:absolute; width:4px; height:4px; border:1px solid #000; background:white; overflow:hidden; right:-3px; top:-3px; cursor:ne-resize;"></div>' +
			'<div id="dragRightBot" style="border-radius:50%;position:absolute; width:4px; height:4px; border:1px solid #000; background:white; overflow:hidden; right:-3px; bottom:-3px; cursor:se-resize;"></div>' +
			'<div id="dragTopCenter" style="border-radius:50%;position:absolute; width:4px; height:4px; border:1px solid #000; background:white; overflow:hidden; top:-3px; left:50%; margin-left:-3px; cursor:n-resize;"></div>' +
			'<div id="dragBotCenter" style="border-radius:50%;position:absolute; width:4px; height:4px; border:1px solid #000; background:white; overflow:hidden; bottom:-3px; left:50%; margin-left:-3px; cursor:s-resize;"></div>' +
			'<div id="dragRightCenter" style="border-radius:50%;position:absolute; width:4px; height:4px; border:1px solid #000; background:white; overflow:hidden; right:-3px; top:50%; margin-top:-3px; cursor:e-resize;"></div> ' +
			'<div id="dragLeftCenter" style="border-radius:50%;position:absolute; width:4px; height:4px; border:1px solid #000; background:white; overflow:hidden; left:-3px; top:50%; margin-top:-3px; cursor:w-resize;"></div>' +
			'</div>';

		const btnGrounp =
			'<div id="captureTool" style="min-width:150px;width:100%;text-align:center;position:absolute;z-index:999;top: 10px;left: 50%;transform: translate3d(-50%, 0,0);">' +
			'<button  id ="cancelCapture" style="border:none;padding:1px 4px;">取消</button>' +
			'<button id="captureAll" style="margin: 0 20px;border:none;padding:1px 4px;">截全部</button>' +
			'<button id="capture" style="border:none;padding:1px 4px;">截图</button>' +
			'</div>';
		let wrapper = document.createElement('div');
		wrapper.innerHTML = btnGrounp;
		document.body.appendChild(wrapper);
		// 确认截图
		document
			.getElementById('capture')
			.addEventListener('click', this._captureFn.bind(self));

		// 取消截图
		document
			.getElementById('cancelCapture')
			.addEventListener('click', this._cancelCaptureFn.bind(self));

		// 截全部
		document
			.getElementById('captureAll')
			.addEventListener('click', this._captureAll.bind(self));

		const startDrag = function (point, target, kind) {
			//point是拉伸点，target是被拉伸的目标，其高度及位置会发生改变
			//此处的target与上面拖拽的target是同一目标，故其this.params.left,this.params.top可以共用，也必须共用
			//初始化宽高
			self.params.width = self.getCss(target, 'width');
			self.params.height = self.getCss(target, 'height');
			//初始化坐标
			if (self.getCss(target, 'left') !== 'auto') {
				self.params.left = self.getCss(target, 'left');
			}
			if (self.getCss(target, 'top') !== 'auto') {
				self.params.top = self.getCss(target, 'top');
			}

			const { clientHeight: h, clientWidth: w } = self.el;

			//target是移动对象
			point.onmousedown = function (e) {
				self.params.kind = kind;
				self.params.flag = true;
				clickFlag = true;
				e = e || window.event;
				self.params.currentX = e.clientX; //鼠标按下时坐标x轴
				self.params.currentY = e.clientY; //鼠标按下时坐标y轴

				//防止IE文字选中，有助于拖拽平滑
				point.onselectstart = function () {
					return false;
				};

				document.onmousemove = function (event) {
					let e = event || window.event;
					clickFlag = false;
					if (self.params.flag) {
						var nowX = e.clientX; // 鼠标移动时x坐标
						var nowY = e.clientY; // 鼠标移动时y坐标
						var disX = nowX - self.params.currentX; // 鼠标x方向移动距离
						var disY = nowY - self.params.currentY; // 鼠标y方向移动距离

						switch (self.params.kind) {
							case 'n':
								//上拉伸
								//高度增加或减小，位置上下移动
								target.style.top = parseInt(self.params.top) + disY + 'px';
								target.style.height =
									parseInt(self.params.height) - disY + 'px';
								break;
							case 'w':
								//左拉伸
								target.style.left = parseInt(self.params.left) + disX + 'px';
								target.style.width = parseInt(self.params.width) - disX + 'px';
								break;
							case 'e':
								//右拉伸
								target.style.width = parseInt(self.params.width) + disX + 'px';
								break;
							case 's':
								//下拉伸
								target.style.height =
									parseInt(self.params.height) + disY + 'px';
								break;
							case 'nw':
								//左上拉伸
								target.style.left = parseInt(self.params.left) + disX + 'px';
								target.style.width = parseInt(self.params.width) - disX + 'px';
								target.style.top = parseInt(self.params.top) + disY + 'px';
								target.style.height =
									parseInt(self.params.height) - disY + 'px';
								break;
							case 'ne':
								//右上拉伸
								target.style.top = parseInt(self.params.top) + disY + 'px';
								target.style.height =
									parseInt(self.params.height) - disY + 'px';
								target.style.width = parseInt(self.params.width) + disX + 'px';
								break;
							case 'sw':
								//左下拉伸
								target.style.left = parseInt(self.params.left) + disX + 'px';
								target.style.width = parseInt(self.params.width) - disX + 'px';
								target.style.height =
									parseInt(self.params.height) + disY + 'px';
								break;
							case 'se':
								//右下拉伸
								target.style.width = parseInt(self.params.width) + disX + 'px';
								target.style.height =
									parseInt(self.params.height) + disY + 'px';
								break;
							default:
								//移动
								target.style.left = parseInt(self.params.left) + disX + 'px';
								target.style.top = parseInt(self.params.top) + disY + 'px';
								if (parseInt(self.getCss(target, 'left')) <= 0) {
									target.style.left = 0 + 'px';
								}
								if (parseInt(self.getCss(target, 'top')) <= 0) {
									target.style.top = 0 + 'px';
								}
								if (
									parseInt(self.getCss(target, 'left')) >=
									w - self.capture.width
								) {
									target.style.left = w - self.capture.width - 2 + 'px';
								}
								if (
									parseInt(self.getCss(target, 'top')) >=
									h - self.capture.height
								) {
									target.style.top = h - self.capture.height - 2 + 'px';
								}
						}
					}
				};

				document.onmouseup = function () {
					self.params.flag = false;
					if (self.getCss(target, 'left') !== 'auto') {
						self.params.left = self.getCss(target, 'left');
					}
					if (self.getCss(target, 'top') !== 'auto') {
						self.params.top = self.getCss(target, 'top');
					}
					self.params.width = self.getCss(target, 'width');
					self.params.height = self.getCss(target, 'height');

					// 更新位置
					posX = parseInt(target.style.left);
					posY = parseInt(target.style.top);
					cropW = parseInt(target.style.width);
					cropH = parseInt(target.style.height);
					if (posX < 0) {
						posX = 0;
					}
					if (posY < 0) {
						posY = 0;
					}
					if (posX + cropW > elWidth) {
						cropW = elWidth - posX;
					}
					if (posY + cropH > elHeight) {
						cropH = elHeight - posY;
					}
					// //赋值
					self.capture.x = posX;
					self.capture.y = posY;
					self.capture.width =
						self.ID('zxxCropBox') &&
						parseInt(self.ID('zxxCropBox').style.width);
					self.capture.height =
						self.ID('zxxCropBox') &&
						parseInt(self.ID('zxxCropBox').style.height);
				};
			};
			// };
		};

		//绑定拖拽
		startDrag(this.ID('zxxDragBg'), this.ID('zxxCropBox'), 'drag');
		//绑定拉伸
		startDrag(this.ID('dragLeftTop'), this.ID('zxxCropBox'), 'nw');
		startDrag(this.ID('dragLeftBot'), this.ID('zxxCropBox'), 'sw');
		startDrag(this.ID('dragRightTop'), this.ID('zxxCropBox'), 'ne');
		startDrag(this.ID('dragRightBot'), this.ID('zxxCropBox'), 'se');
		startDrag(this.ID('dragTopCenter'), this.ID('zxxCropBox'), 'n');
		startDrag(this.ID('dragBotCenter'), this.ID('zxxCropBox'), 's');
		startDrag(this.ID('dragRightCenter'), this.ID('zxxCropBox'), 'e');
		startDrag(this.ID('dragLeftCenter'), this.ID('zxxCropBox'), 'w');
	}

	// 截全屏
	_captureAll() {
		this._captureFn({ captureAll: true });
	}
	// 截屏处理
	_captureFn({ captureAll } = { captureAll: false }) {
		this.comfirnCb && this.comfirnCb();
		const self = this;
		if (captureAll) {
			html2canvas(self.el).then(canvas => {
				const data = canvas.toDataURL('image/png');
				if (self.afterCapture) {
					self.afterCapture(data);
				} else {
					self._saveFile(data, 'capture' + new Date().getTime() + '.png');
				}
			});
		} else {
			const { clientHeight, clientWidth } = this.el;
			// console.log('正在截图......');

			let { x, y, width, height } = this.capture;

			// console.log(
			// 	`cropImage(img,x: ${x}, y: ${y}, width: ${width}, heigth: ${height}`
			// );
			// 先拿到整个范围的截图，然后再进行截图
			html2canvas(this.el)
				.then(canvas => {
					let data;
					try {
						data = canvas.toDataURL('image/png');
					} catch (error) {
						if (!self.afterCapture) {
							throw new Error(error.message);
						}
						self.afterCapture(error.message);
					}

					const scaleHeight = canvas.height / clientHeight;
					const scaleWidth = canvas.width / clientWidth;

					x *= scaleWidth;
					y *= scaleHeight;
					width *= scaleWidth;
					height *= scaleHeight;

					let img = new Image();
					img.height = clientHeight;
					img.width = clientWidth;
					img.src = data;

					img.onload = function () {
						// document.body.appendChild(img);
						const data = self._cropImage(img, x, y, width, height);
						if (!self.afterCapture) {
							self._saveFile(data, 'capture' + new Date().getTime() + '.png');
						} else {
							self.afterCapture(null, data);
							self._cancelCaptureFn();
						}
					};
				})
				.catch(err => {
					if (!self.afterCapture) {
						throw new Error(err.message);
					}
					self.afterCapture(err.message);
				});
		}
	}
	// 取消截图
	_cancelCaptureFn() {
		this.capture = {
			x: 0,
			y: 0,
			width: 100,
			height: 100,
		};
		this.oRelDiv.remove();
		document.getElementById('captureTool').remove();
		this.el.parentElement.style.overflow = this.elOverflow;
	}
	_cropImage(img, cropPosX, cropPosY, width, height) {
		let newCanvas = document.createElement('canvas');
		newCanvas.width = width;
		newCanvas.height = height;
		var newCtx = newCanvas.getContext('2d');

		// canvas转化为图片
		newCtx.drawImage(
			img,
			cropPosX,
			cropPosY,
			width,
			height,
			0,
			0,
			width,
			height
		);
		let imgData = newCanvas.toDataURL('image/png');

		return imgData;
	}

	// 保存为照片，存储在本地
	_saveFile(data, filename) {
		var save_link = document.createElementNS(
			'http://www.w3.org/1999/xhtml',
			'a'
		);
		save_link.href = data;
		save_link.download = filename;
		var event = document.createEvent('MouseEvents');
		event.initMouseEvent(
			'click',
			true,
			false,
			window,
			0,
			0,
			0,
			0,
			0,
			false,
			false,
			false,
			false,
			0,
			null
		);
		save_link.dispatchEvent(event);
		this._cancelCaptureFn();
	}

	RegisterAfterCapture(fn) {
		this.afterCapture = fn;
	}
}

export default Canvasot;
