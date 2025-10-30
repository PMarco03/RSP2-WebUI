<script setup>
defineProps({
    id: String,
    timeStart: String,
    duration: Number
})
</script>

<template>
    <div class="valve-program">
        <h3>Elettrovalvola {{ id }}</h3>
        <div class="input-group">
            <div class="input-field">
                <label>Orario di accensione</label>
                <input type="time" :value="timeStart" />
            </div>
            <div class="input-field">
                <label>Durata (minuti)</label>
                <input type="number" :value="duration" min="1" max="1440" />
            </div>
        </div>
    </div>
</template>

<style scoped>
/* eventuali stili */
</style>
