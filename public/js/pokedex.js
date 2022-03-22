const url_base          = 'https://pokeapi.co/api/v2/';
const url_base_images   = 'https://assets.pokemon.com/assets/cms2/img/pokedex/full/'

const btn_navbar = document.getElementById('btn_navbar_toogle');
btn_navbar.addEventListener('click', function(){
    let navbar = document.getElementById('navbarNavDropdown');

    if(navbar.classList.contains('show')){
        navbar.classList.remove('show');
    }
    else{
        navbar.classList.add('show');
    }
});

const fetchPokemon = () => {
    const input_name = document.getElementById("input_poke_name");
    let input_poke_name = input_name.value;
    input_poke_name = input_poke_name.toLowerCase();
    input_poke_name = (input_poke_name != undefined && input_poke_name != null && input_poke_name !='')
                        ?input_poke_name: 'unknown';
    const url = `https://pokeapi.co/api/v2/pokemon/${input_poke_name}`;
    fetch(url).then((res) => {
        if (res.status != "200") {
            console.log(res);
            alert("Pokemon no encontrado");
        }
        else {
            return res.json();
        }
    }).then((data) => {
        if (data) {
            console.log(data);
            let id = data.id;
            redirectPokemonDetail(id);
        }
    });
}

const pokeImage = (url) => {
    const pokePhoto = document.getElementById("img_pokemon");
    pokePhoto.src = url;
}

const showPokeList = () => {
    const div_poke_grid = document.getElementById("poke_grid");
    const url           = url_base + 'pokemon?limit=50&offset=0';

    fetch(url)
    .then((res)=>{
        console.log('Status poke_list');
        if (res.status != "200") {
            console.log(res);
            div_poke_grid.innerHTML('<div>Sin resultados</div>')
        }
        else {
            console.log(res);
            return res.json();
        }
    })
    .then((data) => {
        console.log('data1');
        console.log(data);
        pokemons = data.results;

        return Promise.all(pokemons.map((pokemon) => 
        fetch(pokemon.url)
            .then((res)=>{
                if(res.status != 200){
                    console.log(res);
                }
                else{
                    // console.log(res);
                    return res.json();
                }
            })
            .catch((error)=>{
                console.log('error', error);
            })
        ))
        .then(data=>{
            // console.log('data2')
            // console.log(data)
            return data;
        });
    })
    .then((arr_pokes_details)=>{
        console.log('arr_poke_details')
        console.log(arr_pokes_details);
        buildPokemonCard(arr_pokes_details); 
        
    });
}

function buildPokemonCard(data){
    let div_grid = document.getElementById('poke_grid');
    
    data.forEach(pokemon => {
        let div_card = document.createElement('div');
        
        let id      = pokemon.id;
        let name    = pokemon.name;      
        let img_id  = generateImageId(`${id}`);
        
        let h3          = document.createElement('h3');
        let small       = document.createElement('small');
        let img         = document.createElement('img');
        let div_types   = document.createElement('div');
        
        h3.textContent  = stringSentenceFormat(name);
        small.textContent = `No. ${id}`;
        img.src         = `${url_base_images}${img_id}.png`;

        let types       = pokemon.types;
        types.forEach(poke_type => {
            let type_name       = poke_type.type.name;
            let span            = document.createElement('span');
            span.textContent    = type_name;
            span.classList.add('badge', `${type_name}`)
            div_types.append(span);
        });

        div_card.append(h3, small,  img, div_types);
        div_card.classList.add('card-pokemon');
        div_card.addEventListener('click', function(){redirectPokemonDetail(id)})
        div_grid.append(div_card);
    });
}

const generateImageId = (id) => {
    let longitud_id = id.length;
    let str_img_id  = '';

    for(i=0; i<(3-longitud_id); i++){
        str_img_id += '0';
    }
    
    return str_img_id+id;
}

const redirectPokemonDetail = (id) => {
    console.log('redirect: '+id);
    window.location.href = `pokemon.html?p=${id}`;
}

