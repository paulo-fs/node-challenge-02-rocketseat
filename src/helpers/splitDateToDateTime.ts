export function splitDateToDateTime(dateTime: string) {
   const dateArray = dateTime.split(' ')[0].split('-')
   const resultDate = `${dateArray[2]}/${dateArray[1]}/${dateArray[0]}`

   const time = dateTime.split(' ')[1].slice(0, 5)

   return {
      date: resultDate,
      time
   }
}
