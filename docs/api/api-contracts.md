# ProjectLibre API Contracts Documentation

**Версия:** 1.0.0  
**Статус:** ГОТОВО  
**Последнее обновление:** 2025-12-28

---

## 📋 **ОБЩАЯ ИНФОРМАЦИЯ**

### **Базовый URL:**
- **Development:** `http://localhost:8080/api/v1`
- **Test:** `http://localhost:8081/api/v1`

### **Аутентификация:**
- **Type:** Bearer Token (JWT)
- **Header:** `Authorization: Bearer <token>`
- **Content-Type:** `application/json`

### **Обработка ошибок:**
- **Формат:** JSON с Error DTO
- **Status Codes:** Стандартные HTTP коды

---

## 🏗️ **АРХИТЕКТУРА КОНТРАКТОВ**

### **Data Flow:**
```
React UI ──HTTP/JSON──► Spring Boot API ──Thread-Safe──► LocalSession ──► ProjectLibre Core
```

### **Версионирование:**
- **Текущая версия:** `/api/v1/`
- **Backward compatibility:** Поддержка в рамках одного major
- **Versioning strategy:** Semantic Versioning

---

## 📁 **СТРУКТУРА ПРОЕКТОВ**

### **Project Management:**
- **GET** `/projects` - Получить все проекты
- **POST** `/projects` - Создать проект
- **GET** `/projects/{id}` - Получить проект
- **PUT** `/projects/{id}` - Обновить проект
- **DELETE** `/projects/{id}` - Удалить проект
- **POST** `/projects/{id}/save` - Сохранить в файл

### **Task Management:**
- **GET** `/projects/{projectId}/tasks` - Задачи проекта
- **POST** `/projects/{projectId}/tasks` - Создать задачу
- **GET** `/tasks/{id}` - Получить задачу
- **PUT** `/tasks/{id}` - Обновить задачу
- **DELETE** `/tasks/{id}` - Удалить задачу

### **Resource Management:**
- **GET** `/projects/{projectId}/resources` - Ресурсы проекта
- **POST** `/projects/{projectId}/resources` - Добавить ресурс
- **GET** `/resources/{id}` - Получить ресурс
- **PUT** `/resources/{id}` - Обновить ресурс
- **DELETE** `/resources/{id}` - Удалить ресурс

### **Import/Export:**
- **POST** `/import` - Импортировать файл
- **GET** `/projects/{id}/export` - Экспортировать проект

---

## 📊 **МОДЕЛИ ДАННЫХ**

### **Project Model:**
```json
{
  "id": "uuid",
  "name": "string (max 255)",
  "description": "string (max 1000)",
  "startDate": "ISO 8601 datetime",
  "endDate": "ISO 8601 datetime (optional)",
  "status": "PLANNING|ACTIVE|COMPLETED|ON_HOLD|CANCELLED",
  "progress": "number (0-100)",
  "createdAt": "ISO 8601 datetime",
  "updatedAt": "ISO 8601 datetime",
  "tasks": "Task[]",
  "resources": "Resource[]"
}
```

### **Task Model:**
```json
{
  "id": "uuid",
  "projectId": "uuid",
  "name": "string (max 255)",
  "description": "string (max 1000)",
  "duration": "number (hours)",
  "startDate": "ISO 8601 datetime",
  "endDate": "ISO 8601 datetime (optional)",
  "progress": "number (0-100)",
  "priority": "LOW|MEDIUM|HIGH|CRITICAL",
  "status": "NOT_STARTED|IN_PROGRESS|COMPLETED|ON_HOLD|CANCELLED",
  "dependencies": "string[] (task IDs)",
  "assigneeId": "uuid (resource ID)",
  "createdAt": "ISO 8601 datetime",
  "updatedAt": "ISO 8601 datetime"
}
```

### **Resource Model:**
```json
{
  "id": "uuid",
  "projectId": "uuid",
  "name": "string (max 255)",
  "type": "HUMAN|MATERIAL|EQUIPMENT|FACILITY",
  "email": "email (HUMAN resources only)",
  "capacity": "number (hours/day)",
  "cost": "number (cost/hour)",
  "availability": {
    "monday": "boolean",
    "tuesday": "boolean",
    "wednesday": "boolean",
    "thursday": "boolean",
    "friday": "boolean",
    "saturday": "boolean",
    "sunday": "boolean"
  },
  "createdAt": "ISO 8601 datetime",
  "updatedAt": "ISO 8601 datetime"
}
```

