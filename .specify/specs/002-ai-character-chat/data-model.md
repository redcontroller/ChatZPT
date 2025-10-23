# AI 캐릭터 채팅 시스템 데이터 모델

## 데이터베이스 스키마

### Characters 테이블

```sql
CREATE TABLE characters (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  personality TEXT,
  avatar VARCHAR(500),
  system_prompt TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  created_by VARCHAR(36) NOT NULL,
  
  INDEX idx_created_by (created_by),
  INDEX idx_is_active (is_active),
  INDEX idx_name (name)
);
```

### Conversations 테이블

```sql
CREATE TABLE conversations (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  character_id VARCHAR(36) NOT NULL,
  title VARCHAR(200),
  is_active BOOLEAN DEFAULT true,
  message_count INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  last_message_at TIMESTAMP NULL,
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (character_id) REFERENCES characters(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_character_id (character_id),
  INDEX idx_last_message_at (last_message_at),
  INDEX idx_user_character (user_id, character_id)
);
```

### Messages 테이블

```sql
CREATE TABLE messages (
  id VARCHAR(36) PRIMARY KEY,
  conversation_id VARCHAR(36) NOT NULL,
  type ENUM('user', 'character') NOT NULL,
  content TEXT NOT NULL,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  character_id VARCHAR(36) NULL,
  metadata JSON NULL,
  
  FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE,
  FOREIGN KEY (character_id) REFERENCES characters(id) ON DELETE SET NULL,
  INDEX idx_conversation_id (conversation_id),
  INDEX idx_timestamp (timestamp),
  INDEX idx_type (type),
  INDEX idx_character_id (character_id)
);
```

### UserPreferences 테이블

```sql
CREATE TABLE user_preferences (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  character_id VARCHAR(36) NOT NULL,
  custom_prompt TEXT NULL,
  conversation_style ENUM('casual', 'formal', 'friendly') DEFAULT 'friendly',
  language ENUM('ko', 'en') DEFAULT 'ko',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (character_id) REFERENCES characters(id) ON DELETE CASCADE,
  UNIQUE KEY unique_user_character (user_id, character_id),
  INDEX idx_user_id (user_id),
  INDEX idx_character_id (character_id)
);
```

### CharacterGroups 테이블 (멀티 캐릭터 대화용)

```sql
CREATE TABLE character_groups (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_by VARCHAR(36) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_created_by (created_by),
  INDEX idx_is_active (is_active)
);
```

### CharacterGroupMembers 테이블

```sql
CREATE TABLE character_group_members (
  id VARCHAR(36) PRIMARY KEY,
  group_id VARCHAR(36) NOT NULL,
  character_id VARCHAR(36) NOT NULL,
  role VARCHAR(50) DEFAULT 'member',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (group_id) REFERENCES character_groups(id) ON DELETE CASCADE,
  FOREIGN KEY (character_id) REFERENCES characters(id) ON DELETE CASCADE,
  UNIQUE KEY unique_group_character (group_id, character_id),
  INDEX idx_group_id (group_id),
  INDEX idx_character_id (character_id)
);
```

## TypeScript 인터페이스

### Character 인터페이스

```typescript
interface Character {
  id: string;
  name: string;
  description: string;
  personality: string;
  avatar: string;
  systemPrompt: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

interface CreateCharacterRequest {
  name: string;
  description: string;
  personality: string;
  avatar?: string;
  systemPrompt: string;
}

interface UpdateCharacterRequest {
  name?: string;
  description?: string;
  personality?: string;
  avatar?: string;
  systemPrompt?: string;
  isActive?: boolean;
}
```

### Conversation 인터페이스

```typescript
interface Conversation {
  id: string;
  userId: string;
  characterId: string;
  title: string;
  isActive: boolean;
  messageCount: number;
  createdAt: Date;
  updatedAt: Date;
  lastMessageAt?: Date;
}

interface CreateConversationRequest {
  characterId: string;
  title?: string;
}

interface ConversationSummary {
  id: string;
  characterId: string;
  characterName: string;
  title: string;
  lastMessage: string;
  lastMessageAt: Date;
  messageCount: number;
}
```

### Message 인터페이스

```typescript
interface Message {
  id: string;
  conversationId: string;
  type: 'user' | 'character';
  content: string;
  timestamp: Date;
  characterId?: string;
  metadata?: MessageMetadata;
}

interface MessageMetadata {
  tokens?: number;
  processingTime?: number;
  model?: string;
  temperature?: number;
  topP?: number;
}

interface SendMessageRequest {
  characterId: string;
  message: string;
  conversationId?: string;
}

interface MessageResponse {
  messageId: string;
  characterResponse: {
    message: string;
    timestamp: Date;
    characterId: string;
  };
  conversationId: string;
}
```

### UserPreference 인터페이스

```typescript
interface UserPreference {
  id: string;
  userId: string;
  characterId: string;
  customPrompt?: string;
  conversationStyle: 'casual' | 'formal' | 'friendly';
  language: 'ko' | 'en';
  createdAt: Date;
  updatedAt: Date;
}

interface UpdateUserPreferenceRequest {
  customPrompt?: string;
  conversationStyle?: 'casual' | 'formal' | 'friendly';
  language?: 'ko' | 'en';
}
```

### CharacterGroup 인터페이스

