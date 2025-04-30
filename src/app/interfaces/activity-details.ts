export interface ActivityDetails {
    $id: string
    activityID: number
    name: string
    categoryName: string
    duration: string
    culturalTips: string
    description: string
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
    egyptianAdult: number,
    egyptianStudent : number,
    touristAdult: number,
    touristStudent: number
}