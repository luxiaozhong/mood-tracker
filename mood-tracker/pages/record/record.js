const app = getApp()

Page({
  data: {
    mood: 3,
    trigger: '',
    note: '',
    triggers: ['工作', '人际关系', '健康', '财务', '家庭', '其他'],
    moodIcons: ['😢', '😟', '😐', '🙂', '😄'],
    moodLabels: ['很低落', '有点糟', '一般', '还不错', '超棒']
  },

  onShow() {
    const today = new Date().toDateString()
    const existing = app.globalData.moodRecords.find(r => 
      new Date(r.timestamp).toDateString() === today
    )
    if (existing) {
      this.setData({
        mood: existing.mood,
        trigger: existing.trigger,
        note: existing.note
      })
    } else {
      this.setData({
        mood: 3,
        trigger: '',
        note: ''
      })
    }
  },

  selectMood(e) {
    this.setData({ mood: parseInt(e.currentTarget.dataset.value) })
  },

  selectTrigger(e) {
    this.setData({ trigger: e.currentTarget.dataset.value })
  },

  inputNote(e) {
    this.setData({ note: e.detail.value })
  },

  saveRecord() {
    const { mood, trigger, note } = this.data
    const timestamp = Date.now()
    
    const records = app.globalData.moodRecords.filter(r => 
      new Date(r.timestamp).toDateString() !== new Date(timestamp).toDateString()
    )
    
    records.push({ mood, trigger, note, timestamp })
    app.globalData.moodRecords = records
    
    wx.setStorageSync('moodRecords', records)
    
    wx.showToast({
      title: '记录成功',
      icon: 'success'
    })
    
    setTimeout(() => {
      wx.switchTab({ url: '/pages/index/index' })
    }, 800)
  }
})
