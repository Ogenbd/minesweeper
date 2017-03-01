'use strict';

var gBoard = [];
var gLevel = { size: 8, mines: 10 };
var gCountMarked = 0;
var gInterval;
var gTimePassed;
const gState = {

}


// this runs upon loading index.html
function initiate() {
    gBoard = [];
    if (gInterval) clearInterval(gInterval)
    gInterval = undefined;
    var elTimer = document.querySelector('.timer');
    elTimer.innerText = '0';
    var elGameEnd = document.querySelector('.gameEnd');
    elGameEnd.innerText = '';    
    gCountMarked = 0;
    gTimePassed = 0;
    buildBoard();
    placeMines();
    renderBoard();
    var elMineAmount = document.querySelector('.mineamount');
    elMineAmount.innerText = (gLevel.mines-gCountMarked);
}

// builds the game board
function buildBoard() {
    for (var i = 0; i < gLevel.size; i++) {
        var row = [];
        for (var j = 0; j < gLevel.size; j++) {
            row[j] = {isMine: false, isMarked: false, isShown: false, neighCount: 0 };
        }
        gBoard.push(row);
    }
}
    // places mines randomly and makes sure mines wont get placed in the same cell
function placeMines(){   
    var mineCount = 0;
    while (mineCount < gLevel.mines) {
        var currLoc = [getRandomInt(0, gBoard.length - 1), getRandomInt(0, gBoard.length - 1)]
        if (gBoard[currLoc[0]][currLoc[1]].isMine) continue;        
        else {
            gBoard[currLoc[0]][currLoc[1]].isMine = true;
            mineCount++;
        }
    }
    gBoard.forEach(function (row, i) {
        row.forEach(function (cell, j) {
            countNeighs(gBoard, i, j)
        });
    });
}
// builds the board in HTML
function renderBoard() {
    var strHtml = '';
    gBoard.forEach(function (row, i) {
        strHtml += '<tr>';
        row.forEach(function (cell, j) {
            var tdId = 'cell-' + i + '-' + j;
            strHtml += '<td class="cell hidden num'+ gBoard[i][j].neighCount +'" id="' + tdId + '" onclick="cellClicked(this,' + i + ',' + j + ')" oncontextmenu="cellRightClicked(this,' + i + ',' + j + ');return false;"></td>';
        });
        strHtml += '</tr>';
    });
    var elHtmlBoard = document.querySelector('.gameBoard');
    elHtmlBoard.innerHTML = strHtml;
}
// counts cells neighboring mines
function countNeighs(board, cellI, cellJ) {
    for (var i = cellI - 1; i <= cellI + 1; i++) {
        for (var j = cellJ - 1; j <= cellJ + 1; j++) {
            if (i === cellI && j === cellJ) continue;
            if (i < 0 || i > board.length - 1) continue;
            if (j < 0 || j > board[0].length - 1) continue;
            if (board[i][j].isMine) board[cellI][cellJ].neighCount++;
        }
    }
}
// when cell is leftclicked
function cellClicked(elCell, i, j) {
    if (!gInterval) {
        gInterval = setInterval(function () {
            gTimePassed++;
            updateTime();
            
        }, 100)        
    }
    if (!gBoard[i][j].isShown && !gBoard[i][j].isMarked) {
        elCell.classList.remove('hidden');
        gBoard[i][j].isShown = true;
        if(gBoard[i][j].neighCount > 0) elCell.innerText = gBoard[i][j].neighCount;
        if (gBoard[i][j].isMine) gameOver();
        else if(gBoard[i][j].neighCount === 0) {
            expandShown(i, j);
        }
        else checkIfWin();
    }
}

// updates timer
function updateTime() {
    var elTimer = document.querySelector('.timer');
    elTimer.innerText = gTimePassed/10;
}

// shows non mine spots up to 2 cells around
function expandShown(cellI, cellJ){
    for (var i = cellI - 1; i <= cellI + 1; i++) {
        for (var j = cellJ - 1; j <= cellJ + 1; j++) {
            if (i < 0 || i > gBoard.length - 1) continue;
            if (j < 0 || j > gBoard[i].length - 1) continue;
            if (!gBoard[i][j].isShown) {
                var elCell = document.querySelector('#cell-' + i + '-' + j)
                cellClicked(elCell, i ,j);
            }
        }
    }
}
// marks and demarks cells
function cellRightClicked(elCell, i, j){
    if(gBoard[i][j].isShown) return;
    
    var diffMarked = 1;
    
    if(!gBoard[i][j].isMarked) {
          elCell.classList.remove('hidden');
          elCell.classList.add('marked');
    } 
    else {
        elCell.classList.remove('marked');
        elCell.classList.add('hidden');
        diffMarked = -1;
    }
    
    gBoard[i][j].isMarked = !gBoard[i][j].isMarked;
    gCountMarked += diffMarked;
    var elMineAmount = document.querySelector('.mineamount');
    elMineAmount.innerText = gLevel.mines-gCountMarked;
    checkIfWin();
    
}
// checks if player hit a mine and shows player the board if he has hit a mine
function gameOver(){
    var elGameEnd = document.querySelector('.gameEnd');
    elGameEnd.innerText = 'Game Over! You Lose! Pick a difficulty to start over.'
    clearInterval(gInterval)
    for (var i = 0; i < gLevel.size; i++) {
        for (var j = 0; j < gLevel.size; j++) {
            gBoard[i][j].isShown = true;
            if (gBoard[i][j].isMine && !gBoard[i][j].isMarked) {
                var elCell = document.querySelector('#cell-' + i + '-' + j);
                elCell.classList.remove('hidden');
                elCell.innerHTML = '<td>&#128165;</td>'
                // elCell.innerText = '💥';
            }
        }
    }
}

// checks to see if winning conditions are met
function checkIfWin(){
    var countShown = 0;
    var countCorrect = 0;
    gBoard.forEach(function (row) {
        row.forEach(function (cell) {
            if(cell.isMarked && cell.isMine) countCorrect++
            if(cell.isShown) countShown++
        });
    });
    if(countCorrect === gLevel.mines && gCountMarked === gLevel.mines || countShown === gLevel.size*gLevel.size-gLevel.mines) {
        for (var i = 0; i < gLevel.size; i++) {
            for (var j = 0; j < gLevel.size; j++) {
                gBoard[i][j].isShown = true;
            }
        }
        var elGameEnd = document.querySelector('.gameEnd');
        elGameEnd.innerText = 'Congratulations! You Win!! Pick a difficulty to start over.'
        clearInterval(gInterval)
    }
}

function diffcultyBtnClicked(elBtn){

    var levels = {
        Beginner: { size: 8, mines: 10 },
        Intermediate: { size: 16, mines: 40 },
        Expert: { size: 22, mines: 99 }
    }
    var chosenLevel = elBtn.innerHTML;
    gLevel = levels[chosenLevel];
    initiate();
}

function customClicked(){
    gLevel.size = +prompt('enter custom board size');
    while (gLevel.size <=0 || gLevel.size % 1 !== 0) {
        gLevel.size = +prompt('enter custom board size. board size must be a positive integer.');
    }
    gLevel.mines = +prompt('enter mine amount');
    while (gLevel.mines > gLevel.size*gLevel.size || gLevel.mines < 0 || gLevel.mines % 1 !== 0) {
        gLevel.mines = +prompt('enter mine amount. mine amount cannot exceed total board size.');
    }    
    initiate();
}


