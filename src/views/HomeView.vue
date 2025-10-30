<script setup>
import { ref, onMounted } from 'vue'
import StateComponent from '../components/StateComponent.vue'
import ProgramComponent from '../components/ProgramComponent.vue'

const valves = ref([])

onMounted(async () => {
    try {
        const res = await fetch('http://localhost:3000/state')
        const data = await res.json()
        valves.value = data.valves
    } catch (err) {
        console.error('Fetch error:', err)
    }
})

const toggleOverride = async (id) => {
    const valve = valves.value.find(v => v.Id === id)
    if (!valve) return

    const newOverride = !valve.Ovveride
    const newOverrideState = !valve.OverrideState

    const payload = {
        Override: newOverride,
        OverrideState: newOverrideState,
        Id: id
    }

    try {
        const res = await fetch('http://localhost:3000/override', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        })

        const response = await res.json()

        // aggiorna valori locali
        valve.Ovveride = newOverride
        valve.OverrideState = newOverrideState

        // se override disattivato, aggiorna state con DefaultState
        if (!newOverride && response.DefaultState !== undefined) {
            valve.State = response.DefaultState
        }
    } catch (err) {
        console.error('POST error:', err)
    }
}
</script>

<template>
    <div class="container">
        <div class="status-grid">
            <StateComponent v-for="valve in valves" :key="valve.Id" :id="valve.Id" :override-state="valve.OverrideState"
                :state="valve.State" :ovveride="valve.Ovveride" @click="toggleOverride(valve.Id)" />
        </div>

        <div class="programming-section">
            <div class="valve-programming">
                <ProgramComponent v-for="valve in valves" :key="valve.Id" :id="valve.Id" :time-start="valve.TimeStart"
                    :duration="valve.Duration" />
            </div>
        </div>

        <div class="buttons">
            <button class="save-btn">Disabilita</button>
            <button class="save-btn">Salva</button>
        </div>
    </div>
</template>
