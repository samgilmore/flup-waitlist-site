export function buildAdminSummary(rows = []) {
  return rows.reduce(
    (summary, row) => {
      const referralCount = Number(row?.referral_count) || 0;

      summary.totalSignups += 1;

      if (referralCount >= 5) {
        summary.fivePlusCount += 1;
      }

      if (referralCount >= 10) {
        summary.tenPlusCount += 1;
      }

      return summary;
    },
    {
      totalSignups: 0,
      fivePlusCount: 0,
      tenPlusCount: 0
    }
  );
}
