/*******************************************************************************
 * The contents of this file are subject to the Common Public Attribution License 
 * Version 1.0 (the "License"); you may not use this file except in compliance with 
 * the License. You may obtain a copy of the License at 
 * http://www.projectlibre.com/license . The License is based on the Mozilla Public 
 * License Version 1.1 but Sections 14 and 15 have been added to cover use of 
 * software over a computer network and provide for limited attribution for the 
 * Original Developer. In addition, Exhibit A has been modified to be consistent 
 * with Exhibit B. 
 *
 * Software distributed under the License is distributed on an "AS IS" basis, 
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the 
 * specific language governing rights and limitations under the License. The 
 * Original Code is ProjectLibre. The Original Developer is the Initial Developer 
 * and is ProjectLibre Inc. All portions of the code written by ProjectLibre are 
 * Copyright (c) 2012-2019. All Rights Reserved. All portions of the code written by 
 * ProjectLibre are Copyright (c) 2012-2019. All Rights Reserved. Contributor 
 * ProjectLibre, Inc.
 *
 * Alternatively, the contents of this file may be used under the terms of the 
 * ProjectLibre End-User License Agreement (the ProjectLibre License) in which case 
 * the provisions of the ProjectLibre License are applicable instead of those above. 
 * If you wish to allow use of your version of this file only under the terms of the 
 * ProjectLibre License and not to allow others to use your version of this file 
 * under the CPAL, indicate your decision by deleting the provisions above and 
 * replace them with the notice and other provisions required by the ProjectLibre 
 * License. If you do not delete the provisions above, a recipient may use your 
 * version of this file under either the CPAL or the ProjectLibre Licenses. 
 *
 *
 * [NOTE: The text of this Exhibit A may differ slightly from the text of the notices 
 * in the Source Code files of the Original Code. You should use the text of this 
 * Exhibit A rather than the text found in the Original Code Source Code for Your 
 * Modifications.] 
 *
 * EXHIBIT B. Attribution Information for ProjectLibre required
 *
 * Attribution Copyright Notice: Copyright (c) 2012-2019, ProjectLibre, Inc.
 * Attribution Phrase (not exceeding 10 words): 
 * ProjectLibre, open source project management software.
 * Attribution URL: http://www.projectlibre.com
 * Graphic Image as provided in the Covered Code as file: projectlibre-logo.png with 
 * alternatives listed on http://www.projectlibre.com/logo 
 *
 * Display of Attribution Information is required in Larger Works which are defined 
 * in the CPAL as a work which combines Covered Code or portions thereof with code 
 * not governed by the terms of the CPAL. However, in addition to the other notice 
 * obligations, all copies of the Covered Code in Executable and Source Code form 
 * distributed must, as a form of attribution of the original author, include on 
 * each user interface screen the "ProjectLibre" logo visible to all users. 
 * The ProjectLibre logo should be located horizontally aligned with the menu bar 
 * and left justified on the top left of the screen adjacent to the File menu. The 
 * logo must be at least 144 x 31 pixels. When users click on the "ProjectLibre" 
 * logo it must direct them back to http://www.projectlibre.com. 
 *******************************************************************************/
package com.projectlibre1.pm.criticalpath;

import java.util.ArrayList;
import java.util.Calendar;
import java.util.Date;
import java.util.Iterator;
import java.util.List;
import java.util.ListIterator;

import org.apache.commons.lang3.builder.ToStringBuilder;

import com.projectlibre1.configuration.Configuration;
import com.projectlibre1.document.Document;
import com.projectlibre1.document.ObjectEvent;
import com.projectlibre1.field.Field;
import com.projectlibre1.options.ScheduleOption;
import com.projectlibre1.pm.assignment.Assignment;
import com.projectlibre1.pm.calendar.WorkingCalendar;
import com.projectlibre1.pm.dependency.Dependency;
import com.projectlibre1.pm.dependency.DependencyService;
import com.projectlibre1.pm.scheduling.ConstraintType;
import com.projectlibre1.pm.scheduling.ScheduleEvent;
import com.projectlibre1.pm.task.BelongsToDocument;
import com.projectlibre1.pm.task.NormalTask;
import com.projectlibre1.pm.task.Project;
import com.projectlibre1.pm.task.SubProj;
import com.projectlibre1.pm.task.Task;
import com.projectlibre1.strings.Messages;
import com.projectlibre1.transaction.MultipleTransaction;
import com.projectlibre1.util.DateTime;
import com.projectlibre1.util.Environment;
/**
 * The critical path calculation
 */
