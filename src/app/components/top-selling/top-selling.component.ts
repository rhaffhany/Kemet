import { Component } from '@angular/core';

@Component({
  selector: 'app-top-selling',
  templateUrl: './top-selling.component.html',
  styleUrls: ['./top-selling.component.scss']
})
export class TopSellingComponent {
  packages = [
    {
      title: 'Cairo, Luxor & Aswan',
      price: '$5.42k',
      duration: '10 Days Trip',
      image: 'https://s3-alpha-sig.figma.com/img/c981/6537/f6081f9c736d79d134b76444ded76d5e?Expires=1733097600&Key-Pair-Id=APKAQ4GOSFWCVNEHN3O4&Signature=OrVpp1QA5MCDKrsyzf3BGT37rx711LgEtR0AKtUcnnFHyENIkQNgNHqp5LbTvYN-6V2ZuzluKWcuqvzFQz0OWjV16zfQQYEAuoZvmvT1nhwDzEJD1hf3SG4t6nJvXuFW~JI-rpFTVRUy41XrFQN1Swus3RBzQvUFv8HRItpsjRAomOMZYxGCz9meYJy1MXYinawWlJDSPAOJX7rQHu7DJN~rNrB1CQZjQPS8loJEmmWcU7xTn~o9odzmj~PvMGC5WPEm6AkmfJgKKdFI4ePAGYAbwUSPNoaNg1M7K3tQs-DMRTYkpmwpnNG2Wze-cpkw7Cy5ygYlw3xWEsuaogd8Ng__'
    },
    {
      title: 'Islamic Cairo Day Trip',
      price: '$4.2k',
      duration: '12 Days Trip',
      image: 'https://s3-alpha-sig.figma.com/img/c981/6537/f6081f9c736d79d134b76444ded76d5e?Expires=1733097600&Key-Pair-Id=APKAQ4GOSFWCVNEHN3O4&Signature=OrVpp1QA5MCDKrsyzf3BGT37rx711LgEtR0AKtUcnnFHyENIkQNgNHqp5LbTvYN-6V2ZuzluKWcuqvzFQz0OWjV16zfQQYEAuoZvmvT1nhwDzEJD1hf3SG4t6nJvXuFW~JI-rpFTVRUy41XrFQN1Swus3RBzQvUFv8HRItpsjRAomOMZYxGCz9meYJy1MXYinawWlJDSPAOJX7rQHu7DJN~rNrB1CQZjQPS8loJEmmWcU7xTn~o9odzmj~PvMGC5WPEm6AkmfJgKKdFI4ePAGYAbwUSPNoaNg1M7K3tQs-DMRTYkpmwpnNG2Wze-cpkw7Cy5ygYlw3xWEsuaogd8Ng__'
    },
    {
      title: 'Dahab trip',
      price: '$15k',
      duration: '28 Days Trip',
      image: 'https://s3-alpha-sig.figma.com/img/c981/6537/f6081f9c736d79d134b76444ded76d5e?Expires=1733097600&Key-Pair-Id=APKAQ4GOSFWCVNEHN3O4&Signature=OrVpp1QA5MCDKrsyzf3BGT37rx711LgEtR0AKtUcnnFHyENIkQNgNHqp5LbTvYN-6V2ZuzluKWcuqvzFQz0OWjV16zfQQYEAuoZvmvT1nhwDzEJD1hf3SG4t6nJvXuFW~JI-rpFTVRUy41XrFQN1Swus3RBzQvUFv8HRItpsjRAomOMZYxGCz9meYJy1MXYinawWlJDSPAOJX7rQHu7DJN~rNrB1CQZjQPS8loJEmmWcU7xTn~o9odzmj~PvMGC5WPEm6AkmfJgKKdFI4ePAGYAbwUSPNoaNg1M7K3tQs-DMRTYkpmwpnNG2Wze-cpkw7Cy5ygYlw3xWEsuaogd8Ng__'
    }
  ];
}
