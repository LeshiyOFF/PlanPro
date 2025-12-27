# ADR-001: ProjectLibre Electron Wrapper Architecture Decisions

**Status:** Accepted  
**Date:** 2025-12-28  
**Decision Makers:** Architecture Team, Project Manager  
**Reviewers:** Lead Developer, QA Lead  

---

## 📋 **CONTEXT**

ProjectLibre - это Java desktop приложение с UI на Swing. Нам нужно создать современную Electron обертку с React UI, сохранив при этом существующую Java бизнес-логику. Ключевые требования:

1. Сохранить 70-80% Java бизнес-логики  
2. Полная замена UI на React + shadcn/ui
3. Гибридная архитектура: Electron + React + Java REST API
4. Минимальные изменения в существующем Java коде
5. Поддержка больших проектов (1000+ задач)

---

## 🎯 **DECISIONS**

### **1. modifyJava = true Strategy**
**Status:** ✅ **APPROVED**

**Решение:** Мы МОДИФИЦИРУЕМ существующий Java код, но минимизируем изменения:
- Создаем thread-safe wrapper для LocalSession
- Сохраняем существующую бизнес-логику
- Добавляем REST API layer без изменения core классов
- Обрабатываем Swing зависимости через wrapper

**Альтернативы отклонены:**
- ❌ Полное переписывание Java (слишком дорого и долго)
- ❌ Отдельный Java процесс (проблемы с производительностью)

---

### **2. API Style: REST HTTP**
**Status:** ✅ **APPROVED**

**Решение:** Используем REST API для коммуникации между React UI и Java backend:
- HTTP/JSON для всех CRUD операций
- Stateful сессии через проектный контекст
- Поддержка CORS для Electron renderer process

**Технологии:**
- Spring Boot 3.x с embedded Tomcat
- Jackson для JSON сериализации
- Standard HTTP status codes и error handling

**Альтернативы отклонены:**
- ❌ WebSocket (избыточно для CRUD operations)
- ❌ gRPC (сложность интеграции с существующим кодом)

---

### **3. Serialization Format: JSON**
**Status:** ✅ **APPROVED**

**Решение:** JSON как основной формат обмена данными:
- Human readable для отладки
- Native поддержка в браузере и Java
- Легкая валидация и schema definition

**Структура:**
```json
{
  "projectId": "string",
  "tasks": [...],
  "resources": [...],
  "metadata": {...}
}
```

**Альтернативы отклонены:**
- ❌ XML (избыточно для web)
- ❌ Protocol Buffers (сложность отладки)

---

### **4. Versioning и Backward Compatibility**
**Status:** ✅ **APPROVED**

**Решение:** Semantic Versioning для API:
- `/api/v1/projects` - текущая версия
- `/api/v2/projects` - будущие изменения
- Backward compatibility для одного major version

**Правила:**
- **PATCH:** Minor fixes, не breaking changes
- **MINOR:** New features, backward compatible  
- **MAJOR:** Breaking changes, support previous version

---

### **5. Thread-Safety Strategy**
**Status:** ✅ **APPROVED**

**Решение:** Multi-layered approach к thread safety:
1. **Thread-Safe Wrapper** для LocalSession
2. **Per-project locks** для mutating operations
3. **Read-only concurrency** для query operations
4. **SynchronizedFacade pattern** для complex operations

**Implementation:**
```java
@Service
public class ThreadSafeProjectService {
    private final Map<String, ReentrantLock> projectLocks = new ConcurrentHashMap<>();
    
    public void updateProject(String projectId, ProjectData data) {
        ReentrantLock lock = projectLocks.computeIfAbsent(projectId, k -> new ReentrantLock());
        lock.lock();
        try {
            localSession.updateProject(data);
        } finally {
            lock.unlock();
        }
    }
}
```

---

### **6. Security Architecture**
**Status:** ✅ **APPROVED**

**Решение:** Defense-in-depth для Electron security:
- **Renderer Process:** No nodeIntegration, CSP enabled
- **Preload Script:** contextBridge для безопасного IPC
- **Main Process:** Управление Java процессом и системными вызовами
- **IPC:** Whitelist каналов, rate limiting

**Security Checklist:**
- [ ] `nodeIntegration: false`
- [ ] `contextIsolation: true`
- [ ] CSP headers для всех renderer pages
- [ ] Validated IPC channels only
- [ ] No direct filesystem access from renderer