public class CriticalPath implements SchedulingAlgorithm {
	PredecessorTaskList predecessorTaskList = new PredecessorTaskList(this);
	private CriticalPathFields fieldUpdater = null;
	NormalTask finishSentinel;
	NormalTask startSentinel;
	Project project;
	boolean suspendUpdates = false; // flag to suspend updates when multiple objects are treated
	boolean needsReset = false; // flag to indicate that a reset is pending during suspended updates
	long earliestStart;
	long latestFinish;
	private boolean criticalPathJustChanged = false;
	private static Task traceTask;
	TaskSchedule.CalculationContext context;
	private static CriticalPath lastInstance;
	private static Field constraintTypeField = Configuration.getFieldFromId("Field.constraintType");
	public CriticalPath(Project project) {
		this.project = project;
		project.setSchedulingAlgorithm(this); 
//		project.addObjectListener(this);
//		project.getMultipleTransactionManager().addListener(this);
		fieldUpdater = CriticalPathFields.getInstance(this,project);

		startSentinel = new NormalTask(true,project); //local
		startSentinel.setDuration(0);
		startSentinel.setName("<Start>"); // name doesn't matter - useful for debugging purposes

		finishSentinel = new NormalTask(true,project); //local
		finishSentinel.setDuration(0);
		finishSentinel.setName("<End>"); // name doesn't matter - useful for debugging purposes


		setForward(isForward());
		setProjectBoundaries();
		initEarliestAndLatest();
	}
	private void setProjectBoundaries() {
		// update sentinels based on read in project
		
		if (isForward())  {
			// CORE-AUTH.1.1: Нормализовать Start Sentinel до полуночи локальной timezone
			long originalStart = project.getStartConstraint();
			long normalizedStart = normalizeToMidnight(originalStart);
			logSentinelNormalization(originalStart, normalizedStart);
			startSentinel.setWindowEarlyStart(normalizedStart);
			finishSentinel.setWindowLateFinish(0); //no end constraint
		} else {
			startSentinel.setWindowEarlyStart(0); // no start constraint
			finishSentinel.setWindowLateFinish(project.getEnd());
		}
		predecessorTaskList.getList().add(0,new PredecessorTaskList.TaskReference(startSentinel));
		predecessorTaskList.getList().add(new PredecessorTaskList.TaskReference(finishSentinel));
	}
	
	/**
	 * CORE-AUTH.1.1: Нормализует timestamp до полуночи (00:00:00.000) в локальной timezone.
	 * 
	 * Устраняет time offset (например, 01:03:59), который появляется когда дата проекта
	 * содержит время создания вместо чистой полуночи. Это критично для CPM расчётов,
	 * т.к. все задачи без predecessors наследуют Start Sentinel как beginDependency.
	 * 
	 * @param timestamp исходный timestamp в миллисекундах
	 * @return timestamp нормализованный до 00:00:00.000 того же дня
	 */
	private long normalizeToMidnight(long timestamp) {
		if (timestamp == 0) {
			return 0;
		}
		Calendar cal = Calendar.getInstance();
		cal.setTimeInMillis(timestamp);
		cal.set(Calendar.HOUR_OF_DAY, 0);
		cal.set(Calendar.MINUTE, 0);
		cal.set(Calendar.SECOND, 0);
		cal.set(Calendar.MILLISECOND, 0);
		return cal.getTimeInMillis();
	}
	
	/**
	 * CORE-AUTH.1.2: Логирует нормализацию Start Sentinel для диагностики.
	 * 
	 * @param originalMs исходное значение timestamp
	 * @param normalizedMs нормализованное значение timestamp
	 */
	private void logSentinelNormalization(long originalMs, long normalizedMs) {
		if (originalMs != normalizedMs) {
			System.out.println("[CORE-AUTH] Sentinel normalized: " 
				+ new Date(originalMs) + " (" + originalMs + "ms) -> " 
				+ new Date(normalizedMs) + " (" + normalizedMs + "ms)");
		}
	}

