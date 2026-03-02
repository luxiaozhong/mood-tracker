import pygame
import random
import sys

# 初始化 pygame
pygame.init()

# 颜色定义
BLACK = (0, 0, 0)
WHITE = (255, 255, 255)
GREEN = (0, 200, 0)
DARK_GREEN = (0, 155, 0)
RED = (220, 50, 50)
GRAY = (40, 40, 40)
SCORE_COLOR = (200, 200, 200)

# 游戏参数
CELL_SIZE = 20
GRID_WIDTH = 30
GRID_HEIGHT = 25
SCREEN_WIDTH = CELL_SIZE * GRID_WIDTH
SCREEN_HEIGHT = CELL_SIZE * GRID_HEIGHT + 40  # 底部留空显示分数
FPS = 10

# 方向
UP = (0, -1)
DOWN = (0, 1)
LEFT = (-1, 0)
RIGHT = (1, 0)


class Snake:
    def __init__(self):
        self.reset()

    def reset(self):
        cx, cy = GRID_WIDTH // 2, GRID_HEIGHT // 2
        self.body = [(cx, cy), (cx - 1, cy), (cx - 2, cy)]
        self.direction = RIGHT
        self.grow = False

    def head(self):
        return self.body[0]

    def set_direction(self, new_dir):
        # 不允许直接掉头
        dx, dy = new_dir
        cx, cy = self.direction
        if (dx + cx, dy + cy) != (0, 0):
            self.direction = new_dir

    def move(self):
        hx, hy = self.head()
        dx, dy = self.direction
        new_head = (hx + dx, hy + dy)
        self.body.insert(0, new_head)
        if not self.grow:
            self.body.pop()
        else:
            self.grow = False

    def check_collision(self):
        hx, hy = self.head()
        # 撞墙
        if hx < 0 or hx >= GRID_WIDTH or hy < 0 or hy >= GRID_HEIGHT:
            return True
        # 撞自己
        if self.head() in self.body[1:]:
            return True
        return False


class Food:
    def __init__(self):
        self.position = (0, 0)

    def spawn(self, snake_body):
        while True:
            pos = (random.randint(0, GRID_WIDTH - 1), random.randint(0, GRID_HEIGHT - 1))
            if pos not in snake_body:
                self.position = pos
                return


class Game:
    def __init__(self):
        self.screen = pygame.display.set_mode((SCREEN_WIDTH, SCREEN_HEIGHT))
        pygame.display.set_caption("贪吃蛇")
        self.clock = pygame.time.Clock()
        self.font = pygame.font.SysFont(None, 36)
        self.big_font = pygame.font.SysFont(None, 60)
        self.snake = Snake()
        self.food = Food()
        self.score = 0
        self.state = "playing"  # playing / game_over
        self.food.spawn(self.snake.body)

    def handle_input(self):
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                pygame.quit()
                sys.exit()
            if event.type == pygame.KEYDOWN:
                if self.state == "game_over":
                    if event.key == pygame.K_SPACE:
                        self.restart()
                    elif event.key == pygame.K_ESCAPE:
                        pygame.quit()
                        sys.exit()
                else:
                    if event.key in (pygame.K_UP, pygame.K_w):
                        self.snake.set_direction(UP)
                    elif event.key in (pygame.K_DOWN, pygame.K_s):
                        self.snake.set_direction(DOWN)
                    elif event.key in (pygame.K_LEFT, pygame.K_a):
                        self.snake.set_direction(LEFT)
                    elif event.key in (pygame.K_RIGHT, pygame.K_d):
                        self.snake.set_direction(RIGHT)
                    elif event.key == pygame.K_ESCAPE:
                        pygame.quit()
                        sys.exit()

    def update(self):
        if self.state != "playing":
            return
        self.snake.move()
        if self.snake.check_collision():
            self.state = "game_over"
            return
        if self.snake.head() == self.food.position:
            self.snake.grow = True
            self.score += 10
            self.food.spawn(self.snake.body)

    def draw(self):
        self.screen.fill(BLACK)

        # 画网格背景
        for x in range(GRID_WIDTH):
            for y in range(GRID_HEIGHT):
                rect = pygame.Rect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE)
                pygame.draw.rect(self.screen, GRAY, rect, 1)

        # 画食物
        fx, fy = self.food.position
        food_rect = pygame.Rect(fx * CELL_SIZE, fy * CELL_SIZE, CELL_SIZE, CELL_SIZE)
        pygame.draw.rect(self.screen, RED, food_rect)

        # 画蛇
        for i, (sx, sy) in enumerate(self.snake.body):
            color = DARK_GREEN if i == 0 else GREEN
            snake_rect = pygame.Rect(sx * CELL_SIZE, sy * CELL_SIZE, CELL_SIZE, CELL_SIZE)
            pygame.draw.rect(self.screen, color, snake_rect)
            pygame.draw.rect(self.screen, BLACK, snake_rect, 1)

        # 画分数栏
        score_bar_y = GRID_HEIGHT * CELL_SIZE
        pygame.draw.line(self.screen, WHITE, (0, score_bar_y), (SCREEN_WIDTH, score_bar_y))
        score_text = self.font.render(f"Score: {self.score}   Length: {len(self.snake.body)}", True, SCORE_COLOR)
        self.screen.blit(score_text, (10, score_bar_y + 8))

        # 游戏结束画面
        if self.state == "game_over":
            overlay = pygame.Surface((SCREEN_WIDTH, SCREEN_HEIGHT))
            overlay.set_alpha(150)
            overlay.fill(BLACK)
            self.screen.blit(overlay, (0, 0))

            go_text = self.big_font.render("GAME OVER", True, RED)
            go_rect = go_text.get_rect(center=(SCREEN_WIDTH // 2, SCREEN_HEIGHT // 2 - 30))
            self.screen.blit(go_text, go_rect)

            hint_text = self.font.render("Press SPACE to restart, ESC to quit", True, WHITE)
            hint_rect = hint_text.get_rect(center=(SCREEN_WIDTH // 2, SCREEN_HEIGHT // 2 + 20))
            self.screen.blit(hint_text, hint_rect)

            final_score = self.font.render(f"Final Score: {self.score}", True, SCORE_COLOR)
            fs_rect = final_score.get_rect(center=(SCREEN_WIDTH // 2, SCREEN_HEIGHT // 2 + 60))
            self.screen.blit(final_score, fs_rect)

        pygame.display.flip()

    def restart(self):
        self.snake.reset()
        self.score = 0
        self.state = "playing"
        self.food.spawn(self.snake.body)

    def run(self):
        while True:
            self.handle_input()
            self.update()
            self.draw()
            self.clock.tick(FPS)


if __name__ == "__main__":
    game = Game()
    game.run()
