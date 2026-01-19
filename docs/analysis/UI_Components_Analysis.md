# Анализ UI Компонентов ProjectLibre

## Обзор UI архитектуры

ProjectLibre использует сложную многослойную архитектуру UI компонентов, основанную на Java Swing с кастомными элементами для отображения проектных диаграмм.

## 1. Gantt Диаграмма Компоненты

### 1.1 TaskComponent (Компонент задачи)

**Файл:** `src/main/java/org/projectlibre/ui/gantt/TaskComponent.java`

```java
public class TaskComponent extends JComponent {
    private Task task;
    private Rectangle bounds;
    private Color fillColor;
    private Color borderColor;
    private boolean selected;
    private boolean critical;
    private int completionPercentage;
    
    // Основные методы
    public void paintComponent(Graphics g) {
        Graphics2D g2d = (Graphics2D) g.create();
        // Рендеринг задачи с учетом прогресса
        renderTaskBackground(g2d);
        renderProgress(g2d);
        renderTaskBorder(g2d);
        if (selected) {
            renderSelectionHighlight(g2d);
        }
        g2d.dispose();
    }
    
    public void updateBounds() {
        // Расчет границ задачи на основе дат
        Date start = task.getStart();
        Date end = task.getEnd();
        bounds = calculateTaskBounds(start, end);
    }
    
    public boolean contains(Point p) {
        return bounds != null && bounds.contains(p);
    }
}
```

**Ключевые особенности:**
- Динамический рендеринг с учетом прогресса
- Поддержка выделения и критических путей
- Расчет границ на основе временной шкалы

### 1.2 DependencyComponent (Компонент зависимости)

**Файл:** `src/main/java/org/projectlibre/ui/gantt/DependencyComponent.java`

```java
public class DependencyComponent extends JComponent {
    private Task predecessor;
    private Task successor;
    private DependencyType type; // FS, SS, FF, SF
    private List<Point> controlPoints;
    
    public void paintComponent(Graphics g) {
        Graphics2D g2d = (Graphics2D) g.create();
        g2d.setStroke(new BasicStroke(2.0f));
        
        switch (type) {
            case FINISH_TO_START:
                drawFinishToStartArrow(g2d);
                break;
            case START_TO_START:
                drawStartToStartArrow(g2d);
                break;
            case FINISH_TO_FINISH:
                drawFinishToFinishArrow(g2d);
                break;
            case START_TO_FINISH:
                drawStartToFinishArrow(g2d);
                break;
        }
        g2d.dispose();
    }
    
    private void drawFinishToStartArrow(Graphics2D g2d) {
        // Рисование стрелки от конца предшественника к началу последователя
        Point startPoint = getTaskFinishPoint(predecessor);
        Point endPoint = getTaskStartPoint(successor);
        drawCurvedArrow(g2d, startPoint, endPoint);
    }
}
```

### 1.3 TimeScaleComponent (Компонент временной шкалы)

**Файл:** `src/main/java/org/projectlibre/ui/gantt/TimeScaleComponent.java`

```java
public class TimeScaleComponent extends JComponent {
    private TimeUnit displayUnit; // DAY, WEEK, MONTH
    private Date startDate;
    private Date endDate;
    private int zoomLevel;
    
    public void paintComponent(Graphics g) {
        Graphics2D g2d = (Graphics2D) g.create();
        
        // Рендеринг временных меток
        renderTimeLabels(g2d);
        renderGridLines(g2d);
        renderCurrentTimeMarker(g2d);
        
        g2d.dispose();
    }
    
    private void renderTimeLabels(Graphics2D g2d) {
        Calendar cal = Calendar.getInstance();
        cal.setTime(startDate);
        
        while (cal.getTime().before(endDate)) {
            String label = formatTimeLabel(cal);
            Point position = calculateLabelPosition(cal.getTime());
            g2d.drawString(label, position.x, position.y);
            
            cal.add(displayUnit.getCalendarField(), 1);
        }
    }
    
    public void zoomIn() {
        zoomLevel++;
        updateDisplayUnit();
        repaint();
    }
    
    public void zoomOut() {
        zoomLevel = Math.max(0, zoomLevel - 1);
        updateDisplayUnit();
        repaint();
    }
}
```

