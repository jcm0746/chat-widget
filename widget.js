(function () {
  const script = document.currentScript;

  const webhook = script.getAttribute("data-webhook");
  const color = script.getAttribute("data-color") || "#2563eb";
  const name = script.getAttribute("data-name") || "Assistant";

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
    z-index:9999;
  `;
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
  `;

  // ===== HEADER =====
  const header = document.createElement("div");
  header.innerHTML = `
    <div style="display:flex;align-items:center;gap:10px;">
      <div style="
        width:36px;
        height:36px;
        border-radius:50%;
        background:white;
        color:${color};
        display:flex;
        align-items:center;
        justify-content:center;
        font-weight:bold;
      ">AI</div>
      <div>
        <div style="font-weight:600;">${name}</div>
        <div style="font-size:12px;opacity:0.8;">Online now</div>
      </div>
    </div>
  `;
  header.style = `
    background:${color};
    color:white;
    padding:12px;
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

  // ===== INPUT =====
  const inputArea = document.createElement("div");
  inputArea.style = `
    display:flex;
    padding:10px;
    border-top:1px solid #eee;
  `;

  const input = document.createElement("input");
  input.placeholder = "Type your message...";
  input.style = `
    flex:1;
    padding:10px;
    border-radius:10px;
    border:1px solid #ddd;
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

    if (box.style.display === "flex" && messages.childElementCount === 0) {
      addMessage("Hi! How can I help you today?", "bot");
    }
  }

  bubble.onclick = toggleChat;

  function addMessage(text, type) {
    const msg = document.createElement("div");

    msg.style = `
      display:flex;
      align-items:flex-end;
      gap:6px;
      max-width:80%;
      ${type === "user" ? "align-self:flex-end;" : ""}
    `;

    if (type === "bot") {
      const avatar = document.createElement("div");
      avatar.innerHTML = "AI";
      avatar.style = `
        width:28px;
        height:28px;
        border-radius:50%;
        background:${color};
        color:white;
        font-size:12px;
        display:flex;
        align-items:center;
        justify-content:center;
      `;
      msg.appendChild(avatar);
    }

    const bubble = document.createElement("div");
    bubble.innerText = text;

    bubble.style = `
      padding:10px 12px;
      border-radius:12px;
      font-size:14px;
      background:${type === "user" ? color : "white"};
      color:${type === "user" ? "white" : "black"};
      border:${type === "bot" ? "1px solid #eee" : "none"};
    `;

    msg.appendChild(bubble);
    messages.appendChild(msg);

    msg.scrollIntoView({ behavior: "smooth" });
  }

  function showTyping() {
    const wrapper = document.createElement("div");
    wrapper.style = "display:flex;gap:6px;align-items:center;";

    const dots = document.createElement("div");
    dots.innerHTML = "● ● ●";
    dots.style = "opacity:0.5;";

    wrapper.appendChild(dots);
    messages.appendChild(wrapper);

    return wrapper;
  }

  async function sendMessage() {
    const text = input.value;
    if (!text) return;

    addMessage(text, "user");
    input.value = "";

    const typing = showTyping();

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

    } catch {
      typing.remove();
      addMessage("Error connecting", "bot");
    }
  }

  btn.onclick = sendMessage;

  input.addEventListener("keypress", (e) => {
    if (e.key === "Enter") sendMessage();
  });

})();
