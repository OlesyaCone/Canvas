<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { usePublicStore } from "../../stores/public";
import noPhoto from "../../assets/nophoto.png";

const router = useRouter();
const publicStore = usePublicStore();
const search = ref("");
const sort = ref("likes");
const expandedTest = ref<string | null>(null);
const commentText = ref("");

onMounted(async function () {
    await publicStore.fetchPublicTests();
});

function handleSearch() {
    publicStore.fetchPublicTests(search.value, sort.value);
}

function handleLike(testId: string) {
    publicStore.toggleReaction(testId, "like");
}

function handleDislike(testId: string) {
    publicStore.toggleReaction(testId, "dislike");
}

function toggleComments(testId: string) {
    if (expandedTest.value === testId) {
        expandedTest.value = null;
    }
    else {
        expandedTest.value = testId;
        publicStore.fetchComments(testId);
    }
}

function sendComment(testId: string) {
    if (!commentText.value.trim()) {
        return;
    }
    publicStore.addComment(testId, commentText.value);
    commentText.value = "";
}

function getComments(testId: string) {
    return publicStore.getComments(testId);
}

function startTest(testId: string) {
    router.push({ name: "playing", params: { testId } });
}

function viewProfile(userId: string) {
    router.push({ name: "userProfile", params: { userId } });
}
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

        <div v-if="publicStore.loading" class="loading">
            Загрузка...
        </div>

        <div v-else-if="publicStore.tests.length === 0" class="empty">
            Нет публичных тестов
        </div>

        <div v-else class="tests-grid">
            <div v-for="test in publicStore.tests" :key="test._id" class="test-card">
                <div class="test-image-wrapper">
                    <img :src="test.img?.startsWith('http') || test.img?.startsWith('data:') ? test.img : test.img ? `http://localhost:5000${test.img}` : noPhoto"
                        class="test-image" alt="cover" />
                </div>

                <div class="test-body">
                    <h3 class="test-title">{{ test.title }}</h3>
                    <p v-if="test.description" class="test-description">
                        {{ test.description }}
                    </p>

                    <div class="test-meta">
                        <span class="meta-item">
                            {{ test.question?.length || 0 }} вопросов
                        </span>
                        <span class="meta-item author-clickable" @click="viewProfile(test.author?._id)">
                            {{ test.author?.username }}
                        </span>
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

                        <button class="stat-btn" @click="toggleComments(test._id)">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                stroke-width="2">
                                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                            </svg>
                            {{ test.commentsCount || 0 }}
                        </button>
                    </div>

                    <button class="btn-start" @click="startTest(test._id)">
                        Пройти тест
                    </button>

                    <div v-if="expandedTest === test._id" class="comments-section">
                        <div class="comments-list">
                            <div v-if="getComments(test._id).length === 0" class="empty-comments">
                                Нет комментариев
                            </div>
                            <div v-for="c in getComments(test._id)" :key="c._id" class="comment-item">
                                <strong @click="viewProfile(c.user?._id)">
                                    {{ c.user?.username }}
                                </strong>
                                <span>{{ c.text }}</span>
                            </div>
                        </div>

                        <div class="comment-form">
                            <input v-model="commentText" class="input" placeholder="Комментарий..."
                                @keyup.enter="sendComment(test._id)" />
                            <button class="btn btn-primary" @click="sendComment(test._id)">
                                Отправить
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style lang="scss">
@use "../../../styles/pages/public";
</style>