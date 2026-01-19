# Reverse Engineering UI Элементов ProjectLibre
# Анализ Event Flow для React миграции

## Обзор методологии

Документ детально описывает flow событий и взаимодействий для каждого UI элемента ProjectLibre. Анализ основан на изучении Java кода и логики обработки событий.

---

## 1. ГЛАВНОЕ ОКНО ПРИЛОЖЕНИЯ

### 1.1 MainWindow Structure
**Java класс:** `org.projectlibre.ui.MainWindow`

#### Event Flow при запуске:
1. **ApplicationStartup → MainWindow**
   ```
   Main.main() 
   → ProjectLibreApplication.startup() 
   → MainWindow constructor
   → initializeComponents()
   → loadProject() / createNewProject()
   → setVisible(true)
   ```

2. **Инициализация компонентов:**
   ```
   MainWindow.createMenuBar()
   → MenuBar.build()
   → createToolBar()
   → createStatusBar()
   → createMainSplitPane()
   → initializeViews()
   ```

3. **Загрузка проекта:**
   ```
   loadProject(file?)
   → ProjectDAO.load()
   → ProjectModel.update()
   → allViews.refresh()
   → updateTitle()
   → updateStatusBar()
   ```

#### Ключевые обработчики событий:
- `windowClosing()` → confirmation → saveIfNeeded() → dispose()
- `windowStateChanged()` → updateLayout()
- `componentResized()` → resizeViews()

---

## 2. МЕНЮ И ACTION СИСТЕМА

### 2.1 File Menu Event Flow

#### New Project (Ctrl+N)
```
NewProjectAction.actionPerformed()
→ ProjectDialog.showCreate()
→ user fills form
→ validation.checkProjectData()
→ Project.createNew()
→ MainWindow.loadProject()
→ updateRecentFiles()
```

#### Open Project (Ctrl+O)
```
OpenProjectAction.actionPerformed()
→ JFileChooser.showOpenDialog()
→ FileDialog.filterExtensions(.xml, .xer, .mpp)
→ selected file
→ ProjectIO.loadFromFile()
→ parseFile()
→ validateProject()
→ MainWindow.loadProject()
→ addToRecentFiles()
→ updateTitle()
```

#### Save Project (Ctrl+S)
```
SaveProjectAction.actionPerformed()
→ if (project.hasUnsavedChanges) {
    SaveDialog.show()
    → validatePath()
    → ProjectIO.saveToFile()
    → project.markAsSaved()
    → updateTitle()
    → statusBar.showMessage("Saved")
  }
```

#### Print Preview
```
PrintPreviewAction.actionPerformed()
→ PrintPreviewDialog.show()
→ createPrintableComponent()
→ setupPageSettings()
→ renderPreview()
→ enablePrintControls()
```

#### Export
```
ExportAction.actionPerformed()
→ ExportDialog.show()
→ selectFormat(XML, XER, PDF, Excel, CSV)
→ configureExportSettings()
→ ExportProcessor.export()
→ showSuccessMessage()
```

### 2.2 Edit Menu Event Flow

#### Undo (Ctrl+Z)
```
UndoAction.actionPerformed()
→ UndoManager.undo()
→ if (canUndo) {
    ProjectModel.restoreState()
    allViews.refresh()
    updateUndoRedoState()
  }
```

#### Redo (Ctrl+Y)
```
RedoAction.actionPerformed()
→ UndoManager.redo()
→ if (canRedo) {
    ProjectModel.restoreState()
    allViews.refresh()
    updateUndoRedoState()
  }
```

#### Cut (Ctrl+X)
```
CutAction.actionPerformed()
→ getSelectedTasks()
→ Clipboard.copyTasks()
→ ProjectModel.removeTasks()
→ UndoManager.addEdit()
→ allViews.refresh()
```

#### Copy (Ctrl+C)
```
CopyAction.actionPerformed()
→ getSelectedTasks()
→ Clipboard.copyTasks()
→ updateStatusBar("X tasks copied")
```

#### Paste (Ctrl+V)
```
PasteAction.actionPerformed()
→ if (Clipboard.hasTasks()) {
    tasks = Clipboard.getTasks()
    PasteDialog.show()
    → selectPasteMode(Insert/Append/Replace)
    → validatePaste()
    → ProjectModel.addTasks()
    → UndoManager.addEdit()
    → allViews.refresh()
  }
```

