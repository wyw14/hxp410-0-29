<template>
  <div class="topics-container">
    <div class="card topics-card">
      <div class="card-header">
        <span class="icon">📚</span>
        <h2>秘密导读专题</h2>
        <p class="subtitle">一些秘密适合被整理成一个温柔专题</p>
      </div>

      <div v-if="loading" class="loading">
        <div class="spinner"></div>
        <p>正在加载专题...</p>
      </div>

      <div v-else-if="topics.length === 0" class="empty-state">
        <span class="empty-icon">🌷</span>
        <p>还没有专题，敬请期待</p>
      </div>

      <div v-else class="topics-list">
        <div
          v-for="topic in topics"
          :key="topic.id"
          class="topic-item"
          @click="goToTopic(topic.id)"
        >
          <div class="topic-header">
            <h3 class="topic-title">{{ topic.title }}</h3>
            <span class="topic-count">{{ topic.secretCount }} 个秘密</span>
          </div>
          <p class="topic-intro">{{ topic.introduction }}</p>
          <div class="topic-meta">
            <span class="topic-date">
              更新于 {{ formatDate(topic.updatedAt) }}
            </span>
            <span class="topic-arrow">→</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const loading = ref(true)
const topics = ref([])

async function fetchTopics() {
  loading.value = true
  try {
    const response = await fetch('/api/topics')
    const data = await response.json()
    topics.value = data.topics || []
  } catch (error) {
    console.error('获取专题列表失败:', error)
    topics.value = []
  } finally {
    loading.value = false
  }
}

function goToTopic(id) {
  router.push(`/topics/${id}`)
}

function formatDate(dateStr) {
  const date = new Date(dateStr)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

onMounted(() => {
  fetchTopics()
})
</script>

<style scoped>
.topics-container {
  width: 100%;
  max-width: 700px;
}

.topics-card {
  animation: slideUp 0.6s ease;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.card-header {
  text-align: center;
  margin-bottom: 30px;
}

.icon {
  font-size: 48px;
  display: block;
  margin-bottom: 10px;
}

.card-header h2 {
  color: #333;
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 8px;
}

.subtitle {
  color: #999;
  font-size: 14px;
}

.loading {
  text-align: center;
  padding: 60px 20px;
  color: #666;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(102, 126, 234, 0.3);
  border-top-color: #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
}

.empty-icon {
  font-size: 64px;
  display: block;
  margin-bottom: 20px;
}

.empty-state p {
  color: #999;
  font-size: 16px;
}

.topics-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.topic-item {
  background: linear-gradient(135deg, #fef9e7 0%, #fdf2e9 100%);
  border-radius: 16px;
  padding: 24px;
  cursor: pointer;
  transition: all 0.3s ease;
  border-left: 4px solid #f59e0b;
}

.topic-item:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 30px rgba(245, 158, 11, 0.2);
}

.topic-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.topic-title {
  color: #333;
  font-size: 18px;
  font-weight: 600;
  margin: 0;
}

.topic-count {
  background: rgba(245, 158, 11, 0.2);
  color: #b45309;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 13px;
  font-weight: 500;
}

.topic-intro {
  color: #666;
  font-size: 14px;
  line-height: 1.7;
  margin-bottom: 16px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.topic-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.topic-date {
  color: #999;
  font-size: 13px;
}

.topic-arrow {
  color: #f59e0b;
  font-size: 18px;
  font-weight: bold;
  transition: transform 0.3s ease;
}

.topic-item:hover .topic-arrow {
  transform: translateX(5px);
}
</style>