## 2. Spreadsheet Компоненты

### 2.1 TaskTableModel (Модель данных таблицы задач)

**Файл:** `src/main/java/org/projectlibre/ui/spreadsheet/TaskTableModel.java`

```java
public class TaskTableModel extends AbstractTableModel {
    private List<Task> tasks;
    private Project project;
    private List<ColumnDefinition> columns;
    
    @Override
    public int getRowCount() {
        return tasks.size();
    }
    
    @Override
    public int getColumnCount() {
        return columns.size();
    }
    
    @Override
    public Object getValueAt(int row, int column) {
        Task task = tasks.get(row);
        ColumnDefinition col = columns.get(column);
        
        switch (col.getType()) {
            case ID:
                return task.getID();
            case NAME:
                return task.getName();
            case START_DATE:
                return task.getStart();
            case END_DATE:
                return task.getEnd();
            case DURATION:
                return task.getDuration();
            case COMPLETION:
                return task.getCompletionPercentage();
            case RESOURCE:
                return task.getResourceNames();
            default:
                return null;
        }
    }
    
    @Override
    public void setValueAt(Object value, int row, int column) {
        Task task = tasks.get(row);
        ColumnDefinition col = columns.get(column);
        
        switch (col.getType()) {
            case NAME:
                task.setName((String) value);
                break;
            case START_DATE:
                task.setStart((Date) value);
                break;
            // ... другие случаи
        }
        
        fireTableCellUpdated(row, column);
        notifyTaskChanged(task);
    }
}
```

### 2.2 CustomCellRenderer (Кастомный рендерер ячеек)

**Файл:** `src/main/java/org/projectlibre/ui/spreadsheet/CustomCellRenderer.java`

```java
public class CustomCellRenderer extends DefaultTableCellRenderer {
    private DateFormat dateFormat = new SimpleDateFormat("dd/MM/yyyy");
    private NumberFormat numberFormat = NumberFormat.getInstance();
    
    @Override
    public Component getTableCellRendererComponent(
            JTable table, Object value, boolean isSelected, 
            boolean hasFocus, int row, int column) {
        
        super.getTableCellRendererComponent(table, value, isSelected, hasFocus, row, column);
        
        // Настройка отображения в зависимости от типа данных
        if (value instanceof Date) {
            setText(dateFormat.format((Date) value));
            setHorizontalAlignment(SwingConstants.CENTER);
        } else if (value instanceof Number) {
            setText(numberFormat.format(value));
            setHorizontalAlignment(SwingConstants.RIGHT);
        } else if (value instanceof Duration) {
            setText(formatDuration((Duration) value));
            setHorizontalAlignment(SwingConstants.CENTER);
        }
        
        // Подсветка критических задач
        Task task = getTaskFromRow(table, row);
        if (task != null && task.isCritical()) {
            setForeground(Color.RED);
        }
        
        return this;
    }
}
```

### 2.3 TaskTable (Таблица задач)

**Файл:** `src/main/java/org/projectlibre/ui/spreadsheet/TaskTable.java`

```java
public class TaskTable extends JTable {
    private TaskTableModel model;
    private List<TableColumn> hiddenColumns;
    
    public TaskTable(TaskTableModel model) {
        super(model);
        this.model = model;
        setupTable();
    }
    
    private void setupTable() {
        // Настройка столбцов
        setAutoResizeMode(JTable.AUTO_RESIZE_OFF);
        setSelectionMode(ListSelectionModel.MULTIPLE_INTERVAL_SELECTION);
        setRowHeight(22);
        
        // Кастомный рендерер и редактор
        setDefaultRenderer(Date.class, new DateCellEditor());
        setDefaultRenderer(Duration.class, new DurationCellRenderer());
        
        // Поддержка drag and drop
        setDragEnabled(true);
        setDropMode(DropMode.INSERT_ROWS);
        setTransferHandler(new TaskRowTransferHandler());
    }
    
    @Override
    public void changeSelection(int row, int column, boolean toggle, boolean extend) {
        super.changeSelection(row, column, toggle, extend);
        
        // Синхронизация с Gantt диаграммой
        Task selectedTask = model.getTaskAt(row);
        notifyTaskSelectionChanged(selectedTask);
    }
}
```