#### Delete (Del)
```
DeleteAction.actionPerformed()
→ getSelectedTasks()
→ DeleteConfirmationDialog.show()
    → showDependenciesWarning()
    → showResourceAssignmentsWarning()
  if (confirmed) {
    ProjectModel.removeTasks()
    UndoManager.addEdit()
    allViews.refresh()
  }
```

#### Find/Replace (Ctrl+F)
```
FindReplaceAction.actionPerformed()
→ FindReplaceDialog.show()
→ setupSearchFields()
→ setupReplaceFields()
→ startSearch()
→ highlightResults()
→ enableNavigationButtons()
```

### 2.3 View Menu Event Flow

#### Gantt Chart
```
GanttViewAction.actionPerformed()
→ ViewManager.switchTo(GANTT_CHART)
→ GanttView.activate()
→ updateToolBar()
→ updateStatusBar()
→ focusGanttChart()
→ fireViewChangedEvent()
```

#### Task Sheet
```
TaskSheetViewAction.actionPerformed()
→ ViewManager.switchTo(TASK_SHEET)
→ TaskSheetView.activate()
→ configureTableColumns()
→ updateRowHeights()
→ fireViewChangedEvent()
```

#### Resource Sheet
```
ResourceSheetViewAction.actionPerformed()
→ ViewManager.switchTo(RESOURCE_SHEET)
→ ResourceSheetView.activate()
→ loadResourceData()
→ configureResourceColumns()
→ fireViewChangedEvent()
```

#### Zoom In/Out
```
ZoomInAction.actionPerformed()
→ TimeScale.zoomIn()
→ recalculateTimePositions()
→ allViews.repaint()
→ updateZoomButtons()
→ statusBar.updateZoomLevel()

ZoomOutAction.actionPerformed()
→ TimeScale.zoomOut()
→ recalculateTimePositions()
→ allViews.repaint()
→ updateZoomButtons()
→ statusBar.updateZoomLevel()
```

### 2.4 Insert Menu Event Flow

#### New Task
```
NewTaskAction.actionPerformed()
→ TaskDialog.showCreate()
→ user fills task data
→ validation.validateTask()
→ Task.create()
→ ProjectModel.addTask()
→ UndoManager.addEdit()
→ allViews.refresh()
→ selectNewTask()
```

#### New Resource
```
NewResourceAction.actionPerformed()
→ ResourceDialog.showCreate()
→ user fills resource data
→ validation.validateResource()
→ Resource.create()
→ ProjectModel.addResource()
→ UndoManager.addEdit()
→ allViews.refresh()
→ selectNewResource()
```

#### New Milestone
```
NewMilestoneAction.actionPerformed()
→ TaskDialog.showCreate()
→ setIsMilestone(true)
→ setDuration(Duration.ZERO)
→ user fills milestone data
→ Milestone.create()
→ ProjectModel.addTask()
→ UndoManager.addEdit()
→ allViews.refresh()
→ selectNewMilestone()
```

### 2.5 Format Menu Event Flow

#### Font
```
FontAction.actionPerformed()
→ FontDialog.show()
→ selectFont()
→ Font.applyToCurrentView()
→ allViews.repaint()
→ updateFontMenu()
```

#### Bar Styles
```
BarStylesAction.actionPerformed()
→ BarStylesDialog.show()
→ configureTaskBars()
→ configureMilestoneBars()
→ configureSummaryBars()
→ configureCriticalBars()
→ applyStyles()
→ GanttView.repaint()
```

#### Gridlines
```
GridlinesAction.actionPerformed()
→ GridlinesDialog.show()
→ configureVerticalGridlines()
→ configureHorizontalGridlines()
→ configureMajorMinorLines()
→ applyGridlines()
→ allViews.repaint()
```

### 2.6 Tools Menu Event Flow

#### Assign Resources
```
AssignResourcesAction.actionPerformed()
→ ResourceAssignmentDialog.show()
→ loadSelectedTasks()
→ loadAvailableResources()
→ user selects resources
→ calculateAssignments()
→ validateAssignments()
→ applyAssignments()
→ UndoManager.addEdit()
→ allViews.refresh()
```

