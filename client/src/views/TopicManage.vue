<template>
  <div class="topic-manage-container">
    <div class="card manage-card">
      <div class="card-header">
        <span class="icon">⚙️</span>
        <h2>专题管理</h2>
        <p class="subtitle">创建和管理秘密导读专题</p>
      </div>

      <div class="tabs">
        <button
          class="tab-btn"
          :class="{ active: activeTab === 'list' }"
          @click="activeTab = 'list'"
        >
          📋 专题列表
        </button>
        <button
          class="tab-btn"
          :class="{ active: activeTab === 'create' }"
          @click="activeTab = 'create'; resetForm()"
        >
          ➕ 新建专题
        </button>
      </div>

      <div v-if="activeTab === 'list'" class="tab-content">
        <div v-if="loadingTopics" class="loading">
          <div class="spinner"></div>
          <p>加载中...</p>
        </div>

        <div v-else-if="topics.length === 0" class="empty-state">
          <span class="empty-icon">📭</span>
          <p>还没有专题，点击上方「新建专题」开始创建</p>
        </div>

        <div v-else class="manage-topics-list">
          <div
            v-for="topic in topics"
            :key="topic.id"
            class="manage-topic-item"
          >
            <div class="topic-info">
              <h3 class="topic-title">{{ topic.title }}</h3>
              <p class="topic-intro">{{ topic.introduction }}</p>
              <div class="topic-meta">
                <span class="meta-tag">{{ topic.secretCount }} 个秘密</span>
                <span class="meta-tag">更新于 {{ formatDate(topic.updatedAt) }}</span>
              </div>
            </div>
            <div class="topic-actions">
              <button class="btn btn-secondary" @click="editTopic(topic)">
                编辑
              </button>
              <button class="btn btn-danger" @click="deleteTopic(topic.id)">
                删除
              </button>
            </div>
          </div>
        </div>
      </div>

      <div v-if="activeTab === 'create'" class="tab-content">
        <div class="form-group">
          <label class="form-label">专题标题</label>
          <input
            v-model="form.title"
            type="text"
            class="form-input"
            placeholder="输入一个温暖的标题..."
            :disabled="submitting"
          />
        </div>

        <div class="form-group">
          <label class="form-label">专题导语</label>
          <textarea
            v-model="form.introduction"
            class="form-textarea"
            placeholder="写一段温柔的导语，引导读者进入这个专题..."
            rows="4"
            :disabled="submitting"
          ></textarea>
        </div>

        <div class="form-group">
          <label class="form-label">
            选择秘密
            <span class="selected-count">
              已选择 {{ form.secretIds.length }} 个
            </span>
          </label>
          
          <div v-if="loadingSecrets" class="loading small">
            <div class="spinner small"></div>
            <p>加载秘密列表...</p>
          </div>

          <div v-else-if="secrets.length === 0" class="empty-state small">
            <p>还没有可用的秘密</p>
          </div>

          <div v-else class="secrets-select">
            <div
              v-for="secret in secrets"
              :key="secret.id"
              class="secret-select-item"
              :class="{ selected: form.secretIds.includes(secret.id) }"
              @click="toggleSecret(secret.id)"
            >
              <div class="checkbox">
                <span v-if="form.secretIds.includes(secret.id)">✓</span>
              </div>
              <p class="secret-content">{{ secret.content }}</p>
            </div>
          </div>
        </div>

        <div v-if="formError" class="error-message">
          {{ formError }}
        </div>

        <div class="form-actions">
          <button class="btn btn-secondary" @click="cancelEdit">
            取消
          </button>
          <button
            class="btn btn-primary"
            @click="submitForm"
            :disabled="submitting || !canSubmit"
          >
            <span v-if="submitting">
              <span class="btn-spinner"></span>
              {{ editingId ? '更新中...' : '创建中...' }}
            </span>
            <span v-else>
              {{ editingId ? '💾 更新专题' : '✨ 创建专题' }}
            </span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

