import { Schema } from "mongoose";
import { MarketPlace } from "./marketplace.schema"

describe('test marketplace constructor', () => {
	it("should have undefined api_key_id", () => {
		const mp = new MarketPlace();
		expect(mp.api_key_id).toBe(undefined);
	})

	it("should have valid api_key_id", () => {
		const val = "absc123456nd";
		const objId = new Schema.Types.ObjectId(val);
		const mp = new MarketPlace(objId);
		expect(mp.api_key_id).toBe(objId);
	})

	it("check if undefined is assignable", () => {
		const mp = new MarketPlace();
		mp.can_change_sale_price = undefined;
		expect(mp.can_change_sale_price).toBe(undefined);
	})
})