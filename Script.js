const API_TOKEN = "eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI4YTZhYWE3OWY1ZGY3NzU4MDMxNTQxZDMzNDI0ZDBlOSIsIm5iZiI6MTc3MTMwMzM0MC40OTcsInN1YiI6IjY5OTNmMWFjNmQ2Y2NmMzgzNDFhZmFiOCIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.tAiPgZg4TARj_SVd73uL22CJXj0cUb_gCtPrxWpJo8w";
let seriesList = JSON.parse(localStorage.getItem('mySeries')) || [];

async function searchSeries() {
    const query = document.getElementById('searchInput').value;
    if (!query) return;

    const res = await fetch(`https://api.themoviedb.org/3/search/tv?query=${query}&language=es-AR`, {
        headers: { Authorization: `Bearer ${API_TOKEN}` }
    });
    const data = await res.json();
    const container = document.getElementById('results');
    container.innerHTML = '';

    data.results.slice(0, 4).forEach(show => {
        const div = document.createElement('div');
        div.className = "glass-card p-4 text-center";
        div.innerHTML = `
            <img src="https://image.tmdb.org/t/p/w200${show.poster_path}" class="poster-img mx-auto mb-3">
            <h3 class="text-sm font-bold mb-2 h-10 overflow-hidden">${show.name}</h3>
            <button onclick='addSeries(${JSON.stringify(show).replace(/'/g, "&apos;")})' 
                class="btn-add w-full py-1 rounded-full text-xs font-bold">AGREGAR</button>
        `;
        container.appendChild(div);
    });
}

function addSeries(show) {
    if (!seriesList.some(s => s.id === show.id)) {
        seriesList.push({
            id: show.id,
            name: show.name,
            poster: show.poster_path,
            rating: 5,
            comment: "",
            status: "Pendiente"
        });
        localStorage.setItem('mySeries', JSON.stringify(seriesList));
        renderList();
    }
}

function renderList() {
    const container = document.getElementById('myList');
    container.innerHTML = '';
    seriesList.forEach((show, i) => {
        const div = document.createElement('div');
        div.className = "glass-card p-4 flex gap-4 items-center animate-fade-in";
        div.innerHTML = `
            <img src="https://image.tmdb.org/t/p/w200${show.poster}" class="w-20 poster-img">
            <div class="flex-1">
                <div class="flex justify-between items-start">
                    <h3 class="font-bold text-blue-400">${show.name}</h3>
                    <button onclick="removeShow(${i})" class="text-gray-500 hover:text-red-500 text-xl">×</button>
                </div>
                <div class="grid grid-cols-2 gap-2 mt-2">
                    <select onchange="updateShow(${i}, 'status', this.value)" class="text-xs p-1 rounded">
                        <option ${show.status==='Pendiente'?'selected':''}>Pendiente</option>
                        <option ${show.status==='Viendo'?'selected':''}>Viendo</option>
                        <option ${show.status==='Terminada'?'selected':''}>Terminada</option>
                    </select>
                    <input type="number" value="${show.rating}" min="0" max="10" 
                        onchange="updateShow(${i}, 'rating', this.value)" class="text-xs p-1 rounded text-center">
                </div>
                <textarea onchange="updateShow(${i}, 'comment', this.value)" 
                    class="w-full mt-2 text-xs p-2 rounded h-12 bg-transparent" placeholder="Notas...">${show.comment}</textarea>
            </div>
        `;
        container.appendChild(div);
    });
}

function updateShow(i, field, val) {
    seriesList[i][field] = val;
    localStorage.setItem('mySeries', JSON.stringify(seriesList));
}

function removeShow(i) {
    seriesList.splice(i, 1);
    localStorage.setItem('mySeries', JSON.stringify(seriesList));
    renderList();
}

window.onload = renderList;
