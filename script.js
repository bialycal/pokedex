const API_URL = "https://pokeapi.co/api/v2/pokemon/?offset=20&limit=100";
const pokemonContainer = document.getElementById("pokemon-container");
const searchInput = document.getElementById("search-input");

let allPokemonData = [];

// Obtener la lista inicial de Pokémon
async function fetchPokemonList() {
  try {
    const response = await fetch(API_URL);
    const data = await response.json();
    
    // La primera API solo da nombres y URLs. Obtenemos los detalles de cada uno en paralelo:
    const detailPromises = data.results.map(pokemon => fetch(pokemon.url).then(res => res.json()));
    allPokemonData = await Promise.all(detailPromises);
    
    renderPokemon(allPokemonData);
  } catch (error) {
    console.error("Error al cargar los Pokémon:", error);
    pokemonContainer.innerHTML = "<p>Error al cargar los datos.</p>";
  }
}

// Renderizar las tarjetas en el DOM
function renderPokemon(pokemonArray) {
  pokemonContainer.innerHTML = "";
  
  pokemonArray.forEach(pokemon => {
    const card = document.createElement("div");
    card.classList.add("card");
    
    const sprite = pokemon.sprites.other["official-artwork"].front_default || pokemon.sprites.front_default;
    const typesHTML = pokemon.types
      .map(t => `<span class="type-badge">${t.type.name}</span>`)
      .join("");

    card.innerHTML = `
      <img src="${sprite}" alt="${pokemon.name}">
      <p style="color: #999; font-size: 0.85rem;">#${String(pokemon.id).padStart(3, '0')}</p>
      <h3>${pokemon.name}</h3>
      <div class="types">${typesHTML}</div>
    `;
    
    pokemonContainer.appendChild(card);
  });
}

// Filtrar Pokémon con la barra de búsqueda
searchInput.addEventListener("input", (e) => {
  const query = e.target.value.toLowerCase();
  const filtered = allPokemonData.filter(pokemon => 
    pokemon.name.toLowerCase().includes(query)
  );
  renderPokemon(filtered);
});

// Cargar la app
fetchPokemonList();