#### Level Resources
```
LevelResourcesAction.actionPerformed()
→ ResourceLevelingDialog.show()
→ configureLevelingOptions()
→ LevelingEngine.analyzeOverallocations()
→ generateLevelingPlan()
→ previewChanges()
→ applyLeveling()
→ UndoManager.addEdit()
→ allViews.refresh()
```

#### Change Working Time
```
ChangeWorkingTimeAction.actionPerformed()
→ WorkingTimeDialog.show()
→ loadCalendar()
→ selectDateRange()
→ configureWorkingTimes()
→ addExceptions()
→ Calendar.save()
→ recalculateSchedule()
→ allViews.refresh()
```

### 2.7 Help Menu Event Flow

#### About
```
AboutAction.actionPerformed()
→ AboutDialog.show()
→ displayApplicationInfo()
→ displayLicenseInfo()
→ displayVersionInfo()
```

#### Help Topics
```
HelpTopicsAction.actionPerformed()
→ HelpBrowser.open()
→ loadHelpIndex()
→ navigateToTopic()
```

---

## 3. TOOLBAR EVENT FLOW

### 3.1 Standard Toolbar

#### New Button
```
NewButton.actionPerformed()
→ NewProjectAction.actionPerformed()
→ (см. File → New Project)
```

#### Open Button
```
OpenButton.actionPerformed()
→ OpenProjectAction.actionPerformed()
→ (см. File → Open Project)
```

#### Save Button
```
SaveButton.actionPerformed()
→ SaveProjectAction.actionPerformed()
→ (см. File → Save Project)
→ updateSaveButtonState()
```

#### Print Button
```
PrintButton.actionPerformed()
→ PrintAction.actionPerformed()
→ PrintDialog.show()
→ configurePrinter()
→ configurePrintSettings()
→ PrintEngine.render()
→ Printer.print()
```

#### Undo/Redo Buttons
```
UndoButton.actionPerformed()
→ UndoAction.actionPerformed()
→ updateUndoRedoButtons()

RedoButton.actionPerformed()
→ RedoAction.actionPerformed()
→ updateUndoRedoButtons()
```

### 3.2 Formatting Toolbar

#### Bold Button
```
BoldButton.actionPerformed()
→ TextFormatAction.apply(BOLD)
→ getCurrentSelection()
→ Font.applyBold()
→ currentView.repaint()
```

#### Italic Button
```
ItalicButton.actionPerformed()
→ TextFormatAction.apply(ITALIC)
→ getCurrentSelection()
→ Font.applyItalic()
→ currentView.repaint()
```

#### Font Size Combo
```
FontSizeCombo.itemSelected()
→ FontSizeAction.apply(size)
→ getCurrentSelection()
→ Font.applySize(size)
→ currentView.repaint()
```

### 3.3 View Toolbar

#### Gantt Chart Button
```
GanttButton.actionPerformed()
→ GanttViewAction.actionPerformed()
→ updateViewButtons()
```

#### Task Sheet Button
```
TaskSheetButton.actionPerformed()
→ TaskSheetViewAction.actionPerformed()
→ updateViewButtons()
```

#### Zoom Slider
```
ZoomSlider.valueChanged()
→ TimeScale.setZoomLevel(value)
→ recalculateTimePositions()
→ allViews.repaint()
→ statusBar.updateZoomLevel()
```

---

## 4. DIALOG EVENT FLOW

### 4.1 Task Properties Dialog

#### Opening Dialog
```
TaskDialog.show(task?)
→ if (task) {
    loadTaskData(task)
  } else {
    initializeNewTask()
  }
→ setupFieldValidators()
→ setupDependenciesTable()
→ setupResourceAssignments()
→ setupNotesTab()
→ setupCustomFieldsTab()
→ show()
```

#### OK Button Click
```
TaskDialog.okButtonClicked()
→ validateAllFields()
→ if (validationErrors) {
    showValidationErrors()
    return
  }
→ gatherFormData()
→ if (isNewTask) {
    Task.create(formData)
  } else {
    Task.update(formData)
  }
→ validateDependencies()
→ validateAssignments()
→ UndoManager.addEdit()
→ allViews.refresh()
→ close()
```

