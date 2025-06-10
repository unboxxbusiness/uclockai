export interface TimezoneOption {
  value: string;
  label: string;
}

export function getTimezones(): TimezoneOption[] {
  try {
    // Intl.supportedValuesOf is widely supported in modern environments
    return Intl.supportedValuesOf('timeZone')
      .map(tz => ({
        value: tz,
        label: tz.replace(/_/g, ' '), // Replace underscores for better readability
      }))
      .sort((a, b) => a.label.localeCompare(b.label)); // Sort alphabetically
  } catch (e) {
    // Fallback for rare cases or older environments
    console.warn("Intl.supportedValuesOf('timeZone') not available, using a limited fallback list of timezones.");
    return [
      { value: 'UTC', label: 'UTC' },
      { value: 'GMT', label: 'GMT' },
      { value: 'America/New_York', label: 'America/New York (EST/EDT)' },
      { value: 'America/Los_Angeles', label: 'America/Los Angeles (PST/PDT)' },
      { value: 'Europe/London', label: 'Europe/London (GMT/BST)' },
      { value: 'Europe/Paris', label: 'Europe/Paris (CET/CEST)' },
      { value: 'Asia/Tokyo', label: 'Asia/Tokyo (JST)' },
      { value: 'Australia/Sydney', label: 'Australia/Sydney (AEST/AEDT)' },
    ].sort((a, b) => a.label.localeCompare(b.label));
  }
}
