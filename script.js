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
        div.style.animationDelay = `${index * 0.1}s`;
        div.innerHTML = `
            <img src="https://image.tmdb.org/t/p/w200${show.poster_path}" class="poster-img mx-auto mb-3 shadow-2xl">
            <h3 class="text-xs font-bold mb-1 uppercase tracking-wider h-8 overflow-hidden">${show.name}</h3>
            <p class="text-[10px] text-yellow-500 mb-2">⭐ TMDB: ${show.vote_average.toFixed(1)}</p>
            <button onclick='addSeries(${JSON.stringify(show).replace(/'/g, "&apos;")})' 
                class="btn-add w-full py-2 rounded-full text-[10px] font-black tracking-widest text-white">AGREGAR</button>
        `;
        container.appendChild(div);
    });
}

async function addSeries(show) {
    if (!seriesList.some(s => s.id === show.id)) {
        // Obtenemos info extendida antes de guardar
        const detailRes = await fetch(`https://api.themoviedb.org/3/tv/${show.id}?language=es-AR&append_to_response=credits`, {
            headers: { Authorization: `Bearer ${API_TOKEN}` }
        });
        const details = await detailRes.json();
        
        seriesList.unshift({
            id: show.id,
            name: show.name,
            poster: show.poster_path,
            rating: 5,
            tmdb_rating: show.vote_average,
            overview: show.overview,
            genres: details.genres.map(g => g.name).join(', '),
            seasons: details.number_of_seasons,
            episodes: details.number_of_episodes,
            cast: details.credits.cast.slice(0, 10).map(a => a.name).join(', '),
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
        div.className = "glass-card p-4 flex flex-col gap-4 animate-fade-in mb-4";
        div.innerHTML = `
            <div class="flex gap-4">
                <img src="https://image.tmdb.org/t/p/w200${show.poster}" class="w-24 h-36 object-cover poster-img shadow-lg">
                <div class="flex-1">
                    <div class="flex justify-between items-start">
                        <h3 class="font-bold text-blue-400 text-lg uppercase leading-tight">${show.name}</h3>
                        <button onclick="removeShow(${i})" class="text-gray-500 hover:text-red-500 text-2xl">×</button>
                    </div>
                    <p class="text-[10px] text-gray-500 mb-2 uppercase tracking-tighter">${show.genres} | ${show.seasons} Temp.</p>
                    
                    <div class="flex gap-2 mb-3">
                        <select onchange="updateShow(${i}, 'status', this.value)" class="bg-gray-800 text-[10px] p-2 rounded-lg border-none outline-none flex-1">
                            <option ${show.status==='Pendiente'?'selected':''}>Pendiente</option>
                            <option ${show.status==='Viendo'?'selected':''}>Viendo</option>
                            <option ${show.status==='Terminada'?'selected':''}>Terminada</option>
                        </select>
                        <div class="flex items-center bg-gray-800 px-3 rounded-lg">
                            <span class="text-[10px] mr-2 text-yellow-500">MI NOTA:</span>
                            <input type="number" value="${show.rating}" min="0" max="10" 
                                onchange="updateShow(${i}, 'rating', this.value)" 
                                class="bg-transparent text-xs w-8 text-center border-none focus:ring-0">
                        </div>
                    </div>
                </div>
            </div>

            <details class="group">
                <summary class="list-none cursor-pointer text-center text-[10px] text-blue-500 font-bold tracking-widest uppercase hover:text-blue-300 transition-colors">
                    <span class="group-open:hidden">▼ Ver más info y reparto</span>
                    <span class="hidden group-open:block">▲ Cerrar info</span>
                </summary>
                <div class="mt-4 text-xs space-y-3 animate-fade-in bg-black/20 p-4 rounded-xl">
                    <p class="text-gray-300 leading-relaxed"><strong class="text-white">Sinopsis:</strong> ${show.overview || 'Sin descripción.'}</p>
                    <p class="text-gray-400"><strong class="text-white">Reparto:</strong> ${show.cast}</p>
                    <p class="text-gray-400"><strong class="text-white">Total episodios:</strong> ${show.episodes}</p>
                    <textarea onchange="updateShow(${i}, 'comment', this.value)" 
                        class="w-full bg-gray-900/50 p-3 rounded-lg text-xs h-20 border-none focus:ring-1 focus:ring-blue-500 mt-2" 
                        placeholder="Mis notas personales...">${show.comment}</textarea>
                </div>
            </details>
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
