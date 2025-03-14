import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BehaviorSubject } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class ReviewService {

  constructor(private _HttpClient:HttpClient, private _AuthService:AuthService) {}

  private DeployUrl = 'https://kemet-server.runasp.net';

  addReview(formData:FormData):Observable<any>{
    const token = this._AuthService.getToken();
    if(!token){
      throw new Error("not found")
    }
    const headers = new HttpHeaders({
      Authorization: `Bearer ${localStorage.getItem('token')}`
    });
    return this._HttpClient.post(`${this.DeployUrl}/api/Reviews`, formData , {headers, responseType:'text'} );
  }


  private reviewData = new BehaviorSubject<any[]>([]);
  
  setReviewData(review:any):Observable<any> {
    return this._HttpClient.post(`${this.DeployUrl}/api/Reviews`, review);
  }

  // saving day of submission
  submissionDate: string = '';
  setSubmissionDate(date: string) {
    this.submissionDate = date;
  }
  getSubmissionDate(): string {
    return this.submissionDate;
  }

}
