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
    timerExpiry: number,
    timerInterval?: number,
  ) {
    const date = new Date();
    let timerId;
    if (timerInterval) {
      timerId = setInterval(callback, timerInterval, argObject, date);
      Timer.timeMap.set(date, timerId);
      setTimeout(() => clearInterval(timerId), timerExpiry);
    } else {
      setTimeout(() => {
        callback(argObject, date);
      }, timerExpiry);
    }
  }

  public static tryExecute(
    callback: (argObject: any) => boolean,
    argObject: any,
    timerExpiry: number,
    timerInterval: number,
  ) {
    const date = new Date();
    const timerId = setInterval(Timer.execute, timerInterval, callback, argObject, date);
    Timer.timeMap.set(date, timerId);
    setTimeout(() => clearInterval(timerId), timerExpiry);
  }

  private static async execute(callback: (argObject: any) => boolean, argObject: any, date: Date) {
    const res = await callback(argObject);
    if (res) {
      Timer.clearTimer(date);
    }
  }
}
