App({
  globalData: {
    userInfo: null,
    moodRecords: []
  },
  
  onLaunch() {
    const records = wx.getStorageSync('moodRecords') || []
    this.globalData.moodRecords = records
    console.log('情绪助手启动，已有记录:', records.length)
  }
})
