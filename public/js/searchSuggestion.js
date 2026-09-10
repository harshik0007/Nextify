const input = document.querySelector(".search-input");
const suggestions = document.querySelector("#suggestions");

input.addEventListener("input", async () => {

    const value = input.value.trim();

    if (!value) {
        suggestions.innerHTML = "";
        return;
    }

    const response = await fetch(
        `/listings/search-suggestions?q=${encodeURIComponent(value)}`
    );

    const result = await response.json();

    suggestions.innerHTML = "";

    result.forEach(listing => {
        const link = document.createElement("a");

        link.classList.add("suggestion");

        link.href = `/listings/${listing._id}`;

        link.innerText = `${listing.title} - ${listing.category} - ${listing.location}`;

        suggestions.appendChild(link);
    });
});