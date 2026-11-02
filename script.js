const input = document.getElementById("textInput");

function updateCounter() {

const text = input.value;

const words = text.trim()
    ? text.trim().split(/\s+/u).length
    : 0;

const characters = text.length;

const sentences = text.trim()
    ? (text.match(/[.!?]+(?=\s|$)/g) || []).length
    : 0;

const paragraphs = text.trim()
    ? text.trim().split(/\n\s*\n/).filter(p => p.trim()).length
    : 0;

document.getElementById("words").textContent = words;
document.getElementById("characters").textContent = characters;
document.getElementById("sentences").textContent = sentences;
document.getElementById("paragraphs").textContent = paragraphs;

}

input.addEventListener("input", updateCounter);

document.getElementById("clearBtn").addEventListener("click", () => {
input.value = "";
updateCounter();
});

document.getElementById("copyBtn").addEventListener("click", async () => {

if (!input.value) {
    alert("There is no text to copy!");
    return;
}

try {
    await navigator.clipboard.writeText(input.value);
    alert("Text copied successfully!");
} catch (error) {
    input.select();
    document.execCommand("copy");
    alert("Text copied!");
}

});