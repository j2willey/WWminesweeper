console.log('script.js loaded');
(() => {
    let fieldHeight = 10;
    let fieldWidth  = 10;
    const mines = new Set();
    const flags = new Set();
    // difficulty is the percentage of cells that are mines (easy = 10%, medium = 15%, hard = 20%)
    let difficultyOptions = { 'easy': 0.1, 'medium': 0.15, 'hard': 0.2};
    let difficulty = difficultyOptions['easy'];
    let mineCount = 0;
    let revealedCells = 0;
    let gameTimer = null;
    let gameOver = false;
    const gameboard = document.getElementById('gameboard');
    const resetButton = document.getElementById('reset-button');
    const gameResult = document.getElementById('game-result');
    const gameResultText = document.getElementById('game-result-text');

    console.log('LOADING GAME')

    function incrementNeighborMine(x, y) {
        if ( x < 0 || x >= fieldWidth || y < 0 || y >= fieldHeight) {
            return;
        }
        const cell = document.getElementById(`cell_${x}-${y}`);
        const neighborMines = parseInt(cell.getAttribute('neighbor-mines'));
        cell.setAttribute('neighbor-mines', neighborMines + 1);
    }

    const neighbors = [ {x: -1, y: -1}, {x: 0, y: -1}, {x: 1, y: -1},
                        {x: -1, y:  0},                {x: 1, y:  0},
                        {x: -1, y:  1}, {x: 0, y:  1}, {x: 1, y:  1} ];

    function placeMines(difficulty) {
        mineCount = Math.floor(fieldWidth * fieldHeight * difficulty);
        document.getElementById('mine-count').innerText = mineCount;
        mines.clear();
        flags.clear();
        while (mines.size < mineCount) {
            const x = Math.floor(Math.random() * fieldWidth);
            const y = Math.floor(Math.random() * fieldHeight);
            const cell = document.getElementById(`cell_${x}-${y}`);
            if (mines.has(cell)) { continue; }
            cell.setAttribute('mine', true);
            mines.add(cell);
            neighbors.forEach((neighbor) => {
                incrementNeighborMine(x + neighbor.x, y + neighbor.y);
            });
        }

    }

    function createGameBoard() {
        gameboard.innerHTML = '';
        gameboard.style.gridTemplateColumns = `repeat(${fieldWidth}, 1fr)`

        gameboard.setAttribute('rows', fieldHeight);
        gameboard.setAttribute('cols', fieldWidth);
        for (let y = 0 ; y < fieldHeight ; y++) {
            for (let x = 0 ; x < fieldWidth; x++) {
                const cell = document.createElement('div');
                cell.setAttribute('id', `cell_${x}-${y}`);
                cell.setAttribute('x', x);
                cell.setAttribute('y', y);
                cell.setAttribute('neighbor-mines', 0);
                cell.setAttribute('mine', false);
                cell.classList.add('cell');
                cell.classList.add(`obscurred`);
                gameboard.appendChild(cell);
            }
        }
        revealedCells = 0
        document.getElementById('time-elapsed').innerText = 0;
        placeMines(difficulty);
    }



    function revealNeigborCells(cell) {
        cell.classList.remove('obscurred');
        cell.classList.add('revealed');
        revealedCells++;
        if (cell.getAttribute('neighbor-mines') > 0) {
            console.log("CELL HAS NEIGHBOR MINES:", cell)
            cell.innerText = cell.getAttribute('neighbor-mines');
            cell.classList.add(`n${cell.getAttribute('neighbor-mines')}`);
        } else {
            let x = parseInt(cell.getAttribute('x'));
            let y = parseInt(cell.getAttribute('y'));
            console.log(`CELL NOT DOES HAVE NEIGHBOR MINES: ${x}  ${y}`, cell)
            neighbors.forEach((neighbor) => {
                const neighborX = x + neighbor.x;
                const neighborY = y + neighbor.y;
                if (neighborX < 0 || neighborX >= fieldWidth || neighborY < 0 || neighborY >= fieldHeight) {
                    return;
                }
                const neighborCell = document.getElementById(`cell_${neighborX}-${neighborY}`);
                if (neighborCell.classList.contains('revealed')) {
                    return;
                }
                // setTimeout( () => { revealNeigborCells(neighborX, neighborY) } , 50);
                revealNeigborCells(neighborCell);
            });
        }
    }


    function toggleFlag(cell) {
        let mineCount = parseInt(document.getElementById('mine-count').innerText);

        if (cell.classList.contains('flag')) {
            cell.classList.remove('flag');
            cell.removeChild(cell.firstChild); // Add the image element as a child of the cell
            mineCount++;
            flags.delete(cell);
        } else {
            const img = document.createElement('img');
            img.src = 'images/icon_flag.png';
            cell.classList.add('flag');
            cell.appendChild(img); // Add the image element as a child of the cell
            mineCount--;
            flags.add(cell);
        }
        document.getElementById('mine-count').innerText = mineCount;
        console.log('FLAGS:', flags);
    }

    function displayMine(cell) {
        const img = document.createElement('img');
        img.src = 'images/icon_mine.png';
        img.classList.add('mine');
        cell.appendChild(img);
        cell.classList.remove('obscurred');
        cell.classList.add('revealed');
    }

    function displayAllMines() {
        console.log('DISPLAYING ALL MINES', mines);
        mines.forEach((cell) => {
            if (cell.classList.contains('flag')) {
                return;
            }
            displayMine(cell);
        });
        flags.forEach((cell) => {
            if (cell.getAttribute('mine') === 'true') {
                return;
            }
            // display a red X over an image of a mine
            const overlay = document.createElement('div');
            overlay.classList.add('flag-overlay');
            overlay.textContent = 'X';
            cell.appendChild(overlay);
            cell.style.position = 'relative';
            cell.classList.remove('obscurred');
            cell.classList.add('revealed');
        });
    }

    function revealCell(cell) {
        if (cell.classList.contains('revealed')) {
            return;
        }
        cell.classList.remove('obscurred');
        cell.classList.add('revealed');
        if (cell.getAttribute('mine') === 'true') {
            console.log('MINE FOUND');
            displayAllMines();
        } else if (cell.getAttribute('neighbor-mines') > 0) {
            cell.innerText = cell.getAttribute('neighbor-mines');
            cell.classList.add(`n${cell.getAttribute('neighbor-mines')}`);
            revealedCells++;
        } else {
            revealNeigborCells(cell);
        }
    }

    function getCellfromTarget(target) {
        let cell = target;
        if (target.nodeName == 'img'.toUpperCase()) {
            cell = target.parentElement;
        }
        if (gameOver) {
            // message in the footer to user that game is over
            return null;
        }
        return cell.classList.contains('cell') ? cell : null;
    }

    gameboard.addEventListener("contextmenu", (event) => {
        const cell = getCellfromTarget(event.target);
        if (cell === null) {
            return;
        }
        event.preventDefault();
        if (gameTimer === null) {
            startGame();
        }
        toggleFlag(cell);
    })

    const gridSizeSelect = document.getElementById('grid-size');

    gridSizeSelect.addEventListener('change', (event) => {
        fieldHeight = event.target.value;
        fieldWidth = event.target.value;
        createGameBoard();
        resetButton.click(); // Assuming you have a function to reset the game
    });

    const difficultySelect = document.getElementById('difficulty');

    difficultySelect.addEventListener('change', (event) => {
        difficulty = difficultyOptions[event.target.value];
        createGameBoard();
        resetButton.click(); // Assuming you have a function to reset the game
    });


    gameboard.addEventListener('click', (event) => {
        const cell = getCellfromTarget(event.target);
        if (cell === null) {
            return;
        }
        event.preventDefault();
        console.log('GAMEBOARD CLICKED')

        if (gameTimer === null) {
            startGame();
        }
        revealCell(cell);
        if (cell.getAttribute('mine') === 'true') {
            gameOver = true;
            cell.style.backgroundColor = 'yellow';
            //clearInterval(gameTimer);
            console.log('returned from clearInterval');
            clearInterval(gameTimer);
            gameTimer = null;
            gameResultText.textContent = 'You Lose!';
            gameResult.style.display = 'flex';
        } else if (revealedCells === (fieldWidth * fieldHeight - mineCount)) {
            gameOver = true;
            clearInterval(gameTimer);
            gameTimer = null;
            throwConfetti();
            gameResultText.textContent = 'You Win!';
            gameResult.style.display = 'flex';
        }
        console.log('revealedCells: ', revealedCells, "  mineCount: ", mineCount, "  gameOver: ", gameOver);

        // revealNeigborCells(cell.getAttribute('x'), cell.getAttribute('y'))
    });

    gameResult.addEventListener('click', () => {
        gameResultText.textContent = '----';
        gameResult.style.display = 'none';
        resetButton.click();
    });

    resetButton.addEventListener('click', (event) => {
        console.log('reset clicked');
        stopConfetti();
        gameResultText.textContent = '----';
        gameResult.style.display = 'none';

        for (let x = 0 ; x < fieldWidth ; x++) {
            for (let y = 0 ; y < fieldHeight; y++) {
                const cell = document.getElementById(`cell_${x}-${y}`);
                cell.classList.remove('revealed');
                cell.classList.add('obscurred');
                cell.setAttribute('neighbor-mines', 0);
                cell.innerText = '';
                gameOver = false;
                clearInterval(gameTimer);
                gameTimer = null;
            }
        }
        createGameBoard();
    })

    function endGame() {
        clearInterval(gameTimer);
        gameTimer = null;
        gameOver = true;
    }

    function startGame() {
        let startTime = Date.now();
        gameTimer = setInterval(() => {
            if (gameOver) {
                clearInterval(gameTimer);
                gameTimer = null;
                return;
            }
            let now = Date.now();
            let timeElapsed = Math.floor((now - startTime) / 1000);
            document.getElementById('time-elapsed').innerText = timeElapsed;
        }, 1000);
    }

    createGameBoard();

}) ()