	public void initialize(Object object) {
		project = (Project) object;
		predecessorTaskList.getList().clear(); // get rid of sentinels that are in lis
		predecessorTaskList.addAll(project.getTasks());
		initSentinelsFromTasks();
		setProjectBoundaries(); // put back sentinels
		// Пометить все задачи и сентинелы для пересчёта; иначе в doPass они пропускаются
		// (условие task.getCalculationStateCount() >= context.stateCount не выполняется).
		project.markAllTasksAsNeedingRecalculation(true);
		markSentinelsForRecalculation();
		calculate(false);
	}
	
	
/**
 * Initialize the sentinels so that the start sentinel has all start tasks as successors, and the end sentinel has all end tasks as predecessors
 *
 */
	private void initSentinelsFromTasks() {
		Iterator i = predecessorTaskList.listIterator();
		Task task;
		while (i.hasNext()) {
			task = ((PredecessorTaskList.TaskReference)i.next()).getTask();
			if (task.getPredecessorList().size() == 0)
				addStartSentinelDependency(task);
			if (task.getSuccessorList().size() == 0)
				addEndSentinelDependency(task);
		}
//		System.out.println("start sentinel successors");
//		startSentinel.getSuccessorList().dump(false);
//		System.out.println("end sentinel preds");
//		finishSentinel.getPredecessorList().dump(true);
		
	}
	
	public String getName() {
		return Messages.getString("Text.forwardScheduled");
	}
	private boolean isHonorRequiredDates() {
		return ScheduleOption.getInstance().isHonorRequiredDates();
	}

	private int getFreshCalculationStateCount() {
		return predecessorTaskList.getFreshCalculationStateCount();
	}
	private int getNextCalculationStateCount() {
		return predecessorTaskList.getNextCalculationStateCount();
	}
	public int getCalculationStateCount() {
		return predecessorTaskList.getCalculationStateCount();
	}
	private Task getBeginSentinel(boolean forward) {
		return forward ? startSentinel : finishSentinel;
	}
	private Task getEndSentinel(boolean forward) {
		return forward ? finishSentinel : startSentinel;
	}

	
	/**
	 * Run the critical path.  There are three possibilities:
	 * 1) The task that is modified does not affect the Critical Path.  In this case, only a single pass is performed and dates are set
	 * 2) The CP is modified, but the project contains no ALAP tasks.  In which case early and current dates are set in the first pass, and late in the second
	 * 3) The CP is modified and the project has ALAP tasks.  In which case, after both forward and backward passes are perfomed, a third pass sets current dates
	 * @param startTask
	 */
	private void fastCalc(Task startTask) {
		lastInstance =this;
		Task beginSentinel = getBeginSentinel(isForward());
		Task endSentinel = getEndSentinel(isForward());

		long firstBoundary = isForward() ? project.getStartConstraint() : -project.getEnd();
		boolean hasReverseScheduledTasks = predecessorTaskList.hasReverseScheduledTasks();

		context = new TaskSchedule.CalculationContext();
		context.stateCount = getNextCalculationStateCount();
		context.honorRequiredDates = isHonorRequiredDates();
		context.forward = isForward();
		context.boundary = firstBoundary;
		context.sentinel = endSentinel;
		context.earlyOnly = false;
		context.assign = false;
		context.scheduleType = isForward() ? TaskSchedule.EARLY : TaskSchedule.LATE;;
		context.pass = 0;
		boolean affectsCriticalPath = (startTask == beginSentinel) || startTask.getSchedule(context.scheduleType).affectsCriticalPath(context);
		
		boolean worstCase = affectsCriticalPath && hasReverseScheduledTasks;
		context.earlyOnly = worstCase;
		context.assign = true;
		context.pass = 1;
		criticalPathJustChanged = affectsCriticalPath;
		doPass(startTask,context); // always assign in first pass.  Dates may change in third pass
		
		if (affectsCriticalPath) {
			ensureFinishSentinelEarlyDatesBeforeBackwardPass(context);
			context.stateCount = getNextCalculationStateCount(); // backward pass treats next increment
			context.sentinel = endSentinel;
		// Граница обратного прохода: учитываем явный дедлайн (FNLT) финиш-сентинела, чтобы при параллельных ветках у некритических задач был slack > 0.
		long earlyFinish = finishSentinel.getEarlyFinish();
		long constraintEnd = (finishSentinel.getConstraintType() == ConstraintType.FNLT && finishSentinel.getConstraintDate() > 0)
			? finishSentinel.getConstraintDate() : 0;
		// VB.3: При наличии constraint используем ЕГО (даже если меньше earlyFinish — для отрицательного slack)
		long endForBackward = (constraintEnd > 0) ? constraintEnd : earlyFinish;
			context.boundary = -endForBackward;
			context.sentinel = beginSentinel;
			context.forward = !context.forward;
			context.assign = false;
			context.scheduleType = -context.scheduleType;
			context.pass++;
			doPass(null,context);

		// CPM-MS.2: Агрегация дат для summary tasks после forward/backward passes.
		// По стандарту MS Project summary tasks не участвуют в CPM, а получают даты от детей.
		aggregateSummaryTaskDates();
		
		// ДИАГНОСТИКА БАГА: Логируем summary tasks после агрегации
		logSummaryTasksAfterAggregation();

		// Даты проекта: конец проекта обновляем по раннему финишу; граница обратного прохода уже учла FNLT выше.
		project.setStart(startSentinel.getEarlyStart());
		// VB.3: Не перезаписывать project.end, если установлен imposed deadline
		if (!project.hasImposedFinishDate()) {
			project.setEnd(finishSentinel.getEarlyFinish());
		}
			
			if (hasReverseScheduledTasks) {
				context.stateCount = getNextCalculationStateCount(); // backward pass treats next increment
				context.forward = !context.forward;
				context.boundary = firstBoundary;
				context.sentinel = endSentinel;
				context.earlyOnly = false;
				context.assign = true;
				context.scheduleType = -context.scheduleType;
				context.pass++;
				doPass(null,context);
				
			}
			
		}
		getFreshCalculationStateCount(); // For next time;
	}

