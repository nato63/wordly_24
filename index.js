const searchForm = document.getElementById('searchForm');
const wordInput = document.getElementById('wordInput');
const searchBtn = document.querySelector('.search-form__btn');
const loadingMessage = document.getElementById('loadingMessage');
const errorContainer = document.getElementById('errorContainer');
const errorMessage = document.getElementById('errorMessage');
const resultsSection = document.getElementById('resultsSection');
const favoritesList = document.getElementById('favoritesList');
const favoritesEmpty = document.getElementById('favoritesEmpty');
const favoritesCount = document.getElementById('favoritesCount');

const wordDisplay = document.getElementById('wordDisplay');
const phoneticDisplay = document.getElementById('phoneticDisplay');
const playAudioBtn = document.getElementById('playAudioBtn');
const favoriteBtn = document.getElementById('favoriteBtn');
const meaningsList = document.getElementById('meaningsList');
const examplesContainer = document.getElementById('examplesContainer');
const examplesList = document.getElementById('examplesList');
const synonymsContainer = document.getElementById('synonymsContainer');
const synonymsList = document.getElementById('synonymsList');
const sourceLink = document.getElementById('sourceLink');

let currentWord = null;
let currentPhonetic = '';
let currentAudio = '';

document.addEventListener("DOMContentLoaded",()=>{
    displayFavorites();
});

searchForm.addEventListener ("submit", async (event) => {
    //if input is not equal equal to empty value should be empty or null
    wordInput.addEventListener('focus', () => {
    if (wordInput.value.trim() !== '') {
        wordInput.value = '';
    }
});
    event.preventDefault();

     const word = wordInput.value.trim().toLowerCase();

    if (word === '') {
        showError('Please enter a word.');
        return;
    }
    clearResults();
    loadingMessage.style.display ="flex";

     try {
        const response = await fetch(
            `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`
        );

        const data = await response.json();

        if (!response.ok) {
            showError('Word not found.');
            return;
        }

        displayWord(data[0]);

    } catch (error) {
        showError('Network error.');
    }

    loadingMessage.style.display = 'none';
});

function displayWord(data) {
    currentWord = data.word;
     currentPhonetic  = data.phonetic || '';

    wordDisplay.textContent = data.word;
    phoneticDisplay.textContent = currentPhonetic;

    wordDisplay.textContent = data.word;
    phoneticDisplay.textContent = currentPhonetic;

    currentAudio = '';

    if (data.phonetics) {
        for (let play of data.phonetics) {
            if (play.audio) {
                currentAudio = play.audio;
                break;
            }
        }
    }

    if (currentAudio) {
        playAudioBtn.style.display = 'inline-flex';
    } else {
        playAudioBtn.style.display = 'none';
    }

    
    data.meanings.forEach(meaning => {
        const heading = document.createElement('h4');
        heading.textContent = meaning.partOfSpeech;
        meaningsList.appendChild(heading);

        const list = document.createElement('ol');

        meaning.definitions.forEach(def => {
            const item = document.createElement('li');
            item.textContent = def.definition;
            list.appendChild(item);

            if (def.example) {
                examplesContainer.style.display = 'block';
                const p = document.createElement('p');
                p.textContent = def.example;
                examplesList.appendChild(p);
            }
        });

        meaningsList.appendChild(list);
    });

    // Synonym
    const allSynonyms = [];

    data.meanings.forEach(meaning => {
        if (meaning.synonyms) {
            allSynonyms.push(...meaning.synonyms);
        }
    });

    const uniqueSynonyms = [...new Set(allSynonyms)];

    if (uniqueSynonyms.length > 0) {
        synonymsContainer.style.display = 'block';

        uniqueSynonyms.forEach(word => {
            const tag = document.createElement('span');
            tag.textContent = word;
            synonymsList.appendChild(tag);
        });
    }

    updateFavoriteButton();
    resultsSection.style.display = 'block';
}

// Play audio
playAudioBtn.addEventListener('click', () => {
    if (!currentAudio) return;

    const audio = new Audio(currentAudio);
    audio.play();
});

function showError(message) {
    if(!message){
        errorContainer.style.display = "none";
        return;
    }
    errorMessage.textContent = message;
    errorContainer.style.display = "block";
    resultsSection.style.display = "block";
    loadingMessage.style.display = "none";
}

// Clear old results
function clearResults() {
    meaningsList.innerHTML = '';
    examplesList.innerHTML = '';
    synonymsList.innerHTML = '';

    examplesContainer.style.display = 'none';
    synonymsContainer.style.display = 'none';
    errorContainer.style.display = 'none';
}

function getFavorites() {
    return JSON.parse(localStorage.getItem('favorites')) || [];
}

function saveFavorite() {
    const favorites = getFavorites();

    const exists = favorites.some(item => {
        return item.word.toLowerCase() === currentWord.toLowerCase();
    });

    if (!exists) {
        favorites.push({
            word: currentWord,
            phonetic: currentPhonetic
        });

        localStorage.setItem('favorites', JSON.stringify(favorites));
    }

    displayFavorites();
    updateFavoriteButton();
}
function removeFavorite(word) {
    const favorites = getFavorites();

    const updatedFavorites = favorites.filter(item => {
        return item.word.toLowerCase() !== word.toLowerCase();
    });

    localStorage.setItem('favorites', JSON.stringify(updatedFavorites));

    displayFavorites();
    updateFavoriteButton();
}
function displayFavorites() {
    const favorites = getFavorites();

    favoritesList.innerHTML = '';
    favoritesCount.textContent = favorites.length;

    if (favorites.length === 0) {
        favoritesEmpty.style.display = 'block';
        return;
    }

    favoritesEmpty.style.display = 'none';

    favorites.forEach(fav => {
        // Create card
        const item = document.createElement('div');
        item.className = 'favorite-item';

        // Word info
        const info = document.createElement('div');

        const title = document.createElement('h3');
        title.className = 'favorite-item__word';
        title.textContent = fav.word;

        const phonetic = document.createElement('p');
        phonetic.className = 'favorite-item__phonetic';
        phonetic.textContent = fav.phonetic || '';

        info.appendChild(title);
        info.appendChild(phonetic);

        // Buttons container
        const actions = document.createElement('div');
        actions.className = 'favorite-item__actions';

        // Search Again button
        const searchBtn = document.createElement('button');
        searchBtn.className = 'favorite-search-btn';
        searchBtn.textContent = 'Search Again';

        searchBtn.addEventListener('click', () => {
            wordInput.value = fav.word;
            searchForm.requestSubmit();
        });

        // Remove button
        const removeBtn = document.createElement('button');
        removeBtn.className = 'favorite-remove-btn';
        removeBtn.textContent = 'Remove';

        removeBtn.addEventListener('click', () => {
            removeFavorite(fav.word);
        });

        actions.appendChild(searchBtn);
        actions.appendChild(removeBtn);

        item.appendChild(info);
        item.appendChild(actions);

        favoritesList.appendChild(item);
    });
}

// Favorite button
favoriteBtn.addEventListener('click', () => {
    const favorites = getFavorites();
    const exists = favorites.some(item => item.word === currentWord);

    if (exists) {
        removeFavorite(currentWord);
    } else {
        saveFavorite();
    }
});

function updateFavoriteButton() {
    const favorites = getFavorites();
    const exists = favorites.some(item => item.word === currentWord);

    if (exists) {
        favoriteBtn.textContent = '⭐️';
        favoriteBtn.classList.add('saved');
    } else {
        favoriteBtn.textContent = '❤️';
        favoriteBtn.classList.remove('saved');
    }
}