const activeTab = ref('list')
const loadingTopics = ref(false)
const loadingSecrets = ref(false)
const submitting = ref(false)
const topics = ref([])
const secrets = ref([])
const formError = ref('')
const editingId = ref(null)

const form = ref({
  title: '',
  introduction: '',
  secretIds: []
})

const canSubmit = computed(() => {
  return (
    form.value.title.trim() &&
    form.value.introduction.trim() &&
    form.value.secretIds.length > 0
  )
})

async function fetchTopics() {
  loadingTopics.value = true
  try {
    const response = await fetch('/api/topics')
    const data = await response.json()
    topics.value = data.topics || []
  } catch (error) {
    console.error('获取专题列表失败:', error)
    topics.value = []
  } finally {
    loadingTopics.value = false
  }
}

async function fetchSecrets() {
  loadingSecrets.value = true
  try {
    const response = await fetch('/api/secrets')
    const data = await response.json()
    secrets.value = data.secrets || []
  } catch (error) {
    console.error('获取秘密列表失败:', error)
    secrets.value = []
  } finally {
    loadingSecrets.value = false
  }
}

function toggleSecret(secretId) {
  const index = form.value.secretIds.indexOf(secretId)
  if (index === -1) {
    form.value.secretIds.push(secretId)
  } else {
    form.value.secretIds.splice(index, 1)
  }
}

function resetForm() {
  form.value = {
    title: '',
    introduction: '',
    secretIds: []
  }
  formError.value = ''
  editingId.value = null
}

function editTopic(topic) {
  editingId.value = topic.id
  form.value = {
    title: topic.title,
    introduction: topic.introduction,
    secretIds: []
  }
  
  fetch(`/api/topics/${topic.id}`)
    .then(res => res.json())
    .then(data => {
      if (data.topic) {
        form.value.secretIds = data.topic.secrets.map(s => s.id)
      }
    })
    .catch(err => console.error('获取专题详情失败:', err))
  
  activeTab.value = 'create'
}

function cancelEdit() {
  resetForm()
  activeTab.value = 'list'
}

async function submitForm() {
  if (!canSubmit.value) return
  
  submitting.value = true
  formError.value = ''
  
  try {
    const url = editingId.value 
      ? `/api/topics/${editingId.value}`
      : '/api/topics'
    const method = editingId.value ? 'PUT' : 'POST'
    
    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(form.value)
    })
    
    const data = await response.json()
    
    if (response.ok) {
      resetForm()
      activeTab.value = 'list'
      fetchTopics()
    } else {
      formError.value = data.error || '操作失败，请重试'
    }
  } catch (error) {
    console.error('提交失败:', error)
    formError.value = '无法连接到服务器，请稍后重试'
  } finally {
    submitting.value = false
  }
}

async function deleteTopic(topicId) {
  if (!confirm('确定要删除这个专题吗？此操作不可恢复。')) return
  
  try {
    const response = await fetch(`/api/topics/${topicId}`, {
      method: 'DELETE'
    })
    
    if (response.ok) {
      fetchTopics()
    } else {
      const data = await response.json()
      alert(data.error || '删除失败')
    }
  } catch (error) {
    console.error('删除失败:', error)
    alert('无法连接到服务器')
  }
}

function formatDate(dateStr) {
  const date = new Date(dateStr)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })
}

onMounted(() => {
  fetchTopics()
  fetchSecrets()
})
</script>

<style scoped>
.topic-manage-container {
  width: 100%;
  max-width: 800px;
}