	/**
	 * C.2: Перед обратным проходом принудительно обновляет ранние даты финиш-сентинела,
	 * чтобы secondBoundary = -finishSentinel.getEarlyFinish() гарантированно брался из текущего прогона.
	 * Инвалидирует расписание, выставляет calculationStateCount, пересчитывает ранние даты.
	 */
	private void ensureFinishSentinelEarlyDatesBeforeBackwardPass(TaskSchedule.CalculationContext context) {
		TaskSchedule earlySchedule = finishSentinel.getSchedule(TaskSchedule.EARLY);
		earlySchedule.invalidate();
		finishSentinel.setCalculationStateCount(context.stateCount);
		earlySchedule.calcDates(context);
	}
	
	/**
	 * CPM-MS.2: Агрегирует даты для summary tasks после завершения forward/backward passes.
	 * 
	 * По стандарту MS Project summary tasks НЕ участвуют в CPM расчётах.
	 * Их даты агрегируются от детей:
	 * - earlyStart  = min(children.earlyStart)
	 * - lateStart   = min(children.lateStart)
	 * - earlyFinish = max(children.earlyFinish)
	 * - lateFinish  = max(children.lateFinish)
	 * 
	 * Обход выполняется bottom-up: от самых глубоких summary к корневым,
	 * чтобы вложенные summary уже имели корректные даты перед агрегацией родителями.
	 */
	private void aggregateSummaryTaskDates() {
		List<NormalTask> summaries = collectSummaryTasks();
		if (summaries.isEmpty()) {
			return;
		}
		sortSummariesByDepthDescending(summaries);
		aggregateDatesForSummaries(summaries);
	}
	
	/**
	 * Собирает все summary tasks (WBS parents) из проекта.
	 */
	private List<NormalTask> collectSummaryTasks() {
		List<NormalTask> summaries = new ArrayList<>();
		Iterator<Task> it = project.getTaskOutlineIterator();
		while (it.hasNext()) {
			Task task = it.next();
			if (task instanceof NormalTask && task.isWbsParent()) {
				summaries.add((NormalTask) task);
			}
		}
		return summaries;
	}
	
	/**
	 * Сортирует summary tasks по глубине (outlineLevel) в порядке убывания.
	 * Глубокие summary обрабатываются первыми (bottom-up).
	 */
	private void sortSummariesByDepthDescending(List<NormalTask> summaries) {
		summaries.sort((a, b) -> Integer.compare(b.getOutlineLevel(), a.getOutlineLevel()));
	}
	
	/**
	 * Агрегирует даты для каждой summary task от её детей.
	 * Обновляет early, late и current schedules.
	 */
	private void aggregateDatesForSummaries(List<NormalTask> summaries) {
		for (NormalTask summary : summaries) {
			summary.getEarlySchedule().assignDatesFromChildren(null);
			summary.getLateSchedule().assignDatesFromChildren(null);
			summary.getCurrentSchedule().assignDatesFromChildren(null);
		}
	}
	
