(function () {
  const scriptTag = document.currentScript;

  const webhook = scriptTag.dataset.webhook;
  const clientId = scriptTag.dataset.clientId;
  const botName = scriptTag.dataset.name || "Assistant";

  const sessionId = Math.random().toString(36).substring(2);

  // ===== STATE =====
  let userRoute = null;

  // ===== BUBBLE =====
  const bubble = document.createElement("div");
  bubble.innerHTML = "Chat here";
  bubble.style = `
    position:fixed; bottom:20px; right:20px;
    height:60px; padding:0 18px;
    border-radius:30px;
    background:black; color:white;
    display:flex; justify-content:center; align-items:center;
    cursor:pointer; font-size:14px; font-weight:500;
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
  header.innerHTML = `<div style="text-align:center;font-size:16px;font-weight:500;">${botName}</div>`;
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
  btn.style = `
    margin-left:8px;padding:10px;
    border:none;border-radius:8px;
    background:black;color:white;cursor:pointer;
  `;

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
      max-width:80%; padding:10px 12px;
      border-radius:10px; font-size:14px;
      ${
        type === "user"
          ? "align-self:flex-end;background:black;color:white;"
          : "align-self:flex-start;background:#f5f5f5;color:black;"
      }
    `;

    msg.innerText = text;
    messages.appendChild(msg);
    msg.scrollIntoView({ behavior: "smooth" });
  }

  // ===== QUICK REPLIES =====
  function addQuickReplies(options) {
    if (!options || options.length === 0) return;

    const container = document.createElement("div");
    container.style = `
      display:flex;
      flex-wrap:wrap;
      gap:8px;
      margin-top:6px;
    `;

    options.forEach(option => {
      const b = document.createElement("button");
      b.innerText = option;

      b.style = `
        background:white;
        border:1px solid #ddd;
        border-radius:20px;
        padding:8px 12px;
        font-size:13px;
        cursor:pointer;
      `;

      b.onmouseenter = () => {
        b.style.background = "black";
        b.style.color = "white";
      };

      b.onmouseleave = () => {
        b.style.background = "white";
        b.style.color = "black";
      };

      b.onclick = () => {
        addMessage(option, "user");
        container.remove();
        sendMessage(option);
      };

      container.appendChild(b);
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
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          message: text,
          session_id: sessionId,
          client_id: clientId
        })
      });

      const data = await res.json();
      typing.remove();

      const reply = data.reply || "No response";
      addMessage(reply, "bot");

      // 🎨 APPLY BRANDING
      if (data.branding) {
        if (data.branding.color) {
          bubble.style.background = data.branding.color;
          btn.style.background = data.branding.color;
        }
        if (data.branding.name) {
          header.innerHTML = `<div style="text-align:center;font-size:16px;font-weight:500;">${data.branding.name}</div>`;
        }
      }

      // ⚡ QUICK REPLIES
      if (data.options) {
        addQuickReplies(data.options);
      }

      // 📅 BOOKING (TALLY)
      if (data.action === "book" && data.booking_url) {
        if (!document.querySelector(".tally-embed")) {
          const iframe = document.createElement("iframe");
          iframe.src = data.booking_url;
          iframe.className = "tally-embed";

          iframe.style.width = "100%";
          iframe.style.height = "500px";
          iframe.style.border = "none";
          iframe.style.marginTop = "10px";
          iframe.style.borderRadius = "10px";

          messages.appendChild(iframe);
          iframe.scrollIntoView({ behavior: "smooth" });
        }
      }

    } catch (err) {
      typing.remove();
      addMessage("Error connecting to server", "bot");
    }
  }

  btn.onclick = () => sendMessage();

  input.addEventListener("keypress", e => {
    if (e.key === "Enter") sendMessage();
  });

  // ===== TOGGLE =====
  function toggleChat() {
    box.style.display = box.style.display === "flex" ? "none" : "flex";

    if (box.style.display === "flex" && messages.childElementCount === 0) {
      addMessage("Hi! How can I help you today?", "bot");
    }
  }

  bubble.onclick = toggleChat;

})();
