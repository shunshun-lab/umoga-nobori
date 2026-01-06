import { SIZES, FABRICS, PRINT_METHODS, OPTIONS } from './constants';
import type { NoboriSpecs } from '@/types/nobori.types';

export interface ValidationError {
  field: string;
  message: string;
}

/**
 * のぼり仕様をバリデーション
 */
export function validateNoboriSpecs(specs: Partial<NoboriSpecs>): ValidationError[] {
  const errors: ValidationError[] = [];

  // サイズ
  if (!specs.size) {
    errors.push({ field: 'size', message: 'サイズを選択してください' });
  } else if (!(specs.size in SIZES)) {
    errors.push({ field: 'size', message: '無効なサイズです' });
  }

  // 生地
  if (!specs.fabric) {
    errors.push({ field: 'fabric', message: '生地を選択してください' });
  } else if (!(specs.fabric in FABRICS)) {
    errors.push({ field: 'fabric', message: '無効な生地です' });
  }

  // 印刷方法
  if (!specs.printMethod) {
    errors.push({ field: 'printMethod', message: '印刷方法を選択してください' });
  } else if (!(specs.printMethod in PRINT_METHODS)) {
    errors.push({ field: 'printMethod', message: '無効な印刷方法です' });
  }

  // 数量
  if (!specs.quantity) {
    errors.push({ field: 'quantity', message: '数量を入力してください' });
  } else if (specs.quantity < 1) {
    errors.push({ field: 'quantity', message: '数量は1以上を指定してください' });
  } else if (specs.quantity > 10000) {
    errors.push({ field: 'quantity', message: '数量は10000以下を指定してください' });
  }

  // オプション
  if (specs.options) {
    specs.options.forEach(optionId => {
      if (!(optionId in OPTIONS)) {
        errors.push({ field: 'options', message: `無効なオプション: ${optionId}` });
      }
    });
  }

  return errors;
}

/**
 * 仕様が有効かチェック
 */
export function isValidNoboriSpecs(specs: Partial<NoboriSpecs>): specs is NoboriSpecs {
  return validateNoboriSpecs(specs).length === 0;
}