	/**
	 * ДИАГНОСТИКА БАГА: Логирует summary tasks после агрегации дат от детей.
	 */
	private void logSummaryTasksAfterAggregation() {
		System.out.println("[BUG-DIAG] ===== SUMMARY TASKS AFTER AGGREGATION =====");
		
		Iterator<Task> it = project.getTaskOutlineIterator();
		while (it.hasNext()) {
			Task t = it.next();
			if (t.isExternal() || !t.isWbsParent()) continue;
			
			if (t instanceof NormalTask) {
				NormalTask nt = (NormalTask) t;
				long earlyStart = nt.getEarlyStart();
				long earlyFinish = nt.getEarlyFinish();
				long lateStart = nt.getLateStart();
				long lateFinish = nt.getLateFinish();
				long currentStart = nt.getStart();
				long currentEnd = nt.getEnd();
				
				System.out.println("[BUG-DIAG] SUMMARY '" + t.getName() + "' earlyStart=" + earlyStart + " earlyFinish=" + earlyFinish
					+ " lateStart=" + lateStart + " lateFinish=" + lateFinish + " currentStart=" + currentStart + " currentEnd=" + currentEnd);
			}
		}
		
		System.out.println("[BUG-DIAG] ===== END SUMMARY TASKS AFTER AGGREGATION =====");
	}
	
	private void doPass(Task startTask, TaskSchedule.CalculationContext context) {
		if (startTask != null) {
			startTask.getSchedule(context.scheduleType).invalidate();
			startTask.setCalculationStateCount(getCalculationStateCount());
		}

		PredecessorTaskList.TaskReference taskReference;
		boolean forward = context.forward;
		ListIterator i = forward ? predecessorTaskList.listIterator() : predecessorTaskList.reverseIterator();
		Task task;
		TaskSchedule schedule;

		boolean projectForward = project.isForward();
		while (forward ? i.hasNext() : i.hasPrevious()) {
			taskReference = (PredecessorTaskList.TaskReference)(forward ? i.next() : i.previous());
			
			// CPM-MS.1: Пропускаем summary tasks — по стандарту MS Project они не участвуют в CPM.
			// Summary tasks (PARENT_BEGIN/PARENT_END) получают даты в отдельном aggregation pass.
			int refType = taskReference.getType();
			if (refType == PredecessorTaskList.TaskReference.PARENT_BEGIN ||
				refType == PredecessorTaskList.TaskReference.PARENT_END) {
				continue;
			}
			
			traceTask = task = taskReference.getTask();
			context.taskReferenceType = refType;
			schedule = task.getSchedule(context.scheduleType);
			if (!forward) {
				context.taskReferenceType = -refType;
			}
				
			if (task.isReverseScheduled()) {
				schedule.invalidate();
				task.setCalculationStateCount(context.stateCount);
			}
			if (task.getCalculationStateCount() >= context.stateCount) {
				schedule.calcDates(context);
				if (context.assign && (projectForward || !task.isWbsParent())) {
					if (schedule.getBegin() != 0L && !isSentinel(task)) {
						earliestStart = Math.min(earliestStart, schedule.getStart());
					}
					if (schedule.getEnd() != 0 && !isSentinel(task)) {
						latestFinish = Math.max(latestFinish, schedule.getFinish());
					}
				}
			}
		}
	}

	public void calculate(boolean update) {
		calculate(update,null);
	}
	
	public void initEarliestAndLatest() {
		long date = project.getStartConstraint();
		if (date == 0)
			date = DateTime.midnightToday(); // this repairs empty start bug
		earliestStart = latestFinish = date;
	}
	private void _calculate(boolean update, Task task) {
		if (predecessorTaskList.getList().size() < 3) {// if no tasks, nothing to calculate.  This is needed to avoid a null pointer execption because of sentinels not having any preds/succs
			if (isForward())
				project.setEnd(project.getStartConstraint());
			else
				project.setStart(project.getEnd());
			return;

		}
		if (task == null) {
			task = getBeginSentinel(isForward());
		}
		fastCalc(task);
		if (update)
			fireScheduleChanged();
	}
	private void calculate(final boolean update, final Task task) {
		if (suspendUpdates)
			return;
		_calculate(update,task);
		// instead of calculating immediately, we can perhaps delay the calculation till the end of all other updates.  This may
		// cause problems in other cases where an immediate update is required, so I am commenting it out for now. See bug 225
//		SwingUtilities.invokeLater(new Runnable() {
//			public void run() {
//				_calculate(update,task);
//			}
//		});
	}

	/*
	 * (non-Javadoc)
	 * 
	 * @see com.projectlibre1.pm.criticalpath.SchedulingAlgorithm#getDefaultTaskConstraintType()
	 */
	public int getDefaultTaskConstraintType() {
		return ConstraintType.ASAP;
	}


		
	private void fireScheduleChanged() {
		((Project) project).fireScheduleChanged(this, ScheduleEvent.SCHEDULE);
	}

