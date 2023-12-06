$(document).ready(function() {
    const pokedexContainer = $('#pokedex-container');
    const teamContainer = $('#team-container');
    const detailsContainer = $('#details-container');
    const reloadButton = $('#reload-btn');
    const searchInput = $('#searchInput');
    let team = [];

    function loadAllPokemonSequentially(id, searchQuery = null) {
        if (id <= 251) {
            const apiUrl = searchQuery
                ? `https://pokeapi.co/api/v2/pokemon/${searchQuery}`
                : `https://pokeapi.co/api/v2/pokemon/${id}`;

            $.get(apiUrl, function(data) {
                if (!searchQuery && data.id === id) {
                    const pokemon = {
                        id: data.id,
                        name: data.name,
                        sprite: data.sprites.front_default,
                        details: data
                    };

                    displayPokemonCard(pokemon);
                }

                loadAllPokemonSequentially(id + 1, searchQuery);
            })
            .fail(function() {
                console.error(`Erro ao carregar Pokémon com ID ${id}`);
                loadAllPokemonSequentially(id + 1, searchQuery);
            });
        }
    }

    function loadAllPokemon() {
        loadAllPokemonSequentially(1);
    }

    function displayPokemonCard(pokemon) {
        const card = $(`<div class="pokemon-card" data-id="${pokemon.id}">
                            <p>${pokemon.name}</p>
                            <p>#${pokemon.id}</p>
                            <img src="${pokemon.sprite}" alt="${pokemon.name}">
                            <div class="button-container">
                                <button class="details-btn">Detalhes</button>
                                <button class="add-to-team-btn">Adicionar à equipe</button>
                            </div>
                        </div>`);

        card.find('.details-btn').click(function() {
            displayPokemonDetails(pokemon);
        });

        card.find('.add-to-team-btn').click(function() {
            addToTeam(pokemon);
        });

        // Adiciona o card ao contêiner pokedex-container
        pokedexContainer.append(card);

        // Organiza os cards em grupos de 5
        const cards = pokedexContainer.find('.pokemon-card');
        const groupIndex = Math.floor(cards.length / 5);
        if (cards.length % 5 === 0) {
            pokedexContainer.append(`<div class="pokemon-group" id="group-${groupIndex}"></div>`);
        }
        $(`#group-${groupIndex}`).append(card);
    }

    function displayPokemonDetails(pokemon) {
        const details = $(`<div>
                              <p>Detalhes do ${pokemon.name}:</p>
                              <p>Altura: ${pokemon.details.height}</p>
                              <p>Peso: ${pokemon.details.weight}</p>
                              <img src="${pokemon.sprite}" alt="${pokemon.name}">
                           </div>`);

        detailsContainer.empty().append(details);

        // Adiciona a rolagem para o topo da página
        $('html, body').animate({
            scrollTop: 0
        }, 'fast');
    }

    function addToTeam(pokemon) {
        if (team.length < 6 && !team.includes(pokemon)) {
            team.push(pokemon);
            saveTeamToStorage();
            displayTeam();
        } else {
            alert('Sua equipe está cheia ou já contém esse Pokémon!');
        }
    }

    function removePokemonFromTeam(pokemon) {
        team = team.filter(p => p.id !== pokemon.id);
        saveTeamToStorage();
        displayTeam();
    }

    function displayTeam() {
        teamContainer.empty();
        team.forEach(pokemon => {
            const teamMember = $(`<div class="team-member">
                                     <p>${pokemon.name}</p>
                                     <img src="${pokemon.sprite}" alt="${pokemon.name}">
                                     <button class="remove-from-team-btn">Remover da equipe</button>
                                  </div>`);

            teamMember.find('.remove-from-team-btn').click(function() {
                removePokemonFromTeam(pokemon);
            });

            teamContainer.append(teamMember);
        });
    }

    function saveTeamToStorage() {
        localStorage.setItem('pokemonTeam', JSON.stringify(team));
    }

    function loadTeamFromStorage() {
        const storedTeam = localStorage.getItem('pokemonTeam');
        if (storedTeam) {
            team = JSON.parse(storedTeam);
            displayTeam();
        }
    }

    // Load team first when the page loads
    loadTeamFromStorage();
    // Load the remaining Pokémon
    loadAllPokemon();
});
