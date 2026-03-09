<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { createAvatar } from "@dicebear/core";
import * as styles from "@dicebear/collection";

import {
  AVATAR_STYLES,
  AVATAR_STYLES_LIST,
  type AvatarStyleId,
} from "../constants/avatar";

const props = defineProps<{ isOpen: boolean }>();

const emit = defineEmits<{
  (e: "close"): void;
  (e: "generate", url: string): void;
}>();

const selectedStyle = ref<AvatarStyleId>("adventurer");
const seedValue = ref(Math.random().toString());

const avatarPreview = ref("");
const showAllAvatars = ref(false);
const showFilters = ref(false);

const selectedFilters = ref({
  hairColor: "",
  eyeType: "",
  mouthType: "",
  accessory: "",
  clothing: "",
  hasGlasses: false,
  hasHat: false,
  hasBeard: false,
});

const currentStyle = computed(() => AVATAR_STYLES[selectedStyle.value]);
const currentFilters = computed(() => currentStyle.value.filters);

function generateAvatar() {
  const styleFn = (styles as any)[selectedStyle.value];

  const avatar = createAvatar(styleFn, {
    seed: seedValue.value,
    size: 200,
  });

  avatarPreview.value = `data:image/svg+xml;utf8,${encodeURIComponent(avatar.toString())}`;
}

function randomAvatar() {
  seedValue.value = Math.random().toString();
}

function applyAvatar() {
  emit("generate", avatarPreview.value);
  emit("close");
}

const allSeeds = computed(() =>
  Array.from({ length: 200 }, (_, i) => `${selectedStyle.value}-${i}`),
);

watch([selectedStyle, seedValue, selectedFilters], generateAvatar, {
  deep: true,
});
</script>

<template>
  <Teleport to="body">
    <div v-if="isOpen" class="modal-overlay">
      <div class="modal-content">
        <div class="modal-header">
          <h2>{{ showAllAvatars ? "Все аватары" : "Создать аватар" }}</h2>

          <button class="close-btn" @click="emit('close')">×</button>
        </div>

        <div class="modal-body">
          <div v-if="showAllAvatars" class="all-avatars">
            <div class="style-info">
              <button class="btn-secondary" @click="showAllAvatars = false">
                ← Назад
              </button>

              <button class="btn-secondary" @click="showFilters = !showFilters">
                {{ showFilters ? "Скрыть фильтры" : "Показать фильтры" }}
              </button>
            </div>

            <div v-if="showFilters" class="filters-panel">
              <div v-if="currentFilters.hairColors.length" class="filter-group">
                <label>Цвет волос</label>

                <select v-model="selectedFilters.hairColor">
                  <option value="">Любой</option>

                  <option
                    v-for="c in currentFilters.hairColors"
                    :key="c"
                    :value="c"
                  >
                    {{ c }}
                  </option>
                </select>
              </div>
            </div>

            <div class="avatars-grid">
              <div
                v-for="seed in allSeeds"
                :key="seed"
                class="avatar-card"
                @click="
                  seedValue = seed;
                  showAllAvatars = false;
                "
              >
                <img
                  :src="`https://api.dicebear.com/9.x/${currentStyle.urlKey}/svg?seed=${seed}`"
                />
              </div>
            </div>
          </div>

          <div v-else class="main-mode">
            <div class="preview-section">
              <div class="avatar-preview-large">
                <img :src="avatarPreview" />
              </div>

              <div class="style-name">{{ currentStyle.name }}</div>

              <div class="style-description">
                {{ currentStyle.description }}
              </div>
            </div>

            <div class="carousel">
              <div
                v-for="style in AVATAR_STYLES_LIST"
                :key="style.id"
                class="carousel-item"
                :class="{ active: selectedStyle === style.id }"
                @click="selectedStyle = style.id"
              >
                <img
                  :src="`https://api.dicebear.com/9.x/${style.urlKey}/svg?seed=preview`"
                />

                <span class="style-name">{{ style.name }}</span>
              </div>
            </div>

            <div class="action-buttons">
              <button class="btn-secondary" @click="randomAvatar">
                Случайный
              </button>

              <button class="btn-secondary" @click="showAllAvatars = true">
                Показать все
              </button>

              <button class="btn-primary" @click="applyAvatar">Выбрать</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>
