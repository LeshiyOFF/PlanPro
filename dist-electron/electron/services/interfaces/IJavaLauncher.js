"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProcessState = void 0;
/**
 * Состояния процесса
 */
var ProcessState;
(function (ProcessState) {
    /** Процесс не запущен */
    ProcessState["NOT_STARTED"] = "not_started";
    /** Процесс запускается */
    ProcessState["STARTING"] = "starting";
    /** Процесс работает */
    ProcessState["RUNNING"] = "running";
    /** Процесс остановлен */
    ProcessState["STOPPED"] = "stopped";
    /** Процесс завершился с ошибкой */
    ProcessState["ERROR"] = "error";
    /** Процесс принудительно завершен */
    ProcessState["KILLED"] = "killed";
})(ProcessState || (exports.ProcessState = ProcessState = {}));
//# sourceMappingURL=IJavaLauncher.js.map