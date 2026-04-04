(function() {
  const script = document.currentScript;

  const webhook = script.getAttribute("data-webhook");

  const bubble = document.createElement("div");
  bubble.innerHTML = "💬";
  bubble.style = "position:fixed;bottom:20px;right:20px;background:#007bff;color:white;width:60px;height:60px;border-radius:50%;display:flex;justify-content:center;align-items:center;cursor:pointer;z-index:9999;";

  document.body.appendChild(bubble);

  bubble.onclick = async () => {
    const msg = prompt("Ask something:");
    if (!msg) return;

    const res = await fetch(webhook, {
      method: "POST",
      headers: {"Content-Type":"application/json"},
      body: JSON.stringify({message: msg, session_id: "client"})
    });

    const data = await res.json();
    alert(data.reply);
  };
})();