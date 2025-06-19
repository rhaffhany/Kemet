export interface PackageDetails {
    $id: string
    planId: number
    planName: string
    duration: string
    description: string
    planLocation: string
    imageURLs: string
    reviews:{
        $id: string,
        $values:any[]
    }
    travelAgencyName: string
    travelAgencyDescription: string
    travelAgencyAddress: string
    averageRating: number
    ratingsCount: number
    egyptianAdult: number
    egyptianStudent: number
    touristAdult: number
    touristStudent: number
    HalfBoardPriceAddittion: number
    fullBoardPriceAddition: number
}
  
  