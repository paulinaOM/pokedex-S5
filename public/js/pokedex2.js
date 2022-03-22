const url_base_images   = 'https://assets.pokemon.com/assets/cms2/img/pokedex/full/'
const btn_start         = document.getElementById('btn_start_pokedex');
const btn_check         = document.getElementById('btn_check_pokedex');
const btn_navbar        = document.getElementById('btn_navbar_toogle');
let poke_name_generated = "";

btn_navbar.addEventListener('click', function(){
    let navbar = document.getElementById('navbarNavDropdown');

    if(navbar.classList.contains('show')){
        navbar.classList.remove('show');
    }
    else{
        navbar.classList.add('show');
    }
});

btn_start.addEventListener('click', function(){
    startPokedex();
});

btn_check.addEventListener('click', function(){
    checkPokedex();
});

const startPokedex = () => {
    let h3           = document.getElementById('response_pokedex');
    h3.textContent   = "";

    let div_alert    = document.getElementById('div_alert');
    div_alert.classList.remove('alert', 'alert-success', 'alert-danger');

    const input_name = document.getElementById("input_pokedex");
    input_name.value = "";
    input_name.focus();

    let id           = Math.floor(Math.random() * (899 - 1)) + 1;
    let id_generated = generateImageId(`${id}`);

    const img_pokemon   = document.getElementById('img_pokemon_pokedex');
    img_pokemon.src     = `${url_base_images}${id_generated}.png`;
    img_pokemon.classList.add('img-incognit');
    
    const url = `https://pokeapi.co/api/v2/pokemon/${id}`;
    fetch(url).then((res) => {
        if (res.status != "200") {
            console.log(res);
        }
        else {
            return res.json();
        }
    }).then((data) => {
        if (data) {
            console.log(data.name);
            poke_name_generated = data.name;
        }
    });
}

const generateImageId = (id) => {
    let longitud_id = id.length;
    let str_img_id  = '';

    for(i=0; i<(3-longitud_id); i++){
        str_img_id += '0';
    }
    console.log(str_img_id+id);
    return str_img_id+id;
}

const checkPokedex = () => {
    const input_name = document.getElementById("input_pokedex");
    let input_poke_name = input_name.value;
    input_poke_name = input_poke_name.toLowerCase();
    input_poke_name = (input_poke_name != undefined && input_poke_name != null && input_poke_name !='')
                        ?input_poke_name: 'unknown';
    
    let div_alert = document.getElementById('div_alert');
    let h3        = document.getElementById('response_pokedex');
    
    div_alert.classList.remove('alert', 'alert-success', 'alert-danger');
    
    if(input_poke_name == poke_name_generated){
        div_alert.classList.add('alert', 'alert-success');
        h3.textContent      = "Well done!";
        const img_pokemon   = document.getElementById('img_pokemon_pokedex');
        img_pokemon.classList.remove('img-incognit');
    }
    else{
        div_alert.classList.add('alert','alert-danger');
        h3.textContent = "Incorrect. Try again!";
    }
}