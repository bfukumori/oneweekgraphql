export default function currencyFormatter(
  locale: string,
  currency: string,
  amount: number
) {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
  }).format(amount / 100);
}
