const uuid = function () {
	var s = [];
	var hexDigits = "0123456789abcdefghigklmnopqrstwvuxyz";
	for (var i = 0; i < 36; i++) {
		s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
	}
	s[14] = 4; // bits 12-15 of the time_hi_and_version field to 0010
	s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1); // bits 6-7 of the clock_seq_hi_and_reserved to 01
	s[8] = s[13] = s[18] = s[23] = "-";
	var uuid = s.join("");
	return uuid
}

const writeFileBase64 = function (that) {
	const fs = wx.getFileSystemManager(); //获取全局唯一的文件管理器
	const imagePath = wx.env.USER_DATA_PATH + "/" + uuid() + ".jpg"
	fs.writeFile({ // 写文件
		filePath: imagePath, // wx.env.USER_DATA_PATH 指定临时文件存入的路径，后面字符串自定义
		data: that.data.upload.replace(/^data:image\/\w+;base64,/, ""),
		encoding: "base64", //二进制流文件必须是 binary
		success(res) {
			wx.saveImageToPhotosAlbum({ // 新开页面打开文档
				filePath: imagePath,  //拿上面存入的文件路径
				success: function (res) {
					wx.showToast({
						title: '下载完成',
						icon: "none",
						duration: 2000,
					})
					// if (!that.data.isSave) {
					that.setData({
						isSave: true,
						upload: imagePath,
					})
					// }
				}
			})
		}
	});
}

const writeFileToPhotosAlbum = function(that) {
	wx.saveImageToPhotosAlbum({ // 新开页面打开文档
		filePath: that.data.upload,  //拿上面存入的文件路径
		success: function (res) {
			wx.showToast({
				title: '下载完成',
				icon: "none",
				duration: 2000,
			})
			// if (!that.data.isSave) {
			that.setData({
				isSave: true,
				upload: imagePath,
			})
			// }
		}
	})
}
// 需要导出
module.exports = {
	writeFileBase64,
	writeFileToPhotosAlbum
}