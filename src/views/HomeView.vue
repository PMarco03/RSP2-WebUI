<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import StateComponent from "../components/StateComponent.vue";
import ProgramComponent from "../components/ProgramComponent.vue";
import MessageBoxComponent from "../components/MessageBoxComponent.vue";

const url = "http://192.168.165.16:5000";

const valves = ref([]);
const globalState = ref(false);

let intervalId = null;

const messageBoxText = ref("");
const messageBoxResult = ref(false);
const messageBoxState = ref(false);

// LOAD PROGRAMMAZIONE (PRECOMPILAZIONE)
const fetchProgram = async () => {
  try {
    const res = await fetch(url + "/program");
    const data = await res.json();

    globalState.value = data.GlobalState;

    valves.value = data.Valves.map(v => ({
      Id: v.Id,
      TimeStart: v.TimeStart ?? "",
      Duration: v.Duration ?? 0,

      // runtime placeholders
      State: false,
      OverrideState: false
    }));

  } catch (err) {
    showMessage("Errore program", false);
  }
};

// SYNC STATI (NO PROGRAMMAZIONE)
const fetchStatus = async () => {
  try {
    const res = await fetch(url + "/states");
    const data = await res.json();

    globalState.value = data.GlobalState;

    // se ancora non inizializzato evita crash
    if (!valves.value.length) return;

    data.Valves.forEach(nv => {
      const v = valves.value.find(x => x.Id === nv.Id);
      if (!v) return;

      v.State = nv.State;
      v.OverrideState = nv.OverrideState;
    });

  } catch (err) {}
};
onMounted(() => {
  fetchProgram();
  intervalId = setInterval(fetchStatus, 2000);
});

onUnmounted(() => {
  if (intervalId) clearInterval(intervalId);
});

// SAVE CONFIG
const updateValues = async () => {
  const payload = {
    GlobalState: globalState.value,
    Valves: valves.value.map(v => ({
      Id: v.Id,
      TimeStart: v.TimeStart,
      Duration: v.Duration
    }))
  };

  try {
    await fetch(url + "/update", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    showMessage("Salvato", true);
    await fetchProgram();

  } catch (err) {
    showMessage("Errore", false);
  }
};

// GLOBAL STATE SOLO LOCALE
const toggleGlobalState = () => {
  globalState.value = !globalState.value;
};

// OVERRIDE IMMEDIATO
const toggleOverride = async (id) => {
  const v = valves.value.find(x => x.Id === id);
  if (!v) return;

  const newValue = !v.OverrideState;
  v.OverrideState = newValue;

  try {
    await fetch(url + "/override", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        Id: id,
        OverrideState: newValue
      }),
    });
  } catch (err) {
    v.OverrideState = !newValue;
  }
};

// INPUT HANDLERS
const updateTimeStart = (id, value) => {
  const v = valves.value.find(x => x.Id === id);
  if (v) v.TimeStart = value;
};

const updateDuration = (id, value) => {
  const v = valves.value.find(x => x.Id === id);
  if (v) v.Duration = value;
};

// MESSAGE
const showMessage = (message, result) => {
  messageBoxText.value = message;
  messageBoxResult.value = result;
  messageBoxState.value = true;

  setTimeout(() => {
    messageBoxState.value = false;
  }, 2000);
};
</script>
<template>
  <div class="container">

    <div class="status-grid">
      <StateComponent
        v-for="valve in valves"
        :key="valve.Id"
        :id="valve.Id"
        :override-state="valve.OverrideState"
        :state="valve.State"
        :globalState="globalState"
        @click="toggleOverride(valve.Id)"
      />
    </div>

    <div class="buttons">
      <button
        :class="['save-btn', globalState ? 'enable' : 'disable']"
        @click="toggleGlobalState"
      >
        {{ globalState ? "Disabilita" : "Abilita" }}
      </button>
    </div>

    <div class="programming-section">
      <div class="valve-programming">
        <ProgramComponent
          v-for="valve in valves"
          :key="valve.Id"
          :id="valve.Id"
          :time-start="valve.TimeStart"
          :duration="valve.Duration"
          @update:timeStart="updateTimeStart(valve.Id, $event)"
          @update:duration="updateDuration(valve.Id, $event)"
        />
      </div>
    </div>

    <MessageBoxComponent
      :active="messageBoxState"
      :message="messageBoxText"
      :result="messageBoxResult"
    />

    <div class="buttons">
      <button class="save-btn neutral" @click="updateValues">
        Salva
      </button>
    </div>

  </div>
</template>