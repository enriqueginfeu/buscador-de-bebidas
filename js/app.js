function iniciarApp() {

    const resultado = document.querySelector('#resultado');
    const selectCategorias = document.querySelector('#categorias');
    
    if(selectCategorias) {
        selectCategorias.addEventListener('change', seleccionarCategorias);
        obtenerCategorias();
    }

    const favoritosDiv = document.querySelector('.favoritos');
        if(favoritosDiv) {
            obtenerFavoritos();
        }

    const modal = new bootstrap.Modal('#modal',{});



    function obtenerCategorias() {
        const url = 'https://www.thecocktaildb.com/api/json/v1/1/list.php?c=list'
        fetch(url)
            .then(respuesta => respuesta.json())
            .then(resultado => mostrarCategorias(resultado.drinks))
    }

    function mostrarCategorias(categorias = []) {
        categorias.forEach(categoria => {

            const { strCategory } = categoria;

            const option = document.createElement('OPTION');
            option.value = strCategory;
            option.textContent = strCategory;

            selectCategorias.appendChild(option);
        })
    }

    function seleccionarCategorias(e) {
        const categoria = e.target.value;
        const url = `https://www.thecocktaildb.com/api/json/v1/1/filter.php?c=${categoria}`
        fetch(url)
            .then(respuesta => respuesta.json())
            .then(resultado => mostrarRecetas(resultado.drinks))
    }

    function mostrarRecetas(recetas = []) {

        limpiarHtml(resultado);

        const heading = document.createElement('H2');
        heading.classList.add('text-center', 'text-black', 'my-5', 'fs-1');
        heading.textContent = recetas.length ? 'Resultados' : 'No hay Resultados';
        resultado.appendChild(heading);
        
        recetas.forEach(receta => {

            const { idDrink, strDrink, strDrinkThumb } = receta;

            const contenedorReceta = document.createElement('DIV');
            contenedorReceta.classList.add('col-md-4');

            const cardReceta = document.createElement('DIV');
            cardReceta.classList.add('card', 'mb-5', 'shadow-lg');

            const imagenReceta = document.createElement('IMG');
            imagenReceta.classList.add('card-img-top', 'p-3')
            imagenReceta.alt = `Imagen receta ${strDrink ?? receta.title}`;
            imagenReceta.src = strDrinkThumb ?? receta.img;

            const bodyCardReceta = document.createElement('DIV');
            bodyCardReceta.classList.add('card-body');

            const headingReceta = document.createElement('H3');
            headingReceta.classList.add('card-title', 'mb-3');
            headingReceta.textContent = strDrink ?? receta.title;

            const buttonReceta = document.createElement('BUTTON');
            buttonReceta.classList.add('btn', 'btn-warning', 'w-100', 'text-white');
            buttonReceta.textContent = 'Ver Receta';

            buttonReceta.onclick = function() {
                seleccionarReceta(idDrink ?? receta.id)
            }


            bodyCardReceta.appendChild(headingReceta); 
            bodyCardReceta.appendChild(buttonReceta);
            
            cardReceta.appendChild(imagenReceta);
            cardReceta.appendChild(bodyCardReceta);

            contenedorReceta.appendChild(cardReceta);

            resultado.appendChild(contenedorReceta);

        })
    }

    function seleccionarReceta(id) {
        const url = `https://www.thecocktaildb.com/api/json/v1/1/lookup.php?i=${id}`;
        fetch(url)
            .then(respuesta => respuesta.json())
            .then(resultado => mostrarRecetaModal(resultado.drinks[0]))
    }

    function mostrarRecetaModal(receta) {


        const { idDrink, strInstructions, strDrink, strDrinkThumb } = receta;

        const modalTitle = document.querySelector('.modal .modal-title');
        const modalBody = document.querySelector('.modal .modal-body');

        modalTitle.textContent = strDrink;
        modalBody.innerHTML = `
            <img class='img-fluid' src='${strDrinkThumb}' alt='receta ${strDrink}' />
            <h3 class='my-3'>Preparacion</h3>
            <p>${strInstructions}</p>
            <h3 class='my-3'>Ingredientes y Cantidades</h3>
        `

        const listGroup = document.createElement('UL');
        listGroup.classList.add('list-group');

        for(let i = 1; i <= 20; i++) {
            if(receta[`strIngredient${i}`]) {
                const ingredientes = receta[`strIngredient${i}`]; 
                const cantidad = receta[`strMeasure${i}`];
                
                const ingredienteLi = document.createElement('LI');
                ingredienteLi.classList.add('list-group-item');
                ingredienteLi.textContent = `${ingredientes} - ${cantidad}`;

                listGroup.appendChild(ingredienteLi);
            }
        }

        modalBody.appendChild(listGroup);

        const modalFooter = document.querySelector('.modal-footer');

        limpiarHtml(modalFooter);

        const btnFavorito = document.createElement('BUTTON');
        btnFavorito.classList.add('btn', 'btn-warning', 'col', 'text-white');
        btnFavorito.textContent = existeLS(idDrink) ? 'Borrar Favorito' : 'Guardar Favorito';

        btnFavorito.onclick = function() {

            if(existeLS(idDrink)) {
                borrarFavorito(idDrink);
                btnFavorito.textContent = 'Guardar Favorito';
                mostrarToast('Eliminado Correctamente!');
                return
            }

            agregarFavorito({
                id: idDrink,
                title: strDrink,
                img: strDrinkThumb
            });

            btnFavorito.textContent = 'Borrar Favorito';
            mostrarToast('Agregado Correctamente!');
        }

        modalFooter.appendChild(btnFavorito);

        modal.show();
    }

    function agregarFavorito(receta) {
        const favoritos = JSON.parse(localStorage.getItem('favoritos')) ?? [];
        localStorage.setItem('favoritos', JSON.stringify([...favoritos, receta]));  
    }

    function borrarFavorito(id) {
        const favoritos = JSON.parse(localStorage.getItem('favoritos')) ?? [];
        const nuevosFavoritos = favoritos.filter(favorito => favorito.id !== id);
        localStorage.setItem('favoritos', JSON.stringify(nuevosFavoritos));
    }

    function existeLS(id) {
        const favoritos = JSON.parse(localStorage.getItem('favoritos')) ?? [];
        return favoritos.some(favorito => favorito.id === id);
    }

    function mostrarToast(mensaje) {
        const toastDiv = document.querySelector('#toast');
        const toastBody = document.querySelector('.toast-body');
        const toast = new bootstrap.Toast(toastDiv);
        toastBody.textContent = mensaje;

        toast.show();
    }

    function obtenerFavoritos() {

        
        const favoritos = JSON.parse(localStorage.getItem('favoritos')) ?? [];
        if(favoritos.length) {
            mostrarRecetas(favoritos);
            return
        }

        const sinFavoritos = document.createElement('P');
        sinFavoritos.textContent = 'No hay Favoritos';
        sinFavoritos.classList.add('fs-4', 'text-center', 'mt-5');

        favoritosDiv.appendChild(sinFavoritos)
    }

    function limpiarHtml(selector) {
        while(selector.firstChild) {
            selector.removeChild(selector.firstChild);
        }
    }
}

document.addEventListener('DOMContentLoaded', iniciarApp);