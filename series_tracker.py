import streamlit as st
import requests
import pandas as pd

# CONFIGURACIÓN - Tu API Token ya está integrado
TMDB_API_TOKEN = "eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI4YTZhYWE3OWY1ZGY3NzU4MDMxNTQxZDMzNDI0ZDBlOSIsIm5iZiI6MTc3MTMwMzM0MC40OTcsInN1YiI6IjY5OTNmMWFjNmQ2Y2NmMzgzNDFhZmFiOCIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.tAiPgZg4TARj_SVd73uL22CJXj0cUb_gCtPrxWpJo8w"
BASE_URL = "https://api.themoviedb.org/3"

st.set_page_config(page_title="Series Tracker", page_icon="📺", layout="wide")

# Inicializar la base de datos en la sesión
if 'my_list' not in st.session_state:
    st.session_state.my_list = []

def search_series(query):
    headers = {"Authorization": f"Bearer {TMDB_API_TOKEN}"}
    try:
        response = requests.get(f"{BASE_URL}/search/tv", headers=headers, params={"query": query, "language": "es-AR"})
        return response.json().get('results', [])
    except:
        return []

# --- INTERFAZ ---
st.title("📺 Mi Tracker de Series")

# Buscador principal
search_query = st.text_input("Buscar una serie para agregar...", placeholder="Ej: Breaking Bad, Succession...")

if search_query:
    results = search_series(search_query)
    if results:
        st.write("### Resultados")
        cols = st.columns(4)
        for idx, show in enumerate(results[:4]):
            with cols[idx]:
                path = show.get('poster_path')
                if path:
                    st.image(f"https://image.tmdb.org/t/p/w300{path}")
                st.write(f"**{show['name']}**")
                
                if st.button("➕ Agregar", key=f"btn_{show['id']}"):
                    if not any(item['id'] == show['id'] for item in st.session_state.my_list):
                        st.session_state.my_list.append({
                            "id": show['id'],
                            "titulo": show['name'],
                            "puntaje": 5,
                            "comentario": "",
                            "estado": "Pendiente",
                            "poster": path
                        })
                        st.success("¡Agregada!")
    else:
        st.warning("No se encontraron resultados.")

st.divider()

# --- GESTIÓN DE LA LISTA ---
tab1, tab2 = st.tabs(["🍿 Mi Lista Personal", "📊 Exportar Datos"])

with tab1:
    if not st.session_state.my_list:
        st.info("Aún no has agregado series. Usa el buscador de arriba.")
    else:
        # Filtro por estado
        filtro = st.radio("Ver:", ["Todas", "Viendo", "Terminada", "Pendiente"], horizontal=True)
        
        for i, item in enumerate(st.session_state.my_list):
            if filtro == "Todas" or item['estado'] == filtro:
                with st.expander(f"{item['titulo']} - {item['estado']} (⭐ {item['puntaje']})"):
                    c1, c2 = st.columns([1, 4])
                    with c1:
                        if item['poster']:
                            st.image(f"https://image.tmdb.org/t/p/w200{item['poster']}")
                    with c2:
                        col_a, col_b = st.columns(2)
                        with col_a:
                            st.session_state.my_list[i]['estado'] = st.selectbox(
                                "Estado", ["Pendiente", "Viendo", "Terminada"], 
                                index=["Pendiente", "Viendo", "Terminada"].index(item['estado']),
                                key=f"est_{item['id']}"
                            )
                        with col_b:
                            st.session_state.my_list[i]['puntaje'] = st.slider(
                                "Mi puntaje", 0, 10, item['puntaje'], key=f"score_{item['id']}"
                            )
                        
                        st.session_state.my_list[i]['comentario'] = st.text_area(
                            "Comentarios o notas:", item['comentario'], key=f"com_{item['id']}"
                        )
                        
                        if st.button("🗑️ Eliminar", key=f"del_{item['id']}"):
                            st.session_state.my_list.pop(i)
                            st.rerun()

with tab2:
    if st.session_state.my_list:
        df = pd.DataFrame(st.session_state.my_list)
        st.dataframe(df[["titulo", "estado", "puntaje", "comentario"]])
        st.download_button("Descargar Backup (CSV)", df.to_csv(index=False), "mis_series.csv")
