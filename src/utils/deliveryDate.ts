/**
 * 納期・営業日計算ユーティリティ
 *
 * 全コンポーネントで共通の営業日計算・日付フォーマットを使う。
 * 将来的に祝日対応や店舗カスタム休業日を追加する場合はここだけ変更すればOK。
 */

const WEEKDAY_NAMES = ['日', '月', '火', '水', '木', '金', '土'] as const;

/** デフォルト納期日数（storeの値がない場合のフォールバック） */
export const DEFAULT_STANDARD_DAYS = 7;
export const DEFAULT_RUSH_DAYS = 3;

/**
 * 指定日が休業日かどうか判定する。
 * 現在は土日のみ。将来ここに祝日判定を追加可能。
 */
export function isHoliday(date: Date): boolean {
  const dow = date.getDay();
  return dow === 0 || dow === 6;
}

/**
 * 起算日から指定営業日数後の日付を返す。
 * 起算日当日は含まない（翌営業日からカウント開始）。
 */
export function addBusinessDays(from: Date, businessDays: number): Date {
  const d = new Date(from);
  let added = 0;
  while (added < businessDays) {
    d.setDate(d.getDate() + 1);
    if (!isHoliday(d)) added++;
  }
  return d;
}

/**
 * 日付を "M/D(曜)" 形式にフォーマットする。
 * 例: "3/14(金)"
 */
export function formatDateWithWeekday(date: Date): string {
  return `${date.getMonth() + 1}/${date.getDate()}(${WEEKDAY_NAMES[date.getDay()]})`;
}

/**
 * 発送予定日の表示テキストを生成する。
 * - desiredShipDate が指定されている場合: "3/14(金)（仮）"
 * - それ以外: 営業日数から算出して "3/14(金) 頃"
 */
export function getShipDateLabel(opts: {
  rushSchedule: boolean;
  desiredShipDate?: string;
  standardDays?: number;
  rushDays?: number;
}): string {
  if (opts.desiredShipDate) {
    const d = new Date(opts.desiredShipDate + 'T00:00:00');
    return `${formatDateWithWeekday(d)}（仮）`;
  }
  const days = opts.rushSchedule
    ? (opts.rushDays ?? DEFAULT_RUSH_DAYS)
    : (opts.standardDays ?? DEFAULT_STANDARD_DAYS);
  const d = addBusinessDays(new Date(), days);
  return `${formatDateWithWeekday(d)} 頃`;
}

/**
 * 通常/特急の発送予定日をまとめて返す。
 */
export function getDeliveryDates(opts?: {
  standardDays?: number;
  rushDays?: number;
}): { normalDate: Date; rushDate: Date } {
  const today = new Date();
  return {
    normalDate: addBusinessDays(today, opts?.standardDays ?? DEFAULT_STANDARD_DAYS),
    rushDate: addBusinessDays(today, opts?.rushDays ?? DEFAULT_RUSH_DAYS),
  };
}
