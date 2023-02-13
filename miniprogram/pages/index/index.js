// index.js
// const app = getApp()

const { envList } = require('../../envList.js');
var util = require('../../utils/util.js');
Page({
	data: {
		isSave: true,
		buttonDisable: false,
		showUploadTip: false,
		buttonList: [{
			title: '上传',
			bindtap: 'chooseImg',
		}, {
			title: "下载",
			bindtap: 'download',
		}],
		upload: '/images/cartoon.png',
		envList,
		selectedEnv: envList[0],
		haveCreateCollection: false,
		chooseIndex: 0,
		chooseModelType: "cartoon-3d",
		imagesRes: "",
		images: {},
		id: "",
		count: 1,
		list: [{
			name: "3D",
			modelType: "cartoon-3d",
			checked: true,
		},
		{
			name: "日漫",
			modelType: "cartoon",
			checked: false,
		},
		{
			name: "手绘",
			modelType: "cartoon-handdrawn",
			checked: false,
		},
		{
			name: "素描",
			modelType: "cartoon-sketch",
			checked: false,
		},
		{
			name: "艺术",
			modelType: "cartoon-artstyle",
			checked: false,
		}],
	},
	choose: function (e) {
		let index = e.currentTarget.dataset.id;
		let list = this.data.list;
		list[this.data.chooseIndex].checked = false;
		list[index].checked = true;
		this.setData({
			chooseIndex: index,
			chooseModelType: list[this.data.chooseIndex].modelType,
			list: this.data.list,
		})
	},

	imageLoad: function (e) {
		var $width = e.detail.width,  //获取图片真实宽度
			$height = e.detail.height,
			ratio = $height / $width;  //图片的真实宽高比例
		var viewHeight = 465, viewWidth = 465 / ratio;  //计算的高度值
		var image = this.data.images;
		image[e.currentTarget.id] = {
			width: viewWidth,
			height: viewHeight
		}
		this.setData({
			images: image,
			id: e.currentTarget.id
		})
	},

	chooseImg: function () {
		var that = this
		wx.chooseImage({
			count: that.data.count,
			sizeType: ["original", "compressed"], // 可以指定是原图还是压缩图，默认二者都有
			sourceType: ["album", "camera"], // 可以指定来源是相册还是相机，默认二者都有
			success: function (res) {
				// 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
				var tempFilePaths = res.tempFilePaths
				that.setData({
					upload: tempFilePaths[0],
					isSave: true,
				})
			}
		})
	},
	onClickPowerInfo(e) {
		const index = e.currentTarget.dataset.index;
		const powerList = this.data.powerList;
		powerList[index].showItem = !powerList[index].showItem;
		if (powerList[index].title === '数据库' && !this.data.haveCreateCollection) {
			this.onClickDatabase(powerList);
		} else {
			this.setData({
				powerList
			});
		}
	},

	onChangeShowEnvChoose() {
		wx.showActionSheet({
			itemList: this.data.envList.map(i => i.alias),
			success: (res) => {
				this.onChangeSelectedEnv(res.tapIndex);
			},
			fail(res) {
				console.log(res.errMsg);
			}
		});
	},

	onChangeSelectedEnv(index) {
		if (this.data.selectedEnv.envId === this.data.envList[index].envId) {
			return;
		}
		const powerList = this.data.powerList;
		powerList.forEach(i => {
			i.showItem = false;
		});
		this.setData({
			selectedEnv: this.data.envList[index],
			powerList,
			haveCreateCollection: false
		});
	},

	jumpPage(e) {
		wx.navigateTo({
			url: `/pages/${e.currentTarget.dataset.page}/index?envId=${this.data.selectedEnv.envId}`,
		});
	},

	onClickDatabase(powerList) {
		wx.showLoading({
			title: '',
		});
		wx.cloud.callFunction({
			name: 'quickstartFunctions',
			config: {
				env: this.data.selectedEnv.envId
			},
			data: {
				type: 'createCollection'
			}
		}).then((resp) => {
			if (resp.result.success) {
				this.setData({
					haveCreateCollection: true
				});
			}
			this.setData({
				powerList
			});
			wx.hideLoading();
		}).catch((e) => {
			this.setData({
				showUploadTip: true
			});
			wx.hideLoading();
		});
	},

	submit: function () {
		var that = this
		if (!that.data.isSave) {
			wx.showToast({
				title: "请先下载或重新上传一张图片",
				icon: "none",
				duration: 2000
			})
			return
		}
		wx.showLoading({
			title: '生成中，请稍后',
		})
		that.setData({
			buttonDisable: true,
		})
		wx.uploadFile({
			url: 'https://gs-aistudio.top/cv/person_image_cartoon/' + that.data.chooseModelType,
			filePath: that.data.upload,
			name: "file",
			success: function (res) {
				if (res.statusCode == 200) {
					let imagePath = "data:image/jpg;base64," + res.data.replaceAll("\"", "")
					that.setData({
						upload: imagePath,
						isSave: false,
					})
				}
			},
			fail: function (err) {
				wx.showToast({
					title: err.errMsg,
					icon: "none",
					duration: 2000
				})
			},
			complete: function (result) {
				wx.hideLoading();
				that.setData({
					buttonDisable: false,
				})
			}
		})
	},

	download: function () {
		var that = this
		if (that.data.isSave) {
			util.writeFileToPhotosAlbum(that)
			return
		}
		util.writeFileBase64(that)
	}
});
