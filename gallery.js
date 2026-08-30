const gallery = document.getElementById("gallery");
const searchInput = document.getElementById("searchInput");
const messageModal = document.getElementById("messageModal");
const modalImage = document.getElementById("modalImage");
const modalName = document.getElementById("modalName");
const modalMessage = document.getElementById("modalMessage");
const closeModal = document.getElementById("closeModal");

// ====================
// SUPABASE
// ====================

const SUPABASE_URL = "https://oxtwjdjlnkkcdsfdotsc.supabase.co";
const SUPABASE_KEY = "sb_publishable_q3F4rMaQP0dy9wJ4dmX_fg_Sj3tNZcX";
const supabaseClient =
    window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_KEY
    );

// ====================
// DATA
// ====================

let galleryData = [];

// ====================
// LOAD GALLERY
// ====================

async function loadGallery() {

    gallery.innerHTML = `
        <p class="no-result">
            Loading messages...
        </p>
    `;


    const { data, error } =
        await supabaseClient
            .from("messages")
            .select("*")
            .order("created_at", {
                ascending: false
            });


    if (error) {

        console.error(
            "Error loading messages:",
            error
        );

        gallery.innerHTML = `
            <p class="no-result">
                Failed to load messages.
            </p>
        `;

        return;
    }


    galleryData = data || [];

    displayGallery(galleryData);
}


// ====================
// DISPLAY GALLERY
// ====================

function displayGallery(data) {

    gallery.innerHTML = "";


    if (!data || data.length === 0) {

        gallery.innerHTML = `
            <p class="no-result">
                No messages found.
            </p>
        `;

        return;
    }


    data.forEach((item) => {

        const figure =
            document.createElement("figure");

        figure.className =
            "gallery-item";


        figure.innerHTML = `

            <img
                src="${item.image_url}"
                alt="${item.name}"
            >

            <figcaption>

                <h3>
                    ${item.name}
                </h3>

                <p>
                    ${item.message}
                </p>

            </figcaption>

        `;


        // ====================
        // OPEN POPUP
        // ====================

        figure.addEventListener(
            "click",
            () => {

                modalImage.src =
                    item.image_url;

                modalImage.alt =
                    item.name;

                modalName.textContent =
                    item.name;

                modalMessage.textContent =
                    item.message;

                messageModal.classList.add(
                    "show"
                );

            }
        );


        gallery.appendChild(figure);

    });

}


// ====================
// SEARCH
// ====================

searchInput.addEventListener(
    "input",
    () => {

        filterGallery();

    }
);


function filterGallery() {

    const keyword =
        searchInput.value
            .trim()
            .toLowerCase();


    // Tidak ada keyword
    if (!keyword) {

        displayGallery(
            galleryData
        );

        return;

    }


    // Cari berdasarkan nama
    const filteredData =
        galleryData.filter(
            (item) => {

                return (
                    item.name || ""
                )
                    .toLowerCase()
                    .includes(keyword);

            }
        );


    displayGallery(
        filteredData
    );

}


// ====================
// CLOSE MODAL
// ====================

closeModal.addEventListener(
    "click",
    () => {

        messageModal.classList.remove(
            "show"
        );

    }
);


// Klik luar popup
messageModal.addEventListener(
    "click",
    (e) => {

        if (
            e.target === messageModal
        ) {

            messageModal.classList.remove(
                "show"
            );

        }

    }
);


// ESC untuk menutup popup
document.addEventListener(
    "keydown",
    (e) => {

        if (e.key === "Escape") {

            messageModal.classList.remove(
                "show"
            );

        }

    }
);


// ====================
// REALTIME
// ====================

function subscribeToNewMessages() {

    supabaseClient
        .channel("messages-realtime")

        .on(
            "postgres_changes",
            {
                event: "INSERT",
                schema: "public",
                table: "messages"
            },

            (payload) => {

                const newMessage =
                    payload.new;


                // Cegah duplikat
                const alreadyExists =
                    galleryData.some(
                        (item) =>
                            item.id ===
                            newMessage.id
                    );


                if (alreadyExists) {
                    return;
                }


                // Tambahkan pesan baru
                galleryData.unshift(
                    newMessage
                );


                // Tampilkan kembali
                // dengan mempertahankan search
                filterGallery();

            }
        )

        .subscribe(
            (status) => {

                console.log(
                    "Realtime status:",
                    status
                );
            }
        );

}


// ====================
// START
// ====================

loadGallery();

subscribeToNewMessages();
