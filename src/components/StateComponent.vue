<script setup>

const props = defineProps({
    overrideState: Boolean,
    state: Boolean,
    ovveride: Boolean,
    id: String
})

const checkOn = () => {
    if (props.ovveride) {
        return props.overrideState;
    }
    else {
        return props.state;
    }
}
</script>

<template>
    <button :class="['status-card', props.ovveride ? 'override' : '']">
        <div class="status-header">
            <span class="valve-name">{{ props.id }}</span>
            <div :class="['status-indicator', checkOn() ? 'on' : 'off']" :id="id"></div>
        </div>
    </button>
</template>

<style scoped></style>
