<script setup>
const props = defineProps({
  overrideState: Boolean,
  state: Boolean,
  id: String
});

</script>

<template>
  <button :class="[
    'status-card',
    props.overrideState  ? 'override' : '',
  ]">
    <div class="status-header">
      <span class="valve-name">{{ props.id }}</span>
      <div :class="['status-indicator',  (props.state ? 'on' : 'off') ]" :id="id">
      </div>
    </div>
  </button>
</template>

<style scoped></style>
