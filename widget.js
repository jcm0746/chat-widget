(function () {
  const script = document.currentScript;

  const webhook = script.getAttribute("data-webhook");
  const color = script.getAttribute("data-color") || "#C49D68";
  const name = script.getAttribute("data-name") || "Assistant";

  const sessionId = Math.random().toString(36).substring(2);

  // ===== BUBBLE (NEW ICON) =====
  const bubble = document.createElement("div");
  bubble.innerHTML = "✦";
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
    font-size:24px;
    box-shadow:0 10px 25px rgba(0,0,0,0.3);
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
    border-radius:18px;
    box-shadow:0 25px 70px rgba(0,0,0,0.35);
    display:none;
    flex-direction:column;
    overflow:hidden;
    z-index:9999;
  `;

  // ===== HEADER WITH CLEAN AVATAR =====
  const header = document.createElement("div");
  header.innerHTML = `
    <div style="display:flex;align-items:center;gap:10px;">
      <div style="
        width:34px;
        height:34px;
        border-radius:50%;
        background:linear-gradient(135deg, ${color}, #60a5fa);
        display:flex;
        align-items:center;
        justify-content:center;
        color:white;
        font-size:14px;
      ">✦</div>
      <div>
        <div style="font-weight:600;">${name}</div>
        <div style="font-size:12px;opacity:0.8;">Online now</div>
      </div>
    </div>
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
      avatar.innerHTML = "✦";
      avatar.style = `
        width:30px;
        height:30px;
        border-radius:50%;
        background:linear-gradient(135deg, ${color}, #60a5fa);
        color:white;
        display:flex;
        align-items:center;
        justify-content:center;
        font-size:12px;
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

  // ===== REAL TYPING DOTS ANIMATION =====
  function showTyping() {
    const wrapper = document.createElement("div");
    wrapper.style = "display:flex;align-items:center;gap:6px;";

    const dot = () => {
      const d = document.createElement("div");
      d.style = `
        width:6px;
        height:6px;
        border-radius:50%;
        background:#999;
        animation:blink 1.4s infinite;
      `;
      return d;
    };

    const d1 = dot();
    const d2 = dot();
    const d3 = dot();

    d2.style.animationDelay = "0.2s";
    d3.style.animationDelay = "0.4s";

    wrapper.appendChild(d1);
    wrapper.appendChild(d2);
    wrapper.appendChild(d3);

    messages.appendChild(wrapper);

    return wrapper;
  }

  // inject animation
  const style = document.createElement("style");
  style.innerHTML = `
    @keyframes blink {
      0%, 80%, 100% { opacity: 0.3; transform: scale(1); }
      40% { opacity: 1; transform: scale(1.3); }
    }
  `;
  document.head.appendChild(style);

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
