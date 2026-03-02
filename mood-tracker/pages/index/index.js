const app = getApp()

Page({
  data: {
    todayRecord: null,
    todayDate: '',
    weekStats: {
      avgMood: 0,
      recordCount: 0,
      streakDays: 0
    },
    moodIcons: ['😢', '😟', '😐', '🙂', '😄'],
    moodLabels: ['很低落', '有点糟', '一般', '还不错', '超棒']
  },

  onShow() {
    this.setTodayDate()
    this.loadTodayRecord()
    this.calcWeekStats()
  },

  setTodayDate() {
    const today = new Date()
    const dateStr = `${today.getFullYear()}年${today.getMonth() + 1}月${today.getDate()}日`
    this.setData({ todayDate: dateStr })
  },

  loadTodayRecord() {
    const today = new Date().toDateString()
    const records = app.globalData.moodRecords
    const todayRecord = records.find(r => 
      new Date(r.timestamp).toDateString() === today
    )
    this.setData({ todayRecord })
  },

  calcWeekStats() {
    const records = app.globalData.moodRecords
    const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000
    const weekRecords = records.filter(r => r.timestamp > weekAgo)
    
    const avgMood = weekRecords.length 
      ? (weekRecords.reduce((s, r) => s + r.mood, 0) / weekRecords.length).toFixed(1)
      : 0
    
    const streakDays = this.calcStreak(records)
    
    this.setData({
      'weekStats.avgMood': avgMood,
      'weekStats.recordCount': weekRecords.length,
      'weekStats.streakDays': streakDays
    })
  },

  calcStreak(records) {
    if (!records.length) return 0
    
    const dates = [...new Set(records.map(r => 
      new Date(r.timestamp).toDateString()
    ))].sort((a, b) => new Date(b) - new Date(a))
    
    let streak = 0
    const today = new Date().toDateString()
    const yesterday = new Date(Date.now() - 86400000).toDateString()
    
    if (dates[0] === today || dates[0] === yesterday) {
      streak = 1
      for (let i = 1; i < dates.length; i++) {
        const curr = new Date(dates[i-1])
        const prev = new Date(dates[i])
        if ((curr - prev) / 86400000 === 1) {
          streak++
        } else {
          break
        }
      }
    }
    return streak
  },

  goRecord() {
    wx.switchTab({ url: '/pages/record/record' })
  }
})
