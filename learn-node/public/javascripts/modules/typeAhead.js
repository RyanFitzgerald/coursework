const axios = require('axios');
const dompurify = require('dompurify');

function searchResultsHTML(stores) {
    return stores.map(store => {
        return `
            <a href="/store/${store.slug}" class="search__result">
                <strong>${store.name}</strong>
            </a>
        `;
    }).join('');
}

function typeAhead(search) {
    if (!search) return;

    const searchInput = search.querySelector('input[name="search"');
    const searchResults = search.querySelector('.search__results');

    searchInput.on('input', function() {
        // If no value, quit it
        if (!this.value) {
            searchResults.style.display = 'none';
            return;
        }

        // Show the results
        searchResults.style.display = 'block';

        axios
            .get(`/api/search?q=${this.value}`)
            .then(res => {
                if (res.data.length) {
                    searchResults.innerHTML = dompurify.sanitize(searchResultsHTML(res.data));
                    return;
                }

                // Tell them nothing came back
                searchResults.innerHTML = dompurify.sanitize(`<div class="search__result">No results for ${this.value} found!</div>`);
            })
            .catch(err => {
                console.error(err);
            });
    });

    // Handle keyboard inputs
    searchInput.on('keyup', (e) => {
        // If they arent pressing up, down or enter, skip
        if (![38, 40, 13].includes(e.keyCode)) {
            return;
        }

        const activeClass = 'search__result--active';
        const current = search.querySelector(`.${activeClass}`);
        const items = search.querySelectorAll('.search__result');
        let next;

        // If press down and has a current one
        if (e.keyCode === 40 && current) {
            next = current.nextElementSibling || items[0]; // Find next one or first item if on last
        } else if (e.keyCode === 40) { // First time pressing down
            next = items[0];
        } else if (e.keyCode === 38 && current) { // Press up and has a current one
            next = current.previousElementSibling || items[items.length-1]; // Find next one or last item if first
        } else if (e.keyCode === 38) {
            next = items[items.length - 1];
        } else if (e.keyCode === 13 && current.href) {
            window.location = current.href;
            return;
        }

        if (current) {
            current.classList.remove(activeClass);
        }
        next.classList.add(activeClass);
    });
}

export default typeAhead;