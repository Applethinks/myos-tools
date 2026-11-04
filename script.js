const $ = (id) => document.getElementById(id);
const toolGrid = $("toolGrid");
const cards = [...document.querySelectorAll(".tool-card")];
const chips = [...document.querySelectorAll(".chip")];
let activeFilter = "all";
let toastTimer;

$("year").textContent = new Date().getFullYear();

function showToast(message) {
  const toast = $("toast");
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 2200);
}

function filterTools(filter, search = $("toolSearch").value.trim().toLowerCase()) {
  activeFilter = filter;
  let visible = 0;
  cards.forEach(card => {
    const categoryMatch = filter === "all" || card.dataset.category === filter;
    const searchMatch = `${card.dataset.name} ${card.dataset.description} ${card.dataset.category}`.toLowerCase().includes(search);
    const show = categoryMatch && searchMatch;
    card.hidden = !show;
    if (show) visible++;
  });
  chips.forEach(chip => chip.classList.toggle("selected", chip.dataset.filter === filter));
  $("resultCount").textContent = `${visible} ${visible === 1 ? "tool" : "tools"}`;
  $("emptyState").hidden = visible !== 0;
  const titles = {all:"All tools",text:"Text tools",developer:"Developer tools",converters:"Converters",generators:"Generators"};
  $("listingTitle").textContent = titles[filter] || "All tools";
}

chips.forEach(chip => chip.addEventListener("click", () => filterTools(chip.dataset.filter)));
$("toolSearch").addEventListener("input", () => filterTools(activeFilter));
document.querySelectorAll(".nav-link[data-category]").forEach(link => {
  link.addEventListener("click", (event) => {
    const category = link.dataset.category;
    if (category === "about") return;
    event.preventDefault();
    filterTools(category);
    $("tools").scrollIntoView({behavior:"smooth"});
    document.querySelectorAll(".nav-link").forEach(item => item.classList.remove("active"));
    link.classList.add("active");
    closeMenu();
  });
});
document.querySelector('.nav-link[href="#home"]').addEventListener("click", () => {
  filterTools("all");
  closeMenu();
});
$("menuToggle").addEventListener("click", () => {
  const open = $("mainNav").classList.toggle("open");
  $("menuToggle").setAttribute("aria-expanded", String(open));
});
function closeMenu() {
  $("mainNav").classList.remove("open");
  $("menuToggle").setAttribute("aria-expanded", "false");
}
document.addEventListener("keydown", (event) => {
  if (event.key === "/" && !["INPUT","TEXTAREA"].includes(document.activeElement.tagName)) {
    event.preventDefault(); $("toolSearch").focus();
  }
  if (event.key === "Escape") { closeMenu(); if (!$("workspace").hidden) $("backToTools").click(); }
});

