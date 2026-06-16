<template>
  <div class="topic-detail-container">
    <div class="card topic-detail-card">
      <button class="back-btn" @click="goBack">
        ← 返回专题列表
      </button>

      <div v-if="loading" class="loading">
        <div class="spinner"></div>
        <p>正在加载专题...</p>
      </div>

      <div v-else-if="!topic" class="empty-state">
        <span class="empty-icon">🌧️</span>
        <p>{{ error || '专题不存在' }}</p>
        <button class="btn btn-primary" @click="goBack">
          返回专题列表
        </button>
      </div>

      <div v-else class="topic-content">
        <div class="topic-header">
          <span class="topic-icon">📖</span>
          <h1 class="topic-title">{{ topic.title }}</h1>
          <div class="topic-introduction">
            {{ topic.introduction }}
          </div>
          <div class="topic-meta">
            <span class="meta-item">
              共 {{ topic.secrets.length }} 个秘密
            </span>
            <span class="meta-item">
              更新于 {{ formatDate(topic.updatedAt) }}
            </span>
          </div>
        </div>

        <div class="secrets-list">
          <div
            v-for="(secret, index) in topic.secrets"
            :key="secret.id"
            class="secret-item"
          >
            <div class="secret-number">{{ index + 1 }}</div>
            <div class="secret-body">
              <p class="secret-text">"{{ secret.content }}"</p>
              <div class="secret-footer">
                <span class="status-badge">{{ secret.status }}</span>
                <span class="secret-date">{{ formatDate(secret.createdAt) }}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="topic-footer">
          <p class="footer-quote">
            🌙 每一个秘密都值得被温柔以待
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()
const loading = ref(true)
const topic = ref(null)
const error = ref('')

async function fetchTopicDetail() {
  loading.value = true
  error.value = ''
  try {
    const topicId = route.params.id
    const response = await fetch(`/api/topics/${topicId}`)
    const data = await response.json()
    
    if (response.ok) {
      topic.value = data.topic
    } else {
      error.value = data.error || '专题不存在'
    }
  } catch (err) {
    console.error('获取专题详情失败:', err)
    error.value = '无法连接到服务器'
  } finally {
    loading.value = false
  }
}

function goBack() {
  router.push('/topics')
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
  fetchTopicDetail()
})
</script>

<style scoped>
.topic-detail-container {
  width: 100%;
  max-width: 700px;
}

.topic-detail-card {
  animation: slideUp 0.6s ease;
  position: relative;
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

.back-btn {
  position: absolute;
  top: 30px;
  left: 30px;
  background: none;
  border: none;
  color: #667eea;
  font-size: 14px;
  cursor: pointer;
  padding: 8px 12px;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.back-btn:hover {
  background: rgba(102, 126, 234, 0.1);
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
  margin-bottom: 30px;
}

.topic-header {
  text-align: center;
  padding: 20px 0 30px;
  border-bottom: 1px solid #eee;
  margin-bottom: 30px;
}

.topic-icon {
  font-size: 56px;
  display: block;
  margin-bottom: 16px;
}

.topic-title {
  color: #333;
  font-size: 28px;
  font-weight: 600;
  margin: 0 0 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.topic-introduction {
  color: #666;
  font-size: 16px;
  line-height: 1.9;
  margin-bottom: 24px;
  padding: 0 20px;
  font-style: italic;
}

.topic-meta {
  display: flex;
  justify-content: center;
  gap: 30px;
  color: #999;
  font-size: 14px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 6px;
}

.secrets-list {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.secret-item {
  display: flex;
  gap: 20px;
  padding: 24px;
  background: linear-gradient(135deg, #f5f7fa 0%, #e8ecf1 100%);
  border-radius: 16px;
  transition: all 0.3s ease;
}

.secret-item:hover {
  transform: translateX(5px);
}

.secret-number {
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 16px;
}

.secret-body {
  flex: 1;
}

.secret-text {
  color: #333;
  font-size: 16px;
  line-height: 1.9;
  margin: 0 0 16px;
  font-style: italic;
}

.secret-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.status-badge {
  background: linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%);
  color: #2d5a4a;
  padding: 6px 16px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 500;
}

.secret-date {
  color: #999;
  font-size: 13px;
}

.topic-footer {
  margin-top: 40px;
  padding-top: 30px;
  border-top: 1px solid #eee;
  text-align: center;
}

.footer-quote {
  color: #999;
  font-size: 15px;
  margin: 0;
}
</style>
