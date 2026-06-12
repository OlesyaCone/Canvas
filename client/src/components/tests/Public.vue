<script setup lang="ts">
import { onMounted, ref } from "vue";
import { usePublicStore } from "../../stores/public";

const publicStore = usePublicStore();
const search = ref("");
const sort = ref("likes");
const selectedTest = ref<any>(null);
const commentText = ref("");

const emit = defineEmits<{
    (e: "startTest", testId: string): void;
}>();

onMounted(async () => {
    await publicStore.fetchPublicTests();
});

const handleSearch = () => { publicStore.fetchPublicTests(search.value, sort.value); };
const handleLike = (testId: string) => { publicStore.toggleReaction(testId, "like"); };
const handleDislike = (testId: string) => { publicStore.toggleReaction(testId, "dislike"); };
const openComments = (test: any) => { selectedTest.value = test; publicStore.fetchComments(test._id); };
const sendComment = () => {
    if (!commentText.value.trim()) return;
    publicStore.addComment(selectedTest.value._id, commentText.value);
    commentText.value = "";
};
</script>

<template>
    <div class="public-tests">
        <h2 class="page-title">Публичные тесты</h2>
        <div class="search-bar">
            <input v-model="search" class="input" placeholder="Поиск тестов..." @keyup.enter="handleSearch" />
            <select v-model="sort" class="input select-sort" @change="handleSearch">
                <option value="likes">По лайкам</option>
                <option value="passes">По прохождениям</option>
                <option value="">Новые</option>
            </select>
        </div>

        <div v-if="publicStore.loading" class="loading">Загрузка...</div>
        <div v-else-if="publicStore.tests.length === 0" class="empty">Нет публичных тестов</div>
        <div v-else class="tests-grid">
            <div v-for="test in publicStore.tests" :key="test._id" class="test-card">
                <div class="test-image-wrapper">
                    <img :src="test.img?.startsWith('http') ? test.img : test.img ? `http://localhost:5000${test.img}` : 'https://via.placeholder.com/300x200?text=Test'"
                        class="test-image" alt="cover" />
                </div>
                <div class="test-body">
                    <h3 class="test-title">{{ test.title }}</h3>
                    <p class="test-description" v-if="test.description">{{ test.description }}</p>
                    <div class="test-meta">
                        <span class="meta-item">{{ test.question?.length || 0 }} вопросов</span>
                        <span class="meta-item">{{ test.author?.username }}</span>
                    </div>
                    <div class="test-stats-row">
                        <button class="stat-btn" :class="{ active: test.myReaction === 'like' }"
                            @click="handleLike(test._id)">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                stroke-width="2">
                                <path
                                    d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
                            </svg>
                            {{ test.likes }}
                        </button>
                        <button class="stat-btn" :class="{ active: test.myReaction === 'dislike' }"
                            @click="handleDislike(test._id)">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                stroke-width="2">
                                <path
                                    d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3H10zM17 2h2.67a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H17" />
                            </svg>
                            {{ test.dislikes }}
                        </button>
                        <button class="stat-btn" @click="openComments(test)">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                stroke-width="2">
                                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                            </svg>
                            {{ test.passes }}
                        </button>
                    </div>
                    <button class="btn-start" @click="emit('startTest', test._id)">Пройти тест</button>
                </div>
            </div>
        </div>

        <Teleport to="body">
            <div v-if="selectedTest" class="modal-overlay" @click.self="selectedTest = null">
                <div class="modal-content">
                    <div class="modal-header">
                        <h2>{{ selectedTest.title }}</h2>
                        <button class="close-btn" @click="selectedTest = null">×</button>
                    </div>
                    <div class="modal-body">
                        <div v-if="publicStore.comments.length === 0" class="empty">Нет комментариев</div>
                        <div v-for="c in publicStore.comments" :key="c._id" class="comment-item">
                            <strong>{{ c.user?.username }}</strong>
                            <p>{{ c.text }}</p>
                        </div>
                        <div class="comment-form">
                            <input v-model="commentText" class="input" placeholder="Комментарий..."
                                @keyup.enter="sendComment" />
                            <button class="btn btn-primary" @click="sendComment">Отправить</button>
                        </div>
                    </div>
                </div>
            </div>
        </Teleport>
    </div>
</template>

<style lang="scss">
@use '../../../styles/pages/public';
</style>