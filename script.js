const API_URL = "https://pokeapi.co/api/v2/pokemon/?offset=20&limit=100";
const pokemonContainer = document.getElementById("pokemon-container");
const searchInput = document.getElementById("search-input");
const modalContainer = document.getElementById("modal-container");
const modalBody = document.getElementById("modal-body");
const closeModalBtn = document.getElementById("close-modal");

let allPokemonData = [];

// Obtener datos de la API
async function fetchPokemonList() {
  try {
    // Esqueleto / mensaje de carga
    pokemonContainer.innerHTML = `
      <div style="grid-column: 1/-1; text-align: center; padding: 50px;">
        <p style="font-size: 1.2rem; color: #38bdf8;">Cargando Pokédex...</p>
      </div>`;

    const response = await fetch(API_URL);
    const data = await response.json();

    // Traer los detalles de los 100 Pokémon en paralelo
    const detailPromises = data.results.map(async (pokemon) => {
      const res = await fetch(pokemon.url);
      return await res.json();
    });

    allPokemonData = await Promise.all(detailPromises);
    renderPokemon(allPokemonData);

  } catch (error) {
    console.error("Error al cargar la Pokédex:", error);
    pokemonContainer.innerHTML = `
      <p style="grid-column: 1/-1; text-align: center; color: #ef4444; padding: 40px;">
        ⚠️️ Error al conectar con PokéAPI. Intenta recargar la página.
      </p>`;
  }
}

// Renderizar tarjetas principales
function renderPokemon(pokemonArray) {
  pokemonContainer.innerHTML = "";

  if (pokemonArray.length === 0) {
    pokemonContainer.innerHTML = `
      <p style="grid-column: 1/-1; text-align: center; color: #94a3b8; padding: 40px;">
        No se encontraron Pokémon con ese nombre.
      </p>`;
    return;
  }

  pokemonArray.forEach((pokemon) => {
    const card = document.createElement("div");
    card.classList.add("card");

    const sprite =
      pokemon.sprites.other?.["official-artwork"]?.front_default ||
      pokemon.sprites.front_default;

    const mainType = pokemon.types[0].type.name;

    const typesHTML = pokemon.types
      .map((t) => `<span class="type-badge type-${t.type.name}">${t.type.name}</span>`)
      .join("");

    card.innerHTML = `
      <span class="card-number">#${String(pokemon.id).padStart(3, "0")}</span>
      <img src="${sprite}" alt="${pokemon.name}" loading="lazy">
      <h3>${pokemon.name}</h3>
      <div class="types">${typesHTML}</div>
    `;

    // Al hacer clic, abrir la ventana modal
    card.addEventListener("click", () => openModal(pokemon));

    pokemonContainer.appendChild(card);
  });
}

// Abrir la ventana flotante (Modal)
function openModal(pokemon) {
  const sprite =
    pokemon.sprites.other?.["official-artwork"]?.front_default ||
    pokemon.sprites.front_default;

  const height = (pokemon.height / 10).toFixed(1); // Decímetros a metros
  const weight = (pokemon.weight / 10).toFixed(1); // Hectogramos a kg

  const typesHTML = pokemon.types
    .map((t) => `<span class="type-badge type-${t.type.name}">${t.type.name}</span>`)
    .join("");

  // Nombres personalizados de las estadísticas
  const statNames = {
    hp: "HP",
    attack: "Ataque",
    defense: "Defensa",
    "special-attack": "At. Sp.",
    "special-defense": "Def. Sp.",
    speed: "Velocidad"
  };

  const statsHTML = pokemon.stats
    .map((stat) => {
      const name = statNames[stat.stat.name] || stat.stat.name;
      const value = stat.base_stat;
      const percentage = Math.min((value / 150) * 100, 100); // 150 como tope base visual

      return `
        <div class="stat-row">
          <span class="stat-name">${name}</span>
          <span class="stat-num">${value}</span>
          <div class="stat-bar-bg">
            <div class="stat-bar-fill" style="width: 0%" data-percentage="${percentage}%"></div>
          </div>
        </div>
      `;
    })
    .join("");

  modalBody.innerHTML = `
    <div class="modal-header">
      <img src="${sprite}" alt="${pokemon.name}">
      <h2>${pokemon.name} <span style="font-size: 1rem; color: #94a3b8;">#${String(pokemon.id).padStart(3, "0")}</span></h2>
      <div class="types" style="margin-top: 8px;">${typesHTML}</div>
    </div>

    <div class="modal-info-grid">
      <div class="modal-info-item">
        <span>Altura</span>
        <strong>${height} m</strong>
      </div>
      <div class="modal-info-item">
        <span>Peso</span>
        <strong>${weight} kg</strong>
      </div>
    </div>

    <div class="stats-container">
      <h4 style="margin-bottom: 12px; font-size: 0.95rem; color: #38bdf8;">Estadísticas Base</h4>
      ${statsHTML}
    </div>
  `;

  modalContainer.classList.remove("hidden");

  // Animar las barras de progreso
  setTimeout(() => {
    const fills = modalBody.querySelectorAll(".stat-bar-fill");
    fills.forEach((fill) => {
      fill.style.width = fill.getAttribute("data-percentage");
    });
  }, 100);
}

// Cerrar Modal
function closeModal() {
  modalContainer.classList.add("hidden");
}

closeModalBtn.addEventListener("click", closeModal);
modalContainer.addEventListener("click", (e) => {
  if (e.target === modalContainer) closeModal();
});

// Evento de búsqueda en tiempo real
searchInput.addEventListener("input", (e) => {
  const query = e.target.value.toLowerCase().trim();
  const filtered = allPokemonData.filter((pokemon) =>
    pokemon.name.toLowerCase().includes(query)
  );
  renderPokemon(filtered);
});


fetchPokemonList();
