function escapeCsvValue(value) {
  const stringValue = String(value ?? "");

  if (/[",\n]/.test(stringValue)) {
    return `"${stringValue.replace(/"/g, "\"\"")}"`;
  }

  return stringValue;
}

export function buildAdminWaitlistCsv(rows = []) {
  const header = [
    "email",
    "first_name",
    "phone_number",
    "referral_count",
    "status",
    "created_at"
  ];

  const body = rows.map((row) =>
    [
      row.email,
      row.first_name,
      row.phone_number,
      row.referral_count,
      row.status,
      row.created_at
    ]
      .map((value) => escapeCsvValue(value))
      .join(",")
  );

  return [header.join(","), ...body].join("\n");
}
