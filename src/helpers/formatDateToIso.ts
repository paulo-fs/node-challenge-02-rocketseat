export function formateDateToIso(dateStr: string, timeStr: string) {
   const [day, month, year] = dateStr.split('/')
   const [hours, minutes] = timeStr.split(':')
   const seconds = '00'
   const formattedDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
   const formattedTime = `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}:${seconds}`

   return `${formattedDate} ${formattedTime}`
}
