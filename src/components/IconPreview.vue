<template>
  <div class="icon-preview-container">
    <div class="icon-grid">
      <div class="icon-item">
        <span class="icon" v-html="icons.check"></span>
        <p>Check</p>
      </div>
      <div class="icon-item">
        <span class="icon" v-html="icons.pencil"></span>
        <p>Edit</p>
      </div>
      <div class="icon-item">
        <span class="icon" v-html="icons.trash"></span>
        <p>Delete</p>
      </div>
      <div class="icon-item">
        <span class="icon" v-html="icons.lock"></span>
        <p>Lock</p>
      </div>
      <div class="icon-item">
        <span class="icon" v-html="icons.shield"></span>
        <p>Shield</p>
      </div>
      <div class="icon-item">
        <span class="icon" v-html="icons.plus"></span>
        <p>Plus</p>
      </div>
      <div class="icon-item">
        <span class="icon" v-html="icons.clipboard"></span>
        <p>Clipboard</p>
      </div>
      <div class="icon-item">
        <span class="icon" v-html="icons.book"></span>
        <p>Book</p>
      </div>
      <div class="icon-item">
        <span class="icon" v-html="icons.dumbbell"></span>
        <p>Dumbbell</p>
      </div>
      <div class="icon-item">
        <span class="icon" v-html="icons.globe"></span>
        <p>Globe</p>
      </div>
      <div class="icon-item">
        <span class="icon" v-html="icons.star"></span>
        <p>Star</p>
      </div>
      <div class="icon-item">
        <span class="icon" v-html="icons.salad"></span>
        <p>Salad</p>
      </div>
      <div class="icon-item">
        <span class="icon" v-html="icons.info"></span>
        <p>Info</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { icons } from '../icons.js'
</script>

<style scoped>
.icon-preview-container {
  padding: 40px 20px;
  max-width: 800px;
  margin: 0 auto;
}

.icon-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
  gap: 20px;
  background: var(--surface);
  padding: 20px;
  border-radius: var(--radius-sm);
  border: 2px solid var(--accent);
}

.icon-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 12px;
  background: var(--surface2);
  border-radius: var(--radius-sm);
  transition: all 0.2s;
}

.icon-item:hover {
  background: var(--accent);
  color: white;
  transform: scale(1.05);
}

.icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  font-size: 24px;
  color: var(--accent);
}

.icon-item:hover .icon {
  color: white;
}

p {
  font-size: 12px;
  font-weight: 600;
  text-align: center;
  margin: 0;
  text-transform: capitalize;
}

.icon-item:hover p {
  color: white;
}
</style>
