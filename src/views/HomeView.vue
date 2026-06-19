<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import StateComponent from "../components/StateComponent.vue";
import ProgramComponent from "../components/ProgramComponent.vue";

const url = "http://192.168.1.90:5000";
const valves = ref([]);
const globalState = ref(false);
let intervalId = null;

const fetchValves = async () => {
  try {
    const res = await fetch(url + "/states");
    const data = await res.json();
    valves.value = data.Valves;
    globalState.value = data.GlobalState;
  } catch (err) {
    console.error("Fetch error:", err);
  }
};

// nuovo polling leggero per soli stati
const fetchStatus = async () => {
  try {
    const res = await fetch(url + "/states");
    const data = await res.json();

    globalState.value = data.GlobalState;

    data.Valves.forEach((newValve) => {
      const valve = valves.value.find((v) => v.Id === newValve.Id);
      if (valve) {
        valve.State = newValve.State;
        valve.OverrideState = newValve.OverrideState;
      }
    });
  } catch (err) {
    console.error("Polling error:", err);
  }
};

onMounted(() => {
  fetchValves(); // primo caricamento completo
  intervalId = setInterval(fetchStatus, 2000); // polling solo stati
});

onUnmounted(() => {
  if (intervalId) clearInterval(intervalId);
});

const updateValues = async () => {
  const payload = { valves: valves.value };
  try {
    await fetch(url + "/update", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    await fetchValves();
  } catch (err) {
    console.error("POST error:", err);
  }
};

const toggleGlobalState = async () => {
  globalState.value = !globalState.value;
  const payload = { GlobalState: globalState.value };
  try {
    await fetch(url + "/toggleglobalstate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch (err) {
    console.error("POST error:", err);
  }
};

const toggleOverride = async (id) => {
  const valve = valves.value.find((v) => v.Id === id);
  if (!valve) return;
  const payload = { Id: id, OverrideState: !valve.OverrideState };

  try {
    await fetch(url + "/override", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch (err) {
    console.error("POST error:", err);
  }
};

const updateTimeStart = (id, value) => {
  const valve = valves.value.find((v) => v.Id === id);
  if (valve) valve.TimeStart = value;
};

const updateDuration = (id, value) => {
  const valve = valves.value.find((v) => v.Id === id);
  if (valve) valve.Duration = value;
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

    <div class="buttons">
      <button class="save-btn neutral" @click="updateValues">Salva</button>
    </div>
  </div>
</template>
