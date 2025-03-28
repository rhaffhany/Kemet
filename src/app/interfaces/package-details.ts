export interface PackageDetails {
    $id: string
    planId: number
    planName: string
    duration: string
    description: string
    imageURLs: string
    reviews:{
        $id: string,
        $values:any[]
    }
    averageRating: number
    ratingsCount: number
    egyptianAdult: number
    egyptianStudent: number
    touristAdult: number
    touristStudent: number
}
  
// export interface PackageDetails {
//     $id: string
//     $values:[
//         {
//             $id: string
//             planId: number
//             planName: string
//             duration: string
//             description: string
//             imageURLs: string
//             reviews:{
//                 $id: string,
//                 $values:any[]
//             }
//             averageRating: number
//             ratingsCount: number
//             egyptianAdult: number
//             egyptianStudent: number
//             touristAdult: number
//             touristStudent: number
//         }
//     ]
   
// }
  