const categoryNames = {text:"TEXT TOOLS",developer:"DEVELOPER TOOLS",converters:"CONVERTERS",generators:"GENERATORS"};
const templates = {
  counter: () => `
    <label class="field-label" for="counterInput">Your text</label>
    <textarea class="area" id="counterInput" placeholder="Start typing or paste your text here..."></textarea>
    <div class="stats">
      <div class="stat"><strong id="wordCount">0</strong><span>Words</span></div>
      <div class="stat"><strong id="charCount">0</strong><span>Characters</span></div>
      <div class="stat"><strong id="sentenceCount">0</strong><span>Sentences</span></div>
      <div class="stat"><strong id="paragraphCount">0</strong><span>Paragraphs</span></div>
    </div>
    <div class="tool-row"><button class="action secondary" id="counterCopy">Copy text</button><button class="action secondary" id="counterClear">Clear</button></div>`,
  case: () => `
    <label class="field-label" for="caseInput">Your text</label><textarea class="area" id="caseInput" placeholder="Enter text to convert..."></textarea>
    <div class="tool-row"><button class="action" data-case="upper">UPPERCASE</button><button class="action secondary" data-case="lower">lowercase</button><button class="action secondary" data-case="title">Title Case</button><button class="action secondary" data-case="sentence">Sentence case</button></div>
    <div class="field-group" style="margin-top:16px"><label class="field-label" for="caseOutput">Result</label><textarea class="area" id="caseOutput" placeholder="Your converted text will appear here..."></textarea></div>
    <button class="action secondary" id="caseCopy">Copy result</button>`,
  replace: () => `
    <div class="field-group"><label class="field-label" for="replaceInput">Your text</label><textarea class="area" id="replaceInput" placeholder="Paste or type your text..."></textarea></div>
    <div class="two-cols"><div class="field-group"><label class="field-label" for="findText">Find</label><input class="field" id="findText" placeholder="Word or phrase"></div><div class="field-group"><label class="field-label" for="replaceText">Replace with</label><input class="field" id="replaceText" placeholder="Replacement"></div></div>
    <div class="tool-row"><button class="action" id="replaceBtn">Replace all</button><button class="action secondary" id="replaceCopy">Copy result</button></div>
    <p class="message" id="replaceMessage"></p>`,
  json: () => `
    <label class="field-label" for="jsonInput">JSON input</label><textarea class="area" id="jsonInput" placeholder='{"name":"MYOS","tools":8}'></textarea>
    <div class="tool-row"><button class="action" id="formatJson">Format JSON</button><button class="action secondary" id="minifyJson">Minify</button><button class="action secondary" id="copyJson">Copy result</button></div>
    <p class="message" id="jsonMessage"></p><div class="field-group" style="margin-top:14px"><label class="field-label" for="jsonOutput">Result</label><textarea class="area" id="jsonOutput" readonly placeholder="Formatted JSON will appear here..."></textarea></div>`,
  html: () => `
    <label class="field-label" for="htmlInput">HTML input</label><textarea class="area" id="htmlInput" placeholder="<div><h1>Hello</h1><p>Welcome</p></div>"></textarea>
    <div class="tool-row"><button class="action" id="formatHtml">Format HTML</button><button class="action secondary" id="copyHtml">Copy result</button></div>
    <p class="message" id="htmlMessage">Basic indentation formatter. It does not replace a full HTML parser.</p>
    <div class="field-group" style="margin-top:14px"><label class="field-label" for="htmlOutput">Formatted HTML</label><textarea class="area" id="htmlOutput" readonly></textarea></div>`,
  binary: () => `
    <div class="field-group"><label class="field-label" for="binaryInput">Enter a number</label><input class="field" id="binaryInput" inputmode="numeric" placeholder="Example: 1010"></div>
    <div class="tool-row"><button class="action" id="toDecimal">Binary → Decimal</button><button class="action secondary" id="toBinary">Decimal → Binary</button></div>
    <p class="message" id="binaryMessage"></p><div class="field-group" style="margin-top:12px"><label class="field-label" for="binaryOutput">Result</label><input class="field" id="binaryOutput" readonly></div>`,
  base64: () => `
    <div class="field-group"><label class="field-label" for="baseInput">Input text or Base64</label><textarea class="area" id="baseInput" placeholder="Enter text to encode, or Base64 to decode..."></textarea></div>
    <div class="tool-row"><button class="action" id="encodeBase">Encode</button><button class="action secondary" id="decodeBase">Decode</button><button class="action secondary" id="copyBase">Copy result</button></div>
    <p class="message" id="baseMessage"></p><div class="field-group" style="margin-top:12px"><label class="field-label" for="baseOutput">Result</label><textarea class="area" id="baseOutput" readonly></textarea></div>`,
  password: () => `
    <div class="field-group"><label class="field-label" for="passwordLength">Password length: <strong id="lengthValue">16</strong></label><input class="field" type="range" id="passwordLength" min="8" max="64" value="16"></div>
    <div class="inline-options"><label><input type="checkbox" id="includeUpper" checked> Uppercase</label><label><input type="checkbox" id="includeLower" checked> Lowercase</label><label><input type="checkbox" id="includeNumbers" checked> Numbers</label><label><input type="checkbox" id="includeSymbols"> Symbols</label></div>
    <div class="field-group"><label class="field-label" for="passwordOutput">Generated password</label><input class="field" id="passwordOutput" readonly placeholder="Tap Generate"></div>
    <div class="tool-row"><button class="action" id="generatePassword">Generate password</button><button class="action secondary" id="copyPassword">Copy password</button></div>
    <p class="message" id="passwordMessage">Password is generated locally in your browser. Don't reuse passwords across accounts.</p>`
,
  qr: () => `
    <div class="qr-shell">
      <div class="qr-intro"><span class="qr-kicker">MYOS GENERATOR</span><h3>Create your QR code</h3><p>Turn text, a website, or a shareable file link into a custom QR code.</p></div>
      <div class="qr-tabs" role="tablist" aria-label="QR content type">
        <button class="qr-tab active" type="button" data-qr-mode="text">Text / URL</button>
        <button class="qr-tab" type="button" data-qr-mode="image">Image</button>
        <button class="qr-tab" type="button" data-qr-mode="pdf">PDF</button>
      </div>
      <div class="qr-layout"><div class="qr-controls">
        <section class="qr-mode-panel" id="qrTextPanel">
          <div class="field-group"><label class="field-label" for="qrText">Text or website URL</label><textarea class="area" id="qrText" placeholder="https://example.com or type any text..."></textarea></div>
        </section>
        <section class="qr-mode-panel" id="qrFilePanel" hidden>
          <div class="upload-card">
            <div class="upload-symbol" id="qrUploadSymbol">↥</div>
            <strong id="qrUploadTitle">Choose an image</strong>
            <p id="qrUploadDescription">Select an image from your device. JPG, PNG, WebP, GIF and other browser-supported image formats.</p>
            <label class="action secondary upload-button" for="qrFile">Browse files</label>
            <input class="visually-hidden" type="file" id="qrFile" accept="image/*">
            <div class="selected-file" id="qrSelectedFile" hidden></div>
          </div>
          <div class="field-group" style="margin-top:16px"><label class="field-label" for="qrFileUrl">Public share link for this file</label><input class="field" id="qrFileUrl" type="url" placeholder="https://..." autocomplete="url"><p class="qr-hint">A QR code cannot carry a full image or PDF attachment. Upload this file to Google Drive, Dropbox or your website, set access to anyone with the link, then paste that share link here. Scanning the QR will open the file.</p></div>
        </section>
        <div class="qr-settings">
          <div class="two-cols"><div class="field-group"><label class="field-label" for="qrSize">QR size</label><select class="field" id="qrSize"><option value="256">256 px</option><option value="384" selected>384 px</option><option value="512">512 px</option><option value="768">768 px</option></select></div><div class="field-group"><label class="field-label" for="qrShape">Dot shape</label><select class="field" id="qrShape"><option value="square">Square</option><option value="dots">Round dots</option><option value="rounded">Rounded</option><option value="classy">Classy</option><option value="classy-rounded">Classy rounded</option><option value="extra-rounded">Extra rounded</option></select></div></div>
          <div class="two-cols"><div class="field-group"><label class="field-label" for="qrEyeShape">Corner frame</label><select class="field" id="qrEyeShape"><option value="square">Square</option><option value="dot">Round</option><option value="extra-rounded" selected>Extra rounded</option></select></div><div class="field-group"><label class="field-label" for="qrEyeDot">Corner centre</label><select class="field" id="qrEyeDot"><option value="square">Square</option><option value="dot" selected>Round</option></select></div></div>
          <div class="field-group"><label class="field-label">Foreground gradient</label><div class="color-pair"><label class="color-control">Start <input type="color" id="qrColor1" value="#16c784"></label><label class="color-control">End <input type="color" id="qrColor2" value="#2674e8"></label></div></div>
          <div class="field-group"><label class="field-label" for="qrBg">Background colour</label><input class="field" type="color" id="qrBg" value="#ffffff" style="height:42px;padding:4px"><label class="qr-check"><input type="checkbox" id="qrTransparent"> Transparent background</label></div>
          <div class="field-group"><label class="field-label" for="qrLogo">Add your logo (optional)</label><label class="file-pick" for="qrLogo">＋ <span>Choose logo image</span></label><input class="visually-hidden" type="file" id="qrLogo" accept="image/*"><p class="qr-hint" id="qrLogoName">PNG, JPG or WebP. Use a small logo for best scan reliability.</p></div>
        </div>
        <div class="tool-row"><button class="action" id="makeQr">Generate QR code</button><button class="action secondary" id="downloadQr" disabled>Download PNG</button><button class="action secondary" id="downloadQrSvg" disabled>Download SVG</button></div>
        <p class="message" id="qrMessage" aria-live="polite">Choose a content type to get started.</p>
      </div><aside class="qr-result"><div class="qr-result-head"><span class="qr-kicker">LIVE PREVIEW</span><span class="preview-status"><i></i> READY</span></div><div class="qr-preview" id="qrPreview"><div class="qr-empty"><span>▦</span><strong>Your QR code</strong><small>Your generated code will appear here.</small></div></div><p class="qr-result-note">Tip: test your QR code with a phone camera before sharing it.</p></aside></div>
    </div>`
};