## 3. Resource Компоненты

### 3.1 ResourceAllocationComponent (Компонент распределения ресурсов)

**Файл:** `src/main/java/org/projectlibre/ui/resource/ResourceAllocationComponent.java`

```java
public class ResourceAllocationComponent extends JComponent {
    private Resource resource;
    private List<Allocation> allocations;
    private TimeScale timeScale;
    
    public void paintComponent(Graphics g) {
        Graphics2D g2d = (Graphics2D) g.create();
        
        // Рендеринг загруженности ресурса
        renderResourceTimeline(g2d);
        renderAllocationBars(g2d);
        renderOverallocationMarkers(g2d);
        
        g2d.dispose();
    }
    
    private void renderAllocationBars(Graphics2D g2d) {
        for (Allocation allocation : allocations) {
            Rectangle bounds = calculateAllocationBounds(allocation);
            
            // Цвет в зависимости от загруженности
            double utilization = allocation.getUtilizationPercentage();
            Color fillColor = getUtilizationColor(utilization);
            
            g2d.setColor(fillColor);
            g2d.fill(bounds);
            
            // Граница
            g2d.setColor(Color.BLACK);
            g2d.draw(bounds);
        }
    }
    
    private Color getUtilizationColor(double utilization) {
        if (utilization > 100) {
            return Color.RED; // Перегрузка
        } else if (utilization > 80) {
            return Color.ORANGE; // Высокая загруженность
        } else {
            return Color.GREEN; // Нормальная загруженность
        }
    }
}
```

### 3.2 ResourceUsageChart (График использования ресурсов)

**Файл:** `src/main/java/org/projectlibre/ui/resource/ResourceUsageChart.java`

```java
public class ResourceUsageChart extends JComponent {
    private Map<Resource, List<UsageEntry>> usageData;
    private boolean showCumulative;
    
    public void paintComponent(Graphics g) {
        Graphics2D g2d = (Graphics2D) g.create();
        
        renderChartBackground(g2d);
        renderGrid(g2d);
        
        if (showCumulative) {
            renderCumulativeUsage(g2d);
        } else {
            renderIndividualUsage(g2d);
        }
        
        renderLegend(g2d);
        g2d.dispose();
    }
    
    private void renderIndividualUsage(Graphics2D g2d) {
        for (Map.Entry<Resource, List<UsageEntry>> entry : usageData.entrySet()) {
            Resource resource = entry.getKey();
            List<UsageEntry> data = entry.getValue();
            
            // Построение графика для каждого ресурса
            Path2D path = buildUsagePath(data);
            
            g2d.setColor(getResourceColor(resource));
            g2d.draw(path);
            g2d.fill(path);
        }
    }
}
```

## 4. Network Diagram Компоненты

### 4.1 NetworkNodeComponent (Узел сетевой диаграммы)

**Файл:** `src/main/java/org/projectlibre/ui/network/NetworkNodeComponent.java`

```java
public class NetworkNodeComponent extends JComponent {
    private Task task;
    private Point position;
    private Ellipse2D shape;
    private boolean selected;
    
    public void paintComponent(Graphics g) {
        Graphics2D g2d = (Graphics2D) g.create();
        
        // Рендеринг узла
        renderNodeShape(g2d);
        renderTaskInfo(g2d);
        
        if (selected) {
            renderSelectionHighlight(g2d);
        }
        
        g2d.dispose();
    }
    
    private void renderNodeShape(Graphics2D g2d) {
        // Форма зависит от типа задачи
        if (task.isMilestone()) {
            shape = new Ellipse2D.Double(x, y, width, height);
        } else {
            shape = new RoundRectangle2D.Double(x, y, width, height, 10, 10);
        }
        
        // Цвет в зависимости от статуса
        Color fillColor = getTaskStatusColor(task);
        g2d.setColor(fillColor);
        g2d.fill(shape);
        
        g2d.setColor(Color.BLACK);
        g2d.draw(shape);
    }
    
    private void renderTaskInfo(Graphics2D g2d) {
        // Отображение ID и имени задачи
        FontMetrics fm = g2d.getFontMetrics();
        
        String idText = String.valueOf(task.getID());
        String nameText = task.getName();
        
        // Центрирование текста
        int idX = (int) (shape.getCenterX() - fm.stringWidth(idText) / 2);
        int idY = (int) (shape.getCenterY() - fm.getHeight() / 2);
        
        g2d.drawString(idText, idX, idY);
    }
}
```

