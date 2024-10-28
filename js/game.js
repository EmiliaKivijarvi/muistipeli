const accessKey = 'xxxxxxAPI-AVAINxxxxxx'; // LAITA TÄHÄN API-AVAIN
const totalPairs = 8;

// Seuraavassa haetaan kuvat muistipeliä varten, jokainen kuva tulee kahdesti.
const fetchGameImages = async () => {
    try {
        const response = await fetch(`https://api.unsplash.com/photos/random?query=plants&count=${totalPairs}&orientation=portrait&client_id=${accessKey}`);
        const data = await response.json();

        const images = [];
        data.forEach(photo => {
            const imageUrl = `${photo.urls.raw}&w=400&h=400&fit=crop`;
            images.push(imageUrl, imageUrl);
        });

        shuffle(images);
        createCards(images);

    } catch (error) {
        console.error("Muistipelin kuvien haku epäonnistui:", error);
    }
};


// Luodaan kuvakortit muistipeliin, kortin toinen puoli on yksivärinen ja toiselle puolelle tulee kuva.
const createCards = (images) => {
    const board = document.querySelector('.board');
    images.forEach((image, index) => {
        const card = document.createElement('div');
        card.classList.add('memory-card');
        card.setAttribute('data-id', index);

        const cardBack = document.createElement('div');
        cardBack.classList.add('memory-card-back');
        const img = document.createElement('img');
        img.src = image;
        img.alt = 'Kasvikuva';
        cardBack.appendChild(img);

        const cardFront = document.createElement('div');
        cardFront.classList.add('memory-card-front');

        card.appendChild(cardBack);
        card.appendChild(cardFront);

        board.appendChild(card);
    });
    attachEventListeners();
};

// Korttien sekoittaminen laudalla
function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

const selectors = {
    boardContainer: document.querySelector('.board-container'),
    boardOverlay: document.querySelector('.board-overlay'),
    moves: document.querySelector('.moves'),
    time: document.querySelector('.timer'),
    start: document.querySelector('.start'),
    stop: document.querySelector('.stop'),
    win: document.querySelector('.win')
}

const state = {
    gameStarted: false,
    paused: false,
    flippedCards: 0,
    totalFlips: 0,
    totalTime: 0,
    loop: null
}

const startGame = () => {
    selectors.start.classList.add('disabled');
    selectors.stop.classList.remove('disabled');
    selectors.boardOverlay.classList.remove('active');

    if (!state.gameStarted || state.paused) {
        state.gameStarted = true;
        state.paused = false;

        state.loop = setInterval(() => {
            state.totalTime++;
            selectors.moves.innerText = `Siirrot: ${state.totalFlips}`;
            selectors.time.innerText = `Aika: ${state.totalTime} sec`;
        }, 1000);
    }
};

const stopGame = () => {
    if (state.gameStarted) {
        clearInterval(state.loop);
        state.paused = true;
        selectors.stop.classList.add('disabled');
        selectors.start.classList.remove('disabled');
        selectors.boardOverlay.classList.add('active');
    }
};

const flipBackCards = () => {
    document.querySelectorAll('.memory-card:not(.matched)').forEach(card => {
        card.classList.remove('flipped');
    });

    state.flippedCards = 0;
}

// Logiikka korttien kääntämiseen
const flipCard = (card) => {
    state.flippedCards++;
    state.totalFlips++;

    if (!state.gameStarted) {
        startGame();
    }

    if (state.flippedCards <= 2) {
        card.classList.add('flipped');
    }

    if (state.flippedCards === 2) {
        const flippedCards = document.querySelectorAll('.flipped:not(.matched)');
        if (flippedCards[0].querySelector('.memory-card-back img').src === flippedCards[1].querySelector('.memory-card-back img').src) {
            flippedCards[0].classList.add('matched');
            flippedCards[1].classList.add('matched');
        }

        setTimeout(() => {
            flipBackCards();
        }, 1000);

        if (!document.querySelectorAll('.memory-card:not(.flipped)').length) {
            setTimeout(() => {
                selectors.boardContainer.classList.add('flipped');

                selectors.win.style.display = 'flex';
                selectors.win.innerHTML = `
                <span class="win-text">
                    Voitit pelin! <br />
                    Käytit <span class="win-score">${state.totalFlips}</span> siirtoa ja aikaa sinulla meni <span class="win-time">${state.totalTime}</span> sekuntia.
                </span>`;
                clearInterval(state.loop);
            }, 1000);
        }

    }
};

const attachEventListeners = () => {
    document.addEventListener('click', (event) => {
        const eventTarget = event.target;
        const eventParent = eventTarget.closest('.memory-card');
        if (eventParent && !eventParent.classList.contains('flipped')) {
            flipCard(eventParent);
        } else if (eventTarget.nodeName === 'BUTTON' && eventTarget.classList.contains('start')) {
            startGame();
        } else if (eventTarget.nodeName === 'BUTTON' && eventTarget.classList.contains('stop')) {
            stopGame();
        }
    });
};


fetchGameImages();
attachEventListeners();