// ====================
// CANVAS
// ====================

const canvas = document.getElementById("drawing-board");
const toolbar = document.getElementById("toolbar");
const ctx = canvas.getContext("2d");

// ====================
// VARIABLES
// ====================

let isPainting = false;
let lineWidth = 5;
let eraserSize = 30;
let currentMode = "draw";
let backgroundImage = null;

// ====================
// INPUT ELEMENTS
// ====================

const strokeInput = document.getElementById("stroke");

const lineWidthInput = document.getElementById("lineWidth");

const eraserSizeInput = document.getElementById("eraserSize");

const drawModeButton = document.getElementById("drawMode");

const eraserModeButton = document.getElementById("eraserMode");

const clearButton = document.getElementById("clear");

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
// CANVAS SIZE
// ====================

function setCanvasSize() {

    const rect = canvas.getBoundingClientRect();

    canvas.width = rect.width;
    canvas.height = rect.height;

    ctx.strokeStyle = strokeInput.value;
    ctx.lineWidth = lineWidth;

    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    ctx.globalCompositeOperation =
        "source-over";
}

setCanvasSize();


// ====================
// GET CANVAS POSITION
// ====================

function getCanvasPosition(e) {

    const rect =
        canvas.getBoundingClientRect();

    const scaleX =
        canvas.width / rect.width;

    const scaleY =
        canvas.height / rect.height;

    return {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY
    };
}


// ====================
// DRAW MODE
// ====================

drawModeButton.addEventListener("click", () => {

    currentMode = "draw";

    drawModeButton.classList.add("active");

    eraserModeButton.classList.remove("active");

    ctx.globalCompositeOperation =
        "source-over";

});


// ====================
// ERASER MODE
// ====================

eraserModeButton.addEventListener("click", () => {

    currentMode = "eraser";

    eraserModeButton.classList.add("active");

    drawModeButton.classList.remove("active");

    ctx.globalCompositeOperation =
        "destination-out";

});


// ====================
// COLOR
// ====================

strokeInput.addEventListener("input", (e) => {

    ctx.strokeStyle = e.target.value;

});


// ====================
// STROKE WIDTH
// ====================

lineWidthInput.addEventListener("input", (e) => {

    let value = Number(e.target.value);

    if (value < 1) {
        value = 1;
    }

    if (value > 100) {
        value = 100;
    }

    lineWidth = value;

});


// ====================
// ERASER SIZE
// ====================

eraserSizeInput.addEventListener("input", (e) => {

    let value = Number(e.target.value);

    if (value < 1) {
        value = 1;
    }

    if (value > 100) {
        value = 100;
    }

    eraserSize = value;

});


// ====================
// START DRAWING
// PC + MOBILE
// ====================

canvas.addEventListener("pointerdown", (e) => {

    e.preventDefault();

    isPainting = true;

    canvas.setPointerCapture(e.pointerId);

    const pos =
        getCanvasPosition(e);

    ctx.beginPath();

    ctx.moveTo(pos.x, pos.y);

});


// ====================
// DRAW / ERASE
// PC + MOBILE
// ====================

canvas.addEventListener("pointermove", (e) => {

    if (!isPainting) {
        return;
    }

    e.preventDefault();

    const pos =
        getCanvasPosition(e);

    ctx.lineCap = "round";
    ctx.lineJoin = "round";


    // DRAW

    if (currentMode === "draw") {

        ctx.globalCompositeOperation =
            "source-over";

        ctx.strokeStyle =
            strokeInput.value;

        ctx.lineWidth =
            lineWidth;
    }


    // ERASER

    else if (currentMode === "eraser") {

        ctx.globalCompositeOperation =
            "destination-out";

        ctx.lineWidth =
            eraserSize;
    }


    ctx.lineTo(pos.x, pos.y);

    ctx.stroke();

    ctx.beginPath();

    ctx.moveTo(pos.x, pos.y);

});


// ====================
// STOP DRAWING
// ====================

canvas.addEventListener("pointerup", (e) => {

    isPainting = false;

    ctx.beginPath();

    if (canvas.hasPointerCapture(e.pointerId)) {

        canvas.releasePointerCapture(
            e.pointerId
        );

    }

});


// ====================
// POINTER CANCEL
// ====================

canvas.addEventListener("pointercancel", (e) => {

    isPainting = false;

    ctx.beginPath();

    if (canvas.hasPointerCapture(e.pointerId)) {

        canvas.releasePointerCapture(
            e.pointerId
        );

    }

});


// ====================
// CLEAR
// ====================

