console.log('script.js loaded');
(() => {
    const fieldHeight = 10;
    const fieldWidth  = 30;
    const mines = new Set();
    // difficulty is the percentage of cells that are mines (easy = 10%, medium = 15%, hard = 20%)
    let difficulty = 0.1;
    let mineCount = 0;
    let revealedCells = 0;
    let gameTimer = null;
    let gameOver = false;

    console.log('LOADING GAME')
    const gameboard = document.getElementById('gameboard');
    const resetButton = document.getElementById('reset-button');
    console.log(gameboard);
    gameboard.setAttribute('rows', fieldHeight);
    gameboard.setAttribute('rows', fieldWidth);
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
            cell.innerText=('');
            gameboard.appendChild(cell);
        }
    }

    function incrementNeighborMine(x, y) {
        if ( x < 0 || x >= fieldWidth || y < 0 || y >= fieldHeight) {
            return;
        }
        const cell = document.getElementById(`cell_${x}-${y}`);
        const neighborMines = parseInt(cell.getAttribute('neighbor-mines'));
        cell.setAttribute('neighbor-mines', neighborMines + 1);
    }

    const neighbors = [ {x: -1, y: -1}, {x: 0, y: -1}, {x: 1, y: -1},
        {x: -1, y:  0},                  {x: 1, y:  0},
        {x: -1, y:  1}, {x: 0, y:  1}, {x: 1, y:  1} ];

    function placeMines(difficulty) {
        console.log('PLACING MINES');
        mineCount = Math.floor(fieldWidth * fieldHeight * difficulty);
        document.getElementById('mine-count').innerText = mineCount;
        console.log('MINES:', mineCount);
        mines.clear();
        while (mines.size < mineCount) {
            const x = Math.floor(Math.random() * fieldWidth);
            const y = Math.floor(Math.random() * fieldHeight);
            if (mines.has(`${x}-${y}`)) { continue; }
            mines.add(`${x}-${y}`);
            const cell = document.getElementById(`cell_${x}-${y}`);
            cell.setAttribute('mine', true);
            // cell.classList.remove('obscurred');
            // cell.classList.add('revealed');
            neighbors.forEach((neighbor) => {
                incrementNeighborMine(x + neighbor.x, y + neighbor.y);
            });
        }

    }



    function revealNeigborCells(x, y) {
        const cell = document.getElementById(`cell_${x}-${y}`);
        cell.classList.remove('obscurred');
        cell.classList.add('revealed');
        revealedCells++;
        if (cell.getAttribute('neighbor-mines') > 0) {
            console.log("CELL HAS NEIGHBOR MINES:", cell)
            cell.innerText = cell.getAttribute('neighbor-mines');
        } else {
            console.log(`CELL NOT DOES HAVE NEIGHBOR MINES: ${x}  ${y}`, cell)
            neighbors.forEach((neighbor) => {
                const neighborX = parseInt(x) + neighbor.x;
                const neighborY = parseInt(y) + neighbor.y;
                if (neighborX < 0 || neighborX >= fieldWidth || neighborY < 0 || neighborY >= fieldHeight) {
                    return;
                }
                const neighborCell = document.getElementById(`cell_${neighborX}-${neighborY}`);
                if (neighborCell.classList.contains('revealed')) {
                    return;
                }
                // setTimeout( () => { revealNeigborCells(neighborX, neighborY) } , 50);
                revealNeigborCells(neighborX, neighborY);
            });
        }
    }


    function displayFlag(cell) {
        let mineCount = parseInt(document.getElementById('mine-count').innerText);

        if (cell.classList.contains('flag')) {
            cell.classList.remove('flag');
            cell.removeChild(cell.firstChild); // Add the image element as a child of the cell
            mineCount++;
        } else {
            const img = document.createElement('img');
            img.src = 'images/icon_flag.png';
            cell.classList.add('flag');
            cell.appendChild(img); // Add the image element as a child of the cell
            mineCount--;
        }
        document.getElementById('mine-count').innerText = mineCount;

    }

    function displayMine(cell) {
        const img = document.createElement('img');
        img.src = 'images/icon_mine.png';
        img.classList.add('mine');
        cell.appendChild(img); // Add the image element as a child of the cell
    }

    function displayAllMines() {
        console.log('DISPLAYING ALL MINES', mines);
        mines.forEach((mine) => {
            const [x, y] = mine.split('-');
            const cell = document.getElementById(`cell_${x}-${y}`);
            cell.classList.remove('obscurred');
            cell.classList.add('revealed');
            displayMine(cell);
        });
    }

    function revealCell(x, y) {
        const cell = document.getElementById(`cell_${x}-${y}`);
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
            revealNeigborCells(x, y);
        }
    }

    gameboard.addEventListener("contextmenu", (event) => {
        event.preventDefault();
        if (gameOver) {
            // message in the footer to user that game is over
            return;
        } else if (gameTimer === null) {
            startTimer();
        }
        cell = event.target;
        if (event.target.nodeName == 'img'.toUpperCase()) {
            console.log("grabbing parent")
            cell = event.target.parentElement;
        }
        displayFlag(cell);
        console.log(cell);

    })

    gameboard.addEventListener('click', (event) => {
        event.preventDefault();
        console.log('GAMEBOARD CLICKED')
        if (gameOver) {
            // message in the footer to user that game is over

            return;
        } else if (gameTimer === null) {
            startTimer();
        }
        cell = event.target;
        if (event.target.nodeName == 'img'.toUpperCase()) {
            console.log("grabbing parent")
            cell = event.target.parentElement;
        }
        console.log(cell);
        if (!cell.classList.contains('cell')) { return; }
        let x = cell.getAttribute('x');
        let y = cell.getAttribute('y');
        revealCell(x, y);
        if (cell.getAttribute('mine') === 'true') {
            gameOver = true;
            //clearInterval(gameTimer);
            console.log('returned from clearInterval');
            gameTimer = null;
            setTimeout(() => alert('You Lose'), 0);
        } else if (revealedCells === (fieldWidth * fieldHeight - mineCount)) {
            gameOver = true;
            gameTimer = null;
            setTimeout(() => alert('You Win'), 0);
        }
        console.log('revealedCells: ', revealedCells, "  mineCount: ", mineCount, "  gameOver: ", gameOver);

        // revealNeigborCells(cell.getAttribute('x'), cell.getAttribute('y'))
    });

    resetButton.addEventListener('click', (event) => {
        console.log('reset clicked');
        for (let x = 0 ; x < fieldWidth ; x++) {
            for (let y = 0 ; y < fieldHeight; y++) {
                const cell = document.getElementById(`cell_${x}-${y}`);
                cell.classList.remove('revealed');
                cell.classList.add('obscurred');
                cell.setAttribute('neighbor-mines', 0);
                cell.innerText = '';
                gameOver = false;
            }
        }
        placeMines(difficulty);
    })

     function startTimer() {
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

    placeMines(difficulty);

}) ()