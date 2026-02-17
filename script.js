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

    data.results.slice(0, 4).forEach((show, index) => {
        const div = document.createElement('div');
        div.className = "glass-card p-4 text-center animate-fade-in";
        div.style.animationDelay = `${index * 0.1}s`; // Aparición escalonada
        div.innerHTML = `
            <img src="https://image.tmdb.org/t/p/w200${show.poster_path}" class="poster-img mx-auto mb-3 shadow-2xl">
            <h3 class="text-xs font-bold mb-3 h-8 overflow-hidden uppercase tracking-wider">${show.name}</h3>
            <button onclick='addSeries(${JSON.stringify(show).replace(/'/g, "&apos;")})' 
                class="btn-add w-full py-2 rounded-full text-[10px] font-black tracking-widest text-white">AGREGAR</button>
        `;
        container.appendChild(div);
    });
}

function addSeries(show) {
    if (!seriesList.some(s => s.id === show.id)) {
        seriesList.unshift({ // unshift para que aparezca arriba de todo
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
        div.className = "glass-card p-4 flex gap-4 items-center animate-fade-in mb-4";
        div.innerHTML = `
            <img src="https://image.tmdb.org/t/p/w200${show.poster}" class="w-20 poster-img shadow-lg">
            <div class="flex-1">
                <div class="flex justify-between items-center mb-1">
                    <h3 class="font-bold text-blue-400 text-sm uppercase">${show.name}</h3>
                    <button onclick="removeShow(${i})" class="text-gray-500 hover:text-red-500 text-2xl transition-colors">×</button>
                </div>
                <div class="flex gap-2 mb-2">
                    <select onchange="updateShow(${i}, 'status', this.value)" class="bg-gray-800 text-[10px] p-2 rounded-lg border-none outline-none flex-1">
                        <option ${show.status==='Pendiente'?'selected':''}>Pendiente</option>
                        <option ${show.status==='Viendo'?'selected':''}>Viendo</option>
                        <option ${show.status==='Terminada'?'selected':''}>Terminada</option>
                    </select>
                    <div class="flex items-center bg-gray-800 px-2 rounded-lg">
                        <span class="text-[10px] mr-1 text-yellow-500">⭐</span>
                        <input type="number" value="${show.rating}" min="0" max="10" 
                            onchange="updateShow(${i}, 'rating', this.value)" 
                            class="bg-transparent text-xs w-8 text-center border-none focus:ring-0">
                    </div>
                </div>
                <textarea onchange="updateShow(${i}, 'comment', this.value)" 
                    class="w-full bg-gray-800/50 p-2 rounded-lg text-xs h-14 border-none focus:ring-1 focus:ring-blue-500" 
                    placeholder="Escribe tu reseña aquí...">${show.comment}</textarea>
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