	private boolean updating = false;
	private synchronized CriticalPathFields getOrClearUpdater(boolean get) {
		if (get) {
			if (updating == true){
				System.out.println("interrupting update thread");
				fieldUpdater.interrupt(); // interrupt existing thread
				fieldUpdater = CriticalPathFields.getInstance(this,project); // make new one
			}
			updating = true;
			return fieldUpdater;
		} else {
			updating = false;
			return null;

		}
	}
//
//	public void scheduleTask(NormalTask task) {
//		calcEarlyStartAndFinish(task, task.getProject().getStart());
//		calcLateStartAndLateFinish(task, task.getProject().getEnd(), false);
//		task.calcStartAndFinish();
//	}


	
	
	/**
	 * Respond to object create/delete events
	 */
	public void objectChanged(ObjectEvent objectEvent) {
		if (!project.isInitialized() && !Environment.isImporting()) {
			System.out.println("Error - Message received when Project is not init" + project);
			return;
		}
		if (objectEvent.getSource() == this)
			return;
		Object changedObject = objectEvent.getObject();
		Task task = null;
		if (changedObject instanceof Task) {
			if (objectEvent.isCreate()) {
				Task newTask = (Task) changedObject;
				predecessorTaskList.arrangeTask(newTask);
				// Подключить новую задачу к сентинелам (как в addObject), иначе конец проекта не пересчитается.
				if (newTask.getSuccessorList().size() == 0) {
					addEndSentinelDependency(newTask);
				} else {
					removeEndSentinelDependency(newTask);
				}
				if (newTask.getPredecessorList().size() == 0) {
					addStartSentinelDependency(newTask);
				} else {
					removeStartSentinelDependency(newTask);
				}
				return; // let the hierarchy event that follow run the CP
			} else if (objectEvent.isDelete()) {
				Task removedTask = (Task) changedObject;
				predecessorTaskList.removeTask(removedTask);
				reset(); // Fix of bug 91 31/8/05.  This ensures the ancestors of this task that are no longer parents will be replaced as single entries in pred list
			} else if (objectEvent.isUpdate()) {
				task = (Task)changedObject;
				Field field = objectEvent.getField();
				if (field != null && !fieldUpdater.inputContains(field))
					return;
				if (field == constraintTypeField) {
					reset();
					task.invalidateSchedules();
					task.markTaskAsNeedingRecalculation();
				}
			}
			calculate(true,task);

		} else if (changedObject instanceof Dependency) { // dependency added or
														  // removed
			Dependency dependency = (Dependency) changedObject;
			if (!dependency.refersToDocument(project))
				return;
			if (!objectEvent.isUpdate()) {
				reset(); // refresh predecssor list - the whold thing may change drastically no matter what the link because of parents
			}
			task = (Task)dependency.getPredecessor();
			Task successor = (Task) dependency.getSuccessor(); // the successor needs to be scheduled
			
			// to fix a bug, I am invalidating both early and late schedules
			task.invalidateSchedules();
			task.markTaskAsNeedingRecalculation();
			if (successor.isSubproject()) { // special case for subprojects - need to reset all
				SubProj sub = (SubProj)successor;
				if (sub.isSubprojectOpen())
					sub.getSubproject().markAllTasksAsNeedingRecalculation(true);
			} 
			successor.invalidateSchedules();
			successor.markTaskAsNeedingRecalculation();
			
//			The line below fixes a bug with nested parents of the sort pred->grand par sib1->sib2. Of course, it means most of the code above is redundant (except for subproject stuff)
			project.markAllTasksAsNeedingRecalculation(true); 
			calculate(true,null); // Run both passes, since the CP might be modified and it's hard to tell if so
		} else if (changedObject == project) { // if whole project changed, such
											   // as hierarchy event
			reset();
			calculate(true,null);
		} else if (changedObject instanceof WorkingCalendar) { // if whole project changed, such
			project.markAllTasksAsNeedingRecalculation(false);
			calculate(true,null);
		} else if (changedObject instanceof Assignment) {
			Assignment assignment = (Assignment)changedObject;
			task = assignment.getTask();
			if (task.getProject().getSchedulingAlgorithm() != this)
				return;
//			if (((NormalTask)task).isEffortDriven())
			calculate(true,task);
		} else if (changedObject instanceof BelongsToDocument){ // for other things, such as assignment entry
			if (((BelongsToDocument)changedObject).getDocument() instanceof Project) {
				Project proj = (Project)((BelongsToDocument)changedObject).getDocument();
				if (proj.getSchedulingAlgorithm() != this)
					return;
			}
			Field field = objectEvent.getField();
			if (field != null && fieldUpdater.inputContains(field))
				calculate(true,null);
		}
	}

