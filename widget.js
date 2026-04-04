(function () {
  const script = document.currentScript;

  const webhook = script.getAttribute("data-webhook");
  const color = script.getAttribute("data-color") || "#007bff";
  const name = script.getAttribute("data-name") || "AI Assistant";

  const sessionId = Math.random().toString(36).substring(2);

  // ===== CREATE BUBBLE =====
  const bubble = document.createElement("div");
  bubble.innerHTML = "💬";
  bubble.style = `
    position:fixed;
    bottom:20px;
    right:20px;
    width:60px;
    height:60px;
    border-radius:50%;
    background:${color};
    color:white;
    display:flex;
    justify-content:center;
    align-items:center;
    cursor:pointer;
    font-size:24px;
    z-index:9999;
  `;

  document.body.appendChild(bubble);

  // ===== CREATE CHAT BOX =====
  const box = document.createElement("div");
  box.style = `
    position:fixed;
    bottom:90px;
    right:20px;
    width:350px;
    height:500px;
    background:white;
    border-radius:12px;
    box-shadow:0 10px 30px rgba(0,0,0,0.2);
    display:none;
    flex-direction:column;
    overflow:hidden;
    z-index:9999;
  `;

  // Header
  const header = document.createElement("div");
  header.innerText = name;
  header.style = `
    background:${color};
    color:white;
    padding:12px;
    font-weight:bold;
  `;

  // Messages
  const messages = document.createElement("div");
  messages.style = `
    flex:1;
    padding:10px;
    overflow-y:auto;
    display:flex;
    flex-direction:column;
    background:#f9f9f9;
  `;

  // Input area
  const inputArea = document.createElement("div");
  inputArea.style = `
    display:flex;
    border-top:1px solid #ccc;
  `;

  const input = document.createElement("input");
  input.placeholder = "Type a message...";
  input.style = `
    flex:1;
    padding:10px;
    border:none;
    outline:none;
  `;

  const btn = document.createElement("button");
  btn.innerText = "Send";
  btn.style = `
    padding:10px;
    border:none;
    background:${color};
    color:white;
    cursor:pointer;
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
      margin:5px 0;
      padding:8px;
      border-radius:8px;
      max-width:80%;
      ${type === "user"
        ? `background:${color};color:white;align-self:flex-end;`
        : `background:#e5e5ea;align-self:flex-start;`}
    `;
    messages.appendChild(msg);
    msg.scrollIntoView({ behavior: "smooth" });
  }

  async function sendMessage() {
    const text = input.value;
    if (!text) return;

    addMessage(text, "user");
    input.value = "";

    // typing indicator
    const typing = document.createElement("div");
    typing.innerText = "Typing...";
    typing.style = `
      margin:5px 0;
      padding:8px;
      border-radius:8px;
      background:#e5e5ea;
      max-width:80%;
    `;
    messages.appendChild(typing);

    try {
      const res = await fetch(webhook, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
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
      addMessage("Error connecting", "bot");
    }
  }

  btn.onclick = sendMessage;
  input.addEventListener("keypress", function (e) {
    if (e.key === "Enter") sendMessage();
  });
})();