#### Dependencies Table Events
```
DependenciesTable.rowSelected()
→ enableDeleteDependencyButton()

DependenciesTable.addDependency()
→ DependencyDialog.show()
→ selectPredecessorTask()
→ selectDependencyType()
→ setLagLead()
→ validateDependency()
→ addDependencyToTable()
```

#### Resource Assignments Events
```
ResourceAssignmentsTab.addAssignment()
→ ResourceAssignmentDialog.show()
→ selectResource()
→ setUnits()
→ setWork()
→ calculateCost()
→ validateAssignment()
→ addAssignmentToTable()
```

### 4.2 Project Properties Dialog

#### Statistics Tab
```
StatisticsTab.refresh()
→ calculateProjectStatistics()
→ displayTaskCounts()
→ displayDurationStatistics()
→ displayCostStatistics()
→ displayResourceUtilization()
```

#### Advanced Tab
```
AdvancedTab.settingsChanged()
→ CalculationOptions.update()
→ recalculateCriticalPath()
→ recalculateSlack()
→ recalculateDates()
→ allViews.refresh()
```

### 4.3 Resource Assignment Dialog

#### Resource Selection
```
ResourceTable.resourceSelected()
→ updateResourceDetails()
→ updateAvailabilityChart()
→ calculateCurrentAssignments()
→ enableAssignButton()
```

#### Assignment Creation
```
AssignButton.clicked()
→ validateResourceSelection()
→ validateUnitsValue()
→ calculateWorkFromUnits()
→ Assignment.create()
→ updateAssignmentsTable()
→ updateTaskDetails()
→ UndoManager.addEdit()
```

---

## 5. GANTT CHART EVENT FLOW

### 5.1 Task Bar Interaction

#### Task Selection
```
TaskComponent.mouseClicked()
→ if (singleClick) {
    selectTask(task)
    highlightTaskBar()
    updateTaskTableSelection()
    fireTaskSelectedEvent()
  } else if (doubleClick) {
    TaskDialog.show(task)
  }
```

#### Task Dragging
```
TaskComponent.mousePressed()
→ startDragOperation()
→ showDragFeedback()

TaskComponent.mouseDragged()
→ updateDragFeedback()
→ calculateNewDates()
→ validateNewDates()
→ updateDependencyLines()

TaskComponent.mouseReleased()
→ if (validDrop) {
    applyNewDates()
    UndoManager.addEdit()
    allViews.refresh()
  } else {
    cancelDrag()
  }
```

#### Task Resizing
```
TaskBarHandle.mousePressed()
→ startResizeOperation()
→ determineResizeDirection(start/end)

TaskBarHandle.mouseDragged()
→ calculateNewDuration()
→ updateTaskBarSize()
→ updateDateDisplay()

TaskBarHandle.mouseReleased()
→ if (validResize) {
    applyNewDuration()
    UndoManager.addEdit()
    allViews.refresh()
  }
```

### 5.2 Dependency Creation

#### Dependency Drag
```
TaskComponent.dependencyDragStart()
→ showDependencyLine()
→ captureStartPoint()

TaskComponent.dependencyDragMove()
→ updateDependencyLine()
→ findNearestValidTarget()
→ highlightTargetTask()

TaskComponent.dependencyDragEnd()
→ if (validTarget) {
    DependencyDialog.show()
    → selectDependencyType()
    → setLagLead()
    → validateDependency()
    Dependency.create()
    UndoManager.addEdit()
    allViews.refresh()
  }
```

### 5.3 Time Scale Interaction

#### Zoom Operations
```
TimeScale.mouseWheel()
→ if (ctrlPressed) {
    zoomIn() / zoomOut()
    recalculateTimePositions()
    updateScrollBar()
    allViews.repaint()
  } else {
    verticalScroll()
  }
```

#### Date Navigation
```
TimeScale.mouseClicked()
→ navigateToDate(clickPoint)
→ centerViewOnDate()
→ updateDateDisplay()
```

---

## 6. TASK TABLE EVENT FLOW

### 6.1 Cell Editing

#### Cell Selection
```
TaskTable.mouseClicked()
→ selectCell(row, column)
→ showCellEditor()
→ synchronizeWithGanttView()
→ fireTaskSelectedEvent()
```

#### Direct Editing
```
TaskTable.keyTyped(KeyEvent)
→ if (isEditableCell && isPrintableChar) {
    startCellEdit()
    showInlineEditor()
    focusEditor()
  }
```