## 5. View Интеграция Компоненты

### 5.1 ViewManager (Менеджер представлений)

**Файл:** `src/main/java/org/projectlibre/ui/view/ViewManager.java`

```java
public class ViewManager {
    private Map<ViewType, View> views;
    private View currentView;
    private List<ViewChangeListener> listeners;
    
    public enum ViewType {
        GANTT, SPREADSHEET, RESOURCE_USAGE, NETWORK_DIAGRAM, CALENDAR
    }
    
    public void switchToView(ViewType viewType) {
        View oldView = currentView;
        currentView = views.get(viewType);
        
        if (currentView != null) {
            currentView.activate();
            notifyViewChanged(oldView, currentView);
        }
    }
    
    public void synchronizeViews() {
        // Синхронизация данных между представлениями
        for (View view : views.values()) {
            view.refresh();
        }
    }
    
    public void refreshCurrentView() {
        if (currentView != null) {
            currentView.refresh();
        }
    }
}
```

### 5.2 GanttSpreadsheetIntegration (Интеграция Gantt и Spreadsheet)

**Файл:** `src/main/java/org/projectlibre/ui/integration/GanttSpreadsheetIntegration.java`

```java
public class GanttSpreadsheetIntegration {
    private GanttView ganttView;
    private SpreadsheetView spreadsheetView;
    
    public void setupSynchronization() {
        // Синхронизация выделения
        spreadsheetView.addSelectionListener(e -> {
            List<Task> selectedTasks = e.getSelectedTasks();
            ganttView.selectTasks(selectedTasks);
        });
        
        ganttView.addSelectionListener(e -> {
            List<Task> selectedTasks = e.getSelectedTasks();
            spreadsheetView.selectTasks(selectedTasks);
        });
        
        // Синхронизация прокрутки
        setupScrollSynchronization();
        
        // Синхронизация изменений
        setupChangeSynchronization();
    }
    
    private void setupScrollSynchronization() {
        JScrollBar ganttScroll = ganttView.getVerticalScrollBar();
        JScrollBar spreadsheetScroll = spreadsheetView.getVerticalScrollBar();
        
        ganttScroll.addAdjustmentListener(e -> {
            if (!e.getValueIsAdjusting()) {
                spreadsheetScroll.setValue(e.getValue());
            }
        });
        
        spreadsheetScroll.addAdjustmentListener(e -> {
            if (!e.getValueIsAdjusting()) {
                ganttScroll.setValue(e.getValue());
            }
        });
    }
}
```

## 6. Graphics2D Рендеринг Элементы

### 6.1 CustomGraphicsRenderer (Кастомный рендерер)

**Файл:** `src/main/java/org/projectlibre/ui/graphics/CustomGraphicsRenderer.java`

