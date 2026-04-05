(function () {
  const name = "Assistant";
  const webhook = "https://joemeeter.app.n8n.cloud/webhook/chatbot";
  const sessionId = Math.random().toString(36).substring(2);

  // ===== BUBBLE =====
  const bubble = document.createElement("div");
  bubble.innerHTML = "✦";
  bubble.style = `
    position:fixed; bottom:20px; right:20px;
    width:60px; height:60px; border-radius:50%;
    background:black; color:white;
    display:flex; justify-content:center; align-items:center;
    cursor:pointer; font-size:20px;
    box-shadow:0 8px 20px rgba(0,0,0,0.2);
    z-index:9999;
  `;
  document.body.appendChild(bubble);

  // ===== CHAT BOX =====
  const box = document.createElement("div");
  box.style = `
    position:fixed; bottom:90px; right:20px;
    width:360px; height:520px;
    background:white; border-radius:16px;
    box-shadow:0 20px 50px rgba(0,0,0,0.2);
    display:none; flex-direction:column;
    overflow:hidden; z-index:9999;
  `;

  // ===== HEADER =====
  const header = document.createElement("div");
  header.innerHTML = `<div style="text-align:center;font-size:16px;font-weight:500;">${name}</div>`;
  header.style = `padding:16px;border-bottom:1px solid #eee;`;

  // ===== MESSAGES =====
  const messages = document.createElement("div");
  messages.style = `
    flex:1; padding:14px; overflow-y:auto;
    display:flex; flex-direction:column; gap:10px;
  `;

  // ===== INPUT =====
  const inputArea = document.createElement("div");
  inputArea.style = `display:flex;padding:10px;border-top:1px solid #eee;`;

  const input = document.createElement("input");
  input.placeholder = "Type your message...";
  input.style = `flex:1;padding:10px;border-radius:8px;border:1px solid #ddd;`;

  const btn = document.createElement("button");
  btn.innerHTML = "➤";
  btn.style = `margin-left:8px;padding:10px;border:none;border-radius:8px;background:black;color:white;cursor:pointer;`;

  inputArea.appendChild(input);
  inputArea.appendChild(btn);

  box.appendChild(header);
  box.appendChild(messages);
  box.appendChild(inputArea);
  document.body.appendChild(box);

  // ===== ADD MESSAGE =====
  function addMessage(text, type) {
    const msg = document.createElement("div");
    msg.style = `
      max-width:80%; padding:10px 12px; border-radius:10px; font-size:14px;
      ${type === "user"
        ? "align-self:flex-end;background:black;color:white;"
        : "align-self:flex-start;background:#f5f5f5;color:black;"}
    `;
    msg.innerText = text;
    messages.appendChild(msg);
    msg.scrollIntoView({ behavior: "smooth" });
  }

  // ===== QUICK REPLIES =====
  function addQuickReplies(options) {
    const container = document.createElement("div");
    container.style = `
      display:flex;
      flex-wrap:wrap;
      gap:8px;
      padding-top:6px;
    `;

    options.forEach(option => {
      const btn = document.createElement("button");
      btn.innerText = option;

      btn.style = `
        background:white;
        border:1px solid #ddd;
        border-radius:20px;
        padding:8px 12px;
        font-size:13px;
        cursor:pointer;
      `;

      btn.onmouseenter = () => {
        btn.style.background = "black";
        btn.style.color = "white";
      };
      btn.onmouseleave = () => {
        btn.style.background = "white";
        btn.style.color = "black";
      };

      btn.onclick = () => {
        addMessage(option, "user");
        container.remove();
        sendMessage(option);
      };

      container.appendChild(btn);
    });

    messages.appendChild(container);
    container.scrollIntoView({ behavior: "smooth" });
  }

  // ===== TYPING =====
  function showTyping() {
    const wrapper = document.createElement("div");
    wrapper.style = "display:flex;gap:6px;";

    const dot = () => {
      const d = document.createElement("div");
      d.style = `
        width:6px;height:6px;border-radius:50%;
        background:#999;animation:blink 1.4s infinite;
      `;
      return d;
    };

    const d1 = dot();
    const d2 = dot();
    const d3 = dot();
    d2.style.animationDelay = "0.2s";
    d3.style.animationDelay = "0.4s";

    wrapper.append(d1, d2, d3);
    messages.appendChild(wrapper);
    return wrapper;
  }

  const style = document.createElement("style");
  style.innerHTML = `
    @keyframes blink {
      0%, 80%, 100% { opacity: 0.3; }
      40% { opacity: 1; }
    }
  `;
  document.head.appendChild(style);

  // ===== SEND MESSAGE =====
  async function sendMessage(forcedText = null) {
    const text = forcedText || input.value;
    if (!text) return;

    if (!forcedText) {
      addMessage(text, "user");
      input.value = "";
    }

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

      const reply =
        data.reply ||
        data.response ||
        data.output ||
        (Array.isArray(data) ? data[0]?.json?.reply : null) ||
        "No response";

      addMessage(reply, "bot");

      // 🔥 RE-ADD SMART OPTIONS AFTER RESPONSE
      addQuickReplies([
        "Book appointment",
        "See pricing",
        "Ask another question"
      ]);

    } catch (err) {
      typing.remove();
      addMessage("Error connecting to server", "bot");
    }
  }

  btn.onclick = () => sendMessage();
  input.addEventListener("keypress", e => {
    if (e.key === "Enter") sendMessage();
  });

  // ===== TOGGLE CHAT =====
  function toggleChat() {
    box.style.display = box.style.display === "flex" ? "none" : "flex";

    if (box.style.display === "flex" && messages.childElementCount === 0) {
      addMessage("Hi! How can I help you today?", "bot");

      // 🔥 INITIAL OPTIONS
      addQuickReplies([
        "Book an appointment",
        "Botox / Fillers",
        "Pricing",
        "Skin treatments",
        "Talk to someone"
      ]);
    }
  }

  bubble.onclick = toggleChat;

})();
