const DIFFICULTY_CONFIG = {
  easy: { gridSize: 15, baseSpeed: 250, cellSize: 20 },
  normal: { gridSize: 20, baseSpeed: 200, cellSize: 15 },
  hard: { gridSize: 25, baseSpeed: 150, cellSize: 12 }
}

Page({
  data: {
    gridSize: 20,
    cellSize: 15,
    score: 0,
    highScore: 0,
    gameState: 'ready',
    snake: [],
    food: null,
    direction: 'right',
    nextDirection: 'right',
    difficulty: 'normal',
    foodsEaten: 0,
    currentSpeed: 200,
    showDifficultyModal: false,
    activeDirection: ''
  },

  timer: null,
  baseSpeed: 200,

  onLoad() {
    const highScore = wx.getStorageSync('snakeHighScore') || 0
    this.setData({ highScore })
    this.initGame()
    
    // 监听键盘事件（PC端开发者工具支持）
    this.setupKeyboardListener()
  },

  setupKeyboardListener() {
    // 微信小程序本身不支持键盘事件，但可以在开发者工具中测试
    // 这里预留接口，如需PC端支持可扩展
  },

  onUnload() {
    this.stopGame()
  },

  initGame() {
    const { gridSize, difficulty } = this.data
    const config = DIFFICULTY_CONFIG[difficulty]
    const startX = Math.floor(gridSize / 2)
    const startY = Math.floor(gridSize / 2)
    
    const snake = [
      { x: startX, y: startY },
      { x: startX - 1, y: startY },
      { x: startX - 2, y: startY }
    ]
    
    this.baseSpeed = config.baseSpeed
    this.speed = config.baseSpeed
    
    this.setData({
      snake,
      food: this.generateFood(snake),
      direction: 'right',
      nextDirection: 'right',
      score: 0,
      foodsEaten: 0,
      currentSpeed: config.baseSpeed,
      gameState: 'ready'
    })
  },

  showDifficultySelector() {
    this.setData({ showDifficultyModal: true })
  },

  hideDifficultySelector() {
    this.setData({ showDifficultyModal: false })
  },

  selectDifficulty(e) {
    const difficulty = e.currentTarget.dataset.difficulty
    const config = DIFFICULTY_CONFIG[difficulty]
    
    this.setData({
      difficulty,
      gridSize: config.gridSize,
      cellSize: config.cellSize,
      showDifficultyModal: false
    })
    
    this.initGame()
    
    wx.showToast({
      title: difficulty === 'easy' ? '简单模式' : difficulty === 'normal' ? '普通模式' : '困难模式',
      icon: 'none'
    })
  },

  generateFood(snake) {
    const { gridSize } = this.data
    let food
    do {
      food = {
        x: Math.floor(Math.random() * gridSize),
        y: Math.floor(Math.random() * gridSize)
      }
    } while (snake.some(segment => segment.x === food.x && segment.y === food.y))
    return food
  },

  startGame() {
    if (this.data.gameState === 'over') {
      this.initGame()
    }
    this.setData({ gameState: 'playing' })
    this.gameLoop()
  },

  pauseGame() {
    this.stopGame()
    this.setData({ gameState: 'paused' })
  },

  resumeGame() {
    this.setData({ gameState: 'playing' })
    this.gameLoop()
  },

  stopGame() {
    if (this.timer) {
      clearTimeout(this.timer)
      this.timer = null
    }
  },

  gameLoop() {
    if (this.data.gameState !== 'playing') return
    
    this.moveSnake()
    
    this.timer = setTimeout(() => {
      this.gameLoop()
    }, this.speed)
  },

  moveSnake() {
    const { snake, food, gridSize, score, nextDirection } = this.data
    const head = { ...snake[0] }
    
    // 更新方向
    this.setData({ direction: nextDirection })
    
    // 移动头部
    switch (nextDirection) {
      case 'up': head.y--; break
      case 'down': head.y++; break
      case 'left': head.x--; break
      case 'right': head.x++; break
    }
    
    // 撞墙检测
    if (head.x < 0 || head.x >= gridSize || head.y < 0 || head.y >= gridSize) {
      this.gameOver()
      return
    }
    
    // 撞自己检测
    if (snake.some(segment => segment.x === head.x && segment.y === head.y)) {
      this.gameOver()
      return
    }
    
    const newSnake = [head, ...snake]
    let newFood = food
    let newScore = score
    
    // 吃食物
    if (head.x === food.x && head.y === food.y) {
      newScore += 10
      newFood = this.generateFood(newSnake)
      
      // 每吃10颗食物，速度增加15%
      const newFoodsEaten = this.data.foodsEaten + 1
      if (newFoodsEaten % 10 === 0) {
        this.speed = Math.max(50, Math.floor(this.speed * 0.85))
        wx.showToast({
          title: '速度提升!',
          icon: 'none',
          duration: 1000
        })
      }
      
      this.setData({ foodsEaten: newFoodsEaten })
    } else {
      newSnake.pop()
    }
    
    this.setData({
      snake: newSnake,
      food: newFood,
      score: newScore
    })
  },

  gameOver() {
    this.stopGame()
    
    const { score, highScore } = this.data
    let newHighScore = highScore
    
    if (score > highScore) {
      newHighScore = score
      wx.setStorageSync('snakeHighScore', newHighScore)
    }
    
    this.setData({
      gameState: 'over',
      highScore: newHighScore
    })
    
    wx.showModal({
      title: '游戏结束',
      content: `得分: ${score}`,
      showCancel: false,
      confirmText: '再来一局',
      success: () => {
        this.initGame()
        this.startGame()
      }
    })
  },

  preventBubble() {
    // 阻止事件冒泡
  },

  // 虚拟方向键高亮反馈
  highlightDirection(direction) {
    this.setData({ activeDirection: direction })
    setTimeout(() => {
      this.setData({ activeDirection: '' })
    }, 150)
  },

  changeDirection(e) {
    if (this.data.gameState !== 'playing') return
    
    const newDirection = e.currentTarget.dataset.direction
    const { direction } = this.data
    
    // 高亮反馈
    this.highlightDirection(newDirection)
    
    // 防止反向移动 - 使用当前实际移动方向检查
    const opposites = {
      up: 'down',
      down: 'up',
      left: 'right',
      right: 'left'
    }
    
    // 如果新方向不是当前方向的反方向，则可以转向
    if (opposites[newDirection] !== direction) {
      this.setData({ nextDirection: newDirection })
    }
  },

  onTouchStart(e) {
    this.touchStartX = e.touches[0].clientX
    this.touchStartY = e.touches[0].clientY
  },

  onTouchEnd(e) {
    if (this.data.gameState !== 'playing') return
    
    const touchEndX = e.changedTouches[0].clientX
    const touchEndY = e.changedTouches[0].clientY
    
    const dx = touchEndX - this.touchStartX
    const dy = touchEndY - this.touchStartY
    
    if (Math.abs(dx) > Math.abs(dy)) {
      // 水平滑动
      this.changeDirection({ 
        currentTarget: { 
          dataset: { direction: dx > 0 ? 'right' : 'left' } 
        } 
      })
    } else {
      // 垂直滑动
      this.changeDirection({ 
        currentTarget: { 
          dataset: { direction: dy > 0 ? 'down' : 'up' } 
        } 
      })
    }
  }
})