#### Editor Validation
```
CellEditor.editingStopped()
→ validateCellValue()
→ if (isValid) {
    TaskModel.updateField()
    UndoManager.addEdit()
    allViews.refresh()
  } else {
    showValidationError()
    restoreOriginalValue()
  }
```

### 6.2 Row Operations

#### Row Selection
```
TaskTable.selectionChanged()
→ updateSelectedTasks()
→ synchronizeGanttSelection()
→ updateToolBarButtons()
→ fireSelectionChangedEvent()
```

#### Row Drag & Drop
```
TaskTable.dragStarted()
→ captureSelectedRows()
→ showDragFeedback()

TaskTable.dragOver()
→ calculateDropPosition()
→ showInsertionPoint()

TaskTable.drop()
→ validateDropOperation()
→ reorderTasks()
→ updateWBS()
    → updateWBSNumbers()
    → updateParentSummary()
    → recalculateProject()
  UndoManager.addEdit()
  allViews.refresh()
```

### 6.3 Column Operations

#### Column Resize
```
TableHeader.mouseDragged()
→ updateColumnWidth()
→ saveColumnSettings()
→ repaintTable()
```

#### Column Reorder
```
TableHeader.dragColumn()
→ calculateNewOrder()
→ updateColumnOrder()
→ saveColumnSettings()
→ repaintTable()
```

---

## 7. RESOURCE VIEWS EVENT FLOW

### 7.1 Resource Sheet

#### Resource Selection
```
ResourceTable.selectionChanged()
→ updateSelectedResources()
→ updateResourceDetails()
→ updateAssignmentChart()
→ fireResourceSelectedEvent()
```

#### Resource Editing
```
ResourceCellEditor.editingStopped()
→ validateResourceData()
→ ResourceModel.update()
→ UndoManager.addEdit()
→ allResourceViews.refresh()
```

### 7.2 Resource Usage Chart

#### Time Period Selection
```
ResourceUsageChart.mouseClicked()
→ selectTimePeriod()
→ showUsageDetails()
→ highlightAssignments()
```

#### Overallocation Detection
```
ResourceUsageChart.paintComponent()
→ calculateUtilization()
→ if (utilization > 100%) {
    highlightOverallocation()
    showOverallocationWarning()
  }
```

---

## 8. KEYBOARD EVENT HANDLING

### 8.1 Global Shortcuts

#### Ctrl+N (New Project)
```
MainPanel.keyPressed()
→ if (ctrl && key == 'N') {
    NewProjectAction.actionPerformed()
  }
```

#### Ctrl+S (Save)
```
MainPanel.keyPressed()
→ if (ctrl && key == 'S') {
    SaveProjectAction.actionPerformed()
  }
```

#### Delete Key
```
MainPanel.keyPressed()
→ if (key == VK_DELETE && hasFocus) {
    DeleteAction.actionPerformed()
  }
```

### 8.2 Context-Specific Shortcuts

#### F2 (Edit Cell)
```
TaskTable.keyPressed()
→ if (key == VK_F2) {
    startCellEdit()
  }
```

#### Enter (Confirm Edit)
```
CellEditor.keyPressed()
→ if (key == VK_ENTER) {
    stopCellEdit()
    moveToNextCell()
  }
```

---

## 9. CONTEXT MENU EVENT FLOW

### 9.1 Task Context Menu

#### Menu Creation
```
TaskContextMenu.show(task)
→ buildMenuItems()
→ enable/disableItemsBasedOnState()
→ show(mousePosition)
```

#### Menu Actions
```
TaskProperties.menuItemClicked()
→ TaskDialog.show(task)

DeleteTask.menuItemClicked()
→ DeleteConfirmationDialog.show()
→ DeleteAction.actionPerformed()

AssignResources.menuItemClicked()
→ ResourceAssignmentDialog.show(task)

CreateSubtask.menuItemClicked()
→ createSubtaskUnderTask()
→ updateWBS()
→ allViews.refresh()
```

### 9.2 Gantt Chart Context Menu

#### Task Bar Context Menu
```
GanttChart.rightClicked()
→ if (clickOnTaskBar) {
    TaskContextMenu.show(task)
  } else {
    GanttContextMenu.show(point)
  }
```

