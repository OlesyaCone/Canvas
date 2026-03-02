<script setup lang="ts">
import { ref, onMounted } from "vue";

interface Message {
  id: string;
  text: string;
  isBot: boolean;
  timestamp: Date;
}

interface Schedule {
  id: number;
  time: string;
  type: string;
  description: string;
}

const props = defineProps<{
  schedules?: Schedule[];
}>();

const emit = defineEmits<{
  (e: "back"): void;
}>();

const messages = ref<Message[]>([]);
const newMessage = ref("");
const displayName = ref("Имя");

const showSchedules = () => {
  if (!props.schedules || props.schedules.length === 0) {
    messages.value.push({
      id: Date.now().toString(),
      text: "Начните беседу",
      isBot: true,
      timestamp: new Date(),
    });
    return;
  }

  const schedulesList = props.schedules
    .map(
      (schedule) =>
        `• ${schedule.time} - ${schedule.type}: ${schedule.description}`,
    )
    .join("\n");

  messages.value.push({
    id: Date.now().toString(),
    text: `📋 Ваши тренировки:\n\n${schedulesList}`,
    isBot: true,
    timestamp: new Date(),
  });
};

const sendMessage = () => {
  if (newMessage.value.trim()) {
    messages.value.push({
      id: Date.now().toString(),
      text: newMessage.value,
      isBot: false,
      timestamp: new Date(),
    });
    newMessage.value = "";

    setTimeout(() => {
      getBotResponse();
    }, 500);
  }
};

const getBotResponse = () => {
  messages.value.push({
    id: Date.now().toString(),
    text: "Я пока учусь отвечать на сообщения 🤖",
    isBot: true,
    timestamp: new Date(),
  });
};

onMounted(() => {
  showSchedules();
});
</script>

<template>
  <div class="chat">
    <div class="chat-header">
      <button class="back-button" @click="$emit('back')"><</button>
      <h1 class="page-title">{{ displayName }}</h1>
      <div class="header-placeholder"></div>
    </div>

    <div class="messages-container">
      <div class="messages" ref="messagesContainer">
        <div
          v-for="message in messages"
          :key="message.id"
          :class="['message', message.isBot ? 'bot-message' : 'user-message']"
        >
          <div class="message-text" style="white-space: pre-line">
            {{ message.text }}
          </div>
          <div class="message-time">
            {{
              message.timestamp.toLocaleTimeString("ru-RU", {
                hour: "2-digit",
                minute: "2-digit",
              })
            }}
          </div>
        </div>

        <div ref="bottomRef"></div>
      </div>
    </div>

    <div class="input-container">
      <input
        v-model="newMessage"
        @keyup.enter="sendMessage"
        placeholder="Введите сообщение..."
        class="message-input"
        :disabled="!messages.length"
      />
      <button
        @click="sendMessage"
        class="send-button"
        :disabled="!newMessage.trim()"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          width="24"
          height="24"
        >
          <path fill="none" d="M0 0h24v24H0z"></path>
          <path
            fill="currentColor"
            d="M1.946 9.315c-.522-.174-.527-.455.01-.634l19.087-6.362c.529-.176.832.12.684.638l-5.454 19.086c-.15.529-.455.547-.679.045L12 14l6-8-8 6-8.054-2.685z"
          ></path>
        </svg>
      </button>
    </div>
  </div>
</template>