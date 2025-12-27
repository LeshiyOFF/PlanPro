# PROJECT LIBRE - WORKFLOW RULES

## 3. WORKFLOW```
3.1 Use existing branches:
   - Main: `main`
   - Feature: `feature/java-17-modernization`
   - NO new branches without instruction
```
3.2 Commit messages - Conventional Commits:
   - Format: `type(scope): description`
   - Types: `feat`, `fix`, `refactor`, `docs`, `chore`

3.3 Push to origin only

## 4. ERROR HANDLING
4.1 Build errors:
   - Analyze log FIRST
   - Identify EXACT file and line
   - Make MINIMAL changes
   - NO unrelated file changes

4.2 Compilation errors:
   - Check Java 17 compatibility
   - Update ONLY problematic sections
   - NO entire class refactoring

4.3 FORBIDDEN:
   - NO "fixing on guess"
   - NO claiming fixed without proof
   - NO changing tool versions