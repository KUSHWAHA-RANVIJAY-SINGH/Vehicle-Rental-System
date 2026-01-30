import { validatePrice, calculateMinPrice } from './utils/pricingUtils.js';

console.log("=== Running Vehicle Pricing Tests ===\n");

// Test Cases
const testCases = [
         // Case 1: Rejection (Price too low) - Bike
         {
                  description: "Bike 150cc - User Price ₹450 (Too Low)",
                  type: 'bike',
                  cc: 150,
                  userPrice: 450
         },
         // Case 2: Acceptance (Price Higher) - Car
         {
                  description: "Car 1000cc - User Price ₹3000 (Allowed)",
                  type: 'car',
                  cc: 1000,
                  userPrice: 3000
         },
         // Case 3: Rejection (Price too low) - Car
         {
                  description: "Car 900cc - User Price ₹2200 (Checking boundary)",
                  type: 'car',
                  cc: 900,
                  userPrice: 2200
         },
         // Case 4: Acceptance (Exact Boundary) - Bike (100cc base)
         {
                  description: "Bike 100cc - User Price ₹400 (Exact Base)",
                  type: 'bike',
                  cc: 100,
                  userPrice: 400
         }
];

testCases.forEach((test, index) => {
         console.log(`Test Case ${index + 1}: ${test.description}`);

         // Calculate expected min price manually for verification
         // 150cc bike: 400 + ceil(50/25)*40 = 400 + 2*40 = 480.
         // 1000cc car: 2000 + ceil(200/25)*100 = 2000 + 8*100 = 2800.
         // 900cc car: 2000 + ceil(100/25)*100 = 2000 + 4*100 = 2400.

         const result = validatePrice(test.userPrice, test.type, test.cc);

         console.log(`Input: ${test.type.toUpperCase()} | ${test.cc}cc | Set Price: ₹${test.userPrice}`);
         console.log(`Min Price Calculated: ₹${result.minPrice}`);
         console.log(`Status: ${result.success ? "✅ ACCEPTED" : "❌ REJECTED"}`);
         if (!result.success) {
                  console.log(`Error: ${result.message}`);
         }
         console.log("--------------------------------------------------\n");
});
