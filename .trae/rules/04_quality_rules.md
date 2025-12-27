# PROJECT LIBRE - QUALITY RULES

## 7. QUALITY ASSURANCE
7.1 Every change must compile - verify with ant compile
7.2 Test compilation after fixes - run full build
7.3 Document changes - update documentation

## 8. PROHIBITED ACTIONS
8.1 STRICTLY FORBIDDEN:
   - Changing Java version from 17
   - Modifying Ant configuration
   - Restructuring directories
   - Replacing working code
   - Experimenting with build tools
   - Analyzing from scratch

8.2 REQUIRE PERMISSION FOR:
   - Adding dependencies
   - Changing architecture
   - Modifying build process
   - Creating branches

## 9. VERIFICATION
9.1 Before action:
   - Check working directory
   - Verify git status
   - Confirm target exists

9.2 After change:
   - Run compilation test
   - Verify no regressions
   - Commit properly