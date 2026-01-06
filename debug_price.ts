
import { calculateNoboriPrice } from './src/utils/priceCalculator';
import { SIZES, FABRICS } from './src/utils/constants';
import { initialDiscountRules, initialOptions, mappedPriceMatrix, initialSegmentFactors } from './src/utils/masterData';

// Mock Context
const context = {
    sizes: SIZES,
    fabrics: FABRICS,
    options: initialOptions,
    pricingTables: {
        priceMatrix: mappedPriceMatrix,
        segmentFactors: initialSegmentFactors
    },
    discountRules: initialDiscountRules
};

// Test Case 1: Tropical 10x10, Qty 1
const test1 = calculateNoboriPrice({
    size: 'custom',
    customDimensions: { width: 10, height: 10 },
    fabric: 'tropical',
    quantity: 1,
    options: []
}, context);

console.log('Test 1 (Tropical 10x10 Qty 1):', test1.totalPrice, '(Expected 1300)');

// Test Case 2: Tropical 60x180, Qty 1
const test2 = calculateNoboriPrice({
    size: 'standard', // 60x180
    fabric: 'tropical',
    quantity: 1,
    options: []
}, context);

console.log('Test 2 (Tropical 60x180 Qty 1):', test2.totalPrice);

// Test Case 3: Tropical 60x180, Qty 10
const test3 = calculateNoboriPrice({
    size: 'standard',
    fabric: 'tropical',
    quantity: 10,
    options: []
}, context);

console.log('Test 3 (Tropical 60x180 Qty 10 Total):', test3.totalPrice);
console.log('Test 3 Unit Price:', test3.unitPrice);
console.log('Test 3 Discount:', test3.discountRate);

// Test Case 4: Polyester 60x180, Qty 1
const test4 = calculateNoboriPrice({
    size: 'standard',
    fabric: 'polyester',
    quantity: 1,
    options: []
}, context);

console.log('Test 4 (Polyester 60x180 Qty 1):', test4.totalPrice);
