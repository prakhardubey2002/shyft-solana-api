export class Timer {
  static timeMap = new Map<Date, NodeJS.Timer>();

  public static clearTimer(date: Date) {
    if (Timer.timeMap.has(date)) {
      clearInterval(Timer.timeMap.get(date));
      Timer.timeMap.delete(date);
    }
  }

  public static setTimer(
    callback: (argObject: any, date: Date) => void,
    argObject: any,
    timerInterval: number,
    timerExpiry: number,
  ) {
    const date = new Date();
    const timerId = setInterval(callback, timerInterval, argObject, date);
    Timer.timeMap.set(date, timerId);
    setTimeout(() => clearInterval(timerId), timerExpiry);
  }
}
