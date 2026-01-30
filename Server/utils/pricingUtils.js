/**
 * Vehicle Pricing Utility
 * Manages automatic price calculation and validation based on Engine Capacity (CC).
 */

/**
 * Calculates the minimum allowed baseline price for a vehicle based on its type and engine capacity (CC).
 * 
 * Formulas:
 * Bike: Base ₹400 (first 100cc) + ₹40 per extra 25cc.
 * Car: Base ₹2000 (first 800cc) + ₹100 per extra 25cc.
 * 
 * @param {string} type - Vehicle type ('car' or 'bike')
 * @param {number} cc - Engine capacity in CC
 * @returns {number} - The minimum calculated price
 */
export const calculateMinPrice = (type, cc) => {
         // Normalize inputs
         const vehicleType = type.toLowerCase();
         const engineCC = Number(cc);

         if (isNaN(engineCC) || engineCC <= 0) {
                  throw new Error("Invalid Engine CC provided.");
         }

         let minPrice = 0;

         if (vehicleType === 'bike') {
                  // Base: ₹400 for first 100cc
                  const basePrice = 400;
                  const baseCC = 100;
                  const ratePerExtra25CC = 40;

                  if (engineCC <= baseCC) {
                           minPrice = basePrice;
                  } else {
                           const extraCC = engineCC - baseCC;
                           const extraSlabs = Math.ceil(extraCC / 25);
                           minPrice = basePrice + (extraSlabs * ratePerExtra25CC);
                  }

         } else if (vehicleType === 'car') {
                  // Base: ₹2000 for first 800cc
                  const basePrice = 2000;
                  const baseCC = 800;
                  const ratePerExtra25CC = 100;

                  if (engineCC <= baseCC) {
                           minPrice = basePrice;
                  } else {
                           const extraCC = engineCC - baseCC;
                           const extraSlabs = Math.ceil(extraCC / 25);
                           minPrice = basePrice + (extraSlabs * ratePerExtra25CC);
                  }

         } else {
                  throw new Error("Invalid vehicle type. Must be 'car' or 'bike'.");
         }

         return minPrice;
};

/**
 * Validates a user-provided price against the minimum allowed price.
 * 
 * @param {number} userPrice - The price set by the partner
 * @param {string} type - Vehicle type
 * @param {number} cc - Engine capacity
 * @returns {object} - { success: boolean, message: string, minPrice: number }
 */
export const validatePrice = (userPrice, type, cc) => {
         try {
                  const minPrice = calculateMinPrice(type, cc);
                  const providedPrice = Number(userPrice);

                  if (providedPrice < minPrice) {
                           return {
                                    success: false,
                                    message: `Price cannot be lower than ₹${minPrice} for a ${cc}cc ${type}.`,
                                    minPrice: minPrice
                           };
                  }

                  return {
                           success: true,
                           message: "Price is valid.",
                           minPrice: minPrice
                  };
         } catch (error) {
                  return {
                           success: false,
                           message: error.message,
                           minPrice: 0
                  };
         }
};

export default {
         calculateMinPrice,
         validatePrice
};
