<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue";
import { createAvatar } from "@dicebear/core";
import * as styles from "@dicebear/collection";
import { AVATAR_STYLES_LIST, AVATAR_STYLES, type AvatarStyleId } from "./avatar";

const props = defineProps<{
  isOpen: boolean;
}>();

const emit = defineEmits<{
  (e: "close"): void;
  (e: "generate", avatarUrl: string): void;
}>();

const selectedStyle = ref<AvatarStyleId>(AVATAR_STYLES_LIST[0]?.id || "adventurer");

const seedValue = ref(Math.random().toString());
const avatarPreview = ref("");
const showAllAvatars = ref(false);
const carouselRef = ref<HTMLDivElement>();

const currentStyle = computed(function () {
  return AVATAR_STYLES[selectedStyle.value];
});

const allSeeds = computed(function () {
  const seeds: string[] = [];
  for (let i = 1; i <= 1000; i++) {
    seeds.push(`all-${selectedStyle.value}-${i}`);
  }
  return seeds;
});

function generateAvatar(styleId?: AvatarStyleId, customSeed?: string) {
  const styleData = styleId ? AVATAR_STYLES[styleId] : currentStyle.value;
  if (!styleData) {
    return;
  }

  const styleFunction = (styles as Record<string, unknown>)[styleData.id];
  if (!styleFunction) {
    return;
  }

  try {
    const avatar = createAvatar(styleFunction as never, {
      seed: customSeed || seedValue.value,
      size: 200,
    });

    const avatarSvg = avatar.toString();
    const blob = new Blob([avatarSvg], { type: "image/svg+xml" });
    avatarPreview.value = URL.createObjectURL(blob);
  } catch (error) {
    console.error("Ошибка генерации аватара:", error);
  }
}

function selectStyle(styleId: AvatarStyleId) {
  selectedStyle.value = styleId;
  seedValue.value = Math.random().toString();
  generateAvatar(styleId);
  showAllAvatars.value = false;
}

function randomAvatar() {
  seedValue.value = Math.random().toString();
  generateAvatar();
}

async function applyAvatar() {
  if (!avatarPreview.value) {
    return;
  }

  try {
    const response = await fetch(avatarPreview.value);
    const blob = await response.blob();
    const reader = new FileReader();
    reader.onloadend = function () {
      emit("generate", reader.result as string);
      emit("close");
    };
    reader.readAsDataURL(blob);
  } catch (error) {
    console.error("Ошибка конвертации:", error);
  }
}

function showAll() {
  showAllAvatars.value = true;
}

function selectFromAll(seed: string) {
  seedValue.value = seed;
  generateAvatar(selectedStyle.value, seed);
  showAllAvatars.value = false;
}

function scrollLeft() {
  if (carouselRef.value) {
    carouselRef.value.scrollBy({ left: -200, behavior: "smooth" });
  }
}

function scrollRight() {
  if (carouselRef.value) {
    carouselRef.value.scrollBy({ left: 200, behavior: "smooth" });
  }
}

onMounted(function () {
  if (props.isOpen) {
    generateAvatar();
  }
});

watch(
  function () {
    return props.isOpen;
  },
  function (newVal) {
    if (newVal) {
      generateAvatar();
    }
  },
);
</script>

<template>
  <Teleport to="body">
    <div v-if="isOpen" class="modal-overlay" @click.self="emit('close')">
      <div class="modal-content">
        <div class="modal-header">
          <h2>
            {{ showAllAvatars ? `Все аватары: ${currentStyle?.name}` : "Создать аватар" }}
          </h2>
          <button class="close-btn" @click="emit('close')">×</button>
        </div>

        <div class="modal-body">
          <div v-if="showAllAvatars" class="all-avatars">
            <div class="style-info">
              <button class="btn-secondary back-btn" @click="showAllAvatars = false">
                ← Назад
              </button>
            </div>

            <div class="avatars-grid">
              <div
                v-for="seed in allSeeds"
                :key="seed"
                class="avatar-card"
                @click="selectFromAll(seed)"
              >
                <img
                  :src="`https://api.dicebear.com/9.x/${currentStyle?.urlKey}/svg?seed=${seed}`"
                  :alt="seed"
                />
              </div>
            </div>
          </div>

          <div v-else class="main-mode">
            <div class="preview-section">
              <div class="avatar-preview-large">
                <img :src="avatarPreview" :alt="currentStyle?.name" />
              </div>
              <div class="style-name">{{ currentStyle?.name }}</div>
              <div class="style-description">
                {{ currentStyle?.description }}
              </div>
            </div>

            <div class="style-selector">
              <div class="carousel-container">
                <button class="carousel-arrow left" @click="scrollLeft">‹</button>
                <div ref="carouselRef" class="carousel">
                  <div
                    v-for="style in AVATAR_STYLES_LIST"
                    :key="style.id"
                    class="carousel-item"
                    :class="{ active: selectedStyle === style.id }"
                    @click="selectStyle(style.id)"
                  >
                    <img
                      :src="`https://api.dicebear.com/9.x/${style.urlKey}/svg?seed=preview`"
                      :alt="style.name"
                    />
                    <span class="style-name">{{ style.name }}</span>
                  </div>
                </div>
                <button class="carousel-arrow right" @click="scrollRight">›</button>
              </div>
            </div>

            <div class="action-buttons">
              <button class="btn-primary" @click="randomAvatar">Случайный</button>
              <button class="btn-primary" @click="showAll">Показать все</button>
              <button class="btn-primary" @click="applyAvatar">Выбрать</button>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn-secondary" @click="emit('close')">Отмена</button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style lang="scss">
@use "../../../styles/ui/modal";
@use "../../../styles/pages/avatar";
</style>
