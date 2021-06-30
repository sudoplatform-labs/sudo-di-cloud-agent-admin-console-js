// This function will take an Aries RFC format date string and
// convert it to a local time string that is compatible
// accross browsers.
export function convertAriesDateToLocal(ariesDateStamp?: string): string {
  return ariesDateStamp
    ? new Date(ariesDateStamp?.replace(/ /, 'T')).toString()
    : 'unknown';
}
