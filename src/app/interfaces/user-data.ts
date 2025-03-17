export interface userData {
    $id: string
    userName: string
    firstName: string
    lastName: string
    dateOfBirth: string
    ssn: string
    gender: string
    nationality: string
    profileImageURL: string
    backgroundImageURL: string
    interestCategoryIds: { 
        $id: string
        $values: number[]
    }
    bio: string
    country: string
    city: string
    websiteLink: string
    creationDate: string
}

  