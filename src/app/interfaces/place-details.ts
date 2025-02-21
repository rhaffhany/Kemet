export interface placeDetails {
    $id: string
    placeId: number
    name: string
    culturalTips: string
    duration: string
    description: string
    categoryName: string
    openTime: string
    closeTime: string
    groupSize: number
    imageURLs:{ 
        $id: string
        $values: string[]
    }
    reviews: {
        $id: string
        $values: any[]
    }
    averageRating: number
    ratingsCount: number
    egyptianAdult: number
    egyptianStudent: number
    touristAdult: number
    touristStudent: number
}
// export interface ImageUrls {
//     $id: string
//     $values: string[]
// }
// export interface Reviews {
//     $id: string
//     $values: any[]
// }