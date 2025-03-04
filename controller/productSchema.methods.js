productSchema.methods.getOriginalProductPrice = function () {
  const materialCost = this.weight * this.perGramPriceAsPerCarat;
  const totalMakingCharge = this.weight * this.making_charges_per_gm;
  return materialCost + totalMakingCharge;
};

+
  /**
   * **Method to calculate selling product price (after discount)**
   * If discount_type is 'percentage', apply % discount on making charge.
   * If discount_type is 'flat', subtract directly from making charge.
   */
  productSchema.methods.getSellingProductPrice = function () {
    const materialCost = this.weight * this.perGramPriceAsPerCarat;
    const totalMakingCharge = this.weight * this.making_charges_per_gm;

    let discountedMakingCharge = totalMakingCharge;

    if (this.discount_type === "percentage") {
      const discountAmount = (totalMakingCharge * this.discount) / 100;
      discountedMakingCharge = totalMakingCharge - discountAmount;
    } else if (this.discount_type === "flat") {
      discountedMakingCharge = totalMakingCharge - this.discount;
    }

    return materialCost + Math.max(discountedMakingCharge, 0); // Ensure price doesn't go negative
  };


  function fun1(weight,makingcharge,makingtype,discount,discounttype,goldRate) {
    let price = weight * goldRate;
    let makingcharges;
    if(makingtype == "percentage") {
      makingcharges = price*makingcharge/100;
    } else {
      makingcharges = makingcharge;
    }
    let discountedMakingCharge;
    if(discounttype == "percentage") {
      discountedMakingCharge = makingcharges - (makingcharges * discount / 100);
    } else {
      discountedMakingCharge = makingcharges - discount;
    }
    let beforeTax = price + discountedMakingCharge;
    // TAX
    let afterTax = beforeTax + price*0.03 + discountedMakingCharge*0.05;
    return afterTax;
  }