const API = "http://192.168.1.50";

const state = {
  GlobalState: true,
  Valves: [],
};

const app = document.getElementById("app");
const globalBtn = document.getElementById("globalToggle");
const statusBar = document.getElementById("statusBar");

// Traccia quali input sono in focus (non sovrascrivere durante la modifica)
const editing = {};

// ---------------- CONNESSIONE ----------------
function setStatus(msg, color = "#888") {
  if (statusBar) {
    statusBar.textContent = msg;
    statusBar.style.color = color;
  }
}

// ---------------- LOAD (completo) ----------------
async function loadFromESP() {
  try {
    const res = await fetch(API + "/readprogram");
    const data = await res.json();
    Object.assign(state, data);
    return true;
  } catch (e) {
    console.log("fetch error", e);
    return false;
  }
}

// ---------------- SAVE ----------------
async function saveToESP() {
  try {
    await fetch(API + "/writeprogram", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(state),
    });
  } catch (e) {
    console.log("save error", e);
    setStatus("Errore salvataggio", "red");
  }
}

// ---------------- POLLING (solo stati) ----------------
async function pollStates() {
  try {
    const res = await fetch(API + "/readstates");
    const data = await res.json();
    state.GlobalState = data.GlobalState;
    data.States.forEach((s, i) => {
      if (state.Valves[i]) state.Valves[i].State = s;
    });
    setStatus("Connesso", "#4caf50");
    updateUI();
  } catch (e) {
    setStatus("ESP non raggiungibile", "red");
    // Mostra tutti i dot grigi
    state.Valves.forEach((_, i) => {
      const dot = document.getElementById(`dot_${i}`);
      if (dot) dot.className = "dot grey";
    });
  }
}

// ---------------- INIT ----------------
(async () => {
  setStatus("Connessione all'ESP...", "#888");

  let loaded = false;
  while (!loaded) {
    app.innerHTML = "<p class='loading'>Connessione all'ESP in corso...</p>";
    loaded = await loadFromESP();
    if (!loaded) {
      setStatus("ESP non raggiungibile, riprovo tra 2s...", "red");
      await new Promise((r) => setTimeout(r, 2000));
    }
  }

  render();
  setStatus("Connesso", "#4caf50");
  setInterval(pollStates, 1000);
})();

// ---------------- RENDER (una volta sola) ----------------
function render() {
  app.innerHTML = "";

  globalBtn.onclick = async () => {
    state.GlobalState = !state.GlobalState;
    await saveToESP();
    updateUI();
  };

  state.Valves.forEach((v, i) => {
    const div = document.createElement("div");
    div.className = "row";

    div.innerHTML = `
      <div class="valve-header">
        <span class="dot" id="dot_${i}"></span>
        <b>${v.Id}</b>
        <span class="pin-label">Pin ${v.Pin}</span>
      </div>

      <div class="field">
        <label for="t_${i}">Orario inizio</label>
        <input type="time" id="t_${i}" value="${v.TimeStart}"/>
      </div>

      <div class="field">
        <label for="d_${i}">Durata (min)</label>
        <input type="number" id="d_${i}" value="${v.Duration}" min="0"/>
      </div>

      <button class="save-btn" id="save_${i}">Salva</button>

      <div class="override-row">
        <div class="field-inline">
          <label for="ov_${i}">Override</label>
          <input type="checkbox" id="ov_${i}" ${v.Override.Active ? "checked" : ""}/>
        </div>
        
        <div class="field-inline">
          <label for="ovv_${i}">Stato</label>
          <select id="ovv_${i}">
            <option value="true"  ${v.Override.Value ? "selected" : ""}>ON</option>
            <option value="false" ${!v.Override.Value ? "selected" : ""}>OFF</option>
          </select>
        </div>

      </div>
    `;

    app.appendChild(div);

    // Salva orario e durata
    document.getElementById(`save_${i}`).onclick = async () => {
      v.TimeStart = document.getElementById(`t_${i}`).value;
      v.Duration = parseInt(document.getElementById(`d_${i}`).value);
      await saveToESP();
    };

    // Blocca polling sugli input mentre l'utente scrive
    const t = document.getElementById(`t_${i}`);
    const d = document.getElementById(`d_${i}`);

    t.onfocus = () => (editing[`t_${i}`] = true);
    t.onblur = () => (editing[`t_${i}`] = false);
    d.onfocus = () => (editing[`d_${i}`] = true);
    d.onblur = () => (editing[`d_${i}`] = false);

    // Override attivo/inattivo
    document.getElementById(`ov_${i}`).onchange = async (e) => {
      v.Override.Active = e.target.checked;
      await saveToESP();
      updateUI();
    };

    // Valore override ON/OFF
    document.getElementById(`ovv_${i}`).onchange = async (e) => {
      v.Override.Value = e.target.value === "true";
      await saveToESP();
      updateUI();
    };
  });

  updateUI();
}

// ---------------- UPDATE UI (solo stato visivo) ----------------
// ---------------- UPDATE UI (SOLO DOT + GLOBAL BTN) ----------------
function updateUI() {
  globalBtn.textContent =
    "Irrigazione globale: " + (state.GlobalState ? "ON" : "OFF");
  globalBtn.className = "global-btn " + (state.GlobalState ? "on" : "off");

  state.Valves.forEach((v, i) => {
    const active = v.Override.Active ? v.Override.Value : v.State;
    const dot = document.getElementById(`dot_${i}`);
    if (dot) dot.className = "dot " + (active ? "green" : "red");
  });
}
