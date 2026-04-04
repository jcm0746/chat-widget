(function () {
  const script = document.currentScript;

  const webhook = script.getAttribute("data-webhook");
  const color = script.getAttribute("data-color") || "#2563eb";
  const name = script.getAttribute("data-name") || "AI Assistant";

  const sessionId = Math.random().toString(36).substring(2);

  // ===== BUBBLE =====
  const bubble = document.createElement("div");
  bubble.innerHTML = "💬";
  bubble.style = `
    position:fixed;
    bottom:20px;
    right:20px;
    width:64px;
    height:64px;
    border-radius:50%;
    background:${color};
    color:white;
    display:flex;
    justify-content:center;
    align-items:center;
    cursor:pointer;
    font-size:26px;
    box-shadow:0 8px 20px rgba(0,0,0,0.25);
    transition:transform 0.2s ease;
    z-index:9999;
  `;

  bubble.onmouseenter = () => bubble.style.transform = "scale(1.1)";
  bubble.onmouseleave = () => bubble.style.transform = "scale(1)";

  document.body.appendChild(bubble);

  // ===== CHAT BOX =====
  const box = document.createElement("div");
  box.style = `
    position:fixed;
    bottom:100px;
    right:20px;
    width:360px;
    height:520px;
    background:white;
    border-radius:16px;
    box-shadow:0 20px 60px rgba(0,0,0,0.3);
    display:none;
    flex-direction:column;
    overflow:hidden;
    z-index:9999;
    animation:fadeIn 0.2s ease;
  `;

  // ===== HEADER =====
  const header = document.createElement("div");
  header.innerHTML = `
    <div style="font-size:16px;font-weight:600;">${name}</div>
    <div style="font-size:12px;opacity:0.8;">Typically replies instantly</div>
  `;
  header.style = `
    background:${color};
    color:white;
    padding:14px;
  `;

  // ===== MESSAGES =====
  const messages = document.createElement("div");
  messages.style = `
    flex:1;
    padding:14px;
    overflow-y:auto;
    display:flex;
    flex-direction:column;
    gap:10px;
    background:#f5f7fb;
  `;

  // ===== INPUT AREA =====
  const inputArea = document.createElement("div");
  inputArea.style = `
    display:flex;
    padding:10px;
    border-top:1px solid #eee;
    background:white;
  `;

  const input = document.createElement("input");
  input.placeholder = "Type your message...";
  input.style = `
    flex:1;
    padding:10px 12px;
    border-radius:10px;
    border:1px solid #ddd;
    outline:none;
    font-size:14px;
  `;

  const btn = document.createElement("button");
  btn.innerHTML = "➤";
  btn.style = `
    margin-left:8px;
    padding:10px 14px;
    border:none;
    border-radius:10px;
    background:${color};
    color:white;
    cursor:pointer;
    font-size:16px;
  `;

  inputArea.appendChild(input);
  inputArea.appendChild(btn);

  box.appendChild(header);
  box.appendChild(messages);
  box.appendChild(inputArea);

  document.body.appendChild(box);

  // ===== FUNCTIONS =====
  function toggleChat() {
    box.style.display = box.style.display === "flex" ? "none" : "flex";
  }

  bubble.onclick = toggleChat;

  function addMessage(text, type) {
    const msg = document.createElement("div");

    msg.innerText = text;

    msg.style = `
      padding:10px 12px;
      border-radius:12px;
      max-width:75%;
      font-size:14px;
      line-height:1.4;
      ${type === "user"
        ? `background:${color};color:white;align-self:flex-end;`
        : `background:white;border:1px solid #eee;align-self:flex-start;`}
    `;

    messages.appendChild(msg);
    msg.scrollIntoView({ behavior: "smooth" });
  }

  async function sendMessage() {
    const text = input.value;
    if (!text) return;

    addMessage(text, "user");
    input.value = "";

    const typing = document.createElement("div");
    typing.innerText = "Typing...";
    typing.style = `
      padding:10px;
      border-radius:12px;
      background:white;
      border:1px solid #eee;
      width:fit-content;
    `;
    messages.appendChild(typing);

    try {
      const res = await fetch(webhook, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          session_id: sessionId
        })
      });

      const data = await res.json();

      typing.remove();
      addMessage(data.reply || "No response", "bot");

    } catch (err) {
      typing.remove();
      addMessage("Connection error", "bot");
    }
  }

  btn.onclick = sendMessage;

  input.addEventListener("keypress", function (e) {
    if (e.key === "Enter") sendMessage();
  });

})();