	public void reset() {
		if (suspendUpdates) {
			needsReset = true;
			return;
		}
		
		needsReset = false;
		initEarliestAndLatest();
		predecessorTaskList.rearrangeAll();
		// Обновить связи с сентинелами по текущему графу зависимостей (после sync/изменения связей).
		refreshSentinelsFromTaskList();
	}

	/**
	 * Пересобирает связи start/finish сентинелов с задачами по текущему списку предшественников.
	 * Вызывается из reset() после rearrangeAll(), чтобы концевые/стартовые задачи всегда были
	 * корректно подключены и расчёт критического пути давал верный Early Finish и обратный проход.
	 */
	private void refreshSentinelsFromTaskList() {
		// Снять текущие связи с сентинелов (чтобы не дублировать и убрать устаревшие).
		List<Task> endPreds = new ArrayList<>();
		for (Iterator i = finishSentinel.getPredecessorList().iterator(); i.hasNext(); ) {
			Dependency d = (Dependency) i.next();
			endPreds.add((Task) d.getTask(true));
		}
		for (Task t : endPreds) {
			removeEndSentinelDependency(t);
		}
		List<Task> startSuccs = new ArrayList<>();
		for (Iterator i = startSentinel.getSuccessorList().iterator(); i.hasNext(); ) {
			Dependency d = (Dependency) i.next();
			startSuccs.add((Task) d.getTask(false));
		}
		for (Task t : startSuccs) {
			removeStartSentinelDependency(t);
		}
		// Заново подключить задачи без предшественников/преемников к сентинелам.
		Iterator it = predecessorTaskList.listIterator();
		while (it.hasNext()) {
			Task task = ((PredecessorTaskList.TaskReference) it.next()).getTask();
			if (task == startSentinel || task == finishSentinel) {
				continue;
			}
			if (task.getPredecessorList().size() == 0) {
				addStartSentinelDependency(task);
			}
			if (task.getSuccessorList().size() == 0) {
				addEndSentinelDependency(task);
			}
		}
	}

	public void addEndSentinelDependency(Task task) {
		if (task.getOwningProject() == project && !task.isExternal())
			DependencyService.getInstance().addEndSentinelDependency(finishSentinel,task);
	}
	public boolean removeEndSentinelDependency(Task task) {
		if (task.getOwningProject() == project && !task.isExternal())
			return DependencyService.getInstance().removeEndSentinel(finishSentinel,task);
		return false;
	}
	public void addStartSentinelDependency(Task task) {
		if (task.getOwningProject() == project && !task.isExternal())
			DependencyService.getInstance().addStartSentinelDependency(startSentinel,task);
	}
	public boolean removeStartSentinelDependency(Task task) {
		if (task.getOwningProject() == project && !task.isExternal())
			return DependencyService.getInstance().removeStartSentinel(startSentinel,task);
		return false;
	}
	
	public long getStartConstraint() {
		return startSentinel.getConstraintDate();
	}
	/* (non-Javadoc)
	 * @see com.projectlibre1.pm.criticalpath.HasSentinels#setStartConstraint(long)
	 */
	public void setStartConstraint(long date) {
		// CORE-AUTH.1.1: Нормализовать до полуночи для консистентности CPM расчётов
		long normalizedDate = normalizeToMidnight(date);
		logSentinelNormalization(date, normalizedDate);
		startSentinel.setScheduleConstraint(ConstraintType.SNET, normalizedDate);
		markBoundsAsDirty();
	}
	/* (non-Javadoc)
	 * @see com.projectlibre1.pm.criticalpath.HasSentinels#setEndConstraint(long)
	 */
	public void setEndConstraint(long date) {
		finishSentinel.setScheduleConstraint(ConstraintType.FNLT, date);
		markBoundsAsDirty();
	}
	/**
	 * Помечает только сентинелы (start/finish) как требующие пересчёта.
	 * Вызывается после markAllTasksAsNeedingRecalculation, т.к. сентинелы не входят в список задач проекта.
	 * Гарантирует обновление calculationStateCount у finishSentinel и корректный secondBoundary в обратном проходе.
	 * 
	 * КРИТИЧНО: Инвалидирует schedules sentinels, чтобы late dates пересчитывались с нуля.
	 * Без этого late dates накапливаются от предыдущих расчётов и slack становится всё более отрицательным.
	 */
	public void markSentinelsForRecalculation() {
		// ИСПРАВЛЕНИЕ: Инвалидировать schedules ПЕРЕД пометкой для пересчёта
		// Это сбрасывает dependencyDate в NEEDS_CALCULATION, что заставляет
		// backward pass пересчитать late dates с нуля вместо использования старых значений
		startSentinel.invalidateSchedules();
		finishSentinel.invalidateSchedules();
		startSentinel.markTaskAsNeedingRecalculation();
		finishSentinel.markTaskAsNeedingRecalculation();
	}

