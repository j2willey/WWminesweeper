(() => {
    console.log('Hi Mom');
    const fieldHeight = 8;
    const fieldWidth  = 8

    const gameboard = document.getElementById('gameboard');
    console.log(gameboard);
    gameboard.setAttribute('rows', fieldHeight);
    gameboard.setAttribute('rows', fieldWidth);
    for (let x = 0 ; x < fieldWidth ; x++) { 
        for (let y = 0 ; y < fieldWidth; y++) {
            const cell = document.createElement('div');
            cell.setAttribute('id', `cell${x}-${y}`);
            cell.classList.add('cell');
            cell.classList.add(`obscurred`);
            cell.innerText=('X');
            gameboard.appendChild(cell);
        } 
    }


}) ()