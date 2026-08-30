const gallery = document.getElementById("gallery");
const searchInput = document.getElementById("searchInput");

const messageModal = document.getElementById("messageModal");
const modalImage = document.getElementById("modalImage");
const modalName = document.getElementById("modalName");
const modalMessage = document.getElementById("modalMessage");
const closeModal = document.getElementById("closeModal");

const SUPABASE_URL = "https://oxtwjdjlnkkcdsfdotsc.supabase.co";
const SUPABASE_KEY = "sb_publishable_q3F4rMaQP0dy9wJ4dmX_fg_Sj3tNZcX";

const supabaseClient =
    window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_KEY
    );


async function loadGallery() {

    const { data, error } =
        await supabaseClient
            .from("messages")
            .select("*")
            .order("created_at", {
                ascending: false
            });


    if (error) {

        console.error(error);

        gallery.innerHTML =
            "<p>Failed to load messages.</p>";

        return;
    }


    displayGallery(data);

}

loadGallery();

// ====================
// DISPLAY GALLERY
// ====================

function displayGallery(data) {

    gallery.innerHTML = "";

    if (data.length === 0) {

        gallery.innerHTML = `
            <p class="no-result">
                No messages found.
            </p>
        `;

        return;
    }

    data.forEach((item, index) => {

        const figure = document.createElement("figure");

        figure.className = "gallery-item";

        figure.innerHTML = `

            <img
                src="${item.image}"
                alt="${item.name}"
            >

            <figcaption>

                <h3>${item.name}</h3>

                <p>${item.message}</p>

            </figcaption>

        `;

        // ====================
        // OPEN POPUP
        // ====================

        figure.addEventListener("click", () => {

            modalImage.src = item.image;

            modalImage.alt = item.name;

            modalName.textContent = item.name;

            modalMessage.textContent = item.message;

            messageModal.classList.add("show");

        });

        gallery.appendChild(figure);

    });

}


// ====================
// SEARCH
// ====================

searchInput.addEventListener("input", async () => {

    const keyword =
        searchInput.value.trim();


    let query =
        supabaseClient
            .from("messages")
            .select("*")
            .order("created_at", {
                ascending: false
            });


    if (keyword) {

        query =
            query.ilike(
                "name",
                `%${keyword}%`
            );

    }


    const { data, error } =
        await query;


    if (error) {

        console.error(error);

        return;
    }


    displayGallery(data);

});


// ====================
// CLOSE MODAL
// ====================

closeModal.addEventListener("click", () => {

    messageModal.classList.remove("show");

});


// Klik area luar popup untuk menutup

messageModal.addEventListener("click", (e) => {

    if (e.target === messageModal) {

        messageModal.classList.remove("show");

    }

});


// ====================
// INITIAL DISPLAY
// ====================

supabaseClient
    .channel("messages-channel")
    .on(
        "postgres_changes",
        {
            event: "INSERT",
            schema: "public",
            table: "messages"
        },
        (payload) => {

            displayGallery([
                payload.new,
                ...currentGalleryData
            ]);

        }
    )
    .subscribe();