<script setup>
const props = defineProps({
  overrideState: Boolean,
  state: Boolean,
  id: String,
  globalState: Boolean,
});

const checkOn = () => {
  if (props.overrideState != props.state) {
    return props.overrideState;
  } else {
    return props.state;
  }
};
</script>

<template>
  <button
    :class="[
      'status-card',
      props.overrideState != props.state ? 'override' : '',
    ]"
  >
    <div class="status-header">
      <span class="valve-name">{{ props.id }}</span>
      <div
        :class="['status-indicator', props.globalState? (checkOn() ? 'on' : 'off') : '']"
        :id="id"
      ></div>
    </div>
  </button>
</template>

<style scoped></style>