```typescript
interface CharacterGroup {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  members: CharacterGroupMember[];
}

interface CharacterGroupMember {
  id: string;
  groupId: string;
  characterId: string;
  role: string;
  createdAt: Date;
  character?: Character;
}

interface CreateCharacterGroupRequest {
  name: string;
  description: string;
  characterIds: string[];
}

interface AddCharacterToGroupRequest {
  characterId: string;
  role?: string;
}
```

## 데이터 관계도

```
Users
├── Conversations (1:N)
│   ├── Messages (1:N)
│   └── Characters (N:1)
├── UserPreferences (1:N)
│   └── Characters (N:1)
└── CharacterGroups (1:N)
    └── CharacterGroupMembers (1:N)
        └── Characters (N:1)

Characters
├── Conversations (1:N)
├── Messages (1:N)
├── UserPreferences (1:N)
└── CharacterGroupMembers (1:N)
```

## 인덱스 전략

### 주요 쿼리 패턴별 인덱스

1. **사용자별 대화 목록 조회**
   - `conversations(user_id, last_message_at DESC)`

2. **특정 대화의 메시지 조회**
   - `messages(conversation_id, timestamp ASC)`

3. **캐릭터별 대화 조회**
   - `conversations(user_id, character_id, last_message_at DESC)`

4. **활성 캐릭터 조회**
   - `characters(is_active, name)`

5. **사용자별 캐릭터 설정 조회**
   - `user_preferences(user_id, character_id)`

## 데이터 마이그레이션

### 초기 데이터 설정

```typescript
// 기본 캐릭터 생성
const defaultCharacters = [
  {
    name: "아리",
    description: "친근하고 활발한 AI 어시스턴트",
    personality: "친근하고 긍정적이며 도움이 되는 성격",
    systemPrompt: "당신은 아리라는 이름의 친근한 AI 어시스턴트입니다..."
  },
  {
    name: "지니",
    description: "지식이 풍부한 AI 도우미",
    personality: "차분하고 전문적이며 정확한 정보를 제공하는 성격",
    systemPrompt: "당신은 지니라는 이름의 전문적인 AI 어시스턴트입니다..."
  }
];
```

### 데이터 정리 작업

```typescript
// 오래된 대화 정리 (30일 이상)
const cleanupOldConversations = async () => {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  await db.conversations
    .where('lastMessageAt')
    .below(thirtyDaysAgo)
    .and(conversation => !conversation.isActive)
    .delete();
};

// 사용하지 않는 메시지 메타데이터 정리
const cleanupMessageMetadata = async () => {
  await db.messages
    .where('metadata')
    .notEqual(null)
    .modify(message => {
      delete message.metadata.tokens;
      delete message.metadata.processingTime;
    });
};
```

## 성능 최적화

### 쿼리 최적화

1. **페이징 처리**
   ```typescript
   const getMessages = async (conversationId: string, page: number, limit: number) => {
     const offset = (page - 1) * limit;
     return await db.messages
       .where('conversationId')
       .equals(conversationId)
       .orderBy('timestamp')
       .offset(offset)
       .limit(limit)
       .toArray();
   };
   ```

2. **대화 요약 생성**
   ```typescript
   const generateConversationSummary = async (conversationId: string) => {
     const messages = await db.messages
       .where('conversationId')
       .equals(conversationId)
       .orderBy('timestamp')
       .limit(10)
       .toArray();
     
     return messages.map(msg => ({
       role: msg.type === 'user' ? 'user' : 'assistant',
       content: msg.content
     }));
   };
   ```

### 캐싱 전략

1. **캐릭터 정보 캐싱**
   ```typescript
   const getCharacter = async (characterId: string) => {
     const cacheKey = `character:${characterId}`;
     let character = await cache.get(cacheKey);
     
     if (!character) {
       character = await db.characters.get(characterId);
       await cache.set(cacheKey, character, 3600); // 1시간 캐시
     }
     
     return character;
   };
   ```

2. **사용자 설정 캐싱**
   ```typescript
   const getUserPreferences = async (userId: string) => {
     const cacheKey = `user_preferences:${userId}`;
     let preferences = await cache.get(cacheKey);
     
     if (!preferences) {
       preferences = await db.userPreferences
         .where('userId')
         .equals(userId)
         .toArray();
       await cache.set(cacheKey, preferences, 1800); // 30분 캐시
     }
     
     return preferences;
   };
   ```

## 데이터 백업 및 복구

### 백업 전략

```typescript
const backupData = async () => {
  const backup = {
    characters: await db.characters.toArray(),
    conversations: await db.conversations.toArray(),
    messages: await db.messages.toArray(),
    userPreferences: await db.userPreferences.toArray(),
    timestamp: new Date().toISOString()
  };
  
  const backupFile = `backup_${Date.now()}.json`;
  await fs.writeFile(`./backups/${backupFile}`, JSON.stringify(backup, null, 2));
  
  return backupFile;
};
```

### 복구 전략

```typescript
const restoreData = async (backupFile: string) => {
  const backup = JSON.parse(await fs.readFile(`./backups/${backupFile}`, 'utf8'));
  
  await db.characters.clear();
  await db.characters.bulkAdd(backup.characters);
  
  await db.conversations.clear();
  await db.conversations.bulkAdd(backup.conversations);
  
  await db.messages.clear();
  await db.messages.bulkAdd(backup.messages);
  
  await db.userPreferences.clear();
  await db.userPreferences.bulkAdd(backup.userPreferences);
};
```
