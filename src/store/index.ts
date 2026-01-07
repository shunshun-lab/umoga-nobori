import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { SIZES, FABRICS } from '../utils/constants';
import {
    initialDiscountRules as jsonDiscountRules,
    mappedPriceMatrix as jsonPriceMatrix,
    initialOptions as jsonOptions,
    initialSegmentFactors as jsonSegmentFactors,
    fabricLimits as jsonFabricLimits // Import limits
} from '@/utils/masterData';

// 型定義
export interface SizeConfig {
    id: string;
    name: string;
    displayName: string;
    width: number;
    height: number;
    basePrice: number;
    description: string;
    imageUrl?: string; // Product Image Frame
}

export interface FabricConfig {
    id: string;
    name: string;
    displayName: string;
    multiplier: number;
    description: string;
    features: string[];
}

export interface DetailedPricingMatrix {
    widths_cm: number[];
    heights_cm: number[];
    prices_yen: number[][];
}

export interface PricingMatrix {
    [fabricId: string]: DetailedPricingMatrix;
}

export interface OptionConfig {
    id: string;
    name: string;
    displayName: string;
    price: number;
    displayPrice?: string;
    description: string;
    required: boolean;
    type: 'standard' | 'heat_cut' | 'reinforcement' | 'bagging' | 'other';
    imageUrl?: string;
}

export interface PricingTables {
    priceMatrix: PricingMatrix;
    quantityMultipliers: Record<string, number>;
    segmentFactors: Record<number, number>;
}

import type { NoboriSpecs, PriceBreakdown, ShippingAddress } from '@/types/nobori.types';

export interface CartItem {
    id: string;
    specs: NoboriSpecs;
    price: PriceBreakdown;
    addedAt: number;
    shipping?: {
        addressId?: string; // Reference to stored address
        deliveryMode: 'standard' | 'rush';
    };
}

export interface DiscountRule {
    minQuantity: number;
    rate: number;
    label: string;
}

interface StoreState {
    sizes: Record<string, SizeConfig>;
    fabrics: Record<string, FabricConfig>;
    options: Record<string, OptionConfig>;
    pricingTables: PricingTables;
    fabricLimits: Record<string, { maxWidth: number; maxHeight: number }>; // Limits

    customSizeUnitPrice: number;
    exclusions: Record<string, string[]>;
    inventory: Record<string, number>;
    cart: CartItem[];

    // Shipping Management
    shippingAddresses: Record<string, ShippingAddress>;
    addShippingAddress: (address: ShippingAddress) => void;
    removeShippingAddress: (addressId: string) => void;
    updateCartItemShipping: (itemId: string, shipping: CartItem['shipping']) => void;

    // Visibility Settings (Admin Config)
    optionVisibility: Record<string, boolean>;

    // Actions
    updateBasePrice: (sizeId: string, newPrice: number) => void;
    updateOptionPrice: (optionId: string, newPrice: number) => void;
    toggleExclusion: (optionA: string, optionB: string) => void;
    // New Action
    toggleOptionVisibility: (optionId: string) => void;

    updateInventory: (fabricId: string, count: number) => void;
    updateCustomUnitPrice: (price: number) => void;
    addToCart: (item: Omit<CartItem, 'id' | 'addedAt'>) => void;
    removeFromCart: (id: string) => void;
    clearCart: () => void;
    discountRules: DiscountRule[];
    fetchDiscountRules: (email: string, key: string) => Promise<void>;
    deliverySettings: {
        standardDays: number;
        rushDays: number;
        rushSurchargeRate: number;
    };
    updateDeliverySettings: (settings: Partial<StoreState['deliverySettings']>) => void;

    // Logic Editing
    updateDiscountRule: (index: number, newRule: DiscountRule) => void;
    updateSegmentFactor: (count: number, factor: number) => void;
    updateSizeConfig: (sizeId: string, config: Partial<SizeConfig>) => void;
    resetMasterData: () => void;
}

const initialSizes = Object.entries(SIZES).reduce((acc, [k, v]) => ({ ...acc, [k]: { ...v } }), {});
const initialFabrics = Object.entries(FABRICS).reduce((acc, [k, v]) => ({ ...acc, [k]: { ...v } }), {});
const initialOptionsMerged = { ...jsonOptions };
// Default all options to visible
const initialOptionVisibility = Object.keys(initialOptionsMerged).reduce((acc, key) => ({ ...acc, [key]: true }), {});

const initialExclusions: Record<string, string[]> = {
    'pole_pocket': ['chichi'],
    'chichi': ['pole_pocket'],
};
const initialInventory: Record<string, number> = {
    'polyester': 100,
    'toromatto': 50,
    'twill': 20,
};
const initialDeliverySettings = {
    standardDays: 7,
    rushDays: 3,
    rushSurchargeRate: 0.2,
};

