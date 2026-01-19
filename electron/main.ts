import { app } from 'electron';

// Устанавливаем имя приложения для корректных путей в системе (~/.config/planpro)
app.setName('planpro');

import { PlanProApp } from './PlanProApp';

/**
 * Точка входа в Electron-приложение.
 * В соответствии с принципами SOLID (SRP) и Clean Architecture,
 * этот файл только инициализирует основной класс приложения.
 */
const application = new PlanProApp();

export default application;