const showPokemonDetail = () => {
    const url_string  = window.location.href;
    const current_url = new URL(url_string);
    let id            = current_url.searchParams.get('p');

    const url = url_base + 'pokemon/'+id;
    fetch(url).then((res)=>{
        console.log('res_poke_specific');
        console.log(res);
        if (res.status == "200") {
            return res.json();
        }
        else {
            return({error_message:'No data available'});
        }
    }).then((info_1) => {
        //name, image, pokemon types, stats, moves
        console.log('data_poke_specific')
        console.log(info_1);

        let name        = info_1.name;
        let url_detail  = `${url_base}pokemon-species/${name}`;
        // console.log(url_detail);
        
        return fetch(url_detail).then((res)=>{
            console.log('res_pokemon_detail');
            console.log(res);
            if(res.status == 200){
                return res.json();
            }
            else{
                return({error_message:'Fail detail'});
            }
        }).then((data)=>{
            console.log('data_pokemon_detail');
            console.log(data); 
            
            //color, evolution_chain, flavor_text_entries[0].flavor_text
            info_1.color             = data.color;
            info_1.url_evolution_chain   = data.evolution_chain;
            info_1.description       = data.flavor_text_entries[0].flavor_text
            
            return info_1;
        });

    }).then(async (info_2)=>{
        abilities = info_2.abilities;

        const abilities_full_info = await Promise.all(abilities.map((ability) => fetch(ability.ability.url)
            .then((res) => {
                // console.log('Check status ability_detail');
                if (res.status != 200) {
                    console.log(res);
                }
                else {
                    // console.log(res);
                    return res.json();
                }
            })
            .catch((error) => {
                console.log('error', error);
            })
        ));

        console.log('abilities_full_info');
        console.log(abilities_full_info);
        info_2.abilities_full_info = abilities_full_info;
        return info_2;

    }).then(async (info_3)=>{
        moves = info_3.moves;

        const moves_full_info = await Promise.all(moves.map((move) => fetch(move.move.url)
            .then((res) => {
                // console.log('Check status move_detail');
                if (res.status != 200) {
                    console.log(res);
                }
                else {
                    // console.log(res);
                    return res.json();
                }
            })
            .catch((error) => {
                console.log('error', error);
            })
        ));
        
        console.log('moves_full_info');
        console.log(moves_full_info);
        info_3.moves_full_info = moves_full_info;
        return info_3;
    }).then((info_4) => {
        let url_evolution = info_4.url_evolution_chain.url;
        // console.log(url_evolution);

        return fetch(url_evolution).then((res) => {
            // console.log('pokemon_evolution');
            // console.log(res);
            if (res.status == 200) {
                return res.json();
            }
            else {
                return ({ error_message: 'Fail detail' });
            }
        }).then((data) => {
            console.log('detail_data_evolution');
            console.log(data);

            //color, evolution_chain, flavor_text_entries[0].flavor_text
            info_4.evolution_chain = data.chain;
            return info_4;
        });
    }).then((data)=>{
        console.log('full_poke_data')
        console.log(data);
        let id          = data.id; 
        let image_id    = generateImageId(`${id}`); 
        let name        = stringSentenceFormat(data.name);
        let image_url   = `${url_base_images}${image_id}.png`;
        let type_species= data.types;
        let stats       = data.stats;
        let moves       = data.moves;
        let moves_full  = data.moves_full_info;
        let height      = parseFloat(data.height)*0.1;
        let weight      = parseFloat(data.weight)*0.1;
        let abilities   = data.abilities_full_info;
        let poke_color  = data.color;
        let evol_chain  = data.evolution_chain;
        let description = data.description;

        let pokemon_image = document.getElementById('pokemon_image');
        let pokemon_name = document.getElementById('pokemon_name');
        let pokemon_number = document.getElementById('pokemon_number');
        let pokemon_weight = document.getElementById('pokemon_weight');
        let pokemon_height = document.getElementById('pokemon_height');
        let pokemon_description = document.getElementById('pokemon_description');
        let pokemon_types = document.getElementById('pokemon_types');
        let pokemon_abilities = document.getElementById('pokemon_abilities');

        pokemon_image.src = image_url;
        pokemon_name.textContent = name;
        pokemon_number.textContent = `No. ${id}`;
        pokemon_weight.textContent = weight.toFixed(2);
        pokemon_height.textContent = height.toFixed(2);
        pokemon_description.textContent = description;

        type_species.forEach(function(type){
            let type_name = type.type.name;
            let badge = document.createElement('span');
            badge.classList.add('badge', `${type_name}`);
            badge.textContent = type_name.toUpperCase();
            pokemon_types.appendChild(badge);
        })

        abilities.forEach(function(ability){
            let ability_name        = ability.name;
            let ability_description = ability.effect_entries[0].effect;

            let icon        = document.createElement('i');
            icon.classList.add('fa-solid', 'fa-circle-question');
            icon.addEventListener('click', function(){showAbilityDetail(ability_name, ability_description, poke_color.name)})

            let p = document.createElement('p');
            p.textContent   = stringSentenceFormat(ability_name);
            p.appendChild(icon);

            pokemon_abilities.appendChild(p);
        });
        
        let table_stats   = document.getElementById('table_stats');
        stats.forEach(function(stat){
            let base_stat = stat.base_stat;
            let name      = stat.stat.name;
            name          = stringSentenceFormat(name)

            let tr           = document.createElement('tr');
            let th           = document.createElement('th');
            let td           = document.createElement('td');
            let div_progress = document.createElement('div')
            let div_prog_bar = document.createElement('div');

            div_progress.classList.add('progress');
            div_prog_bar.classList.add('progress-bar', `${poke_color.name}`, 'progress-bar-striped', 'progress-bar-animated');

            th.textContent           = `${name}`;
            div_prog_bar.textContent = `${base_stat}%`;
            div_prog_bar.style.width = `${base_stat}%`;

            div_progress.appendChild(div_prog_bar);
            td.appendChild(div_progress)
            tr.append(th, td);
            table_stats.appendChild(tr);
        });

        cont_move = 0;
        moves_full.forEach(function(move){
            let level        = moves[cont_move].version_group_details[0].level_learned_at;
            let name         = stringSentenceFormat(move.name);
            let power        = move.power;
            let damage_class = stringSentenceFormat(move.damage_class.name);

            let tr           = document.createElement('tr');
            let td_level     = document.createElement('td');
            let td_name      = document.createElement('td');
            let td_power     = document.createElement('td');
            let td_damage    = document.createElement('td');


            td_level.textContent  = level;
            td_name.textContent   = name;
            td_power.textContent  = power;
            td_damage.textContent = damage_class;

            tr.append(td_level, td_name, td_power, td_damage);
            table_moves.append(tr);
            cont_move ++;  
        });

        arr_evolution = processEvolutionChain(evol_chain);

        let div_evolution = document.getElementById('div_evolution');
        arr_evolution.forEach(function(item){
            let div_card = document.createElement('div');
            let img      = document.createElement('img');
            let h5       = document.createElement('h5');
            let small    = document.createElement('small');
            let icon     = document.createElement('i');
            icon.classList.add('fa-solid', 'fa-chevron-right')
            
            h5.textContent  = stringSentenceFormat(item.name);
            img.src         = `${url_base_images}${item.img_id}.png`;
            img.classList.add('img-poke-evolution');
            small.textContent = `No. ${item.id}`;

            div_card.append(img,h5, small);
            div_card.classList.add('card-poke-evolution');
            div_card.addEventListener('click', function(){redirectPokemonDetail(item.id)})
            div_evolution.append(div_card);
            div_evolution.append(icon);
        });
        div_evolution.removeChild(div_evolution.lastChild);
    });
}

