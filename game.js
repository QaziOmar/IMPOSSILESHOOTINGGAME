document.addEventListener("DOMContentLoaded", function() {
    const gameArea = document.getElementById('gameArea');
    const player = document.getElementById('player');
    const enemiesContainer = document.getElementById('enemies');
    const killScoreDisplay = document.getElementById('killScore');
    const restartButton = document.createElement('button'); // Restart button

    let playerPositionX = gameArea.clientWidth / 2;
    let playerPositionY = gameArea.clientHeight - player.clientHeight; // Spawn player at bottom
    let playerBullets = [];
    let enemies = [];
    let killScore = 0;
    let gameRunning = true; // Game state

    // Player movement parameters
    const playerSpeed = 5; // Increased distance per movement
    let moveDirection = {
        up: false,
        down: false,
        left: false,
        right: false
    };

    // Function to handle player movement
    function movePlayer() {
        if (moveDirection.up && playerPositionY > 0) {
            playerPositionY -= playerSpeed;
        }
        if (moveDirection.down && playerPositionY < gameArea.clientHeight - player.clientHeight) {
            playerPositionY += playerSpeed;
        }
        if (moveDirection.left && playerPositionX > 0) {
            playerPositionX -= playerSpeed;
        }
        if (moveDirection.right && playerPositionX < gameArea.clientWidth - player.clientWidth) {
            playerPositionX += playerSpeed;
        }

        // Update player position
        player.style.left = `${playerPositionX}px`;
        player.style.top = `${playerPositionY}px`;
    }

    // Event listeners for player movement
    document.addEventListener('keydown', function(event) {
        if (event.key === 'w' || event.key === 'W') {
            moveDirection.up = true;
        } else if (event.key === 's' || event.key === 'S') {
            moveDirection.down = true;
        } else if (event.key === 'a' || event.key === 'A') {
            moveDirection.left = true;
        } else if (event.key === 'd' || event.key === 'D') {
            moveDirection.right = true;
        }
    });

    document.addEventListener('keyup', function(event) {
        if (event.key === 'w' || event.key === 'W') {
            moveDirection.up = false;
        } else if (event.key === 's' || event.key === 'S') {
            moveDirection.down = false;
        } else if (event.key === 'a' || event.key === 'A') {
            moveDirection.left = false;
        } else if (event.key === 'd' || event.key === 'D') {
            moveDirection.right = false;
        }
    });

    // Function to shoot a bullet towards where the player clicks
    function shootBullet(event) {
        if (event.button === 0 && gameRunning) { // Left mouse button
            let bullet = document.createElement('div');
            bullet.className = 'bullet playerBullet'; // Added class 'playerBullet'
            bullet.style.left = `${playerPositionX + player.clientWidth / 2 - 5}px`;
            bullet.style.top = `${playerPositionY}px`;
            gameArea.appendChild(bullet);
            playerBullets.push(bullet);

            // Function to move bullet towards click position
            function moveBullet() {
                if (!gameRunning) return; // Stop moving bullets if game over
                let bulletPositionX = parseFloat(bullet.style.left);
                let bulletPositionY = parseFloat(bullet.style.top);

                // Calculate direction towards click position
                let angle = Math.atan2(event.clientY - bulletPositionY, event.clientX - bulletPositionX);
                let velocityX = Math.cos(angle) * 20; // Adjust speed as needed
                let velocityY = Math.sin(angle) * 20; // Adjust speed as needed

                // Update bullet position
                bullet.style.left = `${bulletPositionX + velocityX}px`;
                bullet.style.top = `${bulletPositionY + velocityY}px`;

                // Check collision with enemies
                let bulletRect = bullet.getBoundingClientRect();
                for (let i = 0; i < enemies.length; i++) {
                    let enemy = enemies[i];
                    let enemyRect = enemy.getBoundingClientRect();
                    if (bulletRect.left < enemyRect.right && bulletRect.right > enemyRect.left &&
                        bulletRect.top < enemyRect.bottom && bulletRect.bottom > enemyRect.top) {
                        // Remove bullet and enemy
                        bullet.remove();
                        enemy.remove();
                        playerBullets.splice(playerBullets.indexOf(bullet), 1);
                        enemies.splice(i, 1);
                        killScore++;
                        killScoreDisplay.textContent = `Kills: ${killScore}`;
                        createEnemy();
                        createEnemy();
                        break;
                    }
                }

                // Remove bullet if out of bounds
                if (bulletPositionX < 0 || bulletPositionX > gameArea.clientWidth ||
                    bulletPositionY < 0 || bulletPositionY > gameArea.clientHeight) {
                    bullet.remove();
                    clearInterval(bulletInterval);
                }
            }

            // Move bullet at intervals
            let bulletInterval = setInterval(moveBullet, 20); // Adjust interval as needed
        }
    }

    // Function to create and manage enemies
    function createEnemy() {
        let enemy = document.createElement('div');
        enemy.className = 'enemy';
        enemy.style.left = `${Math.random() * (gameArea.clientWidth - enemy.clientWidth)}px`;
        enemy.style.top = `${Math.random() * (gameArea.clientHeight - enemy.clientHeight)}px`;
        gameArea.appendChild(enemy);
        enemies.push(enemy);

        // Enemy shooting bullets towards the player
        setInterval(() => {
            if (enemies.includes(enemy) && gameRunning) {
                let bullet = document.createElement('div');
                bullet.className = 'bullet enemyBullet'; // Added class 'enemyBullet'
                bullet.style.left = `${parseFloat(enemy.style.left) + enemy.clientWidth / 2 - 5}px`;
                bullet.style.top = `${parseFloat(enemy.style.top) + enemy.clientHeight}px`;
                gameArea.appendChild(bullet);

                // Move bullet towards the player
                function moveEnemyBullet() {
                    if (!gameRunning) return; // Stop moving bullets if game over
                    let bulletPositionX = parseFloat(bullet.style.left);
                    let bulletPositionY = parseFloat(bullet.style.top);

                    // Calculate direction towards player
                    let angle = Math.atan2(playerPositionY - bulletPositionY, playerPositionX - bulletPositionX);
                    let velocityX = Math.cos(angle) * 20; // Adjust speed as needed
                    let velocityY = Math.sin(angle) * 20; // Adjust speed as needed

                    // Update bullet position
                    bullet.style.left = `${bulletPositionX + velocityX}px`;
                    bullet.style.top = `${bulletPositionY + velocityY}px`;

                    // Check collision with player
                    let bulletRect = bullet.getBoundingClientRect();
                    let playerRect = player.getBoundingClientRect();

                    if (bulletRect.left < playerRect.right && bulletRect.right > playerRect.left &&
                        bulletRect.top < playerRect.bottom && bulletRect.bottom > playerRect.top) {
                        clearInterval(bulletInterval);
                        bullet.remove();
                        endGame(); // Player hit, end game
                    }

                    // Remove bullet if out of bounds
                    if (bulletPositionY >= gameArea.clientHeight) {
                        bullet.remove();
                        clearInterval(bulletInterval);
                    }
                }

                // Move enemy bullet at intervals
                let bulletInterval = setInterval(moveEnemyBullet, 20); // Adjust interval as needed
            }
        }, 2000); // Adjust bullet speed and enemy shooting interval as needed
    }

    // Function to end the game
    function endGame() {
        gameRunning = false;
        player.remove();
        enemies.forEach(enemy => enemy.remove());
        playerBullets.forEach(bullet => bullet.remove());
        killScoreDisplay.textContent = `Game Over! Kills: ${killScore}`;
        
        // Add restart button
        restartButton.textContent = 'Restart';
        restartButton.addEventListener('click', () => {
            location.reload(); // Reload the game on restart
        });
        document.body.appendChild(restartButton);
    }

    // Event listener for shooting bullets
    gameArea.addEventListener('mousedown', shootBullet);

    // Game loop for player movement
    setInterval(movePlayer, 20); // Adjust interval as needed

    // Initial setup
    player.style.left = `${playerPositionX}px`;
    player.style.top = `${playerPositionY}px`;
    createEnemy();
    createEnemy(); // Initial two enemies
});
