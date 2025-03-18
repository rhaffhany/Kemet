export interface PackageDetails {
    $id: string
    planId: number
    planName: string
    duration: string
    description: string
    imageURLs: string
    reviews: {
        $id: string
        $values: {
            $id: string
            userId: string
            username: string
            date: string
            reviewTitle: string
            visitorType: string
            userImageURl: string
            comment: string
            rating: number
            imageUrl: string
            activityId: number
            placeId: number
            travelAgencyPlanId: number
            createdAt: string
            id: number
        }
    }
    averageRating: number
    ratingsCount: number
    egyptianAdult: number
    egyptianStudent: number
    touristAdult: number
    touristStudent: number
}
  