const showAbilityDetail = (ability_name, ability_description, color) => {
    //console.log(ability_name, ability_description);

    h5_title      = document.getElementById('text_title');
    p_description = document.getElementById('text_body');
    btn_close     = document.getElementById('btn_close_modal');

    h5_title.textContent        = stringSentenceFormat(ability_name);
    h5_title.style.color = `var(--${color})`;
    p_description.textContent   = `${ability_description}`;
    btn_close.addEventListener('click', function(){ closeModal('modal_ability_description')});

    modal_ability_description = document.getElementById('modal_ability_description');
    modal_ability_description.style.display = 'block';
}

const closeModal = (id_element) =>{
    let element = document.getElementById(`${id_element}`);

    element.style.display = 'none';
}

const stringSentenceFormat = (string) => {
    let stringFormated = string.charAt(0).toUpperCase() + string.substr(1).toLowerCase()
    return stringFormated;
}

const processEvolutionChain = (chain) => {
    let name     = chain.species.name;
    let url      = chain.species.url;
    let id       = getIdFromUrl(url);
    let image_id = generateImageId(id);
    let arr_evolution = [];

    arr_evolution.push({
        id      : id,
        name    : name,
        img_id  : image_id,
        url     : url
    });

    if(chain.evolves_to.length>0){
        arr_evolution = arr_evolution.concat(processEvolutionChain(chain.evolves_to[0]));
    }
    return arr_evolution;
}

const getIdFromUrl = (url) => {
    let arr_url = url.split('/');
    let id = arr_url[arr_url.length -2];

    return id;
}