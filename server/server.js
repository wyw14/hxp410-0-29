const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = 41129;

const DATA_DIR = path.join(__dirname, 'data');
const SECRETS_FILE = path.join(DATA_DIR, 'secrets.json');
const TOPICS_FILE = path.join(DATA_DIR, 'topics.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

if (!fs.existsSync(SECRETS_FILE)) {
  fs.writeFileSync(SECRETS_FILE, JSON.stringify([]));
}

if (!fs.existsSync(TOPICS_FILE)) {
  fs.writeFileSync(TOPICS_FILE, JSON.stringify([]));
}

app.use(cors());
app.use(express.json());

function readSecrets() {
  const data = fs.readFileSync(SECRETS_FILE, 'utf8');
  return JSON.parse(data);
}

function writeSecrets(secrets) {
  fs.writeFileSync(SECRETS_FILE, JSON.stringify(secrets, null, 2));
}

function readTopics() {
  const data = fs.readFileSync(TOPICS_FILE, 'utf8');
  return JSON.parse(data);
}

function writeTopics(topics) {
  fs.writeFileSync(TOPICS_FILE, JSON.stringify(topics, null, 2));
}

app.post('/api/secrets', (req, res) => {
  try {
    const { content } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ error: '秘密内容不能为空' });
    }

    const secrets = readSecrets();
    const newSecret = {
      id: uuidv4(),
      content: content.trim(),
      status: '已宽恕',
      createdAt: new Date().toISOString()
    };

    secrets.push(newSecret);
    writeSecrets(secrets);

    res.json({
      success: true,
      message: '你的秘密已被宽恕',
      secret: newSecret
    });
  } catch (error) {
    console.error('保存秘密时出错:', error);
    res.status(500).json({ error: '服务器内部错误' });
  }
});

app.get('/api/secrets/random', (req, res) => {
  try {
    const secrets = readSecrets();
    const forgivenSecrets = secrets.filter(s => s.status === '已宽恕');

    if (forgivenSecrets.length === 0) {
      return res.json({
        hasSecret: false,
        message: '还没有被宽恕的秘密，成为第一个分享的人吧'
      });
    }

    const randomIndex = Math.floor(Math.random() * forgivenSecrets.length);
    const randomSecret = forgivenSecrets[randomIndex];

    res.json({
      hasSecret: true,
      secret: {
        id: randomSecret.id,
        content: randomSecret.content,
        status: randomSecret.status
      }
    });
  } catch (error) {
    console.error('获取随机秘密时出错:', error);
    res.status(500).json({ error: '服务器内部错误' });
  }
});

app.get('/api/secrets', (req, res) => {
  try {
    const secrets = readSecrets();
    const forgivenSecrets = secrets.filter(s => s.status === '已宽恕');
    res.json({
      secrets: forgivenSecrets.map(s => ({
        id: s.id,
        content: s.content,
        status: s.status,
        createdAt: s.createdAt
      }))
    });
  } catch (error) {
    console.error('获取秘密列表时出错:', error);
    res.status(500).json({ error: '服务器内部错误' });
  }
});

app.get('/api/topics', (req, res) => {
  try {
    const topics = readTopics();
    res.json({
      topics: topics.map(t => ({
        id: t.id,
        title: t.title,
        introduction: t.introduction,
        secretCount: t.secretIds.length,
        createdAt: t.createdAt,
        updatedAt: t.updatedAt
      }))
    });
  } catch (error) {
    console.error('获取专题列表时出错:', error);
    res.status(500).json({ error: '服务器内部错误' });
  }
});

app.get('/api/topics/:id', (req, res) => {
  try {
    const { id } = req.params;
    const topics = readTopics();
    const topic = topics.find(t => t.id === id);

    if (!topic) {
      return res.status(404).json({ error: '专题不存在' });
    }

    const secrets = readSecrets();
    const topicSecrets = topic.secretIds
      .map(secretId => secrets.find(s => s.id === secretId))
      .filter(s => s && s.status === '已宽恕')
      .map(s => ({
        id: s.id,
        content: s.content,
        status: s.status,
        createdAt: s.createdAt
      }));

    res.json({
      topic: {
        id: topic.id,
        title: topic.title,
        introduction: topic.introduction,
        secrets: topicSecrets,
        createdAt: topic.createdAt,
        updatedAt: topic.updatedAt
      }
    });
  } catch (error) {
    console.error('获取专题详情时出错:', error);
    res.status(500).json({ error: '服务器内部错误' });
  }
});

app.post('/api/topics', (req, res) => {
  try {
    const { title, introduction, secretIds } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ error: '专题标题不能为空' });
    }
    if (!introduction || !introduction.trim()) {
      return res.status(400).json({ error: '专题导语不能为空' });
    }
    if (!secretIds || !Array.isArray(secretIds) || secretIds.length === 0) {
      return res.status(400).json({ error: '请至少选择一个秘密' });
    }

    const secrets = readSecrets();
    const validSecretIds = secretIds.filter(id => 
      secrets.find(s => s.id === id && s.status === '已宽恕')
    );

    if (validSecretIds.length === 0) {
      return res.status(400).json({ error: '没有有效的秘密被选中' });
    }

    const topics = readTopics();
    const newTopic = {
      id: uuidv4(),
      title: title.trim(),
      introduction: introduction.trim(),
      secretIds: validSecretIds,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    topics.push(newTopic);
    writeTopics(topics);

    res.json({
      success: true,
      message: '专题创建成功',
      topic: newTopic
    });
  } catch (error) {
    console.error('创建专题时出错:', error);
    res.status(500).json({ error: '服务器内部错误' });
  }
});

app.put('/api/topics/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { title, introduction, secretIds } = req.body;

    const topics = readTopics();
    const topicIndex = topics.findIndex(t => t.id === id);

    if (topicIndex === -1) {
      return res.status(404).json({ error: '专题不存在' });
    }

    if (title && title.trim()) {
      topics[topicIndex].title = title.trim();
    }
    if (introduction && introduction.trim()) {
      topics[topicIndex].introduction = introduction.trim();
    }
    if (secretIds && Array.isArray(secretIds) && secretIds.length > 0) {
      const secrets = readSecrets();
      const validSecretIds = secretIds.filter(secretId => 
        secrets.find(s => s.id === secretId && s.status === '已宽恕')
      );
      if (validSecretIds.length > 0) {
        topics[topicIndex].secretIds = validSecretIds;
      }
    }

    topics[topicIndex].updatedAt = new Date().toISOString();
    writeTopics(topics);

    res.json({
      success: true,
      message: '专题更新成功',
      topic: topics[topicIndex]
    });
  } catch (error) {
    console.error('更新专题时出错:', error);
    res.status(500).json({ error: '服务器内部错误' });
  }
});

app.delete('/api/topics/:id', (req, res) => {
  try {
    const { id } = req.params;
    const topics = readTopics();
    const filteredTopics = topics.filter(t => t.id !== id);

    if (filteredTopics.length === topics.length) {
      return res.status(404).json({ error: '专题不存在' });
    }

    writeTopics(filteredTopics);
    res.json({
      success: true,
      message: '专题删除成功'
    });
  } catch (error) {
    console.error('删除专题时出错:', error);
    res.status(500).json({ error: '服务器内部错误' });
  }
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`忏悔室后端服务运行在 http://localhost:${PORT}`);
});