	public void markBoundsAsDirty() {
		// ИСПРАВЛЕНИЕ: Инвалидировать schedules sentinels для корректного пересчёта late dates
		startSentinel.invalidateSchedules();
		finishSentinel.invalidateSchedules();
		startSentinel.markTaskAsNeedingRecalculation();
		finishSentinel.markTaskAsNeedingRecalculation();

		// mark all tasks without preds or without succs as dirty 
		// the purpose of this is to handle cases where a task that determines the project bounds is deleted.
		
		Iterator i = startSentinel.getSuccessorList().iterator();
		Task task;
		while (i.hasNext()) {
			task = ((Task)((Dependency)i.next()).getTask(false));
			task.invalidateSchedules();
			task.markTaskAsNeedingRecalculation();
		}

		i = finishSentinel.getPredecessorList().iterator();
		while (i.hasNext()) {
			task = ((Task)((Dependency)i.next()).getTask(true));
			task.invalidateSchedules();
			task.markTaskAsNeedingRecalculation();
		}
		
	}
	/**
	 * @return
	 */
	public boolean isForward() {
		return project.isForward();
	}
	
	public void setForward(boolean forward) {
		if (forward) {
			setStartConstraint(project.getStartConstraint());
			finishSentinel.setRawConstraintType(ConstraintType.ASAP);
		}
		else {
			setEndConstraint(project.getEnd());
			startSentinel.setRawConstraintType(ConstraintType.ASAP);
		}
		startSentinel.setForward(forward);
		finishSentinel.setForward(forward);
	}
	/* (non-Javadoc)
	 * @see com.projectlibre1.transaction.MultipleTransaction.Listener#multipleTransaction(com.projectlibre1.transaction.MultipleTransaction)
	 */
	public void multipleTransaction(MultipleTransaction objectEvent) {
		if (objectEvent.isFinalEnd()) {
			suspendUpdates = false;
			if (needsReset)
				reset();
			calculate(true,null);
		} else {
			suspendUpdates = true;
		}
		
	}
	/**
	 * @return
	 */
	public boolean getMarkerStatus() {
		return predecessorTaskList.getMarkerStatus();
	}
	/**
	 * To add a new object such as when pasting
	 */
	public void addObject(Object task) {
		NormalTask newTask  = (NormalTask)task;
		if (newTask.getSuccessorList().isEmpty()) { // if pred has no successors, tell end sentinel about it
			addEndSentinelDependency(newTask);
		} else { // make sure not in sentinel's list
			removeEndSentinelDependency(newTask);
		}
		if (newTask.getPredecessorList().isEmpty()) { // if pred has no successors, tell end sentinel about it
			addStartSentinelDependency(newTask);
		} else { // make sure not in sentinel's list
			removeStartSentinelDependency(newTask);
		}
		
		
		newTask.markTaskAsNeedingRecalculation();
		predecessorTaskList.arrangeTask(newTask);
	}
	
	public void addSubproject(Task subproject) {
		predecessorTaskList.addSubproject(subproject);
	}
	/* (non-Javadoc)
	 * @see com.projectlibre1.pm.criticalpath.SchedulingAlgorithm#getDocument()
	 */
	public Document getMasterDocument() {
		return project;
	}
	
	public void dumpPredecessorList() {
		predecessorTaskList.dump();
	}
	public final long getEarliestStart() {
		return earliestStart;
	}
	public final long getLatestFinish() {
		return latestFinish;
	}
	private boolean isSentinel(Task task) {
		return task == startSentinel || task == finishSentinel;
	}
	public final Project getProject() {
		return project;
	}
	public boolean isCriticalPathJustChanged() {
		return criticalPathJustChanged;
	}
	public CriticalPathFields getFieldUpdater() {
		return fieldUpdater;
	}
	public void setEarliestAndLatest(long earliest, long latest) {
		this.earliestStart = earliest;
		this.latestFinish = latest;
	}
	public int[] findTaskPosition(Task t) { // for debugging
		return predecessorTaskList.findTaskPosition(t);
	}
	
	public static String getTrace() {
		StringBuffer buf = new StringBuffer();
		buf.append(ToStringBuilder.reflectionToString(lastInstance));
		buf.append("\nProject: " +  lastInstance.project + " Task: " + traceTask + " reverse=" + traceTask.isReverseScheduled() + " parent ="+traceTask.isParent());
		return buf.toString();
	}
	
}