.manage-card {
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

.tabs {
  display: flex;
  gap: 10px;
  margin-bottom: 30px;
  border-bottom: 2px solid #eee;
  padding-bottom: 0;
}

.tab-btn {
  padding: 12px 24px;
  border: none;
  background: none;
  color: #666;
  font-size: 15px;
  cursor: pointer;
  border-bottom: 3px solid transparent;
  margin-bottom: -2px;
  transition: all 0.3s ease;
  font-weight: 500;
}

.tab-btn:hover {
  color: #667eea;
}

.tab-btn.active {
  color: #667eea;
  border-bottom-color: #667eea;
}

.tab-content {
  min-height: 300px;
}

.loading {
  text-align: center;
  padding: 40px 20px;
  color: #666;
}

.loading.small {
  padding: 20px;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(102, 126, 234, 0.3);
  border-top-color: #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 15px;
}

.spinner.small {
  width: 24px;
  height: 24px;
  margin-bottom: 10px;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.empty-state {
  text-align: center;
  padding: 40px 20px;
}

.empty-state.small {
  padding: 20px;
}

.empty-icon {
  font-size: 48px;
  display: block;
  margin-bottom: 15px;
}

.empty-state p {
  color: #999;
  font-size: 15px;
}

.manage-topics-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.manage-topic-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 12px;
  transition: all 0.3s ease;
}

.manage-topic-item:hover {
  background: #e9ecef;
}

.topic-info {
  flex: 1;
}

.topic-title {
  color: #333;
  font-size: 17px;
  font-weight: 600;
  margin: 0 0 8px;
}

.topic-intro {
  color: #666;
  font-size: 14px;
  margin: 0 0 12px;
  line-height: 1.6;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.topic-meta {
  display: flex;
  gap: 12px;
}

.meta-tag {
  color: #999;
  font-size: 13px;
  background: #e9ecef;
  padding: 4px 10px;
  border-radius: 8px;
}

.topic-actions {
  display: flex;
  gap: 10px;
  margin-left: 20px;
  flex-shrink: 0;
}

.form-group {
  margin-bottom: 24px;
}

.form-label {
  display: block;
  color: #333;
  font-weight: 500;
  margin-bottom: 10px;
  font-size: 15px;
}

.selected-count {
  color: #667eea;
  font-weight: normal;
  font-size: 14px;
  margin-left: 8px;
}

.form-input {
  width: 100%;
  padding: 14px 18px;
  border: 2px solid #e0e0e0;
  border-radius: 12px;
  font-size: 15px;
  font-family: inherit;
  transition: all 0.3s ease;
  background: #fafafa;
}

.form-input:focus {
  outline: none;
  border-color: #667eea;
  background: white;
  box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1);
}

.form-textarea {
  width: 100%;
  padding: 14px 18px;
  border: 2px solid #e0e0e0;
  border-radius: 12px;
  font-size: 15px;
  font-family: inherit;
  resize: vertical;
  transition: all 0.3s ease;
  background: #fafafa;
  line-height: 1.7;
}

.form-textarea:focus {
  outline: none;
  border-color: #667eea;
  background: white;
  box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1);
}

.secrets-select {
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-height: 400px;
  overflow-y: auto;
  padding: 8px;
  background: #f8f9fa;
  border-radius: 12px;
}

.secret-select-item {
  display: flex;
  gap: 14px;
  padding: 14px;
  background: white;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.secret-select-item:hover {
  background: #f0f4ff;
}

.secret-select-item.selected {
  border-color: #667eea;
  background: linear-gradient(135deg, #f0f4ff 0%, #e8edff 100%);
}

.checkbox {
  width: 22px;
  height: 22px;
  border: 2px solid #ddd;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all 0.3s ease;
  font-size: 14px;
  font-weight: bold;
  color: white;
}

.secret-select-item.selected .checkbox {
  background: #667eea;
  border-color: #667eea;
}

.secret-content {
  color: #555;
  font-size: 14px;
  line-height: 1.7;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.error-message {
  background: #fef2f2;
  color: #dc2626;
  padding: 12px 16px;
  border-radius: 10px;
  margin-bottom: 20px;
  font-size: 14px;
  border-left: 4px solid #dc2626;
}

.form-actions {
  display: flex;
  gap: 15px;
  justify-content: flex-end;
  padding-top: 20px;
  border-top: 1px solid #eee;
}

.btn-spinner {
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin-right: 8px;
  vertical-align: middle;
}
</style>
