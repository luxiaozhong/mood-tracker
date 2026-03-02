const innerAudioContext = wx.createInnerAudioContext()

Page({
  data: {
    isBreathing: false,
    currentPhase: 'ready',
    progress: 0,
    cycleCount: 0,
    totalCycles: 3,
    phaseText: '准备开始',
    instructionText: '点击开始呼吸练习',
    timer: null,
    soundEnabled: true
  },

  onLoad() {
    // 设置音频属性
    innerAudioContext.obeyMuteSwitch = false
  },

  onUnload() {
    this.clearTimer()
    innerAudioContext.stop()
  },

  playSound(type) {
    if (!this.data.soundEnabled) return
    
    const soundUrls = {
      inhale: 'https://cdn.jsdelivr.net/gh/zen-audio/zen-sounds@main/bell-soft.mp3',
      hold: 'https://cdn.jsdelivr.net/gh/zen-audio/zen-sounds@main/chime-soft.mp3',
      exhale: 'https://cdn.jsdelivr.net/gh/zen-audio/zen-sounds@main/bowl-soft.mp3',
      complete: 'https://cdn.jsdelivr.net/gh/zen-audio/zen-sounds@main/complete.mp3'
    }
    
    innerAudioContext.src = soundUrls[type] || soundUrls.inhale
    innerAudioContext.stop()
    innerAudioContext.play()
  },

  toggleSound() {
    this.setData({ soundEnabled: !this.data.soundEnabled })
    wx.showToast({
      title: this.data.soundEnabled ? '声音已开启' : '声音已关闭',
      icon: 'none'
    })
  },

  clearTimer() {
    if (this.data.timer) {
      clearInterval(this.data.timer)
      this.setData({ timer: null })
    }
  },

  startBreathing() {
    if (this.data.isBreathing) {
      this.stopBreathing()
      return
    }

    this.setData({
      isBreathing: true,
      cycleCount: 0,
      progress: 0
    })

    this.runBreathingCycle()
  },

  stopBreathing() {
    this.clearTimer()
    this.setData({
      isBreathing: false,
      currentPhase: 'ready',
      phaseText: '准备开始',
      instructionText: '点击开始呼吸练习',
      progress: 0
    })
  },

  runBreathingCycle() {
    if (this.data.cycleCount >= this.data.totalCycles) {
      this.completeBreathing()
      return
    }

    // 吸气 4秒
    this.playSound('inhale')
    this.setPhase('inhale', '吸气', '用鼻子慢慢吸气...', 4000)
    
    setTimeout(() => {
      if (!this.data.isBreathing) return
      // 屏息 7秒
      this.playSound('hold')
      this.setPhase('hold', '屏息', '保持呼吸...', 7000)
      
      setTimeout(() => {
        if (!this.data.isBreathing) return
        // 呼气 8秒
        this.playSound('exhale')
        this.setPhase('exhale', '呼气', '用嘴慢慢呼气...', 8000)
        
        setTimeout(() => {
          if (!this.data.isBreathing) return
          this.setData({ cycleCount: this.data.cycleCount + 1 })
          this.runBreathingCycle()
        }, 8000)
      }, 7000)
    }, 4000)
  },

  setPhase(phase, phaseText, instructionText, duration) {
    this.setData({
      currentPhase: phase,
      phaseText,
      instructionText,
      progress: 0
    })

    const startTime = Date.now()
    const timer = setInterval(() => {
      const elapsed = Date.now() - startTime
      const progress = Math.min((elapsed / duration) * 100, 100)
      this.setData({ progress })

      if (progress >= 100) {
        clearInterval(timer)
      }
    }, 50)

    this.setData({ timer })
  },

  completeBreathing() {
    this.clearTimer()
    this.playSound('complete')
    this.setData({
      isBreathing: false,
      currentPhase: 'complete',
      phaseText: '完成',
      instructionText: '呼吸练习完成，感觉好些了吗？',
      progress: 100
    })

    wx.showToast({
      title: '练习完成',
      icon: 'success'
    })
  },

  changeCycles(e) {
    if (!this.data.isBreathing) {
      this.setData({ totalCycles: parseInt(e.detail.value) })
    }
  }
})
