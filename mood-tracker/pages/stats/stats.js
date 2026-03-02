const app = getApp()

Page({
  data: {
    weekData: [],
    monthData: [],
    currentView: 'week',
    moodIcons: ['😢', '😟', '😐', '🙂', '😄'],
    recordedDays: 0
  },

  onShow() {
    this.processData()
  },

  processData() {
    const records = app.globalData.moodRecords
    const weekData = this.getWeekData(records)
    const monthData = this.getMonthData(records)
    const recordedDays = weekData.filter(i => i.hasRecord).length
    this.setData({ weekData, monthData, recordedDays })
  },

  getWeekData(records) {
    const days = ['日', '一', '二', '三', '四', '五', '六']
    const today = new Date()
    const weekData = []
    
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today - i * 86400000)
      const dateStr = d.toDateString()
      const dayRecords = records.filter(r => 
        new Date(r.timestamp).toDateString() === dateStr
      )
      
      const avgMood = dayRecords.length 
        ? Math.round(dayRecords.reduce((s, r) => s + r.mood, 0) / dayRecords.length)
        : 0
      
      weekData.push({
        day: days[d.getDay()],
        date: `${d.getMonth() + 1}/${d.getDate()}`,
        mood: avgMood,
        hasRecord: dayRecords.length > 0
      })
    }
    return weekData
  },

  getMonthData(records) {
    const today = new Date()
    const monthData = []
    
    for (let i = 29; i >= 0; i--) {
      const d = new Date(today - i * 86400000)
      const dateStr = d.toDateString()
      const dayRecords = records.filter(r => 
        new Date(r.timestamp).toDateString() === dateStr
      )
      
      if (dayRecords.length > 0) {
        const avgMood = Math.round(dayRecords.reduce((s, r) => s + r.mood, 0) / dayRecords.length)
        monthData.push({
          date: `${d.getMonth() + 1}/${d.getDate()}`,
          mood: avgMood
        })
      }
    }
    return monthData
  },

  switchView(e) {
    this.setData({ currentView: e.currentTarget.dataset.view })
  }
})
