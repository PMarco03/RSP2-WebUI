<template>
    <transition name="fade">
        <div v-if="active" :class="['toast', !result ? 'error' : '']">
            {{ message }}
        </div>
    </transition>
</template>

<script setup>
defineProps({
    active: {
        type: Boolean,
        default: false
    },
    message: {
        type: String,
        default: ''
    },
    result: {
        type: Boolean,
        default: false
    }
});
</script>

<style scoped>
.toast {
    position: fixed;
    bottom: 50px;
    left: 50%;
    transform: translateX(-50%);
    background-color: var(--green);
    color: white;
    padding: 12px 20px;
    border-radius: 30px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    font-size: 14px;
    z-index: 9999;
    max-width: 80%;
    text-align: center;
}

.error {
    background-color: var(--red);
}

/* Fade transition */
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}
</style>