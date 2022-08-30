import { MetaplexError } from "@metaplex-foundation/js";
import { HttpStatus } from "@nestjs/common";
import { SendTransactionError } from "@solana/web3.js";

export class ProgramError extends Error {
	constructor(name: string, errorCode: HttpStatus, message: string, detail?: string, where?: string, params?: {}, stack?: string) {
		super(message);
		this.name = name;
		this.code = errorCode;
		this.message = message;
		this.detail = detail;
		this.where = where;
		this.stack = stack;
		this.params = params;
	}

	public getMessage() {
		const msg = this.message ? this.message : this.detail;
		return msg;
	}

	public log(): string {
		const logStr = JSON.stringify({
			name: this.name,
			code: this.code,
			message: this.message,
			detail: this.detail,
			where: this.where,
			stack: this.stack,
			params: this.params
		});
		console.log(logStr);
		return logStr;
	}

	public getCode(): HttpStatus {
		return this.code
	}

	public name: string;			// this is the error name
	private code: HttpStatus;	// this is the error code 
	private detail?: string;	// this is the detailed message for debugging 
	private where?: string;		// this represents the error location, e.g. filename_functionName()
	public message: string;	// this is the error message that is returned to the user, via api call
	public stack?: string;		// this is the call stack at the time of error
	private params?: {};	// use this to log the function input params to debug the run time scenario
}

export const newProgramError = (name: string, errorCode: HttpStatus, message: string, detail?: string, where?: string, params?: {}, stack?: string): ProgramError => {
	const obj = new ProgramError(name, errorCode, message, detail, where, params, stack);
	return obj
}

export const newProgramErrorFrom = (error: Error, errorName?: string): ProgramError => {
	if (error instanceof MetaplexError) {
		const errMsg = error.message;
		const errDetails = error.title + " " + error.problem + " " + error.solution;
		const errName = error.key
		const obj = new ProgramError(errName, HttpStatus.BAD_REQUEST, errMsg, errDetails, error.source, { logs: error.logs });
		return obj;
	} else if (error instanceof SendTransactionError) {
		return new ProgramError(error.name, HttpStatus.EXPECTATION_FAILED, error.message, "", "", {
			logs: error.logs
		}, error.stack);
	} else {
		let errName: string = "unknown";
		if (errorName !== undefined) {
			errName = errorName;
		}
		return new ProgramError(errName, HttpStatus.EXPECTATION_FAILED, error.message, "", "", {}, error.stack);
	}
}