export const useStore = create<StoreState>()(
    persist(
        (set) => ({
            sizes: initialSizes as any,
            fabrics: initialFabrics as any,
            options: initialOptionsMerged as any,
            fabricLimits: jsonFabricLimits, // Exported from masterData

            customSizeUnitPrice: 2000,
            exclusions: initialExclusions,
            inventory: initialInventory,
            cart: [],
            discountRules: jsonDiscountRules,
            pricingTables: {
                priceMatrix: jsonPriceMatrix as unknown as PricingMatrix,
                quantityMultipliers: {},
                segmentFactors: jsonSegmentFactors
            },

            optionVisibility: initialOptionVisibility,

            deliverySettings: initialDeliverySettings,

            // Shipping
            shippingAddresses: {},
            addShippingAddress: (address) => set((state) => ({
                shippingAddresses: { ...state.shippingAddresses, [address.id]: address }
            })),
            removeShippingAddress: (addressId) => set((state) => {
                const { [addressId]: _, ...rest } = state.shippingAddresses;
                return { shippingAddresses: rest };
            }),
            updateCartItemShipping: (itemId, shipping) => set((state) => ({
                cart: state.cart.map(item =>
                    item.id === itemId
                        ? { ...item, shipping }
                        : item
                )
            })),


            updateBasePrice: (sizeId, newPrice) => set((state) => ({
                sizes: { ...state.sizes, [sizeId]: { ...state.sizes[sizeId], basePrice: newPrice } }
            })),

            updateOptionPrice: (optionId, newPrice) => set((state) => ({
                options: { ...state.options, [optionId]: { ...state.options[optionId], price: newPrice } }
            })),

            toggleExclusion: (optionA, optionB) => set((state) => {
                const currentA = state.exclusions[optionA] || [];
                const isExcluded = currentA.includes(optionB);
                if (isExcluded) {
                    return {
                        exclusions: {
                            ...state.exclusions,
                            [optionA]: state.exclusions[optionA].filter(id => id !== optionB),
                            [optionB]: state.exclusions[optionB].filter(id => id !== optionA),
                        }
                    };
                } else {
                    return {
                        exclusions: {
                            ...state.exclusions,
                            [optionA]: [...(state.exclusions[optionA] || []), optionB],
                            [optionB]: [...(state.exclusions[optionB] || []), optionA],
                        }
                    };
                }
            }),

            toggleOptionVisibility: (optionId) => set((state) => ({
                optionVisibility: {
                    ...state.optionVisibility,
                    [optionId]: !state.optionVisibility[optionId]
                }
            })),

            updateInventory: (fabricId, count) => set((state) => ({
                inventory: { ...state.inventory, [fabricId]: count }
            })),

            updateCustomUnitPrice: (price) => set({ customSizeUnitPrice: price }),

            addToCart: (item) => set((state) => ({
                cart: [...state.cart, {
                    ...item,
                    id: Math.random().toString(36).substring(2, 9),
                    addedAt: Date.now(),
                    shipping: { deliveryMode: 'standard' } // Default
                }]
            })),

            removeFromCart: (id) => set((state) => ({
                cart: state.cart.filter(item => item.id !== id)
            })),

            clearCart: () => set({ cart: [] }),

            fetchDiscountRules: async (_email?: string, _key?: string) => {
                console.warn("Sheet Sync is disabled in this mode.");
            },

            updateDeliverySettings: (settings) => set((state) => ({
                deliverySettings: { ...state.deliverySettings, ...settings }
            })),

            updateDiscountRule: (index, newRule) => set((state) => {
                const newRules = [...state.discountRules];
                newRules[index] = newRule;
                return { discountRules: newRules };
            }),

            updateSegmentFactor: (count, factor) => set((state) => ({
                pricingTables: {
                    ...state.pricingTables,
                    segmentFactors: {
                        ...state.pricingTables.segmentFactors,
                        [count]: factor
                    }
                }
            })),

            updateSizeConfig: (sizeId, config) => set((state) => ({
                sizes: { ...state.sizes, [sizeId]: { ...state.sizes[sizeId], ...config } }
            })),

            resetMasterData: () => set({
                discountRules: jsonDiscountRules,
                pricingTables: { // Reset segments but keep other tables potentially (though matrix is static mostly)
                    priceMatrix: jsonPriceMatrix as unknown as PricingMatrix,
                    quantityMultipliers: {},
                    segmentFactors: jsonSegmentFactors
                },
                optionVisibility: initialOptionVisibility
            }),
        }),
        {
            name: 'nobori-store-v1', // Key in localStorage
            partialize: (state) => ({
                // Only persist settings
                sizes: state.sizes,
                options: state.options,
                optionVisibility: state.optionVisibility,
                deliverySettings: state.deliverySettings,
                exclusions: state.exclusions,
                discountRules: state.discountRules,
                pricingTables: state.pricingTables, // Persist segment factors etc
                shippingAddresses: state.shippingAddresses, // Persist Address Book
                // Note: Cart could be persisted too, but keeping it simple.
            }),
        }
    )
);