---

## 🔧 **ВАЛИДАЦИЯ ДАННЫХ**

### **Required Fields:**
- **Project:** `id`, `name`, `startDate`
- **Task:** `id`, `projectId`, `name`, `duration`, `startDate`
- **Resource:** `id`, `projectId`, `name`, `type`

### **Validation Rules:**
- **String fields:** Max length, pattern matching
- **Numeric fields:** Positive values, ranges
- **Date fields:** ISO 8601 format
- **UUID fields:** Valid UUID format

---

## 📝 **ПРИМЕРЫ ЗАПРОСОВ**

### **Create Project:**
```bash
curl -X POST http://localhost:8080/api/v1/projects \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "name": "New Project",
    "description": "Project description",
    "startDate": "2025-01-15T09:00:00Z",
    "endDate": "2025-06-30T18:00:00Z"
  }'
```

### **Create Task:**
```bash
curl -X POST http://localhost:8080/api/v1/projects/{projectId}/tasks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "name": "New Task",
    "description": "Task description",
    "duration": 40,
    "startDate": "2025-02-01T09:00:00Z",
    "priority": "MEDIUM"
  }'
```

### **Import File:**
```bash
curl -X POST http://localhost:8080/api/v1/import \
  -H "Authorization: Bearer <token>" \
  -F "file=@project.pod" \
  -F "format=pod"
```

---

## 🔄 **РЕАЛИЗАЦИЯ НА БЭКЕНДЕ**

### **Spring Boot Controller:**
```java
@RestController
@RequestMapping("/api/v1")
@Validated
public class ProjectController {
    
    @GetMapping("/projects")
    public ResponseEntity<List<Project>> getProjects() {
        // Implementation
    }
    
    @PostMapping("/projects")
    public ResponseEntity<Project> createProject(
        @Valid @RequestBody CreateProjectRequest request) {
        // Implementation with validation
    }
}
```

### **Service Layer:**
```java
@Service
@Transactional
public class ProjectService {
    
    public Project createProject(CreateProjectRequest request) {
        // Validation and business logic
        // Thread-safe LocalSession calls
        return project;
    }
}
```

---

## 🔍 **ТЕСТИРОВАНИЕ КОНТРАКТОВ**

### **Unit Tests:**
- DTO validation тесты
- Controller endpoint тесты
- Service layer бизнес-логика тесты

### **Contract Tests (Pact):**
- Consumer тесты (React frontend)
- Provider тесты (Java backend)
- Автоматическая валидация в CI

### **Integration Tests:**
- End-to-end API flow тесты
- Database integration тесты
- Performance тесты

---

## 📋 **CHECKLIST ДЛЯ РЕАЛИЗАЦИИ**

### **Backend Development:**
- [ ] Создать Spring Boot controllers
- [ ] Реализовать DTO классы
- [ ] Настроить validation
- [ ] Добавить error handling
- [ ] Настроить CORS
- [ ] Реализовать authentication

### **Frontend Development:**
- [ ] Интегрировать типы TypeScript
- [ ] Настроить HTTP клиент
- [ ] Реализовать error handling
- [ ] Добавить type guards
- [ ] Создать service layer

### **Testing:**
- [ ] Unit тесты (JUnit/Vitest)
- [ ] Contract тесты (Pact)
- [ ] Integration тесты
- [ ] Performance тесты
- [ ] Load тесты

---

## 📈 **METRICS И MONITORING**

### **API Performance:**
- Response time < 500ms
- Throughput > 100 req/sec
- Error rate < 1%
- CPU usage < 70%
- Memory usage < 600MB

### **Contract Metrics:**
- 80% покрытие контрактными тестами
- 0 breaking changes в minor версиях
- 100% compatibility с OpenAPI spec

---

**Документация готова к использованию в разработке! 🚀**

Для начала работы используйте:
- **[OpenAPI Spec](./openapi-spec.yaml)** - Полная спецификация
- **[Postman Collection](./postman-collection.json)** - Готовые запросы
- **[TypeScript Types](./dto-types.ts)** - Типы для frontend
- **[Java Classes](./dto-classes.java)** - DTO классы для backend