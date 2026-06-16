import { createApp } from 'vue'
import { createRouter, createWebHashHistory } from 'vue-router'
import App from './App.vue'
import Home from './views/Home.vue'
import Confess from './views/Confess.vue'
import Topics from './views/Topics.vue'
import TopicDetail from './views/TopicDetail.vue'
import TopicManage from './views/TopicManage.vue'
import './style.css'

const routes = [
  { path: '/', component: Home },
  { path: '/confess', component: Confess },
  { path: '/topics', component: Topics },
  { path: '/topics/:id', component: TopicDetail },
  { path: '/manage', component: TopicManage }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

const app = createApp(App)
app.use(router)
app.mount('#app')