```java
public class CustomGraphicsRenderer {
    private RenderingHints hints;
    
    public CustomGraphicsRenderer() {
        hints = new RenderingHints(RenderingHints.KEY_ANTIALIASING, 
                                   RenderingHints.VALUE_ANTIALIAS_ON);
        hints.put(RenderingHints.KEY_RENDERING, 
                  RenderingHints.VALUE_RENDER_QUALITY);
        hints.put(RenderingHints.KEY_TEXT_ANTIALIASING, 
                  RenderingHints.VALUE_TEXT_ANTIALIAS_ON);
    }
    
    public void setupGraphics(Graphics2D g2d) {
        g2d.setRenderingHints(hints);
        
        // Настройка для high DPI дисплеев
        double scale = getDeviceScaleFactor();
        g2d.scale(scale, scale);
    }
    
    public void drawTaskBar(Graphics2D g2d, Rectangle bounds, 
                           int completion, Color fillColor) {
        // Основная полоса задачи
        g2d.setColor(fillColor);
        g2d.fill(bounds);
        
        // Полоса прогресса
        if (completion > 0) {
            Rectangle progressBounds = new Rectangle(
                bounds.x, bounds.y,
                (int) (bounds.width * completion / 100.0),
                bounds.height
            );
            g2d.setColor(fillColor.darker());
            g2d.fill(progressBounds);
        }
        
        // Граница
        g2d.setColor(Color.BLACK);
        g2d.draw(bounds);
    }
}
```

## 7. Event Handling Система

### 7.1 UIEventManager (Менеджер событий UI)

**Файл:** `src/main/java/org/projectlibre/ui/events/UIEventManager.java`

```java
public class UIEventManager {
    private List<TaskSelectionListener> taskSelectionListeners;
    private List<TaskModificationListener> taskModificationListeners;
    private List<ViewChangeListener> viewChangeListeners;
    
    public void addTaskSelectionListener(TaskSelectionListener listener) {
        taskSelectionListeners.add(listener);
    }
    
    public void fireTaskSelectionChanged(List<Task> selectedTasks) {
        TaskSelectionEvent event = new TaskSelectionEvent(selectedTasks);
        
        for (TaskSelectionListener listener : taskSelectionListeners) {
            listener.taskSelectionChanged(event);
        }
    }
    
    public void fireTaskModified(Task task, String property, Object oldValue, Object newValue) {
        TaskModificationEvent event = new TaskModificationEvent(task, property, oldValue, newValue);
        
        for (TaskModificationListener listener : taskModificationListeners) {
            listener.taskModified(event);
        }
    }
}
```

## 8. Layout Managers

### 8.1 GanttLayout (Менеджер компоновки Gantt)

**Файл:** `src/main/java/org/projectlibre/ui/layout/GanttLayout.java`

```java
public class GanttLayout implements LayoutManager2 {
    private TimeScale timeScale;
    private Map<Component, Rectangle> componentBounds;
    
    @Override
    public void layoutContainer(Container parent) {
        // Расчет размеров временной шкалы
        Rectangle timeScaleBounds = calculateTimeScaleBounds(parent);
        
        // Расчет границ для задач
        for (Component comp : parent.getComponents()) {
            if (comp instanceof TaskComponent) {
                TaskComponent taskComp = (TaskComponent) comp;
                Rectangle bounds = calculateTaskBounds(taskComp);
                taskComp.setBounds(bounds);
            }
        }
    }
    
    private Rectangle calculateTaskBounds(TaskComponent taskComp) {
        Task task = taskComp.getTask();
        Date start = task.getStart();
        Date end = task.getEnd();
        
        int x = timeScale.dateToX(start);
        int width = timeScale.durationToWidth(task.getDuration());
        int y = getTaskRowPosition(task);
        int height = getRowHeight();
        
        return new Rectangle(x, y, width, height);
    }
}
```

---

## Выводы

1. **Сложная архитектура**: ProjectLibre использует многослойную архитектуру с четким разделением ответственности между компонентами
2. **Кастомный рендеринг**: Значительное использование Graphics2D для визуализации диаграмм
3. **Синхронизация представлений**: Сложная система синхронизации между Gantt, Spreadsheet и другими view
4. **Event-driven подход**: Множественные слушатели событий для координации UI компонентов
5. **Масштабируемость**: Поддержка zoom, scroll, и динамического обновления

## Рекомендации для React миграции

1. **Canvas API**: Использовать HTML5 Canvas для диаграмм вместо Graphics2D
2. **State Management**: Redux/MobX для синхронизации состояний между компонентами
3. **Virtual Scrolling**: Для больших таблиц списков задач
4. **Web Workers**: Для тяжелых расчетов рендеринга
5. **CSS Grid/Flexbox**: Вместо Layout Managers для компоновки