const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const scoreText = document.getElementById("score");
const healthText = document.getElementById("health");
const message = document.getElementById("message");
const startButton = document.getElementById("start");
const highScoreText = document.getElementById("highScore");

const size = 20;
const grid = 16;

let snake = [];
let foods = [];
let score = 0;
let health = 30;
let highScore = 0;
let direction = "right";
let nextDirection = "right";
let playing = false;
let timer = null;
let overlayType = "";
let overlayUntil = 0;

try {
highScore = Number(localStorage.getItem("snakeHighScore")) || 0;
} catch (error) {
highScore = 0;
}

if (highScoreText) {
highScoreText.textContent = highScore;
}

function moveFoodToNewPosition(food) {
let validPosition = false;

while (!validPosition) {
food.x = Math.floor(Math.random() * grid);
food.y = Math.floor(Math.random() * grid);

validPosition =
  !snake.some(p => p.x === food.x && p.y === food.y) &&
  !foods.some(other =>
    other !== food &&
    other.x === food.x &&
    other.y === food.y
  );

}
}

function createFoods() {
foods = [
{ type: "healthy", emoji: "🍎", x: 0, y: 0 },
{ type: "unhealthy", emoji: "🍔", x: 0, y: 0 },
{ type: "unhealthy", emoji: "🍕", x: 0, y: 0 },
{ type: "unhealthy", emoji: "🍟", x: 0, y: 0 }
];

foods.forEach(moveFoodToNewPosition);
}

function drawGame() {
ctx.fillStyle = "#a8e6cf";
ctx.fillRect(0, 0, canvas.width, canvas.height);

// Draw snake
snake.forEach((part, index) => {
const x = part.x * size;
const y = part.y * size;

ctx.fillStyle = index === 0 ? "#14532d" : "#28a745";
ctx.fillRect(x + 1, y + 1, size - 2, size - 2);

// Snake eyes
if (index === 0) {
  ctx.fillStyle = "white";
  ctx.fillRect(x + 5, y + 5, 4, 4);
  ctx.fillRect(x + 12, y + 5, 4, 4);

  ctx.fillStyle = "black";
  ctx.fillRect(x + 6, y + 6, 2, 2);
  ctx.fillRect(x + 13, y + 6, 2, 2);
}

});

// Draw food
ctx.font = "20px Arial";
ctx.textAlign = "center";
ctx.textBaseline = "middle";

foods.forEach(food => {
ctx.fillText(
food.emoji,
food.x * size + size / 2,
food.y * size + size / 2
);
});

// Draw overlay messages inside the game
if (overlayType === "GAME OVER") {
drawOverlay(
"GAME OVER",
"Your snake has died!"
);
} else if (
overlayType === "CONGRATULATIONS" &&
Date.now() < overlayUntil &&
playing
) {
drawOverlay(
"CONGRATULATIONS!",
"NEW HIGHEST SCORE: " + score
);
}
}

function drawOverlay(title, subtitle) {
ctx.fillStyle = "rgba(0, 0, 0, 0.85)";
ctx.fillRect(10, 95, 300, 130);

ctx.textAlign = "center";
ctx.textBaseline = "middle";

ctx.fillStyle = "#ffe66d";
ctx.font = "bold 22px Arial";
ctx.fillText(title, 160, 135);

ctx.fillStyle = "white";
ctx.font = "bold 13px Arial";
ctx.fillText(subtitle, 160, 175);
}

function startGame() {
clearInterval(timer);

snake = [
{ x: 5, y: 8 },
{ x: 4, y: 8 },
{ x: 3, y: 8 }
];

score = 0;
health = 30;
direction = "right";
nextDirection = "right";
playing = true;
overlayType = "";
overlayUntil = 0;

createFoods();
updateStats();

message.textContent = "Choose your food!";
startButton.textContent = "RESTART GAME";

drawGame();
timer = setInterval(moveSnake, 180);
}

function changeDirection(newDirection) {
if (!playing) return;

const opposite = {
up: "down",
down: "up",
left: "right",
right: "left"
};

if (newDirection !== opposite[direction]) {
nextDirection = newDirection;
}
}

document.addEventListener("keydown", function(event) {
const keys = {
ArrowUp: "up",
ArrowDown: "down",
ArrowLeft: "left",
ArrowRight: "right"
};

if (keys[event.key]) {
event.preventDefault();
changeDirection(keys[event.key]);
}
});

document.querySelectorAll(".move").forEach(button => {
button.addEventListener("click", function() {
changeDirection(this.dataset.dir);
});
});

function moveSnake() {
if (!playing) return;

direction = nextDirection;

const head = { ...snake[0] };

if (direction === "up") head.y--;
if (direction === "down") head.y++;
if (direction === "left") head.x--;
if (direction === "right") head.x++;

// Check wall collision
if (
head.x < 0 ||
head.x >= grid ||
head.y < 0 ||
head.y >= grid
) {
endGame();
return;
}

const eatenFood = foods.find(
food => food.x === head.x && food.y === head.y
);

const bodyToCheck =
eatenFood && eatenFood.type === "healthy"
? snake
: snake.slice(0, -1);

// Check collision with snake's body
if (bodyToCheck.some(p => p.x === head.x && p.y === head.y)) {
endGame();
return;
}

snake.unshift(head);

if (eatenFood) {
if (eatenFood.type === "healthy") {
score += 10;
message.textContent = "🍎 Healthy food! +10 points!";

  // Check for a new highest score
  if (score > highScore) {
    highScore = score;

    try {
      localStorage.setItem("snakeHighScore", highScore);
    } catch (error) {}

    overlayType = "CONGRATULATIONS";
    overlayUntil = Date.now() + 2500;

    message.textContent =
      "CONGRATULATIONS! YOU REACHED THE HIGHEST SCORE!";
  }
} else {
  health -= 10;
  snake.pop();
message.textContent =
    eatenFood.emoji + " Unhealthy food! -10 health!";
}

// Move all foods to new random positions
foods.forEach(moveFoodToNewPosition);

if (health <= 0) {
  health = 0;
  updateStats();
  endGame();
  return;
}

} else {
snake.pop();
}

// Remove congratulations overlay after 2.5 seconds
if (
overlayType === "CONGRATULATIONS" &&
Date.now() >= overlayUntil
) {
overlayType = "";
}

updateStats();
drawGame();
}

function updateStats() {
scoreText.textContent = score;
healthText.textContent = health;

if (highScoreText) {
highScoreText.textContent = highScore;
}
}

function endGame() {
playing = false;
clearInterval(timer);

overlayType = "GAME OVER";
overlayUntil = 0;

message.textContent = "GAME OVER!";
startButton.textContent = "PLAY AGAIN";

drawGame();
}

startButton.addEventListener("click", startGame);

// Initial screen
snake = [
{ x: 5, y: 8 },
{ x: 4, y: 8 },
{ x: 3, y: 8 }
];

createFoods();
updateStats();
drawGame();
