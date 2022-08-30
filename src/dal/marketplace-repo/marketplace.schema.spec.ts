import { Schema } from "mongoose";
import { Marketplace } from "./marketplace.schema"

describe('test marketplace constructor', () => {
	it("should have undefined api_key_id", () => {
		const mp = new Marketplace();
		expect(mp.api_key_id).toBe(undefined);
	})

	it("should have valid api_key_id", () => {
		const val = "absc123456nd";
		const objId = new Schema.Types.ObjectId(val);
		const mp = new Marketplace(objId);
		expect(mp.api_key_id).toBe(objId);
	})

	it("check if undefined is assignable", () => {
		const mp = new Marketplace();
		mp.can_change_sale_price = undefined;
		expect(mp.can_change_sale_price).toBe(undefined);
	})
})