<script setup>

const props = defineProps({
  id: String,
  timeStart: String,
  duration: Number
})

const emit = defineEmits(['update:timeStart', 'update:duration'])

function onTimeChange(e) {
  emit('update:timeStart', e.target.value)
}

function onDurationChange(e) {
  emit('update:duration', Number(e.target.value))
}
</script>

<template>
  <div class="valve-program">
    <h3> {{ id }}</h3>
    <div class="input-group">
      <div class="input-field">
        <label>Orario di accensione</label>
        <input type="time" :value="timeStart" @change="onTimeChange" />
      </div>
      <div class="input-field">
        <label>Durata (minuti)</label>
        <input type="number" :value="duration" min="1" max="1440" @change="onDurationChange" />
      </div>
    </div>
  </div>
</template>