clearButton.addEventListener("click", () => {

    ctx.globalCompositeOperation =
        "source-over";

    ctx.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
    );


    // Draw background image again

    if (backgroundImage) {

        drawBackgroundImage(
            backgroundImage
        );

    }

});


// ====================
// DRAW BACKGROUND IMAGE
// ====================

function drawBackgroundImage(img) {

    ctx.globalCompositeOperation =
        "source-over";

    const hRatio = canvas.width / img.width;
    const vRatio = canvas.height / img.height;
    const ratio = Math.min(hRatio, vRatio);
    const newWidth = img.width * ratio;
    const newHeight = img.height * ratio;
    const x = (canvas.width - newWidth) / 2;
    const y = (canvas.height - newHeight) / 2;

    ctx.drawImage(
        img,
        x,
        y,
        newWidth,
        newHeight
    );

}


// ====================
// UPLOAD MODAL
// ====================

const modal = document.getElementById("myModal");
const uploadButton = document.getElementById("myBtn");
const closeButton = document.getElementsByClassName("close")[0];


uploadButton.onclick = function () {

    modal.style.display = "block";

};


closeButton.onclick = function () {

    modal.style.display = "none";

};


window.addEventListener("click", (event) => {

    if (event.target === modal) {

        modal.style.display = "none";

    }

});


// ====================
// IMAGE UPLOAD
// ====================

const imageForm = document.getElementById("imageForm");
const imageInput = document.getElementById("imageInput");

imageForm.addEventListener("submit", (e) => {

    e.preventDefault();

    const file =
        imageInput.files[0];


    if (!file) {

        alert("Silakan pilih gambar.");

        return;

    }


    const reader =
        new FileReader();


    reader.onload = (event) => {

        const img =
            new Image();


        img.onload = () => {

            backgroundImage = img;

            ctx.clearRect(
                0,
                0,
                canvas.width,
                canvas.height
            );

            drawBackgroundImage(img);

            modal.style.display = "none";

            imageForm.reset();

        };


        img.src =
            event.target.result;

    };


    reader.readAsDataURL(file);

});

// ====================
// SEND TO GALLERY
// ====================

const sendButton = document.getElementById("send");

sendButton.addEventListener(
    "click",
    async () => {

        const name =
            document
                .getElementById("name")
                .value
                .trim();

        const message =
            document
                .querySelector("textarea")
                .value
                .trim();

        // ====================
        // VALIDATION
        // ====================

        if (!name) {
            alert("Insert your Muse.");
            return;
        }

        if (!message) {
            alert("Insert your messages.");
            return;
        }

        try {

            // ====================
            // CANVAS → PNG
            // ====================

            const imageBlob = await new Promise((resolve) => {
                    canvas.toBlob(
                        resolve,
                        "image/png"
                    );
                });

            if (!imageBlob) {
                alert(
                    "Artwork failed to make."
                );
                return;
            }


            // ====================
            // FILE NAME
            // ====================

            const fileName =
                `${Date.now()}-${crypto.randomUUID()}.png`;

            // ====================
            // UPLOAD IMAGE
            // SUPABASE STORAGE
            // ====================

            const {
                error: uploadError
            } =
                await supabaseClient
                    .storage
                    .from("drawings")
                    .upload(
                        fileName,
                        imageBlob,
                        {
                            contentType:
                                "image/png",

                            upsert:
                                false
                        }
                    );

            if (uploadError) {

                console.error(
                    "Upload error:",
                    uploadError
                );

                alert(
                    "Art failed to upload."
                );

                return;
            }


            // ====================
            // GET IMAGE URL
            // ====================

            const {
                data: publicUrlData
            } =
                supabaseClient
                    .storage
                    .from("drawings")
                    .getPublicUrl(fileName);


            const imageUrl =
                publicUrlData.publicUrl;


            // ====================
            // SAVE MESSAGE
            // SUPABASE DATABASE
            // ====================

            const {
                error: insertError
            } =
                await supabaseClient
                    .from("messages")
                    .insert({

                        name:
                            name,

                        message:
                            message,

                        image_url:
                            imageUrl

                    });


            if (insertError) {

        console.error("DATABASE ERROR:", insertError);

            alert(
                "Message failed to save:\n" +
                insertError.message
            );

            return;
            }


            // ====================
            // SUCCESS
            // ====================

            alert(
                "Your message successfully sent!"
            );


            window.location.href =
                "gallery.html";

        }

        catch (error) {

            console.error(
                "Unexpected error:",
                error
            );

            alert(
                "Unexpected error when sending the message."
            );

        }

    }
);
