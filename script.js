

const API_URL = 'http://localhost:3000/movies';

const movieListDiv = document.getElementById('movie-list');
const searchInput = document.getElementById('search-input');
const form = document.getElementById('add-movie-form');

let allMovies = [];


function renderMovies(moviesToDisplay) {
    movieListDiv.innerHTML = '';

    if (!moviesToDisplay || moviesToDisplay.length === 0) {
        const msg = document.createElement('p');
        msg.textContent = 'No movies found matching your criteria.';
        msg.classList.add('empty-message');
        movieListDiv.appendChild(msg);
        return;
    }

    moviesToDisplay.forEach(movie => {
        const movieElement = document.createElement('div');
        movieElement.classList.add('movie-item');

        const info = document.createElement('div');
        info.classList.add('movie-info');
        info.innerHTML = `<strong>${movie.title}</strong> (${movie.year}) - ${movie.genre}`;

        const actions = document.createElement('div');
        actions.classList.add('movie-actions');

        const editBtn = document.createElement('button');
        editBtn.textContent = 'Edit';
        editBtn.classList.add('btn', 'secondary');
        editBtn.addEventListener('click', () => {
            editMoviePrompt(movie.id, movie.title, movie.year, movie.genre);
        });

        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'Delete';
        deleteBtn.classList.add('btn', 'danger');
        deleteBtn.addEventListener('click', () => {
            deleteMovie(movie.id);
        });

        actions.appendChild(editBtn);
        actions.appendChild(deleteBtn);

        movieElement.appendChild(info);
        movieElement.appendChild(actions);

        movieListDiv.appendChild(movieElement);
    });
}

function fetchMovies() {
    fetch(API_URL)
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to fetch movies');
            }
            return response.json();
        })
        .then(movies => {
            allMovies = movies;
            renderMovies(allMovies);
        })
        .catch(error => {
            console.error('Error fetching movies:', error);
            movieListDiv.innerHTML = '<p class="empty-message">Error loading movies. Check the server.</p>';
        });
}


fetchMovies();

searchInput.addEventListener('input', function () {
    const searchTerm = searchInput.value.toLowerCase();

    const filteredMovies = allMovies.filter(movie => {
        const titleMatch = movie.title.toLowerCase().includes(searchTerm);
        const genreMatch = (movie.genre || '').toLowerCase().includes(searchTerm);
        return titleMatch || genreMatch;
    });

    renderMovies(filteredMovies);
});

form.addEventListener('submit', function (event) {
    event.preventDefault();

    const newMovie = {
        title: document.getElementById('title').value.trim(),
        genre: document.getElementById('genre').value.trim(),
        year: parseInt(document.getElementById('year').value)
    };

    if (!newMovie.title || !newMovie.year) {
        alert('Title and year are required.');
        return;
    }

    fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newMovie),
    })
        .then(response => {
            if (!response.ok) throw new Error('Failed to add movie');
            return response.json();
        })
        .then(() => {
            form.reset();
            fetchMovies();
        })
        .catch(error => console.error('Error adding movie:', error));
});

function editMoviePrompt(id, currentTitle, currentYear, currentGenre) {
    const newTitle = prompt('Enter new Title:', currentTitle);
    if (!newTitle) return;

    const newYearStr = prompt('Enter new Year:', currentYear);
    if (!newYearStr) return;

    const newGenre = prompt('Enter new Genre:', currentGenre || '');
    if (newGenre === null) return;

    const updatedMovie = {
        id: id,
        title: newTitle.trim(),
        year: parseInt(newYearStr),
        genre: newGenre.trim()
    };

    if (!updatedMovie.title || !updatedMovie.year) {
        alert('Title and year are required.');
        return;
    }

    updateMovie(id, updatedMovie);
}


function updateMovie(movieId, updatedMovieData) {
    fetch(`${API_URL}/${movieId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedMovieData),
    })
        .then(response => {
            if (!response.ok) throw new Error('Failed to update movie');
            return response.json();
        })
        .then(() => {
            fetchMovies();
        })
        .catch(error => console.error('Error updating movie:', error));
}


function deleteMovie(movieId) {
    if (!confirm('Are you sure you want to delete this movie?')) return;

    fetch(`${API_URL}/${movieId}`, {
        method: 'DELETE',
    })
        .then(response => {
            if (!response.ok) throw new Error('Failed to delete movie');
            fetchMovies();
        })
        .catch(error => console.error('Error deleting movie:', error));
}

