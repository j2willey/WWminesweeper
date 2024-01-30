(() => {
    const fieldHeight = 100;
    const fieldWidth  = 30;
    // difficulty is the percentage of cells that are mines (easy = 10%, medium = 15%, hard = 20%)
    const difficulty = 0.1;

    console.log('LOADING GAME')
    const gameboard = document.getElementById('gameboard');
    const resetButton = document.getElementById('restart');
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
        const count = Math.floor(fieldWidth * fieldHeight * difficulty);
        // update the mine-count in the document with the count
        document.getElementById('mine-count').innerText = count;
        const mines = new Set();
        console.log('MINES:', count)
        while (mines.size < count) {
            const x = Math.floor(Math.random() * fieldWidth);
            const y = Math.floor(Math.random() * fieldHeight);
            mines.add(`${x}-${y}`);
            const cell = document.getElementById(`cell_${x}-${y}`);
            cell.setAttribute('mine', true);
            console.log(x, y)
            neighbors.forEach((neighbor) => {
                incrementNeighborMine(x + neighbor.x, y + neighbor.y);
            });
        }

    }



    function revealNeigborCells(x, y) {
        const cell = document.getElementById(`cell_${x}-${y}`);
        cell.classList.remove('obscurred');
        cell.classList.add('revealed');
        if (cell.getAttribute('neighbor-mines') > 0) {
            console.log("CELL HAS NEIGHBOR MINES:", cell)
            cell.innerText = cell.getAttribute('neighbor-mines');
            // const img = cell.children[0];
            // img.style.display = 'block';
            // img.classList.remove('mine');
            // img.classList.add('mine-revealed');
        } else {
            console.log(`CELL DOES HAVE NEIGHBOR MINES: ${x}  ${y}`, cell)
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

    function revealCell(x, y) {
        const cell = document.getElementById(`cell_${x}-${y}`);
        cell.classList.remove('obscurred');
        cell.classList.add('revealed');
        if (cell.getAttribute('mine') === 'true') {
            const img = document.createElement('img');
            img.src = 'images/icon_mine.png';
            img.classList.add('mine');
            cell.appendChild(img);
        } else if (cell.getAttribute('neighbor-mines') > 0) {
            cell.innerText = cell.getAttribute('neighbor-mines');
        } else {
            revealNeigborCells(x, y);
        }
    }


    let visitedCells;

    gameboard.addEventListener('click', (event) => {
        console.log('GAMEBOARD CLICKED')
        cell = event.target;
        console.log(cell);
        if (!cell.classList.contains('cell')) { return; }
        visitedCells = new Set();
         let x = cell.getAttribute('x');
         let y = cell.getAttribute('y');
        revealCell(x, y);
        if (cell.getAttribute('mine') === 'true') {
            alert('You Lose');
            return;
        }
        // revealNeigborCells(cell.getAttribute('x'), cell.getAttribute('y'))
    });

    resetButton.addEventListener('click', (event) => {
        console.log('reset clicked');
        for (let x = 0 ; x < fieldWidth ; x++) {
            for (let y = 0 ; y < fieldHeight; y++) {
                const cell = document.getElementById(`cell${x}-${y}`);
                cell.classList.remove('revealed');
                cell.classList.add('obscurred');
            }
        }
    })

    console.log('PLACING MINES')
    placeMines(difficulty);

}) ()