---

## 🏗️ **ARCHITECTURE DIAGRAM**

```
┌─────────────────────────────────────────────────────────┐
│                ELECTRON APP                         │
│  ┌─────────────────┐    ┌─────────────────────┐   │
│  │  React UI       │    │  Main Process      │   │
│  │  (Renderer)     │◄──►│  (Node.js)        │   │
│  │                 │    │                     │   │
│  │ ┌─────────────┐ │    │ ┌─────────────────┐ │   │
│  │ │ shadcn/ui   │ │    │ │ IPC Handlers   │ │   │
│  │ └─────────────┘ │    │ └─────────────────┘ │   │
│  └─────────────────┘    └─────────────────────┘   │
│           ▲                      ▲                │
│           │                      │                │
│      HTTP/JSON              IPC Bridge           │
│           │                      │                │
│    ┌─────────────────────────────────────────┐     │
│    │      SPRING BOOT REST API           │     │
│    │  ┌─────────────────────────────────┐ │     │
│    │  │   Thread-Safe Wrapper         │ │     │
│    │  │   Service Layer              │ │     │
│    │  └─────────────────────────────────┘ │     │
│    │              ▲                        │     │
│    │              │                        │     │
│    │  ┌─────────────────────────────────┐ │     │
│    │  │    ProjectLibre Core         │ │     │
│    │  │  (LocalSession + Business)  │ │     │
│    │  └─────────────────────────────────┘ │     │
│    └─────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────┘
```

---

## 📊 **PERFORMANCE REQUIREMENTS**

### **Response Time Targets:**
- **API calls:** < 500ms for CRUD operations
- **Project load:** < 5s for 1000 tasks
- **Cold start:** < 8s total application startup
- **Memory usage:** < 600MB for large projects

### **Concurrency:**
- **Maximum concurrent users:** 1 (desktop app)
- **Internal concurrency:** Support for 50+ concurrent API calls
- **Thread pool size:** Configurable, default 10 threads

---

## 🔄 **MIGRATION STRATEGY**

### **Phase 1: Foundation**
1. Создать Thread-Safe Wrapper
2. Реализовать базовые REST endpoints
3. Настроить security baseline

### **Phase 2: Integration**
1. Подключить React UI к API
2. Реализовать IPC communication
3. Тестировать end-to-end flows

### **Phase 3: Migration**
1. Перенести существующий функционал
2. Тестировать compatibility
3. Оптимизировать performance

---

## ⚠️ **RISKS AND MITIGATIONS**

| Risk | Probability | Impact | Mitigation |
|-------|-------------|---------|------------|
| Swing dependencies | High | High | Thread-safe wrapper + spike testing |
| Performance issues | Medium | High | Performance budgets + profiling |
| Security vulnerabilities | Low | High | Security checklist + code review |
| Integration complexity | Medium | Medium | Contract tests + OpenAPI spec |

---

## 📋 **IMPLEMENTATION CHECKLIST**

### **Pre-Implementation:**
- [ ] Team review of this ADR
- [ ] Spike for Thread-Safe Wrapper completed
- [ ] Security baseline implemented
- [ ] OpenAPI spec created

### **During Implementation:**
- [ ] Follow thread-safety patterns
- [ ] Implement security controls
- [ ] Maintain API contracts
- [ ] Performance monitoring

### **Post-Implementation:**
- [ ] Security audit
- [ ] Performance testing
- [ ] Contract testing validation
- [ ] Documentation updates

---

## 📝 **DECISION RECORD**

**Final Decision:** APPROVED with modifications

This ADR establishes the foundation architecture for ProjectLibre Electron wrapper with the following key principles:

1. **Preserve existing Java code** where possible
2. **Thread-safe integration** through wrapper pattern  
3. **Modern security practices** for Electron
4. **RESTful communication** between UI and backend
5. **Performance-first approach** with measurable targets

**Next Steps:**
1. Create OpenAPI specification based on these decisions
2. Implement Thread-Safe Wrapper spike
3. Set up security baseline
4. Begin parallel development of React UI and REST API

---

**Document Version:** 1.0  
**Last Updated:** 2025-12-28  
**Next Review:** 2025-01-15