function openTool(card) {
  const tool = card.dataset.tool;
  $("workspaceTitle").textContent = card.dataset.name;
  $("workspaceDescription").textContent = card.dataset.description;
  $("workspaceCategory").textContent = categoryNames[card.dataset.category];
  $("workspacePanel").innerHTML = templates[tool]();
  $("workspace").hidden = false;
  $("tools").hidden = true;
  document.body.classList.add("tool-open");
  $("workspace").scrollIntoView({behavior:"smooth", block:"start"});
  bindTool(tool);
}
cards.forEach(card => card.addEventListener("click", () => openTool(card)));
$("backToTools").addEventListener("click", () => {
  $("workspace").hidden = true; $("tools").hidden = false;
  document.body.classList.remove("tool-open");
  $("tools").scrollIntoView({behavior:"smooth", block:"start"});
});

async function copyValue(value) {
  if (!value) { showToast("Nothing to copy yet"); return; }
  try {
    await navigator.clipboard.writeText(value);
    showToast("Copied to clipboard");
  } catch {
    const temp = document.createElement("textarea");
    temp.value = value; document.body.appendChild(temp); temp.select();
    document.execCommand("copy"); temp.remove(); showToast("Copied to clipboard");
  }
}
function setMessage(id, text, type="") {
  const el = $(id); if (!el) return;
  el.textContent = text; el.className = `message ${type}`;
}
function bindTool(tool) {
  if (tool === "counter") {
    const input = $("counterInput");
    const update = () => {
      const text = input.value;
      $("wordCount").textContent = text.trim() ? text.trim().split(/\s+/u).length : 0;
      $("charCount").textContent = text.length;
      $("sentenceCount").textContent = text.trim() ? (text.match(/[.!?]+(?=\s|$)/g) || []).length : 0;
      $("paragraphCount").textContent = text.trim() ? text.trim().split(/\n\s*\n/).filter(p => p.trim()).length : 0;
    };
    input.addEventListener("input", update);
    $("counterClear").addEventListener("click", () => { input.value = ""; update(); });
    $("counterCopy").addEventListener("click", () => copyValue(input.value));
  }
  if (tool === "case") {
    document.querySelectorAll("[data-case]").forEach(btn => btn.addEventListener("click", () => {
      const text = $("caseInput").value;
      let result = text;
      if (btn.dataset.case === "upper") result = text.toUpperCase();
      if (btn.dataset.case === "lower") result = text.toLowerCase();
      if (btn.dataset.case === "title") result = text.toLowerCase().replace(/\b\p{L}/gu, c => c.toUpperCase());
      if (btn.dataset.case === "sentence") result = text.toLowerCase().replace(/(^\s*\p{L}|[.!?]\s+\p{L})/gu, c => c.toUpperCase());
      $("caseOutput").value = result;
    }));
    $("caseCopy").addEventListener("click", () => copyValue($("caseOutput").value));
  }
  if (tool === "replace") {
    $("replaceBtn").addEventListener("click", () => {
      const find = $("findText").value;
      if (!find) { setMessage("replaceMessage", "Enter something to find.", "error"); return; }
      const text = $("replaceInput").value;
      const escaped = find.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const result = text.replace(new RegExp(escaped, "gi"), () => $("replaceText").value);
      $("replaceInput").value = result;
      setMessage("replaceMessage", "Replacement complete.", "success");
    });
    $("replaceCopy").addEventListener("click", () => copyValue($("replaceInput").value));
  }
  if (tool === "json") {
    const process = (compact) => {
      try {
        const parsed = JSON.parse($("jsonInput").value);
        $("jsonOutput").value = JSON.stringify(parsed, null, compact ? 0 : 2);
        setMessage("jsonMessage", "Valid JSON. Formatting successful.", "success");
      } catch (error) { setMessage("jsonMessage", `Invalid JSON: ${error.message}`, "error"); }
    };
    $("formatJson").addEventListener("click", () => process(false));
    $("minifyJson").addEventListener("click", () => process(true));
    $("copyJson").addEventListener("click", () => copyValue($("jsonOutput").value));
  }
  if (tool === "html") {
    $("formatHtml").addEventListener("click", () => {
      const source = $("htmlInput").value.trim();
      if (!source) { setMessage("htmlMessage", "Enter some HTML first.", "error"); return; }
      const tokens = source.replace(/>\s*</g, ">\n<").split("\n");
      let depth = 0;
      const voidTags = /^(area|base|br|col|embed|hr|img|input|link|meta|param|source|track|wbr)$/i;
      const result = tokens.map(token => {
        const line = token.trim();
        if (!line) return "";
        if (/^<\/[^>]+>/.test(line)) depth = Math.max(0, depth - 1);
        const formatted = "  ".repeat(depth) + line;
        const opening = line.match(/^<([a-zA-Z][\w:-]*)\b[^>]*>$/);
        if (opening && !/^<!/.test(line) && !voidTags.test(opening[1]) && !/\/>$/.test(line) && !/^<\//.test(line)) depth++;
        return formatted;
      }).join("\n");
      $("htmlOutput").value = result;
      setMessage("htmlMessage", "Formatting complete. Review the result before using it.", "success");
    });
    $("copyHtml").addEventListener("click", () => copyValue($("htmlOutput").value));
  }
  if (tool === "binary") {
    $("toDecimal").addEventListener("click", () => {
      const value = $("binaryInput").value.trim();
      if (!/^[01]+$/.test(value)) { setMessage("binaryMessage", "Enter binary digits only (0 and 1).", "error"); return; }
      $("binaryOutput").value = BigInt("0b" + value).toString(10);
      setMessage("binaryMessage", "Converted successfully.", "success");
    });
    $("toBinary").addEventListener("click", () => {
      const value = $("binaryInput").value.trim();
      if (!/^\d+$/.test(value)) { setMessage("binaryMessage", "Enter a whole decimal number (0 or higher).", "error"); return; }
      $("binaryOutput").value = BigInt(value).toString(2);
      setMessage("binaryMessage", "Converted successfully.", "success");
    });
  }
  if (tool === "base64") {
    $("encodeBase").addEventListener("click", () => {
      try {
        const bytes = new TextEncoder().encode($("baseInput").value);
        let binary = ""; bytes.forEach(byte => binary += String.fromCharCode(byte));
        $("baseOutput").value = btoa(binary);
        setMessage("baseMessage", "Encoded successfully.", "success");
      } catch { setMessage("baseMessage", "Could not encode this input.", "error"); }
    });
    $("decodeBase").addEventListener("click", () => {
      try {
        const binary = atob($("baseInput").value.trim());
        const bytes = Uint8Array.from(binary, c => c.charCodeAt(0));
        $("baseOutput").value = new TextDecoder("utf-8", {fatal:true}).decode(bytes);
        setMessage("baseMessage", "Decoded successfully.", "success");
      } catch { setMessage("baseMessage", "Invalid Base64 input or unsupported text.", "error"); }
    });
    $("copyBase").addEventListener("click", () => copyValue($("baseOutput").value));
  }
  if (tool === "password") {
    const slider = $("passwordLength");
    slider.addEventListener("input", () => $("lengthValue").textContent = slider.value);
    $("generatePassword").addEventListener("click", () => {
      let chars = "";
      if ($("includeUpper").checked) chars += "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
      if ($("includeLower").checked) chars += "abcdefghijklmnopqrstuvwxyz";
      if ($("includeNumbers").checked) chars += "0123456789";
      if ($("includeSymbols").checked) chars += "!@#$%^&*()-_=+[]{}?";
      if (!chars) { setMessage("passwordMessage", "Select at least one character type.", "error"); return; }
      const random = new Uint32Array(Number(slider.value));
      crypto.getRandomValues(random);
      $("passwordOutput").value = Array.from(random, n => chars[n % chars.length]).join("");
      setMessage("passwordMessage", "Generated locally in your browser.", "success");
    });
    $("copyPassword").addEventListener("click", () => copyValue($("passwordOutput").value));
  }
  if (tool === "qr") {
    let qrInstance = null;
    let latestQrOptions = null;
    let logoData;
    let activeMode = "text";
    const fileInput = $("qrFile");
    const fileUrl = $("qrFileUrl");
    const logoInput = $("qrLogo");

    document.querySelectorAll("[data-qr-mode]").forEach(tab => tab.addEventListener("click", () => {
      activeMode = tab.dataset.qrMode;
      document.querySelectorAll("[data-qr-mode]").forEach(item => item.classList.toggle("active", item === tab));
      $("qrTextPanel").hidden = activeMode !== "text";
      $("qrFilePanel").hidden = activeMode === "text";
      if (activeMode === "image") {
        fileInput.accept = "image/*";
        $("qrUploadSymbol").textContent = "▧";
        $("qrUploadTitle").textContent = "Choose an image";
        $("qrUploadDescription").textContent = "Select JPG, PNG, WebP, GIF, SVG or another supported image format.";
      } else if (activeMode === "pdf") {
        fileInput.accept = ".pdf,application/pdf";
        $("qrUploadSymbol").textContent = "PDF";
        $("qrUploadTitle").textContent = "Choose a PDF";
        $("qrUploadDescription").textContent = "Select any PDF document from your device.";
      }
      fileInput.value = "";
      fileUrl.value = "";
      $("qrSelectedFile").hidden = true;
      setMessage("qrMessage", activeMode === "text" ? "Enter text or a website URL." : "Choose your file, then paste its public share link.");
    }));

    fileInput.addEventListener("change", () => {
      const file = fileInput.files && fileInput.files[0];
      if (!file) return;
      const valid = activeMode === "image" ? file.type.startsWith("image/") : (file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf"));
      if (!valid) {
        setMessage("qrMessage", activeMode === "image" ? "Please choose an image file." : "Please choose a PDF file.", "error");
        fileInput.value = ""; return;
      }
      $("qrSelectedFile").textContent = "✓ " + file.name + " · " + (file.size / 1024 / 1024).toFixed(2) + " MB";
      $("qrSelectedFile").hidden = false;
      setMessage("qrMessage", "File selected. Now paste its public share link above.", "success");
    });

    logoInput.addEventListener("change", () => {
      const file = logoInput.files && logoInput.files[0];
      if (!file) { logoData = undefined; $("qrLogoName").textContent = "PNG, JPG or WebP. Use a small logo for best scan reliability."; return; }
      if (!file.type.startsWith("image/")) { setMessage("qrMessage", "Please choose an image for the logo.", "error"); logoInput.value = ""; return; }
      const reader = new FileReader();
      reader.onload = () => { logoData = reader.result; $("qrLogoName").textContent = "Logo selected: " + file.name; };
      reader.onerror = () => setMessage("qrMessage", "Could not read that logo file.", "error");
      reader.readAsDataURL(file);
    });

    $("makeQr").addEventListener("click", () => {
      const text = activeMode === "text" ? $("qrText").value.trim() : fileUrl.value.trim();
      if (activeMode !== "text" && !fileInput.files.length) { setMessage("qrMessage", "Choose an image or PDF first.", "error"); return; }
      if (!text) { setMessage("qrMessage", activeMode === "text" ? "Enter text or a URL first." : "Paste the public share link for your selected file.", "error"); return; }
      try { new URL(text); } catch (_) {
        if (activeMode !== "text" || /^https?:\/\//i.test(text)) { setMessage("qrMessage", "Enter a valid public URL beginning with https:// or http://.", "error"); return; }
      }
      if (typeof QRCodeStyling === "undefined") { setMessage("qrMessage", "QR library did not load. Check your internet connection and reload the page.", "error"); return; }
      const size = Number($("qrSize").value);
      const options = {
        width:size, height:size, type:"canvas", data:text, image:logoData, margin:12,
        qrOptions:{errorCorrectionLevel: logoData ? "H" : "Q"},
        dotsOptions:{type:$("qrShape").value,gradient:{type:"linear",rotation:0,colorStops:[{offset:0,color:$("qrColor1").value},{offset:1,color:$("qrColor2").value}]}},
        backgroundOptions:{color:$("qrTransparent").checked ? "transparent" : $("qrBg").value},
        cornersSquareOptions:{type:$("qrEyeShape").value,color:$("qrColor1").value},
        cornersDotOptions:{type:$("qrEyeDot").value,color:$("qrColor2").value},
        imageOptions:{crossOrigin:"anonymous",margin:6,imageSize:0.22,hideBackgroundDots:true}
      };
      try {
        latestQrOptions = options;
        qrInstance = new QRCodeStyling(options);
        const preview = $("qrPreview"); preview.innerHTML = ""; qrInstance.append(preview);
        $("downloadQr").disabled = false; $("downloadQrSvg").disabled = false;
        setMessage("qrMessage", activeMode === "text" ? "QR code generated successfully." : "File-link QR generated. Anyone scanning it can open the public file link.", "success");
      } catch (error) { setMessage("qrMessage", "Could not generate this QR code. Try shorter content or remove the logo.", "error"); }
    });
    $("downloadQr").addEventListener("click", () => { if (qrInstance) qrInstance.download({name:"myos-qr-code",extension:"png"}); });
    $("downloadQrSvg").addEventListener("click", () => {
      if (!qrInstance || !latestQrOptions) return;
      const svgInstance = new QRCodeStyling({...latestQrOptions,type:"svg"});
      svgInstance.download({name:"myos-qr-code",extension:"svg"});
    });
  }
}

filterTools("all");