#### Time Scale Context Menu
```
TimeScale.rightClicked()
→ TimeScaleContextMenu.show()
→ provideZoomOptions()
→ provideTimeUnitOptions()
```

---

## 10. NOTIFICATION AND VALIDATION EVENT FLOW

### 10.1 Validation Events

#### Task Validation
```
TaskValidator.validate(task)
→ checkRequiredFields()
→ checkDateConstraints()
→ checkDependencyLoops()
→ checkResourceAssignments()
→ return ValidationResult
→ if (hasErrors) {
    ValidationDialog.show(errors)
  }
```

#### Project Validation
```
ProjectValidator.validate(project)
→ validateAllTasks()
→ validateDependencies()
→ validateResourceAssignments()
→ validateCalendarIntegrity()
→ generateValidationReport()
```

### 10.2 Notification Events

#### Error Notification
```
ErrorHandler.handleError(error)
→ ErrorDialog.show(error)
→ logError(error)
→ showStatusMessage(error.getMessage())
```

#### Success Notification
```
SuccessHandler.handleSuccess(message)
→ statusBar.showMessage(message)
→ optionally showSuccessDialog()
→ logInfo(message)
```

#### Warning Notification
```
WarningHandler.handleWarning(warning)
→ statusBar.showWarning(warning)
→ optionally showWarningDialog()
→ logWarning(warning)
```

---

## 11. DATA SYNC EVENT FLOW

### 11.1 Model-View Synchronization

#### Task Model Changed
```
TaskModel.taskChanged(task, field)
→ fireTaskChangedEvent()
→ allTaskViews.refreshTask(task)
→ updateGanttChart()
→ updateTaskTable()
→ updateResourceCharts()
→ updateStatistics()
```

#### Project Model Changed
```
ProjectModel.projectChanged()
→ fireProjectChangedEvent()
→ allViews.refresh()
→ updateTitle()
→ updateStatusBar()
→ updateMenus()
→ updateToolBars()
```

### 11.2 Cross-View Synchronization

#### Selection Synchronization
```
GanttView.taskSelected(taskIds)
→ fireSelectionChangedEvent(taskIds)
→ TaskTable.selectRows(taskIds)
→ ResourceSheet.selectAssignments(taskIds)
→ updateContextMenus()
```

#### Scroll Synchronization
```
GanttView.scrolled(verticalPosition)
→ fireScrollChangedEvent(position)
→ TaskTable.scrollTo(position)
→ updateScrollBarStates()
```

---

## 12. UNDO/REDO EVENT FLOW

### 12.1 Undo Operation
```
UndoAction.actionPerformed()
→ if (UndoManager.canUndo()) {
    UndoableEdit edit = UndoManager.undo()
    edit.undo()
    fireUndoEvent(edit)
    allViews.refresh()
    updateUndoRedoButtons()
  }
```

### 12.2 Redo Operation
```
RedoAction.actionPerformed()
→ if (UndoManager.canRedo()) {
    UndoableEdit edit = UndoManager.redo()
    edit.redo()
    fireRedoEvent(edit)
    allViews.refresh()
    updateUndoRedoButtons()
  }
```

### 12.3 Edit Recording
```
EditManager.recordEdit(edit)
→ UndoManager.addEdit(edit)
→ updateUndoRedoButtons()
→ markProjectAsModified()
→ fireEditRecordedEvent(edit)
```

---

## Выводы для React миграции

### 1. **Event Architecture**
- Использовать централизованную систему событий (Redux, EventEmitter)
- Реализовать иерархию событий (application → view → component)
- Поддерживать cross-component синхронизацию

### 2. **State Management**
- Централизованное состояние проекта в Redux store
- Оптимистичные обновления с rollback на validation errors
- Undo/Redo через immutable history stack

### 3. **Component Communication**
- Props drilling для локальных компонентов
- Context API для theme и user preferences
- Event bus для cross-view коммуникации

### 4. **Validation Strategy**
- Client-side validation в реальном времени
- Server-side validation при сохранении
- Progressive disclosure ошибок

### 5. **Performance Optimization**
- Virtual scrolling для больших списков
- Canvas rendering для Gantt диаграмм
- Debounced обновления при drag operations

Этот анализ обеспечивает полную карту всех событий и взаимодействий для точной React миграции с сохранением 100% функциональности.